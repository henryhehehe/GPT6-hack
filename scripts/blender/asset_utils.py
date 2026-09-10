"""Shared offline authoring/export helpers. Blender 4.5; no external assets."""
import bpy
import math
import json
import hashlib
from pathlib import Path
from mathutils import Vector

REPO = Path(__file__).resolve().parents[2]
ROOT = None
BONE = None
PALETTE = {
    'clay': (.56, .235, .12, 1), 'clay_light': (.76, .40, .22, 1),
    'cream': (.83, .71, .49, 1), 'ink': (.055, .095, .09, 1),
    'wood': (.28, .145, .072, 1), 'wood_light': (.43, .255, .125, 1),
    'rope': (.63, .47, .27, 1), 'teal': (.08, .34, .31, 1),
    'linen': (.76, .66, .46, 1), 'paper': (.90, .81, .59, 1),
    'gold': (.61, .39, .13, 1), 'skin': (.55, .31, .185, 1),
    'hair': (.075, .043, .027, 1), 'rose': (.45, .205, .16, 1),
}


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 24
    bpy.context.scene.cycles.use_denoising = True
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.view_settings.view_transform = 'AgX'
    bpy.context.preferences.filepaths.save_version = 0


def surface(kind='matte'):
    name = 'CW_Vertex_' + kind
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    color = mat.node_tree.nodes.new('ShaderNodeVertexColor')
    color.layer_name = 'Col'
    mat.node_tree.links.new(color.outputs['Color'], shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value = {'matte': .82, 'glaze': .38, 'metal': .40}[kind]
    shader.inputs['Metallic'].default_value = .65 if kind == 'metal' else 0
    return mat


def root(asset_id):
    global ROOT, BONE
    BONE = None
    ROOT = bpy.data.objects.new(asset_id, None)
    bpy.context.collection.objects.link(ROOT)
    ROOT['asset_id'] = asset_id
    ROOT['provenance'] = 'Original interpretive teaching asset; not primary evidence'
    return ROOT


def finish(o, name, color, kind='matte', smooth=False):
    o.name = ROOT.name + '__' + name if ROOT else name
    o.parent = ROOT
    o.data.materials.clear()
    o.data.materials.append(surface(kind))
    attr = o.data.color_attributes.new(name='Col', type='BYTE_COLOR', domain='CORNER')
    c = PALETTE.get(color, color) if isinstance(color, str) else color
    for item in attr.data:
        item.color = c
    for face in o.data.polygons:
        face.use_smooth = smooth
    if BONE:
        group = o.vertex_groups.new(name=BONE)
        group.add(list(range(len(o.data.vertices))), 1, 'REPLACE')
    return o


def box(name, p, s, color='wood', bevel=.015, kind='matte'):
    bpy.ops.mesh.primitive_cube_add(size=1, location=p)
    o = bpy.context.object
    o.scale = s
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new('Soft handled edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o, name, color, kind)


def mesh(name, verts, faces, color, smooth=True, kind='matte'):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    o = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(o)
    return finish(o, name, color, kind, smooth)


def ellipsoid(name, p, s, color, segments=20, rings=12, kind='matte'):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=p)
    o = bpy.context.object
    o.scale = s
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, name, color, kind, True)


def tube(name, points, radius, color='rope', sides=8, closed=False, kind='matte'):
    pts = [Vector(p) for p in points]
    verts, faces = [], []
    for i, p in enumerate(pts):
        tangent = pts[(i+1) % len(pts)] - pts[(i-1) % len(pts)] if closed else pts[min(i+1,len(pts)-1)] - pts[max(0,i-1)]
        tangent.normalize()
        ref = Vector((0,0,1)) if abs(tangent.z) < .9 else Vector((0,1,0))
        u = tangent.cross(ref).normalized()
        v = tangent.cross(u).normalized()
        for j in range(sides):
            a = j * math.tau / sides
            verts.append(tuple(p + radius*(math.cos(a)*u + math.sin(a)*v)))
    for i in range(len(pts) if closed else len(pts)-1):
        for j in range(sides):
            faces.append((i*sides+j, i*sides+(j+1)%sides, ((i+1)%len(pts))*sides+(j+1)%sides, ((i+1)%len(pts))*sides+j))
    if not closed:
        faces += [tuple(reversed(range(sides))), tuple((len(pts)-1)*sides+j for j in range(sides))]
    return mesh(name, verts, faces, color, True, kind)


def ring(name, p, radius, thickness, color='rope', segments=32, kind='matte'):
    return tube(name, [(p[0]+radius*math.cos(i*math.tau/segments),p[1]+radius*math.sin(i*math.tau/segments),p[2]) for i in range(segments)], thickness, color, closed=True, kind=kind)


