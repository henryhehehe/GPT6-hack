# Alexandria scene and character review — 10 September 2026

This pass makes the existing interpretive Alexandria more active and easier to explore. It does not claim an archaeologically exact reconstruction or photorealistic characters.

## Scene changes

- Repositioned 28 adult citizens around the working quay, real market aisles and library forecourt. Six rigged pedestrians now move through visible activity areas; other citizens face nearby goods, boats and work surfaces with gentle attention changes.
- Validated full routes against walking geometry, guide locations and arrival points. Named guides retain their fixed interaction anchors and established human heights.
- Connected guide approach greetings and conversation gestures through the shared character loader, including safe fallbacks, cache-versioned assets and disposal. Reduced-motion preference changes take effect without reloading.
- Added pinned cloth movement to market canopies and merchant sails, plus palm-tip wind. Rigid posts and cargo remain still. Shadow deformation follows the visible cloth, including cloned meshes and instanced foliage.
- Reflections now refresh when daylight or weather changes. Night uses a dark capture; renderer state is restored after captures and failures. Increased the existing sun shadow map within GPU limits.
- Added working-quay, market-stall and library-forecourt destinations; corrected harbor arrival facing. Moved phone walking controls away from menus and hide them while World tools is open. Distant conversation labels no longer cover the overview.

## Validation

- 37 focused automated checks passed, covering actual character GLBs, gestures, route clearance, wind/shadow shader integration, reduced motion and reflection resource/state handling. TypeScript and the required Sites production build passed.
- Existing Alexandria validators passed for all 28 kit exports and 30 detail exports, including placement/support, walking routes, scenario activity and failure cleanup.
- Real Chrome/WebGL tours completed on desktop and a 390×844 phone viewport. Actual pointer clicks reached every new city destination; phone document width remained390px. No JavaScript or WebGL shader errors were recorded.
- Desktop tour sampled60fps at the quay, market, forecourt and promenade on this machine. This is local evidence, not a low-end-device guarantee. Scene draw calls remain high (roughly835–1519 in those views).
- Two reduced-motion screenshots taken1.5seconds apart were pixel-identical.

Local visual evidence: `output/lighting-review/alexandria-life/`, `alexandria-mobile/`, and `alexandria-light-profiles/`.

## Interpretation and remaining limits

Crowd activities, fictional companions and architecture are teaching interpretations. Existing clothing provenance and source notices remain the authority for what is evidenced versus inferred. The scene still uses stylized bodies, hands and props; detailed faces alone do not make it photorealistic.
