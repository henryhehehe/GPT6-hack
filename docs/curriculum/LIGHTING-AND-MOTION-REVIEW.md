# Lighting and living-scene review — September 10

The nine generated worlds were reviewed in the local browser at overview and companion eye level after the period-model replacement. The existing Alexandria harbor was reviewed in overview and retains its separate lighting and animation system. Final captures are in `output/lighting-review/verified`; a subsequent `shadow-check` pass checks the final facial-shadow correction in Austen and Douglass. These are local preview checks, not a published deployment or device-performance certification.

## Lighting changes

| Worlds | Finding and adjustment |
| --- | --- |
| Odyssey and Austen | The previous sky environment washed out pale fabric, skin and scenery. Reduced environment contribution and direct-light/exposure levels retain color and cloth detail. |
| Macbeth | Fog flattened the overview, while the backlit companion needed readable front planes. Reduced fog density and added a restrained, fixed sky-bounce light. |
| Frankenstein | Broad cool illumination competed with the reading lamps. Lowered the environment and key, retained warm pools, then restored enough fill after the first comparison made the face too dark. |
| The Tempest | Balanced the bright sky against the shaded cast, using a slightly denser cloud setting and a cool front bounce. The world remains an interpreted storm setting. |
| Declaration, Douglass and Seneca Falls | Reduced the environment and exposure to preserve skin, neckcloth and gown detail without bleaching pale walls. |
| A Christmas Carol | Kept the cold exterior and warm reading light; reduced the overall wash while retaining readable costume color. |

Lighting profiles now live in `scene/themeLighting.ts`. The single 2048-pixel shadow map is retained. A low fixed directional fill stands in for light reflected from the open sky or the open side of a cutaway room; it does not follow the camera. A first reduction in normal shadow bias revealed facial self-shadow noise, so the final setting restores a 0.035 m normal bias with a small depth-bias adjustment. No material recoloring or new shadow maps were added.

## Motion changes

- A deterministic wind field gives The Tempest stronger gusts, gardens gentler air movement and interiors very little air movement. This is art direction, not a historical weather claim.
- Instanced foliage, grass and bed planting sway at most 30 times per second. Root positions, trunks, obstacles and reading routes stay fixed. CPU transforms also drive their shadows; expanded culling bounds cover the allowed sway.
- Existing spray, snow, seeds, mist and indoor motes follow the same gust field. Particle updates are also capped at 30 Hz.
- Distant birds now alternate independently paced flapping and gliding. The bird count and draw-call count are unchanged.
- Companions start their existing idle clips at different phases and speeds. Small additive head glances and shoulder shifts add variety; glances diminish when a learner is close. Authored greeting/talk clips take precedence. Feet and station anchors stay fixed.
- Warm reading lights in Frankenstein and Dickens vary by at most 2.5 percent. Daytime reading lights remain steady.
- Reduced motion restores foliage and birds to rest, hides weather, freezes character motion, keeps lamps steady, and retains the existing static sky/water behavior.

## Verification and limits

The focused suite passes 31 tests covering shadow-frustum coverage for every cast, bounded illumination, lamp placement/disposal, independent character motion, no additive-pose drift, reduced motion, wind/culling bounds, static roots/trunks, navigation, picking, deterministic atmosphere and unchanged GLB material resources. TypeScript and the production build pass. Existing large-client-chunk warnings remain.

The final all-world browser pass recorded no page errors. Two Tempest frames captured two seconds apart changed 50,045 of 416,823 pixels; this establishes rendered motion, not a frame-rate benchmark. Two screenshots taken 1.5 seconds apart with reduced motion enabled were byte-identical. Every generated world's final companion view was inspected; the final shadow adjustment was checked separately on Austen and Douglass. The review uses one local desktop browser and does not establish mobile performance or full accessibility compliance.

An unrelated interface issue was passed to the coordinating UI task: at a 1100-pixel viewport, the walking direction pad overlaps the expanded companion menu and can intercept a pointer click. Keyboard activation works and was used for the review. That interface issue is not claimed resolved by this lighting/motion change. Live source reloads also interrupted early captures; the final pass used explicit lesson URLs and verified the active world before each capture.


## Follow-up: vegetation, surfaces and contact depth

The next realism pass replaces cone grass and rounded plant lumps with original curved, folded grass blades, leafy rosettes and open flowers. Tree cards gain painted leaf veins and pigment variation. The meshes remain instanced, follow the existing rooted wind, and preserve the established walking routes. This is botanical art direction rather than a reconstruction of a documented historical planting scheme.

