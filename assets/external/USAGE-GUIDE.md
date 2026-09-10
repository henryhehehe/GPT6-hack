# External model usage guide

Generated from source usage records, measured published GLBs, and the actual placement registry. Regenerate with `node --import tsx scripts/catalog-external-models.ts`.

Open `/model-catalog` in the running application for search, one-at-a-time 3D previews, clip playback and downloads. All 69 entries have local self-contained GLBs; only reviewed static selections load in lessons.

Currently **49 distinct external models** appear in **91 placements across four settings**. Character bases/accessories and animation sources remain adaptation references. Scene-eligible means permitted for reviewed placement, not historically authenticated or device-benchmarked.

## Scene payloads

These are uncompressed GLB transfer bytes for external additions only, deduplicated within each scene. They exclude authored assets, JavaScript, renderer/GPU allocations, catalog metadata and textures after decoding. No FPS claim is implied.

| Setting | Placements | Unique models | Extra GLB bytes |
| --- | ---: | ---: | ---: |
| alexandria | 7 | 7 | 1,026,416 |
| coast | 47 | 22 | 5,066,440 |
| garden | 19 | 13 | 3,034,500 |
| archive | 18 | 15 | 2,793,756 |

## Integration contract

- Runtime placements live in `components/worlds/scene/externalLayout.ts`; only IDs from `lib/externalAssetIndex.json` are accepted. Never turn generated lesson text into a URL.
- Static exports use meters, Y-up, X/Z centered, and a ground origin. Scale defaults to 1; an explicit uniform placement scale also transforms collision bounds. The garden tea table uses 0.5 for a seated height. `Anchor_Inspect` is 65% up the bounds; `Anchor_Label` is above the top. The bounds describe the whole object, not the usable tabletop or hull waterline.
- Use `loadExternalModels(parent, placements)` for lessons. It deduplicates requests, allows three concurrent loads, shares static geometry/materials, and retains a box fallback on failure. Call `dispose()` before traversing the parent for cleanup. Late results are disposed instead of attached.
- `zone` opens the corresponding source station through the existing `onSelect` callback. It does not collect evidence, alter claim text, award points, or replace primary sources. Untagged objects are scenery.
- `solid` adds a conservative rotated ground footprint to generated-setting navigation; `trunkRadius` limits palm blockers to the low trunk region instead of the canopy. Small tabletop objects inherit their supporting furniture blocker. Alexandria uses separate navigation: update that registry when adding ground-level obstacles.
- Authored furniture, buildings, cave, sheep and teaching characters remain in place. External additions supplement them; generic ships/bodies do not replace reviewed period art.
- The public catalog intentionally permits reference previews of all assets; assembly and adaptation statuses are rejected by the classroom loader.
- Skinned references require `SkeletonUtils.clone`, one `AnimationMixer` per instance, and explicit retargeting/rest-pose/root-motion checks. Never use ordinary `Object3D.clone` for independent skeletons.
- The two animation GLBs are unmodified originals. Each contains 43 named clips including a T-pose. No retargeting or classroom animation acceptance is claimed.
- CC0 source links and saved license evidence are in `catalog.json` and `licenses/`. Keep credits and record modifications even though attribution is not a CC0 condition.

## Item index

