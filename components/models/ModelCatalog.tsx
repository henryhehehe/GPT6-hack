'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {disposeModelResources} from '@/components/worlds/scene/externalModels';
import {externalPlacements,type ExternalSetting} from '@/components/worlds/scene/externalLayout';
import './model-catalog.css';

type Asset={id:string;title:string;creator:string;sourceUrl:string;license:string;licenseUrl:string;url:string;bytes:number;sha256:string;dimensions:number[];triangles:number;materials:number;skins:number;category:string;classroomStatus:string;sourcePath:string;clips:string[];modifications:string[];anchors:string[];usage:Record<string,string|number|null>};
const settings:ExternalSetting[]=['alexandria','coast','garden','archive'];
const placements=settings.flatMap(setting=>externalPlacements(setting).map(p=>({...p,setting})));
const label=(text:string)=>text.replaceAll('-',' ').replaceAll('_',' ');
const size=(bytes:number)=>bytes>=1000000?`${(bytes/1000000).toFixed(2)} MB`:`${(bytes/1000).toFixed(1)} kB`;
const statusLabel=(status:string)=>status==='scene-eligible'?'Scene eligible':status==='adaptation-required'?'Adaptation required':'Assembly / context review';

function ModelPreview({asset}:{asset:Asset}) {
  const host=useRef<HTMLDivElement>(null),control=useRef<{play:(name:string,playing:boolean)=>void}|null>(null);
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
    let disposed=false,model:THREE.Group|undefined,mixer:THREE.AnimationMixer|undefined,frame=0,last=performance.now();
    const resize=new ResizeObserver(()=>{const width=Math.max(1,el.clientWidth),height=Math.max(1,el.clientHeight);renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});resize.observe(el);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    new GLTFLoader().loadAsync(`${asset.url}?v=${asset.sha256.slice(0,12)}`).then(gltf=>{
      if(disposed){disposeModelResources(gltf.scene);return;}
      model=gltf.scene;scene.add(model);
      const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),dimensions=bounds.getSize(new THREE.Vector3());
      const extent=Math.max(...dimensions.toArray(),.1),distance=extent*1.9;
      orbit.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(distance*.8,distance*.5,distance));
      camera.near=Math.max(.001,extent/1000);camera.far=extent*100;camera.updateProjectionMatrix();orbit.minDistance=extent*.15;orbit.maxDistance=extent*8;
      if(gltf.animations.length)mixer=new THREE.AnimationMixer(model);
      control.current={play:(name,play)=>{if(!mixer)return;mixer.stopAllAction();const selected=THREE.AnimationClip.findByName(gltf.animations,name);if(selected){const action=mixer.clipAction(selected);action.reset().play();action.paused=!play;mixer.update(0);}}};
      setState('');
    }).catch(()=>{if(!disposed)setState('Preview could not load. Download the GLB or reload this page to retry.');});
    const render=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;mixer?.update(dt);orbit.enableDamping=!reduced.matches;orbit.update();renderer.render(scene,camera);frame=requestAnimationFrame(render);};frame=requestAnimationFrame(render);
    return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();control.current=null;mixer?.stopAllAction();if(model){mixer?.uncacheRoot(model);disposeModelResources(model);}orbit.dispose();renderer.dispose();renderer.domElement.remove();};
  },[asset]);
  function changeClip(name:string){setClip(name);control.current?.play(name,playing);}
  return <section className="model-preview" aria-label={`${asset.title} 3D preview`}>
    <div className="model-viewport" ref={host}/>
    {state&&<p role="status" className="model-preview-state">{state}</p>}
    <p className="model-orbit-hint">Drag to orbit · scroll to zoom · right-drag to pan</p>
    {asset.clips.length>0&&<div className="model-animation"><label>Animation <select value={clip} onChange={e=>changeClip(e.target.value)}>{asset.clips.map(name=><option key={name}>{name}</option>)}</select></label><button disabled={!!state} onClick={()=>{control.current?.play(clip,!playing);setPlaying(!playing);}}>{playing?'Pause':'Play'}</button><span>Motion previews run only after you press Play. Root motion may move the figure out of view.</span></div>}
  </section>;
}

