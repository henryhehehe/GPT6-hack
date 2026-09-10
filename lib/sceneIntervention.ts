import {z} from 'zod';
import {HintSchema,Zone,validateWorld,scenarioAllowed,type World} from './world';
import {worldTheme} from './worldThemes';
import {SceneAppearanceSchema} from './sceneAppearance';

export const ActivitySceneChangeSchema=z.object({
 intervention:z.string().trim().min(5).max(200),
 appearance:SceneAppearanceSchema.optional(),
 nodes:z.array(z.object({id:Zone,activity:z.number().min(0).max(1),consequence:z.string().trim().min(3).max(240),mechanism:z.string().trim().min(3).max(350)}).strict()).length(3),
}).strict();
export const AppearanceSceneChangeSchema=z.object({appearance:SceneAppearanceSchema}).strict();
export const SceneChangeSchema=z.union([ActivitySceneChangeSchema,AppearanceSceneChangeSchema]);
export type SceneChange=z.infer<typeof SceneChangeSchema>;
export const SceneDirectorSchema=HintSchema.extend({scene:ActivitySceneChangeSchema.extend({appearance:SceneAppearanceSchema})});
export const AppearanceDirectorSchema=HintSchema.extend({scene:AppearanceSceneChangeSchema});
export function sceneDirectorSchema(world:World){return supportsActivitySceneChanges(world)?SceneDirectorSchema:AppearanceDirectorSchema;}
/** Every renderer supports appearance direction; activity edits are specific to Alexandria. */
export function supportsSceneChanges(world:World){return world.nodes.length===3;}
export function supportsActivitySceneChanges(world:World){return scenarioAllowed(world)&&(!world.lessonPack||world.lessonPack.curriculum?.worldId==='alexandria');}
export const sceneDirectorInstructions=' The teacher has requested a scene edit. Return scene with exactly one entry for harbor, market, and library. You can change the hypothetical intervention, conditional consequences, mechanisms, and visual activity levels (0 means quiet/empty, 1 means full activity), plus appearance: timeOfDay (day, dawn, sunset, night), weather (clear, hazy, overcast), water (calm, choppy), and viewpoint (overview, harbor, market, library). These controls change existing ships, market goods, people, sky, lighting, haze, water movement and the initial overview camera. They cannot add buildings, generate geometry/assets, move characters, create rain or snow, or change sources. Explain unsupported requests honestly and use supported controls for a useful approximation. Keep unaffected activity and appearance at supplied values; if appearance is absent use day/clear/calm/overview. For appearance-only requests preserve the existing intervention and causal text. Lighting, haze and water are illustrative art direction and must not be presented as evidence or necessarily changing historical outcomes. Follow teacher corrections. Preserve source text, baseline, character identities and student work. Do not present activity levels as historical measurements. Explain new causal assumptions explicitly. Applying activates the what-if view for the class. Include a guiding question related to the scene.';
export const appearanceDirectorInstructions=' The teacher requested visual scene direction. Return scene containing only appearance with timeOfDay (day, dawn, sunset, night), weather (clear, hazy, overcast), water (calm, choppy), viewpoint (overview, harbor, market, library). The three zone IDs identify the supplied lesson stations, not literal harbor/market/library places; use their actual titles in your response. Change lighting, haze, coastal water motion and the initial camera view. Keep unrequested settings at their supplied values; when appearance is absent prefer day/clear/calm/overview unless the teacher requests otherwise. Indoor lessons change room lighting and haze; they have no visible outdoor sky. Water changes are visible only in coastal worlds. Cannot move characters, add buildings/assets, create rain/snow, change evidence, rewrite the story or alter activities. Explain unsupported requests honestly. Describe this as illustrative atmosphere, never source evidence or a change in the original text. Add a guiding question grounded in the existing lesson. Applying does not activate a hypothetical branch.';
export function sceneInstructions(world:World){return supportsActivitySceneChanges(world)?sceneDirectorInstructions:appearanceDirectorInstructions;}
export function sceneCapabilities(world:World){const theme=worldTheme(world);return {activity:supportsActivitySceneChanges(world),appearance:true,water:supportsActivitySceneChanges(world)||theme.furniture==='coast',stations:world.nodes.map(({id,title})=>({id,title}))};}
export function applySceneChange(world:World,value:unknown):World{
 const scene=SceneChangeSchema.parse(value);
 if(!('nodes' in scene))return validateWorld({...world,sceneAppearance:scene.appearance});
 if(!supportsActivitySceneChanges(world))throw new Error('This lesson supports atmosphere and viewpoints. Its activities and reading stay fixed.');
 if(new Set(scene.nodes.map(node=>node.id)).size!==3)throw new Error('A scene edit must include each place exactly once.');
 return validateWorld({...world,intervention:scene.intervention,...(scene.appearance?{sceneAppearance:scene.appearance}:{}),nodes:world.nodes.map(node=>({...node,...scene.nodes.find(change=>change.id===node.id)!}))});
}
