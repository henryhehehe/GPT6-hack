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
