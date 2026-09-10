# Separate scene loading from the classroom

The verified production candidate eagerly imported both Three.js renderers through the classroom. The classroom now loads its chosen renderer through a lazy boundary. Reading, writing, and classroom controls remain outside that boundary. A loading message and a scene-only error boundary provide a usable fallback when a scene chunk is slow or unavailable; the user can continue using the journal or reload the page.

No scene geometry, classroom state, API, stored evidence, or quota behavior changed. The illustrated-view branch continues to render without mounting either 3D renderer.

## Measured bundle result

Compared with candidate `73a951be1f8a38fc8ca8fbd5206d8fc93bb38c15`, using the official production build and traversing only static ESM imports from the emitted `Classroom-*.js` chunk:

| Classroom static dependency closure | Before | After |
| --- | ---: | ---: |
| JavaScript bytes | 1,636,216 | 804,479 |
| Sum of individually gzip-compressed chunks | 469,030 | 247,578 |
| Static chunks | 28 | 27 |
| Includes Three.js/shared scene chunk | Yes | No |

The measured gzip reduction is approximately 47%. Dynamic scene chunks still load when the scene is rendered, so these numbers are **not** total page transfer size or a measured load-time improvement. The existing large scene chunk remains approximately 715 KB uncompressed; splitting the dependency boundary does not make the renderer itself smaller. Device performance, request scheduling, and interaction latency still need a browser measurement.

Validation: TypeScript and the official production build passed; the emitted dependency graph confirms that neither renderer nor the shared engine is a static classroom dependency. No browser playtest, model calls, or production changes were performed. This is a separate follow-up to the frozen production candidate, ready for integration review.

Remaining high-value acceptance work: one complete teacher/two-student session with an in-flight failure/retry and saved revision; keyboard and narrow-screen recovery; and first-load/walking measurements on a named target device. The prior focused browser checks do not establish those full gates.
