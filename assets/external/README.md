# External model library

Acquired September 10, 2026 for **Counterfactual Worlds**. This is a reusable **3D asset** library matched to the scene requirements in `docs/OBJECT-AND-CHARACTER-MODELING-PLAN.md` and the world catalog. **All 69 entries now have local published GLBs and detailed usage instructions; 49 are integrated in 91 placements across Alexandria, coast, garden and archive.** Open `/model-catalog` in the running app for searchable entries, a 3D viewer, clip playback and downloads. Start with [USAGE-GUIDE.md](USAGE-GUIDE.md), [runtime-catalog.json](runtime-catalog.json), and [the integration handoff](../../docs/EXTERNAL-MODEL-INTEGRATION.md). Original source geometry and earlier prepared samples remain preserved.

Start with [the visual contact sheet](previews/contact-sheet.jpg), [the asset catalog](catalog.json), and [measured file/geometry data](metrics.json). The catalog contains **69 selected source assets** from **eight acquired collections**. Original publisher ZIPs are saved locally in `archives/`; selected models and their dependencies are extracted in `models/`. Twelve representative assets also have portable GLB derivatives in `prepared/`.

## What was acquired

All downloaded model/texture assets use **CC0 1.0 Universal**. Original pack licenses are preserved in [licenses](licenses/), and each collection records its creator, source, exact edition, acquisition date, and checksum. The application repository's MIT license does not replace these rights records.