export default function ModelCatalog(){
  const [assets,setAssets]=useState<Asset[]>([]),[error,setError]=useState(''),[search,setSearch]=useState(''),[category,setCategory]=useState('all'),[status,setStatus]=useState('all'),[selected,setSelected]=useState('quaternius-fantasy-props-vase-2');
  useEffect(()=>{const abort=new AbortController();fetch('/models/external/catalog.json',{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('Catalog unavailable');return r.json();}).then(data=>{if(!Array.isArray(data))throw new Error("Invalid catalog");setAssets(data as Asset[]);}).catch(e=>{if(e.name!=='AbortError')setError('The catalog could not load. Reload this page to retry.');});return()=>abort.abort();},[]);
  const filtered=useMemo(()=>assets.filter(a=>(category==='all'||a.category===category)&&(status==='all'||a.classroomStatus===status)&&`${a.title} ${a.id} ${a.creator} ${a.usage.placement}`.toLowerCase().includes(search.toLowerCase())),[assets,search,category,status]);
  const asset=assets.find(a=>a.id===selected)??assets[0],used=asset?placements.filter(p=>p.asset===asset.id):[];
  return <main className="model-catalog">
    <header className="model-catalog-header"><a href="/studio">← Teacher studio</a><span className="model-kicker">COUNTERFACTUAL WORLDS · ASSET LIBRARY</span><h1>Model catalog</h1><p>69 local CC0 models, with provenance, measured files and guidance for reuse. This is a development reference; scene art does not establish historical facts.</p><div className="model-stats"><span><b>{assets.length||69}</b> catalog entries</span><span><b>{new Set(placements.map(p=>p.asset)).size}</b> models used in scenes</span><span><b>{placements.length}</b> placements across 4 settings</span></div></header>
    {error&&<p role="alert">{error}</p>}
    <div className="model-catalog-body">
      <aside className="model-library"><label htmlFor="model-search">Find an asset</label><input id="model-search" type="search" placeholder="Scroll, basket, creator…" value={search} onChange={e=>setSearch(e.target.value)}/><div className="model-filters"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{[...new Set(assets.map(a=>a.category))].sort().map(c=><option key={c} value={c}>{label(c)}</option>)}</select></label><label>Readiness<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option>{[...new Set(assets.map(a=>a.classroomStatus))].sort().map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></label></div><p aria-live="polite">{filtered.length} matching items</p><div className="model-list">{filtered.map(a=><button className={a.id===asset?.id?'selected':''} aria-pressed={a.id===asset?.id} key={a.id} onClick={()=>setSelected(a.id)}><strong>{label(a.title)}</strong><span>{a.creator} · {size(a.bytes)}</span><small>{statusLabel(a.classroomStatus)}{placements.some(p=>p.asset===a.id)?' · In scene':''}</small></button>)}</div></aside>
      {asset&&<article className="model-detail" key={asset.id}>
        <div className="model-detail-heading"><div><span className="model-kicker">{label(asset.category)} · {statusLabel(asset.classroomStatus)}</span><h2>{label(asset.title)}</h2></div><a className="model-download" href={asset.url} download>Download GLB ↗</a></div>
        <ModelPreview asset={asset}/>
        <dl className="model-metrics"><div><dt>Transfer</dt><dd>{size(asset.bytes)}</dd></div><div><dt>Triangles</dt><dd>{asset.triangles.toLocaleString()}</dd></div><div><dt>Dimensions · X / Y / Z</dt><dd>{asset.dimensions.map(n=>n.toFixed(2)).join(' / ')} m</dd></div><div><dt>Materials / skins / clips</dt><dd>{asset.materials} / {asset.skins} / {asset.clips.length}</dd></div></dl>
        <h3>Use this object</h3><p>{asset.usage.placement}</p><p className="model-caution">{asset.usage.cautions}</p>
        <h3>Current integration</h3>{used.length?<ul>{used.map(p=><li key={`${p.setting}-${p.key}`}><b>{label(p.setting)} · {label(p.key)}</b> — position [{p.at.join(', ')}], yaw {(p.turn??0).toFixed(2)} rad. {p.zone?`Opens ${p.zone} source station.`:'Scenery only.'} {p.solid?'Ground footprint blocks walking.':'Uses existing furniture or sits outside the walking route.'}</li>)}</ul>:<p>{asset.classroomStatus==='scene-eligible'?'Available for future placements; currently loaded only in this catalog.':'Reference preview only. Complete the adaptation or assembly review before placing it in a lesson.'}</p>}
        <h3>Implementation notes</h3><dl className="model-usage">{['loading','collision','interaction','animation'].map(key=><div key={key}><dt>{label(key)}</dt><dd>{asset.usage[key]}</dd></div>)}</dl>
        {asset.classroomStatus==='scene-eligible'?<><p>Add a reviewed placement to <code>components/worlds/scene/externalLayout.ts</code>. Coordinates are meters, Y is up, and yaw is in radians. Static files are centered in X/Z and grounded at Y = 0; keep scale = 1.</p><pre>{`{\n  key: 'unique-placement-name',\n  asset: '${asset.id}',\n  at: [0, 0, 0], // choose a clear, supported location\n  turn: 0,\n  // zone: 'library', // only if it should open this station\n  // solid: true,    // add its footprint to navigation\n}`}</pre><p>The scene loader caches one template per asset, clones static meshes, retains a fallback on failure, and owns disposal. For Alexandria, update its navigation separately before adding new ground obstacles.</p></>:asset.classroomStatus==='assembly-or-context-review'?<p>Load the registered GLB in a standalone viewer, assemble its companion pieces, and check scale, support, silhouette and period context. Keep ship decorations and rigging out of ancient settings until adapted. Change readiness only after reviewing the completed object; the lesson loader currently rejects it.</p>:<p>For a standalone preview, load the GLB with Three.js <code>GLTFLoader.loadAsync</code>. Clone skinned characters with <code>SkeletonUtils.clone</code>, give each instance an <code>AnimationMixer</code>, and retarget source clips against the destination skeleton. Confirm joints, rest pose, foot contact, root motion and clothing before classroom use. The lesson loader rejects this readiness status.</p>}
        <h3>Preparation and provenance</h3><ul>{asset.modifications.map(m=><li key={m}>{m}</li>)}</ul><p>Anchors: {asset.anchors.join(', ')||'source transforms retained; no generated anchors'}.</p><p><a href={asset.sourceUrl} target="_blank" rel="noreferrer">{asset.creator} · original source</a> · <a href={asset.licenseUrl} target="_blank" rel="noreferrer">{asset.license}</a></p><p>{asset.usage.rights}</p><p>Retained original: <code>{asset.sourcePath}</code></p><details><summary>File identity</summary><code className="model-hash">{asset.sha256}</code><a href="/models/external/catalog.json" download>Download the full machine-readable catalog</a></details>
      </article>}
    </div>
  </main>;
}
