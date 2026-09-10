import type {ZoneId} from '@/lib/world';
export type StationPoint={x:number;z:number};
export type StationLayout={spots:Record<ZoneId,StationPoint>;turns?:Partial<Record<ZoneId,number>>;floor?:number;paths?:StationPoint[][]};
/** Furniture, companions, lamps and arrivals share one local coordinate system. */
export function stationPoint(layout:StationLayout,zone:ZoneId,x:number,z:number):StationPoint{
 const p=layout.spots[zone],turn=layout.turns?.[zone]??0,c=Math.cos(turn),s=Math.sin(turn);
 return {x:p.x+x*c+z*s,z:p.z-x*s+z*c};
}
export function distanceToSegment(p:StationPoint,a:StationPoint,b:StationPoint){
 const x=b.x-a.x,z=b.z-a.z,length=x*x+z*z;
 const t=length?Math.max(0,Math.min(1,((p.x-a.x)*x+(p.z-a.z)*z)/length)):0;
 return Math.hypot(p.x-a.x-t*x,p.z-a.z-t*z);
}
