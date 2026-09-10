import './scene-loading.css';

export default function SceneLoading({loading,hasFrame,sceneName}:{loading:boolean;hasFrame:boolean;sceneName:string}){
 // A WebGL failure has no rendered scene to reveal; leave its existing error message visible.
 if(!loading&&!hasFrame)return null;
 const state=loading?(hasFrame?'details':'preparing'):'ready';
 return <div className="scene-loading" data-state={state} role="status" aria-live="polite" aria-atomic="true" aria-hidden={!loading}>
  <svg className="scene-loading-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
   <path className="scene-loading-ground" d="M5 40h38M9 40V22a15 15 0 0 1 30 0v18M17 40V24a7 7 0 0 1 14 0v16"/>
   <path className="scene-loading-arch" pathLength="1" d="M9 40V22a15 15 0 0 1 30 0v18"/>
   <path className="scene-loading-horizon" d="M21 32h6M24 29v6"/>
  </svg>
  <div className="scene-loading-copy"><span className="scene-loading-eyebrow">{sceneName}</span><span className="scene-loading-title">{!loading?'Ready to explore':hasFrame?'Adding scene details':'Setting the scene'}<span className="scene-loading-dot">.</span></span><span className="scene-loading-caption">{hasFrame?'You can explore while details load':'Preparing your surroundings'}</span></div>
  <span className="scene-loading-track" aria-hidden="true"/>
 </div>;
}
