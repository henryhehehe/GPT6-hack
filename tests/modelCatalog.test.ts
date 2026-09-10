import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {verifyCatalog,filterCatalog,catalogPlacements,placementBundle,placementCode,loaderCode} from '../lib/modelCatalog';
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
 for(const setting of ['alexandria','archive','coast','garden']){
  const p=catalogPlacements.find(p=>p.setting===setting)!,code=loaderCode(p);
  const result=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext},reportDiagnostics:true});
  assert.equal(result.diagnostics?.length,0);
  assert.ok(code.includes('dispose: () => art.dispose()'));
  assert.ok(!code.includes('\nart.dispose();'));
  if(setting!=='alexandria')assert.ok(code.includes('placements.filter(p => p.solid).map(placementBounds)'));
 }
});
