import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {WORLD_THEMES} from '../lib/worldThemes';
import {SceneCraftProfileSchema,SCENE_CRAFT_PASSES} from '../lib/sceneCraft';
import {SCENE_CRAFT_PROFILES,sceneCraftProfile} from '../lib/sceneCraftProfiles';
import {sceneCraftReport,sceneCraftMarkdown,findSceneCraftProfiles} from '../lib/sceneCraftReport';

test('each authored world resolves current cast assets and implementation paths without loading GLBs',()=>{
 assert.deepEqual(Object.keys(SCENE_CRAFT_PROFILES).sort(),Object.keys(WORLD_THEMES).sort());
 for(const id of Object.keys(WORLD_THEMES)){
  const report=sceneCraftReport(id);assert.equal(report.currentRuntime.cast.length,3);
  assert.ok(report.currentRuntime.castDownloadBytes>0);
  for(const asset of report.currentRuntime.cast){assert.ok(existsSync(new URL(`../public${asset.url}`,import.meta.url)),asset.url);assert.match(asset.sha256,/^[a-f0-9]{64}$/);}
  for(const path of [report.currentRuntime.renderer,report.currentRuntime.characterLoader,...SCENE_CRAFT_PASSES.flatMap(p=>p.reuse)])assert.ok(existsSync(new URL(`../${path}`,import.meta.url)),path);
  assert.equal(report.review.measurements.browserFps,null);assert.ok(report.review.passes.every(p=>p.status==='unreviewed'));
  assert.match(sceneCraftMarkdown(report),/Design targets and current configuration are separate/);
 }
 assert.match(JSON.stringify(sceneCraftReport('alexandria').currentRuntime.lighting),/not THEME_LIGHTING/);
});

test('literary beings require explicit source support and cannot become documented fauna',()=>{
 const profile=sceneCraftProfile('odyssey-ix');
 profile.life.creatures[1].referenceIds=[];assert.equal(SceneCraftProfileSchema.safeParse(profile).success,false);
 profile.life.creatures[1].referenceIds=['missing'];assert.equal(SceneCraftProfileSchema.safeParse(profile).success,false);
 profile.life.creatures[1].referenceIds=['source'];profile.life.creatures[1].basis='documented';assert.equal(SceneCraftProfileSchema.safeParse(profile).success,false);
});

test('unknown contexts fail explicitly and profile edits cannot mutate the registry',()=>{
 assert.throws(()=>sceneCraftReport('unknown'),/No reviewed authoring brief/);
 assert.throws(()=>sceneCraftReport('__proto__'),/No reviewed authoring brief/);
 const profile=sceneCraftProfile('alexandria');profile.context.region='changed';assert.equal(sceneCraftProfile('alexandria').context.region,'Mediterranean Egypt');
 assert.equal(SceneCraftProfileSchema.safeParse({...profile,unexpected:true}).success,false);
});

test('region, wardrobe period and creature filters preserve distinct scene identities',()=>{
 assert.deepEqual(findSceneCraftProfiles({region:'Egypt'}).map(p=>p.worldId),['alexandria']);
 assert.deepEqual(findSceneCraftProfiles({period:'Regency'}).map(p=>p.worldId),['austen-letter']);
 assert.deepEqual(findSceneCraftProfiles({creature:'mythic'}).map(p=>p.worldId),['odyssey-ix']);
 assert.deepEqual(findSceneCraftProfiles({region:'Egypt',creature:'mythic'}),[]);
 assert.equal(new Set(Object.values(SCENE_CRAFT_PROFILES).map(p=>p.direction.signature)).size,Object.keys(WORLD_THEMES).length);
});

test('blank-world template is structurally valid and declares its uncertainty',()=>{
 const template=SceneCraftProfileSchema.parse(JSON.parse(readFileSync(new URL('../docs/scene-craft/TEMPLATE.json',import.meta.url),'utf8')));
 assert.equal(template.space.access,'needs-review');assert.equal(template.life.creatures.length,0);assert.match(template.context.uncertainty,/unverified/i);
});

test('CLI exports parseable briefs and rejects unknown options or worlds',()=>{
 const run=(...args:string[])=>spawnSync(process.execPath,['--import','tsx',new URL('../scripts/scene-brief.ts',import.meta.url).pathname,...args],{encoding:'utf8'});
 const report=run('--world','tempest','--format','json');assert.equal(report.status,0,report.stderr);assert.equal(JSON.parse(report.stdout).brief.worldId,'tempest');
 const review=run('--world','alexandria','--review-template');assert.equal(review.status,0,review.stderr);assert.ok(JSON.parse(review.stdout).passes.every((p:{status:string})=>p.status==='unreviewed'));
 assert.equal(run('--world','unknown').status,1);assert.equal(run('--bogus').status,1);assert.equal(run('--world','alexandria','--region','Egypt').status,1);
});
