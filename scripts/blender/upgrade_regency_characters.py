"""Regency cast: CC0 textured heads fitted to original period-informed wardrobes.
Run with Blender --background --factory-startup --python this_file.py.
This deliberately upgrades only the reviewed Regency family.
"""
import sys,bpy,bmesh,json,math
from pathlib import Path
from mathutils import Matrix,Vector
sys.path.insert(0,str(Path(__file__).resolve().parent))
import asset_utils as a
import build_period_characters as period
original_face=period.face
REPO=a.REPO

def detailed_face(identity,c):
    before=set(bpy.data.objects)
    original_face(identity,c)
    hair_words=['bun','ribbon','beard','Moustache']
    for o in set(bpy.data.objects)-before:
        if not any(w.lower() in o.name.lower() for w in hair_words):
            bpy.data.objects.remove(o,do_unlink=True);continue
        for v in o.data.vertices:
            p=o.matrix_world@v.co
            p=Vector((p.x*.65,p.y*.70,1.49+(p.z-1.485)*.72))
            v.co=o.matrix_world.inverted()@p
    female=identity not in ['short','dorian']
    source=REPO/'assets/external/prepared'/('quaternius-base-characters-superhero-'+('female' if female else 'male')+'-fullbody.glb')
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(source))
    imported=set(bpy.data.objects)-before
    for o in list(imported):
        if o.type!='MESH' or 'super' not in o.name.lower():continue
        world=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4)
        for v in o.data.vertices:
            v.co=world@v.co
            v.co.z-=0 if female else .0435
        neck_ids={g.index for g in o.vertex_groups if g.name in ['Head','neck_01']}
        remove_ids={v.index for v in o.data.vertices if sum(g.weight for g in v.groups if g.group in neck_ids)<.1}
        o.modifiers.clear()
        if 'super' in o.name.lower():
            bm=bmesh.new();bm.from_mesh(o.data)
            bm.verts.ensure_lookup_table()
            key=lambda v:tuple(round(n,5) for n in v.co)
            rim={key(v) for v in bm.verts if v.index not in remove_ids and any(e.other_vert(v).index in remove_ids for e in v.link_edges)}
            bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.index in remove_ids],context='VERTS')
            # glTF splits vertices at UV seams; weld topology before finding the
            # extraction rim so a facial UV seam is never pulled into the neck.
            bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
            for v in bm.verts:
                if v.is_boundary and key(v) in rim:
                    v.co.z=1.415
                    v.co.x=max(-.055,min(.055,v.co.x))
                    v.co.y=max(-.04,min(.055,v.co.y))
            bm.to_mesh(o.data);bm.free()
            # Keep the imported anatomical neck; remove the broad procedural cylinder.
            for old in list(a.ROOT.children):
                if old.name.endswith('__Neck'):bpy.data.objects.remove(old,do_unlink=True)
        o.vertex_groups.clear()
        o.parent=a.ROOT;o.name=a.ROOT.name+'__Detailed_'+o.name
        neck=o.vertex_groups.new(name='Neck');head=o.vertex_groups.new(name='Head')
        for v in o.data.vertices:
            weight=max(0,min(1,(v.co.z-1.46)/.085))
            if weight:head.add([v.index],weight,'REPLACE')
            if weight<1:neck.add([v.index],1-weight,'REPLACE')
        imported.remove(o)
        break
    # Remaining eye and eyebrow meshes.
    for o in list(imported):
        if o.type=='MESH' and any(w in o.name.lower() for w in ['eyes','eyebrows']):
            world=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4)
            for v in o.data.vertices:
                v.co=world@v.co;v.co.z-=0 if female else .0435
            o.modifiers.clear();o.vertex_groups.clear();g=o.vertex_groups.new(name='Head');g.add(list(range(len(o.data.vertices))),1,'REPLACE')
            o.parent=a.ROOT;o.name=a.ROOT.name+'__Detailed_'+o.name;imported.remove(o)
    for o in imported:bpy.data.objects.remove(o,do_unlink=True)
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(REPO/'assets/external/models/quaternius-base-characters/hair/Hair_SimpleParted.gltf'))
    for o in set(bpy.data.objects)-before:
        if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True);continue
        world=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4)
        for v in o.data.vertices:v.co=world@v.co;v.co.z-=.0435
        o.modifiers.clear();o.vertex_groups.clear();g=o.vertex_groups.new(name='Head');g.add(list(range(len(o.data.vertices))),1,'REPLACE')
        o.parent=a.ROOT;o.name=a.ROOT.name+'__Parted hair'
    for image in bpy.data.images:
        if image.name.startswith('T_Hair_1_Normal') and image.size[0]>512:image.scale(512,512)
    for o in a.ROOT.children:
        if o.type!='MESH':continue
        for mat in o.data.materials:
            if 'MI_Hair' not in mat.name:continue
            shader=mat.node_tree.nodes.get('Principled BSDF')
            shader.inputs['Base Color'].default_value=c['hair']
            for link in list(shader.inputs['Base Color'].links):mat.node_tree.links.remove(link)
            shader.inputs['Roughness'].default_value=.68
    # Match the head-to-shoulder distance of the authored wardrobe.
    bpy.context.view_layer.update()
    for o in a.ROOT.children:
        if o.type!='MESH' or not any(g.name=='Head' for g in o.vertex_groups):continue
        for v in o.data.vertices:
            p=o.matrix_world@v.co
            p.z-=(.025 if female else .045)*max(0,min(1,(p.z-1.425)/.10))
            if 'Superhero' in ''.join(m.name for m in o.data.materials) and p.z<1.51 and p.y>-.04:
                blend=max(0,min(1,(1.51-p.z)/.04))
                p.x=p.x*(1-blend)+max(-.053,min(.053,p.x))*blend
                p.y=p.y*(1-blend)+max(-.038,min(.050,p.y))*blend
            v.co=o.matrix_world.inverted()@p
