// Run with node --import tsx scripts/export-setting-layout.mjs.
import { writeFile } from 'node:fs/promises';
import { settingPlacements, SETTING_ASSETS } from '../components/worlds/scene/settingLayout.ts';
const layouts = {};
for (const setting of ['archive', 'garden', 'coast']) {
  const placements = settingPlacements(setting);
  const ids = [...new Set(placements.map(p => p.id))];
  layouts[setting] = {
    models: ids.length, instances: placements.length,
    bytes: ids.reduce((sum, id) => sum + SETTING_ASSETS[id].bytes, 0),
    // Include the full placement array for the reproducible Blender study.
    placements: placements.map(p => ({ ...p, url: SETTING_ASSETS[p.id].url })),
  };
}
await writeFile(new URL('../assets/blender/setting-layout.json', import.meta.url), JSON.stringify(layouts, null, 2) + '\n');
console.log(Object.fromEntries(Object.entries(layouts).map(([setting, p]) => [setting, { models: p.models, placements: p.placements.length, bytes: p.bytes }])));
