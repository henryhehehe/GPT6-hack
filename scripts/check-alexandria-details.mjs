/** node --import tsx scripts/check-alexandria-details.mjs */
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Box3, Group, Matrix4, Mesh, Raycaster, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadAlexandriaDetails } from '../components/worlds/scene/alexandriaDetails.ts';
import { ALEXANDRIA_DETAIL_IDS, ALEXANDRIA_DETAIL_OBSTACLES, ALEXANDRIA_DETAIL_PLACEMENTS } from '../components/worlds/scene/alexandriaDetailLayout.ts';
import { isWalkable, moveWalker, WALK_SPAWNS } from '../components/worlds/scene/walkGeometry.ts';
import { HUMAN_SCALE } from '../components/worlds/scene/humanScale.ts';

const base = new URL('../public/models/alexandria-details/',import.meta.url);
const parse = async file => {
  const bytes = await readFile(new URL(file,base));
  return { bytes, gltf: await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'') };
};
const manifest = JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
assert.deepEqual(manifest.assets.map(a => a.id),[...ALEXANDRIA_DETAIL_IDS]);
assert.deepEqual(new Set(ALEXANDRIA_DETAIL_PLACEMENTS.map(p => p.id)),new Set(ALEXANDRIA_DETAIL_IDS),'Every new asset must have a scene placement');
const rows=[];
for (const asset of manifest.assets) {
  const { bytes, gltf } = await parse(asset.file), root = gltf.scene.getObjectByName(asset.id);
  assert(root,`Missing ${asset.id}`); assert(bytes.length<500_000,'Detail asset exceeds 500 KB budget');
  const box=new Box3().setFromObject(gltf.scene,true), size=box.getSize(new Vector3());
  const [min,max]=asset.blenderBounds, expected=[max[0]-min[0],max[2]-min[2],max[1]-min[1]];
  size.toArray().forEach((v,i) => assert(Number.isFinite(v)&&Math.abs(v-expected[i])<.001));
  let triangles=0, primitives=0;
  gltf.scene.traverse(o => {
    if (!(o instanceof Mesh)) return;
    triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3; primitives++;
    for (const n of o.geometry.attributes.position.array) assert(Number.isFinite(n));
  });
  assert(triangles<10_000); assert(primitives<=6);
  rows.push({ id:asset.id,bytes:bytes.length,triangles,primitives,bounds:{ min:box.min.toArray(),max:box.max.toArray() } });
}
const {bytes,gltf}=await parse('alexandria-details.glb');
const originalLoad=GLTFLoader.prototype.loadAsync, tick=()=>new Promise(resolve=>setImmediate(resolve));
let placedTriangles=0,drawCalls=0;
try {
  GLTFLoader.prototype.loadAsync=async()=>gltf;
  const parent=new Group(), details=loadAlexandriaDetails(parent);
  assert(parent.getObjectByName('AlexandriaDetailFallbacks').visible);
  await tick(); assert(details.ready); assert(!parent.getObjectByName('AlexandriaDetailFallbacks').visible);
  const root=parent.getObjectByName('AlexandriaEverydayDetails');assert(root);
  details.update(1,0,1);
  assert(!root.getObjectByName('fish-tray').visible);assert(root.getObjectByName('rotary-quern').visible);
  details.update(1,1,0);
  assert(root.getObjectByName('fish-tray').visible);assert(!root.getObjectByName('rotary-quern').visible);
  details.update(0,0,0);
  root.traverseVisible(o=>{
    if(!(o instanceof Mesh))return;
    drawCalls++;placedTriangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);
    if(o.isInstancedMesh){for(let i=0;i<o.count;i++){const m=new Matrix4();o.getMatrixAt(i,m);assert(m.elements.every(Number.isFinite));}}
  });
  details.dispose();assert.equal(parent.children.length,0);

  const late=(await parse('alexandria-details.glb')).gltf;let resolve,disposed=0;
  late.scene.traverse(o=>{if(o instanceof Mesh)o.geometry.addEventListener('dispose',()=>disposed++);});
  GLTFLoader.prototype.loadAsync=()=>new Promise(r=>{resolve=r;});
  const deadParent=new Group(),dead=loadAlexandriaDetails(deadParent);dead.dispose();resolve(late);await tick();
  assert(!dead.ready);assert.equal(deadParent.children.length,0);assert(disposed>0);

  GLTFLoader.prototype.loadAsync=async()=>{throw new Error('Simulated missing detail bundle');};
  const warn=console.warn;console.warn=()=>{};
  try {
    const failedParent=new Group(),failed=loadAlexandriaDetails(failedParent);await tick();
    assert(!failed.ready);assert(failedParent.getObjectByName('AlexandriaDetailFallbacks').visible);failed.dispose();
    assert.equal(failedParent.children.length,0);
  } finally {console.warn=warn;}
} finally {GLTFLoader.prototype.loadAsync=originalLoad;}