def lathe(name, profile, color='clay', segments=40, kind='matte', flutes=0):
    verts, faces = [], []
    for r,z in profile:
        for i in range(segments):
            a=i*math.tau/segments
            rr=r*(1+flutes*math.cos(12*a))
            verts.append((rr*math.cos(a),rr*math.sin(a),z))
    for k in range(len(profile)-1):
        for i in range(segments):
            faces.append((k*segments+i,k*segments+(i+1)%segments,(k+1)*segments+(i+1)%segments,(k+1)*segments+i))
    return mesh(name, verts, faces, color, True, kind)


def beam(name, start, end, width, color='wood', depth=None):
    a,b=Vector(start),Vector(end)
    o=box(name,(a+b)/2,(width,depth or width,(b-a).length),color,.008)
    o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return o


def anchor(name, p):
    o=bpy.data.objects.new(ROOT.name+'__'+name,None)
    bpy.context.collection.objects.link(o)
    o.parent=ROOT
    o.location=p
    o.empty_display_type='SPHERE'
    o.empty_display_size=.08
    return o


def descendants(r):
    return [r, *r.children_recursive]


def consolidate(r):
    groups={}
    for o in r.children:
        if o.type=='MESH':
            groups.setdefault(o.data.materials[0].name,[]).append(o)
    for name, objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:
            o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join()
        objects[0].name=r.name+'__Visual_'+name.removeprefix('CW_Vertex_')
        # World-space authoring locations become local mesh coordinates at root.
        bpy.context.scene.cursor.location=(0,0,0)
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')


def export_asset(r, category, pack, title, anchors, clips=None):
    out=REPO/'public/models'/category
    out.mkdir(parents=True,exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for o in descendants(r):
        o.select_set(True)
    bpy.context.view_layer.objects.active=r
    path=out/(r.name+'.glb')
    kwargs=dict(filepath=str(path),export_format='GLB',use_selection=True,export_yup=True,
                export_cameras=False,export_lights=False,export_extras=True,
                export_animations=bool(clips),export_apply=False)
    if clips:
        kwargs['export_animation_mode']='NLA_TRACKS'
    bpy.ops.export_scene.gltf(**kwargs)
    manifest_path=REPO/'assets/model-manifest.json'
    manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {'schemaVersion':1,'license':'MIT','assets':[]}
    vertices=[o.matrix_world@v.co for o in r.children_recursive if o.type=='MESH' for v in o.data.vertices]
    mn=[min(v[i] for v in vertices) for i in range(3)]
    mx=[max(v[i] for v in vertices) for i in range(3)]
    entry=dict(id=r.name,title=title,pack=pack,category=category,url=f'/models/{category}/{r.name}.glb',
               source=f'assets/blender/{category}/{pack}.blend',bytes=path.stat().st_size,
               sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
               bounds={'min':[round(mn[0],4),round(mn[2],4),round(-mx[1],4)],'max':[round(mx[0],4),round(mx[2],4),round(-mn[1],4)]},
               anchors={name:r.name+'__'+name for name in anchors},clips=clips or [],
               provenance='Original interpretive teaching asset; not primary evidence',creator='Counterfactual Worlds',license='MIT',licensePath='LICENSE',
               dimensionsConvention='meters; glTF Y-up, forward +Z; ground-level origin')
    manifest['assets']=[e for e in manifest['assets'] if e['id']!=r.name]+[entry]
    manifest['assets'].sort(key=lambda e:e['id'])
    manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
    return entry


def studio(pack, category, target, scale, width=1400, height=950, view=(8,-12,9)):
    global ROOT, BONE
    ROOT=None
    BONE=None
    scene=bpy.context.scene
    world=bpy.data.worlds.new('Warm charcoal studio')
    world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.065,.095,.115,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.4
    scene.world=world
    floor=box('Studio floor',(target[0],target[1],-.09),(200,200,.15),(.065,.085,.09,1),0)
    for name,p,power,size in [('Key',(-4,-6,10),1700,7),('Fill',(7,-1,6),1100,6),('Rim',(2,7,8),1900,5)]:
        bpy.ops.object.light_add(type='AREA',location=(p[0]+target[0],p[1]+target[1],p[2]))
        light=bpy.context.object;light.name='Studio '+name;light.data.energy=power;light.data.shape='DISK';light.data.size=size
        light.rotation_euler=(Vector(target)-light.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add(location=Vector(target)+Vector(view))
    camera=bpy.context.object
    camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type='ORTHO';camera.data.ortho_scale=scale;scene.camera=camera
    scene.render.resolution_x=width;scene.render.resolution_y=height;scene.render.resolution_percentage=100
    out=REPO/'assets/blender'/category;out.mkdir(parents=True,exist_ok=True)
    scene.render.filepath=str(out/(pack+'-preview.png'))
    bpy.ops.wm.save_as_mainfile(filepath=str(out/(pack+'.blend')))
    bpy.ops.render.render(write_still=True)
