import * as THREE from 'three';

/** Clearance reserved around every fixed conversation anchor. Distances are metres. */
export const CHARACTER_ACTIVITY_RADIUS=.48;
const profiles:Record<string,{side:number;forward:number;pace:number;rest:number}>={
  alexandria:{side:.32,forward:.14,pace:3.8,rest:7.4},
  'odyssey-ix':{side:.37,forward:.20,pace:4.1,rest:6.2},
  'austen-letter':{side:.27,forward:.12,pace:4.6,rest:8.2},
  macbeth:{side:.30,forward:.18,pace:4.3,rest:6.8},
  frankenstein:{side:.25,forward:.16,pace:4.8,rest:7.6},
  'christmas-carol':{side:.39,forward:.13,pace:3.7,rest:6.4},
  tempest:{side:.34,forward:.22,pace:4.2,rest:7.1},
  declaration:{side:.25,forward:.12,pace:4.4,rest:8.8},
  'douglass-literacy':{side:.29,forward:.16,pace:4.2,rest:8.1},
  'seneca-falls':{side:.31,forward:.13,pace:4.0,rest:7.8},
};
const smooth=(t:number)=>t*t*(3-2*t);

/** Four alternating, planted half-steps per excursion, with both feet down at each stop. */
export function sampleCharacterActivity(themeId:string,index:number,elapsed:number){
  const profile=Object.prototype.hasOwnProperty.call(profiles,themeId)?profiles[themeId]:profiles['austen-letter'];
  const actor=Math.max(0,Math.min(2,Math.floor(Number.isFinite(index)?index:0)));
  const dx=profile.side*(actor===1?-1:1)*(1-actor*.09),dz=profile.forward*(1+actor*.08);
  const duration=profile.pace+actor*.37,hold=3.1+actor*.73,rest=profile.rest+actor*1.13;
  const clock=Math.max(0,(Number.isFinite(elapsed)?elapsed:0)-(1.3+actor*2.37));
  const t=clock%(duration*2+hold+rest);
  let body=0,left=0,right=0,leftLift=0,rightLift=0,moving=false;
  if(t<duration||t>=duration+hold&&t<duration*2+hold){
    const returning=t>=duration+hold,progress=(returning?t-duration-hold:t)/duration;
    const step=Math.min(3,Math.floor(progress*4)),u=progress*4-step,e=smooth(u),pair=Math.floor(step/2);
    // Every pair advances .5 of the route; the pelvis advances only half as far as its swing foot.
    const stride=.5,advance=(pair+(step%2+e)*.5)*stride;
    const a=(pair+(step%2===0?e:1))*stride,b=(pair+(step%2===0?0:e))*stride;
    body=returning?1-advance:advance;left=returning?1-a:a;right=returning?1-b:b;
    const lift=Math.sin(Math.PI*u)**2*.042;
    if(step%2===0)leftLift=lift;else rightLift=lift;
    moving=true;
  }else if(t<duration+hold){body=left=right=1;}
  // Keep the cast still until its individual initial delay has elapsed.
  const waiting=elapsed<1.3+actor*2.37;
  return {x:waiting?0:dx*body,z:waiting?0:dz*body,
    left:{x:waiting?0:dx*left,z:waiting?0:dz*left,y:waiting?0:leftLift},
    right:{x:waiting?0:dx*right,z:waiting?0:dz*right,y:waiting?0:rightLift},
    moving:!waiting&&moving,look:Math.sin(clock*.47+actor*1.8)*.15};
}

