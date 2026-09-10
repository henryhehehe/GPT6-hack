import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {Water} from './vendor/Water.js';

/** Sky/PMREM and planar water follow the official Three.js ocean example. */
export function createHarborEnvironment(scene:THREE.Scene,renderer:THREE.WebGLRenderer){
 const sky=new Sky();sky.scale.setScalar(4000);scene.add(sky);
 const u=sky.material.uniforms;u.turbidity.value=3.8;u.rayleigh.value=1.6;u.mieCoefficient.value=.004;u.mieDirectionalG.value=.82;
 const sunDirection=new THREE.Vector3(-.62,.43,.65).normalize();u.sunPosition.value.copy(sunDirection);u.cloudCoverage.value=.22;u.cloudDensity.value=.3;
 const generator=new THREE.PMREMGenerator(renderer),skyScene=new THREE.Scene();skyScene.add(sky);
 const environment=generator.fromScene(skyScene,.035,.1,5000);scene.add(sky);scene.environment=environment.texture;scene.environmentIntensity=.06;generator.dispose();
 scene.fog=new THREE.FogExp2('#bac8c4',.0038);
 const ambient=new THREE.HemisphereLight('#d2e7f0','#8b775a',.75);scene.add(ambient);
 const sun=new THREE.DirectionalLight('#ffdfad',2.5);sun.position.copy(sunDirection).multiplyScalar(100);sun.target.position.set(0,0,-18);scene.add(sun,sun.target);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.07;sun.shadow.bias=-.00015;sun.shadow.radius=3;
 Object.assign(sun.shadow.camera,{left:-58,right:58,top:62,bottom:-62,near:1,far:230});sun.shadow.camera.updateProjectionMatrix();
 const normals=new THREE.TextureLoader().load('/textures/waternormals.jpg');normals.wrapS=normals.wrapT=THREE.RepeatWrapping;normals.anisotropy=4;
 const water=new Water(new THREE.PlaneGeometry(5000,5000),{textureWidth:512,textureHeight:512,waterNormals:normals,sunDirection,sunColor:0xffe5b9,waterColor:0x073e42,distortionScale:2.6,alpha:1,fog:true});
 const waterMaterial=water.material as THREE.ShaderMaterial;
 water.rotation.x=-Math.PI/2;water.position.y=-.12;waterMaterial.transparent=false;waterMaterial.depthWrite=true;waterMaterial.uniforms.size.value=1.5;scene.add(water);
 // Planar reflections are updated at 30fps while the main view stays at its normal rate.
 const reflect=water.onBeforeRender;let lastReflection=-1;
 water.onBeforeRender=function(...args:Parameters<typeof reflect>){waterMaterial.uniforms.eye.value.setFromMatrixPosition(args[2].matrixWorld);const now=performance.now();if(now-lastReflection<32)return;lastReflection=now;reflect.apply(this,args);};
 return {sun,update(time:number,reduced:boolean){waterMaterial.uniforms.time.value=reduced?0:time*.35;u.time.value=reduced?0:time;},dispose(){scene.remove(sky,water,ambient,sun,sun.target);scene.environment=null;environment.dispose();sky.geometry.dispose();sky.material.dispose();water.dispose();water.geometry.dispose();waterMaterial.dispose();normals.dispose();sun.shadow.map?.dispose();}};
}
