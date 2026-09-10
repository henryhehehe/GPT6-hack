import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generatedSceneIdentity} from '../components/worlds/scene/sceneIdentity';
import {prepareCatalogLesson} from '../lib/curriculum';

test('museum selections and lesson updates preserve the reading world renderer identity',()=>{
 const world=prepareCatalogLesson('austen-letter-01').world!;
 const key=generatedSceneIdentity(world);
 assert.equal(generatedSceneIdentity(structuredClone(world)),key);
 const updated=structuredClone(world);
 updated.museumObjectIds=['met-90487','met-192043'];updated.objective='An updated question for the same reading.';
 updated.nodes[0].activity=.15;updated.nodes[0].title='A new station label';
 updated.evidence[0].text='A revised teaching note.';
 updated.lessonPack!.characters[0].name='A renamed reading companion';
 assert.equal(generatedSceneIdentity(updated),key);
 // Different readings in the same setting should not repeat the same model downloads.
 assert.equal(generatedSceneIdentity(prepareCatalogLesson('austen-letter-02').world!),key);
});
test('a different world or custom setting still rebuilds the scene',()=>{
 const austen=prepareCatalogLesson('austen-letter-01').world!;
 const odyssey=prepareCatalogLesson('odyssey-ix-01').world!;
 assert.notEqual(generatedSceneIdentity(austen),generatedSceneIdentity(odyssey));
 const custom=structuredClone(austen);custom.lessonPack!.curriculum=undefined;
 const before=generatedSceneIdentity(custom);custom.lessonPack!.scene='coast';
 assert.notEqual(generatedSceneIdentity(custom),before);
});
