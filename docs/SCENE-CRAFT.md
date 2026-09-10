# Scene craft: reuse the Alexandria method

Use this toolkit to improve one world at a time. It carries forward the Alexandria work on clothing, physical scale, purposeful activity, material detail, lighting, wind, ambience and enterable structures. It reuses the existing renderers and asset registries; each world retains its own composition and historical or literary context.

The toolkit is an authoring aid. It does not add a runtime scene editor, generate models, add creatures or open other buildings automatically.

## Start a focused pass

From the project root:

```sh
# See the ten authored worlds and their distinct directions.
node --import tsx scripts/scene-brief.ts --list

# Find related contexts without assuming their assets are interchangeable.
node --import tsx scripts/scene-brief.ts --list --region England
node --import tsx scripts/scene-brief.ts --list --period Regency
node --import tsx scripts/scene-brief.ts --list --creature mythic

# Produce a scene-specific plan and the implementation files to reuse.
node --import tsx scripts/scene-brief.ts --world odyssey-ix --out /tmp/odyssey-brief.md

# Inspect current cast IDs, hashes, surfaces, light and sound alongside targets.
node --import tsx scripts/scene-brief.ts --world odyssey-ix --format json

# Start an honest review record; nothing is marked passed automatically.
node --import tsx scripts/scene-brief.ts --world odyssey-ix --review-template --out /tmp/odyssey-review.json
```

Read [the generated Odyssey example](scene-craft/examples/odyssey-ix.md). A brief includes the narrative period, source edition, geography, uncertainty, wardrobe construction, activities, creatures, interior target, atmosphere, exclusions, next passes and supporting references. The JSON export also reads current implementation settings rather than copying them into another configuration system.

Unknown world IDs fail explicitly. There is no automatic historical classification based on a color palette, a title, a broad region or a model-pack name.

## Reusable layers

| Layer | Reuse from Alexandria and existing themes | Decide separately for each world |
| --- | --- | --- |
| Historical and literary context | Source / inference / scenario distinction; costume references and asset provenance | Story date, edition date, region, locality, social role, climate and season; which facts remain unknown |
| Characters | Independent skeletons, human scale, grounded feet, Idle / Greeting / Talk, fallback and cleanup | Anatomy, hair, age presentation, occupation, silhouette, garment layers, fabric and accessories |
| Clothing | Thin cloth shells, supported folds, shoulder/waist weighting, actual GLB pose inspection | Period-specific construction; a Greek mantle is not a reusable Regency gown pattern |
| Composition | Stable evidence anchors, station transforms, supported props and clear routes | Quay, garden lane, room edge, street frontage, cave approach or meeting aisle; where people have a reason to stand |
| Creatures | Motion timing, route clearance, distance detail and resource cleanup patterns | Whether any are needed; domestic animal, wildlife or literary being; habitat, anatomy, source scope and behavior |
| Architecture | Doorway/floor/furniture contract, real collision, clear return path and matching fallback | Local building form, material, construction technique, room function and opening dimensions |
| Materials | PBR response, material-aware wind, contact shading and physically supported details | Grain, weave, weathering, moisture and wear appropriate to use and exposure |
| Lighting | Motivated key, controlled fill, practical lights and reflection refresh | Sun direction, cloud, interior bounce, practical-light placement and readable contrast |
| Movement | Independent phases, purposeful steps, pauses during interaction and reduced-motion support | Task, tool, route, gesture, wind exposure, speed and rest intervals |
| Audio | Opt-in ambience, volume, transitions, suspension and disposal | Water, room tone, wind, paper, hearth or fauna; where silence matters |
| Delivery | Export checks, fallback tests, collision tests and exact-revision review records | Per-scene download, geometry, texture memory, draw-call and target-device limits |

## Historical accuracy and creature decisions

