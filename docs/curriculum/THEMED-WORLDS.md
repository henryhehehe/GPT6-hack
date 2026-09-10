# Themed worlds and self-guided access

Implemented September 10, 2026 following the request to make the worlds more realistic and usable.

`/worlds` is a public, self-guided reading library for all ten worlds and thirty lessons. Each lesson offers a walkable scene, named reading stations, canonical evidence cards, source boundaries, and prepared prompts from fictional companions. It works without teacher sign-in or live AI. `/worlds?lesson=austen-letter-02` opens a particular lesson; invalid lesson IDs fall back to the first lesson. The classroom catalog links directly to these previews, and Teach this lesson opens the existing studio with the chosen lesson.

Alexandria retains the detailed existing city. The generated worlds now use an authored theme registry for sky, fog, lighting, terrain, foliage, distant architecture, and reading furniture. Odyssey has a rocky shore with its existing cave and sheep models; Tempest uses the storm-shore palette and omits those unrelated cave/sheep props. Austen has a garden and estate backdrop. Macbeth has misty highlands. Frankenstein uses cool twilight and lit windows. Dickens uses a pale winter street. The documentary lessons use writing desks and period-inspired town/village surroundings instead of ancient scroll racks by default.

The new scenery uses native geometry and existing authored/credited assets. It is an interpreted reading environment, not a verified architectural reconstruction. No generated historical image or new historical claim was added. Authored source text, source hashes, source notes, lesson objectives, and saved classroom packets are unchanged.

Generic prepared guides acquire distinct fictional names and reading roles through `worldCharacters`, while teacher-chosen names remain intact. Human-shaped guides replace the generated scene's capsule figures. Dialogue remains governed by the source-bounded fictional-character instructions. In the self-guided library, selecting a companion opens the prepared lesson activity; it does not pretend to be live AI dialogue.

The route provides reading and exploration, not saved student assessment. Teacher-reviewed launch, live dialogue, assessment, and learner persistence remain part of the existing classroom flow and its access/AI configuration. Browser interaction, visual screenshots, performance on classroom devices, and a teacher/student trial were not performed in this pass. Do not label the result classroom-validated or photorealistic on the basis of these checks.

Verification: three new tests cover all theme/source/character mappings, safe and connected arrivals for every themed furniture arrangement, supported prop dependencies, scene resource cleanup, and guide dimensions. The combined checkout passed 122 automated tests, TypeScript, and a production build. The new route returned HTTP 200 locally. Existing large-client-chunk warnings remain. The separate reviewed-release integration must preserve its newer hint/learning contracts when merging this generated-scene change.

## September 10 — distinct layouts and existing detailed models

The follow-up replaces the shared circular plaza, three pavilions, and tree ring with compositions specific to each work. Alexandria retains its existing detailed harbor renderer. The other nine use these arrangements:

| Work | Spatial identity |
| --- | --- |
| Odyssey | An irregular cove, authored cave and sheep, shipping and coastal rock models |
| Austen | A walled garden with planted beds, estate facade, paneled doorway and sash windows |
| Macbeth | An open ruined courtyard, crenellated walls, corner towers and bare trees |
| Frankenstein | A cutaway study with a chimney, book bays, existing bookcases and paneled joinery |
| A Christmas Carol | A long winter street, facing brick shopfronts, detailed doors/windows and a handcart |
| The Tempest | A separate irregular island, scanned rock shelves and storm lighting; no Cyclops cave or sheep |
| Declaration | A cutaway document hall, pilasters, comparison tables and paneling |
| Douglass | An enclosed brick courtyard with domestic windows, a bench and a work desk |
| Seneca Falls | A meeting room with bench rows, a central aisle and a reading stand |

The authored `austen-doorway` and `sash-window` GLBs join the existing setting registry. Paneled walls, desks, chairs, Quaternius furniture and Poly Haven scans are reused through the existing model loaders and credits. Repetition now shares model resources, not the entire scene layout. Architectural shells and some planting remain native geometry; these are interpreted settings, not measured reconstructions or wholly photorealistic environments.

Lighting reuses the existing harbor's physical sky and filtered environment approach, with separate sun position, cloud cover, fill, fog and exposure for each work. Interiors include warm local desk lighting. Coastal works reuse the local water-normal texture and reflective water implementation, with reflection updates capped around 30 fps and different wave speeds. Soft 2048-pixel shadows and environment lighting reveal the existing models' material detail. Reduced motion stops water/sky animation as well as station-marker motion.

Scene layouts own reading-stop positions, camera framing, architectural blockers and safe arrivals. Navigation no longer inherits invisible pavilion columns or tree trunks. Tests cover reachable arrivals **and** reading-stop centers in every layout, scene-eligible external assets, supported prop dependencies, unchanged source text, distinct compositions, cleanup and parsing/bounds of all 26 registered setting GLBs. The targeted scene suite passed 29 tests; TypeScript and the production build passed. The local world-library route returned HTTP 200. Existing large-client-chunk warnings remain. Browser visual testing and target-device performance remain unverified. These changes do not modify source packets, classroom launch or assessment behavior.
