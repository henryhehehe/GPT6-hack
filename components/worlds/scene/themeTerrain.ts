import * as THREE from 'three';
import type {WorldTheme} from '@/lib/worldThemes';

const smooth=(a:number,b:number,x:number)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
/** An irregular distant landform, deliberately outside every walkable layout. */
export function createDistantTerrain(theme:WorldTheme){
  const highlands=theme.landscape==='highlands',coastal=theme.landscape==='shore';
  if(!highlands&&!coastal)return null;
  let seed=17;for(const c of theme.id)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
  const phase=(seed%1000)/137,angular=128,radial=40,positions:number[]=[],colors:number[]=[],indices:number[]=[];
  const earth=new THREE.Color(theme.ground).multiplyScalar(.67),rock=new THREE.Color(theme.stone).multiplyScalar(.72),color=new THREE.Color();
  for(let r=0;r<=radial;r++)for(let a=0;a<=angular;a++){
    const angle=.025*Math.PI+(a/angular)*.95*Math.PI;
    const radius=43+r/radial*119,x=Math.cos(angle)*radius,z=-Math.sin(angle)*radius;
    const flank=smooth(43,69,radius)*(1-smooth(117,162,radius));
    const peaks=.55+.22*Math.sin(angle*5+phase)+.16*Math.sin(angle*11-phase*.7)+.07*Math.cos(angle*23+phase);
    const folds=Math.sin(x*.17+Math.sin(z*.065)*2.5+phase)*Math.cos(z*.13-phase)*2.0;
    const ridges=(1-Math.abs(Math.sin(x*.09+z*.06+phase)))*3.6+Math.sin(x*.37-z*.21)*.8+Math.sin(x*.73+z*.41+phase)*.35;
    const edge=smooth(0,.10,a/angular)*(1-smooth(.90,1,a/angular));
    const y=-3+flank*edge*((highlands?27:theme.id==='tempest'?19:15)*peaks+folds+ridges);
    positions.push(x,y,z);
    const exposed=THREE.MathUtils.clamp(.2+Math.abs(Math.sin(x*.09+z*.06+phase))*.35+(y>15?.25:0),0,.85);
    color.copy(earth).lerp(rock,exposed).multiplyScalar(.86+.14*(.5+.5*Math.sin(x*.4+z*.3)));
    colors.push(color.r,color.g,color.b);
    if(r<radial&&a<angular){const i=r*(angular+1)+a;indices.push(i,i+angular+1,i+1,i+1,i+angular+1,i+angular+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();geometry.computeBoundingBox();
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0});
  const mesh=new THREE.Mesh(geometry,material);mesh.name='Distant weathered ridgeline';mesh.receiveShadow=true;mesh.castShadow=false;
  return mesh;
}
