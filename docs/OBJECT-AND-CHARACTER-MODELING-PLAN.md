# Everyday objects and characters — modeling work plan

September 10, 2026. Planning deliverable only; the assets and checks proposed below have not been produced or performed.

## Objective and scope

Create coherent, approachable 3D objects and characters for Counterfactual Worlds. Prioritize what students see while walking, reading evidence, and speaking with characters. The first delivery improves the existing Alexandria lesson; subsequent deliveries support the symbolic generated settings and then distinct Odyssey and Austen packs.

Interpret “models” as editable Blender assets exported to GLB for the existing Three.js application. This plan covers modeling, materials, modest animation, asset validation, and integration handoff. Backend learning fixes remain with the product implementation plan.

Read alongside [product readiness](PRODUCT-READINESS.md), [literature expansion](LITERATURE-EXPANSION.md), [open-model shortlist](OPEN-MODEL-SHORTLIST.md), [learning UX research](LEARNING-UX-RESEARCH.md), and [parallel implementation plan](PARALLEL-IMPLEMENTATION-PLAN.md). The latest [build log](BUILD-LOG.md) supersedes older reviews where work has since landed.

## Baseline found in the repository

- The library and lighthouse already have editable Blender source, generation scripts, GLB exports, and a geometry checker. Their recorded combined size is approximately 4.56 MB and 70,814 triangles. Preserve them for this pass.
- `WorldScene.tsx` uses simple geometry for crates, ships, 24 background citizens, and three named characters. Dorian is the harbor merchant, Thaleia the market trader, and Ione the archivist. Their profiles and dialogue behavior live in `lib/characters.ts`.
- `GeneratedWorldScene.tsx` implements symbolic coast, garden, and archive settings with simple props and actors. Teacher source intake exists; reviewed native Odyssey and Austen worlds remain future work. These are different levels of support.
- Existing interaction uses zone IDs and character callbacks. Individual source-bearing props will need an explicit binding; adding a mesh alone will not add a new reading activity.
- Existing documents report an archive-door/collision mismatch. Confirm current behavior before integration; a doorway model alone does not make the archive enterable.
- The external shortlist is research, not an installed asset collection. Recheck downloads and licenses during acquisition. No new external asset research was performed for this plan.
- The checkout contains ongoing application edits. Implementation should coordinate ownership before touching shared renderer or contract files.

## Art direction

Use warm, grounded stylization: convincing silhouettes, rounded usable edges, restrained surface wear, and readable faces. Match the existing sandstone, terracotta, wood, muted teal, and bronze palette. Spend detail on handles, rims, folds, hands, hair, and other features visible at conversation or inspection distance.

Everyday objects should look handled and functional. Characters should look welcoming and distinct through posture, silhouette, clothing, and accessories, rather than exaggerated demographic features. Avoid film likenesses, invented historical portrait claims, and costume detail presented as verified fact. Human proportions and clothing are artistic proposals pending reference review.

Use shared material families and controlled variation. Letters and scrolls open readable source panels; decorative texture marks must not look like authenticated quotations. Simulated characters, reconstructions, teaching props, and source text retain their separate labels.

## Prioritized asset backlog

“Interactive” below describes intended integration, not behavior supplied by the GLB. Variants share a base mesh/material where practical.

| Priority / kit | Planned assets | Purpose and completion gate |
| --- | --- | --- |
| P0 — Alexandria pottery | Amphora, storage jar, shallow bowl; restrained color/wear variants | Establish close-up quality at the market. Inspect handle/rim geometry and materials at walking distance. Adapt the shortlisted pottery only after acquisition checks; otherwise author the three forms. |
| P0 — Cargo and stall | Crate, tied sack, basket, rope coil, reusable stall table with canopy | Make harbor and market activity legible. Separate harbor cargo from market stock so one zone's scenario changes do not incorrectly control the other. Keep passages clear. |
| P0 — Writing and archive | Rolled scroll, open scroll, tablet/stylus, scroll rack, reading table | Provide recognizable approaches to existing source activities. The harbor ledger is explicitly an invented teaching prop; a reconstructed scroll is not an excavated Strabo manuscript. |
| P0 — Hero cast | Dorian, Thaleia, Ione; one shared humanoid rig with distinct heads, hair, garments, and accessory sets | Replace the three primitive teaching figures. Existing identity, source links, directory buttons, and dialogue histories survive the visual replacement. |
| P1 — Background people | Four economical clothing/head variants derived from the same style | Improve populated areas after the hero cast passes. Zone-specific placement; no new conversations implied. Avoid cloning the full hero character budget across all 24 citizens. |
| P1 — Archive activity space | Compact reading alcove or reachable reading station using the archive kit | Deliver a meaningful archive activity. An interior requires authored collision and safe entry/exit; a station needs matching UI wording and a real activity. Coordinate with the product owner. |
| P1 — Generated-setting adapters | Reusable prop clusters for coast, garden, archive; suitable neutral teaching-character appearances | Improve current imported lessons without presenting every garden as Austen or every shore as the Odyssey. Use an explicit reviewed asset mapping and preserve symbolic-setting labels. |
| P2 — Odyssey pack | Modular rocks, cave entrance/interior, merchant ship with mast/rigging, amphora reuse, economical sheep | Support shore → cave → departure passage activities. Create safe traversal and local source anchors. Plan a suitable traveler/crew appearance after roles and edition are frozen; defer a fully animated Cyclops. |
| P3 — Austen pack | Folded/open letter, writing desk, quill/inkwell, chair, sash-window/wall/door kit, garden path/bench | Support letter reading and comparison of interpretations in Chapters 35–36. Character representations of Elizabeth/Darcy require reviewed roles and reading boundaries; begin with a restrained posed figure only if useful to the lesson. |

