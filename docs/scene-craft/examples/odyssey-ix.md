# The Cyclops episode · Aegean shore: scene improvement brief

Design targets and current configuration are separate. This report does not install creatures, open interiors, certify historical accuracy or mark quality checks as passed.

## Context

- World: `odyssey-ix`
- Region: Greek epic Mediterranean
- Place: An interpretive rocky shore and Cyclops cave (fictional)
- Narrative frame: Book IX narrated by Odysseus; mythic time, not a verified archaeological date.
- Source / edition: Homer, The Odyssey · Samuel Butler prose translation; use Ulysses in displayed excerpts
- Current wardrobe frame: Greek literary interpretation
- Limits: Do not turn the cave into a verified location or the existing Greek garments into a Bronze Age reconstruction.

## Distinctive direction

A compressed shore-to-cave journey

Lead from the landing past the flock toward a dark cave mouth, with open sea visible on return.

Clothing: Differentiate travel wear, fabric weight and drape while retaining the current Greek-inspired cast.

Materials: Weathered rock, rope, vessel rims and animal wool; reserve fine geometry for the cave threshold and close reader.

## Human activity and creatures

- Inspecting a landing and rope
- Watching the flock beside the cave
- Turning from the cave toward the escape route

Do not add unrelated fantasy monsters or assume all Book IX events are in the assigned excerpt.

### Sheep · existing

domestic; source-described. Existing setting asset; motion and breed detail need a dedicated pass.
Habitat: Cave/flock area in the Book IX episode; breed is not established.
Behavior: Candidate grazing, ear turns and short obstacle-aware steps with varied pauses.
References: source

### Polyphemus · candidate

mythic; source-described. A literary character with source-led anatomy; not historical fauna or an automatically installed model.
Habitat: His cave in the narrated episode.
Behavior: Use only when relevant to the selected passage; scale, breathing and presence before theatrical action.
References: source

## Space, light, motion and sound

Interior: Cyclops cave · needs-review. Check an actual cave opening, ceiling, flock clearance and an unobstructed return to shore.

Light: Bright sea air outside and readable bounced light within the cave.

Motion: Restrained surf, rope movement and separately phased flock behavior.

Sound: Long-period surf and subdued flock sounds only when a suitable licensed or authored sound is available.

## Next focused passes

1. Audit the cave mesh and return route for first-person entry
2. Upgrade flock anatomy and ground contact
3. Author a source-bounded Polyphemus brief before selecting a model

Avoid:

- A verified real-world Cyclops island pin
- Generic monster-pack anatomy
- Replaying violence merely to animate the scene

## Reuse the current implementation

Renderer: `components/worlds/GeneratedWorldScene.tsx`. Character loader: `components/worlds/scene/themedCharacters.ts`.
Named-cast download: 5,503,324 bytes. Unique named-cast GLBs only; excludes architecture, external assets, background crowd, texture memory and the app bundle.

| Station | Current model | Editable source |
| --- | --- | --- |
| harbor | thaleia | assets/blender/characters/alexandria-cast.blend |
| market | dorian | assets/blender/characters/alexandria-cast.blend |
| library | ione | assets/blender/characters/alexandria-cast.blend |

Full current surface, lighting and ambience settings are available in the JSON export. Do not duplicate those values in a new renderer.

### Period, region and evidence

Separate the date of the story from the edition and garment reference. Record place, social role, climate choices and uncertainty. Attach a source to each factual design claim.

- `lib/characterCostumes.ts`
- `docs/curriculum/HISTORICAL-ACCURACY-REVIEW.md`

### Place and human purpose

Arrange people around real tasks, work surfaces, paths and sightlines. Give each world a distinct spatial signature; preserve source and conversation anchors.

- `components/worlds/scene/themeLayouts.ts`
- `components/worlds/scene/stationTransform.ts`
- `components/worlds/scene/themeExternalActivityAreas.ts`

### Character shape and clothing

Review silhouette, fabric construction, role and season before adding geometry. Inspect neckline, shoulder, elbow, waist and hem in actual exported Idle/Greeting/Talk clips. Keep feet grounded and skeletons independent.

- `scripts/blender/alexandria_clothing.py`
- `components/worlds/scene/themedCharacters.ts`
- `components/worlds/scene/teachingCharacters.ts`
- `components/worlds/scene/humanScale.ts`
- `tests/alexandriaClothing.test.ts`

### Surfaces and asset fit

Reuse models only after checking period, region, function, scale and rights. Add roughness, thickness and local wear where visible; verify props touch their supporting surface.

- `lib/worldThemes.ts`
- `lib/externalAssetIndex.json`
- `assets/model-manifest.json`
- `components/worlds/scene/themeExternalDetails.ts`
- `components/worlds/scene/themeSurfaces.ts`

### Movement and creatures

Match wildlife to habitat and source scope; distinguish literary beings from fauna. Start with purposeful, independently phased movement. Check complete routes and pause behavior during reading, conversation and reduced motion.

- `components/worlds/scene/characterActivity.ts`
- `components/worlds/scene/characterIdleMotion.ts`
- `components/worlds/scene/themeWildlife.ts`
- `components/worlds/scene/themeWind.ts`
- `components/worlds/scene/crowdRoutes.ts`

### Enterable structure

Define doorway, floor, steps, furniture bounds and return route together. Test body and eye clearance against the exported model. Keep fallback architecture and furnishings consistent when either asset load fails.

- `components/worlds/scene/libraryInterior.ts`
- `components/worlds/scene/walkGeometry.ts`
- `components/worlds/scene/settingLayout.ts`
- `tests/libraryInterior.test.ts`

### Light and atmosphere

Review exterior, entrance, face and reading surface at each supported time/weather setting. Keep a motivated key, restrained fill and material response. Wind and its shadow must agree; reflections must follow lighting changes.

- `components/worlds/scene/themeLighting.ts`
- `components/worlds/scene/themeEnvironment.ts`
- `components/worlds/scene/harborEnvironment.ts`
- `lib/sceneAppearance.ts`

### Sound and stillness

Choose ambience from place and activity. Keep audio opt-in, adjustable and quiet enough for reading. Check world switching, suspension, reduced motion and cleanup; do not claim synthesized birds identify a historical species.

- `components/worlds/audio/worldAmbience.ts`
- `components/worlds/WorldAmbience.tsx`
- `tests/worldAmbience.test.ts`

### Quality and performance evidence

Check actual exported geometry, late-load disposal, fallbacks, interaction and build. Record bytes, triangles, draw calls, texture memory and target-device results separately. Browser/frame-rate status stays unmeasured until tested.

- `scripts/check-alexandria-pack.mjs`
- `scripts/check-alexandria-details.mjs`
- `tests/themedCharacters.test.ts`

## Review evidence

A completed brief is not a completed scene review. Attach evidence for the exact source revision before marking a pass complete.

- [ ] context: unreviewed
- [ ] composition: unreviewed
- [ ] characters: unreviewed
- [ ] materials: unreviewed
- [ ] life: unreviewed
- [ ] interiors: unreviewed
- [ ] lighting: unreviewed
- [ ] sound: unreviewed
- [ ] delivery: unreviewed

## References

- source: [Homer, The Odyssey](https://www.gutenberg.org/ebooks/1727) — Literary or historical source context; does not certify this scene geometry, species, costume or staging.
- costume-1: [The Met · Ancient Greek dress](https://www.metmuseum.org/es/essays/ancient-greek-dress) — Greek-inspired tunics and mantles illustrate a mythic story; they are not a verified Bronze Age reconstruction.

