# Alexandria scene and character review — 10 September 2026

This pass makes the existing interpretive Alexandria more active and easier to explore. It does not claim an archaeologically exact reconstruction or photorealistic characters.

## Scene changes

- Repositioned 28 adult citizens around the working quay, real market aisles and library forecourt. Six rigged pedestrians now move through visible activity areas; other citizens face nearby goods, boats and work surfaces with gentle attention changes.
- Validated full routes against walking geometry, guide locations and arrival points. Named guides retain their fixed interaction anchors and established human heights.
- Connected guide approach greetings and conversation gestures through the shared character loader, including safe fallbacks, cache-versioned assets and disposal. Reduced-motion preference changes take effect without reloading.
- Added pinned cloth movement to market canopies and merchant sails, plus palm-tip wind. Rigid posts and cargo remain still. Shadow deformation follows the visible cloth, including cloned meshes and instanced foliage.
- Reflections now refresh when daylight or weather changes. Night uses a dark capture; renderer state is restored after captures and failures. Increased the existing sun shadow map within GPU limits.
- Added working-quay, market-stall and library-forecourt destinations; corrected harbor arrival facing. Moved phone walking controls away from menus and hide them while World tools is open. Distant conversation labels no longer cover the overview.

## Character replacement

Dorian, Thaleia and Ione now use fitted detailed heads, eyes and hair from the existing CC0 Quaternius kit, with Dorian’s fitted beard and the original interpretive Greek wardrobes. Continuous weighted arms replace separate elbow segments, and the gathered hair joins and skin palettes were adjusted. Idle, Greeting, Talk, interaction anchors and runtime heights remain intact.

The three exports total 2,039,160 bytes. Removing unused UV/color attributes, packing standard normalized vertex weights/colors, and resizing textures kept the complete Alexandria model load at 14,936,504 bytes, below the existing 15 MB ceiling. Face geometry was not decimated, and no runtime decoder was added. Editable Blender source, a reproducible upgrade script and mixed-source notices are included.

## Validation

- 38 focused automated checks passed, covering actual character GLBs, gestures, route clearance, wind/shadow shader integration, reduced motion and reflection resource/state handling. TypeScript and the required Sites production build passed.
- Existing Alexandria validators passed for all 28 kit exports and 30 detail exports, including placement/support, walking routes, scenario activity and failure cleanup.
- Real Chrome/WebGL tours completed on desktop and a 390×844 phone viewport. Actual pointer clicks reached every new city destination; phone document width remained 390px. No JavaScript or WebGL shader errors were recorded.
- Desktop tour sampled 60fps at the quay, market, forecourt and promenade on this machine. This is local evidence, not a low-end-device guarantee. Scene draw calls remain high (roughly 835–1519 in those views).
- An isolated browser harness also rendered day, dawn, sunset, night, and overcast profiles without errors (56–60fps locally). Sunset and night screenshots were visually inspected; night no longer retains golden daytime reflections. The temporary harness is not shipped.
- The final optimized cast passed Blender export/reimport inspection and actual in-world close-ups of all three guides. The final browser recorded no errors and 60fps locally; all three turned toward the visitor with their authored animations intact. Evidence is in `output/lighting-review/alexandria-final-cast/`.
- Two reduced-motion screenshots taken 1.5 seconds apart were pixel-identical.

Local visual evidence: `output/lighting-review/alexandria-life/`, `alexandria-mobile/`, and `alexandria-light-profiles/`.

## Interpretation and remaining limits

Crowd activities, fictional companions and architecture are teaching interpretations. Existing clothing provenance and source notices remain the authority for what is evidenced versus inferred. The scene still uses stylized bodies, hands and props; detailed faces alone do not make it photorealistic.
