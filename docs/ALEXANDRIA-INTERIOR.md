# Alexandria: enterable library

The library now has a real, always-open central entrance. Walk up the two flights of shallow steps, pass through the colonnade and bronze doors, and explore the roofed reading hall. The side study wings remain closed.

For a direct arrival, open **World tools → Explore the city → Library reading hall**. The destination enters walking mode and faces back toward the entrance. The existing library companion and lesson interaction stay outside.

The hall includes two writing desks with stools and lamps, four scroll racks, floor borders and warm interior fill lighting. Walls, columns, door jambs and furniture have individual movement boundaries; the center aisle connects continuously to the outdoor terrace. Simplified open architecture and separate furniture remain available if their respective model downloads fail. The archive reward still opens the bronze leaves slightly further.

This is an original interpretive scholarly hall, not an archaeological reconstruction of the lost Library of Alexandria. Architecture is authored in `scripts/blender/build_landmarks.py`; use `--library-only` to rebuild this asset independently of the lighthouse. The editable source is `assets/blender/library-interior.blend`.

Verification: movement into and out of the hall; wall, column and furniture collisions; continuous floor heights; nine eye/body clearance rays through the actual exported GLB; roof and floor ray checks; crowd-route and destination regressions; kit and detail asset validators; TypeScript and production build. Offline entry and reading-hall renders were visually reviewed. Browser interaction and GPU frame rate were not measured for this change.

The library GLB is 3,711,084 bytes and 56,822 triangles. The core Alexandria architecture, detail and named-character downloads total 18,430,716 bytes, excluding separate external assets and background citizens. Asset hash and source metadata are recorded in `assets/blender/library-interior-validation.json`.
