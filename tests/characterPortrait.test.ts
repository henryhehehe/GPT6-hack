import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {initialWorld} from '../lib/world';
import {portraitInput,portraitFingerprint,claimPortraitSql,finishPortraitSql} from '../lib/characterPortrait';

test('portraits retain source identity across hypothetical changes and invalidate when source changes',async()=>{
 const world=structuredClone(initialWorld),original=await portraitFingerprint(world,'harbor');
 world.intervention='FAKE EVENT';world.nodes.forEach(n=>n.consequence='FAKE OUTCOME');world.evidence.push({id:'fake',zone:'harbor',kind:'teaching-prop',title:'Fake',text:'INVENTED APPEARANCE',source:'Invented'});
 assert.equal(await portraitFingerprint(world,'harbor'),original);assert.ok(!JSON.stringify(portraitInput(world,'harbor')).includes('INVENTED APPEARANCE'));
 world.evidence.find(e=>e.kind==='source')!.text+=' New source description.';
 assert.notEqual(await portraitFingerprint(world,'harbor'),original);
 assert.notEqual(await portraitFingerprint(initialWorld,'market'),original);
});
test('portrait lease deduplicates concurrent requests, expires safely, and never overwrites ready images',()=>{
 const db=new DatabaseSync(':memory:');
 for(const file of ['0000_common_dreadnoughts.sql','0001_fearless_whiplash.sql'])db.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 // Load the production migration, so the state machine is tested against its deployed schema.
 const migration=readFileSync(new URL('../drizzle/0002_zippy_warhawk.sql',import.meta.url),'utf8');db.exec(migration);
 db.prepare('INSERT INTO classrooms (id,teacher_token,invite_token,world,state,lesson,created_at) VALUES (?,?,?,?,?,?,?)').run('class','teacher','invite','{}','{}','lesson','now');
 const claim=db.prepare(claimPortraitSql),finish=db.prepare(finishPortraitSql);
 assert.equal(claim.run('asset','class','first',1000,0).changes,1);
 assert.equal(claim.run('asset','class','second',1100,0).changes,0);
 assert.equal(claim.run('asset','class','replacement',400000,100000).changes,1);
 assert.equal(finish.run('old.png','old','model',400100,'asset','first').changes,0);
 assert.equal(finish.run('portrait.png','response','model',400200,'asset','replacement').changes,1);
 assert.equal(claim.run('asset','class','third',900000,600000).changes,0);
 assert.equal(db.prepare('SELECT blob_key FROM character_portraits WHERE id=?').get('asset')!.blob_key,'portrait.png');db.close();
});
