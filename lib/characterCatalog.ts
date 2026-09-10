import manifest from '@/assets/model-manifest.json';
import {CHARACTER_COSTUMES} from './characterCostumes';
import {WORLD_THEMES} from './worldThemes';
import type {ZoneId} from './world';
import type {CatalogAsset} from './modelCatalog';

export type CharacterUse={worldId:string;worldLabel:string;zone:ZoneId;role:string;period:string;interpretation:string;references:readonly {title:string;url:string}[]};
export type CharacterCatalogAsset=CatalogAsset&{family:string;assignments:CharacterUse[]};
export const characterUses=Object.entries(CHARACTER_COSTUMES).flatMap(([worldId,costume])=>Object.entries(costume.models).map(([zone,assetId])=>({assetId,worldId,worldLabel:WORLD_THEMES[worldId].place,zone:zone as ZoneId,role:WORLD_THEMES[worldId].roles[['harbor','market','library'].indexOf(zone)],period:costume.period,interpretation:costume.interpretation,references:costume.references})));
export const characterModels=manifest.assets.filter(a=>characterUses.some(u=>u.assetId===a.id));
export function usesForCharacter(id:string):CharacterUse[]{return characterUses.filter(u=>u.assetId===id).map(({assetId,...use})=>{void assetId;return use;});}
export function verifyCharacterCatalog(value:unknown):CharacterCatalogAsset[]{
 if(!Array.isArray(value)||value.length!==characterModels.length)throw new Error('The character catalog does not match this app build.');
 const seen=new Set<string>();
 for(const a of value){
  const expected=characterModels.find(m=>m.id===a?.id);
  if(!expected||seen.has(a.id)||a.url!==expected.url||a.sha256!==expected.sha256||a.bytes!==expected.bytes||a.family!==expected.pack||a.license!==expected.license||JSON.stringify(a.assignments)!==JSON.stringify(usesForCharacter(a.id)))throw new Error('Character files or scene assignments are out of sync.');
  if(!Array.isArray(a.dimensions)||a.dimensions.length!==3||!a.dimensions.every(Number.isFinite)||![a.triangles,a.materials,a.skins].every(n=>Number.isFinite(n)&&n>=0)||!Array.isArray(a.clips)||!expected.clips.every(c=>a.clips.includes(c)))throw new Error('Incomplete character metadata.');
  seen.add(a.id);
 }
 return value as CharacterCatalogAsset[];
}
export function characterSetupCode(worldId:string){
 if(!Object.hasOwn(CHARACTER_COSTUMES,worldId))throw new Error('Unknown authored character assignment');
 if(worldId==='alexandria')return `import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { loadTeachingCharacters } from '@/components/worlds/scene/teachingCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.character = zone; });
  return loadTeachingCharacters(zones.map(zone => anchors[zone]));
}

// Existing WorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion).
// cast.loaded resolves after loading settles. Keep existing onTalk hooks.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.`;
 return `import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['${worldId}'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.`;
}
