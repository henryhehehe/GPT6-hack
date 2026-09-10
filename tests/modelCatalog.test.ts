import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {verifyCatalog,filterCatalog,catalogPlacements,placementBundle,placementCode,loaderCode,catalogScenes,catalogWorldPlacements} from '../lib/modelCatalog';
const source=JSON.parse(readFileSync(new URL('../public/models/external/catalog.json',import.meta.url),'utf8'));
const assets=verifyCatalog(source);
const defaults={search:'',category:'all',status:'all',setting:'all',sort:'name'};

test('public catalog matches the current app registry and rejects partial or stale data',()=>{
 assert.equal(assets.length,69);
 assert.throws(()=>verifyCatalog(source.slice(1)),/does not match/);
 assert.throws(()=>verifyCatalog([...source.slice(1),source[1]]),/out of sync/);
 assert.throws(()=>verifyCatalog(source.map((a:typeof assets[number],i:number)=>i===0?{...a,sha256:'old-file'}:a)),/out of sync/);
});
test('setting, readiness and text filters compose and show genuine empty results',()=>{
 const coast=filterCatalog(assets,{...defaults,setting:'coast',search:'palm'});
 assert.equal(coast.length,2);assert.ok(coast.every(a=>catalogPlacements.some(p=>p.setting==='coast'&&p.asset===a.id)));
 assert.equal(filterCatalog(assets,{...defaults,setting:'garden',status:'adaptation-required'}).length,0);
 const sorted=filterCatalog(assets,{...defaults,sort:'size'});assert.ok(sorted.every((a,i)=>i===0||a.bytes>=sorted[i-1].bytes));
});
test('copyable tabletop JSON includes its scaled supporting furniture in load order',()=>{
 const mug=catalogPlacements.find(p=>p.key==='garden-tea-mug')!;
 const bundle=placementBundle(mug),parsed=JSON.parse(placementCode(mug));
 assert.deepEqual(parsed.map((p:{key:string})=>p.key),['garden-tea-table','garden-tea-mug']);assert.equal(parsed[0].scale,.5);assert.equal(parsed[1].support,'garden-tea-table');assert.equal(bundle.length,2);assert.equal(bundle[0].key,'garden-tea-table');assert.equal(bundle[0].scale,.5);assert.equal(bundle[1].support,bundle[0].key);assert.ok(bundle.every(p=>!('setting' in p)));
});
test('copied examples parse and retain lifecycle cleanup without disposing on attachment',()=>{
 for(const {id:setting} of catalogScenes){
  const p=catalogPlacements.find(p=>p.setting===setting)!,code=loaderCode(p);
  const result=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext},reportDiagnostics:true});
  assert.equal(result.diagnostics?.length,0);
  assert.ok(code.includes('dispose: () => art.dispose()'));
  assert.ok(!code.includes('\nart.dispose();'));
  if(setting!=='alexandria')assert.ok(code.includes('placements.filter(p => p.solid).map(placementBounds)'));
 }
});

test('the catalog reports actual lesson layouts separately from reusable templates',async()=>{
 const {WORLD_THEMES}=await import('../lib/worldThemes');
 const {themedExternalPlacements}=await import('../components/worlds/scene/themedSetting');
 assert.equal(catalogScenes.filter(s=>s.kind==='world').length,10);
 assert.equal(catalogScenes.filter(s=>s.kind==='template').length,3);
 for(const scene of catalogScenes.filter(s=>s.kind==='world'&&s.id!=='alexandria')){
  const actual=themedExternalPlacements(WORLD_THEMES[scene.id]);
  assert.deepEqual(catalogPlacements.filter(p=>p.setting===scene.id).map(({setting,...p})=>p),actual);
 }
 assert.ok(catalogWorldPlacements.every(p=>!['coast','garden','archive'].includes(p.setting)));
 assert.equal(filterCatalog(assets,{...defaults,setting:'odyssey-ix',search:'palm'}).length,0);
 const book=catalogPlacements.find(p=>p.setting==='declaration'&&p.key==='assembly-table-left-book-5')!;
 const bundle=JSON.parse(placementCode(book));assert.equal(bundle[0].key,'assembly-table-left');assert.equal(bundle[0].scale,1.6);assert.equal(bundle[1].support,bundle[0].key);
 const code=loaderCode(book);assert.ok(code.includes("WORLD_THEMES['declaration']"));assert.ok(code.includes('themedExternalPlacements(theme)'));assert.ok(!code.includes("externalPlacements('garden')"));
});
