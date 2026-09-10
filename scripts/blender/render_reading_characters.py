"""Check the new reader silhouettes and the authored greeting in the saved studio."""
from pathlib import Path
import bpy
from mathutils import Vector
out=Path(__file__).resolve().parents[2]/'assets/blender/characters'
bpy.ops.wm.open_mainfile(filepath=str(out/'reader-cast.blend'))
scene=bpy.context.scene
scene.camera.location=(3,10,3.8)
scene.camera.rotation_euler=(Vector((0,0,1))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(out/'reader-cast-back.png')
bpy.ops.render.render(write_still=True)
scene.camera.location=(2,-12,4)
scene.camera.rotation_euler=(Vector((0,0,1))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
for obj in bpy.data.objects:
    if obj.type=='ARMATURE':
        for track in obj.animation_data.nla_tracks:track.mute=track.name!='Greeting'
scene.frame_set(24)
scene.render.filepath=str(out/'reader-cast-greeting.png')
bpy.ops.render.render(write_still=True)
