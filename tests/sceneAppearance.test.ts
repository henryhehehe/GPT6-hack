import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialWorld,validateWorld} from '../lib/world';
import {SceneDirectorSchema,applySceneChange} from '../lib/sceneIntervention';
import {SceneAppearanceSchema,defaultSceneAppearance,activeSceneAppearance,appearanceLighting} from '../lib/sceneAppearance';

const appearance={timeOfDay:'sunset',weather:'hazy',water:'choppy',viewpoint:'harbor'} as const;
const patch={intervention:initialWorld.intervention,appearance,nodes:initialWorld.nodes.map(({id,activity,consequence,mechanism})=>({id,activity,consequence,mechanism}))};
test('appearance edits survive storage, preserve lesson evidence, and affect only what-if',()=>{
 const changed=validateWorld(JSON.parse(JSON.stringify(applySceneChange(initialWorld,patch))));
 assert.deepEqual(changed.sceneAppearance,appearance);assert.deepEqual(changed.evidence,initialWorld.evidence);
 assert.deepEqual(changed.nodes,initialWorld.nodes);assert.deepEqual(activeSceneAppearance(changed,false),defaultSceneAppearance);
 assert.deepEqual(activeSceneAppearance(changed,true),appearance);
});
test('appearance schema rejects arbitrary camera coordinates, unknown effects and extra code',()=>{
 for(const bad of [{...appearance,viewpoint:[100,100,100]},{...appearance,weather:'tornado'},{...appearance,code:'execute()'}])assert.equal(SceneAppearanceSchema.safeParse(bad).success,false);
 const legacy={...patch};delete (legacy as {appearance?:unknown}).appearance;
 assert.doesNotThrow(()=>applySceneChange(initialWorld,legacy));
 assert.equal(SceneDirectorSchema.safeParse({title:'test',text:'test',question:'test',zone:'harbor',scene:legacy}).success,false);
});
test('all supported visual profiles stay readable and water conditions drive distinct movement',()=>{
 for(const timeOfDay of ['day','dawn','sunset','night'] as const)for(const weather of ['clear','hazy','overcast'] as const){
  const profile=appearanceLighting({...defaultSceneAppearance,timeOfDay,weather});
  assert.ok(profile.fill>=.6);assert.ok(profile.exposure>=.6&&profile.exposure<=1);assert.ok(profile.haze<=.012);assert.ok(profile.strength>0);
 }
 assert.ok(appearanceLighting({...defaultSceneAppearance,water:'choppy'}).bob>appearanceLighting(defaultSceneAppearance).bob);
 assert.ok(appearanceLighting({...defaultSceneAppearance,water:'choppy'}).distortion>appearanceLighting(defaultSceneAppearance).distortion);
});

test('all reading worlds accept appearance edits while their source, activities and lesson stay fixed',async()=>{
 const {prepareCatalogLesson}=await import('../lib/curriculum');
 const {default:catalog}=await import('../lib/curriculum/catalog.json');
 const {sceneDirectorSchema,AppearanceDirectorSchema}=await import('../lib/sceneIntervention');
 const {generatedSceneIdentity}=await import('../components/worlds/scene/sceneIdentity');
 for(const entry of catalog.worlds){
  if(entry.id==='alexandria')continue;
  const world=prepareCatalogLesson(entry.lessons[0].id).world!;
  const before=structuredClone(world),identity=generatedSceneIdentity(world);
  const changed=applySceneChange(world,{appearance});
  assert.deepEqual(changed,{...before,sceneAppearance:appearance});assert.deepEqual(world,before);
  assert.equal(generatedSceneIdentity(changed),identity);
  assert.equal(sceneDirectorSchema(world),AppearanceDirectorSchema);
  assert.throws(()=>applySceneChange(world,patch),/activities and reading stay fixed/);
  assert.equal(AppearanceDirectorSchema.safeParse({title:'Atmosphere',text:'Illustrative lighting.',question:'What does the text support?',zone:'library',scene:{appearance,nodes:patch.nodes}}).success,false);
 }
});