| Collection | Actual downloaded contents | Selected use |
| --- | --- | --- |
| [Kenney Pirate Kit 2.1](https://kenney.nl/assets/pirate-kit) | 72 GLBs in the ZIP; 18 selected with their shared color texture | Rowboats, cargo, dock components, palms and economical rocks. Ships/rigging need period adaptation; pirate ships are not ancient Greek reconstructions. |
| [Quaternius Fantasy Props MegaKit — Standard](https://quaternius.itch.io/fantasy-props-megakit) | 94 glTF files in the free ZIP; 35 selected with dependencies | Pottery, scrolls, sacks, crates, stalls, furniture, candles and books. Fantasy/medieval details require scene-specific review. |
| [Quaternius Universal Base Characters — Standard](https://quaternius.itch.io/universal-base-characters) | **Two** rigged superhero-proportion bodies and eight hair/brow accessories, with alternate accessory exports in the archive | Starting geometry for Dorian, Thaleia and Ione. No regular/teen bodies or animation clips in this edition. Add garments and adapt proportions/identity before use. |
| [Quaternius Universal Animation Library — Standard v3.0](https://quaternius.itch.io/universal-animation-library) | Two GLBs: in-place and root-motion variants; each has 43 named clips, including the T-pose | Useful clips include `Idle_Loop`, `Idle_Talking_Loop`, `Interact`, `Sitting_Talking_Loop`, `Walk_Loop` and `Walk_Formal_Loop`. Retargeting remains untested. |
| [Poly Haven Coast Rocks 01](https://polyhaven.com/a/coast_rocks_01) — Rob Tuytel / Rico Cilliers | glTF + binary + 1K PBR textures; **679,936 triangles** in the downloaded default scene | Odyssey/Tempest coast and cave approaches. Keep the full source for adaptation; use a reduced section for a live lesson. |
| [Poly Haven Wooden Table 02](https://polyhaven.com/a/wooden_table_02) — Serhii Khromov | glTF + 1K PBR textures; **196 triangles** | Reading/comparison desk for generated settings and later-period lessons. Generic furniture, not a verified Regency object. |
| [Poly Haven Planter Pot Clay](https://polyhaven.com/a/planter_pot_clay) — Amal Kumar | glTF + 1K PBR textures; **3,080 triangles** | Garden detail for Austen or generated settings. Not an amphora or archaeological artifact. |
| [Poly Haven Wicker Basket 02](https://polyhaven.com/a/wicker_basket_02) — Kuutti Siitonen | glTF + 1K PBR textures; **17,850 triangles** | Close-range market/garden container, subject to period review and geometry reduction. |

Counts above come from downloaded files, not the larger paid editions advertised on publisher pages. Poly Haven's model and texture licensing is documented on its [asset license page](https://polyhaven.com/license). Acquisition used its [public API](https://github.com/Poly-Haven/Public-API/blob/master/ToS.md) with a project-specific user agent. No runtime API dependency was added; publisher website preview images are not included.

## Use the files

1. Find any of the 69 items in `/model-catalog` or [USAGE-GUIDE.md](USAGE-GUIDE.md). Each has placement instructions, cautions, collision/interaction guidance, rights, a download and exact current scene uses.
2. Use `url` in [runtime-catalog.json](runtime-catalog.json) for the self-contained GLB under `public/models/external/`. Static files are grounded, centered and scaled in meters; placements may specify a uniform scale that also updates collisions. Rigged references retain source transforms.
3. Add reviewed static placements through `components/worlds/scene/externalLayout.ts`. The loader caches templates, bounds concurrency, retains fallbacks and cleans up late loads. Generated-setting solid props join the existing navigation; Alexandria obstacles need its separate registry updated.
4. Assembly/context and character-adaptation statuses remain blocked by the lesson loader. The catalog can preview them for development. Add clothes, retarget motion and review historical context before making new teaching-character derivatives.
5. Originals in `models/` retain dependencies and original quality. Copy the complete directory if using an original glTF or Kenney GLB. `prepared/` contains the earlier 12 acquisition examples, not the runtime exports.

Current external transfer additions are 1.03 MB for Alexandria, 5.07 MB for coast, 3.03 MB for garden and 2.79 MB for archive (decimal MB; unique GLBs per scene). These exclude authored assets and decoded GPU memory. The 69-file public library totals 30.05 MB, but scenes only request their selected subset and the catalog loads one model at a time. No device frame-rate acceptance is claimed.

To reproduce the published derivatives and usage guide:

```sh
blender --background --factory-startup --python scripts/blender/export_external_library.py
node --import tsx scripts/catalog-external-models.ts
node --import tsx --test tests/externalModels.test.ts
```

The catalog script verifies SHA-256, embedded dependencies, production-loader geometry, static origins/dimensions/anchors and readiness before generating public metadata, the compact runtime index, placement records, payload budgets and the per-item guide. It does not silently rebaseline changed GLBs. Intentional changes should go through the exporter, which records new hashes. Existing preview thumbnails are optional acquisition illustrations; live catalog previews load the actual published file.

## Prepared examples and checks

[prepared-manifest.json](prepared-manifest.json) records the exact changes to each sample. Textures were limited to 1K and embedded in GLB; opaque textures use JPEG quality 85, with PNG retained where alpha is needed. Coast Rocks was decimated toward 12,000 triangles and Wicker Basket toward 4,000. Other meshes retain their source geometry. Exported transforms preserve the source; only the contact-sheet arrangement is centered and fitted to uniform tiles. The previews are **not at a common physical scale**.

Two packaging issues were resolved during acquisition:

- The character body glTF files request `T_Eye_Normal_png.png`, and the male also requests `T_Hair_1_Normal_png.png`, which are absent from the ZIP. Local aliases copy the corresponding same-directory `T_Eye_Normal.png` and `T_Hair_1_Normal.png` bytes. `dependency_aliases` records each mapping. Original model bytes and archives are unchanged.
- Kenney's GLBs reference `Textures/colormap.png` externally. That dependency is extracted and checked; the prepared examples embed it.

Offline checks verify ZIP CRCs during extraction, archive SHA-256 values, glTF/GLB parsing, local dependencies, buffer lengths, triangle counts, scene graph cycles, and saved per-file SHA-256 fingerprints. Poly Haven downloads additionally matched the publisher's byte lengths and MD5 values. These checks are a scoped inventory/integrity check, not a complete Khronos validator.

```sh
# Run these from the repository root; Python 3.10+ is sufficient.
python3 scripts/check-external-models.py

# Re-extract the selected originals from the already-downloaded ZIPs.
# Refuses to overwrite a source file whose bytes have changed.
python3 scripts/prepare-external-models.py

# Regenerate the twelve derivatives and individual previews with Blender 4.5.
blender --background --factory-startup --python scripts/blender/prepare_external_samples.py

# Only after intentional reviewed changes, update the integrity baseline.
python3 scripts/check-external-models.py --record

# Rebuild the human-readable inventory/contact sheet (requires Pillow).
python3 scripts/report-external-models.py
```

## Storage and reacquisition

`archives/*.zip` is ignored by Git because two original archives exceed GitHub's 100 MB file limit. They remain saved in this workspace. Extracted selections, licenses, checksums, measurements and prepared examples can be versioned normally; nothing was committed or pushed during this acquisition. A future clone will not contain the ignored original ZIPs unless separately copied or downloaded.

For Kenney, the exact observed direct download URL is in the collection record. For Quaternius, open the linked publisher page → **Download Now** → **No thanks, just take me to the downloads** → download the **Standard** ZIP; rename it to the `archive` filename recorded in the catalog. These downloads required no account or payment. Temporary signed download URLs are deliberately not saved as reusable sources. Check `archive_sha256` before extraction; if the publisher updates an archive, review the new contents and rights before updating the record.

For each Poly Haven collection, `download_records` lists the exact URLs, local filenames, byte counts, publisher MD5 and local SHA-256 for the model and every dependency. Restore those relative paths together. Metadata comes from a specific acquisition snapshot; future publisher revisions can differ.

## Priorities and remaining gaps

**Alexandria first:** compare the pottery, stall, scroll and basket samples against the project-authored models already in progress; reuse whichever gives a coherent walking view. Character bases need clothing and identity work. Avoid substituting a generic fantasy costume for an ancient costume without review.

**Odyssey second:** combine economical coast props with the reduced rock sample and adapted ship geometry. This external library does not supply a navigable cave or reviewed sheep; the separate authored kit now includes both. A coast scan supplies scenery, not a source location.

**Austen and other reading worlds:** the table, chair, desk/workbench, books and candle kit can stage reading interactions. There is no verified complete Regency manor, period wardrobe, quill/inkwell or letter asset in this acquisition. Create/adapt those deliberately; do not label a fantasy chair as an authenticated Regency design.

The earlier [PBR Greek Pottery](https://sketchfab.com/3d-models/pbr-greek-pottery-88d4b4e87c2a412abfdf9dbe5ae35765) and [Mercury Chair Regency Period](https://sketchfab.com/3d-models/mercury-chair-regency-period-f16281407afc45ceb189b5d870afb849) remain **unacquired**: publisher-page fetches returned HTTP 403. The previous shortlist's CC Attribution labels are not a verified download license/version. Their status is explicit in `unacquired_candidates`; no viewer geometry was extracted.
