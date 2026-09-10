'use client';
import PageHeader from '@/components/PageHeader';
import {useEffect,useMemo,useState} from 'react';
import ModelPreview from './ModelPreview';
import {catalogLabel as label,catalogSize as size,readinessLabel,verifyCatalog,filterCatalog,catalogPlacements as placements,catalogSettings,placementCode,loaderCode,placementBundle,type CatalogAsset,type CatalogPlacement} from '@/lib/modelCatalog';
import './model-catalog.css';

function CopyButton({value,label:buttonLabel='Copy code'}:{value:string;label?:string}){
 const [message,setMessage]=useState('');
 return <div className="model-copy"><button onClick={async()=>{try{await navigator.clipboard.writeText(value);setMessage('Copied');}catch{setMessage('Clipboard unavailable. Select the text below to copy.');}}}>{buttonLabel}</button><span role="status">{message}</span></div>;
}

function IntegrationPanel({asset,used}:{asset:CatalogAsset;used:CatalogPlacement[]}){
 const [key,setKey]=useState(''),[example,setExample]=useState('placement');
 const placement=used.find(p=>`${p.setting}:${p.key}`===key)??used[0];
 const ready=asset.classroomStatus==='scene-eligible';
 const code=placement?(example==='placement'?placementCode(placement):loaderCode(placement)):'';
 return <section className="model-integrate" aria-label="Integration instructions">
  <span className={`model-readiness ${ready?'ready':'review'}`}>{readinessLabel(asset.classroomStatus)}</span>
  <h3>{ready?'Reuse an existing placement':'Prepare this reference first'}</h3>
  {ready&&placement?<>
   <label>Scene placement<select value={`${placement.setting}:${placement.key}`} onChange={e=>setKey(e.target.value)}>{used.map(p=><option key={`${p.setting}:${p.key}`} value={`${p.setting}:${p.key}`}>{label(p.setting)} · {label(p.key)}</option>)}</select></label>
   <div className="model-placement-facts"><span>Scale <b>{placement.scale??1}×</b></span><span>{placement.zone?`Opens ${placement.zone} station`:'Scenery only'}</span><span>{placement.trunkRadius?`${placement.trunkRadius} m trunk blocker`:placement.solid?'Solid footprint':'Uses an existing support'}</span></div>
   <label>Code example<select value={example} onChange={e=>setExample(e.target.value)}><option value="placement">Existing placement JSON</option><option value="loader">Scene setup and cleanup</option></select></label>
   <CopyButton key={code} value={code} label={example==='placement'?'Copy placement JSON':'Copy setup code'}/>
   <textarea className="model-code" readOnly spellCheck={false} aria-label={example==='placement'?'Placement JSON':'Scene setup code'} value={code} onFocus={e=>e.currentTarget.select()}/>
   <p className="model-help">{example==='placement'?<>Edit this entry in <code>externalLayout.ts</code>. For another instance, update keys and support references together, and choose a supported location. {placement.support&&`${placementBundle(placement).length} entries included so the supporting table or crate comes with it.`}</>:<>Use this when building a new scene. Existing lessons already load their art; keep their navigation, selection and cleanup hooks.</>}</p>
   {placement.setting==='alexandria'&&<p className="model-help">These coordinates use Alexandria’s calibrated furniture. New ground obstacles also need an entry in <code>walkGeometry.ts</code>.</p>}
  </>:<><p>{asset.usage.cautions}</p><p>{asset.classroomStatus==='assembly-or-context-review'?'Assemble the companion pieces and review their scale, support and period context. Register the reviewed derivative before adding it to a lesson.':'Fit garments and accessories, confirm the rest pose and retarget any animation to the teaching character. Export a reviewed derivative with its own asset ID.'}</p><p className="model-help">The classroom loader blocks this readiness status. You can preview and download the source here.</p></>}
 </section>;
}

