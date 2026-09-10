"""Offline placement studies of the expanded areas; no browser or UI rendering.
Run catalog-external-models.ts and export-setting-layout.mjs first.
"""
import json
from pathlib import Path
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
external=json.loads((ROOT/'assets/external/placements.json').read_text())
authored=json.loads((ROOT/'assets/blender/setting-layout.json').read_text())

def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);return m

for setting in ['archive','garden','coast']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene
    scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.resolution_x=1500;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
    scene.world=bpy.data.worlds.new('Studio');scene.world.color=(.25,.25,.25)
    floor=material('Floor',(.24,.30,.27));stone=material('Station',(.56,.49,.37))
    # Archive focus includes both new reading areas and the original library station.
    # Garden focus spans its market, tea table, produce display and nearby seating.
    # Coast focus shows its west work area and palm border.
    limits={'archive':(-11,10,-17,-8),'garden':(3,21,0,15),'coast':(-24,-7,-1,11)}[setting]
    selected=[]
    for p in authored[setting]['placements']:
        if limits[0]<=p['at'][0]<=limits[1] and limits[2]<=p['at'][2]<=limits[3]:selected.append(p)
    for p in external:
        if p['setting']==setting and limits[0]<=p['at'][0]<=limits[1] and limits[2]<=p['at'][2]<=limits[3]:
            selected.append({**p,'url':'/models/external/'+p['asset']+'.glb','scale':p.get('scale',1),'turn':p.get('turn',0)})
    for p in selected:
        previous=set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=str(ROOT/('public'+p['url'])))
        group=bpy.data.objects.new(p['key'],None);scene.collection.objects.link(group)
        for obj in set(bpy.data.objects)-previous:
            if obj!=group and obj.parent is None:obj.parent=group
        x,y,z=p['at'];group.location=(x,-z,y);group.rotation_euler.z=p['turn'];group.scale=(p['scale'],)*3
    for x,z in [(-12,5),(12,5),(0,-12)]:
        if limits[0]<=x<=limits[1] and limits[2]<=z<=limits[3]:
            bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=4,depth=.22,location=(x,-z,.11));bpy.context.object.data.materials.append(stone)
    cx=(limits[0]+limits[1])/2;cz=(limits[2]+limits[3])/2
    bpy.ops.mesh.primitive_plane_add(size=200,location=(cx,-cz,-.015));bpy.context.object.data.materials.append(floor)
    bpy.ops.object.light_add(type='AREA',location=(cx-5,-cz-5,16));bpy.context.object.data.energy=4500;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=12
    bpy.ops.object.light_add(type='AREA',location=(cx+8,-cz+8,10));bpy.context.object.data.energy=2200;bpy.context.object.data.size=10
    target=Vector((cx,-cz,.6));bpy.ops.object.camera_add(location=target+Vector((9,-18,18)))
    camera=bpy.context.object;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=(limits[1]-limits[0])*1.15
    scene.camera=camera;scene.render.filepath=str(ROOT/f'assets/external/previews/expanded-{setting}.png');bpy.ops.render.render(write_still=True)