First complete slice: **Thaleia + pottery + stall + one functioning source interaction** in the current market. Review this slice before multiplying the style across the remaining assets. It is the minimum useful checkpoint if time is constrained.

## Character production

1. Block out one shared human base at the existing scene scale. Compare its eyes, feet, and shoulder width with the student camera and nearby furniture before detailing.
2. Finish Thaleia as the style sample: readable face and hair, simple garment folds, defined hands and sandals, and a basket or pottery accessory. Review front, side, back, and actual conversation view.
3. Derive Dorian with a cargo-related accessory and Ione with a scroll. Give each a recognizable silhouette and retain the existing warm ochre, teal, and dusty-rose color associations.
4. Add a modest shared skeleton and short idle, greeting, and talking-gesture clips. Keep lower-body motion restrained for stationary dialogue. Facial animation, lip sync, cloth simulation, and crowds with pathfinding are deferred.
5. A static pose is the first shippable checkpoint; gesture animation follows once the mesh, picking, and directory fallback work. Reduced motion uses a stable pose. Animation never assigns assessment results or unlocks progress.
6. Replace whole-body camera facing with bounded facing behavior if needed for the finished rig. Use world-space positions when orienting characters or projecting labels under transformed parents. Keep hands/accessories clear of the torso during all clips.

## Asset and integration contract

Freeze these proposed conventions before production; they are not an existing application schema.

- **Coordinates:** Blender Z-up exported to glTF Y-up. Ground-level origin; character origin between the feet. Match existing facade direction: Blender -Y becomes Three.js +Z. Treat one runtime unit as an initial one-meter convention and verify against the current camera, steps, doors, and furniture.
- **Transforms:** Apply object rotation/scale before export; keep deliberate hinge and skeleton transforms. Preserve `ArchiveDoorLeft` and `ArchiveDoorRight` exactly, including hinge origins.
- **Named nodes:** `Root`, `Visual`, `Anchor_Inspect`, `Anchor_Talk`, `Anchor_Label`, and accessory sockets as applicable. Interaction hit volumes and simple collision proxies remain separate from visible detail; exporters/loaders must hide or exclude helper geometry from rendering.
- **Bindings:** An application-owned manifest maps a stable asset ID to a locally served file, allowed setting, zone, optional character ID, approved source/interaction ID, scale, anchors, fallback, bounds, and rights metadata. Resolve actual lesson sources at runtime; do not bake source IDs into shared pottery or letters.
- **Compatibility:** Keep current `harbor` / `market` / `library` callbacks for Alexandria. Coordinate native book place/character IDs with the versioned pack contract before making those renderers. A generated display name does not authorize arbitrary costume or literary identity selection.
- **Loading:** Load one exemplar first, then reuse geometry/materials for static variants. Preserve the primitive until the detailed asset is ready. Remove failed/late loads safely, avoid duplicate pick targets, and account for shared-resource ownership during disposal.
- **Interaction:** Picking a prop must resolve its assigned activity or source, not silently return an unrelated first source from the zone. Characters retain `onTalk` behavior, labels, keyboard/touch directory, and simulated-dialogue notices. Source access remains available when models or WebGL fail.
- **State:** Mesh replacement, source reading, and teacher intervention must preserve camera position and learner work. Classroom state controls hypothetical activity; asset code does not generate evidence, award credit, or decide a correct interpretation.

## Initial engineering budgets

These are proposed ceilings for the first measurement pass, not measured performance or guaranteed device support. Keep the existing shortlist targets of under 5 MB per hero asset and under 15 MB for a lesson's initial model/texture payload, including existing landmarks. Count shared resources once in downloads and every visible instance in render workload.

| Asset class | Proposed geometry target | Materials / textures |
| --- | --- | --- |
| Small prop | 300–3,000 triangles; up to 6,000 for a justified inspection hero | 1–2 materials; shared 1K atlas preferred |
| Furniture or stall | 2,000–8,000 triangles | 2–3 materials; 1K, up to 2K for a close-up surface |
| Hero character | 8,000–15,000 triangles each | At most 3 materials; 1–2K textures; target under 2 MB each |
| Background person | 1,000–3,000 triangles per visible instance | 1 shared material where practical; simple/static distant pose |
| Cave/ship module | Set after a representative module is loaded beside the existing scene | Shared 1–2K surfaces; cull/load only the needed region |