for(const {bounds:[x0,x1,z0,z1]} of ALEXANDRIA_DETAIL_OBSTACLES) {
  const center={x:(x0+x1)/2,z:(z0+z1)/2};assert(!isWalkable(center),'New solid cluster must block walking');
}
for(const p of Object.values(WALK_SPAWNS))assert(isWalkable(p));
const cross=moveWalker(WALK_SPAWNS.harbor,{x:22,z:0});assert(Math.abs(cross.x-WALK_SPAWNS.market.x)<.01);
// Verify actual exported ground props fit the authored collision clusters.
for(const p of ALEXANDRIA_DETAIL_PLACEMENTS.filter(p=>p.at[1]===1)) {
  const a=rows.find(r=>r.id===p.id),s=p.scale??1;
  const x0=p.at[0]+a.bounds.min[0]*s,x1=p.at[0]+a.bounds.max[0]*s,z0=p.at[2]+a.bounds.min[2]*s,z1=p.at[2]+a.bounds.max[2]*s;
  assert(ALEXANDRIA_DETAIL_OBSTACLES.some(({bounds:[a,b,c,d]})=>x0>=a-.025&&x1<=b+.025&&z0>=c-.025&&z1<=d+.025),`${p.id} extends past collision envelope`);
}
const size=async relative=>(await readFile(new URL(relative,import.meta.url))).length;
// Check the actual GLB support at all four corners, not just an assumed height.
const kitBuffer=await readFile(new URL('../public/models/alexandria/alexandria-kit.glb',import.meta.url));
const kit=await new GLTFLoader().parseAsync(kitBuffer.buffer.slice(kitBuffer.byteOffset,kitBuffer.byteOffset+kitBuffer.length),'');
for(const [id,supportId,at,vertical] of [
  ['scribe-tray','scroll-rack',[-6.5,4,-9.55],1],
  ['pigment-mortar','market-canopy',[21,1,5],HUMAN_SCALE.marketVertical],
  ['folded-linen','market-canopy',[13,1,10],HUMAN_SCALE.marketVertical],
  ['oil-flask-stand','market-canopy',[13,1,5],HUMAN_SCALE.marketVertical],
]) {
  const placement=ALEXANDRIA_DETAIL_PLACEMENTS.find(p=>p.id===id), model=rows.find(r=>r.id===id);
  const support=kit.scene.getObjectByName(supportId).clone(true);
  support.position.set(...at);support.scale.y=vertical;support.updateMatrixWorld(true);
  const scale=placement.scale??1,bottom=placement.at[1]+model.bounds.min[1]*scale;
  for(const x of [model.bounds.min[0],model.bounds.max[0]])for(const z of [model.bounds.min[2],model.bounds.max[2]]) {
    const ray=new Raycaster(new Vector3(placement.at[0]+x*scale,bottom+.025,placement.at[2]+z*scale),new Vector3(0,-1,0),0,.06);
    const hit=ray.intersectObject(support,true)[0];
    assert(hit&&Math.abs(hit.point.y-bottom)<.008,`${id} must rest on its support across its footprint`);
  }
}
const baseKitBytes=await size('../public/models/alexandria/alexandria-kit.glb');
const landmarks=await size('../public/models/library.glb')+await size('../public/models/lighthouse.glb');
let characters=0;for(const name of ['dorian','ione','thaleia'])characters+=await size(`../public/models/characters/${name}.glb`);
const initialModels=baseKitBytes+bytes.length+landmarks;
assert(initialModels+characters<15_000_000,'Keep the full model budget including three authored characters below 15 MB');
const report={models:rows,bundleBytes:bytes.length,uniqueTriangles:rows.reduce((n,r)=>n+r.triangles,0),placedTriangles,drawCalls,
  initialSceneModelBytes:initialModels,withAuthoredCharacterReserveBytes:initialModels+characters,
  checks:[`${rows.length} individual exports and bundle`,'Every model placed','Exact Y-up bounds and finite vertices','500 KB and 10k triangles per detail','Actual footprints fit collisions','New tabletop props supported at all four footprint corners','Independent stock activity','Fallback on download failure','Late-load resource disposal','Connected primary walking route','Total download budget including character reserve'],
  limitation:'Studio render and CPU geometry/integration validation. Browser GPU frame rate was not measured.'};
await writeFile(new URL('../assets/blender/alexandria-details-validation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,models:rows.length},null,2));
