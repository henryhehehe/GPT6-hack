# Acquisition and sample QA

Inspected September 10, 2026 with Blender 4.5.0 and the offline acquisition checker. This is a storage/preparation handoff, **not** approval to ship the assets in the learning scenes.

## Verified

- Four publisher ZIPs passed CRC checks. Their SHA-256 values and complete member inventories are retained. All four Poly Haven model packages matched publisher MD5 and byte lengths.
- The 69 selected source assets resolve their local buffers and textures. Dependency aliases for two misnamed character texture files are documented. Some original Kenney GLBs require an external colormap; that file is retained.
- Twelve prepared GLBs exported, re-imported and rendered in Blender. Each is self-contained; all twelve are below 5,000,000 bytes individually. Their combined size is **12,643,084 bytes** in this reviewed preparation. Exact per-file values and checksums are in [metrics.json](metrics.json).
- Prepared Coast Rocks: **12,000 triangles**, compared with **679,936** in the downloaded source scene. Prepared Wicker Basket: **3,998 triangles**, compared with **17,850** originally. Decimation is recorded; the full originals remain available.
- Character samples retain one skin each, three materials, and **15,060 / 14,318 triangles** for female/male respectively. The female is slightly above the proposed 15,000-triangle hero target. Each body GLB is below 2 MB after texture preparation. These are unanimated bases; the separate library must be retargeted.
- Animation-library inventory has **43 named clips per variant**, including `A_TPose`. `Idle_Talking_Loop`, `Sitting_Talking_Loop`, `Idle_Loop`, `Interact`, `Walk_Loop` and `Walk_Formal_Loop` are present. Root-motion and in-place files are retained separately.

The complete acquisition library uses approximately **442 MB of local storage**, dominated by untouched original archives and shared high-resolution source textures. This has no effect on the application's download size because the assets are outside `public/` and are not imported by the app.

## Visual observations

The [contact sheet](previews/contact-sheet.jpg) shows renders made from the saved prepared GLBs, not publisher thumbnails. Tiles are fitted independently; apparent on-sheet size must not be used to infer world scale. Character framing excludes Blender's invisible custom bone display shapes.

| Sample | Observation and decision |
| --- | --- |
| Pottery, scroll, market stall | Warm, readable materials and useful close-range forms. Strongest first comparison against the existing authored market assets. The scroll's ornamental band is illustrative, not readable source text. Fantasy detailing still needs art-direction review. |
| Basket | Woven texture and separate lid remain recognizable after simplification. It is a comparatively expensive small prop (about 2.74 MB); use sparingly or reduce textures further for repeated market instances. |
| Table and chair | Clear wooden silhouettes and surface texture. Suitable generic reading props; no verified Regency provenance. |
| Planter | Surface wear remains visible at this preview size. Suitable garden dressing; it does not replace Greek pottery. |
| Rowboat and economical rocks | Very low geometry cost, but visibly simpler and more angular than the textured props. Useful fallback/background components rather than automatic hero replacements. |
| Coastal rocks | Reduced scan preserves broad shoreline shape and surface texture in this view. It is a terrain patch, not a cave interior. Close walking-camera inspection, boundaries and collision must be authored separately. |
| Character bases | Body and face materials render; these are muscular base figures in minimal clothing. They require welcoming character styling, appropriate garments/hair and identity review. They are not finished Dorian, Thaleia or Ione assets. |

Observed renders showed no pink missing-texture placeholders or grossly broken surfaces from the inspected view. This does not establish back-face quality, animation deformation, scale consistency across assets, or appearance in the actual application lighting.

## Runtime gates still open

Do not load all twelve examples automatically: their 12.64 MB plus the existing 4.56 MB landmarks already exceeds the proposed 15 MB initial lesson budget. Select a small kit and reuse common resources.

Pending: actual Three.js textured rendering, camera/ground-origin normalization, period/style review, all-side inspection, character clothing and animation binding, walking collision, picking/source anchors, fallback behavior, reduced-motion behavior, and frame time/draw-call/texture-memory measurements on the demo device. None of these is marked passed by a studio render.

No application behavior changed, so application unit tests, paid Astra calls and deployment were not needed for this acquisition. The reproducible integrity command is:

```sh
python3 scripts/check-external-models.py
```

To regenerate the inventory/contact sheet after reviewed derivative changes, update the integrity baseline first and then run `python3 scripts/report-external-models.py` (Pillow required). Do not refresh the baseline merely to suppress a checksum failure.
