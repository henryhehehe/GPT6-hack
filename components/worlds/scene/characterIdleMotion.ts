import * as THREE from 'three';

/** Small additive motion on the existing rig; feet and conversation anchors never move. */
export function createCharacterIdleMotion(model:THREE.Object3D,phase:number){
  const bones:Record<string,THREE.Bone>={};model.traverse(o=>{if(o instanceof THREE.Bone&&(o.name==='Head'||o.name==='Spine'))bones[o.name]=o;});
  const joints=Object.entries(bones).map(([name,bone])=>({name,bone,base:bone.quaternion.clone()}));
  const offset=new THREE.Quaternion(),rotation=new THREE.Euler(0,0,0,'YXZ');let applied=false;
  function restore(){if(!applied)return;joints.forEach(j=>j.bone.quaternion.copy(j.base));applied=false;}
  return {
    // Call before the mixer so additive offsets cannot accumulate on unkeyed bones.
    restore,
    apply(time:number,attentive:boolean,gesturing:boolean){
      restore();if(gesturing)return;
      const t=Number.isFinite(time)?time:0,attention=attentive?.12:1;
      for(const joint of joints){
        joint.base.copy(joint.bone.quaternion);
        if(joint.name==='Head')rotation.set(Math.sin(t*.61+phase)*.016,Math.sin(t*.38+phase)*.075*attention,Math.sin(t*.29+phase)*.012);
        else rotation.set(Math.sin(t*1.15+phase)*.003,0,Math.sin(t*.47+phase)*.009);
        offset.setFromEuler(rotation);joint.bone.quaternion.multiply(offset);
      }
      applied=true;
    },
    dispose:restore,
  };
}
