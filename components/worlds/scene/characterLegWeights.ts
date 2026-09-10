import * as THREE from 'three';
import {CHARACTER_COSTUMES} from '@/lib/characterCostumes';

const authoredIds=new Set(Object.values(CHARACTER_COSTUMES).flatMap(cast=>Object.values(cast.models)));

/** Repair the original single-Shin hose/trouser tubes before their first animation.
 * Bind matrices, rather than current bone positions, keep this independent of load pose.
 * Already blended skin, footwear, clothing on other bones, and imported heads are untouched.
 */
export function correctAuthoredLegWeights(model:THREE.Object3D,assetId:string){
  if(!authoredIds.has(assetId))return 0;
  let corrected=0;
  const vertex=new THREE.Vector3(),bind=new THREE.Matrix4();
  model.traverse(object=>{
    if(!(object instanceof THREE.SkinnedMesh)||!object.name.startsWith(`${assetId}__Visual_`))return;
    const mesh=object,geometry=mesh.geometry,position=geometry.getAttribute('position'),originalIndex=geometry.getAttribute('skinIndex'),originalWeight=geometry.getAttribute('skinWeight');
    if(!position||!originalIndex||!originalWeight||originalIndex.itemSize!==4||originalWeight.itemSize!==4)return;
    const legs=mesh.skeleton.bones.flatMap((bone,index)=>{
      const side=bone.name.match(/^Shin\.?([LR])$/)?.[1];if(!side)return [];
      const thigh=mesh.skeleton.bones.findIndex(candidate=>candidate===bone.parent&&new RegExp(`^Thigh\\.?${side}$`).test(candidate.name));
      if(thigh<0||!mesh.skeleton.boneInverses[index]||!mesh.skeleton.boneInverses[thigh])return [];
      const knee=new THREE.Vector3().setFromMatrixPosition(bind.copy(mesh.skeleton.boneInverses[index]).invert());
      const hip=new THREE.Vector3().setFromMatrixPosition(bind.copy(mesh.skeleton.boneInverses[thigh]).invert());
      const axis=hip.sub(knee),length=axis.length();if(!Number.isFinite(length)||length<.01)return [];
      return [{shin:index,thigh,knee,axis:axis.normalize(),band:length*.2}];
    });
    if(!legs.length)return;
    // Independent attributes preserve every UV, normal, vertex colour, material, and triangle.
    let changed:{indices:THREE.BufferAttribute|THREE.InterleavedBufferAttribute;weights:THREE.BufferAttribute|THREE.InterleavedBufferAttribute}|undefined;
    for(let i=0;i<position.count;i++){
      const values=[originalWeight.getX(i),originalWeight.getY(i),originalWeight.getZ(i),originalWeight.getW(i)];
      const slot=values.findIndex(weight=>Math.abs(weight-1)<1e-6);
      if(slot<0||values.some((weight,j)=>j!==slot&&Math.abs(weight)>1e-6))continue;
      const boneIndex=originalIndex.getComponent(i,slot),leg=legs.find(candidate=>candidate.shin===boneIndex);if(!leg)continue;
      vertex.fromBufferAttribute(position,i).applyMatrix4(mesh.bindMatrix).sub(leg.knee);
      const t=THREE.MathUtils.clamp((vertex.dot(leg.axis)+leg.band)/(leg.band*2),0,1),upper=t*t*(3-2*t);
      if(upper<=0)continue;
      changed??={indices:originalIndex.clone(),weights:originalWeight.clone()};
      changed.indices.setXYZW(i,leg.thigh,leg.shin,0,0);changed.weights.setXYZW(i,upper,1-upper,0,0);corrected++;
    }
    if(changed){geometry.setAttribute('skinIndex',changed.indices);geometry.setAttribute('skinWeight',changed.weights);changed.indices.needsUpdate=true;changed.weights.needsUpdate=true;}
  });
  return corrected;
}
