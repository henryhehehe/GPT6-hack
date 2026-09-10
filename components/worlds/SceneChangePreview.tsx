'use client';
import type {World} from '@/lib/world';
import type {SceneChange} from '@/lib/sceneIntervention';
import './astra-learning.css';
export default function SceneChangePreview({world,scene,previewing,onPreview}:{world:World;scene:SceneChange;previewing:boolean;onPreview:()=>void}){
 return <section className="astra-scene-preview" aria-label="Proposed scene changes">
  <h4>{'nodes' in scene?'Proposed what-if scene':'Proposed scene atmosphere'}</h4>{'nodes' in scene&&<p>{scene.intervention}</p>}
  {scene.appearance&&<div className="astra-appearance-summary"><strong>Scene direction</strong><p>{scene.appearance.timeOfDay} light · {scene.appearance.weather} sky · {scene.appearance.water} water</p><p>Initial viewpoint: {world.nodes.find(node=>node.id===scene.appearance?.viewpoint)?.title??'Overview'}</p><small>Illustrative atmosphere. It does not change the source evidence. Walking students keep their camera position.</small></div>}
  {'nodes' in scene&&scene.nodes.map(change=>{const node=world.nodes.find(node=>node.id===change.id)!;return <div key={change.id} className="astra-scene-change"><strong>{node.title}</strong><span>Activity: {Math.round(node.activity*100)}% → {Math.round(change.activity*100)}%</span><meter min={0} max={1} value={change.activity} aria-label={`${node.title} proposed activity`}/><p>{change.consequence}</p><small>{change.mechanism}</small></div>;})}
  <p className="helper">{'nodes' in scene?'Activity controls the illustration, not historical measurements. Applying switches the class to this what-if scene and keeps saved student work.':'Applying changes the shared illustration. Source texts, activities, saved writing and the current lesson mode stay intact. Water motion is visible in coastal scenes.'}</p>
  <button type="button" className="quiet-button" aria-pressed={previewing} onClick={onPreview}>{previewing?'Return to current scene':'Preview scene in my view'}</button>
 </section>;
}