original_character=period.character
def smooth_character(p,style,identity,color,index):
    original_character(p,style,identity,color,index)
    for o in list(a.ROOT.children):
        if any(n in o.name for n in ['Long upper sleeve','Long lower sleeve']):bpy.data.objects.remove(o,do_unlink=True)
    for side,suffix in [(-1,'L'),(1,'R')]:
        points=[Vector((side*.225,0,1.38)),Vector((side*.37,-.012,1.13)),Vector((side*.43,-.04,.93))]
        verts=[];faces=[];segments=24;rows=17
        for row in range(rows):
            t=row/(rows-1);s=t*2
            center=points[0].lerp(points[1],s) if t<=.5 else points[1].lerp(points[2],s-1)
            axis=(points[2]-points[0]).normalized();u=axis.cross(Vector((0,1,0))).normalized();v=axis.cross(u)
            radius=(.099*(1-t)+.046*t)*(.62+.38*min(1,t/.12))
            for k in range(segments):
                angle=k*6.283185307/segments
                fold=.003*math.sin(angle*5+t*13)*math.sin(t*math.pi)+.002*math.cos(t*29)*math.sin(t*math.pi)
                verts.append(tuple(center+(radius+fold)*(math.cos(angle)*u+math.sin(angle)*v)))
        for row in range(rows-1):
            for k in range(segments):faces.append((row*segments+k,row*segments+(k+1)%segments,(row+1)*segments+(k+1)%segments,(row+1)*segments+k))
        faces.extend([tuple(reversed(range(segments))),tuple((rows-1)*segments+k for k in range(segments))])
        a.BONE=None;o=a.mesh('Continuous tailored sleeve '+suffix,verts,faces,color)
        upper=o.vertex_groups.new(name='UpperArm.'+suffix);fore=o.vertex_groups.new(name='Forearm.'+suffix)
        for row in range(rows):
            t=row/(rows-1);w=max(0,min(1,(t-.36)/.28));w=w*w*(3-2*w)
            ids=list(range(row*segments,(row+1)*segments))
            if w<1:upper.add(ids,1-w,'REPLACE')
            if w:fore.add(ids,w,'REPLACE')

def _build():
    a.reset()
    models=[]
    pack='regency-readers'
    for i,(style,identity,color) in enumerate(period.CAST['regency']):
        r=a.root('regency-'+style)
        r['provenance']='Period-informed fictional companion; CC0 Quaternius head, eyes and parted hair with original wardrobe, rig and gestures. Not a historical portrait.'
        r['componentLicense']='Quaternius Universal Base Characters Kit: CC0 1.0'
        period.character('regency',style,identity,color,i)
        a.anchor('Anchor_Talk',(0,-.45,1.52));a.anchor('Anchor_Label',(0,0,2.10))
        a.consolidate(r);period.rig(r);bpy.context.view_layer.update()
        a.export_asset(r,'characters',pack,'Regency-informed reader: '+style,['Anchor_Talk','Anchor_Label'],['Idle','Greeting','Talk'])
        models.append(r)
    manifest_path=REPO/'assets/model-manifest.json'
    manifest=json.loads(manifest_path.read_text())
    for entry in manifest['assets']:
        if entry['id'] not in [r.name for r in models]:continue
        entry['creator']='Counterfactual Worlds; Quaternius (CC0 head, eyes and hair)'
        entry['provenance']='Period-informed fictional companion; original clothing, rig and gestures with adapted CC0 Quaternius head, eyes and hair. Not a historical portrait or primary evidence.'
        entry['components']=[{'creator':'Quaternius','license':'CC0-1.0','licensePath':'assets/external/licenses/quaternius-base-characters.txt','source':'assets/external/prepared/quaternius-base-characters-superhero-'+('male' if entry['id']=='regency-coat' else 'female')+'-fullbody.glb','modifications':'Head and neck extracted by original skin weights, fitted to wardrobe and rebound to shared rig. Parted hair fitted; authored gathered buns retained.'}]
    manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
    # Pack all source texture pixels so the editable file remains portable.
    bpy.ops.file.pack_all()
    for i,r in enumerate(models):r.location.x=(i-1)*1.05
    a.studio(pack,'characters',(0,0,1.12),3.5,1400,1100,view=(.3,-12,2.0))

def build():
    previous_face,previous_character=period.face,period.character
    period.face,period.character=detailed_face,smooth_character
    try:_build()
    finally:period.face,period.character=previous_face,previous_character

if __name__=='__main__':build()
