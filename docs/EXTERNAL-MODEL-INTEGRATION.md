# External model integration

September 10, 2026. The acquired CC0 library now has **69 self-contained local GLBs**, a searchable **`/model-catalog`** route, and a [detailed usage guide for every item](../assets/external/USAGE-GUIDE.md). **49 distinct external models appear in 91 placements** across Alexandria and the generated coast, garden and archive settings.

The catalog provides an actual GLB preview, optional animation playback, downloads, original source links, creators/licenses, measured geometry/file sizes, dimensions, readiness, placement and collision instructions, animation/retargeting notes, current coordinates, code examples and preparation history. It loads one selected model at a time. Model preview does not automatically play animations.

## What appears in lessons

| Setting | External additions | Placements | Unique GLB transfer |
| --- | --- | ---: | ---: |
| Alexandria | Scroll, pouch, two pottery forms, bag, quay rope and paddle | 7 | 1,026,416 bytes |
| Coast | Workbench and tools, cargo, offshore rocks/rowboats and 22 palms replacing procedural trees | 47 | 5,066,440 bytes |
| Garden | Candles, planters, baskets, produce, stalls/cart, and a tea table with seating | 19 | 3,034,500 bytes |
| Archive | Candles/pottery plus reading tables, shelving, cabinet, books, a comparison desk and chair | 18 | 2,793,756 bytes |

These are external additions only, deduplicated per scene. They exclude authored models, JavaScript, metadata and decoded textures/GPU allocations. The full published library is 30,054,608 bytes; its static subset is 11,194,272 bytes. The two animation reference GLBs account for most of the remaining transfer and are never requested by a classroom scene.

The authored furniture, scrolls, letters, teaching characters, landmarks, cave, sheep and ships remain in place. External props supplement those objects. Coordinates account for the actual inset writing surface rather than the desk's higher back gallery. Tabletop overlaps found during review were removed; new coast vessels stand beside the station rather than intersecting its scroll.

Classroom loading only accepts `scene-eligible` IDs from a local generated index. Eight assemblies or context-sensitive pieces and twelve character/accessory/animation references remain blocked. All forty-nine eligible static objects are now placed. Eight assembly/context items and twelve character/accessory/animation references remain unplaced. Eligibility is not a claim of historical authenticity or device performance.

## Expanded activity areas

The archive now has a separate reading table with books, a bookstand and candlestick, rear storage and shelving, and a comparison desk with a scroll and chair. The garden has a market display, a cart, and a tea table with a mug, plate and nearby seats. The coast has a workbench, stool, scroll, cargo and ropes; 22 Kenney palms replace the simple procedural trees. Palm blockers conservatively cover the low bent trunk rather than the full canopy.

The tea table uses uniform scale 0.5 for a 0.775 m tabletop; its collision bounds use the same scale. Supported items explicitly name their table or crate. Tests raycast those actual meshes to check surface heights and verify that items stay within their support footprints. The rope uses scale 0.65 to fit inside the crate rim.

Literary themes can filter placements: for example, the garden market/tea cluster appears in Austen and custom garden settings, rather than every document lesson. The catalog lists the four base layouts; themed lessons may use a subset.

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

Thirteen targeted external-model tests pass, covering deduplication, concurrency, failure continuation, disposal, late completions, readiness restrictions, accidental skinned results, payload limits, clear station spawns/approaches, connected activity areas, support surfaces, low palm trunks, scaled footprints and complete use of all eligible models. The previous integration checkpoint passed 80 full-suite tests. The expansion passed 21 combined external/authored integration tests, scoped TypeScript checking, all 69 published-GLB checks, and the Sites production build. These scoped checks avoid conflating unrelated in-progress application edits with this asset change. The build reports the existing large-chunk advisory; it is not a runtime performance measurement.

The combined Blender cutaway below was rendered and inspected using actual application placements and GLBs. It confirms representative station texture loading and relative placement. Roofs and front columns are omitted for visibility. It is **an offline studio render, not a browser screenshot**; it does not show every Alexandria/offshore addition. Browser interaction, device frame times and draw calls have not been measured in this task. Deployment remains with the coordinating application release.

![Combined authored and external station models](../assets/external/previews/integrated-stations.png)

## Expanded-area studies

These additional offline studies use the actual final GLBs and placement transforms. They show the archive reading/comparison area, garden tea/market area, and coastal work area. The views omit pavilion roofs, companions and atmosphere to expose object placement; they are not browser screenshots.

![Archive reading and comparison areas](../assets/external/previews/expanded-archive.png)

![Garden tea table and market](../assets/external/previews/expanded-garden.png)

![Coastal workbench and cargo](../assets/external/previews/expanded-coast.png)

Reproduce with `blender --background --factory-startup --python scripts/blender/render_external_activity_areas.py` after generating the placement JSON.
