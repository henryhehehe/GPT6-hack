import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import manifest from '../assets/model-manifest.json';
import {WORLD_THEMES} from '../lib/worldThemes';
import {CHARACTER_COSTUMES,characterCostume} from '../lib/characterCostumes';
import type {ZoneId} from '../lib/world';
import {loadThemedCharacters,themedCharacterIds} from '../components/worlds/scene/themedCharacters';
import {pickSceneSelection} from '../components/worlds/scene/scenePicking';
import {disposeModelResources} from '../components/worlds/scene/externalModels';

function anchors(){
  return Object.fromEntries((['harbor','market','library'] as ZoneId[]).map((zone,i)=>{
    const anchor=new THREE.Group();anchor.position.set(i*10,0,0);anchor.rotation.y=.2;
    anchor.userData={npc:zone,label:`Reader ${zone}`};
    anchor.add(new THREE.Mesh(new THREE.BoxGeometry(1,2,1),new THREE.MeshBasicMaterial()));
    const hidden=new THREE.Group();hidden.visible=false;anchor.add(hidden);
    return [zone,anchor];
  })) as Record<ZoneId,THREE.Group>;
}
function fixture(){
  const scene=new THREE.Group(),bone=new THREE.Bone();bone.name='Motion';
  const geometry=new THREE.BoxGeometry(1,2,1).translate(0,1.5,0),count=geometry.attributes.position.count;
  geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(new Uint16Array(count*4),4));
  const weights=new Float32Array(count*4);for(let i=0;i<count;i++)weights[i*4]=1;
  geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
  const texture=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map:texture});
  const mesh=new THREE.SkinnedMesh(geometry,material);mesh.add(bone);mesh.bind(new THREE.Skeleton([bone]));scene.add(mesh);
  const animations=[['Idle',0],['Greeting',1],['Talk',2]].map(([name,value])=>new THREE.AnimationClip(name as string,.3,[new THREE.NumberKeyframeTrack('Motion.position[x]',[0,.3],[Number(value),Number(value)])]));
  const disposed={geometry:0,material:0,texture:0};
  geometry.addEventListener('dispose',()=>disposed.geometry++);material.addEventListener('dispose',()=>disposed.material++);texture.addEventListener('dispose',()=>disposed.texture++);
  return {scene,animations,bone,disposed};
}

test('all ten works have explicit period casts, with no Victorian defaults in earlier settings',()=>{
  const families:Record<string,string>={alexandria:'greek','odyssey-ix':'greek',macbeth:'medieval',tempest:'earlymodern',declaration:'georgian',frankenstein:'georgian','austen-letter':'regency','douglass-literacy':'romantic','christmas-carol':'reader','seneca-falls':'reader'};
  assert.deepEqual(Object.keys(CHARACTER_COSTUMES).sort(),Object.keys(families).sort());
  assert.deepEqual(Object.keys(WORLD_THEMES).sort(),Object.keys(families).sort());
  for(const theme of Object.values(WORLD_THEMES)){
    const costume=characterCostume(theme.id),assigned=themedCharacterIds(theme),ids=Object.values(assigned);
    assert.deepEqual(Object.keys(assigned).sort(),['harbor','library','market']);
    assert.equal(new Set(ids).size,3);
    assert.ok(ids.every(id=>families[theme.id]==='greek'?['dorian','thaleia','ione'].includes(id):id.startsWith(`${families[theme.id]}-`)),`${theme.id} uses its historical wardrobe family`);
    assert.deepEqual(assigned,costume.models);
    assert.notEqual(assigned,costume.models,'callers cannot mutate casting through the returned IDs');
    assigned.harbor='mutated';assert.notEqual(themedCharacterIds(theme).harbor,'mutated');
  }
});

test('costume records expose evidence and distinguish uncertain interpretations from narrated dates',()=>{
  const approvedHosts=new Set(['www.metmuseum.org','collections.readingmuseum.org.uk','www.vam.ac.uk','shakespearedocumented.folger.edu','www.gutenberg.org','www.nps.gov']);
  for(const [id,costume] of Object.entries(CHARACTER_COSTUMES)){
    assert.ok(costume.period.trim().length>0&&costume.interpretation.trim().length>0,`${id} explains its wardrobe`);
    assert.ok(costume.references.length>0,`${id} includes evidence`);
    for(const reference of costume.references){
      const url=new URL(reference.url);assert.equal(url.protocol,'https:');
      assert.ok(approvedHosts.has(url.hostname),`${id} cites a museum, text or historical institution`);
      assert.ok(reference.title.trim().length>0&&url.pathname!=='/');
    }
  }
  assert.match(characterCostume('frankenstein').interpretation,/17—/);
  assert.match(characterCostume('douglass-literacy').period,/1826.*1833/);
  assert.match(characterCostume('odyssey-ix').interpretation,/not a verified Bronze Age reconstruction/);
  assert.match(characterCostume('seneca-falls').interpretation,/1851.*not used/);
});

