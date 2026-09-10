# Model production and verification

September 10, 2026. Original assets authored with Blender 4.5.0. This records asset work; it does not certify product or classroom readiness.

## Checkpoint 1 — market objects

Delivered painted amphora, lidded storage jar, glazed bowl, and striped market stall. Editable source and studio preview are in `assets/blender/props/`; GLBs are in `public/models/props/`. Each asset has an inspect anchor. The stall has modeled planks, pegs, braces, lashings, fabric stripes, and scalloped edges; pottery has modeled rims/handles and decorative bands.

Inspected the Blender preview and corrected its initial cropped canopy framing. The four exports total 728,916 bytes and 18,568 triangles, using one or two material primitives per model. The existing landmarks plus this kit total 5,288,128 bytes.

`node scripts/check-models.mjs --write` passed for all four exports with the actual Three.js GLTFLoader. Checks cover manifest checksums/byte counts, finite exact bounds, ground origin, anchors, vertex colors, material/geometry budgets, and absence of remote buffers, images, and studio cameras. Machine-readable results are in `assets/model-metrics.json`.

All geometry and surface colors are original and MIT licensed. The source model uses editable named components consolidated by surface material for export. These are stylized interpretive props, not historical evidence. The scroll/letter reader and runtime source bindings remain application-owned.

## Verification limits

No browser performance, touch hardware, two-student rehearsal, or live lesson acceptance is claimed by these offline export/render checks. Asset integration must preserve source access, conversations, and student state. Per-asset anchors use `<asset-id>__Anchor_Inspect`, `__Anchor_Talk`, and `__Anchor_Label`; the manifest records the exact names to avoid Blender name collisions.
