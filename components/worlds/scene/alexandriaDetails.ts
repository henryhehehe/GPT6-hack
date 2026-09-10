import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ALEXANDRIA_DETAIL_IDS, ALEXANDRIA_DETAIL_OBSTACLES, ALEXANDRIA_DETAIL_PLACEMENTS } from './alexandriaDetailLayout';

/** Independent optional pack: failure leaves both the baseline kit and routes usable. */
export function loadAlexandriaDetails(parent: THREE.Object3D) {
  let disposed = false, ready = false, source: THREE.Group | undefined;
  const root = new THREE.Group(); root.name = 'AlexandriaEverydayDetails';
  const fallback = new THREE.Group(); fallback.name = 'AlexandriaDetailFallbacks'; parent.add(fallback);
  const fallbackMaterial = new THREE.MeshStandardMaterial({ color: '#ad9974', roughness: .92 });
  for (const { id, bounds: [x0,x1,z0,z1], height } of ALEXANDRIA_DETAIL_OBSTACLES) {
    const geometry = id === 'well' ? new THREE.CylinderGeometry(.82,.82,height,16) :
      new THREE.BoxGeometry(x1-x0, height, z1-z0);
    const mesh = new THREE.Mesh(geometry, fallbackMaterial); mesh.name = id;
    mesh.position.set((x0+x1)/2,(id === 'fishing-gear' ? .95 : 1)+height/2,(z0+z1)/2); mesh.castShadow = true; mesh.receiveShadow = true; fallback.add(mesh);
  }
  const stock: { object: THREE.Group; zone: 'harbor' | 'market' }[] = [];
  const instances: THREE.InstancedMesh[] = [];
  const disposeSource = () => {
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    source?.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return;
      geometries.add(o.geometry);
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
    });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); source = undefined;
  };
  const loaded = new GLTFLoader().loadAsync('/models/alexandria-details/alexandria-details.glb?v=3').then(gltf => {
    source = gltf.scene;
    if (disposed) { disposeSource(); return; }
    for (const id of ALEXANDRIA_DETAIL_IDS) if (!source.getObjectByName(id)) throw new Error(`Missing detail: ${id}`);
    source.traverse(o => { if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true; } });
    const batches = new Map<THREE.BufferGeometry, { mesh: THREE.Mesh; matrices: THREE.Matrix4[] }>();
    for (const p of ALEXANDRIA_DETAIL_PLACEMENTS) {
      const object = new THREE.Group(); object.name = p.id; object.add(source.getObjectByName(p.id)!.clone(true));
      object.position.set(...p.at); object.rotation.y = p.turn ?? 0; object.scale.setScalar(p.scale ?? 1);
      if (p.activity) { root.add(object); stock.push({ object, zone: p.activity }); continue; }
      object.updateMatrixWorld(true);
      object.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        const batch = batches.get(child.geometry) ?? { mesh: child, matrices: [] as THREE.Matrix4[] };
        batch.matrices.push(child.matrixWorld.clone()); batches.set(child.geometry,batch);
      });
    }
    for (const { mesh, matrices } of batches.values()) {
      const instance = new THREE.InstancedMesh(mesh.geometry,mesh.material,matrices.length);
      instance.name = mesh.name; instance.castShadow = true; instance.receiveShadow = true;
      matrices.forEach((matrix,i) => instance.setMatrixAt(i,matrix));
      instance.instanceMatrix.needsUpdate = true; instance.computeBoundingSphere(); instances.push(instance); root.add(instance);
    }
    parent.add(root); fallback.visible = false; ready = true;
  }).catch(error => {
    disposeSource(); instances.forEach(i => i.dispose());
    if (!disposed) console.warn('Alexandria detail pack unavailable; keeping scene fallbacks.',error);
  });
  return {
    loaded,
    get ready() { return ready; },
    update(blend: number, harbor: number, market: number) {
      for (const zone of ['harbor','market'] as const) {
        const objects = stock.filter(s => s.zone === zone), activity = THREE.MathUtils.clamp(zone === 'harbor' ? harbor : market,0,1);
        objects.forEach(({ object },i) => { object.visible = i/objects.length < 1-blend*(1-activity); });
      }
    },
    dispose() {
      disposed = true; parent.remove(root,fallback); instances.forEach(i => i.dispose()); disposeSource();
      fallback.traverse(o => { if (o instanceof THREE.Mesh) o.geometry.dispose(); }); fallbackMaterial.dispose();
    },
  };
}
