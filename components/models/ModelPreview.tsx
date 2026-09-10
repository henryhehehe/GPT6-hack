'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {disposeModelResources} from '@/components/worlds/scene/externalModels';
import type {CatalogAsset} from '@/lib/modelCatalog';

export default function ModelPreview({asset}:{asset:CatalogAsset}) {
  const host=useRef<HTMLDivElement>(null),control=useRef<{play:(name:string,playing:boolean)=>void;fit:()=>void;zoom:(factor:number)=>void}|null>(null);
  const [state,setState]=useState('Loading preview…'),[clip,setClip]=useState(asset.clips[0]??''),[playing,setPlaying]=useState(false);
  useEffect(()=>{
    const el=host.current;if(!el)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}
    catch{setState('3D is unavailable on this device. The metadata and GLB download remain available.');return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.01,2000);
    scene.add(new THREE.HemisphereLight('#edf4ff','#716652',3));
    const light=new THREE.DirectionalLight('#fff3df',3);light.position.set(4,8,6);scene.add(light);
    const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;
    let disposed=false,model:THREE.Group|undefined,mixer:THREE.AnimationMixer|undefined,action:THREE.AnimationAction|undefined,frame=0,last=performance.now();
    const resize=new ResizeObserver(()=>{const width=Math.max(1,el.clientWidth),height=Math.max(1,el.clientHeight);renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});resize.observe(el);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    new GLTFLoader().loadAsync(`${asset.url}?v=${asset.sha256.slice(0,12)}`).then(gltf=>{
      if(disposed){disposeModelResources(gltf.scene);return;}
      model=gltf.scene;scene.add(model);
      const fit=()=>{
        model!.updateMatrixWorld(true);
        const bounds=new THREE.Box3().setFromObject(model!,true),center=bounds.getCenter(new THREE.Vector3()),dimensions=bounds.getSize(new THREE.Vector3());
        const extent=Math.max(...dimensions.toArray(),.1),distance=extent*1.9;
        orbit.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(distance*.8,distance*.5,distance));
        camera.near=Math.max(.001,extent/1000);camera.far=extent*100;camera.updateProjectionMatrix();orbit.minDistance=extent*.15;orbit.maxDistance=extent*8;orbit.update();
      };
      fit();
      if(gltf.animations.length)mixer=new THREE.AnimationMixer(model);
      control.current={fit,zoom:factor=>{const offset=camera.position.clone().sub(orbit.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,orbit.minDistance,orbit.maxDistance));camera.position.copy(orbit.target).add(offset);orbit.update();},play:(name,play)=>{
        if(!mixer)return;
        if(action?.getClip().name!==name){mixer.stopAllAction();const selected=THREE.AnimationClip.findByName(gltf.animations,name);if(!selected)return;action=mixer.clipAction(selected).reset().play();}
        action.paused=!play;mixer.update(0);
      }};
      setState('');
    }).catch(()=>{if(!disposed)setState('Preview could not load. Download the GLB or reload this page to retry.');});
    const render=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;mixer?.update(dt);orbit.enableDamping=!reduced.matches;orbit.update();renderer.render(scene,camera);frame=requestAnimationFrame(render);};frame=requestAnimationFrame(render);
    return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();control.current=null;mixer?.stopAllAction();if(model){mixer?.uncacheRoot(model);disposeModelResources(model);}orbit.dispose();renderer.dispose();renderer.domElement.remove();};
  },[asset]);
  function changeClip(name:string){setClip(name);control.current?.play(name,playing);}
  return <section className="model-preview" aria-label={`${asset.title} 3D preview`}>
    <div className="model-viewport" ref={host}/>
    {state&&<p role="status" className="model-preview-state">{state}</p>}
    <div className="model-preview-tools"><button disabled={!!state} onClick={()=>control.current?.fit()}>Fit model</button><button disabled={!!state} aria-label="Zoom in on model" onClick={()=>control.current?.zoom(.8)}>＋</button><button disabled={!!state} aria-label="Zoom out of model" onClick={()=>control.current?.zoom(1.25)}>−</button></div><p className="model-orbit-hint">Drag to orbit · scroll to zoom · right-drag to pan</p>
    {asset.clips.length>0&&<div className="model-animation"><label>Animation <select value={clip} onChange={e=>changeClip(e.target.value)}>{asset.clips.map(name=><option key={name}>{name}</option>)}</select></label><button disabled={!!state} onClick={()=>{control.current?.play(clip,!playing);setPlaying(!playing);}}>{playing?'Pause':'Play'}</button><span>Motion previews run only after you press Play. Root motion may move the figure out of view.</span></div>}
  </section>;
}

