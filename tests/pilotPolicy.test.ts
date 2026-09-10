import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {reserveQuotaSql,quotaLimit} from '../lib/pilotPolicy';
test('pilot quotas fail closed and bound configuration',()=>{for(const x of [undefined,'','-1','1.5','NaN','Infinity'])assert.equal(quotaLimit(x),0);assert.equal(quotaLimit('30'),30);assert.equal(quotaLimit('9000'),100);});
test('reservations cap total calls, retain usage, and isolate classrooms',()=>{
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE pilot_usage (id TEXT PRIMARY KEY, used INTEGER NOT NULL)');const stmt=db.prepare(reserveQuotaSql);
 assert.equal(stmt.get('disabled',0,0),undefined);
 for(let i=1;i<=30;i++)assert.equal(stmt.get('global',30,30)?.used,i);
 for(let i=0;i<20;i++)assert.equal(stmt.get('global',30,30),undefined);
 assert.equal(db.prepare('SELECT used FROM pilot_usage WHERE id=?').get('global')?.used,30);
 for(let i=1;i<=6;i++)assert.equal(stmt.get('class-a',6,6)?.used,i);
 assert.equal(stmt.get('class-a',6,6),undefined);assert.equal(stmt.get('class-b',6,6)?.used,1);db.close();
});
