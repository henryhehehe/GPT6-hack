"""Static, economical background figures derived from the original cast style."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import asset_utils as a
from build_characters import body, CAST

a.reset(); roots=[]
variants=[('citizen-ochre','dorian',(.56,.34,.14,1)),('citizen-teal','thaleia',(.09,.31,.29,1)),('citizen-indigo','dorian',(.16,.21,.32,1)),('citizen-rose','ione',(.44,.25,.23,1))]
for asset_id,base,color in variants:
    r=a.root(asset_id);c=dict(CAST[base]);c['cloth']=color
    body(base,c)
    for o in list(r.children):
        if '__Hem border' in o.name:
            a.bpy.data.objects.remove(o,do_unlink=True)
    for o in r.children:
        if o.type=='MESH':
            o.data.materials.clear();o.data.materials.append(a.surface())
            o.vertex_groups.clear()
    a.consolidate(r)
    for o in r.children:
        if o.type!='MESH':continue
        a.bpy.context.view_layer.objects.active=o
        original=sum(len(p.vertices)-2 for p in o.data.polygons)
        mod=o.modifiers.new('Background silhouette reduction','DECIMATE');mod.ratio=min(1,2300/original)
        a.bpy.ops.object.modifier_apply(modifier=mod.name)
    a.anchor('Anchor_Ground',(0,0,0));a.bpy.context.view_layer.update()
    a.export_asset(r,'characters','background-citizens','Background figure · '+asset_id.removeprefix('citizen-'),['Anchor_Ground'])
    roots.append(r)
for i,r in enumerate(roots):r.location.x=(i-1.5)*1.20
a.studio('background-citizens','characters',(0,0,1),6.0,1400,850,view=(2,-12,4))
