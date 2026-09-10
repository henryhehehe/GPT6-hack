# Model production and verification

September 10, 2026. Original assets authored with Blender 4.5.0. This records asset work; it does not certify product or classroom readiness.

## Checkpoint 1 — market objects

Delivered painted amphora, lidded storage jar, glazed bowl, and striped market stall. Editable source and studio preview are in `assets/blender/props/`; GLBs are in `public/models/props/`. Each asset has an inspect anchor. The stall has modeled planks, pegs, braces, lashings, fabric stripes, and scalloped edges; pottery has modeled rims/handles and decorative bands.

Inspected the Blender preview and corrected its initial cropped canopy framing. The four exports total 728,916 bytes and 18,568 triangles, using one or two material primitives per model. The existing landmarks plus this kit total 5,288,128 bytes.

`node scripts/check-models.mjs --write` passed for all four exports with the actual Three.js GLTFLoader. Checks cover manifest checksums/byte counts, finite exact bounds, ground origin, anchors, vertex colors, material/geometry budgets, and absence of remote buffers, images, and studio cameras. Machine-readable results are in `assets/model-metrics.json`.

All geometry and surface colors are original and MIT licensed. The source model uses editable named components consolidated by surface material for export. These are stylized interpretive props, not historical evidence. The scroll/letter reader and runtime source bindings remain application-owned.

## Checkpoint 2 — teaching characters

Delivered Thaleia, Dorian, and Ione with distinct garments/accessories and a shared 17-bone skeleton. Each GLB includes `Idle`, `Greeting`, and `Talk` clips and talk/label anchors. The cast totals 1,936,364 bytes and 38,740 triangles; individual characters use three material primitives and 11,664–14,300 triangles.

Inspected front, back, and mid-greeting studio renders. Fixed garment/belt intersections, open neckline gaps, and the initial segmented beard. Gesture poses keep feet planted and Ione's scroll attached. Animation remains deliberately modest, without facial animation or lip sync.

The GLTFLoader checker passed all seven delivered assets. It additionally verifies skin weights sum to one, each rig contains the expected minimum bone count, all advertised clips exist and contain actual motion, and sampled animated bounds remain finite and bounded. The market/cast payload plus existing landmarks is 7,224,492 bytes. Browser playtesting remains separate.

## Checkpoint 3 — cargo and archive props

Delivered slatted cargo crate, tied sack, woven basket, rope coil, rolled/open scrolls, wax tablet/stylus, reading table, and scroll rack. Source files and preview sheets are in `assets/blender/props/`. Corrected rope spacing, the sack seam, and the scroll binding after inspecting the renders. Scrolls and tablet intentionally contain no fabricated writing.

All 16 Alexandria exports pass the GLTFLoader checks. Exact current sizes and geometry counts are recorded in `assets/model-metrics.json`; the complete kit remains below 4 MB, and below 8.5 MB together with the original two landmarks. This is a download-size result, not a frame-rate measurement.

## Checkpoint 4 — Odyssey scenery models

Delivered a coastal rock cluster, open-ended cave shell, merchant ship with sail/rigging/deck/steering oar, and a static sheep. Inspected the studio sheet; refined the cave from a uniform tunnel to a faceted rock shell with angular outcrops. The cave has named entrance/exit anchors and an open central passage. These are editable scene modules, not a completed traversable Odyssey lesson or an identified historical vessel/location.

All 20 exports pass the loader checks; their combined payload is 4,603,320 bytes, or 9,162,532 bytes with the existing landmarks. The original Alexandria pottery can be reused without another download. The ship has no sailing animation; the sheep is a static prop.

## Checkpoint 5 — Austen objects

Delivered a folded/sealed letter, open letter, quill/inkwell, upholstered chair, writing desk, garden bench, sash window frame, and paneled doorway. Inspected the studio sheet and validated all 28 exports. The doorway keeps a separate vertical hinge and movable leaf; the checker verifies its swing. Window openings are unglazed; there is no hidden room or photographic scene inside them.

These are period-inspired original furnishings, not objects authenticated by Austen's text or a reproduction of a film set. Blank paper opens the lesson's own source reader when integrated. Elizabeth/Darcy characters, source review, spoiler boundaries, and a playable literature room are not supplied by this model collection.

## Checkpoint 6 — room and garden modules

Delivered a paneled wall and garden paving module with separate edging stones. Both have editable source and an inspected studio preview. All 30 models pass export checks. These modules supply scenery only: native room/garden traversal and source-station placement still require scene integration.

## Checkpoint 7 — background population

Delivered four static background figures in ochre, teal, indigo, and rose, derived from the original cast geometry and reduced to the background budget. Each uses a single material primitive and fewer than 3,000 triangles, with no dialogue or animation contract. Removed thin hem decoration after the first decimated render exposed intersection artifacts. The final preview was inspected at the intended group-view scale.

All 34 assets pass validation, including the stricter 3,000-triangle background limit and existence of each editable source file. Background figures are intended for distant placement; use the hero models at conversation distance.

## Final asset handoff — local viewer

The delivered inventory contains **34 models: 27 props/scenery pieces, three rigged teaching characters, and four static background variants**. Runtime GLBs total **6,378,088 bytes**. Together with the unchanged library/lighthouse, the combined archive is **10,937,300 bytes**; runtime lessons should still load only their own required kits.

The local model viewer was exercised in the Codex in-app browser at 1280 × 720. Selected all 34 model buttons and verified each reached its own loaded state with rendered geometry metrics. Visually inspected the rendered Thaleia GLB and greeting animation, plus the market stall; the full collection also has inspected Blender studio sheets. Returning to a static pose and switching between animated and static models worked. Browser error logs were empty after this pass. Fixed an initial viewer-height overflow before the final inventory pass.

Final checks: all 34 exports pass `check-models.mjs`, both existing landmark models pass `check-landmarks.mjs`, and the six Python authoring/QA scripts plus viewer/server JavaScript pass syntax checks. The wall/path preview was reframed to keep both complete models visible. The handoff index is `assets/MODEL-KIT.md`; editable sources, GLBs, inventory, metrics, repeatable scripts, and previews are committed in separate checkpoints.

No classroom renderer or learning-state code was edited by this asset-production task. Another set of scene changes exists in the shared checkout; the integration handoff explicitly preserves that owner's work. No site deployment, app build, live-model call, or learning-outcome claim is part of this delivery.

## Verification limits

No browser performance, touch hardware, two-student rehearsal, or live lesson acceptance is claimed by these offline export/render checks. Asset integration must preserve source access, conversations, and student state. Per-asset anchors use `<asset-id>__Anchor_Inspect`, `__Anchor_Talk`, and `__Anchor_Label`; the manifest records the exact names to avoid Blender name collisions.
