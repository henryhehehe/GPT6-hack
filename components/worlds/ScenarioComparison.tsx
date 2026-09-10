'use client';

import {BookOpen} from 'lucide-react';
import {scenarioAllowed,type World,type ZoneId} from '@/lib/world';

export default function ScenarioComparison({world,scenario,onRead}:{world:World;scenario:boolean;onRead:(zone:ZoneId)=>void}){
 if(!scenarioAllowed(world))return null;
 return <details className="student-scenario-comparison">
  <summary>Compare the two scenarios</summary>
  <p><strong>Baseline</strong> is the starting situation. <strong>What-if</strong> explores this hypothetical change: {world.intervention}</p>
  <p className="comparison-current">You’re viewing: <strong>{scenario?'What-if':'Baseline'}</strong></p>
  {world.nodes.map(node=><section key={node.id} aria-label={`Scenario comparison at ${node.title}`}>
   <h3>{node.title}</h3>
   <dl>
    <div><dt>Baseline</dt><dd>{node.baseline}</dd></div>
    <div><dt>What-if</dt><dd>{node.consequence}</dd></div>
   </dl>
   <button type="button" className="text-button" aria-label={`Read evidence at ${node.title}`} onClick={()=>onRead(node.id)}><BookOpen size={15}/> Read evidence at this place</button>
  </section>)}
  <p>These are the lesson’s proposed outcomes, not proof of what would happen. Which source or assumption supports each change? What else could happen?</p>
 </details>;
}
