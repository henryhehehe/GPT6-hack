# Human scale and street life

One Three.js unit is treated as one metre for people and everyday furniture. The walk camera is 1.62 m above the navigation surface, normal travel is 2.1 m/s, and Shift jogs at 4.6 m/s. Named adults range from 1.64–1.78 m; background adults range from 1.58–1.88 m. Monumental architecture retains its existing interpretive dimensions.

The measured shipped GLBs previously gave stools about .69 m height and benches .74 m. Runtime calibration now places seats around .47–.50 m, market counters at .81 m above the ground and canopy peaks at 2.85 m. Desk surfaces and their separate lamp props move together. The camera no longer approaches these objects at a default running speed.

Street crowds use the four existing authored citizen GLBs. These models contain no walk clips or skinning. Twenty-two retain their full authored stationary bodies; six use extracted authored faces/hair with proportioned articulated tunics and limbs. Distance-driven stance/swing motion, endpoint pauses, gradual turns, and proximity yielding replace the old sliding capsule crowd. This is procedural animation, not motion capture. Routes are checked against the player collision geometry. Activity varies with the corresponding lesson zone; decorative people are never represented as actual students.

Human feet are placed at the navigation surface. Named characters turn toward nearby visitors gradually, rather than constantly tracking the orbit camera. Shared materials/geometry, distance-based animation updates, reduced-motion behavior and teardown disposal bound rendering work. Normal shadow bias is lower, exposure is modestly brighter, water distortion is calmer, and detached distant houses over the sea have been removed.

Validation: actual-GLB furniture measurements, safe crowd routes, collision recovery when yielding, existing walking routes, TypeScript and a production build. Browser checks include student eye level near the library and harbor crowd. A sampled view rendered at 72 FPS on the development machine; this is not a device-independent performance guarantee. The authored visual style remains illustrative rather than photorealistic.

Related saved-world checkpoint: `6db1265` adds the teacher library, separate reusable classroom copies, teacher-only list access, full stored source preservation, and recovery for expired illustration jobs. The active release coordinator must preserve the deployed learner-review and pilot controls when merging these scene changes.
