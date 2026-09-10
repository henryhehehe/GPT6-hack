# Scene life and Regency character review

2026-09-10. Follow-up to the submitted project, implemented locally for a separate release.

## Changes

The nine generated lesson worlds now give their companions staggered, short excursions: alternating planted steps, a pause with a glance toward the surroundings, and a return. Per-work and per-companion timing differs. Movement stays inside a 0.48 m radius and stops for walking visitors within 5 m, conversation gestures, and reduced motion. Navigation and conversation anchors stay fixed. Collision clearance includes the movement envelope.

Existing single-bone leg tubes needed a skin-weight correction before walking: upper trouser/hose vertices now follow the thigh and blend near the knee. The correction is restricted to registered authored character meshes and preserves other vertex attributes. Existing authored Idle, Greeting and Talk clips still run.

Outdoor scenes gain small gliding/flapping birds; planted garden/courtyard beds have local insect activity. Enclosed study, assembly and meeting scenes receive no wildlife. These are interpretive environmental details, not assertions about species or weather on a historical date. Wildlife does not intercept picking and is hidden for reduced motion.

The three Regency readers now use existing Quaternius head, eye and parted-hair assets, fitted to the original clothing and shared rig. Original gathered buns/ribbons remain. Continuous weighted sleeves replace separated upper/lower sleeves, with modest folds and a rounded shoulder. Facial UV seams are preserved; only the actual extraction rim is fitted beneath the collar. Hair normal maps are reduced to 512 px. Each final self-contained GLB is approximately 1.4–1.6 MB.

## Provenance and reproduction

These are fictional, period-informed companions, not portraits or exact historical reconstructions. Existing costume references remain the basis of the wardrobe. The CC0 components are credited in `assets/model-manifest.json` and the character catalog notice; original clothing, rig and gestures remain MIT.

Original component notice: `assets/external/licenses/quaternius-base-characters.txt`. Editable source: `assets/blender/characters/regency-readers.blend`, with packed textures. Regenerate with Blender 4.5:

```
blender --background --factory-startup --python scripts/blender/upgrade_regency_characters.py
node --import tsx scripts/catalog-characters.ts
```

The ordinary period-character builder delegates its Regency family to the new builder. Other character families keep their existing geometry.

## Verification

- 32 focused tests pass across character loading, independent rigs, finite poses, activity, real skinned surface attachment, setting navigation, atmosphere and wildlife.
- Real upper-leg surfaces tested across Greek, Georgian, nineteenth-century and new Regency coats. Tests reproduce the previous hip detachment and check the corrected attachment through a full movement cycle.
- All 21 GLBs retain verified sizes/hashes, skins, three gesture clips and finite animation bounds. Node geometry tests validate embedded PNG/JPEG storage before stripping only texture references for decoding; browser reviews exercise the original textured models.
- TypeScript and the required Sites build pass. Existing bundle-size advisory remains.
- Browser close views and timed movement captures cover Regency garden, Macbeth, Dickens street and Tempest; final corrected assets and gait reviewed in Regency, Dickens and Tempest. Reduced-motion checks and disposal tests pass.
- Blender front/side/peak-greeting views reviewed for head, hair, neck seam and sleeve fit. Local evidence: `output/lighting-review/living-scenes`, `living-scenes-motion` and `living-scenes-final`.

## Remaining limits

This pass adds small believable activity near existing stations, not a crowd simulation or long walking routes. Most older character bodies still have simplified topology, and the costumes are interpretive. Detailed head replacements currently cover only the reviewed Regency family. Alexandria's separate crowd implementation is outside this change.
