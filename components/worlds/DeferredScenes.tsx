'use client';
import {Component,lazy,Suspense,type ComponentProps,type ReactNode} from 'react';
import type AlexandriaScene from './WorldScene';
import type ReadingScene from './GeneratedWorldScene';

const Alexandria=lazy(()=>import('./WorldScene'));
const Reading=lazy(()=>import('./GeneratedWorldScene'));

class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){
  if(this.state.failed)return <div className="world-canvas"><div className="world-error" role="alert"><p>The scene could not load. Your journal and evidence are still available.</p><button className="text-button" onClick={()=>window.location.reload()}>Reload page</button></div></div>;
  return this.props.children;
 }
}

function Deferred({children}:{children:ReactNode}){
 return <SceneBoundary><Suspense fallback={<div className="world-canvas"><p className="world-error" role="status">Loading the scene… You can open your journal while you wait.</p></div>}>{children}</Suspense></SceneBoundary>;
}
export function WorldScene(props:ComponentProps<typeof AlexandriaScene>){return <Deferred><Alexandria {...props}/></Deferred>;}
export function GeneratedWorldScene(props:ComponentProps<typeof ReadingScene>){return <Deferred><Reading {...props}/></Deferred>;}
