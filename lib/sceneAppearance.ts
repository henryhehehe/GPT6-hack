import {z} from 'zod';

export const SceneAppearanceSchema=z.object({
 timeOfDay:z.enum(['day','dawn','sunset','night']),
 weather:z.enum(['clear','hazy','overcast']),
 water:z.enum(['calm','choppy']),
 viewpoint:z.enum(['overview','harbor','market','library']),
}).strict();
export type SceneAppearance=z.infer<typeof SceneAppearanceSchema>;
export const defaultSceneAppearance:SceneAppearance={timeOfDay:'day',weather:'clear',water:'calm',viewpoint:'overview'};
export function activeSceneAppearance(world:{sceneAppearance?:SceneAppearance},scenario:boolean):SceneAppearance{
 return scenario&&world.sceneAppearance?world.sceneAppearance:defaultSceneAppearance;
}
export const SCENE_LIGHTING={
 day:{direction:[-.62,.43,.65],sun:'#ffdfad',sky:'#d2e7f0',ground:'#8b775a',fog:'#c8d8dd',strength:2.5,fill:.75,exposure:.6},
 dawn:{direction:[.7,.15,.6],sun:'#ffd5a0',sky:'#c4cce8',ground:'#776678',fog:'#d8bdba',strength:1.9,fill:.8,exposure:.7},
 sunset:{direction:[-.8,.12,.45],sun:'#ffad63',sky:'#e1b8ae',ground:'#765958',fog:'#d7a995',strength:2.2,fill:.75,exposure:.7},
 night:{direction:[.35,.7,-.6],sun:'#aecbff',sky:'#94acd7',ground:'#434c65',fog:'#192a44',strength:.65,fill:.65,exposure:.85},
} as const;
export function appearanceLighting(appearance:SceneAppearance){
 const light=SCENE_LIGHTING[appearance.timeOfDay];
 return {...light,cloud:appearance.weather==='overcast'?.88:appearance.weather==='hazy'?.4:.22,
  haze:appearance.weather==='hazy'?.012:appearance.weather==='overcast'?.006:.0025,
  strength:light.strength*(appearance.weather==='overcast'?.5:1),
  waterSpeed:appearance.water==='choppy'?.7:.2,distortion:appearance.water==='choppy'?4.5:1.2,
  bob:appearance.water==='choppy'?.32:.09};
}
