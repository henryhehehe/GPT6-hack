# Open 3D assets for the learning worlds

Researched September 10, 2026. These are acquisition candidates, not installed assets. Publisher listings establish advertised geometry and license labels; downloaded files, appearance in our renderer, and frame rate have not been verified. Some Sketchfab page fetches returned 403; indexed publisher listings supplied the metadata below. Recheck the actual download license/version before importing.

## Direction

Use a hybrid asset pipeline: source existing detailed geometry and materials, then use Blender for adaptation, optimization, and missing custom pieces. Prioritize objects close to the student's camera and learning interactions. A coherent small environment is the goal; isolated high-detail objects cannot fix flat lighting, empty streets, or inconsistent scale.

## Specific candidates

| Asset and publisher | Listed license / geometry | Proposed use and decision |
|---|---|---|
| [PBR Greek Pottery — Ferocious Industries](https://sketchfab.com/3d-models/pbr-greek-pottery-88d4b4e87c2a412abfdf9dbe5ae35765) | CC Attribution; approximately 5.7k triangles across three pots; shared 4K PBR textures | First acquisition candidate for Alexandria market close-ups. Publisher notes texture defects: inspect those before accepting. Decorative reconstruction, not a museum scan or proof of trade. |
| [Lighthouse of Alexandria — ybrbnf001](https://sketchfab.com/3d-models/lighthouse-of-alexandria-57af2bec89b54d33bf7178cc07e342b8) | CC Attribution; approximately 865.8k triangles | Landmark candidate. Author describes a reconstruction based on ancient descriptions. Extract useful geometry, simplify, and compare with our existing 14.4k-triangle lighthouse before replacement. Do not imply archaeological certainty. |
| [Coast Rocks 01 — Poly Haven, Rob Tuytel / Rico Cilliers](https://polyhaven.com/a/coast_rocks_01) | CC0; approximately 1M triangles; glTF/Blend/FBX/USD listed; 98.3 MB displayed download variant | Odyssey shore candidate. Use a small optimized section or available lower-detail variant, with reduced textures. It supplies geological scenery, not an identified Homeric location. |
| [Mercury Chair Regency Period — Ant Gregory](https://sketchfab.com/3d-models/mercury-chair-regency-period-f16281407afc45ceb189b5d870afb849) | CC Attribution; approximately 4.9k triangles | Austen interior candidate with modest geometry cost. Check materials and silhouette beside the desk/window kit. An illustrative period prop, not an object established by Austen's text. |
| [Greek Merchant ship — anreiterlorenz](https://sketchfab.com/3d-models/greek-merchant-ship-7dc636bb5f284f5ca6f63bf9c7de78ba) | CC Attribution; approximately 3.4k triangles | Secondary lightweight candidate, not yet a high-fidelity recommendation. Inspect materials and period details; don't treat the author's historical claims as lesson evidence. |

No complete free Regency manor or Odyssey cave was sufficiently verified in this pass. Keep those as authored kits while sourcing appropriate components.

## Asset acquisition and integration plan

1. Download through the publisher's supported route. Store title, creator, source URL, exact license URL/version, acquisition date, original file checksum, and modification notes. A free price alone is insufficient. Prefer CC0 and CC BY for this project; preserve each asset's license separately from our MIT code.
2. Inspect meshes and textures; render a turntable. Normalize scale, orientation, origin, materials, and texture resolution. Export GLB without cameras or lights that override our scene. Keep our archive door hinges and interaction anchors intact.
3. Initial engineering targets, to validate on the demo machine: 1–2K textures, below 5 MB per hero asset and 15 MB per lesson's initial assets, simple separate collision geometry, and lower-detail distant instances. Measure rendered triangles, draw calls, loading time, and walking performance; file size alone is not enough.
4. Integrate one candidate at a time, starting with pottery. Preserve procedural fallbacks and source-reader access. Publish only after checking the asset in our actual lighting and traversal path.
5. Display credits and reconstruction labels inside scene provenance. Geometry used as decoration stays separate from primary historical/textual evidence. A museum scan could become a source only with an appropriate collection record and a lesson-specific interpretation task.

[Poly Haven's asset license](https://polyhaven.com/license) permits reuse and redistribution of its CC0 assets, including commercial work. Its website example renders and API access have separate terms; asset licensing does not authorize copying the whole catalog or interface. Render our own thumbnails from acquired models.

## Astra's role

During development, the agent can research candidates with browsing tools, compare metadata and rendered previews, write Blender conversion scripts, and maintain the provenance manifest. This research used browsing tools; it did not add a runtime asset-search feature or make a separate Astra API call.

A future teacher-facing feature could let Astra select a small, reviewed asset kit from the lesson's setting and objective, returning registered asset IDs and placement suggestions. Application code validates the IDs, bounds, and budgets before loading locally hosted GLBs. This is a proposed feature: arbitrary live downloads and unsupported claims of historical accuracy are outside the design.