test('custom worlds and inherited object keys use an explicitly unverified fictional fallback',()=>{
  for(const id of ['custom-work','','constructor','toString','__proto__']){
    const costume=characterCostume(id),theme={...WORLD_THEMES['austen-letter'],id};
    assert.deepEqual(themedCharacterIds(theme),{harbor:'reader-coat',market:'reader-dress',library:'reader-waistcoat'});
    assert.equal(costume.references.length,0);
    assert.match(costume.interpretation,/no historical period has been verified/);
  }
});

test('successful skinned loads normalize height and ground, preserve conversation targets, and restore fallbacks on disposal',async()=>{
  const targets=anchors(),models:ReturnType<typeof fixture>[]=[],urls:string[]=[];
  const initial=targets.harbor.quaternion.clone();
  const pack=loadThemedCharacters(WORLD_THEMES['odyssey-ix'],targets,async url=>{urls.push(url);const model=fixture();models.push(model);return model;});
  assert.deepEqual(await pack.ready,{harbor:'ready',market:'ready',library:'ready'});
  assert.equal(new Set(urls).size,3);assert.ok(urls.every(url=>/^\/models\/characters\/(dorian|thaleia|ione)\.glb\?v=[a-f0-9]{12}$/.test(url)));
  for(const [zone,anchor] of Object.entries(targets)){
    assert.equal(anchor.children[0].visible,false);
    const imported=anchor.children[2],box=new THREE.Box3().setFromObject(imported,true),height=box.max.y-box.min.y;
    assert.ok(height>=1.7&&height<=1.85);assert.ok(Math.abs(box.min.y)<1e-8);
    assert.equal(anchor.userData.label,`Reader ${zone}`);
    anchor.updateMatrixWorld(true);
    const ray=new THREE.Raycaster(new THREE.Vector3(anchor.position.x,1,5),new THREE.Vector3(0,0,-1));
    assert.deepEqual(pickSceneSelection(ray,anchor),{action:'talk',zone});
  }
  pack.update(.1,false,new THREE.Vector3(2,1,0),true);assert.ok(!targets.harbor.quaternion.equals(initial));
  pack.dispose();pack.dispose();
  assert.ok(targets.harbor.quaternion.equals(initial));
  for(const anchor of Object.values(targets)){assert.equal(anchor.children.length,2);assert.equal(anchor.children[0].visible,true);assert.equal(anchor.children[1].visible,false);}
  for(const model of models)assert.deepEqual(model.disposed,{geometry:1,material:1,texture:1});
});

test('network failures and invalid unskinned imports keep the scene usable',async()=>{
  const targets=anchors(),invalid=fixture();invalid.scene.clear();
  const material=new THREE.MeshBasicMaterial(),geometry=new THREE.BoxGeometry();invalid.scene.add(new THREE.Mesh(geometry,material));
  let released=0;geometry.addEventListener('dispose',()=>released++);let request=0;
  const pack=loadThemedCharacters(WORLD_THEMES['odyssey-ix'],targets,async()=>{if(request++===0)throw new Error('offline');return {scene:invalid.scene.clone(),animations:[]};});
  assert.deepEqual(await pack.ready,{harbor:'failed',market:'failed',library:'failed'});
  for(const anchor of Object.values(targets)){assert.equal(anchor.children.length,2);assert.equal(anchor.children[0].visible,true);}
  assert.equal(released,2);pack.dispose();
});

test('late completion is freed once and never reattaches after disposal',async()=>{
  const targets=anchors(),pending:Array<(value:ReturnType<typeof fixture>)=>void>=[];
  const pack=loadThemedCharacters(WORLD_THEMES['odyssey-ix'],targets,()=>new Promise(resolve=>pending.push(resolve)));
  pack.dispose();const models=pending.map(resolve=>{const model=fixture();resolve(model);return model;});
  assert.deepEqual(await pack.ready,{harbor:'disposed',market:'disposed',library:'disposed'});
  for(const model of models)assert.deepEqual(model.disposed,{geometry:1,material:1,texture:1});
  for(const anchor of Object.values(targets))assert.equal(anchor.children.length,2);
});

