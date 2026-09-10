# External model integration

September 10, 2026. The acquired CC0 library now has **69 self-contained local GLBs**, a searchable **`/model-catalog`** route, and a [detailed usage guide for every item](../assets/external/USAGE-GUIDE.md). **17 distinct external models appear in 37 placements** across Alexandria and the generated coast, garden and archive settings.

The catalog provides an actual GLB preview, optional animation playback, downloads, original source links, creators/licenses, measured geometry/file sizes, dimensions, readiness, placement and collision instructions, animation/retargeting notes, current coordinates, code examples and preparation history. It loads one selected model at a time. Model preview does not automatically play animations.

## What appears in lessons

| Setting | External additions | Placements | Unique GLB transfer |
| --- | --- | ---: | ---: |
| Alexandria | Scroll, pouch, two pottery forms, bag, quay rope and paddle | 7 | 1,026,416 bytes |
| Coast | Ground pottery and buckets, tabletop pouches, offshore rocks and rowboats | 14 | 3,514,904 bytes |
| Garden | Desktop candles, clay planters, wicker baskets and a produce crate | 10 | 974,852 bytes |
| Archive | Desktop candles and pottery beside the reading stations | 6 | 408,292 bytes |

These are external additions only, deduplicated per scene. They exclude authored models, JavaScript, metadata and decoded textures/GPU allocations. The full published library is 30,054,608 bytes; its static subset is 11,194,272 bytes. The two animation reference GLBs account for most of the remaining transfer and are never requested by a classroom scene.

The authored furniture, scrolls, letters, teaching characters, landmarks, cave, sheep and ships remain in place. External props supplement those objects. Coordinates account for the actual inset writing surface rather than the desk's higher back gallery. Tabletop overlaps found during review were removed; new coast vessels stand beside the station rather than intersecting its scroll.

Classroom loading only accepts `scene-eligible` IDs from a local generated index. Eight assemblies or context-sensitive pieces and twelve character/accessory/animation references remain blocked. Forty-nine objects are eligible for reviewed placement, of which seventeen are currently used. Eligibility is not a claim of historical authenticity or device performance.

## Runtime behavior

- `components/worlds/scene/externalLayout.ts` owns explicit placements. Lesson-generated text cannot specify arbitrary models or remote URLs.
- `externalModels.ts` owns a scene-local cache with at most three requests in flight. Repeated objects share their static geometry and materials. Failed requests keep bounded box fallbacks.
- Source-station tags use the existing `onSelect` callback. Props never collect evidence, award credit or manufacture historical facts. Characters keep their existing talk callbacks.
- Solid ground additions join the existing generated-setting navigation, including the same blockers while models load or fail. Small tabletop objects inherit their furniture's blocker. Alexandria additions sit on existing furniture or quay edges; future ground obstacles need its separate navigation registry updated.
- Cleanup removes the external root and releases unique geometry, materials, textures and decoded ImageBitmaps. Queued loads resolve to null on teardown; late completions release resources instead of appearing in a disposed scene.
- Each scene includes a compact art-credit notice separating illustrative art from primary evidence.

## Stored records and reproduction

- [Acquisition and individual usage records](../assets/external/catalog.json): creator/source/license evidence, original paths, ZIP fingerprints, source dependencies and adaptations.
- [Published catalog](../assets/external/runtime-catalog.json): stable IDs, local URLs, dimensions, measured bytes/geometry, clips, preparation and SHA-256. A public copy supports the catalog route.
- [Actual placements](../assets/external/placements.json) and [scene payloads](../assets/external/scene-budgets.json): generated from application placement code.
- [Per-item usage guide](../assets/external/USAGE-GUIDE.md): every item, including those held for future reuse.
- [Original acquisition QA](../assets/external/MODEL-QA.md): source preservation and twelve original sample renders; these are separate from the newer normalized runtime exports.

```sh
# Re-export intentional derivative changes from retained sources (Blender 4.5).
blender --background --factory-startup --python scripts/blender/export_external_library.py

# Verify outputs and regenerate public metadata, runtime index and all item instructions.
node --import tsx scripts/catalog-external-models.ts

# Test cache lifecycle, selection restrictions, payload bounds and reachable stations.
node --import tsx --test tests/externalModels.test.ts

# Optional combined studio study of authored and external station props.
node --import tsx scripts/export-setting-layout.mjs
blender --background --factory-startup --python scripts/blender/render_external_integration.py
```

The exporter records new hashes; the catalog generator rejects unexpected byte changes. Public static exports use a centered, grounded meter contract and inspection/label anchors. Original rigged files retain canonical transforms; both animation GLBs are exact source copies. Retargeting, independent skeleton cloning, historical costume and classroom character acceptance remain future adaptation work.

## Verification and limits

All 69 published GLBs passed checksum/length, embedded-dependency and real Three.js geometry parsing checks. Static files also matched their recorded dimensions, grounded/centered origins and required anchors. Geometry parsing omits browser image decoding; it does not claim a complete Khronos validator or pixel-level texture QA for every asset.

Eight targeted external-model tests pass, covering deduplication, concurrency, failure continuation, disposal, late completions, readiness restrictions, accidental skinned results, payload limits and clear station spawns/approaches. The full current project suite passed 80 tests, TypeScript checking passed, and the Sites production build passed with the `/model-catalog` route. The build reports the existing large-chunk advisory; it is not a runtime performance measurement.

The combined Blender cutaway below was rendered and inspected using actual application placements and GLBs. It confirms representative station texture loading and relative placement. Roofs and front columns are omitted for visibility. It is **an offline studio render, not a browser screenshot**; it does not show every Alexandria/offshore addition. Browser interaction, device frame times and draw calls have not been measured in this task. Deployment remains with the coordinating application release.

![Combined authored and external station models](../assets/external/previews/integrated-stations.png)
