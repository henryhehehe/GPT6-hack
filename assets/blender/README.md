# Authored landmark assets

The scene now also includes an original **48-model Alexandria scenery collection**. See [the model catalog](../../docs/ALEXANDRIA-MODELS.md), [its studio preview](alexandria-contact-sheet.png), and `alexandria-kit.blend`. The additional 20 models have source `alexandria-details.blend` and preview `alexandria-details-contact-sheet.png`. Individual exports and runtime bundles live in `public/models/alexandria/` and `public/models/alexandria-details/`.

The library complex and coastal lighthouse are original Blender models made for Counterfactual Worlds. They are interpretive Hellenistic settings, not verified replicas of the ancient Library of Alexandria or Pharos. Architecture is visual context; evidence cards retain their independent source labels.

## Files

- `landmarks.blend`: editable source scene.
- `landmarks-preview.png`: inspected Blender studio render of both assets.
- `../../scripts/blender/build_landmarks.py`: deterministic Blender generation/export script.
- `../../public/models/library.glb` and `lighthouse.glb`: runtime assets, loaded by Three.js.

The library includes colonnades, roof tiles, masonry and separately named archive doors. The runtime retains the lightweight procedural scene until each detailed model loads, so asset failure does not prevent the lesson. The doors animate from application progression; the model does not decide a student's result.

Materials use glTF-compatible surface properties. No remote model downloads, proprietary geometry, or generated architectural claims are introduced. These project-authored assets use the repository's MIT license.

## Coordinate contract

Blender uses Z up; export uses glTF Y up. The facade points toward Blender -Y / Three.js +Z. Origins sit at ground level. The library is placed at Three.js `(0, 2.9, -13)`; the lighthouse at `(-24, 1, 16)`. `ArchiveDoorLeft` and `ArchiveDoorRight` retain hinge origins and separate node names for opening animation.

Asset renders verify the geometry independently of the web application. They do not establish browser frame rate or full UI visual QA.

Measured exports: library 3,681,036 bytes / 56,418 triangles / 22 mesh primitives; lighthouse 878,176 bytes / 14,396 triangles / 6 mesh primitives. Total: 4,559,212 bytes and 70,814 triangles. Exact vertex bounds place the library at 27 × 11.18 × 16.2 and lighthouse at 5.8 × 15.26 × 5.8 in Three.js coordinates.

## Regenerate

Using Blender 4.5, run from the repository root (replace `blender` with your installed Blender executable if needed):

```sh
blender --background --factory-startup --python scripts/blender/build_landmarks.py -- /tmp/counterworld-landmarks
```

Review `/tmp/counterworld-landmarks/library.png`, then copy its two GLB files into `public/models/` and its `landmarks.blend` into this directory. Run `node scripts/check-landmarks.mjs` to validate asset budgets, orientation, and the animated door nodes. Export generation is offline; no Astra request is needed to load or animate these assets.
