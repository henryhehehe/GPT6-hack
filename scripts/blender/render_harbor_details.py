"""Render the actual harbor prop placements exported from alexandriaDetailLayout.ts.

Blender --background --python scripts/blender/render_harbor_details.py -- layout.json
The layout contains runtime placement objects; this study changes only camera/light.
"""
import bpy, json, sys
from pathlib import Path
from mathutils import Vector

repo=Path(__file__).resolve().parents[2]
layout=json.loads(Path(sys.argv[sys.argv.index('--')+1]).read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
for p in layout:
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(repo/'public/models/alexandria-details'/(p['id']+'.glb')))
    imported=set(bpy.data.objects)-before
    group=bpy.data.objects.new(p['id']+' placement',None);scene.collection.objects.link(group)
    for obj in imported:
        if not obj.parent:obj.parent=group
    x,y,z=p['at'];group.location=(x+25.5,-z+8.7,y-.95)
    group.rotation_euler.z=p.get('turn',0);group.scale=(p.get('scale',1),)*3
mat=bpy.data.materials.new('Quay limestone');mat.diffuse_color=(.46,.40,.31,1)
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,-.1))
bpy.context.object.scale=(20,20,.2);bpy.context.object.data.materials.append(mat)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[1].default_value=.6
for loc,power,size in [((-3,-4,7),900,5),((4,3,5),700,4)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size
    o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(4,6,4.5));camera=bpy.context.object
camera.rotation_euler=(Vector((0,0,.95))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=5.4;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.view_settings.view_transform='AgX';scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.filepath=str(repo/'assets/blender/harbor-details-placement.png')
bpy.ops.render.render(write_still=True)
