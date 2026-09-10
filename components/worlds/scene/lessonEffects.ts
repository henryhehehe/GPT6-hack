import type {World,ZoneId} from '@/lib/world';
export const alexandriaHintPositions:Record<ZoneId,[number,number,number]>={harbor:[-13,2.2,11],market:[11,2.2,7],library:[0,4,-5]};
export const generatedHintPositions:Record<ZoneId,[number,number,number]>={harbor:[-12,1.8,7],market:[12,1.8,7],library:[0,1.8,-10]};
export function visibleAtActivity(world:World,zone:ZoneId,index:number,count:number,blend:number){
 const activity=world.nodes.find(n=>n.id===zone)?.activity??1;
 return index/Math.max(1,count)<1-Math.max(0,Math.min(1,blend))*(1-activity);
}
