import index from './externalAssetIndex.json';
import {externalPlacements,type ExternalPlacement,type ExternalSetting} from '@/components/worlds/scene/externalLayout';

export type CatalogAsset={id:string;title:string;creator:string;sourceUrl:string;license:string;licenseUrl:string;url:string;bytes:number;sha256:string;dimensions:number[];triangles:number;materials:number;skins:number;category:string;classroomStatus:string;sourcePath:string;clips:string[];modifications:string[];anchors:string[];usage:Record<string,string|number|null>};
export const catalogSettings:ExternalSetting[]=['alexandria','coast','garden','archive'];
export type CatalogPlacement=ExternalPlacement&{setting:ExternalSetting};
export const catalogPlacements:CatalogPlacement[]=catalogSettings.flatMap(setting=>externalPlacements(setting).map(p=>({...p,setting})));
export const catalogLabel=(text:string)=>text.replaceAll('-',' ').replaceAll('_',' ');
export const catalogSize=(bytes:number)=>bytes>=1000000?`${(bytes/1000000).toFixed(2)} MB`:`${(bytes/1000).toFixed(1)} kB`;
export const readinessLabel=(status:string)=>status==='scene-eligible'?'Ready for scene placement':status==='adaptation-required'?'Needs adaptation':'Needs assembly / context review';

/** Reject stale or partially published metadata before offering integration code. */
export function verifyCatalog(value:unknown):CatalogAsset[]{
 if(!Array.isArray(value)||value.length!==index.length)throw new Error('The catalog does not match this app build.');
 const seen=new Set<string>();
 for(const a of value){
  if(!a||typeof a!=='object')throw new Error('Invalid model record.');
  const expected=index.find(e=>e.id===a.id);
  if(!expected||seen.has(a.id)||a.sha256!==expected.sha256||a.url!==expected.url||a.bytes!==expected.bytes||a.classroomStatus!==expected.classroomStatus||a.category!==expected.category)throw new Error('The model files and app registry are out of sync.');
  if(![a.title,a.category,a.creator,a.sourceUrl,a.license,a.licenseUrl,a.sourcePath].every(v=>typeof v==='string'&&v.length>0)||![a.triangles,a.materials,a.skins].every(n=>Number.isFinite(n)&&n>=0)||!Array.isArray(a.dimensions)||a.dimensions.length!==3||!a.dimensions.every(Number.isFinite)||!a.usage||!Array.isArray(a.clips)||!Array.isArray(a.modifications)||!Array.isArray(a.anchors))throw new Error('A model record is incomplete.');
  seen.add(a.id);
 }
 return value as CatalogAsset[];
}
export type CatalogFilters={search:string;category:string;status:string;setting:string;sort:string};
export function filterCatalog(assets:CatalogAsset[],filters:CatalogFilters){
 const query=filters.search.toLowerCase().trim();
 return assets.filter(a=>(filters.category==='all'||a.category===filters.category)&&(filters.status==='all'||a.classroomStatus===filters.status)&&(filters.setting==='all'||catalogPlacements.some(p=>p.asset===a.id&&p.setting===filters.setting))&&`${a.title} ${a.id} ${a.creator} ${a.category} ${a.usage.placement}`.toLowerCase().includes(query)).sort((a,b)=>filters.sort==='size'?a.bytes-b.bytes:a.title.localeCompare(b.title)||a.creator.localeCompare(b.creator));
}
/** Include an external supporting table/crate so copied tabletop items do not float. */
export function placementBundle(placement:CatalogPlacement):ExternalPlacement[]{
 const result:ExternalPlacement[]=[],seen=new Set<string>();
 function add(p:CatalogPlacement){
  if(seen.has(p.key))return;seen.add(p.key);
  if(p.support){const parent=catalogPlacements.find(a=>a.setting===p.setting&&a.key===p.support);if(!parent)throw new Error(`Missing support ${p.support}`);add(parent);}
  const {setting,support,...entry}=p;void setting;result.push({...entry,...(support?{support}:{})});
 }
 add(placement);return result;
}
export function placementCode(placement:CatalogPlacement){
 return JSON.stringify(placementBundle(placement),null,2);
}
export function loaderCode(placement:CatalogPlacement){
 const generated=placement.setting!=='alexandria';
 return `import type { Object3D } from 'three';
import { loadExternalModels } from '@/components/worlds/scene/externalModels';
import { externalPlacements${generated?', placementBounds':''} } from '@/components/worlds/scene/externalLayout';
${generated?"import { settingPlacements, createSettingNavigation } from '@/components/worlds/scene/settingLayout';\n":''}
// Use in a new scene; existing lessons already attach this art.
export function attachSceneArt(scene: Object3D) {
  const placements = externalPlacements('${placement.setting}');
  const art = loadExternalModels(scene, placements);
${generated?`  const navigation = createSettingNavigation(
    settingPlacements('${placement.setting}'),
    placements.filter(p => p.solid).map(placementBounds),
  );
  // Pass navigation to the existing createExplorer controller.
`:'  // Alexandria uses walkGeometry.ts; register new ground blockers there.\n'}
  return { art, ${generated?'navigation, ':''}dispose: () => art.dispose() };
}

// Keep the existing pickSceneSelection / onSelect interaction hooks.
// Call the returned dispose() inside your scene cleanup, before
// disposing the parent scene. Do not call it immediately after setup.`;
}
