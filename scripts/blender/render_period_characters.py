"""Offline back and greeting checks for every period wardrobe; no browser capture."""
from pathlib import Path
import bpy
from mathutils import Vector
out=Path(__file__).resolve().parents[2]/'assets/blender/characters'
for period in ['medieval','earlymodern','georgian','regency','romantic']:
    bpy.ops.wm.open_mainfile(filepath=str(out/(period+'-readers.blend')))
    scene=bpy.context.scene
    scene.render.resolution_x=1050;scene.render.resolution_y=675
    for pose,view in [('back',(1,12,3.4)),('greeting',(1,-12,3.4))]:
        scene.camera.location=Vector((0,0,1))+Vector(view)
        scene.camera.rotation_euler=(Vector((0,0,1))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
        if pose=='greeting':
            for obj in bpy.data.objects:
                if obj.type=='ARMATURE':
                    for track in obj.animation_data.nla_tracks:track.mute=track.name!='Greeting'
            scene.frame_set(24)
        scene.render.filepath=str(out/(period+'-readers-'+pose+'.png'))
        bpy.ops.render.render(write_still=True)
