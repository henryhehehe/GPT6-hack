import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_THEMES} from '../lib/worldThemes';
import {themeLayout} from '../components/worlds/scene/themeLayouts';
import {addThemeLights,themeLighting,THEME_LIGHTING} from '../components/worlds/scene/themeLighting';

test('every prepared world has bounded lighting and unknown IDs use the safe daylight profile',()=>{
  assert.deepEqual(Object.keys(THEME_LIGHTING).sort(),Object.keys(WORLD_THEMES).sort());
  for(const theme of Object.values(WORLD_THEMES)){
    const p=themeLighting(theme.id);
    assert.ok([...p.sun,p.strength,p.fill,p.exposure,p.haze,p.cloud,p.environment,p.bounce,p.lamp].every(Number.isFinite));
    assert.ok(p.exposure>0&&p.exposure<=1&&p.environment>0&&p.environment<=.12,'preserve headroom for pale linen');
    assert.ok(p.bounce>0&&p.bounce<p.strength*.5,'fixed fill must not overpower directional modeling');
    assert.ok(p.cloud>=0&&p.cloud<=1&&p.haze>=0&&p.haze<.01);
  }
  for(const id of ['custom','toString','__proto__'])assert.equal(themeLighting(id),themeLighting('alexandria'));
  assert.ok(themeLighting('frankenstein').strength<themeLighting('austen-letter').strength,'twilight is not daytime key light');
});

test('the single shadow map covers the complete cast in every generated layout',()=>{
  for(const theme of Object.values(WORLD_THEMES).filter(t=>t.id!=='alexandria')){
    const scene=new THREE.Scene(),layout=themeLayout(theme),lights=addThemeLights(scene,theme,layout);
    scene.updateMatrixWorld(true);lights.sun.shadow.updateMatrices(lights.sun);
    const frustum=lights.sun.shadow.getFrustum();
    for(const p of Object.values(layout.spots)){
      // Includes shoes, head, hands and greeting reach around the authored anchor.
      for(const x of [p.x+.55,p.x+2.05])for(const y of [.2,2.4])for(const z of [p.z-.2,p.z+1.2]){
        assert.ok(frustum.containsPoint(new THREE.Vector3(x,y,z)),`${theme.id}: clipped character shadow at ${x},${y},${z}`);
      }
    }
    const shadowed:THREE.Light[]=[];lights.root.traverse(o=>{if(o instanceof THREE.Light&&o.castShadow)shadowed.push(o);});
    assert.deepEqual(shadowed,[lights.sun]);assert.equal(lights.sun.shadow.mapSize.x,2048);
    assert.ok(lights.sun.shadow.normalBias>=.025&&lights.sun.shadow.normalBias<=.04,'balance facial self-shadow noise against detached contact shadows');
    lights.dispose();
  }
});

test('lamp placement stays local to reading furniture and light cleanup preserves scene materials',()=>{
  for(const theme of Object.values(WORLD_THEMES)){
    const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial({color:'#736451',roughness:.82});
    const fixture=new THREE.Mesh(new THREE.BoxGeometry(),material);scene.add(fixture);
    const initialColor=material.color.clone(),layout=themeLayout(theme),lights=addThemeLights(scene,theme,layout);
    const lit=['study','assembly','meeting','street'].includes(layout.kind);
    assert.equal(lights.lamps.length,lit?3:0);
    for(const [i,lamp] of lights.lamps.entries()){
      const p=Object.values(layout.spots)[i];
      assert.ok(lamp.position.distanceTo(new THREE.Vector3(p.x+1.3,1.5,p.z+.5))<lamp.distance);
      assert.equal(lamp.decay,2);assert.equal(lamp.castShadow,false);
    }
    const base=themeLighting(theme.id).lamp;
    for(const time of [0,5,51,1000,NaN,Infinity]){
      lights.update(time,false);
      lights.lamps.forEach(l=>assert.ok(Number.isFinite(l.intensity)&&Math.abs(l.intensity-base)<=base*.0251));
    }
    lights.update(53,true);lights.lamps.forEach(l=>assert.equal(l.intensity,base));
    // Directed atmosphere retains its lamp level through animation frames, and
    // removing the override restores the authored scene's light level.
    lights.update(54,true,14);lights.lamps.forEach(l=>assert.equal(l.intensity,14));
    lights.update(55,false,5);lights.lamps.forEach(l=>assert.ok(Math.abs(l.intensity-5)<=5*.0251));
    lights.update(56,true);lights.lamps.forEach(l=>assert.equal(l.intensity,base));
    const target=new THREE.WebGLRenderTarget(1,1);let disposals=0;target.addEventListener('dispose',()=>disposals++);lights.sun.shadow.map=target;
    lights.dispose();lights.dispose();assert.equal(disposals,1);assert.deepEqual(scene.children,[fixture]);
    assert.ok(material.color.equals(initialColor));assert.equal(material.roughness,.82);
    fixture.geometry.dispose();material.dispose();
  }
});
