# Open-model acquisition handoff

**Subsequent integration:** [49 models now appear in 91 scene placements](EXTERNAL-MODEL-INTEGRATION.md), with a live `/model-catalog` and [usage instructions for all 69 entries](../assets/external/USAGE-GUIDE.md). The acquisition-only statements below describe the earlier checkpoint.

September 10, 2026. Completed research and offline acquisition for Counterfactual Worlds, using the existing object/character plan, literature expansion, current authored assets, and ten-world curriculum catalog to select reusable 3D geometry.

The deliverable is [assets/external/README.md](../assets/external/README.md). Start there for sources, licenses, storage, restoration commands and integration instructions. [catalog.json](../assets/external/catalog.json) is the machine-readable acquisition catalog; it intentionally remains separate from the runtime `assets/model-manifest.json` being developed elsewhere.

- **Downloaded:** eight CC0 collections from Kenney, Quaternius and Poly Haven. Four original ZIP archives are preserved locally, and four Poly Haven glTF packages include all required binary and texture files.
- **Curated:** 69 source assets—18 coastal/harbor components, 35 props/furniture pieces, two rigged bodies, eight hair/brow accessories, two animation-library variants, and four textured Poly Haven models.
- **Prepared:** twelve self-contained GLB examples, with 1K textures and documented modifications. The large coastal scan and basket have reduced geometry. Originals are preserved.
- **Indexed:** source URLs, creators, exact editions, license records, checksums, asset-to-world suggestions, triangle/material counts, named clips, dependency lists, and preparation notes. Original archive inventories permit later selection of additional files without searching again.
- **Verification:** archive CRC and SHA-256 checks; publisher MD5/size checks for Poly Haven downloads; local dependency and glTF/GLB structure checks; representative Blender export, re-import and studio render. See [MODEL-QA.md](../assets/external/MODEL-QA.md) for measured results and visual observations.

The next integration candidate is the pottery/scroll/stall sample alongside the project-authored Alexandria assets, followed by a clothed character. The existing landmark and archive-door contracts remain the scene owner's responsibility. No application renderer, runtime manifest, deployment, account or paid service was changed by this acquisition.

The characters are reusable bases, not finished historical people. The free pack contains two superhero-proportion bodies, not all six bodies advertised across editions. The free animation pack provides 43 named clips per variant, not the full advertised 120+ set. Two missing texture filenames were repaired with explicit local aliases; all original source bytes are retained.

Source geometry and scene art remain separate from historical/textual evidence. This external acquisition lacks complete navigable caves, reviewed sheep models, period-correct Greek ships and Regency costumes/manors; the separate authored model kit now supplies a cave, sheep, ships and period props. Earlier Sketchfab pottery/chair candidates remain unacquired because publisher-page access returned HTTP 403.

Original ZIPs are locally saved but ignored by Git; two exceed GitHub's 100 MB file limit. Extracted selections and prepared samples are ordinary workspace files. No changes were committed or pushed. A future checkout can use versioned selections, but restoring original archives requires copying them or following the saved publisher download routes.