test('walking approach greets once until departure; talk returns to idle; reduced motion pauses animation and turning',async()=>{
  const targets=anchors(),models:ReturnType<typeof fixture>[]=[];
  const pack=loadThemedCharacters(WORLD_THEMES['odyssey-ix'],targets,async()=>{const model=fixture();models.push(model);return model;});
  await pack.ready;
  const near=new THREE.Vector3(2,1,0),far=new THREE.Vector3(0,1,6),bone=models[0].bone;
  pack.update(.1,false,near,false);assert.equal(bone.position.x,0,'orbit viewing does not greet');
  const originalPosition=targets.harbor.position.clone(),originalTurn=targets.harbor.rotation.y;
  pack.update(.1,true,near,true);pack.talk('harbor');
  assert.equal(bone.position.x,0);assert.equal(targets.harbor.rotation.y,originalTurn);
  pack.update(.1,false,near,true);assert.equal(bone.position.x,1);
  assert.ok(Math.abs(targets.harbor.rotation.y-originalTurn)<=.140001);
  for(let i=0;i<7;i++)pack.update(.1,false,near,true);
  assert.equal(bone.position.x,0,'completed greeting stays idle during same approach');
  pack.talk('harbor');pack.update(.05,false,near,true);assert.equal(bone.position.x,2);
  const pausedPosition=bone.position.clone(),pausedTurn=targets.harbor.rotation.y;
  for(let i=0;i<5;i++)pack.update(.1,true,new THREE.Vector3(-2,1,0),true);
  assert.ok(bone.position.equals(pausedPosition));assert.equal(targets.harbor.rotation.y,pausedTurn);
  for(let i=0;i<6;i++)pack.update(.1,false,near,true);
  assert.equal(bone.position.x,0,'talk returns to idle');
  pack.update(.1,false,far,true);pack.update(.1,false,near,true);assert.equal(bone.position.x,1,'new approach greets again');
  assert.ok(targets.harbor.position.equals(originalPosition));pack.dispose();
});

test('every referenced character GLB has verified bytes, finite geometry and animation, and independent rigs',async()=>{
  const ids=new Set(Object.values(CHARACTER_COSTUMES).flatMap(costume=>Object.values(costume.models)));
  assert.equal(ids.size,21,'five new period families plus the ancient and 1840s casts');
  const loader=new GLTFLoader();
  for(const id of ids){
    const asset=manifest.assets.find(a=>a.id===id);assert.ok(asset,`${id} registered`);
    assert.equal(asset.category,'characters');assert.equal(asset.url,`/models/characters/${id}.glb`);
    const bytes=await readFile(new URL(`../public${asset.url}`,import.meta.url));
    assert.equal(bytes.byteLength,asset.bytes,`${id} declared byte size`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    const data=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
    const gltf=await loader.parseAsync(data,''),duplicate=await loader.parseAsync(data.slice(0),'');
    assert.ok(['Idle','Greeting','Talk'].every(name=>gltf.animations.some(clip=>clip.name===name)),`${id} clips`);
    const skeletons=new Set<THREE.Skeleton>(),bones=new Set<THREE.Bone>();
    gltf.scene.traverse(o=>{
      if(o instanceof THREE.SkinnedMesh){skeletons.add(o.skeleton);o.skeleton.bones.forEach(bone=>bones.add(bone));}
      if(o instanceof THREE.Mesh)for(const [name,attribute] of Object.entries((o.geometry as THREE.BufferGeometry).attributes)){
        const values=attribute.array;
        if(values instanceof Float32Array||values instanceof Float64Array)assert.ok(values.every(Number.isFinite),`${id} finite ${name}`);
      }
    });
    assert.ok(bones.size>0,`${id} skinned`);
    duplicate.scene.traverse(o=>{if(o instanceof THREE.SkinnedMesh){assert.ok(!skeletons.has(o.skeleton),`${id} owns independent skeletons`);assert.ok(o.skeleton.bones.every(bone=>!bones.has(bone)),`${id} owns independent bones`);}});
    const mixer=new THREE.AnimationMixer(gltf.scene);
    for(const clip of gltf.animations){
      assert.ok(Number.isFinite(clip.duration)&&clip.duration>0,`${id}/${clip.name} duration`);
      for(const track of clip.tracks){assert.ok(track.times.every(Number.isFinite));assert.ok(Array.from(track.values).every(value=>typeof value!=='number'||Number.isFinite(value)),`${id}/${clip.name} finite track`);}
      mixer.stopAllAction();mixer.clipAction(clip).reset().play();
      for(const phase of [0,.25,.5,.75,.99]){
        mixer.setTime(clip.duration*phase);gltf.scene.updateMatrixWorld(true);skeletons.forEach(skeleton=>skeleton.update());
        const box=new THREE.Box3().setFromObject(gltf.scene,true);
        assert.ok(!box.isEmpty()&&[...box.min.toArray(),...box.max.toArray()].every(Number.isFinite),`${id}/${clip.name} finite posed bounds at ${phase}`);
      }
    }
    mixer.stopAllAction();mixer.uncacheRoot(gltf.scene);
    const targets=anchors();let request=0;
    const pack=loadThemedCharacters(WORLD_THEMES['odyssey-ix'],targets,async()=>{if(request++===0)return gltf;throw new Error('unused');});
    assert.equal((await pack.ready).harbor,'ready',`${id} passes real normalization`);pack.dispose();
    const duplicateSkeletons=new Set<THREE.Skeleton>();duplicate.scene.traverse(o=>{if(o instanceof THREE.SkinnedMesh)duplicateSkeletons.add(o.skeleton);});
    duplicateSkeletons.forEach(skeleton=>skeleton.dispose());disposeModelResources(duplicate.scene);
  }
});
