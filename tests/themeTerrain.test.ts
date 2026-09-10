import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES} from '../lib/worldThemes';
import {createDistantTerrain} from '../components/worlds/scene/themeTerrain';

test('distant ridgelines have finite upward-facing geometry outside all walking routes',()=>{
  const signatures=new Set<string>();
  for(const theme of Object.values(WORLD_THEMES)){
    const mesh=createDistantTerrain(theme);
    if(!['shore','highlands'].includes(theme.landscape)){assert.equal(mesh,null);continue;}
    assert.ok(mesh);const p=mesh.geometry.getAttribute('position'),n=mesh.geometry.getAttribute('normal');
    assert.ok(p.count<6000);assert.ok(mesh.geometry.index!.count/3<11000);
    const heights=new Set<number>();
    for(let i=0;i<p.count;i++){
      assert.ok([p.getX(i),p.getY(i),p.getZ(i),n.getY(i)].every(Number.isFinite));
      assert.ok(Math.hypot(p.getX(i),p.getZ(i))>42.9,'must not introduce untracked walk obstacles');
      assert.ok(n.getY(i)>0,'top surface must face the sky');heights.add(Math.round(p.getY(i)*10));
    }
    assert.ok(heights.size>60,'irregular relief instead of identical round hills');
    const same=createDistantTerrain(theme)!;assert.deepEqual(p.array,same.geometry.getAttribute('position').array);
    signatures.add(Array.from(p.array).slice(1500,1800).join(','));
    mesh.geometry.dispose();mesh.material.dispose();same.geometry.dispose();same.material.dispose();
  }
  assert.equal(signatures.size,4);
});
