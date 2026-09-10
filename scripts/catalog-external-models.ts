/** Validate published bytes and geometry, then regenerate every derived catalog. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Box3,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {catalogScenes,catalogPlacements as placements,catalogWorldPlacements,sceneLabel} from '../lib/modelCatalogScenes';
import type {CatalogAsset} from '../lib/modelCatalog';

type Usage=Record<string,string|number|null>&{classroom_status:string;target_longest_dimension_m:number|null};
type SourceCatalog={purpose:string;assets:{id:string;usage:Usage}[];collections:{id:string;runtime_integrated:boolean}[]};
type RuntimeAsset=CatalogAsset&{collection:string;usage:Usage};
type GlbDocument={buffers?:{uri?:string}[];images?:{uri?:string}[];textures?:unknown[];materials?:unknown[];skins?:unknown[];animations?:{name:string}[];accessors:{count:number}[];meshes?:{primitives:{mode?:number;indices?:number;attributes:{POSITION:number};material?:number}[]}[]};

const root=new URL('../',import.meta.url);
const read=<T>(p:string):T=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const write=(p:string,value:unknown)=>writeFileSync(new URL(p,root),JSON.stringify(value,null,2)+'\n');
const catalog=read<SourceCatalog>('assets/external/catalog.json');
const assets=read<RuntimeAsset[]>('assets/external/runtime-catalog.json');
if(assets.length!==catalog.assets.length||new Set(assets.map(a=>a.id)).size!==assets.length)throw new Error('Expected one unique derivative per source asset');
for(const asset of assets){
 const original=catalog.assets.find((a)=>a.id===asset.id);if(!original)throw new Error(`Missing original: ${asset.id}`);
 const bytes=readFileSync(new URL(`public${asset.url}`,root));
 if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256||bytes.length!==asset.bytes)throw new Error(`Published bytes changed: ${asset.id}; re-export deliberately`);
 if(bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length||bytes.readUInt32LE(16)!==0x4e4f534a)throw new Error(`Invalid GLB: ${asset.id}`);
 const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString()) as GlbDocument;
 if((doc.buffers??[]).some((b)=>b.uri)||(doc.images??[]).some((i)=>i.uri))throw new Error(`External dependency: ${asset.id}`);
 asset.triangles=(doc.meshes??[]).reduce((sum:number,m)=>sum+m.primitives.reduce((n:number,p)=>{if(p.mode!==undefined&&p.mode!==4)throw new Error('Non-triangle primitive');return n+doc.accessors[p.indices??p.attributes.POSITION].count/3;},0),0);
 asset.materials=(doc.materials??[]).length;asset.skins=(doc.skins??[]).length;asset.clips=(doc.animations??[]).map((a)=>a.name);
 asset.usage=original.usage;asset.classroomStatus=original.usage.classroom_status;
 // Parse geometry and skin data using the production loader, without browser image decoding.
 // Texture/material correctness still requires visual review; no texture validation is implied here.
 delete doc.images;delete doc.textures;delete doc.materials;
 for(const mesh of doc.meshes??[])for(const p of mesh.primitives)delete p.material;
 const json=Buffer.from(JSON.stringify(doc)),padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
 const bin=bytes.subarray(20+bytes.readUInt32LE(12)),header=Buffer.alloc(20);
 header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+padded.length+bin.length,8);header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
 const stripped=Buffer.concat([header,padded,bin]);
 const gltf=await new GLTFLoader().parseAsync(stripped.buffer.slice(stripped.byteOffset,stripped.byteOffset+stripped.byteLength),'');
 if(original.usage.target_longest_dimension_m){
  const bounds=new Box3().setFromObject(gltf.scene,true),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
  if(Math.abs(bounds.min.y)>.003||Math.abs(center.x)>.003||Math.abs(center.z)>.003)throw new Error(`Origin contract: ${asset.id} ${bounds.min.toArray()} ${center.toArray()}`);
  if(size.toArray().some((n,i)=>Math.abs(n-asset.dimensions[i])>.005))throw new Error(`Dimensions differ: ${asset.id} ${size.toArray()} vs ${asset.dimensions}`);
  if(!gltf.scene.getObjectByName('Anchor_Inspect')||!gltf.scene.getObjectByName('Anchor_Label'))throw new Error(`Missing anchors: ${asset.id}`);
 }
}
const liveIds=new Set(placements.map(p=>p.asset));
for(const p of placements){const a=assets.find((a)=>a.id===p.asset);if(!a||a.classroomStatus!=='scene-eligible')throw new Error(`Ineligible placement: ${p.asset}`);}
for(const c of catalog.collections)c.runtime_integrated=assets.some((a)=>a.collection===c.id&&liveIds.has(a.id));
catalog.purpose='Reusable CC0 source library and usage records; published derivatives and scene integration indexed separately in runtime-catalog.json';
write('assets/external/catalog.json',catalog);
write('assets/external/runtime-catalog.json',assets);write('public/models/external/catalog.json',assets);
write('lib/externalAssetIndex.json',assets.map(({id,url,bytes,sha256,dimensions,category,classroomStatus})=>({id,url,bytes,sha256,dimensions,category,classroomStatus})));
write('assets/external/placements.json',placements);
const budgets=catalogScenes.map(({id:setting,label,kind})=>{
 const scene=placements.filter(p=>p.setting===setting),ids=new Set(scene.map(p=>p.asset));
 return{setting,label,kind,placements:scene.length,uniqueAssets:ids.size,bytes:assets.filter((a)=>ids.has(a.id)).reduce((n:number,a)=>n+a.bytes,0)};
});write('assets/external/scene-budgets.json',budgets);
const lines=['# External model usage guide','','Generated from source usage records, measured published GLBs, and the actual placement registry. Regenerate with `node --import tsx scripts/catalog-external-models.ts`.','',`Open /model-catalog in the running application for search, one-at-a-time 3D previews, clip playback and downloads. All ${assets.length} entries have local self-contained GLBs; only reviewed static selections load in lessons.`,'',`The ten lesson worlds use **${new Set(catalogWorldPlacements.map(p=>p.asset)).size} distinct external models** in **${catalogWorldPlacements.length} placements**. Including the three reusable base templates, the catalog indexes **${liveIds.size} models in ${placements.length} placements**. Template-only models are not presented as lesson usage. Character bases/accessories and animation sources remain adaptation references. Scene-eligible means permitted for reviewed placement, not historically authenticated or device-benchmarked.`,'','## Scene payloads','','These are uncompressed GLB transfer bytes for external additions only, deduplicated within each scene. They exclude authored assets, JavaScript, renderer/GPU allocations, catalog metadata and textures after decoding. No FPS claim is implied.','','| Lesson scene / template | Placements | Unique models | Extra GLB bytes |','| --- | ---: | ---: | ---: |',...budgets.map(b=>`| ${b.label} (${b.kind}) | ${b.placements} | ${b.uniqueAssets} | ${b.bytes.toLocaleString()} |`),'','## Integration contract','','- Base placements live in `components/worlds/scene/externalLayout.ts`. Lesson worlds resolve them through `themedSetting.ts`; supported reading details use `themeExternalDetails.ts`. The catalog indexes the final translated placements from the same runtime functions. Only IDs from `lib/externalAssetIndex.json` are accepted. Never turn generated lesson text into a URL.','- Static exports use meters, Y-up, X/Z centered, and a ground origin. Scale defaults to 1; an explicit uniform placement scale also transforms collision bounds. The garden tea table uses 0.5 for a seated height. `Anchor_Inspect` is 65% up the bounds; `Anchor_Label` is above the top. The bounds describe the whole object, not the usable tabletop or hull waterline.','- Use `loadExternalModels(parent, placements)` for lessons. It deduplicates requests, allows three concurrent loads, shares static geometry/materials, and retains a box fallback on failure. Call `dispose()` before traversing the parent for cleanup. Late results are disposed instead of attached.','- `zone` opens the corresponding source station through the existing `onSelect` callback. It does not collect evidence, alter claim text, award points, or replace primary sources. Untagged objects are scenery.','- `solid` adds a conservative rotated ground footprint to generated-setting navigation; `trunkRadius` limits palm blockers to the low trunk region instead of the canopy. Small tabletop objects inherit their supporting furniture blocker. Alexandria uses separate navigation: update that registry when adding ground-level obstacles.','- Authored furniture, buildings, cave, sheep and teaching characters remain in place. External additions supplement them; generic ships/bodies do not replace reviewed period art.','- The public catalog intentionally permits reference previews of all assets; assembly and adaptation statuses are rejected by the classroom loader.','- Skinned references require `SkeletonUtils.clone`, one `AnimationMixer` per instance, and explicit retargeting/rest-pose/root-motion checks. Never use ordinary `Object3D.clone` for independent skeletons.','- The two animation GLBs are unmodified originals. Each contains 43 named clips including a T-pose. No retargeting or classroom animation acceptance is claimed.','- CC0 source links and saved license evidence are in `catalog.json` and `licenses/`. Keep credits and record modifications even though attribution is not a CC0 condition.','','## Item index','',...assets.map((a)=>`- [${a.title} — ${a.id}](#${a.id})`),''];
for(const a of assets){
 const used=placements.filter(p=>p.asset===a.id);
 lines.push(`<a id="${a.id}"></a>`,`## ${a.title}`,'',`**${a.id}** · ${a.category} · **${a.classroomStatus}**`,'',`[Local GLB](../../public${a.url}) · [Publisher / creator: ${a.creator}](${a.sourceUrl}) · [${a.license}](${a.licenseUrl})`,'',`- Retained source: \`${a.sourcePath}\``,`- Transfer: ${a.bytes.toLocaleString()} bytes; ${a.triangles.toLocaleString()} triangles; ${a.materials} materials; ${a.skins} skins.`,`- Dimensions X/Y/Z: ${a.dimensions.join(' / ')} m. ${a.anchors.length?'Static grounded/centered contract applies.':'Source transforms retained; fit and rescale deliberately.'}`,`- Anchors: ${a.anchors.join(', ')||'none added'}.`,'',`**Placement:** ${a.usage.placement}`,'',`**Review:** ${a.usage.cautions}`,'',...['loading','collision','interaction','animation','rights'].flatMap(k=>[`**${k[0].toUpperCase()+k.slice(1)}:** ${a.usage[k]}`,'']),'**Current use:**','',...(used.length?used.map(p=>`- ${sceneLabel(p.setting)} / \`${p.key}\`: position [${p.at.join(', ')}], yaw ${p.turn??0} rad, uniform scale ${p.scale??1}; ${p.zone?'opens '+p.zone:'scenery only'}; ${p.solid?'solid ground footprint'+(p.trunkRadius?' (trunk radius '+p.trunkRadius+' m)':''):p.support?'supported by '+p.support:'existing support/trunk blocker or outside walking route'}.`):['Catalog preview only; no current lesson placement.']), '', '**How to reuse:**','');
 if(a.classroomStatus==='scene-eligible')lines.push('Use `externalLayout.ts` for reusable templates or `themedSetting.ts` / `themeExternalDetails.ts` for a named world. Choose a stable supporting surface and check the walking route. The catalog provides resolved per-scene JSON including external support furniture; do not apply the theme translation a second time. Do not copy the example coordinates blindly.','','```ts',`{ key: 'unique-name', asset: '${a.id}', at: [0, 0, 0], turn: 0 }`,'```','');
 else if(a.classroomStatus==='assembly-or-context-review')lines.push('Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.','');
 else lines.push('Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.','');
 lines.push('**Preparation:**','',...a.modifications.map((m:string)=>'- '+m),'',`**Clips (${a.clips.length}):** ${a.clips.join(', ')||'none'}.`,'',`**SHA-256:** \`${a.sha256}\``,'');
}
writeFileSync(new URL('assets/external/USAGE-GUIDE.md',root),lines.join('\n')+'\n');
console.log(JSON.stringify({validated:assets.length,integrated:liveIds.size,placements:placements.length,budgets},null,2));
