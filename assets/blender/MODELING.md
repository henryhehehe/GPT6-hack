# Object and character production

Original interpretive assets for Counterfactual Worlds. These models are visual teaching settings, not authenticated historical objects or portraits. They use the repository MIT license; no third-party geometry or textures are included.

## Folder layout

- `props/`: editable Blender source and studio previews for market, cargo, and writing objects.
- `characters/`: editable Blender source and studio previews for the three teaching characters.
- `../../public/models/props/` and `../../public/models/characters/`: runtime GLBs.
- `../model-manifest.json`: asset IDs, metadata, bounds, anchors, and measured export sizes.
- `../../scripts/blender/`: repeatable modeling/export scripts.

## Contract

Blender Z-up exports to glTF Y-up; fronts face Blender -Y / glTF +Z. Dimensions use a one-unit-to-one-meter working convention. Every model has a ground-level root, named interaction/label anchors when applicable, and separate visible geometry. Runtime source IDs and dialogue state remain application-owned.

Targets: under 5 MB per object, under 2 MB per hero character, and under 15 MB for the initial Alexandria asset payload including the existing library/lighthouse. Materials use glTF-compatible surface properties. The existing landmark files and archive-door hinge contract are preserved.

The implementation follows [the work plan](../../docs/OBJECT-AND-CHARACTER-MODELING-PLAN.md). Production measurements and actual verification are recorded in [MODEL-QA](../../docs/MODEL-QA.md). A studio render is not a browser performance test. [The collection index](../MODEL-KIT.md) lists every delivered pack and the scene integration contract.

## Inspect the models

From the repository root, run `node scripts/serve-model-viewer.mjs`, then open `http://127.0.0.1:5198`. The local viewer loads the actual GLBs with the installed Three.js version. Select an object, orbit/zoom, use front/side/back views, and choose a character animation. It serves only the viewer, model inventory, GLBs, and Three.js modules. No server secrets or repository browsing are exposed.

The PNG previews in each collection also work without a web server. Open a `.blend` file to edit the source scene; the gallery arrangement in Blender is for inspection, while every exported GLB has its own origin.

## Rebuild

Use Blender 4.5.0 or a compatible 4.5 release. On this machine the current executable is `/Volumes/Blender/Blender.app/Contents/MacOS/Blender`; the mounted volume must remain available. Replace `blender` below with your executable path if it is not on PATH.

```sh
blender --background --factory-startup --python scripts/blender/build_props.py -- market
blender --background --factory-startup --python scripts/blender/build_characters.py
blender --background --factory-startup --python scripts/blender/render_character_views.py
blender --background --factory-startup --python scripts/blender/build_props.py -- cargo
blender --background --factory-startup --python scripts/blender/build_props.py -- archive
blender --background --factory-startup --python scripts/blender/build_literature_props.py -- odyssey
blender --background --factory-startup --python scripts/blender/build_literature_props.py -- austen
blender --background --factory-startup --python scripts/blender/build_literature_props.py -- austen-architecture
blender --background --factory-startup --python scripts/blender/build_background_characters.py
node scripts/check-models.mjs --write
```

Run these sequentially: each export updates the shared manifest. The scripts overwrite their own named GLBs, Blender sources, and preview images. Rebuilding does not download assets, call a model API, or change a classroom. Regeneration may require unsandboxed Blender GPU initialization on macOS even for background CPU rendering.