export default function ModelCatalog(){
 const [assets,setAssets]=useState<CatalogAsset[]>([]),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const [search,setSearch]=useState(''),[category,setCategory]=useState('all'),[status,setStatus]=useState('all'),[setting,setSetting]=useState('all'),[sort,setSort]=useState('name');
 const [selected,setSelected]=useState('quaternius-fantasy-props-vase-2');
 useEffect(()=>{const read=()=>{const id=new URL(window.location.href).searchParams.get('asset');if(id)setSelected(id);};read();window.addEventListener('popstate',read);return()=>window.removeEventListener('popstate',read);},[]);
 useEffect(()=>{const abort=new AbortController();fetch('/models/external/catalog.json',{signal:abort.signal,cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('The catalog could not load.');return r.json();}).then(data=>{if(!abort.signal.aborted)setAssets(verifyCatalog(data));}).catch(e=>{if(!abort.signal.aborted){setAssets([]);setError(`${e.message} Retry, or reload the page if the app was just updated.`);}});return()=>abort.abort();},[attempt]);
 const filtered=useMemo(()=>filterCatalog(assets,{search,category,status,setting,sort}),[assets,search,category,status,setting,sort]);
 const asset=filtered.find(a=>a.id===selected)??filtered[0],used=asset?placements.filter(p=>p.asset===asset.id):[];
 useEffect(()=>{if(!asset)return;const url=new URL(window.location.href);url.searchParams.set('asset',asset.id);window.history.replaceState(window.history.state,'',url);},[asset]);
 function selectAsset(id:string){setSelected(id);if(window.matchMedia('(max-width: 760px)').matches)requestAnimationFrame(()=>document.getElementById('selected-model')?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));}
 function reset(){setSearch('');setCategory('all');setStatus('all');setSetting('all');}
 return <main className="model-catalog">
  <PageHeader />
  <header className="model-catalog-header"><div><span className="model-kicker">COUNTERFACTUAL WORLDS · DEVELOPMENT LIBRARY</span><h1>Model catalog</h1><p>Find a model, inspect its scene placement, and copy the code to reuse it.</p></div><nav aria-label="Catalog resources"><a href="/models/external/catalog.json" download>Export catalog</a></nav></header>
  <div className="model-status-bar" aria-live="polite">{assets.length?<><strong>{assets.length} verified records</strong><span>{new Set(placements.map(p=>p.asset)).size} models placed</span><span>{placements.length} placements · {catalogSettings.length} base settings</span><span className="model-verified">Metadata matches this app’s registry</span></>:<span>{error?'Catalog needs attention':'Loading the local model registry…'}</span>}</div>
  {error&&<div role="alert" className="model-error"><p>{error}</p><button onClick={()=>{setError('');setAttempt(n=>n+1);}}>Retry catalog</button></div>}
  <div className="model-catalog-body">
   <aside className="model-library" aria-label="Find models"><label htmlFor="model-search">Search models</label><input id="model-search" type="search" placeholder="Name, creator, purpose…" value={search} onChange={e=>setSearch(e.target.value)}/>
    <div className="model-filters"><label>Setting<select value={setting} onChange={e=>setSetting(e.target.value)}><option value="all">All settings</option>{catalogSettings.map(s=><option value={s} key={s}>{label(s)}</option>)}</select></label><label>Readiness<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All models</option>{[...new Set(assets.map(a=>a.classroomStatus))].sort().map(s=><option key={s} value={s}>{readinessLabel(s)}</option>)}</select></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{[...new Set(assets.map(a=>a.category))].sort().map(c=><option key={c} value={c}>{label(c)}</option>)}</select></label><label>Sort<select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Name</option><option value="size">Smallest file first</option></select></label></div>
    <div className="model-results"><span aria-live="polite">{filtered.length} results</span><button onClick={reset}>Clear filters</button></div>
    <div className="model-list">{filtered.map(a=><button className={a.id===asset?.id?'selected':''} aria-pressed={a.id===asset?.id} key={a.id} onClick={()=>selectAsset(a.id)}><strong>{label(a.title)}</strong><span>{a.creator} · {size(a.bytes)}</span><small>{placements.some(p=>p.asset===a.id)?'In scene':a.classroomStatus==='scene-eligible'?'Available':'Reference only'} · {label(a.category)}</small></button>)}</div>
   </aside>
   {!asset&&assets.length>0&&<section className="model-empty"><h2>No matching models</h2><p>Try another name or clear the filters to browse the library.</p><button onClick={reset}>Show all models</button></section>}
   {asset&&<article id="selected-model" className="model-detail" key={asset.id}>
    <div className="model-detail-heading"><div><span className="model-kicker">{label(asset.category)} · {asset.creator}</span><h2>{label(asset.title)}</h2><code className="model-id">{asset.id}</code></div><div className="model-actions"><a className="model-download" href={asset.url} download>Download GLB · {size(asset.bytes)}</a><CopyButton value={`${typeof window==='undefined'?'':window.location.origin}/model-catalog?asset=${encodeURIComponent(asset.id)}`} label="Copy asset link"/></div></div>
    <div className="model-workspace"><div><ModelPreview asset={asset}/><dl className="model-metrics"><div><dt>File size</dt><dd>{size(asset.bytes)}</dd></div><div><dt>Triangles</dt><dd>{asset.triangles.toLocaleString()}</dd></div><div><dt>Source dimensions · X / Y / Z</dt><dd>{asset.dimensions.map(n=>n.toFixed(2)).join(' / ')} m</dd></div><div><dt>Materials / skins / clips</dt><dd>{asset.materials} / {asset.skins} / {asset.clips.length}</dd></div></dl></div><IntegrationPanel asset={asset} used={used}/></div>
    <section className="model-guidance"><h3>Placement guidance</h3><p>{asset.usage.placement}</p><p className="model-caution">{asset.usage.cautions}</p><p className="model-help">The preview shows the exported model at its original size. Placement scale is shown in the integration panel. Base layouts may be filtered by a lesson’s theme; scenery is illustrative, not primary evidence.</p></section>
    <details className="model-section"><summary>All current placements <span>{used.length}</span></summary>{used.length?<div className="model-table-wrap"><table><thead><tr><th>Setting / entry</th><th>Position · meters</th><th>Scale</th><th>Interaction</th></tr></thead><tbody>{used.map(p=><tr key={`${p.setting}:${p.key}`}><td><strong>{label(p.setting)}</strong><code>{p.key}</code></td><td>{p.at.map(n=>Number(n.toFixed(4))).join(', ')}</td><td>{p.scale??1}×</td><td>{p.zone?`Open ${p.zone}`:'Scenery'}</td></tr>)}</tbody></table></div>:<p>No lesson placements. Complete adaptation or assembly before using this reference.</p>}</details>
    <details className="model-section"><summary>Loading, collision and animation notes</summary><dl className="model-usage">{['loading','collision','interaction','animation'].map(key=><div key={key}><dt>{label(key)}</dt><dd>{asset.usage[key]}</dd></div>)}</dl><p>Static exports use meters, Y-up and a grounded, centered origin. Uniform scale updates collision bounds. The loader shares geometry/materials, retains fallbacks, and disposes late results. Independent skinned instances need <code>SkeletonUtils.clone</code> and their own <code>AnimationMixer</code>.</p></details>
    <details className="model-section"><summary>License, preparation and file identity</summary><p><a href={asset.sourceUrl} target="_blank" rel="noreferrer">{asset.creator} · publisher source</a> · <a href={asset.licenseUrl} target="_blank" rel="noreferrer">{asset.license}</a></p><p>{asset.usage.rights}</p><ul>{asset.modifications.map(m=><li key={m}>{m}</li>)}</ul><p>Anchors: {asset.anchors.join(', ')||'source transforms retained; no added anchors'}.</p><p>Retained original: <code>{asset.sourcePath}</code></p><p>SHA-256</p><code className="model-hash">{asset.sha256}</code></details>
   </article>}
  </div>
 </main>;
}
