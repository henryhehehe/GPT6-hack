import type {World} from '@/lib/world';
import {worldTheme} from '@/lib/worldThemes';
import {worldCharacters} from '@/lib/characters';

/** Only inputs used to construct the scene should restart its renderer and camera.
 * Lesson text, museum selections and live scenario state are read separately.
 */
export function generatedSceneIdentity(world:World){
 const theme=worldTheme(world),cast=worldCharacters(world);
 return JSON.stringify({theme,guideColors:[cast.harbor.color,cast.market.color,cast.library.color]});
}
