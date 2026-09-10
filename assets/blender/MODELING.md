# Object and character production

Original interpretive assets for Counterfactual Worlds. These models are visual teaching settings, not authenticated historical objects or portraits. They use the repository MIT license; no third-party geometry or textures are included.

## Folder layout

- `props/`: editable Blender source and studio previews for market, cargo, and writing objects.
- `characters/`: editable Blender source and studio previews for the three teaching characters.
- `../../../public/models/props/` and `../../../public/models/characters/`: runtime GLBs (from a pack subfolder).
- `../../model-manifest.json`: asset IDs, metadata, bounds, anchors, and measured export sizes.
- `../../../scripts/blender/`: repeatable modeling/export scripts (from a pack subfolder).

## Contract

Blender Z-up exports to glTF Y-up; fronts face Blender -Y / glTF +Z. Dimensions use a one-unit-to-one-meter working convention. Every model has a ground-level root, named interaction/label anchors when applicable, and separate visible geometry. Runtime source IDs and dialogue state remain application-owned.

Targets: under 5 MB per object, under 2 MB per hero character, and under 15 MB for the initial Alexandria asset payload including the existing library/lighthouse. Materials use glTF-compatible surface properties. The existing landmark files and archive-door hinge contract are preserved.

The implementation follows [the work plan](../../docs/OBJECT-AND-CHARACTER-MODELING-PLAN.md). Production measurements and actual verification will be recorded in [MODEL-QA](../../docs/MODEL-QA.md). A studio render is not a browser performance test.
