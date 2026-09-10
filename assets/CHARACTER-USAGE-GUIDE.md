# Teaching character usage guide

Generated with `node --import tsx scripts/catalog-characters.ts` from the authored manifest and actual cast assignments. No models or manifests are modified.

21 independent rigged character assets serve the ten lesson worlds. The catalog at /model-catalog?collection=characters previews one at a time. A lesson loads its assigned three, not the whole collection. Clothing references inform interpretation; the fictional companions are not portraits of historical people.

## Shared integration rules

- Preserve independently loaded skeletons, the existing fallback groups, source/talk picking and scene cleanup.
- Themed scenes use `loadThemedCharacters`; Alexandria uses `loadTeachingCharacters`. Their update and readiness APIs differ.
- Preview dimensions describe source geometry. The runtime applies its own grounding/centering and character-height normalization.
- Keep the MIT copyright and permission notice when redistributing the original wardrobe and animation assets. Regency head, eye and parted-hair components are adapted from the CC0 Quaternius kit; see the combined notice.

## Dorian · harbor merchant

ID: `dorian` · 596,572 bytes · 11,664 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.9059 / 0.4745 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/alexandria-cast.blend`. Anchors: dorian__Anchor_Talk, dorian__Anchor_Label.
[Runtime GLB](../public/models/characters/dorian.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `6f55f3f255017bd2e5b03d0c3af70b82fb87933a37830ed3a34771d9dc4c9764`

### The scholarly waterfront · Harbor guide
Ancient Mediterranean interpretation
Tunic and mantle companions; Strabo’s passage does not specify their clothing.
[Open lesson](http://localhost:5173/worlds?lesson=alexandria-01)
- [The Met · Ancient Greek dress](https://www.metmuseum.org/es/essays/ancient-greek-dress)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { loadTeachingCharacters } from '@/components/worlds/scene/teachingCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.character = zone; });
  return loadTeachingCharacters(zones.map(zone => anchors[zone]));
}

// Existing WorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion).
// cast.loaded resolves after loading settles. Keep existing onTalk hooks.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
```