type Joint={bone:THREE.Bone;position:THREE.Vector3;quaternion:THREE.Quaternion};
/** Additive two-bone foot placement. The wrapper moves; the talk anchor stays fixed. */
export function createCharacterActivity(model:THREE.Object3D,mover:THREE.Group,themeId:string,index:number){
  const bones:Record<string,THREE.Bone>={};model.traverse(o=>{if(o instanceof THREE.Bone){bones[o.name]=o;const side=o.name.match(/^(Thigh|Shin|Foot|UpperArm)([LR])$/);if(side)bones[`${side[1]}.${side[2]}`]=o;}});
  const required=['Pelvis','Thigh.L','Shin.L','Foot.L','Thigh.R','Shin.R','Foot.R'];
  const supported=required.every(name=>bones[name]);
  const changed=['Pelvis','Thigh.L','Shin.L','Foot.L','Thigh.R','Shin.R','Foot.R','UpperArm.L','UpperArm.R','Head','Spine'];
  const joints:Joint[]=changed.filter(name=>bones[name]).map(name=>({bone:bones[name],position:bones[name].position.clone(),quaternion:bones[name].quaternion.clone()}));
  const initial=mover.position.clone();if(supported){mover.updateWorldMatrix(true,false);mover.updateMatrixWorld(true);}
  const feet=supported?['L','R'].map(side=>({side,rest:mover.worldToLocal(bones[`Foot.${side}`].getWorldPosition(new THREE.Vector3()))})):[];
  let elapsed=0,applied=false;
  const hip=new THREE.Vector3(),knee=new THREE.Vector3(),foot=new THREE.Vector3(),target=new THREE.Vector3(),direction=new THREE.Vector3(),bend=new THREE.Vector3(),desiredKnee=new THREE.Vector3();
  const from=new THREE.Vector3(),to=new THREE.Vector3(),worldQ=new THREE.Quaternion(),parentQ=new THREE.Quaternion(),deltaQ=new THREE.Quaternion(),footQ=new THREE.Quaternion();
  const euler=new THREE.Euler(),scale=new THREE.Vector3();
  function restore(){if(!applied)return;for(const joint of joints){joint.bone.position.copy(joint.position);joint.bone.quaternion.copy(joint.quaternion);}applied=false;}
  function aim(bone:THREE.Bone,endpoint:THREE.Vector3,desired:THREE.Vector3){
    bone.getWorldPosition(from);to.copy(desired).sub(from).normalize();from.copy(endpoint).sub(bone.getWorldPosition(new THREE.Vector3())).normalize();
    deltaQ.setFromUnitVectors(from,to);bone.getWorldQuaternion(worldQ);worldQ.premultiply(deltaQ);
    if(bone.parent){bone.parent.getWorldQuaternion(parentQ);worldQ.premultiply(parentQ.invert());}
    bone.quaternion.copy(worldQ);bone.updateWorldMatrix(false,true);
  }
  return {supported,restore,
    apply(dt:number,paused:boolean,gesturing:boolean){
      restore();if(!supported)return;
      if(!paused)elapsed+=Number.isFinite(dt)?THREE.MathUtils.clamp(dt,0,.1):0;
      const sample=sampleCharacterActivity(themeId,index,elapsed);
      for(const joint of joints){joint.position.copy(joint.bone.position);joint.quaternion.copy(joint.bone.quaternion);}
      mover.position.set(initial.x+sample.x,initial.y,initial.z+sample.z);
      // A small knee flex supplies reach for a real planted stance instead of stretching the legs.
      bones.Pelvis.getWorldScale(scale);bones.Pelvis.position.y-=.015/Math.max(.01,Math.abs(scale.y));
      mover.updateWorldMatrix(true,false);mover.updateMatrixWorld(true);
      for(const {side,rest} of feet){
        const upper=bones[`Thigh.${side}`],lower=bones[`Shin.${side}`],ankle=bones[`Foot.${side}`],step=side==='L'?sample.left:sample.right;
        upper.getWorldPosition(hip);lower.getWorldPosition(knee);ankle.getWorldPosition(foot);ankle.getWorldQuaternion(footQ);
        const upperLength=hip.distanceTo(knee),lowerLength=knee.distanceTo(foot);
        target.copy(rest).add(new THREE.Vector3(step.x-sample.x,step.y,step.z-sample.z));mover.localToWorld(target);
        direction.copy(target).sub(hip);const distance=THREE.MathUtils.clamp(direction.length(),.001,upperLength+lowerLength-.00001);direction.normalize();
        bend.set(0,0,-1).transformDirection(mover.matrixWorld);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
        const along=(upperLength*upperLength-lowerLength*lowerLength+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,upperLength*upperLength-along*along));
        desiredKnee.copy(hip).addScaledVector(direction,along).addScaledVector(bend,height);
        aim(upper,knee,desiredKnee);ankle.getWorldPosition(foot);aim(lower,foot,target);
        lower.getWorldQuaternion(parentQ);ankle.quaternion.copy(parentQ.invert().multiply(footQ));ankle.updateWorldMatrix(false,true);
      }
      if(!gesturing&&!paused){
        const swing=(sample.left.y-sample.right.y)*1.2;
        for(const side of ['L','R']){const arm=bones[`UpperArm.${side}`];if(arm)arm.quaternion.multiply(deltaQ.setFromEuler(euler.set((side==='L'?1:-1)*swing,0,0)));}
        if(bones.Head)bones.Head.quaternion.multiply(deltaQ.setFromEuler(euler.set(0,sample.look,0)));
        if(bones.Spine)bones.Spine.quaternion.multiply(deltaQ.setFromEuler(euler.set(0,sample.look*.22,0)));
      }
      applied=true;
    },
    dispose(){restore();mover.position.copy(initial);},
  };
}
