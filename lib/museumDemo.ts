import {initialWorld,type World} from './world';
import {museumObjects} from './museums';
export const alexandriaMuseumIds=museumObjects.filter(item=>item.topic==='Alexandria').map(item=>item.id);
export const museumDemoObjectId='cma-142026';
export function createMuseumDemoWorld():World{return {...structuredClone(initialWorld),museumObjectIds:[...alexandriaMuseumIds]};}
export function museumDemoSource(world:World){return world.evidence.find(item=>item.id==='strabo'&&item.kind==='source');}
