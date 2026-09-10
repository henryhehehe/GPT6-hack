import manifest from '@/assets/model-manifest.json';
import {WORLD_THEMES,WORLD_SURFACES} from './worldThemes';
import {CHARACTER_COSTUMES} from './characterCostumes';
import {characters} from './characters';
import {THEME_LAYOUTS} from '@/components/worlds/scene/themeLayouts';
import {THEME_LIGHTING} from '@/components/worlds/scene/themeLighting';
import {AMBIENCE_PROFILES} from '@/components/worlds/audio/worldAmbience';
import {SCENE_CRAFT_PASSES,sceneReviewTemplate} from './sceneCraft';
import {SCENE_CRAFT_PROFILES,sceneCraftProfile} from './sceneCraftProfiles';

/** Authoring-tool adapter: reads the current registries without loading models or mutating scenes. */
export function sceneCraftReport(worldId:string){
 const brief=sceneCraftProfile(worldId),theme=WORLD_THEMES[worldId],costume=CHARACTER_COSTUMES[worldId];
 if(!theme||!costume||!THEME_LAYOUTS[worldId]||!WORLD_SURFACES[worldId]||!AMBIENCE_PROFILES[worldId])throw new Error(`Incomplete runtime scene registry: ${worldId}`);
 const cast=Object.entries(costume.models).map(([zone,id])=>{
  const asset=manifest.assets.find(a=>a.id===id&&a.category==='characters');
  if(!asset)throw new Error(`Unregistered cast model: ${worldId}/${id}`);
  return {zone,id,url:asset.url,bytes:asset.bytes,sha256:asset.sha256,source:asset.source,license:asset.license,provenance:asset.provenance,clips:asset.clips};
 });
 const uniqueCast=[...new Map(cast.map(a=>[a.id,a])).values()];
 return {
  artifactType:'scene-authoring-brief' as const,version:1,
  notice:'Design targets and current configuration are separate. This report does not install creatures, open interiors, certify historical accuracy or mark quality checks as passed.',
  brief,
  currentRuntime:{
   title:theme.place,costumePeriod:costume.period,costumeInterpretation:costume.interpretation,cast,
   castDownloadBytes:uniqueCast.reduce((sum,a)=>sum+a.bytes,0),
   downloadScope:'Unique named-cast GLBs only; excludes architecture, external assets, background crowd, texture memory and the app bundle.',
   renderer:worldId==='alexandria'?'components/worlds/WorldScene.tsx':'components/worlds/GeneratedWorldScene.tsx',
   characterLoader:worldId==='alexandria'?'components/worlds/scene/teachingCharacters.ts':'components/worlds/scene/themedCharacters.ts',
   layout:worldId==='alexandria'?{source:'components/worlds/WorldScene.tsx + lib/characters.ts',anchors:Object.fromEntries(Object.entries(characters).map(([id,c])=>[id,c.position]))}:THEME_LAYOUTS[worldId],
   surfaces:WORLD_SURFACES[worldId],
   lighting:worldId==='alexandria'?{source:'components/worlds/WorldScene.tsx + components/worlds/scene/harborEnvironment.ts',note:'Alexandria uses its own calibrated lights, not THEME_LIGHTING.alexandria.'}:THEME_LIGHTING[worldId],
   ambience:AMBIENCE_PROFILES[worldId],
  },
  workflow:SCENE_CRAFT_PASSES,
  review:sceneReviewTemplate(worldId),
 };
}

export function findSceneCraftProfiles(filters:{region?:string;period?:string;creature?:string}={}){
 const contains=(text:string,query?:string)=>!query||text.toLocaleLowerCase().includes(query.toLocaleLowerCase());
 return Object.values(SCENE_CRAFT_PROFILES).filter(p=>
  contains(`${p.context.region} ${p.context.locality}`,filters.region)&&
  contains(`${p.context.narrativeFrame} ${CHARACTER_COSTUMES[p.worldId].period}`,filters.period)&&
  contains(p.life.creatures.map(c=>`${c.name} ${c.kind}`).join(' '),filters.creature)
 ).map(p=>({worldId:p.worldId,region:p.context.region,period:CHARACTER_COSTUMES[p.worldId].period,signature:p.direction.signature,creatures:p.life.creatures.map(c=>`${c.name} (${c.state})`)}));
}

export function sceneCraftMarkdown(report:ReturnType<typeof sceneCraftReport>){
 const {brief:b,currentRuntime:r}=report;
 const lines=[`# ${r.title}: scene improvement brief`,'',report.notice,'',
  '## Context','',`- World: \`${b.worldId}\``,`- Region: ${b.context.region}`,`- Place: ${b.context.locality} (${b.context.geography})`,`- Narrative frame: ${b.context.narrativeFrame}`,`- Source / edition: ${b.context.sourceFrame}`,`- Current wardrobe frame: ${r.costumePeriod}`,`- Limits: ${b.context.uncertainty}`,'',
  '## Distinctive direction','',b.direction.signature,'',b.direction.composition,'',`Clothing: ${b.direction.wardrobe}`,'',`Materials: ${b.direction.materialDetail}`,'',
  '## Human activity and creatures','',...b.life.activities.map(a=>`- ${a}`),'',b.life.creatureRestraint,'',
  ...b.life.creatures.flatMap(c=>[`### ${c.name} · ${c.state}`,'',`${c.kind}; ${c.basis}. ${c.representation}`,`Habitat: ${c.habitat}`,`Behavior: ${c.behavior}`,`References: ${c.referenceIds.join(', ')||'None; interpretive candidate only.'}`,'']),
  '## Space, light, motion and sound','',`Interior: ${b.space.interiorTarget} · ${b.space.access}. ${b.space.review}`,'',`Light: ${b.atmosphere.lighting}`,'',`Motion: ${b.atmosphere.motion}`,'',`Sound: ${b.atmosphere.sound}`,'',
  '## Next focused passes','',...b.nextPasses.map((p,i)=>`${i+1}. ${p}`),'','Avoid:','',...b.avoid.map(p=>`- ${p}`),'',
  '## Reuse the current implementation','',`Renderer: \`${r.renderer}\`. Character loader: \`${r.characterLoader}\`.`,
  `Named-cast download: ${r.castDownloadBytes.toLocaleString('en-US')} bytes. ${r.downloadScope}`,'',
  '| Station | Current model | Editable source |','| --- | --- | --- |',...r.cast.map(a=>`| ${a.zone} | ${a.id} | ${a.source} |`),'',
  'Full current surface, lighting and ambience settings are available in the JSON export. Do not duplicate those values in a new renderer.','',
  ...report.workflow.flatMap(p=>[`### ${p.title}`,'',p.check,'',...p.reuse.map(path=>`- \`${path}\``),'']),
  '## Review evidence','',report.review.note,'',...report.review.passes.map(p=>`- [ ] ${p.id}: ${p.status}`),'',
  '## References','',...b.references.map(ref=>`- ${ref.id}: [${ref.title}](${ref.url}) — ${ref.supports}`),'',
 ];
 return lines.join('\n');
}
