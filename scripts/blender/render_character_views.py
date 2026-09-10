"""Render side/back and greeting QA views from the editable character scene."""
from pathlib import Path
import bpy
from mathutils import Vector
repo=Path(__file__).resolve().parents[2]
out=repo/'assets/blender/characters'
bpy.ops.wm.open_mainfile(filepath=str(out/'alexandria-cast.blend'))
scene=bpy.context.scene
camera=scene.camera
camera.location=(3,10,3.8)
camera.rotation_euler=(Vector((0,0,1))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(out/'alexandria-cast-back.png')
bpy.ops.render.render(write_still=True)
camera.location=(2,-12,4)
camera.rotation_euler=(Vector((0,0,1))-camera.location).to_track_quat('-Z','Y').to_euler()
for o in bpy.data.objects:
    if o.type=='ARMATURE':
        for track in o.animation_data.nla_tracks: track.mute=track.name!='Greeting'
scene.frame_set(24)
scene.render.filepath=str(out/'alexandria-cast-greeting.png')
bpy.ops.render.render(write_still=True)
