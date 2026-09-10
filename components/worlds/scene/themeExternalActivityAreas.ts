import type {WorldTheme} from '@/lib/worldThemes';
import type {ExternalPlacement} from './externalLayout';
const prop=(id:string)=>`quaternius-fantasy-props-${id}`;

/** Small scene-specific additions outside the source-station arrival aprons. */
export function themeExternalActivityAreas(theme:WorldTheme):ExternalPlacement[]{
 if(theme.id==='christmas-carol')return [
  {key:'winter-produce-stall',asset:prop('stall-empty'),at:[12,0,-15],zone:'market',solid:true},
  // The usable counter is 0.88818 m high; the 2.8 m bounds include its canopy.
  {key:'winter-produce-apples',asset:prop('farmcrate-apple'),at:[12,.8912,-15],zone:'market',support:'winter-produce-stall'},
 ];
 if(theme.id==='tempest')return [
  {key:'island-camp-pot',asset:prop('pot-1'),at:[17,0,5],zone:'market',solid:true},
 ];
 if(theme.id==='frankenstein')return [
  {key:'study-low-shelf',asset:prop('shelf-simple'),at:[-7,0,-14],zone:'library',solid:true},
  {key:'study-shelf-book',asset:prop('book-5'),at:[-7,.394,-14],zone:'library',support:'study-low-shelf'},
 ];
 return [];
}