Capture baseline and updated cold-load time, transferred bytes, visible triangles, draw calls, texture memory estimate, and frame-time distribution on the actual demo device at the same viewport and walk route. Provisional floor: sustained 30 FPS while walking, with a 60 FPS goal on the demo laptop. Reduce visible complexity before expanding the kit if the first slice misses the floor. Texture compression or new decoder dependencies require coordinator integration and a measured benefit.

## Execution sequence and deliverables

Estimates are hands-on planning ranges for one asset specialist with scene-owner support. Re-estimate after the first slice; detailed character work and asset cleanup can dominate the schedule.

| Stage | Work and output | Gate / estimated effort |
| --- | --- | --- |
| 0 — Lock baseline | Inspect current assets in Blender and the browser; record scale, palette, navigation route, performance baseline, current commit, and target device. Freeze manifest/anchor contract with scene owner. | Existing interactions documented; 2–3 hours |
| 1 — Market slice | Thaleia blockout and finished mesh, three pottery forms, stall prototype, editable source, GLBs, preview sheet, one wired source interaction. | Looks coherent in current lighting; source and conversation work; 6–10 hours |
| 2 — Alexandria kit | Remaining hero cast, cargo and writing kit, shared materials, static-pose release and optional gesture clips. | Every P0 item passes asset inspection; 8–14 hours |
| 3 — Integration and review | Zone placement, source bindings, loader cleanup/fallback, keyboard/touch access, collision review, measured performance, credits. | All acceptance checks below; 4–6 hours |
| 4 — Expansion | Generated-setting adapters, then Odyssey coast/cave first, Austen second. | Require pack/source contracts and a completed Alexandria loop; estimate each separately after blockout |

Alexandria planning range: **20–33 hands-on hours**, excluding optional background crowds, an archive interior, literature worlds, and external review availability. For a short hackathon window, ship Stage 1 with its integration checks and keep the rest as an explicit backlog.

Proposed deliverable locations:

- `assets/blender/props/` and `assets/blender/characters/`: editable source, preview renders, production notes.
- `scripts/blender/build_props.py`, `build_characters.py`: reproducible procedural construction where appropriate; deterministic export of any manually authored source, with tool/version recorded.
- `public/models/props/` and `public/models/characters/`: reviewed runtime GLBs only.
- `assets/model-manifest.json`: proposed asset/rights inventory, subject to coordinator agreement.
- `scripts/check-models.mjs`: loader, budget, bounds, anchor, and optional rig/clip checks adapted from the landmark checker.
- `docs/MODEL-QA.md`: actual asset measurements, browser observations, screenshots, unresolved defects, and exact reviewed revision.

For acquired assets, record creator, title, supported download/source URL, exact license/version, acquisition date, original checksum, and modifications. Preserve attribution in the shipped app. Check mesh/material quality before acceptance; fall back to authored geometry if acquisition is blocked or unsuitable.

## Ownership and dependencies

During implementation, the asset specialist owns Blender sources, model exports, and asset scripts. The scene owner integrates loaders, picking, placement, and traversal. The coordinator owns shared schemas/manifests, dependencies, application-wide contracts, and release. This plan does not dispatch agents or start those implementation tracks.

Assets can be built against a frozen local contract while backend work proceeds. Source bindings, archive access, per-zone activity, and native literature identities depend on scene/product changes and must be handed off explicitly. Do not mark these complete based on delivered geometry.

## Acceptance checks

1. **Recognizable and coherent:** inspect every asset from front/back and in the walking camera. No missing textures, inverted faces, floating feet, visible intersections, inconsistent scales, or unusable letter text. The three hero characters are distinguishable without relying only on color.
2. **Purposeful interaction:** one real student can approach the market slice, read the intended source, cite it, talk to Thaleia, and return to the same position. Keyboard/touch alternatives work; a forced GLB failure preserves access.
3. **State and causality:** isolated harbor/market/library changes affect their assigned prop groups. Named teaching characters remain available in both scenarios. Teacher interventions and asset loading preserve source selections, argument, conversation, and progression.
4. **Traversal and animation:** visible openings agree with collision; character accessories do not obstruct paths or picking; animation and reduced-motion poses work without clipping. Existing archive door names and motion pass the landmark checker.
5. **Measured delivery:** GLBs pass loader/budget/anchor checks. Compare the same route before/after on the target device and record results. Run relevant scene/navigation tests, TypeScript, and one production build after integration; these do not replace visual checks.
6. **Trustworthy presentation:** each acquired model has complete rights records and credits. Architecture, props, costumes, and generated dialogue remain interpretive or simulated. A polished object never becomes primary evidence through appearance alone.

Record only completed work in the build log. Full product readiness still requires the separate final review and teacher/two-student rehearsal specified in the product readiness document.
