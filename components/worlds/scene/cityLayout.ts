/** Shared rendering/navigation plan. These districts are teaching interpretations. */
export type CityPoint={x:number;z:number};
const north=[[-28,10],[-62,10],[-65,-62],[-56,-78],[56,-78],[68,-65],[68,6],[57,14],[30,14],[24,18],[8,18],[8,12]];
export const CITY_OUTLINE=[...north,[-13,12],[-13,23],[-28,23]].map(([x,z])=>({x,z}));
export const CITY_SHORELINE=[...north,[6.5,12],[6.5,29.5],[3.5,29.5],[3.5,12],[-2.5,12],[-2.5,29.5],[-5.5,29.5],[-5.5,12],[-10.5,12],[-10.5,29.5],[-13.5,29.5],[-13.5,23],[-28,23]].map(([x,z])=>({x,z}));
export const DISTRICT_BUILDINGS=[
 ...[-52,-36].flatMap((x,i)=>[-57,-39,-19].map((z,j)=>({x,z,w:i?9:11,d:j===2?9:11,h:5+(i+j)%3*1.8,style:(i+j)%3}))),
 ...[40,57].flatMap((x,i)=>[-64,-44,-24].map((z,j)=>({x,z,w:10,d:12,h:5.5+(i+j)%3*1.6,style:(i+j+1)%3}))),
 ...[-40,-23,25,43].map((x,i)=>({x,z:-71,w:11,d:8,h:5+i%2*2,style:i%3})),
];
export const CITY_COLUMNS=[...[-19,19].flatMap(x=>[-36,-42,-48,-54,-60,-66].map(z=>({x,z}))),...[-13,-7,0,7,13].map(x=>({x,z:-69}))];
export const CITY_TREES=[...[-10,10].flatMap(x=>[-43,-59].flatMap(z=>[-3,3].map(dx=>({x:x+dx,z,scale:1})))),...([[-59,4],[-43,5],[-30,-27],[31,-8],[63,-5],[62,-73],[-59,-70]] as const).map(([x,z])=>({x,z,scale:1.2}))];
export const DISTRICT_BLOCKERS:readonly (readonly [number,number,number,number])[]=[
 ...DISTRICT_BUILDINGS.map(b=>[b.x-b.w/2-.4,b.x+b.w/2+.4,b.z-b.d/2-.4,b.z+b.d/2+.4] as const),
  ...CITY_COLUMNS.map(p=>[p.x-.65,p.x+.65,p.z-.65,p.z+.65] as const),
 ...CITY_TREES.map(p=>[p.x-.32*p.scale,p.x+.32*p.scale,p.z-.32*p.scale,p.z+.32*p.scale] as const),
 ...DISTRICT_BUILDINGS.filter(b=>b.style===2).flatMap(b=>[-1,1].map(side=>[b.x+side*b.w*.33-.1,b.x+side*b.w*.33+.1,b.z+b.d/2+2.15,b.z+b.d/2+2.35] as const)),
 ...Array.from({length:10},(_,i)=>{const x=34+i*3;return [x-1.4,x+1.4,9.65,10.35] as const;}),
 ...Array.from({length:11},(_,i)=>{const x=-59+i*3;return [x-1.35,x+1.35,8.425,8.975] as const;}),
 [-2.4,2.4,-54.4,-49.6], // Garden fountain; paths pass on either side.
 ...[-11,11].flatMap(x=>[-42,-61].map(z=>[x-2,x+2,z-.6,z+.6] as const)),
];
export const CITY_DESTINATIONS=[
 {name:'Working quay',point:{x:-23,z:5},yaw:-Math.PI/2},
 {name:'Market stalls',point:{x:17,z:16},yaw:Math.atan2(4,6)},
 {name:'Library forecourt',point:{x:0,z:3.8},yaw:0},
 {name:'Library reading hall',point:{x:0,z:-14},yaw:Math.PI},
 {name:'Harbor promenade',point:{x:-30,z:5},yaw:-Math.PI*.65},
 {name:'Merchant quarter',point:{x:-43,z:-28},yaw:0},
 {name:'Scholars’ garden',point:{x:0,z:-40},yaw:0},
 {name:'Shaded colonnade',point:{x:15,z:-52},yaw:Math.PI*.5},
 {name:'Eastern waterfront',point:{x:56,z:5},yaw:-Math.PI*.35},
] as const;
