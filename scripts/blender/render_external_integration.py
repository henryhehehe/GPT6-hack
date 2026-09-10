"""Offline cutaway arrangement check using the runtime placements and real GLBs.

Export placements with scripts/export-setting-layout.mjs and scripts/catalog-external-models.ts, then run Blender
in background with --python this_file. This is a studio render, not browser QA.
"""
import bpy
import json
from pathlib import Path
from mathutils import Vector

REPO = Path(__file__).resolve().parents[2]
layout = json.loads((REPO / 'assets/blender/setting-layout.json').read_text())
external = json.loads((REPO / 'assets/external/placements.json').read_text())
for setting in ['archive', 'garden', 'coast']:
    for p in external:
        if p['setting'] == setting:
            layout[setting]['placements'].append({**p, 'url': '/models/external/'+p['asset']+'.glb', 'turn': p.get('turn',0), 'scale': 1})
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.view_settings.view_transform = 'AgX'
scene.render.resolution_x = 1800
scene.render.resolution_y = 850
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (.28, .28, .28)

def material(name, color):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    return m

stone = material('Warm station limestone', (.55, .48, .37))
backdrop = material('Studio floor', (.11, .15, .17))
ink = material('Lettering', (.75, .82, .81))

def box(name, p, size, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=p)
    o = bpy.context.object
    o.name = name
    o.scale = size
    o.data.materials.append(mat)
    return o

for i, setting in enumerate(['archive', 'garden', 'coast']):
    offset = (i - 1) * 9
    for p in layout[setting]['placements']:
        if p.get('zone') != 'library':
            continue
        previous = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=str(REPO / ('public' + p['url'])))
        imported = set(bpy.data.objects) - previous
        group = bpy.data.objects.new(p['key'], None)
        scene.collection.objects.link(group)
        for obj in imported:
            if not obj.parent:
                obj.parent = group
        x, y, z = p['at']
        group.location = (x + offset, -(z + 12), y)
        group.rotation_euler.z = p['turn']
        group.scale = (p['scale'],) * 3
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=4, depth=.22, location=(offset, 0, .11))
    bpy.context.object.data.materials.append(stone)
    # Roof and front columns are cut away so tabletop placement is visible.
    for x in [-3, 3]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=.20, depth=4.5, location=(offset + x, 2.5, 2.25))
        bpy.context.object.data.materials.append(stone)
    bpy.ops.object.text_add(location=(offset - 2.0, -3.0, .24))
    text = bpy.context.object
    text.data.body = setting.upper()
    text.data.size = .48
    text.data.extrude = .003
    text.data.materials.append(ink)

box('Backdrop', (0, 0, -.12), (200, 200, .2), backdrop)
bpy.ops.object.light_add(type='AREA', location=(-4, -6, 15))
bpy.context.object.data.energy = 4500
bpy.context.object.data.shape = 'DISK'
bpy.context.object.data.size = 15
bpy.ops.object.light_add(type='AREA', location=(8, 7, 12))
bpy.context.object.data.energy = 3000
bpy.context.object.data.size = 12
bpy.ops.object.camera_add(location=(11, -25, 19))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 1.3)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 33.5
scene.camera = camera
scene.render.filepath = str(REPO / 'assets/external/previews/integrated-stations.png')
bpy.ops.render.render(write_still=True)
