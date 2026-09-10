import * as THREE from 'three';

const depths=new WeakMap<THREE.Material,THREE.Material>();
export function applyAlexandriaWindDepth(mesh:THREE.Mesh){const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];const depth=materials.map(m=>depths.get(m)).find(Boolean);if(depth)mesh.customDepthMaterial=depth;}

const declarations=`
uniform float alexandriaTime;
uniform float alexandriaMotion;
uniform float alexandriaKind;
uniform vec3 alexandriaMin;
uniform vec3 alexandriaMax;
`;
const deformation=`
vec3 extent=max(alexandriaMax-alexandriaMin,vec3(0.001));
vec3 uvw=clamp((position-alexandriaMin)/extent,0.0,1.0);
vec4 instanceOrigin=vec4(0.0,0.0,0.0,1.0);
#ifdef USE_INSTANCING
 instanceOrigin=instanceMatrix*instanceOrigin;
#endif
vec3 location=(modelMatrix*instanceOrigin).xyz;
float phase=location.x*0.31+location.z*0.23;
float gust=0.65+0.35*sin(alexandriaTime*0.47+phase);
float ripple=sin(alexandriaTime*1.8+position.x*2.1+position.z*1.4+phase);
if(alexandriaKind<0.5){
 float pinned=sin(uvw.x*3.14159265)*sin(uvw.z*3.14159265);
 transformed.y+=pinned*ripple*gust*0.065*alexandriaMotion;
}else if(alexandriaKind<1.5){
 float pinned=sin(uvw.x*3.14159265)*sin(uvw.y*3.14159265);
 transformed.z+=pinned*ripple*gust*0.11*alexandriaMotion;
}else{
 float reach=length(position.xz)/max(length(extent.xz)*0.5,0.01);
 float tip=clamp(reach*reach,0.0,1.0);
 transformed.x+=tip*ripple*gust*0.075*alexandriaMotion;
 transformed.z+=tip*sin(alexandriaTime*1.3+phase+position.x)*0.045*alexandriaMotion;
}
`;

/** Animate only authored cloth and palm leaf meshes; supports and cargo remain rigid. */
export function addAlexandriaWind(source:THREE.Object3D){
 const time={value:0},motion={value:1};
 const restorations:{mesh:THREE.Mesh;material:THREE.Material|THREE.Material[];depth:THREE.Material|undefined}[]=[];
 const owned:THREE.Material[]=[];
 source.traverse(object=>{
  if(!(object instanceof THREE.Mesh))return;
  const kind=/^market-canopy__(linen|teal)$/.test(object.name)?0:/^merchant-ship__linen$/.test(object.name)?1:/^date-palm__(green|leaflight)$/.test(object.name)?2:-1;
  if(kind<0)return;
  object.geometry.computeBoundingBox();const bounds=object.geometry.boundingBox;if(!bounds)return;
  const uniforms={alexandriaTime:time,alexandriaMotion:motion,alexandriaKind:{value:kind},alexandriaMin:{value:bounds.min.clone()},alexandriaMax:{value:bounds.max.clone()}};
  const attach=(material:THREE.Material)=>{
   material.onBeforeCompile=shader=>{Object.assign(shader.uniforms,uniforms);shader.vertexShader=declarations+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+deformation);};
   material.customProgramCacheKey=()=>`alexandria-wind-${kind}`;owned.push(material);return material;
  };
  restorations.push({mesh:object,material:object.material,depth:object.customDepthMaterial});
  object.material=Array.isArray(object.material)?object.material.map(m=>attach(m.clone())):attach(object.material.clone());
  object.customDepthMaterial=attach(new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide}));
  for(const material of Array.isArray(object.material)?object.material:[object.material])depths.set(material,object.customDepthMaterial);
  // Keep culling valid at the farthest leaf/sail excursion.
  object.geometry.computeBoundingSphere();if(object.geometry.boundingSphere)object.geometry.boundingSphere.radius+=.15;
 });
 let disposed=false;
 return {count:restorations.length,update(elapsed:number,reduced:boolean){if(disposed)return;time.value=Number.isFinite(elapsed)?Math.max(0,elapsed):0;motion.value=reduced?0:1;},dispose(){if(disposed)return;disposed=true;for(const saved of restorations){saved.mesh.material=saved.material;saved.mesh.customDepthMaterial=saved.depth;}owned.forEach(m=>m.dispose());}};
}
