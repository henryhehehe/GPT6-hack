import * as THREE from 'three';
import type {WorldTheme} from '@/lib/worldThemes';
import {themeLayout} from './themeLayouts';
import {surfaceUnionGeometry,type SurfaceRectangle} from './surfaceUnion';

export type ArchitectureBounds=readonly[number,number,number,number];

/** Cutaway architecture: visible walls and planting use the same footprints as walking. */
export function addThemeArchitecture(scene:THREE.Scene,theme:WorldTheme,includeTrees=true){
  const layout=themeLayout(theme),root=new THREE.Group();root.name=`Architecture: ${layout.kind}`;scene.add(root);
  const materials=new Set<THREE.Material>(),geometries=new Set<THREE.BufferGeometry>(),obstacles:ArchitectureBounds[]=[];
  const material=(color:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.9});materials.add(m);return m;};
  const stone=material(theme.stone),wall=material(theme.building),wood=material(theme.roof),ground=material(theme.ground),leaf=material(theme.foliage),trim=material('#d9cdb6');
  const brick=material(theme.id==='douglass-literacy'?'#806252':'#884d3b');
  const cube=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,14,8),cylinder=new THREE.CylinderGeometry(1,1,1,24);[cube,sphere,cylinder].forEach(g=>geometries.add(g));
  function shape(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,w:number,h:number,d:number){
    const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
  }
  function box(m:THREE.Material,x:number,y:number,z:number,w:number,h:number,d:number,solid=false){
    const mesh=shape(cube,m,x,y,z,w,h,d);if(solid)obstacles.push([x-w/2,x+w/2,z-d/2,z+d/2]);return mesh;
  }
  function tree(x:number,z:number,height=6,bare=false){
    if(!includeTrees)return;
    box(wood,x,height/2,z,.35,height,.35,true);
    if(!bare)shape(sphere,leaf,x,height,z,2.4,2.2,2.4);
    else for(const sign of [-1,1]){const branch=box(wood,x+sign*.6,height*.75,z,.15,height*.55,.15);branch.rotation.z=-sign*.5;}
  }
  function windows(x:number,z:number,count:number,spacing:number,y=4){
    for(let i=0;i<count;i++){
      const dx=x+(i-(count-1)/2)*spacing;
      box(trim,dx,y,z,1.7,2.7,.15);box(wood,dx,y,z+.1,1.4,2.4,.08);
      const glow=new THREE.MeshStandardMaterial({color:theme.night?'#ffcf7e':'#88a6ac',emissive:theme.night?'#ffbd60':'#88a6ac',emissiveIntensity:theme.night?.5:.12,roughness:.4});materials.add(glow);
      box(glow,dx,y,z+.16,1.2,2.2,.06);box(trim,dx,y,z+.21,.07,2.2,.03);box(trim,dx,y,z+.21,1.2,.07,.03);
    }
  }
  const interior=['study','assembly','meeting'].includes(layout.kind);
  // Inland worlds extend into a landscape; only the two island works have a waterline.
  if(layout.kind==='cove'||layout.kind==='island'){
    const outline=new THREE.Shape();
    for(let i=0;i<32;i++){
      const angle=i/32*Math.PI*2,radius=28+(layout.kind==='cove'?1.7*Math.sin(angle*3)+.7*Math.cos(angle*5):2.2*Math.abs(Math.sin(angle*4)));
      const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
      if(i===0)outline.moveTo(x,z);else outline.lineTo(x,z);
    }
    outline.closePath();const terrain=new THREE.ExtrudeGeometry(outline,{depth:2,bevelEnabled:false});geometries.add(terrain);
    const land=shape(terrain,ground,0,0,0,1,1,1);land.rotation.x=Math.PI/2;
    const water=material(theme.water);box(water,0,-2.65,0,260,.1,260);
  }else if(interior){
    // The indoor floor owns its footprint. Terrain ends at its edge instead of
    // sharing exactly the same y=0 surface under the entire wooden floor.
    for(const [x,z,w,d] of [[0,-54.25,180,71.5],[0,53.25,180,73.5],[-54.75,-1,70.5,35],[54.75,-1,70.5,35]])box(ground,x,-.3,z,w,.6,d);
  }else box(ground,0,-.3,0,180,.6,180);

  if(interior){
    box(wood,0,-.08,-1,39,.16,35);
    // Exposed front and sides give the overview a dollhouse silhouette without hiding sources.
    box(wall,0,4,-18.5,40,8,.65,true);
    for(const x of [-19.5,19.5])box(wall,x,2,-1,.65,4,35,true);
    windows(0,-18.1,layout.kind==='study'?5:7,4.5);
    // Board joints come from the floor material, not thin shadow-casting strips.
    box(trim,0,7.8,-18.05,40,.3,.3);
  }
  if(layout.kind==='study'){
    // Tall book bays and a projecting chimney distinguish the study from the civic hall.
    for(const x of [-16,16]){
      box(wood,x,3.5,-10,3,7,3,true);
      for(let y=1;y<=6;y+=1.1){box(trim,x,y,-8.4,3,.1,.25);for(let j=0;j<6;j++)box(j%2?wall:brick,x-1.2+j*.46,y+.4,-8.6,.32,.65,.6);}
    }
    box(stone,0,4.5,-17,4,9,2,true);box(wood,0,1.8,-15.94,2.8,2.8,.05);
  }else if(layout.kind==='assembly'){
    for(const x of [-17,17])for(const z of [-12,-3,9]){
      box(trim,x,3.4,z,.55,6.8,.55,true);box(trim,x,6.8,z,1,.2,1);
    }
    // Long green document tables are supplied separately from the paper source stations.
    for(const x of [-7,7])box(leaf,x,.04,-6,6,.03,4);
    box(brick,0,6.5,-18.05,3,1.6,.1);
  }else if(layout.kind==='meeting'){
    // A broad aisle and grouped benches face the back wall, not three garden gazebos.
    for(const x of [-6,6])for(const z of [-3,1,5,11]){
      box(wood,x,.65,z,5,.22,.8,true);for(const dx of [-2,2])box(wood,x+dx,.3,z,.18,.6,.5);
    }
    box(trim,0,6.7,-18.1,8,.3,.2);
  }else if(layout.kind==='garden'){
    box(wall,0,1.6,-23,46,3.2,.6,true);
    for(const x of [-22,22])box(wall,x,1.2,0,.6,2.4,45,true);
    for(const [x,z,w,d] of [[0,-5,7,3],[9,13,7,4],[-13,-3,5,3]]){
      box(stone,x,.2,z,w+.5,.4,d+.5,true);box(leaf,x,.65,z,w,.8,d);
    }
    for(const [x,z] of [[-18,15],[18,15],[-18,-17],[18,-17]])tree(x,z,7);
    // One estate facade, with a central portico, replaces the identical village houses.
    box(wall,0,6,-31,30,12,8);box(wood,0,12.2,-31,32,.7,10);windows(0,-26.9,7,4,7);
    for(const x of [-4,4])box(trim,x,4,-24.8,.6,8,.6);
    box(trim,0,8.2,-24.8,10,.4,3);
  }else if(layout.kind==='ruin'){
    box(stone,0,.03,-4,37,.06,33);
    for(const x of [-19,19]){
      box(wall,x,2,-5,1.4,4,30,true);
      shape(cylinder,wall,x,5,-19,3,10,3);obstacles.push([x-3,x+3,-22,-16]);
      for(let i=0;i<6;i++){const a=i*Math.PI/3;box(wall,x+Math.cos(a)*2.4,10.5,-19+Math.sin(a)*2.4,1,1.2,1);}
    }
    box(wall,0,3,-20,32,6,1.4,true);
    for(let x=-14;x<=14;x+=4)box(wall,x,6.6,-20,2,1.3,1.5);
    for(const [x,z] of [[-21,14],[20,14],[0,-25]])tree(x,z,5,true);
  }else if(layout.kind==='street'){
    box(stone,0,.025,0,9,.05,80);
    for(const x of [-1,1]){
      box(trim,x*8,.025,0,6,.05,70);
      for(let i=0;i<5;i++){
        const z=-25+i*12;box(brick,x*21,5,z,9,10,10,true);
        box(trim,x*21,10.2,z,10,.5,11);box(wood,x*23,11,z,1.2,2,1.2);
        // Street-facing window rows use turned groups to face the central lane.
        const start=root.children.length;windows(0,0,2,3.5,5);
        const facade=new THREE.Group();for(const child of root.children.slice(start))facade.attach(child);
        facade.rotation.y=x>0?-Math.PI/2:Math.PI/2;facade.position.set(x*16.4,0,z);root.add(facade);
      }
    }
    for(const x of [-5,5])for(const z of [-17,16]){
      box(wood,x,2,z,.18,4,.18,true);box(trim,x,4.1,z,.65,.8,.65);
    }
  }else if(layout.kind==='courtyard'){
    box(brick,0,.025,0,36,.05,39);
    box(wall,0,4,-22,39,8,3,true);windows(0,-20.4,8,4.5);
    for(const x of [-21,21]){
      box(brick,x,3,-3,3,6,36,true);
      for(let z=-15;z<=10;z+=5)box(trim,x*.93,3,z,.2,2.3,1.5);
    }
    box(stone,7,.2,13,7,.4,4,true);box(leaf,7,.6,13,6.5,.8,3.5);tree(8,13,7);
  }else if(layout.kind==='cove'){
    // Detailed authored rock and cave GLBs provide the nearby geology.
  }else if(layout.kind==='island'){
    // Scanned rock shelves provide the windward edge; no Cyclops cave in this work.
  }

  // Continuous walks connect activities; readers stand on the existing scene floor.
  const paths:SurfaceRectangle[]=[];
  for(const route of layout.paths??[])for(let i=1;i<route.length;i++){
    const a=route[i-1],b=route[i],dx=b.x-a.x,dz=b.z-a.z;
    paths.push({x:(a.x+b.x)/2,z:(a.z+b.z)/2,width:1.8,depth:Math.hypot(dx,dz)+.2,turn:Math.atan2(dx,dz)});
  }
  if(paths.length){const geometry=surfaceUnionGeometry(paths,.05);geometries.add(geometry);const path=shape(geometry,stone,0,0,0,1,1,1);path.name='Joined reading paths';path.castShadow=false;}
  return {root,obstacles,dispose(){root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
