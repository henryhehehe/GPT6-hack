import * as THREE from 'three';
import {HUMAN_SCALE,LIBRARY_DESK_Y} from './humanScale';

/** Interpretive reading hall dimensions shared by fallback architecture and walking. */
export const LIBRARY_INTERIOR={floor:4,terrace:2.85,rampStart:-3,rampEnd:-6.9,doorZ:-10.0,readingPoint:{x:0,z:-14}} as const;
type Bounds=readonly[number,number,number,number];
export const LIBRARY_WALL_BOUNDS:readonly Bounds[]=[
 [-10.32,10.32,-18.73,-18.17], // Rear hall wall.
 [-10.06,-9.54,-18.45,-8.75],[9.54,10.06,-18.45,-8.75],
 [-8.8,-1.42,-10.82,-10.48],[1.42,8.8,-10.82,-10.48], // Actual open doorway.
 ...[-6.5,-3.5,3.5,6.5].map((x):Bounds=>[x-1.31,x+1.31,-10.7,-9.65]),
 [-1.60,-1.0,-11.4,-9.7],[1.0,1.60,-11.4,-9.7], // Jambs and fully opened bronze leaves.
 [-13.3,-10.05,-17.8,-8.6],[10.05,13.3,-17.8,-8.6], // Study wings remain closed.
];
export const LIBRARY_COLUMN_BOUNDS:readonly Bounds[]=[
 ...[-8.5,-6.07,-3.64,-1.21,1.21,3.64,6.07,8.5].map((x):Bounds=>[x-.55,x+.55,-7.85,-6.75]),
 ...[-8.5,8.5].flatMap(x=>[-10.2,-13.1,-16].map((z):Bounds=>[x-.55,x+.55,z-.55,z+.55])),
];
export const LIBRARY_FURNITURE_BOUNDS:readonly Bounds[]=[
 // Existing portico furniture was formerly protected by one solid building footprint.
 [-5.75,-3.65,-9.04,-7.79],[-5.08,-4.32,-9.83,-9.07],
 [-7.48,-5.52,-9.93,-9.13],[5.52,7.48,-9.93,-9.13],
 [-4.47,-3.53,-6.67,-5.73],[3.53,4.47,-6.67,-5.73],
 [-8.35,-7.05,-9.25,-8.2],[6.9,8.25,-9.1,-7.55],
 [-10.05,-8.9,-8.95,-7.85],[-10.1,-8.9,-6.9,-5.7],[8.9,10.1,-6.9,-5.7],
 // New hall desks, seats and racks, measured from the existing kit's Blender bounds.
 ...[-4.5,4.5].flatMap((x):Bounds[]=>[[x-1.03,x+1.03,-14.59,-13.41],[x-.37,x+.37,-13.17,-12.43]]),
 ...[-7,7].flatMap(x=>[-13,-16.8].map((z):Bounds=>[x-.98,x+.98,z-.38,z+.42])),
];
export const LIBRARY_OBSTACLES=[...LIBRARY_WALL_BOUNDS,...LIBRARY_COLUMN_BOUNDS,...LIBRARY_FURNITURE_BOUNDS];

export const LIBRARY_INTERIOR_PLACEMENTS=[
 ...[-4.5,4.5].flatMap(x=>[
  {id:'writing-desk' as const,at:[x,4,-14] as [number,number,number],scale:[1,HUMAN_SCALE.deskVertical,1] as [number,number,number]},
  {id:'wooden-stool' as const,at:[x,4,-12.8] as [number,number,number],scale:[1,HUMAN_SCALE.stoolVertical,1] as [number,number,number]},
  {id:'oil-lamp' as const,at:[x-.65,LIBRARY_DESK_Y,-14.1] as [number,number,number],scale:.6},
 ]),
 ...[-7,7].flatMap(x=>[-13,-16.8].map(z=>({id:'scroll-rack' as const,at:[x,4,z] as [number,number,number]}))),
];

export function libraryGroundHeight(point:{x:number;z:number}):number|undefined{
 if(Math.abs(point.x)<=5.5&&point.z<=-3&&point.z>=-6.9)return 2.85+(-3-point.z)/3.9*1.15;
 if(Math.abs(point.x)<=13.5&&point.z<=-6.9&&point.z>=-20.1)return 4;
 if(Math.abs(point.x)>=5.5&&Math.abs(point.x)<=13.5&&point.z<=-3.9&&point.z>=-6.9)return 4;
 return undefined;
}

/** Same open center aisle while the authored library is loading or unavailable. */
export function createLibraryFallback(parent:THREE.Object3D){
 const group=new THREE.Group();group.name='EnterableLibraryFallback';parent.add(group);
 const furnishings=new THREE.Group();furnishings.name='LibraryFurnitureFallback';parent.add(furnishings);
 const stone=new THREE.MeshStandardMaterial({color:'#d9c7a5',roughness:.87});
 const wood=new THREE.MeshStandardMaterial({color:'#73543c',roughness:.75});
 function box(w:number,h:number,d:number,x:number,bottom:number,z:number,material=stone,target:THREE.Object3D=group){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,bottom+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;target.add(mesh);return mesh;
 }
 box(27,1.15,13.2,0,2.85,-13.5);
 for(const x of [-9.5,9.5])box(8,1.15,3,x,2.85,-5.4);
 for(let i=0;i<8;i++)box(11,(i+1)*1.15/8,3.9/8,0,2.85,-3-(i+.5)*3.9/8);
 for(const [x0,x1,z0,z1] of LIBRARY_WALL_BOUNDS)box(x1-x0,6.2,z1-z0,(x0+x1)/2,4,(z0+z1)/2);
 for(const [x0,x1,z0,z1] of LIBRARY_COLUMN_BOUNDS){
  box(x1-x0,.2,z1-z0,(x0+x1)/2,4,(z0+z1)/2);
  const column=new THREE.Mesh(new THREE.CylinderGeometry(.36,.42,5.9,16),stone);column.position.set((x0+x1)/2,7.15,(z0+z1)/2);column.castShadow=true;column.receiveShadow=true;group.add(column);
 }
 // Keep every furniture footprint visible if the bundled kit cannot load.
 for(const [i,[x0,x1,z0,z1]] of LIBRARY_FURNITURE_BOUNDS.entries()){
  const rack=i===2||i===3||i>=LIBRARY_FURNITURE_BOUNDS.length-4;
  const height=rack?2.445:.78,x=(x0+x1)/2,z=(z0+z1)/2,w=x1-x0,d=z1-z0;
  if(rack){
   for(const side of [-1,1])box(.1,height,d,x+side*(w-.1)/2,4,z,wood,furnishings);
   for(let shelf=0;shelf<5;shelf++)box(w,.08,d,x,4+shelf*(height-.08)/4,z,wood,furnishings);
  }else{
   box(w,.10,d,x,4+height-.1,z,wood,furnishings);
   for(const dx of [-w*.35,w*.35])for(const dz of [-d*.35,d*.35])box(.1,height-.1,.1,x+dx,4,z+dz,wood,furnishings);
  }
 }
 box(20, .35, 12.8,0,10.22,-12.8);
 return {group,furnishings};
}

/** One bounded, non-shadow fill keeps the roofed reading hall legible. */
export function addLibraryReadingLight(parent:THREE.Object3D){
 const light=new THREE.PointLight('#ffddb0',105,18,2);light.name='Library warm reading light';light.position.set(0,7.4,-14);light.castShadow=false;parent.add(light);return light;
}