Native architecture now uses 256-pixel mipmapped detail maps, finer masonry and board scale, and restrained color and roughness variation. Existing imported GLB/PBR materials retain their authored textures. The single-surface floor and path-union rules remain intact. Coastal and highland scenery uses seeded, continuous irregular ridgelines outside the walking boundary; an eye-level comparison led to lower peaks to keep the horizon open.

The nine generated scenes now include optional short-range contact shading: a 0.4 m GTAO radius at 28 percent blend, with its buffer capped at 800 pixels. The color buffer is capped at 2048 pixels and DPR 1.5 with up to four MSAA samples; a single output pass applies the existing exposure/tone mapping. Cutout foliage, sky, water, particles and transparent objects are excluded from the normal pass. Unsupported or explicitly low-power contexts keep direct rendering, and compositor exceptions permanently fall back to it. This is screen-space shading, not ray-traced global illumination. The separate Alexandria renderer is unchanged by this compositor integration.

Final local captures are in `output/lighting-review/realism-final`. All nine generated worlds were inspected at overview and companion eye level with no page errors. A six-frame Frankenstein camera pan showed no coplanar striping across the visible floor or walls. Two stationary reduced-motion frames were pixel-identical, as were two reduced-motion Tempest frames. With motion enabled, two Tempest frames differed at 59,392 of 416,823 pixels. Short requestAnimationFrame samples had a 16.7 ms median on the local desktop browser; these are scheduling samples, not a sustained GPU or mobile performance certification.

The focused suite passed 24 tests covering terrain geometry, navigation, wind/culling, material ownership and scale, floor/path depth, contact shading state recovery and fallback, lighting, and character pose drift. TypeScript and the production build pass; the existing large-chunk warning remains. The existing character meshes and simplified architectural shells still define the fidelity ceiling: these changes add natural detail and depth, but do not make the scenes photorealistic.


## Opt-in scene ambience

All ten prepared worlds now have an original synthesized ambience profile: harbor water and distant seabirds, slower Aegean surf, garden birds, low heath wind, a quiet study/hearth, winter air, stronger island surf, and quieter workshop, courtyard and meeting-room sound. These are interpretive soundscapes, not historical field recordings. No external audio downloads, music, dialogue or new asset licenses are involved.

The scene's top-right Sound off button starts playback only after an explicit click. The volume slider remembers its setting locally, but the app does not persist consent to autoplay. A generated-world switch crossfades profiles in one AudioContext; switching renderer families or leaving the scene closes the context. Hidden tabs suspend playback. Unsupported audio shows a small status message without disabling the lesson. A master compressor, bounded levels and short event lookahead limit the mix; retiring layers and timers are cleaned up, including during rapid switches.

Three unit tests cover every world's profile, safe fallback/volume bounds, bounded scheduling and layer/timer disposal. The actual browser check covers opt-in, play/pause, volume persistence, one-context world changes, visibility pause/resume, unmount cleanup, and desktop/mobile controls. All ten profiles were rendered through OfflineAudioContext at maximum master gain for nine seconds; samples were finite and non-silent, with peak values from 0.024 to 0.512 before the master compressor. Browser checks recorded no page errors. Evidence is under `output/ambience-review`. This is signal and behavior verification, not a listening-panel evaluation or a device loudness guarantee.


## Scene composition: replacing the repeated triangle

The nine generated worlds no longer place three isolated reading platforms around a central hub. All three raised 8 × 7 m pads are removed; furniture and companions meet the existing floor. Outdoor connecting paths now follow the sequence of reading areas instead of radiating from the origin. Their joined geometry retains the single-surface depth rule.

- Odyssey and The Tempest follow a shoreline sequence with angled furniture.
- Austen follows a garden walk with varied desk and bench orientations.
- Macbeth brings its readers into a closer line within the castle courtyard.
- Frankenstein gathers its readers into a compact L-shaped study group.
- Dickens places readers along one street frontage, facing the lane.
- Philadelphia groups its document desks near the existing worktables.
- Douglass uses the courtyard edge and a turn toward the rear reading area.
- Seneca Falls follows the central meeting aisle between the benches.

One station transform now controls furniture, props, character positions, light positions, collision blockers, approach points and camera arrival direction. The visit action faces the relocated reader instead of using a hard-coded harbor angle. Source IDs and period costumes are preserved. The separate Alexandria harbor renderer is unchanged.

The updated composition was inspected at overview and companion eye level in all nine worlds (`output/lighting-review/composition`), followed by a closer-group pass for Macbeth, Frankenstein and Philadelphia (`composition-groups`). Both browser runs recorded no page errors. The focused suite passes 48 tests, including rotated alignment, furniture ground contact, safe reachable approaches through actual furniture and vegetation, legacy navigation, model loading/disposal, source support placement, and floor/path depth. TypeScript and the production build pass. These are arranged teaching scenes, not historical reconstructions of specific room occupancy.