Keep three separate frames: **when the depicted action happens**, **when and where the source was produced**, and **the date and place of a visual reference**. The current costume registry already distinguishes these. A museum garment can inform a silhouette without proving the same garment was worn by a particular person outdoors. Greek clothing references support garment construction, while exact color and drape remain design choices. [The Met: Ancient Greek Dress](https://www.metmuseum.org/es/essays/ancient-greek-dress).

A region is a starting point for investigation, not a style preset. Check locality, trade, occupation, material availability and use. Likewise, season and weather are explicit art-direction choices until evidence supports them. Do not infer people's clothing or anatomy from a broad regional label.

For every proposed creature, record:

1. **Role:** wildlife, domestic animal, mythic being or supernatural dramatic figure.
2. **Basis:** interpretive, described in a source, or documented in an appropriate historical/ecological reference.
3. **Habitat and occurrence:** where it belongs in this scene, with uncertainty about species or breed retained.
4. **Representation:** anatomy, scale, materials, rig and source-bound appearance.
5. **Behavior:** a purposeful idle/action/rest loop, terrain contact, collision and reading-distance behavior.
6. **State:** existing asset or candidate. A candidate is not an installed or reviewed model.

The schema requires references for source-described or documented creatures and rejects mythic/supernatural beings classified as documented wildlife. Those checks validate the brief's structure, not the truth or adequacy of a cited source. Review the actual passage before modeling.

The Odyssey brief distinguishes existing sheep from a proposed Polyphemus design, both grounded in Book IX; it does not assert a modern breed or a verified island location. [The Odyssey, Book IX, Butler translation](https://www.gutenberg.org/cache/epub/1727/pg1727-images.html). The Tempest brief treats Ariel as a source-led dramatic spirit and does not classify Caliban as generic fauna. [The Tempest, Folger text](https://www.folger.edu/explore/shakespeares-works/the-tempest/read/). Appearance references must also respect the edition actually used by the lesson.

Absence is a valid choice. The document workshop and meeting room do not need animals simply because a wildlife system exists.

## The workflow for each scene

1. Export its brief and choose one of its next passes. Confirm the supplied sources and inspect the existing asset assignments.
2. Establish the distinctive composition and one representative close-up. Preserve guide/evidence IDs and interaction anchors; solve task placement before adding crowd density.
3. Reuse an existing model only after checking silhouette, historical/fictional fit, dimensions, rig and license. If unsuitable, adapt an editable source or create a new asset and record provenance. A high-resolution fantasy asset is not automatically a historically suitable asset.
4. Improve shape before microdetail: necklines, shoulder support, waist, sleeves, hems, hands, feet and tool contact. Add triangles where they improve a visible silhouette or deformation. Export, reimport and inspect poses; a good Blender pose alone does not establish runtime quality.
5. Build interior visuals and navigation together: doorway, floor height, steps, walls, furniture and return route. Test the loaded model as well as the fallback. Alexandria uses `walkGeometry.ts`; generated worlds use `createSettingNavigation` in `settingLayout.ts`. Do not copy Alexandria coordinates or its separate loader APIs into another renderer.
6. Add life in layers: environmental motion, individual idle changes, task gestures, then moving routes. Keep rigid supports still and shadow motion consistent with visible cloth. Use humanoid foot-placement code only for compatible skeletons; animal and supernatural rigs need their own animation contract.
7. Review light and sound from the actual approach, conversation distance and interior. Check every supported appearance state, quiet/reduced-motion behavior and asset failure handling.
8. Record evidence against the exact source revision. Reuse applicable tests from the generated plan, then run the normal project build. Perform browser/device review when it is part of the requested validation; otherwise leave that evidence unmeasured.

## Distinct directions already authored

| World | Spatial signature | First refinement |
| --- | --- | --- |
| Alexandria | Working quay to scholarly terrace | Target-device review of clothing and the enterable hall |
| Odyssey | Landing to flock to cave | Real cave entry, sheep contact, then a separate Polyphemus brief |
| Austen | Curved garden walk and private pauses | Outdoor garment construction and letter handling |
| Macbeth | Exposed heath to heavy threshold | Mantle weight, passage clearance and restrained mist |
| Frankenstein | Warm study against a cold exterior | Hands, correspondence and window/practical balance |
| Christmas Carol | Cold street with warm rooms | One complete street-to-room route and convincing outerwear |
| Tempest | Broken island sightlines after a storm | Supported wreckage, safe rock passages and source-led spirit design |
| Declaration | Tables and window-lit documents | Tailoring and shared table activity |
| Douglass | Modest courtyard and ordinary street | Role-specific fabric, scale and a considered threshold |
| Seneca Falls | Benches along a meeting aisle | Dress/bench clearance and listening groups |

## Add a world or hand off to an agent

Copy [TEMPLATE.json](scene-craft/TEMPLATE.json), fill in its context and design decisions, then validate its structure:

```sh
node --import tsx scripts/scene-brief.ts --validate docs/scene-craft/TEMPLATE.json
```

The template intentionally contains unverified placeholders and no creatures. Replace the placeholders, attach sources and review the design before integration. To make a new world reportable, add an authored profile in `lib/sceneCraftProfiles.ts` and the corresponding theme, costume, layout, surface, lighting and ambience registry entries. Existing scene reports derive their asset assignments from those registries.

For a bounded asset or research assignment, give an agent the exported brief, one next pass, exact source/model references, fixed anchors and resource constraints. Require the editable source, export, provenance, measured asset size and actual validation evidence. The scene owner integrates and checks the result. Do not ask separate agents to rewrite the same shared renderer concurrently.

Review records start with every pass **unreviewed** and all measurements **null**. Add source revision, date, evidence and limitations before marking work passed. File hashes prove byte identity, not historical accuracy. Separate named-cast bytes from architecture, external assets, crowd, texture memory and actual GPU performance. Alexandria's 20 MB core allowance belongs to that scene; it is not a default allocation for every world.

Implementation: [schema and reusable review passes](../lib/sceneCraft.ts), [ten authored profiles](../lib/sceneCraftProfiles.ts), [current-configuration adapter](../lib/sceneCraftReport.ts), [command-line tool](../scripts/scene-brief.ts). Reference passes: [Alexandria scene](ALEXANDRIA-SCENE-REVIEW.md), [clothing](ALEXANDRIA-CLOTHING.md), [interior](ALEXANDRIA-INTERIOR.md).
