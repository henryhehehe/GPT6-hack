import * as THREE from 'three';

// Keep the island cap, ground finish and paving physically separated. The old
// bevel cap reached the plaza height and produced camera-dependent striping.
export const CITY_SURFACE_Y = { island: .84, ground: .9, paving: .95 } as const;
export const CITY_PAVING = [
  [0, 0, 27, 7], [1, 0, 5, 34],
  [0, -28, 53, 5], [-27, -37, 5, 65], [28, -38, 5, 66],
  [-43, 3, 37, 5], [48, 3, 37, 5],
  [0, -34, 36, 4], [0, -66, 36, 4], [0, -49, 5, 34],
] as const;

/** One upward-facing surface per occupied cell, including street junctions. */
export function createCityPavingGeometry() {
  const rectangles = CITY_PAVING.map(([x, z, w, d]) => [x-w/2, x+w/2, z-d/2, z+d/2]);
  const xs = [...new Set(rectangles.flatMap(r => [r[0], r[1]]))].sort((a,b) => a-b);
  const zs = [...new Set(rectangles.flatMap(r => [r[2], r[3]]))].sort((a,b) => a-b);
  const positions: number[] = [], indices: number[] = [];
  for (const z of zs) for (const x of xs) positions.push(x, CITY_SURFACE_Y.paving, z);
  for (let row=0; row<zs.length-1; row++) for (let col=0; col<xs.length-1; col++) {
    const x=(xs[col]+xs[col+1])/2, z=(zs[row]+zs[row+1])/2;
    if (!rectangles.some(([x0,x1,z0,z1]) => x>x0 && x<x1 && z>z0 && z<z1)) continue;
    const a=row*xs.length+col, b=a+1, c=a+xs.length, d=c+1;
    indices.push(a,c,b,b,c,d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