### The Cyclops episode · Aegean shore · Cave observer
Greek literary interpretation
Greek-inspired tunics and mantles illustrate a mythic story; they are not a verified Bronze Age reconstruction.
[Open lesson](http://localhost:5173/worlds?lesson=odyssey-ix-01)
- [The Met · Ancient Greek dress](https://www.metmuseum.org/es/essays/ancient-greek-dress)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['odyssey-ix'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Earlymodern-informed reader: doublet

ID: `earlymodern-doublet` · 540,336 bytes · 10,524 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.8999 / 0.4751 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/earlymodern-readers.blend`. Anchors: earlymodern-doublet__Anchor_Talk, earlymodern-doublet__Anchor_Label.
[Runtime GLB](../public/models/characters/earlymodern-doublet.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `602b165979ca911e4fa4b0f2bb1811ebcc6649a3780b2e283610c0c3e2c8a0f2`

### An island after the storm · Account examiner
Early seventeenth-century stage inspiration
Doublet, gown and jerkin evoke Shakespeare’s theatre period. The fictional island has no verified local wardrobe.
[Open lesson](http://localhost:5173/worlds?lesson=tempest-01)
- [V&A · Shakespeare trail, doublet 1615–20](https://www.vam.ac.uk/articles/vampa-trail-shakespeares-magic)
- [Folger · The Tempest performance record](https://shakespearedocumented.folger.edu/plays-poetry/tempest)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['tempest'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Earlymodern-informed reader: gown

ID: `earlymodern-gown` · 512,604 bytes · 9,900 triangles · 2 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.904 / 0.6262 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/earlymodern-readers.blend`. Anchors: earlymodern-gown__Anchor_Talk, earlymodern-gown__Anchor_Label.
[Runtime GLB](../public/models/characters/earlymodern-gown.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `fb4a1404a407b6bd419e4ffabd8f470c9963050868c119749ed46f2e22c514d3`

### An island after the storm · Storm reader
Early seventeenth-century stage inspiration
Doublet, gown and jerkin evoke Shakespeare’s theatre period. The fictional island has no verified local wardrobe.
[Open lesson](http://localhost:5173/worlds?lesson=tempest-01)
- [V&A · Shakespeare trail, doublet 1615–20](https://www.vam.ac.uk/articles/vampa-trail-shakespeares-magic)
- [Folger · The Tempest performance record](https://shakespearedocumented.folger.edu/plays-poetry/tempest)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['tempest'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Earlymodern-informed reader: jerkin

ID: `earlymodern-jerkin` · 561,996 bytes · 10,956 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.8999 / 0.4751 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/earlymodern-readers.blend`. Anchors: earlymodern-jerkin__Anchor_Talk, earlymodern-jerkin__Anchor_Label.
[Runtime GLB](../public/models/characters/earlymodern-jerkin.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `17d8622983eeb620e1c60ebca3d5ca2efcc95cfa8a7aa353ea83ed41be94146e`

### An island after the storm · Dialogue reader
Early seventeenth-century stage inspiration
Doublet, gown and jerkin evoke Shakespeare’s theatre period. The fictional island has no verified local wardrobe.
[Open lesson](http://localhost:5173/worlds?lesson=tempest-01)
- [V&A · Shakespeare trail, doublet 1615–20](https://www.vam.ac.uk/articles/vampa-trail-shakespeares-magic)
- [Folger · The Tempest performance record](https://shakespearedocumented.folger.edu/plays-poetry/tempest)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['tempest'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Georgian-informed reader: coat

ID: `georgian-coat` · 593,836 bytes · 11,044 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.8999 / 0.4869 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/georgian-readers.blend`. Anchors: georgian-coat__Anchor_Talk, georgian-coat__Anchor_Label.
[Runtime GLB](../public/models/characters/georgian-coat.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `ab9064510680a82206fa3b11977bac6dbda85f21cd4c6f9583648ec26537cf45`

### Philadelphia · a document workshop · Principles reader
Philadelphia, 1776 · clothing interpretation
Curved-front coats, waistcoats, knee breeches and a full-length gown draw on eighteenth-century garments. These readers are not convention delegates.
[Open lesson](http://localhost:5173/worlds?lesson=declaration-01)
- [The Met · Suit, 1770–80](https://www.metmuseum.org/art/collection/search/623325)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['declaration'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

### Letters and the study · Narrative examiner
Eighteenth-century narrative frame
Walton dates his letters 17—. The wardrobe uses a late-eighteenth-century analogy, with no exact decade asserted; 1831 is the edition date.
[Open lesson](http://localhost:5173/worlds?lesson=frankenstein-01)
- [The Met · Suit, 1770–80](https://www.metmuseum.org/art/collection/search/623325)
- [Frankenstein · Letter I](https://www.gutenberg.org/files/42324/42324-h/42324-h.htm)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['frankenstein'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Georgian-informed reader: gown

ID: `georgian-gown` · 512,580 bytes · 9,900 triangles · 2 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.904 / 0.6262 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/georgian-readers.blend`. Anchors: georgian-gown__Anchor_Talk, georgian-gown__Anchor_Label.
[Runtime GLB](../public/models/characters/georgian-gown.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `4d7452fb7824ac0b540f2c83779ed1a4bf1a643de58ccb623e0587f9bb347ddb`

### Philadelphia · a document workshop · Grievance examiner
Philadelphia, 1776 · clothing interpretation
Curved-front coats, waistcoats, knee breeches and a full-length gown draw on eighteenth-century garments. These readers are not convention delegates.
[Open lesson](http://localhost:5173/worlds?lesson=declaration-01)
- [The Met · Suit, 1770–80](https://www.metmuseum.org/art/collection/search/623325)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['declaration'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

### Letters and the study · Correspondence reader
Eighteenth-century narrative frame
Walton dates his letters 17—. The wardrobe uses a late-eighteenth-century analogy, with no exact decade asserted; 1831 is the edition date.
[Open lesson](http://localhost:5173/worlds?lesson=frankenstein-01)
- [The Met · Suit, 1770–80](https://www.metmuseum.org/art/collection/search/623325)
- [Frankenstein · Letter I](https://www.gutenberg.org/files/42324/42324-h/42324-h.htm)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['frankenstein'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Georgian-informed reader: waistcoat

ID: `georgian-waistcoat` · 583,744 bytes · 10,848 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.8999 / 0.4751 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/georgian-readers.blend`. Anchors: georgian-waistcoat__Anchor_Talk, georgian-waistcoat__Anchor_Label.
[Runtime GLB](../public/models/characters/georgian-waistcoat.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `928fc459c7647839f93ea804d544f32f33fe16adcf8fa517279d85505d63ea6b`

### Philadelphia · a document workshop · Document reader
Philadelphia, 1776 · clothing interpretation
Curved-front coats, waistcoats, knee breeches and a full-length gown draw on eighteenth-century garments. These readers are not convention delegates.
[Open lesson](http://localhost:5173/worlds?lesson=declaration-01)
- [The Met · Suit, 1770–80](https://www.metmuseum.org/art/collection/search/623325)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['declaration'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

### Letters and the study · Research reader
Eighteenth-century narrative frame
Walton dates his letters 17—. The wardrobe uses a late-eighteenth-century analogy, with no exact decade asserted; 1831 is the edition date.
[Open lesson](http://localhost:5173/worlds?lesson=frankenstein-01)
- [The Met · Suit, 1770–80](https://www.metmuseum.org/art/collection/search/623325)
- [Frankenstein · Letter I](https://www.gutenberg.org/files/42324/42324-h/42324-h.htm)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['frankenstein'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Ione · archivist

ID: `ione` · 628,720 bytes · 12,776 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.9107 / 0.461 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/alexandria-cast.blend`. Anchors: ione__Anchor_Talk, ione__Anchor_Label.
[Runtime GLB](../public/models/characters/ione.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `93433421f8c966e5979a1bd61785481dcceb1e5ff5c9d92939fd71b08c5f7244`

### The scholarly waterfront · Archive guide
Ancient Mediterranean interpretation
Tunic and mantle companions; Strabo’s passage does not specify their clothing.
[Open lesson](http://localhost:5173/worlds?lesson=alexandria-01)
- [The Met · Ancient Greek dress](https://www.metmuseum.org/es/essays/ancient-greek-dress)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { loadTeachingCharacters } from '@/components/worlds/scene/teachingCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.character = zone; });
  return loadTeachingCharacters(zones.map(zone => anchors[zone]));
}

// Existing WorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion).
// cast.loaded resolves after loading settles. Keep existing onTalk hooks.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
```

### The Cyclops episode · Aegean shore · Voyage reader
Greek literary interpretation
Greek-inspired tunics and mantles illustrate a mythic story; they are not a verified Bronze Age reconstruction.
[Open lesson](http://localhost:5173/worlds?lesson=odyssey-ix-01)
- [The Met · Ancient Greek dress](https://www.metmuseum.org/es/essays/ancient-greek-dress)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['odyssey-ix'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Medieval-informed reader: cloak

ID: `medieval-cloak` · 526,372 bytes · 10,052 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.8999 / 0.5143 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/medieval-readers.blend`. Anchors: medieval-cloak__Anchor_Talk, medieval-cloak__Anchor_Label.
[Runtime GLB](../public/models/characters/medieval-cloak.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `6c9657688b5365b107af4e0aecd08d204cf4c9b24728e335ee74323d3f340ccf`

### A heath and a threshold · Decision guide
Eleventh-century-inspired clothing
Plain tunics, a gown and a mantle use broad medieval analogies. Exact Scottish dress is not established by these models.
[Open lesson](http://localhost:5173/worlds?lesson=macbeth-01)
- [Reading Museum · Bayeux costume guide](https://collections.readingmuseum.org.uk/pdfs/H193B.pdf)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['macbeth'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Medieval-informed reader: gown

ID: `medieval-gown` · 508,944 bytes · 9,740 triangles · 2 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.904 / 0.5588 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/medieval-readers.blend`. Anchors: medieval-gown__Anchor_Talk, medieval-gown__Anchor_Label.
[Runtime GLB](../public/models/characters/medieval-gown.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `8cd9b330266008c9911ae6fd3a75deefa3565fb611c587741c7bc863cc6ba995`

### A heath and a threshold · Letter examiner
Eleventh-century-inspired clothing
Plain tunics, a gown and a mantle use broad medieval analogies. Exact Scottish dress is not established by these models.
[Open lesson](http://localhost:5173/worlds?lesson=macbeth-01)
- [Reading Museum · Bayeux costume guide](https://collections.readingmuseum.org.uk/pdfs/H193B.pdf)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['macbeth'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Medieval-informed reader: tunic

ID: `medieval-tunic` · 487,664 bytes · 9,308 triangles · 2 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.8999 / 0.4238 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/medieval-readers.blend`. Anchors: medieval-tunic__Anchor_Talk, medieval-tunic__Anchor_Label.
[Runtime GLB](../public/models/characters/medieval-tunic.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `f95802baffbb268ca01d01dc0f1a0f49b756bcfb973871352ee284385125d699`

### A heath and a threshold · Theatre reader
Eleventh-century-inspired clothing
Plain tunics, a gown and a mantle use broad medieval analogies. Exact Scottish dress is not established by these models.
[Open lesson](http://localhost:5173/worlds?lesson=macbeth-01)
- [Reading Museum · Bayeux costume guide](https://collections.readingmuseum.org.uk/pdfs/H193B.pdf)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['macbeth'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Reader in a tailored coat

ID: `reader-coat` · 538,864 bytes · 10,434 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.9009 / 0.4472 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/reader-cast.blend`. Anchors: reader-coat__Anchor_Talk, reader-coat__Anchor_Label.
[Runtime GLB](../public/models/characters/reader-coat.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `808dee51dcecad826c0a0daec87f8777eefaf7aa590004e29304b5a293ade976`

### A winter street · three reading rooms · Household reader
1840s reading companions
Coats, trousers and a natural-waist gown frame the 1843 story. They do not reconstruct every time visited by the ghosts.
[Open lesson](http://localhost:5173/worlds?lesson=christmas-carol-01)
- [The Met · Morning dress, 1840–45](https://www.metmuseum.org/art/collection/search/108064)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['christmas-carol'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

### Seneca Falls · a declaration workshop · Sentiments reader
Seneca Falls, 1848 · clothing interpretation
Natural-waist dress, full skirt and tailored separates. The later 1851 Bloomer reform costume is not used.
[Open lesson](http://localhost:5173/worlds?lesson=seneca-falls-01)
- [The Met · American afternoon dress, c.1845](https://www.metmuseum.org/art/collection/search/159519)
- [National Park Service · Bloomers on the Trail](https://www.nps.gov/articles/000/bloomers-on-the-trail.htm)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['seneca-falls'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Reader in a dress and shoulder shawl

ID: `reader-dress` · 662,868 bytes · 13,134 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.9057 / 0.493 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/reader-cast.blend`. Anchors: reader-dress__Anchor_Talk, reader-dress__Anchor_Label.
[Runtime GLB](../public/models/characters/reader-dress.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `9f8b218f9055ca1cb3ed8a514765fc4c8e06219ff69f710f8bbd53823feda246`

### A winter street · three reading rooms · Memory reader
1840s reading companions
Coats, trousers and a natural-waist gown frame the 1843 story. They do not reconstruct every time visited by the ghosts.
[Open lesson](http://localhost:5173/worlds?lesson=christmas-carol-01)
- [The Met · Morning dress, 1840–45](https://www.metmuseum.org/art/collection/search/108064)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['christmas-carol'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

### Seneca Falls · a declaration workshop · Comparison reader
Seneca Falls, 1848 · clothing interpretation
Natural-waist dress, full skirt and tailored separates. The later 1851 Bloomer reform costume is not used.
[Open lesson](http://localhost:5173/worlds?lesson=seneca-falls-01)
- [The Met · American afternoon dress, c.1845](https://www.metmuseum.org/art/collection/search/159519)
- [National Park Service · Bloomers on the Trail](https://www.nps.gov/articles/000/bloomers-on-the-trail.htm)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['seneca-falls'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Reader in a waistcoat and long sleeves

ID: `reader-waistcoat` · 569,648 bytes · 11,098 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.9057 / 0.476 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/reader-cast.blend`. Anchors: reader-waistcoat__Anchor_Talk, reader-waistcoat__Anchor_Label.
[Runtime GLB](../public/models/characters/reader-waistcoat.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `0aba444a9e532e2d5a0836dd2c441c2d43cdff275b9df599511ca3978879fb87`

### A winter street · three reading rooms · Counting-house reader
1840s reading companions
Coats, trousers and a natural-waist gown frame the 1843 story. They do not reconstruct every time visited by the ghosts.
[Open lesson](http://localhost:5173/worlds?lesson=christmas-carol-01)
- [The Met · Morning dress, 1840–45](https://www.metmuseum.org/art/collection/search/108064)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['christmas-carol'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

### Seneca Falls · a declaration workshop · Claims examiner
Seneca Falls, 1848 · clothing interpretation
Natural-waist dress, full skirt and tailored separates. The later 1851 Bloomer reform costume is not used.
[Open lesson](http://localhost:5173/worlds?lesson=seneca-falls-01)
- [The Met · American afternoon dress, c.1845](https://www.metmuseum.org/art/collection/search/159519)
- [National Park Service · Bloomers on the Trail](https://www.nps.gov/articles/000/bloomers-on-the-trail.htm)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['seneca-falls'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Regency-informed reader: coat

ID: `regency-coat` · 1,409,136 bytes · 13,219 triangles · 6 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.7452 / 0.4869 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/regency-readers.blend`. Anchors: regency-coat__Anchor_Talk, regency-coat__Anchor_Label.
[Runtime GLB](../public/models/characters/regency-coat.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `3bdbb52be8c52b8c2bdc9606364ebdb351ca8697f1316f14f9c45053af94de2b`

### Near Hunsford · a garden for reading · Evidence editor
Regency clothing interpretation
Raised-waist gowns and a cutaway coat replace the later silhouettes. An 1810–12 museum gown informs the shape, not an exact daywear replica.
[Open lesson](http://localhost:5173/worlds?lesson=austen-letter-01)
- [The Met · Evening dress, 1810–12](https://www.metmuseum.org/art/collection/search/157539)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['austen-letter'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Regency-informed reader: dress

ID: `regency-dress` · 1,601,336 bytes · 14,437 triangles · 5 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.7655 / 0.4792 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/regency-readers.blend`. Anchors: regency-dress__Anchor_Talk, regency-dress__Anchor_Label.
[Runtime GLB](../public/models/characters/regency-dress.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `d1acd4e13cf9c3987f9a94a657261ff84b4dec46ec8a5ee6a21dd77943cea025`

### Near Hunsford · a garden for reading · Reading companion
Regency clothing interpretation
Raised-waist gowns and a cutaway coat replace the later silhouettes. An 1810–12 museum gown informs the shape, not an exact daywear replica.
[Open lesson](http://localhost:5173/worlds?lesson=austen-letter-01)
- [The Met · Evening dress, 1810–12](https://www.metmuseum.org/art/collection/search/157539)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['austen-letter'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Regency-informed reader: gown

ID: `regency-gown` · 1,601,300 bytes · 14,437 triangles · 5 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.7655 / 0.4792 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/regency-readers.blend`. Anchors: regency-gown__Anchor_Talk, regency-gown__Anchor_Label.
[Runtime GLB](../public/models/characters/regency-gown.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `82d7469e0a2323a3b64d12f0323dfc5ee314aeaecbbd420598505466f182d409`

### Near Hunsford · a garden for reading · Letter reader
Regency clothing interpretation
Raised-waist gowns and a cutaway coat replace the later silhouettes. An 1810–12 museum gown informs the shape, not an exact daywear replica.
[Open lesson](http://localhost:5173/worlds?lesson=austen-letter-01)
- [The Met · Evening dress, 1810–12](https://www.metmuseum.org/art/collection/search/157539)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['austen-letter'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Romantic-informed reader: coat

ID: `romantic-coat` · 540,748 bytes · 10,472 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.8999 / 0.4869 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/romantic-readers.blend`. Anchors: romantic-coat__Anchor_Talk, romantic-coat__Anchor_Label.
[Runtime GLB](../public/models/characters/romantic-coat.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `ae89172e35df4a418ee9f2073728f646903107f60df6fb6a3839ad7a4b0035a9`

### Baltimore · a testimony reading space · Literacy reader
Baltimore, 1826–1833 · clothing interpretation
A transitional gown, coat and trousers follow the narrated literacy years, not the 1845 publication date. These companions do not portray Douglass or the Auld family.
[Open lesson](http://localhost:5173/worlds?lesson=douglass-literacy-01)
- [National Park Service · Douglass chronology](https://www.nps.gov/frdo/learn/kidsyouth/chronology.htm)
- [The Met · American morning dress, 1825–30](https://www.metmuseum.org/art/collection/search/174272)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['douglass-literacy'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Romantic-informed reader: gown

ID: `romantic-gown` · 655,040 bytes · 12,948 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.9047 / 0.6262 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/romantic-readers.blend`. Anchors: romantic-gown__Anchor_Talk, romantic-gown__Anchor_Label.
[Runtime GLB](../public/models/characters/romantic-gown.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `5c7d5863fb8ef538b322bac20c02f34d48ac1010e961235c1449e72e0981ad01`

### Baltimore · a testimony reading space · Testimony reader
Baltimore, 1826–1833 · clothing interpretation
A transitional gown, coat and trousers follow the narrated literacy years, not the 1845 publication date. These companions do not portray Douglass or the Auld family.
[Open lesson](http://localhost:5173/worlds?lesson=douglass-literacy-01)
- [National Park Service · Douglass chronology](https://www.nps.gov/frdo/learn/kidsyouth/chronology.htm)
- [The Met · American morning dress, 1825–30](https://www.metmuseum.org/art/collection/search/174272)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['douglass-literacy'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Romantic-informed reader: waistcoat

ID: `romantic-waistcoat` · 530,656 bytes · 10,276 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.8999 / 0.4751 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/romantic-readers.blend`. Anchors: romantic-waistcoat__Anchor_Talk, romantic-waistcoat__Anchor_Label.
[Runtime GLB](../public/models/characters/romantic-waistcoat.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `e4c643c0570469d0ca762d7171639c420cbafbcdd9aa3baa9aa56c1e5cb46981`

### Baltimore · a testimony reading space · Context examiner
Baltimore, 1826–1833 · clothing interpretation
A transitional gown, coat and trousers follow the narrated literacy years, not the 1845 publication date. These companions do not portray Douglass or the Auld family.
[Open lesson](http://localhost:5173/worlds?lesson=douglass-literacy-01)
- [National Park Service · Douglass chronology](https://www.nps.gov/frdo/learn/kidsyouth/chronology.htm)
- [The Met · American morning dress, 1825–30](https://www.metmuseum.org/art/collection/search/174272)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['douglass-literacy'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

## Thaleia · market trader

ID: `thaleia` · 711,072 bytes · 14,300 triangles · 3 materials · 1 skins.
Source dimensions X/Y/Z: 0.968 / 1.9107 / 0.461 m. Clips: Idle, Greeting, Talk.
Editable source: `assets/blender/characters/alexandria-cast.blend`. Anchors: thaleia__Anchor_Talk, thaleia__Anchor_Label.
[Runtime GLB](../public/models/characters/thaleia.glb) · [MIT notice](../public/models/characters/LICENSE.txt)
SHA-256: `190ff713c5ade2c9c61c34a4d88e2e0d5643d6da2947d9eafc1ea11789ed8ba4`

### The scholarly waterfront · Market guide
Ancient Mediterranean interpretation
Tunic and mantle companions; Strabo’s passage does not specify their clothing.
[Open lesson](http://localhost:5173/worlds?lesson=alexandria-01)
- [The Met · Ancient Greek dress](https://www.metmuseum.org/es/essays/ancient-greek-dress)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { loadTeachingCharacters } from '@/components/worlds/scene/teachingCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.character = zone; });
  return loadTeachingCharacters(zones.map(zone => anchors[zone]));
}

// Existing WorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion).
// cast.loaded resolves after loading settles. Keep existing onTalk hooks.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
```

### The Cyclops episode · Aegean shore · Shore reader
Greek literary interpretation
Greek-inspired tunics and mantles illustrate a mythic story; they are not a verified Bronze Age reconstruction.
[Open lesson](http://localhost:5173/worlds?lesson=odyssey-ix-01)
- [The Met · Ancient Greek dress](https://www.metmuseum.org/es/essays/ancient-greek-dress)

```ts
import type { Group } from 'three';
import type { ZoneId } from '@/lib/world';
import { WORLD_THEMES } from '@/lib/worldThemes';
import { loadThemedCharacters } from '@/components/worlds/scene/themedCharacters';

// Reuse the three positioned fallback groups already attached to the scene.
export function attachCast(anchors: Record<ZoneId, Group>) {
  const zones: ZoneId[] = ['harbor', 'market', 'library'];
  zones.forEach(zone => { anchors[zone].userData.npc = zone; });
  return loadThemedCharacters(WORLD_THEMES['odyssey-ix'], anchors);
}

// Existing GeneratedWorldScene already attaches this cast.
// Per frame: cast.update(dt, reducedMotion, camera.position, walking).
// cast.ready reports per-station results; a failed load preserves its fallback.
// Call cast.talk(zone) alongside your existing onTalk callback.
// Call cast.dispose() during scene cleanup, before disposing the parent scene.
// Independent characters need independent skeletons; do not use Object3D.clone.
```