- [barrel — kenney-pirate-kit-barrel](#kenney-pirate-kit-barrel)
- [crate — kenney-pirate-kit-crate](#kenney-pirate-kit-crate)
- [boat-row-small — kenney-pirate-kit-boat-row-small](#kenney-pirate-kit-boat-row-small)
- [boat-row-large — kenney-pirate-kit-boat-row-large](#kenney-pirate-kit-boat-row-large)
- [tool-paddle — kenney-pirate-kit-tool-paddle](#kenney-pirate-kit-tool-paddle)
- [mast — kenney-pirate-kit-mast](#kenney-pirate-kit-mast)
- [mast-ropes — kenney-pirate-kit-mast-ropes](#kenney-pirate-kit-mast-ropes)
- [ship-small — kenney-pirate-kit-ship-small](#kenney-pirate-kit-ship-small)
- [ship-medium — kenney-pirate-kit-ship-medium](#kenney-pirate-kit-ship-medium)
- [ship-wreck — kenney-pirate-kit-ship-wreck](#kenney-pirate-kit-ship-wreck)
- [palm-detailed-bend — kenney-pirate-kit-palm-detailed-bend](#kenney-pirate-kit-palm-detailed-bend)
- [palm-detailed-straight — kenney-pirate-kit-palm-detailed-straight](#kenney-pirate-kit-palm-detailed-straight)
- [rocks-a — kenney-pirate-kit-rocks-a](#kenney-pirate-kit-rocks-a)
- [rocks-b — kenney-pirate-kit-rocks-b](#kenney-pirate-kit-rocks-b)
- [rocks-c — kenney-pirate-kit-rocks-c](#kenney-pirate-kit-rocks-c)
- [rocks-sand-a — kenney-pirate-kit-rocks-sand-a](#kenney-pirate-kit-rocks-sand-a)
- [structure-platform-dock — kenney-pirate-kit-structure-platform-dock](#kenney-pirate-kit-structure-platform-dock)
- [platform-planks — kenney-pirate-kit-platform-planks](#kenney-pirate-kit-platform-planks)
- [Bag — quaternius-fantasy-props-bag](#quaternius-fantasy-props-bag)
- [Barrel — quaternius-fantasy-props-barrel](#quaternius-fantasy-props-barrel)
- [Bench — quaternius-fantasy-props-bench](#quaternius-fantasy-props-bench)
- [Bookcase_2 — quaternius-fantasy-props-bookcase-2](#quaternius-fantasy-props-bookcase-2)
- [BookStand — quaternius-fantasy-props-bookstand](#quaternius-fantasy-props-bookstand)
- [Book_5 — quaternius-fantasy-props-book-5](#quaternius-fantasy-props-book-5)
- [Book_Stack_1 — quaternius-fantasy-props-book-stack-1](#quaternius-fantasy-props-book-stack-1)
- [Bucket_Wooden_1 — quaternius-fantasy-props-bucket-wooden-1](#quaternius-fantasy-props-bucket-wooden-1)
- [Cabinet — quaternius-fantasy-props-cabinet](#quaternius-fantasy-props-cabinet)
- [CandleStick — quaternius-fantasy-props-candlestick](#quaternius-fantasy-props-candlestick)
- [Candle_1 — quaternius-fantasy-props-candle-1](#quaternius-fantasy-props-candle-1)
- [Chair_1 — quaternius-fantasy-props-chair-1](#quaternius-fantasy-props-chair-1)
- [Crate_Wooden — quaternius-fantasy-props-crate-wooden](#quaternius-fantasy-props-crate-wooden)
- [FarmCrate_Empty — quaternius-fantasy-props-farmcrate-empty](#quaternius-fantasy-props-farmcrate-empty)
- [FarmCrate_Apple — quaternius-fantasy-props-farmcrate-apple](#quaternius-fantasy-props-farmcrate-apple)
- [Mug — quaternius-fantasy-props-mug](#quaternius-fantasy-props-mug)
- [Pot_1 — quaternius-fantasy-props-pot-1](#quaternius-fantasy-props-pot-1)
- [Pot_1_Lid — quaternius-fantasy-props-pot-1-lid](#quaternius-fantasy-props-pot-1-lid)
- [Pouch_Large — quaternius-fantasy-props-pouch-large](#quaternius-fantasy-props-pouch-large)
- [Rope_1 — quaternius-fantasy-props-rope-1](#quaternius-fantasy-props-rope-1)
- [Rope_2 — quaternius-fantasy-props-rope-2](#quaternius-fantasy-props-rope-2)
- [Rope_3 — quaternius-fantasy-props-rope-3](#quaternius-fantasy-props-rope-3)
- [Scroll_1 — quaternius-fantasy-props-scroll-1](#quaternius-fantasy-props-scroll-1)
- [Scroll_2 — quaternius-fantasy-props-scroll-2](#quaternius-fantasy-props-scroll-2)
- [Shelf_Arch — quaternius-fantasy-props-shelf-arch](#quaternius-fantasy-props-shelf-arch)
- [Shelf_Simple — quaternius-fantasy-props-shelf-simple](#quaternius-fantasy-props-shelf-simple)
- [Stall_Cart_Empty — quaternius-fantasy-props-stall-cart-empty](#quaternius-fantasy-props-stall-cart-empty)
- [Stall_Empty — quaternius-fantasy-props-stall-empty](#quaternius-fantasy-props-stall-empty)
- [Stool — quaternius-fantasy-props-stool](#quaternius-fantasy-props-stool)
- [Table_Large — quaternius-fantasy-props-table-large](#quaternius-fantasy-props-table-large)
- [Table_Plate — quaternius-fantasy-props-table-plate](#quaternius-fantasy-props-table-plate)
- [Vase_2 — quaternius-fantasy-props-vase-2](#quaternius-fantasy-props-vase-2)
- [Vase_4 — quaternius-fantasy-props-vase-4](#quaternius-fantasy-props-vase-4)
- [Workbench — quaternius-fantasy-props-workbench](#quaternius-fantasy-props-workbench)
- [Workbench_Drawers — quaternius-fantasy-props-workbench-drawers](#quaternius-fantasy-props-workbench-drawers)
- [Superhero_Female_FullBody — quaternius-base-characters-superhero-female-fullbody](#quaternius-base-characters-superhero-female-fullbody)
- [Superhero_Male_FullBody — quaternius-base-characters-superhero-male-fullbody](#quaternius-base-characters-superhero-male-fullbody)
- [Eyebrows_Female — quaternius-base-characters-eyebrows-female](#quaternius-base-characters-eyebrows-female)
- [Eyebrows_Regular — quaternius-base-characters-eyebrows-regular](#quaternius-base-characters-eyebrows-regular)
- [Hair_Beard — quaternius-base-characters-hair-beard](#quaternius-base-characters-hair-beard)
- [Hair_Buns — quaternius-base-characters-hair-buns](#quaternius-base-characters-hair-buns)
- [Hair_Buzzed — quaternius-base-characters-hair-buzzed](#quaternius-base-characters-hair-buzzed)
- [Hair_BuzzedFemale — quaternius-base-characters-hair-buzzedfemale](#quaternius-base-characters-hair-buzzedfemale)
- [Hair_Long — quaternius-base-characters-hair-long](#quaternius-base-characters-hair-long)
- [Hair_SimpleParted — quaternius-base-characters-hair-simpleparted](#quaternius-base-characters-hair-simpleparted)
- [UAL1_Standard — quaternius-animations-ual1-standard](#quaternius-animations-ual1-standard)
- [UAL1_Standard_RM — quaternius-animations-ual1-standard-rm](#quaternius-animations-ual1-standard-rm)
- [Coast Rocks 01 — polyhaven-coast_rocks_01](#polyhaven-coast_rocks_01)
- [Wooden Table 02 — polyhaven-wooden_table_02](#polyhaven-wooden_table_02)
- [Planter Pot Clay — polyhaven-planter_pot_clay](#polyhaven-planter_pot_clay)
- [Wicker Basket 02 — polyhaven-wicker_basket_02](#polyhaven-wicker_basket_02)

<a id="kenney-pirate-kit-barrel"></a>
## barrel

**kenney-pirate-kit-barrel** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-barrel.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/barrel.glb`
- Transfer: 16,780 bytes; 148 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.85 / 0.78196 / 0.85 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Stand upright at the quay edge; keep the walkway center open.

**Review:** Barrel construction is generic game art; do not use it to establish ancient cargo practices.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-small-barrel`: position [-16.5, 0, 2], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-barrel', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `6b8735e12cd2199fdf514e34170c02952c1efaf17781b165e59d672e198e92ce`

<a id="kenney-pirate-kit-crate"></a>
## crate

**kenney-pirate-kit-crate** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-crate.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/crate.glb`
- Transfer: 13,276 bytes; 76 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.61765 / 0.44118 / 0.75 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Stack at most two beside a warehouse or boat landing.

**Review:** A stack needs one combined collision volume and stable supporting surfaces.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-small-crate`: position [-16.5, 0, 3.2], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-crate', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `126e8b95996ea3fd25132396d20a9058001d74974d5316808702d4a835f1d8c3`

<a id="kenney-pirate-kit-boat-row-small"></a>
## boat-row-small

**kenney-pirate-kit-boat-row-small** · boat · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-boat-row-small.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/boat-row-small.glb`
- Transfer: 19,192 bytes; 168 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 3.2 / 0.98693 / 2.76178 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place just offshore with the hull touching the water; the paddles are part of the mesh.

**Review:** Decorative only: boarding and passenger controls are not included.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `shore-rowboat`: position [-23, -2.75, 24], yaw 0.6 rad, uniform scale 1; scenery only; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-boat-row-small', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `d7ecd5e7f46cefa309e1b5d815c32aa07d869a23594ad257c9136b9edfb9cd2b`

<a id="kenney-pirate-kit-boat-row-large"></a>
## boat-row-large

**kenney-pirate-kit-boat-row-large** · boat · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-boat-row-large.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/boat-row-large.glb`
- Transfer: 18,140 bytes; 174 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 4.04743 / 1.2483 / 4.2 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a secondary rowing craft outside the walking shoreline.

**Review:** Keep its wider hull and oars clear of piers; no navigation deck is supplied.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `shore-rowboat-large`: position [24, -2.75, 25], yaw -0.4 rad, uniform scale 1; scenery only; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-boat-row-large', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `e832123cf89de8a8869f6a9441e935b83bd7afb5250b0e94ef8ff637a40856cb`

<a id="kenney-pirate-kit-tool-paddle"></a>
## tool-paddle

**kenney-pirate-kit-tool-paddle** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-tool-paddle.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/tool-paddle.glb`
- Transfer: 11,592 bytes; 60 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.44805 / 1.6 / 0.14135 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Lean beside a rowing craft or lay along a dock edge.

**Review:** Pivot at the handle for animation; this static mesh has no rowing action.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- alexandria / `quay-paddle`: position [-10.9, 1.28, 21.9], yaw 1.5707963267948966 rad, uniform scale 1; opens harbor; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-tool-paddle', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `af34367a65480e9c18b8dff31d4184729c709df972581b752f6044f2cc1dabc7`

<a id="kenney-pirate-kit-mast"></a>
## mast

**kenney-pirate-kit-mast** · ship-module · **assembly-or-context-review**

[Local GLB](../../public/models/external/kenney-pirate-kit-mast.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/mast.glb`
- Transfer: 28,440 bytes; 302 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2.50975 / 4.5 / 0.99567 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Attach to an authored hull at its mast socket.

**Review:** Check sailing-period suitability and hull proportions; a mast alone is not a complete vessel.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `220c0bbf7ac2ccad27b0b33127dffbea3ef0a36c6f78e2868b55cf60d4486e18`

<a id="kenney-pirate-kit-mast-ropes"></a>
## mast-ropes

**kenney-pirate-kit-mast-ropes** · ship-module · **assembly-or-context-review**

[Local GLB](../../public/models/external/kenney-pirate-kit-mast-ropes.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/mast-ropes.glb`
- Transfer: 32,236 bytes; 350 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2.50196 / 4.5 / 1.33998 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Align with the matching mast at identical scale and orientation.

**Review:** Do not add a second mast if the selected hull already contains rigging.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `62c851901b8ffea596a8d095d9eda8f2258b9768888a00f0cfff5d1a3aa75e72`

<a id="kenney-pirate-kit-ship-small"></a>
## ship-small

**kenney-pirate-kit-ship-small** · boat · **assembly-or-context-review**

[Local GLB](../../public/models/external/kenney-pirate-kit-ship-small.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/ship-small.glb`
- Transfer: 87,204 bytes; 1,370 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2.64967 / 5.5 / 4.85772 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use in a generic distant seascape after checking sail and hull silhouette.

**Review:** Pirate-kit vessel: keep out of period-specific Greek scenes until adapted.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `f4d25753b5d029b2dab6c681cb0e0a37f45e76bbc2e0b491a95f856a07c53138`

<a id="kenney-pirate-kit-ship-medium"></a>
## ship-medium

**kenney-pirate-kit-ship-medium** · boat · **assembly-or-context-review**

[Local GLB](../../public/models/external/kenney-pirate-kit-ship-medium.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/ship-medium.glb`
- Transfer: 106,700 bytes; 1,723 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 3.16981 / 6.57968 / 7 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Reserve for a medium-distance generic harbor, beyond player collision.

**Review:** Pirate-era design is not an authenticated Greek merchant ship; no walkable deck.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `61d5b3093557f44c4f935d8c89f2e397ffb1299428b61cbf9dd4619b110f5aa1`

<a id="kenney-pirate-kit-ship-wreck"></a>
## ship-wreck

**kenney-pirate-kit-ship-wreck** · boat · **assembly-or-context-review**

[Local GLB](../../public/models/external/kenney-pirate-kit-ship-wreck.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/ship-wreck.glb`
- Transfer: 156,272 bytes; 2,282 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2.03774 / 4.2298 / 4.5 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as clearly interpretive debris on an unwalkable shoreline.

**Review:** Only include where the assigned text supports wreck scenery; do not add an invented plot event.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `c6bb747062e3406c422ac5923694663873afd632a5022e58d7d1787af5cad266`

<a id="kenney-pirate-kit-palm-detailed-bend"></a>
## palm-detailed-bend

**kenney-pirate-kit-palm-detailed-bend** · plant · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-palm-detailed-bend.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/palm-detailed-bend.glb`
- Transfer: 42,388 bytes; 482 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 3.38763 / 5 / 3.78242 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Plant on the edge of a coast setting, with the bend facing open space.

**Review:** Climate-specific vegetation; unsuitable as automatic English garden dressing.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-palm-1`: position [22.06833839313344, 0, 6.479848807352883], yaw 0.28559933214452665 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-3`: position [15.061796880741557, 0, 17.38224021014794], yaw 0.8567979964335799 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-5`: position [3.273241280285563, 0, 22.765893163261453], yaw 1.427996660722633 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-7`: position [-9.554545299043385, 0, 20.921535893153923], yaw 1.9991953250116865 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-9`: position [-19.34883125511717, 0, 12.43473880147874], yaw 2.57039398930074 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-11`: position [-23, 0, 2.8166876380389124e-15], yaw 3.141592653589793 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-13`: position [-19.34883125511717, 0, -12.434738801478744], yaw 3.7127913178788465 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-15`: position [-9.554545299043404, 0, -20.921535893153916], yaw 4.283989982167899 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-17`: position [3.2732412802855517, 0, -22.765893163261453], yaw 4.855188646456953 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-19`: position [15.061796880741563, 0, -17.382240210147938], yaw 5.426387310746007 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-21`: position [22.06833839313344, 0, -6.479848807352885], yaw 5.99758597503506 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-palm-detailed-bend', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `83442f402a8c40648be69d186a8f0d773ff69a2819d68f939657db324195603d`

<a id="kenney-pirate-kit-palm-detailed-straight"></a>
## palm-detailed-straight

**kenney-pirate-kit-palm-detailed-straight** · plant · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-palm-detailed-straight.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/palm-detailed-straight.glb`
- Transfer: 42,424 bytes; 482 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 3.81691 / 5 / 3.81691 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use sparingly behind a coastal station; share its materials across repeats.

**Review:** Leave the trunk out of the walking route and do not imply a botanical source identification.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-palm-0`: position [23, 0, 0], yaw 0 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-2`: position [19.34883125511717, 0, 12.434738801478744], yaw 0.5711986642890533 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-4`: position [9.554545299043388, 0, 20.921535893153923], yaw 1.1423973285781066 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-6`: position [-3.2732412802855553, 0, 22.765893163261453], yaw 1.7135959928671598 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-8`: position [-15.061796880741555, 0, 17.38224021014794], yaw 2.284794657156213 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-10`: position [-22.068338393133438, 0, 6.479848807352892], yaw 2.855993321445266 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-12`: position [-22.06833839313344, 0, -6.479848807352876], yaw 3.4271919857343196 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-14`: position [-15.06179688074156, 0, -17.382240210147938], yaw 3.998390650023373 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-16`: position [-3.27324128028556, 0, -22.765893163261453], yaw 4.569589314312426 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-18`: position [9.554545299043397, 0, -20.92153589315392], yaw 5.14078797860148 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).
- coast / `coastal-palm-20`: position [19.348831255117158, 0, -12.434738801478758], yaw 5.711986642890532 rad, uniform scale 1; scenery only; solid ground footprint (trunk radius 1.5 m).

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-palm-detailed-straight', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `6f73e08f5224b9190bdddbc52d18d852f737f7fa752b146c85973c93a881c742`

<a id="kenney-pirate-kit-rocks-a"></a>
## rocks-a

**kenney-pirate-kit-rocks-a** · rock · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-rocks-a.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/rocks-a.glb`
- Transfer: 25,728 bytes; 264 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2 / 1.13367 / 1.71593 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place as a compact perimeter cluster or a low-cost distant substitute for the scan.

**Review:** Angular low-poly style differs from the textured coast; avoid intermixing at close range.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `offshore-rocks-a`: position [16, -2.65, -28], yaw 0 rad, uniform scale 1; scenery only; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-rocks-a', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 1024px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `10c86317e316088aade838f8f98a26bd132b350c11f1b3f8755cffe4bc1162e6`

<a id="kenney-pirate-kit-rocks-b"></a>
## rocks-b

**kenney-pirate-kit-rocks-b** · rock · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-rocks-b.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/rocks-b.glb`
- Transfer: 28,252 bytes; 300 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2.26351 / 1.86432 / 2.4 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Rotate around Y to vary an outer-shore cluster.

**Review:** Solid-looking rock needs a collider if within walking range.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `shore-rocks-b`: position [30, -2.65, -13], yaw 0.8 rad, uniform scale 1; scenery only; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-rocks-b', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 1024px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `6e1693c60ddc3acdce0b936cb04a50d5c98cf3e016210d98fe78e139dda67ac9`

<a id="kenney-pirate-kit-rocks-c"></a>
## rocks-c

**kenney-pirate-kit-rocks-c** · rock · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-rocks-c.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/rocks-c.glb`
- Transfer: 23,620 bytes; 232 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2.77978 / 1.75515 / 2.8 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a taller perimeter silhouette behind a source station.

**Review:** Do not use its visual outline as automatically navigable cave geometry.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `shore-rocks-c`: position [-12, -2.65, -31], yaw 0 rad, uniform scale 1; scenery only; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-rocks-c', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 1024px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `6b02104635059875662273e732a01e64fa62141c0dca5f276ece00b094908b51`

<a id="kenney-pirate-kit-rocks-sand-a"></a>
## rocks-sand-a

**kenney-pirate-kit-rocks-sand-a** · rock · **scene-eligible**

[Local GLB](../../public/models/external/kenney-pirate-kit-rocks-sand-a.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/rocks-sand-a.glb`
- Transfer: 45,908 bytes; 552 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 3 / 1.88473 / 2.5739 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Sink the sand base slightly into coastal ground to avoid a visible floating seam.

**Review:** Match sand colors first; its base is not a terrain collision mesh.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `offshore-sand-bank`: position [-28, -2.7, 21], yaw 0 rad, uniform scale 1; scenery only; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'kenney-pirate-kit-rocks-sand-a', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 1024px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `42d289de3e1dfd3118dc3a0a7a2e0564c9e6d3f5300832dbfebf5be0eba895a0`

<a id="kenney-pirate-kit-structure-platform-dock"></a>
## structure-platform-dock

**kenney-pirate-kit-structure-platform-dock** · structure · **assembly-or-context-review**

[Local GLB](../../public/models/external/kenney-pirate-kit-structure-platform-dock.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/structure-platform-dock.glb`
- Transfer: 29,624 bytes; 324 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2.98485 / 1.56681 / 3 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Snap to a designed shore connector, matching pier surface elevation.

**Review:** Keep in the catalog until traversal boundaries and shore connection are authored.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `4799983506686e6526dfb6792a5e795c476b8c55be3e7ae886e6fca11bf25ccf`

<a id="kenney-pirate-kit-platform-planks"></a>
## platform-planks

**kenney-pirate-kit-platform-planks** · structure · **assembly-or-context-review**

[Local GLB](../../public/models/external/kenney-pirate-kit-platform-planks.glb) · [Publisher / creator: Kenney](https://kenney.nl/assets/pirate-kit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/kenney-pirate-kit/platform-planks.glb`
- Transfer: 11,328 bytes; 48 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 1.40164 / 0.31676 / 2 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use to extend a designed pier or as a shallow floor insert.

**Review:** It does not extend the existing walking polygon; avoid promising an unreachable platform.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `0ad73012af5fc87df45a0b68e85cacb4e7bcc6a882c00291024dc6b440076976`

<a id="quaternius-fantasy-props-bag"></a>
## Bag

**quaternius-fantasy-props-bag** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-bag.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Bag.gltf`
- Transfer: 193,936 bytes; 858 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.5329 / 0.65 / 0.44279 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Set on the floor beside a stall or underneath a reading table.

**Review:** Use as a generic cloth container, not evidence of a particular traded commodity.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- alexandria / `market-bag`: position [14.65, 1.808, 4.35], yaw 0 rad, uniform scale 1; scenery only; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-bag', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `a7a2de649c4a3c56519953a3be42c334ffc04d0b70d0bc42577fc6f6c770f7de`

<a id="quaternius-fantasy-props-barrel"></a>
## Barrel

**quaternius-fantasy-props-barrel** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-barrel.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Barrel.gltf`
- Transfer: 253,952 bytes; 824 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.69962 / 0.9 / 0.69962 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place beside a coastal pavilion with the base resting on the floor.

**Review:** Use one collision footprint per stack; generic medieval styling requires period review.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-tall-barrel`: position [-18, 0, 2], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-barrel', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `8348285bfcbd3ae10f59c8e81efad211cee305d4e16852dabed9f5075b7fa0e9`

<a id="quaternius-fantasy-props-bench"></a>
## Bench

**quaternius-fantasy-props-bench** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-bench.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Bench.gltf`
- Transfer: 214,660 bytes; 404 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 1.7 / 0.32646 / 0.3271 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place along a rear wall with its seat facing the reading area.

**Review:** Static furniture; sitting behavior and accessible approach must be implemented separately.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-reading-bench`: position [4.8, 0, 12.2], yaw 1.5707963267948966 rad, uniform scale 1.3; opens market; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-bench', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `cd63529f05fc3557045541ea0b9b6fcf26de1151821a865babdfdf9e11faae0c`

<a id="quaternius-fantasy-props-bookcase-2"></a>
## Bookcase_2

**quaternius-fantasy-props-bookcase-2** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-bookcase-2.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Bookcase_2.gltf`
- Transfer: 292,628 bytes; 2,148 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 1.03355 / 1.8 / 0.30342 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place at the back of an archive station, facing its approach.

**Review:** Bound books fit later-period reading worlds; do not silently substitute them for ancient scrolls.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-bookcase`: position [-5, 0, -15], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-bookcase-2', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `b5313c1c70fa70562090b78264a2ff2f3eb1e452db87f5bd6719256254f410c4`

<a id="quaternius-fantasy-props-bookstand"></a>
## BookStand

**quaternius-fantasy-props-bookstand** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-bookstand.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/BookStand.gltf`
- Transfer: 172,404 bytes; 1,526 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.16824 / 0.48 / 0.1696 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Rest on a desk with the reading face toward the learner.

**Review:** Attach a separate reviewed source action; decorative pages are not quotations.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-bookstand`: position [-7.65, 0.631, -12.05], yaw 0 rad, uniform scale 1; opens library; supported by reading-table.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-bookstand', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `c856c036926286cdf5b1fd04ad9524a8e509ff34fb81048195c97f435192b956`

<a id="quaternius-fantasy-props-book-5"></a>
## Book_5

**quaternius-fantasy-props-book-5** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-book-5.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Book_5.gltf`
- Transfer: 124,852 bytes; 96 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.22247 / 0.06649 / 0.3 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Lay on a desk as a source-access prop for later-period scenes.

**Review:** The book cover does not identify the assigned edition; display that in the reader.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-book`: position [-7.05, 0.631, -12.05], yaw 0 rad, uniform scale 1; opens library; supported by reading-table.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-book-5', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `5d1b680081a97f0e0527198db904f9c1e2eb13b9825026b5a9a80caca7e9af4c`

<a id="quaternius-fantasy-props-book-stack-1"></a>
## Book_Stack_1

**quaternius-fantasy-props-book-stack-1** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-book-stack-1.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Book_Stack_1.gltf`
- Transfer: 135,276 bytes; 208 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.42 / 0.31502 / 0.33356 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place at the rear corner of a desk, preserving space for the selected passage.

**Review:** A stack represents scenery, not additional sources available to the learner.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-book-stack`: position [-6.45, 0.631, -12.05], yaw 0 rad, uniform scale 1; opens library; supported by reading-table.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-book-stack-1', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `a9e2bd7ed771ef3e0f9779b18b2b43e038a53a89f2b38e4ea91ce195b47fbf1b`

<a id="quaternius-fantasy-props-bucket-wooden-1"></a>
## Bucket_Wooden_1

**quaternius-fantasy-props-bucket-wooden-1** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-bucket-wooden-1.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Bucket_Wooden_1.gltf`
- Transfer: 223,460 bytes; 976 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.55 / 0.37111 / 0.48602 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place next to a coastal crate or workbench, away from the approach lane.

**Review:** Check the handle silhouette and generic construction against the setting.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `harbor-bucket`: position [-9.95, 0.22, 4.7], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.
- coast / `market-bucket`: position [14.05, 0.22, 4.7], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.
- coast / `library-bucket`: position [2.05, 0.22, -12.3], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-bucket-wooden-1', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `4b765773a8301f57e190dcd6ef576bd9e530924a077333c2bf7ae29f5338e71e`

<a id="quaternius-fantasy-props-cabinet"></a>
## Cabinet

**quaternius-fantasy-props-cabinet** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-cabinet.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Cabinet.gltf`
- Transfer: 316,260 bytes; 2,388 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 1.5 / 1.09861 / 0.39329 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place at the rear of a reading pavilion as closed storage.

**Review:** Doors are static; do not suggest opening or collecting hidden evidence.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-cabinet`: position [-7, 0, -15], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-cabinet', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `ebc3d1807ebd506d5eda4bff4d2e0d1b25ad58135af382a716faafbc81e36ba3`

<a id="quaternius-fantasy-props-candlestick"></a>
## CandleStick

**quaternius-fantasy-props-candlestick** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-candlestick.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/CandleStick.gltf`
- Transfer: 105,680 bytes; 730 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.42 / 0.24986 / 0.2887 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Set on the right rear of a writing surface.

**Review:** No light or fire is added by this asset; historical placement remains interpretive.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-candlestick`: position [-7.65, 0.631, -11.77], yaw 0 rad, uniform scale 1; opens library; supported by reading-table.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-candlestick', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `0124cbbebea8c14c28e2873984ee422394255e71e7f82423945f6389f51c1577`

<a id="quaternius-fantasy-props-candle-1"></a>
## Candle_1

**quaternius-fantasy-props-candle-1** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-candle-1.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Candle_1.gltf`
- Transfer: 124,552 bytes; 212 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.12803 / 0.18 / 0.1471 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a small tabletop candle beside books.

**Review:** Do not spawn point lights for every candle; use the scene lighting budget.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `harbor-candle`: position [-12.48, 1.055, 3.5], yaw 0 rad, uniform scale 1; opens harbor; existing support/trunk blocker or outside walking route.
- garden / `market-candle`: position [11.52, 1.055, 3.5], yaw 0 rad, uniform scale 1; opens market; existing support/trunk blocker or outside walking route.
- garden / `library-candle`: position [-0.48, 1.055, -13.5], yaw 0 rad, uniform scale 1; opens library; existing support/trunk blocker or outside walking route.
- archive / `harbor-candle`: position [-11.37, 1.125, 3.55], yaw 0 rad, uniform scale 1; opens harbor; existing support/trunk blocker or outside walking route.
- archive / `market-candle`: position [12.63, 1.125, 3.55], yaw 0 rad, uniform scale 1; opens market; existing support/trunk blocker or outside walking route.
- archive / `library-candle`: position [0.63, 1.125, -13.45], yaw 0 rad, uniform scale 1; opens library; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-candle-1', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `02aa7ff32d2413c3b6500ea9ce0e8de2fde77f2362221a306cb2f97443e7b405`

<a id="quaternius-fantasy-props-chair-1"></a>
## Chair_1

**quaternius-fantasy-props-chair-1** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-chair-1.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Chair_1.gltf`
- Transfer: 222,088 bytes; 496 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.49096 / 0.95 / 0.46426 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place to the side of the reading desk with its back clear of the path.

**Review:** Fantasy wooden chair, not verified Regency furniture; its geometry does not provide sitting controls.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-tea-chair`: position [6.5, 0, 13.15], yaw 3.141592653589793 rad, uniform scale 1; opens market; solid ground footprint.
- archive / `archive-comparison-chair`: position [7, 0, -10.7], yaw 3.141592653589793 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-chair-1', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `2caf2c44edfa5adeb3b9349e784410cd0fb417a0ff2c72b1991582cba3f445b7`

<a id="quaternius-fantasy-props-crate-wooden"></a>
## Crate_Wooden

**quaternius-fantasy-props-crate-wooden** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-crate-wooden.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Crate_Wooden.gltf`
- Transfer: 263,400 bytes; 1,576 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.67856 / 0.75 / 0.73176 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place behind a coastal source station or alongside cargo.

**Review:** Only animate visibility with the relevant harbor activity, never the archive state.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-wood-crate`: position [-19.4, 0, 2], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-crate-wooden', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `3824d650afc5ef1b2d8ac2a3cdae686767f6f1267fcdcb8a6988921e5cdf9b98`

<a id="quaternius-fantasy-props-farmcrate-empty"></a>
## FarmCrate_Empty

**quaternius-fantasy-props-farmcrate-empty** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-farmcrate-empty.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/FarmCrate_Empty.gltf`
- Transfer: 245,552 bytes; 1,928 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.7 / 0.23905 / 0.40613 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a shallow market container with the open side upward.

**Review:** Parent its contents to the same group if a scenario hides the stock.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-empty-produce-box`: position [16, 0, 6.2], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-farmcrate-empty', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `52f701856a4d1b0d7581a9a7afa7b75dd8169c6b158c6d09267438044d7ef0c3`

<a id="quaternius-fantasy-props-farmcrate-apple"></a>
## FarmCrate_Apple

**quaternius-fantasy-props-farmcrate-apple** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-farmcrate-apple.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/FarmCrate_Apple.gltf`
- Transfer: 454,448 bytes; 4,028 triangles; 3 materials; 0 skins.
- Dimensions X/Y/Z: 0.7 / 0.23907 / 0.40615 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place at a market table or garden produce station when context allows.

**Review:** Do not infer historical crop trade from this generic game prop.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-produce`: position [16, 0, 5], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-farmcrate-apple', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `b27f9b10ba473bf79d77d133ab64b7734634635a6eecd8f87512e7a444a92b34`

<a id="quaternius-fantasy-props-mug"></a>
## Mug

**quaternius-fantasy-props-mug** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-mug.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Mug.gltf`
- Transfer: 203,444 bytes; 268 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.2 / 0.19146 / 0.15284 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Rest near the side of a later-period reading desk.

**Review:** A mug is background context, not a source-bearing artifact unless explicitly assigned.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-tea-mug`: position [6.77, 0.778, 11.85], yaw 0 rad, uniform scale 1; opens market; supported by garden-tea-table.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-mug', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `2aeac786a10f15934fc4ba1d580d0905f64696cb5c9d70b0a723f353c8f88a94`

<a id="quaternius-fantasy-props-pot-1"></a>
## Pot_1

**quaternius-fantasy-props-pot-1** · pottery · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-pot-1.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Pot_1.gltf`
- Transfer: 121,184 bytes; 1,068 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.55 / 0.22825 / 0.49565 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Stand on a stall or floor; pair with Pot_1_Lid at matched authoring scale.

**Review:** For the separately normalized lid, inspect the fit rather than assuming identical multipliers.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-cooking-pot`: position [16.5, 0, 8], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-pot-1', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `845a1fd9db557c556713ba9583c4f3732d982098b5f2858ba882d16be410088a`

<a id="quaternius-fantasy-props-pot-1-lid"></a>
## Pot_1_Lid

**quaternius-fantasy-props-pot-1-lid** · pottery · **assembly-or-context-review**

[Local GLB](../../public/models/external/quaternius-fantasy-props-pot-1-lid.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Pot_1_Lid.gltf`
- Transfer: 130,156 bytes; 1,292 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.4 / 0.20801 / 0.36047 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a companion lid, fitted to the vessel opening in Blender.

**Review:** This is an assembly part: avoid automatically placing it as a whole pot.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Import this GLB in a standalone viewer or Blender. Assemble the matching components, check pivot/attachment scale and historical context, and verify walkable surfaces separately. Keep it out of the lesson loader until the assembled derivative is reviewed and assigned an eligible status.

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `22bad342b4e3eb0b95b3e363f8795996871a17ebd5a3c13c2f861228cf094897`

<a id="quaternius-fantasy-props-pouch-large"></a>
## Pouch_Large

**quaternius-fantasy-props-pouch-large** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-pouch-large.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Pouch_Large.gltf`
- Transfer: 236,260 bytes; 730 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.3 / 0.21167 / 0.15941 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Rest on a table or attach to a character belt with a dedicated socket.

**Review:** Not rigged clothing; do not weight it automatically to the entire body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- alexandria / `archive-pouch`: position [-4.15, 4.7806, -8.8], yaw 0 rad, uniform scale 1; opens library; existing support/trunk blocker or outside walking route.
- coast / `harbor-pouch`: position [-12.65, 1.125, 3.6], yaw 0 rad, uniform scale 1; opens harbor; existing support/trunk blocker or outside walking route.
- coast / `market-pouch`: position [11.35, 1.125, 3.6], yaw 0 rad, uniform scale 1; opens market; existing support/trunk blocker or outside walking route.
- coast / `library-pouch`: position [-0.65, 1.125, -13.4], yaw 0 rad, uniform scale 1; opens library; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-pouch-large', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `a94527be1c53e8e82674130b508211542f0edf4900c16f6d59c3718625a1ea13`

<a id="quaternius-fantasy-props-rope-1"></a>
## Rope_1

**quaternius-fantasy-props-rope-1** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-rope-1.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Rope_1.gltf`
- Transfer: 149,184 bytes; 1,748 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.73546 / 0.12912 / 0.8 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Lay as dock cargo with the lowest point on the support surface.

**Review:** Not a physics rope; author collision and line behavior if a task needs them.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-rope-coil`: position [-19.4, 0.707, 2], yaw 0 rad, uniform scale 0.65; opens harbor; supported by coastal-wood-crate.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-rope-1', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `1838e138444bfa68224150ad6b8c5d587c3923135bb68a87df0eef1946c8158e`

<a id="quaternius-fantasy-props-rope-2"></a>
## Rope_2

**quaternius-fantasy-props-rope-2** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-rope-2.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Rope_2.gltf`
- Transfer: 142,468 bytes; 1,460 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.7648 / 0.117 / 0.8 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a second rope form beside a boat or harbor crate.

**Review:** Share the material with other rope forms and avoid stacking transparent cutouts.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- alexandria / `quay-rope`: position [-5.05, 1.28, 20], yaw 0 rad, uniform scale 1; opens harbor; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-rope-2', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `dd59c3ff0b167011f1005f9d602725b7cfb284c72594311bd1d1119223de760d`

<a id="quaternius-fantasy-props-rope-3"></a>
## Rope_3

**quaternius-fantasy-props-rope-3** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-rope-3.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Rope_3.gltf`
- Transfer: 149,188 bytes; 1,748 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.8 / 0.06629 / 0.61939 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as an alternate coil near the dock edge or storage corner.

**Review:** Keep it off the walking centerline; no rigging constraint is included.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-spare-rope`: position [-20, 0, 5], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-rope-3', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `3f90f28fa4b0d21fb263a2c3bf3d9b0527e9ce25dcb5a2fb7a6c59d6c72ba85c`

<a id="quaternius-fantasy-props-scroll-1"></a>
## Scroll_1

**quaternius-fantasy-props-scroll-1** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-scroll-1.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Scroll_1.gltf`
- Transfer: 158,420 bytes; 512 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.55 / 0.13257 / 0.14233 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Lay on a reading table with a zone-level source action.

**Review:** The ornamental band is invented decoration; it is not transcribed source text.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- alexandria / `archive-scroll`: position [-4.65, 4.7947999999999995, -8.45], yaw 0.12 rad, uniform scale 1; opens library; existing support/trunk blocker or outside walking route.
- archive / `archive-comparison-scroll`: position [6.7, 1.149, -12], yaw 0 rad, uniform scale 1; opens library; supported by archive-comparison-desk.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-scroll-1', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `0f79dfb960ca03a16b00bfce50b212808cff57f4560e2c6a8dce54df7248d9fc`

<a id="quaternius-fantasy-props-scroll-2"></a>
## Scroll_2

**quaternius-fantasy-props-scroll-2** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-scroll-2.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Scroll_2.gltf`
- Transfer: 167,616 bytes; 672 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 0.55 / 0.13862 / 0.15035 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as the companion scroll form on a coastal or archive desk.

**Review:** Select the actual passage through the reader, not by interpreting the texture markings.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-work-scroll`: position [-18.45, 0.879, 5], yaw 0 rad, uniform scale 1; opens harbor; supported by coastal-workbench.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-scroll-2', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `474f0ab29d7aa0b055ec8b996dd5e3479e9c88853f8bd3c3bb4f512f25b78507`

<a id="quaternius-fantasy-props-shelf-arch"></a>
## Shelf_Arch

**quaternius-fantasy-props-shelf-arch** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-shelf-arch.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Shelf_Arch.gltf`
- Transfer: 261,868 bytes; 1,286 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 1.29281 / 1.65 / 0.32354 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place against the back of a pavilion and inspect its shelf clearances.

**Review:** Generic fantasy form; it cannot open the archive or store learner progression.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-arch-shelf`: position [-9, 0, -15], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-shelf-arch', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `a2997f0e6038e3c093dd2a103eebcda35a3bb182b2aa03c6cd98511e4a6ccf39`

<a id="quaternius-fantasy-props-shelf-simple"></a>
## Shelf_Simple

**quaternius-fantasy-props-shelf-simple** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-shelf-simple.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Shelf_Simple.gltf`
- Transfer: 130,916 bytes; 480 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 1.5 / 0.39116 / 0.37034 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as understated rear storage for an archive station.

**Review:** Small reading props need explicit shelf-height placement, not only a shared floor origin.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-low-shelf`: position [-9, 0, -13.5], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-shelf-simple', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `2ddd93351cec238edad0b88eb3dc507887d45a5a6fe57de2610946b633193113`

<a id="quaternius-fantasy-props-stall-cart-empty"></a>
## Stall_Cart_Empty

**quaternius-fantasy-props-stall-cart-empty** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-stall-cart-empty.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Stall_Cart_Empty.gltf`
- Transfer: 513,924 bytes; 3,936 triangles; 3 materials; 0 skins.
- Dimensions X/Y/Z: 2.4 / 2.09114 / 0.842 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a freestanding display at the side of a larger market.

**Review:** Wheels are static; its footprint must not straddle a navigation route.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-display-cart`: position [18, 0, 8], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-stall-cart-empty', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `a24c7b49bdfab326420ce686752be43580a8d497ea57afda9a9e5799e5bc14a8`

<a id="quaternius-fantasy-props-stall-empty"></a>
## Stall_Empty

**quaternius-fantasy-props-stall-empty** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-stall-empty.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Stall_Empty.gltf`
- Transfer: 347,760 bytes; 1,496 triangles; 3 materials; 0 skins.
- Dimensions X/Y/Z: 1.96621 / 2.8 / 0.99358 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use for a new market stop with the front opening toward the learner.

**Review:** Do not overlay the already-authored Alexandria canopy; provide a replacement or a separate site.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-display-stall`: position [18, 0, 4], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-stall-empty', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `8f1f9ac62c5df024e64d04c54faa9de352843c258182da051b63997254a59581`

<a id="quaternius-fantasy-props-stool"></a>
## Stool

**quaternius-fantasy-props-stool** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-stool.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Stool.gltf`
- Transfer: 120,748 bytes; 152 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.52401 / 0.65 / 0.52401 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place beside a workbench without blocking the approach.

**Review:** This is static seating; it has no sitting animation or interaction.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-work-stool`: position [-18, 0, 6.25], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-stool', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `60f7d7ab42db562a8881c31c28b8943eacf26ab1105c87dc316c313cbcead7b6`

<a id="quaternius-fantasy-props-table-large"></a>
## Table_Large

**quaternius-fantasy-props-table-large** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-table-large.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Table_Large.gltf`
- Transfer: 255,392 bytes; 986 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 2.2 / 0.62826 / 0.84699 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Center at the rear of a source pavilion, leaving the front lane open.

**Review:** Use the measured top height when placing objects; the mesh is not a collider.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `reading-table`: position [-7, 0, -12], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-table-large', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `eab67e1de484428ba8d8a47c8bae06a6819a92765d0fb5cd399076534b85a73c`

<a id="quaternius-fantasy-props-table-plate"></a>
## Table_Plate

**quaternius-fantasy-props-table-plate** · reading · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-table-plate.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Table_Plate.gltf`
- Transfer: 90,816 bytes; 172 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.27696 / 0.01675 / 0.28 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Lay flat on a later-period tabletop or appropriate food display.

**Review:** Generic tableware, not proof of period dining customs.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-tea-plate`: position [6.25, 0.778, 12.02], yaw 0 rad, uniform scale 1; opens market; supported by garden-tea-table.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-table-plate', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `17e0775c274302ad740baf0a0951ac7d348a76a2c43ad3323cad55d42881aaec`

<a id="quaternius-fantasy-props-vase-2"></a>
## Vase_2

**quaternius-fantasy-props-vase-2** · pottery · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-vase-2.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Vase_2.gltf`
- Transfer: 141,404 bytes; 598 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.55 / 0.40878 / 0.55 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a close-range textured vessel at the market station.

**Review:** Stylized fantasy pottery; do not call it an excavated Greek artifact.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- alexandria / `market-vessel`: position [11.15, 1.808, 5.65], yaw 0 rad, uniform scale 1; opens market; existing support/trunk blocker or outside walking route.
- coast / `harbor-vessel`: position [-9.35, 0.22, 5.9], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.
- coast / `library-vessel`: position [2.65, 0.22, -11.1], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.
- archive / `harbor-vessel`: position [-9.7, 0.22, 3.9], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.
- archive / `market-vessel`: position [14.3, 0.22, 3.9], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-vase-2', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `bda7e0b3be05ba2ffdab38c492d6c59ddcc9e6c71e1134e8fb71e712322bd5d0`

<a id="quaternius-fantasy-props-vase-4"></a>
## Vase_4

**quaternius-fantasy-props-vase-4** · pottery · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-vase-4.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Vase_4.gltf`
- Transfer: 142,336 bytes; 598 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.44449 / 0.6 / 0.44449 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a contrasting vessel on the same material palette.

**Review:** Keep enough separation for its widest silhouette; review motif suitability.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- alexandria / `market-vessel-tall`: position [19.15, 1.808, 5.65], yaw 0 rad, uniform scale 1; opens market; existing support/trunk blocker or outside walking route.
- coast / `market-vessel`: position [14.65, 0.22, 5.9], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.
- archive / `library-vessel`: position [2.3, 0.22, -13.1], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-vase-4', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `071d3543eb76207b1f40bafeba8f067d274c52b75f2192ff65ed38e6ebe567b8`

<a id="quaternius-fantasy-props-workbench"></a>
## Workbench

**quaternius-fantasy-props-workbench** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-workbench.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Workbench.gltf`
- Transfer: 260,944 bytes; 1,368 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 2 / 0.88618 / 1.01455 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a coastal reading/work surface with objects at the measured top.

**Review:** Generic workshop furniture; do not imply a reconstructed historical workshop.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `coastal-workbench`: position [-18, 0, 5], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-workbench', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `c510a0cdf01eed87da9d8342a3bbbc227e54d9b317b019f77c990ac4cd0aa0b8`

<a id="quaternius-fantasy-props-workbench-drawers"></a>
## Workbench_Drawers

**quaternius-fantasy-props-workbench-drawers** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/quaternius-fantasy-props-workbench-drawers.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/fantasy-props-megakit) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-fantasy-props/Workbench_Drawers.gltf`
- Transfer: 209,680 bytes; 364 triangles; 2 materials; 0 skins.
- Dimensions X/Y/Z: 2 / 1.14553 / 1.41349 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as a comparison desk in archive settings.

**Review:** Drawers are decorative; do not promise storage or opening behavior.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- archive / `archive-comparison-desk`: position [7, 0, -12], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'quaternius-fantasy-props-workbench-drawers', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `ec85bd80d12f9936f2eb45c67ceaee966e2f0d3740aaee936fc2cee5882cc7de`

<a id="quaternius-base-characters-superhero-female-fullbody"></a>
## Superhero_Female_FullBody

**quaternius-base-characters-superhero-female-fullbody** · character-base · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-superhero-female-fullbody.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/bodies/Superhero_Female_FullBody.gltf`
- Transfer: 1,485,016 bytes; 15,060 triangles; 3 materials; 1 skins.
- Dimensions X/Y/Z: 1.66887 / 1.77505 / 0.3027 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Import the original humanoid rig; add period garments and fit an approved hairstyle before replacing a named actor.

**Review:** Superhero proportions and minimal clothing are not suitable default teaching characters. Preserve source rig and use SkeletonUtils.clone for independent instances.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Supplied local aliases for broken publisher texture URIs by copying the matching same-directory normal PNG bytes. Original glTF and ZIP remain unchanged. See dependency_aliases.
- Textures at most 1024px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `93deaaa8790217ae2cac2b288f30a2decd5e3a8a541336a9d9956e1ebde7813c`

<a id="quaternius-base-characters-superhero-male-fullbody"></a>
## Superhero_Male_FullBody

**quaternius-base-characters-superhero-male-fullbody** · character-base · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-superhero-male-fullbody.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/bodies/Superhero_Male_FullBody.gltf`
- Transfer: 1,182,272 bytes; 14,318 triangles; 3 materials; 1 skins.
- Dimensions X/Y/Z: 1.85887 / 1.81959 / 0.29149 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Import the original humanoid rig; add period garments and fit an approved hairstyle before replacing a named actor.

**Review:** Superhero proportions and minimal clothing are not suitable default teaching characters. Preserve source rig and use SkeletonUtils.clone for independent instances.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Supplied local aliases for broken publisher texture URIs by copying the matching same-directory normal PNG bytes. Original glTF and ZIP remain unchanged. See dependency_aliases.
- Textures at most 1024px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `2a5292cf8500b84f9bdba393c54c60a3849e008a1aca8d0b0e6c0926728e2cde`

<a id="quaternius-base-characters-eyebrows-female"></a>
## Eyebrows_Female

**quaternius-base-characters-eyebrows-female** · character-accessory · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-eyebrows-female.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/hair/Eyebrows_Female.gltf`
- Transfer: 142,924 bytes; 1,480 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.126 / 0.03761 / 0.04029 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Fit this eyebrows female accessory to the chosen body in Blender; use a head socket or reviewed skin binding.

**Review:** This is the origin-at-zero export. Preserve canonical scale for fitting; do not treat it as a complete character or retarget it as a whole body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `fad73b11e89f48dc4457ba6433eee380e6fe8bcdca1fe7291aecdd898efcb5be`

<a id="quaternius-base-characters-eyebrows-regular"></a>
## Eyebrows_Regular

**quaternius-base-characters-eyebrows-regular** · character-accessory · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-eyebrows-regular.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/hair/Eyebrows_Regular.gltf`
- Transfer: 86,000 bytes; 984 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.12468 / 0.03061 / 0.03756 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Fit this eyebrows regular accessory to the chosen body in Blender; use a head socket or reviewed skin binding.

**Review:** This is the origin-at-zero export. Preserve canonical scale for fitting; do not treat it as a complete character or retarget it as a whole body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `4260e8f73980893bf0733ead68ef89c314dd323763e947e8fd5b7dc895f3dd6e`

<a id="quaternius-base-characters-hair-beard"></a>
## Hair_Beard

**quaternius-base-characters-hair-beard** · character-accessory · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-hair-beard.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/hair/Hair_Beard.gltf`
- Transfer: 84,564 bytes; 1,034 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.16151 / 0.13982 / 0.10493 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Fit this hair beard accessory to the chosen body in Blender; use a head socket or reviewed skin binding.

**Review:** This is the origin-at-zero export. Preserve canonical scale for fitting; do not treat it as a complete character or retarget it as a whole body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `5d8e6cf66397fb8ff22e750f406a14ca9fff7dd8294c73a2c96a0ad541e2c034`

<a id="quaternius-base-characters-hair-buns"></a>
## Hair_Buns

**quaternius-base-characters-hair-buns** · character-accessory · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-hair-buns.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/hair/Hair_Buns.gltf`
- Transfer: 203,360 bytes; 3,284 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.30151 / 0.2491 / 0.23675 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Fit this hair buns accessory to the chosen body in Blender; use a head socket or reviewed skin binding.

**Review:** This is the origin-at-zero export. Preserve canonical scale for fitting; do not treat it as a complete character or retarget it as a whole body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `9a0b10aaeb6d2ab7f1bdce0481cdf700929f5c1f3226cf7f21fee337d0cd3dac`

<a id="quaternius-base-characters-hair-buzzed"></a>
## Hair_Buzzed

**quaternius-base-characters-hair-buzzed** · character-accessory · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-hair-buzzed.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/hair/Hair_Buzzed.gltf`
- Transfer: 79,180 bytes; 830 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.15459 / 0.16936 / 0.19092 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Fit this hair buzzed accessory to the chosen body in Blender; use a head socket or reviewed skin binding.

**Review:** This is the origin-at-zero export. Preserve canonical scale for fitting; do not treat it as a complete character or retarget it as a whole body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `3fb36d973b0854940ad565197fbb62edc16fd95e36b4fa6574c8c7bbdb0250da`

<a id="quaternius-base-characters-hair-buzzedfemale"></a>
## Hair_BuzzedFemale

**quaternius-base-characters-hair-buzzedfemale** · character-accessory · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-hair-buzzedfemale.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/hair/Hair_BuzzedFemale.gltf`
- Transfer: 79,308 bytes; 830 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.15866 / 0.17016 / 0.19763 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Fit this hair buzzedfemale accessory to the chosen body in Blender; use a head socket or reviewed skin binding.

**Review:** This is the origin-at-zero export. Preserve canonical scale for fitting; do not treat it as a complete character or retarget it as a whole body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `74584832de9bdc4ab00959cf739fe55b3b7a9c82f46abe181b101aeaba36966a`

<a id="quaternius-base-characters-hair-long"></a>
## Hair_Long

**quaternius-base-characters-hair-long** · character-accessory · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-hair-long.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/hair/Hair_Long.gltf`
- Transfer: 187,452 bytes; 2,906 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.24471 / 0.27636 / 0.27045 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Fit this hair long accessory to the chosen body in Blender; use a head socket or reviewed skin binding.

**Review:** This is the origin-at-zero export. Preserve canonical scale for fitting; do not treat it as a complete character or retarget it as a whole body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `58d4b26680ac608fd64ed10d369990b0c302acdc54a02b27bcc9d174c0b53bf9`

<a id="quaternius-base-characters-hair-simpleparted"></a>
## Hair_SimpleParted

**quaternius-base-characters-hair-simpleparted** · character-accessory · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-base-characters-hair-simpleparted.glb) · [Publisher / creator: Quaternius](https://quaternius.itch.io/universal-base-characters) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-base-characters/hair/Hair_SimpleParted.gltf`
- Transfer: 91,320 bytes; 1,301 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.17542 / 0.17916 / 0.18695 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Fit this hair simpleparted accessory to the chosen body in Blender; use a head socket or reviewed skin binding.

**Review:** This is the origin-at-zero export. Preserve canonical scale for fitting; do not treat it as a complete character or retarget it as a whole body.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `63738d2f9500a7a19481f8b6f068f09bca0f782d9eca01e74cffbeae39db9026`

<a id="quaternius-animations-ual1-standard"></a>
## UAL1_Standard

**quaternius-animations-ual1-standard** · animation-source · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-animations-ual1-standard.glb) · [Publisher / creator: Quaternius; publisher also credits Gonzalo Furnier for animation collaboration](https://quaternius.itch.io/universal-animation-library) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-animations/UAL1_Standard.glb`
- Transfer: 7,618,436 bytes; 13,744 triangles; 2 materials; 1 skins.
- Dimensions X/Y/Z: 1.94445 / 1.82872 / 0.3696 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Retarget selected clips to an approved dressed humanoid; use Idle_Loop and Idle_Talking_Loop for dialogue, and stop the mixer on disposal.

**Review:** Root-motion variant moves the root; keep it out of stationary dialogue. The included demonstration body is not a lesson character; retargeting is not verified.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Exact source GLB copied; animation remains catalog-only

**Clips (43):** A_TPose, Crouch_Fwd_Loop, Crouch_Idle_Loop, Dance_Loop, Death01, Driving_Loop, Fixing_Kneeling, Hit_Chest, Hit_Head, Idle_Loop, Idle_Talking_Loop, Idle_Torch_Loop, Interact, Jog_Fwd_Loop, Jump_Land, Jump_Loop, Jump_Start, PickUp_Table, Pistol_Aim_Down, Pistol_Aim_Neutral, Pistol_Aim_Up, Pistol_Idle_Loop, Pistol_Reload, Pistol_Shoot, Punch_Cross, Punch_Jab, Push_Loop, Roll, Sitting_Enter, Sitting_Exit, Sitting_Idle_Loop, Sitting_Talking_Loop, Spell_Simple_Enter, Spell_Simple_Exit, Spell_Simple_Idle_Loop, Spell_Simple_Shoot, Sprint_Loop, Swim_Fwd_Loop, Swim_Idle_Loop, Sword_Attack, Sword_Idle, Walk_Formal_Loop, Walk_Loop.

**SHA-256:** `69591853d817488edaa8fd9bf8fc1d821eaeaf789f8627b3cd23b41c4ed67997`

<a id="quaternius-animations-ual1-standard-rm"></a>
## UAL1_Standard_RM

**quaternius-animations-ual1-standard-rm** · animation-source · **adaptation-required**

[Local GLB](../../public/models/external/quaternius-animations-ual1-standard-rm.glb) · [Publisher / creator: Quaternius; publisher also credits Gonzalo Furnier for animation collaboration](https://quaternius.itch.io/universal-animation-library) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/quaternius-animations/UAL1_Standard_RM.glb`
- Transfer: 7,620,504 bytes; 13,744 triangles; 2 materials; 1 skins.
- Dimensions X/Y/Z: 1.94445 / 1.82872 / 0.3696 m. Source transforms retained; fit and rescale deliberately.
- Anchors: none added.

**Placement:** Retarget selected clips to an approved dressed humanoid; use Idle_Loop and Idle_Talking_Loop for dialogue, and stop the mixer on disposal.

**Review:** Root-motion variant moves the root; keep it out of stationary dialogue. The included demonstration body is not a lesson character; retargeting is not verified.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Preserve skeleton and clip names; retarget and inspect deformations before classroom use.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

Catalog preview only; no current lesson placement.

**How to reuse:**

Use the local GLB as a reference in Blender or a standalone Three.js viewer. Fit clothing/accessories to the actual teaching character, verify deformation and retarget clips where applicable. Export a new reviewed derivative with its own ID; do not promote the unadapted source into a lesson.

**Preparation:**

- Exact source GLB copied; animation remains catalog-only

**Clips (43):** A_TPose, Crouch_Fwd_Loop, Crouch_Idle_Loop, Dance_Loop, Death01, Driving_Loop, Fixing_Kneeling, Hit_Chest, Hit_Head, Idle_Loop, Idle_Talking_Loop, Idle_Torch_Loop, Interact, Jog_Fwd_Loop, Jump_Land, Jump_Loop, Jump_Start, PickUp_Table, Pistol_Aim_Down, Pistol_Aim_Neutral, Pistol_Aim_Up, Pistol_Idle_Loop, Pistol_Reload, Pistol_Shoot, Punch_Cross, Punch_Jab, Push_Loop, Roll, Sitting_Enter, Sitting_Exit, Sitting_Idle_Loop, Sitting_Talking_Loop, Spell_Simple_Enter, Spell_Simple_Exit, Spell_Simple_Idle_Loop, Spell_Simple_Shoot, Sprint_Loop, Swim_Fwd_Loop, Swim_Idle_Loop, Sword_Attack, Sword_Idle, Walk_Formal_Loop, Walk_Loop.

**SHA-256:** `be684571ed655a1b892c2c07e6e2aeca053b606c442d34004adaf1d944090d01`

<a id="polyhaven-coast_rocks_01"></a>
## Coast Rocks 01

**polyhaven-coast_rocks_01** · rock · **scene-eligible**

[Local GLB](../../public/models/external/polyhaven-coast_rocks_01.glb) · [Publisher / creator: Rob Tuytel, Rico Cilliers](https://polyhaven.com/a/coast_rocks_01) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/polyhaven-coast_rocks_01/coast_rocks_01_1k.gltf`
- Transfer: 2,682,240 bytes; 12,000 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 10.00113 / 0.54901 / 7.14595 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place outside the station approaches; use a simple conservative perimeter collider.

**Review:** Reduced scan is scenery, not a cave interior or an identified Homeric location.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- coast / `shore-rock-scan`: position [-32, -2.7, -14], yaw 0.4 rad, uniform scale 1; scenery only; existing support/trunk blocker or outside walking route.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'polyhaven-coast_rocks_01', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Decimated toward 12000 triangles
- Textures at most 1024px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `45fbbb2a243b4f4079261a27c4d3dad5a39a1fcc9b4699c303df3aeb225fa86e`

<a id="polyhaven-wooden_table_02"></a>
## Wooden Table 02

**polyhaven-wooden_table_02** · furniture · **scene-eligible**

[Local GLB](../../public/models/external/polyhaven-wooden_table_02.glb) · [Publisher / creator: Serhii Khromov](https://polyhaven.com/a/wooden_table_02) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/polyhaven-wooden_table_02/wooden_table_02_1k.gltf`
- Transfer: 100,220 bytes; 196 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 2.2 / 1.55057 / 1.36921 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use as the lightest textured reading table; position props using its measured height.

**Review:** Generic modern scan with no verified Regency provenance.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `garden-tea-table`: position [6.5, 0, 12], yaw 0 rad, uniform scale 0.5; opens market; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'polyhaven-wooden_table_02', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `cf240803e6a91aa6e96a3fee0949690231cb5f387da5def95009c4e50c67c7ca`

<a id="polyhaven-planter_pot_clay"></a>
## Planter Pot Clay

**polyhaven-planter_pot_clay** · plant · **scene-eligible**

[Local GLB](../../public/models/external/polyhaven-planter_pot_clay.glb) · [Publisher / creator: Amal Kumar](https://polyhaven.com/a/planter_pot_clay) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/polyhaven-planter_pot_clay/planter_pot_clay_1k.gltf`
- Transfer: 157,060 bytes; 3,080 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.6 / 0.50047 / 0.59428 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Place at a garden pavilion corner with the base on the stone pad.

**Review:** Modern planter; never select it as a Greek amphora.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `harbor-planter`: position [-9.85, 0.22, 2.8], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.
- garden / `market-planter`: position [14.15, 0.22, 2.8], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.
- garden / `library-planter`: position [2.15, 0.22, -14.2], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'polyhaven-planter_pot_clay', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `978a8dfc5206b3bc1710a084a533299353012c85a8823114c5fe2b2cb6bd596e`

<a id="polyhaven-wicker_basket_02"></a>
## Wicker Basket 02

**polyhaven-wicker_basket_02** · cargo · **scene-eligible**

[Local GLB](../../public/models/external/polyhaven-wicker_basket_02.glb) · [Publisher / creator: Kuutti Siitonen](https://polyhaven.com/a/wicker_basket_02) · [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

- Retained source: `assets/external/models/polyhaven-wicker_basket_02/wicker_basket_02_1k.gltf`
- Transfer: 238,792 bytes; 2,999 triangles; 1 materials; 0 skins.
- Dimensions X/Y/Z: 0.64939 / 0.37599 / 0.47672 m. Static grounded/centered contract applies.
- Anchors: Anchor_Inspect, Anchor_Label.

**Placement:** Use for a single inspection-distance container with space for its open lid.

**Review:** The lid is included in the footprint; simplified weaving requires close-camera review.

**Loading:** Use the registered local GLB URL. Scene loading is deduplicated per asset and capped at three concurrent requests; catalog previews load one selected file.

**Collision:** Use the placement footprint if solid and within walking reach. Small tabletop items inherit their furniture footprint.

**Interaction:** Decoration by default. Only placements explicitly tagged with a zone open that zone through onSelect; geometry never collects evidence or grants credit.

**Animation:** Static; no mixer required.

**Rights:** CC0-1.0. Retain the creator and publisher link in credits; illustrative geometry is separate from primary evidence.

**Current use:**

- garden / `harbor-basket`: position [-14.15, 0.22, 2.8], yaw 0 rad, uniform scale 1; opens harbor; solid ground footprint.
- garden / `market-basket`: position [9.85, 0.22, 2.8], yaw 0 rad, uniform scale 1; opens market; solid ground footprint.
- garden / `library-basket`: position [-2.15, 0.22, -14.2], yaw 0 rad, uniform scale 1; opens library; solid ground footprint.

**How to reuse:**

Add a reviewed entry to `externalLayout.ts`, choose a stable supporting surface and check the walking route. Do not copy the example coordinates blindly.

```ts
{ key: 'unique-name', asset: 'polyhaven-wicker_basket_02', at: [0, 0, 0], turn: 0 }
```

**Preparation:**

- Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added
- Decimated toward 3000 triangles
- Textures at most 512px; opaque JPEG quality 82, alpha PNG; embedded

**Clips (0):** none.

**SHA-256:** `0982182f9e55e16fe7e55f41a4d7f78a012c8c386ca180a7211159077a58e174`

