# Alexandria world upgrade

The original harbor remains the learning hub. New connected streets extend behind and beside it, with a merchant quarter, scholars' garden, shaded colonnade, and eastern waterfront. These are interpretive teaching settings, not a verified reconstruction of ancient Alexandria. Existing lesson evidence and assumptions retain their original labels.

Rendering uses the official Three.js ocean/sky approach: atmospheric Sky, a prefiltered environment map, warm directional light, bounded soft shadows, and planar reflective water. Reflections update at approximately 30 Hz while the main view runs independently. The water eye position updates every rendered frame. The local Water helper is vendored from Three.js r186 with an explicit render-target disposal method; the MIT license is included next to it. The water normal texture comes from the same r186 examples distribution.

References:
- https://github.com/mrdoob/three.js/blob/r186/examples/webgl_shaders_ocean.html
- https://github.com/mrdoob/three.js/blob/r186/examples/jsm/objects/Water.js
- https://github.com/mrdoob/three.js/blob/r186/examples/textures/waternormals.jpg

The ground flicker was caused by exactly coplanar surfaces: the old extruded bevel cap and plaza both reached y=.9. The cap now ends at .84, the ground surface at .9, and pavement is separated above it. Transparent causal overlays do not write depth and are hidden when inactive. The lighthouse flame no longer pulses.

Repeated district buildings, columns and authored palms use instancing. Dense decorative geometry is excluded from pointer picking; named characters and landmarks use lightweight hit proxies. Camera pixel density is capped at 1.5 and reflection targets are 512 square. The world canvas exposes a one-second FPS sample plus peak draw/triangle counts for local diagnostics; these are hardware- and view-dependent, not a general performance guarantee.

Navigation uses the same city layout as rendering. Tests cover existing lesson routes, the new destination connections, shoreline clearance, parapets, and wall collision. Destination selection returns keyboard focus to the canvas. The authored Alexandria asset bundles and rigged teaching characters load over playable fallbacks; failure leaves the lesson usable.

For the demo: enter Student world, show the harbor overview, open Explore the city and choose Scholars' garden, walk along the colonnade, return to the harbor, and speak with Dorian. Keep the source-reading and student argument as the purpose of the visit. The new scenery does not create new historical evidence.
