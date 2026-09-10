import {initialWorld,type World} from './world';
import {MuseumSelectionSchema} from './museums';
// Keep the introductory tour stable as the wider Alexandria collection grows.
export const alexandriaMuseumIds=MuseumSelectionSchema.parse(['cma-142026','cma-101386','cma-97411']);
export const museumDemoObjectId='cma-142026';
export function createMuseumDemoWorld():World{return {...structuredClone(initialWorld),museumObjectIds:[...alexandriaMuseumIds]};}
export function museumDemoSource(world:World){return world.evidence.find(item=>item.id==='strabo'&&item.kind==='source');}
