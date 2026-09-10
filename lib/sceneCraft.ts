import {z} from 'zod';

const text=z.string().trim().min(1);
const texts=z.array(text).min(1);
export const SceneCreatureSchema=z.object({
 name:text,
 kind:z.enum(['wildlife','domestic','mythic','supernatural']),
 basis:z.enum(['interpretive','source-described','documented']),
 referenceIds:z.array(text),
 state:z.enum(['candidate','existing']),
 habitat:text,
 behavior:text,
 representation:text,
}).strict().superRefine((value,ctx)=>{
 if(value.basis!=='interpretive'&&!value.referenceIds.length)ctx.addIssue({code:'custom',path:['referenceIds'],message:'A source-described or documented creature needs a supporting reference.'});
 if(['mythic','supernatural'].includes(value.kind)&&value.basis==='documented')ctx.addIssue({code:'custom',path:['basis'],message:'Literary beings cannot be recorded as documented historical wildlife.'});
});

/** Authoring data, never a certificate of historical accuracy or a runtime asset URL. */
export const SceneCraftProfileSchema=z.object({
 version:z.literal(1),
 worldId:text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
 context:z.object({
  mode:z.enum(['history','literature','myth']),region:text,locality:text,
  geography:z.enum(['named-place','interpretive','fictional']),
  narrativeFrame:text,sourceFrame:text,uncertainty:text,
 }).strict(),
 direction:z.object({signature:text,composition:text,wardrobe:text,materialDetail:text}).strict(),
 life:z.object({activities:texts,creatures:z.array(SceneCreatureSchema),creatureRestraint:text}).strict(),
 space:z.object({interiorTarget:text,access:z.enum(['implemented','needs-review','not-planned']),review:text}).strict(),
 atmosphere:z.object({lighting:text,motion:text,sound:text}).strict(),
 avoid:texts,
 nextPasses:texts,
 references:z.array(z.object({id:text,title:text,url:z.string().url(),supports:text}).strict()),
}).strict().superRefine((profile,ctx)=>{
 const ids=profile.references.map(r=>r.id);
 if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',path:['references'],message:'Reference IDs must be unique.'});
 for(const [index,creature] of profile.life.creatures.entries())for(const id of creature.referenceIds){
  if(!ids.includes(id))ctx.addIssue({code:'custom',path:['life','creatures',index,'referenceIds'],message:`Unknown reference: ${id}`});
 }
});
export type SceneCraftProfile=z.infer<typeof SceneCraftProfileSchema>;

/** Shared review method; each scene supplies its own artistic and historical decisions. */
export const SCENE_CRAFT_PASSES=[
 {id:'context',title:'Period, region and evidence',check:'Separate the date of the story from the edition and garment reference. Record place, social role, climate choices and uncertainty. Attach a source to each factual design claim.',reuse:['lib/characterCostumes.ts','docs/curriculum/HISTORICAL-ACCURACY-REVIEW.md']},
 {id:'composition',title:'Place and human purpose',check:'Arrange people around real tasks, work surfaces, paths and sightlines. Give each world a distinct spatial signature; preserve source and conversation anchors.',reuse:['components/worlds/scene/themeLayouts.ts','components/worlds/scene/stationTransform.ts','components/worlds/scene/themeExternalActivityAreas.ts']},
 {id:'characters',title:'Character shape and clothing',check:'Review silhouette, fabric construction, role and season before adding geometry. Inspect neckline, shoulder, elbow, waist and hem in actual exported Idle/Greeting/Talk clips. Keep feet grounded and skeletons independent.',reuse:['scripts/blender/alexandria_clothing.py','components/worlds/scene/themedCharacters.ts','components/worlds/scene/teachingCharacters.ts','components/worlds/scene/humanScale.ts','tests/alexandriaClothing.test.ts']},
 {id:'materials',title:'Surfaces and asset fit',check:'Reuse models only after checking period, region, function, scale and rights. Add roughness, thickness and local wear where visible; verify props touch their supporting surface.',reuse:['lib/worldThemes.ts','lib/externalAssetIndex.json','assets/model-manifest.json','components/worlds/scene/themeExternalDetails.ts','components/worlds/scene/themeSurfaces.ts']},
 {id:'life',title:'Movement and creatures',check:'Match wildlife to habitat and source scope; distinguish literary beings from fauna. Start with purposeful, independently phased movement. Check complete routes and pause behavior during reading, conversation and reduced motion.',reuse:['components/worlds/scene/characterActivity.ts','components/worlds/scene/characterIdleMotion.ts','components/worlds/scene/themeWildlife.ts','components/worlds/scene/themeWind.ts','components/worlds/scene/crowdRoutes.ts']},
 {id:'interiors',title:'Enterable structure',check:'Define doorway, floor, steps, furniture bounds and return route together. Test body and eye clearance against the exported model. Keep fallback architecture and furnishings consistent when either asset load fails.',reuse:['components/worlds/scene/libraryInterior.ts','components/worlds/scene/walkGeometry.ts','components/worlds/scene/settingLayout.ts','tests/libraryInterior.test.ts']},
 {id:'lighting',title:'Light and atmosphere',check:'Review exterior, entrance, face and reading surface at each supported time/weather setting. Keep a motivated key, restrained fill and material response. Wind and its shadow must agree; reflections must follow lighting changes.',reuse:['components/worlds/scene/themeLighting.ts','components/worlds/scene/themeEnvironment.ts','components/worlds/scene/harborEnvironment.ts','lib/sceneAppearance.ts']},
 {id:'sound',title:'Sound and stillness',check:'Choose ambience from place and activity. Keep audio opt-in, adjustable and quiet enough for reading. Check world switching, suspension, reduced motion and cleanup; do not claim synthesized birds identify a historical species.',reuse:['components/worlds/audio/worldAmbience.ts','components/worlds/WorldAmbience.tsx','tests/worldAmbience.test.ts']},
 {id:'delivery',title:'Quality and performance evidence',check:'Check actual exported geometry, late-load disposal, fallbacks, interaction and build. Record bytes, triangles, draw calls, texture memory and target-device results separately. Browser/frame-rate status stays unmeasured until tested.',reuse:['scripts/check-alexandria-pack.mjs','scripts/check-alexandria-details.mjs','tests/themedCharacters.test.ts']},
] as const;

export function sceneReviewTemplate(worldId:string){
 return {worldId,sourceRevision:null,reviewedAt:null,passes:SCENE_CRAFT_PASSES.map(pass=>({id:pass.id,status:'unreviewed',evidence:[] as string[],notes:''})),
  measurements:{coreBytes:null,externalBytes:null,crowdBytes:null,triangles:null,drawCalls:null,textureMemoryBytes:null,device:null,browserFps:null},
  note:'A completed brief is not a completed scene review. Attach evidence for the exact source revision before marking a pass complete.'};
}
