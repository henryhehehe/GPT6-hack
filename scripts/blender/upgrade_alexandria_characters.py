"""Upgrade the three fictional Greek companions using the licensed existing kit.

Blender --background --factory-startup --python this_file.py
Add -- --output-root /path/to/staging to export and review outside the app.
The wardrobe remains interpretive; these are not portraits or verified replicas.
"""
import sys,math,json,argparse,struct,hashlib,bpy
from pathlib import Path
from mathutils import Matrix,Vector
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'scripts/blender'))
import asset_utils as a
import build_characters as greek
import upgrade_regency_characters as upgrade
def face(identity,c):
 upgrade.detailed_face(identity,c)
 if identity=='dorian':
  for o in list(a.ROOT.children):
   if any(w in o.name.lower() for w in ['beard','moustache']):bpy.data.objects.remove(o,do_unlink=True)
  before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/external/models/quaternius-base-characters/hair/Hair_Beard.gltf'))
  for o in set(bpy.data.objects)-before:
   if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True);continue
   world=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4)
   for v in o.data.vertices:
    v.co=world@v.co;v.co.z-=.0435;v.co.z-=.045*max(0,min(1,(v.co.z-1.425)/.10))
   o.modifiers.clear();o.vertex_groups.clear();g=o.vertex_groups.new(name='Head');g.add(list(range(len(o.data.vertices))),1,'REPLACE')
   o.parent=a.ROOT;o.name=a.ROOT.name+'__Fitted CC0 beard'
   for mat in o.data.materials:
    shader=mat.node_tree.nodes.get('Principled BSDF')
    for link in list(shader.inputs['Base Color'].links):mat.node_tree.links.remove(link)
    shader.inputs['Base Color'].default_value=c['hair'];shader.inputs['Roughness'].default_value=.68
 # Tint the detailed skin texture to the authored body's existing skin palette.
 for o in a.ROOT.children:
  if o.type!='MESH' or '__Detailed_' not in o.name:continue
  for mat in o.data.materials:
   if 'Superhero' not in mat.name:continue
   shader=mat.node_tree.nodes.get('Principled BSDF');links=list(shader.inputs['Base Color'].links)
   if not links:continue
   def color_image(node,seen=None):
    seen=set() if seen is None else seen
    if node in seen:return None
    seen.add(node)
    if node.type=='TEX_IMAGE':return node.image
    for inp in node.inputs:
     for link in inp.links:
      result=color_image(link.from_node,seen)
      if result:return result
    return None
   image=color_image(links[0].from_node)
   if image is None:continue
   w,h=image.size;pixels=list(image.pixels);uv=o.data.uv_layers.active;values=[]
   for loop in o.data.loops:
    v=o.data.vertices[loop.vertex_index].co
    if v.z<1.54 or v.y>-.015:continue
    u,t=uv.data[loop.index].uv;at=4*(min(h-1,int(t*h)%h)*w+min(w-1,int(u*w)%w));color=pixels[at:at+3]
    if min(color)>.015:values.append(color)
   if values:
    avg=[sum(v[i] for v in values)/len(values) for i in range(3)]
    factor=tuple(min(2,max(.3,c['skin'][i]/avg[i])) for i in range(3))
    color_node=next((node for node in mat.node_tree.nodes if node.type=='VERTEX_COLOR'),None)
    colors=(o.data.color_attributes.get(color_node.layer_name) or o.data.color_attributes.active_color) if color_node else None
    if color_node and colors is None:
     colors=o.data.color_attributes.new(name='HeadSkinTint',type='FLOAT_COLOR',domain='CORNER')
     for sample in colors.data:sample.color=(1,1,1,1)
    if color_node and colors is not None:color_node.layer_name=colors.name
    if colors:
     for sample in colors.data:sample.color=tuple(sample.color[i]*factor[i] for i in range(3))+(sample.color[3],)
     print('TINT_VERTEX',identity,avg,factor)
    else:print('TINT_SKIPPED',identity)

def integrated_body(identity,c):
 greek.body(identity,c)
 # Continuous skin surface across the elbow; mixed weights replace separate caps.
 for o in list(a.ROOT.children):
  if any(o.name.split('__')[-1].startswith(n) for n in ['Upper arm','Forearm','Elbow','Short sleeve']):bpy.data.objects.remove(o,do_unlink=True)
 def tube(name,points,radii,color,suffix,skin=False):
  rows=25 if skin else 14;segments=28;verts=[];faces=[]
  for row in range(rows):
   t=row/(rows-1)
   if len(points)==3:
    section=min(1,int(t*2));fraction=t*2-section
    center=points[section].lerp(points[section+1],fraction);r=radii[section]*(1-fraction)+radii[section+1]*fraction
   else:center=points[0].lerp(points[-1],t);r=(radii[0]*(1-t)+radii[-1]*t)*(.62+.38*min(1,t/.14))
   axis=(points[-1]-points[0]).normalized();u=axis.cross(Vector((0,1,0))).normalized();v=axis.cross(u)
   for k in range(segments):
    theta=k*2*math.pi/segments
    fold=0 if skin else .0025*math.sin(theta*6+t*9)*math.sin(math.pi*t)
    verts.append(tuple(center+(r+fold)*(math.cos(theta)*u+math.sin(theta)*v)))
  for row in range(rows-1):
   for k in range(segments):faces.append((row*segments+k,row*segments+(k+1)%segments,(row+1)*segments+(k+1)%segments,(row+1)*segments+k))
  faces.extend([tuple(reversed(range(segments))),tuple((rows-1)*segments+k for k in range(segments))])
  a.BONE=None;o=a.mesh(name,verts,faces,color)
  upper=o.vertex_groups.new(name='UpperArm.'+suffix);fore=o.vertex_groups.new(name='Forearm.'+suffix)
  for row in range(rows):
   t=row/(rows-1);w=max(0,min(1,(t-.33)/.34)) if skin else 0;w=w*w*(3-2*w);ids=list(range(row*segments,(row+1)*segments))
   if w<1:upper.add(ids,1-w,'REPLACE')
   if w:fore.add(ids,w,'REPLACE')
 for side,suffix in [(-1,'L'),(1,'R')]:
  tube('Soft folded sleeve '+suffix,[Vector((side*.225,0,1.365)),Vector((side*.343,-.008,1.205))],[.09,.084],c['cloth'],suffix)
  tube('Continuous exposed arm '+suffix,[Vector((side*.318,-.006,1.255)),Vector((side*.37,-.012,1.13)),Vector((side*.434,-.04,.919))],[.058,.052,.038],c['skin'],suffix,True)
 # A thin anatomical collar transition covers the extracted neck's lower rim.
 a.BONE='Neck';a.ellipsoid('Neck root transition',(0,.005,1.419),(.064,.057,.014),c['skin'],24,12)
 if identity!='dorian':
  a.BONE='Head';height=1.655 if identity=='thaleia' else 1.618
  a.ellipsoid('Gathered hair transition',(0,.071,height),(.064,.048,.074),c['hair'],28,18)
  for k in range(7):
   x=(k-3)*.016
   a.tube('Swept gathered hair strand',[(x*.85,.054,1.715),(x,.091,(height+1.715)/2),(x*.65,.117,height)],.004,c['hair'],8)
  # Small, identity-specific proportional changes retain the same fitted rig.
  for o in a.ROOT.children:
   if o.type!='MESH' or '__Detailed_' not in o.name:continue
   for vertex in o.data.vertices:
    p=o.matrix_world@vertex.co;blend=max(0,min(1,(p.z-1.53)/.08))
    if identity=='thaleia':p.x*=1+.035*blend
    else:p.x*=1-.025*blend;p.z+=.006*blend
    vertex.co=o.matrix_world.inverted()@p
 a.BONE=None


def optimize_attributes(root):
 # Source GLBs contain duplicate UV/color sets from their preparation pipeline.
 # Retain the coordinate set and color attribute actually used by each material.
 for o in root.children:
  if o.type!='MESH':continue
  textured=any(node.type=='TEX_IMAGE' for mat in o.data.materials if mat.use_nodes for node in mat.node_tree.nodes)
  keep_uv=o.data.uv_layers.active.name if textured and o.data.uv_layers.active else None
  for name in [uv.name for uv in o.data.uv_layers]:
   if name!=keep_uv:o.data.uv_layers.remove(o.data.uv_layers[name])
  names=set()
  for mat in o.data.materials:
   if not mat.use_nodes:continue
   for node in mat.node_tree.nodes:
    if node.type=='VERTEX_COLOR':
     if not node.layer_name and o.data.color_attributes.active_color:node.layer_name=o.data.color_attributes.active_color.name
     if node.layer_name:names.add(node.layer_name)
    elif node.type=='UVMAP' and keep_uv:node.uv_map=keep_uv
  for name in [attr.name for attr in o.data.color_attributes]:
   if name not in names:o.data.color_attributes.remove(o.data.color_attributes[name])
 for image in bpy.data.images:
  limit=128 if 'Hair' in image.name else (128 if 'Eye' in image.name else 512)
  if image.size[0]>limit or image.size[1]>limit:
   factor=limit/max(image.size);image.scale(max(1,round(image.size[0]*factor)),max(1,round(image.size[1]*factor)))

def compact_vertex_data(path):
 # glTF permits normalized bytes for colors and skin weights. Keep geometry,
 # animation tracks and normal maps unchanged; round each skin tuple to sum 255.
 data=path.read_bytes();json_size=struct.unpack_from('<I',data,12)[0]
 doc=json.loads(data[20:20+json_size]);binary=data[28+json_size:]
 compact={}
 for mesh in doc['meshes']:
  for primitive in mesh['primitives']:
   for name,index in primitive['attributes'].items():
    if not (name.startswith('COLOR_') or name.startswith('WEIGHTS_')):continue
    accessor=doc['accessors'][index]
    if accessor['componentType']!=5126 or index in compact:continue
    view=doc['bufferViews'][accessor['bufferView']]
    channels=4 if accessor['type']=='VEC4' else 3
    assert view.get('byteStride',channels*4)==channels*4
    offset=view.get('byteOffset',0)+accessor.get('byteOffset',0);values=bytearray()
    for i in range(accessor['count']):
     row=struct.unpack_from('<'+'f'*channels,binary,offset+i*channels*4)
     assert all(math.isfinite(v) and 0<=v<=1.00001 for v in row)
     if name.startswith('WEIGHTS_'):
      total=sum(row);assert total>0
      scaled=[v/total*255 for v in row];rounded=[math.floor(v) for v in scaled]
      for j in sorted(range(channels),key=lambda j:scaled[j]-rounded[j],reverse=True)[:255-sum(rounded)]:rounded[j]+=1
     else:rounded=[round(max(0,min(1,v))*255) for v in row]
     values.extend(rounded)
    compact[index]=bytes(values)
 # Exporter stores an independent tightly packed view for each attribute.
 view_data={}
 for index,payload in compact.items():
  accessor=doc['accessors'][index];view_id=accessor['bufferView']
  assert sum(a.get('bufferView')==view_id for a in doc['accessors'])==1
  view_data[view_id]=payload;accessor['componentType']=5121;accessor['normalized']=True;accessor.pop('byteOffset',None);accessor.pop('min',None);accessor.pop('max',None)
 output=bytearray()
 for index,view in enumerate(doc['bufferViews']):
  while len(output)%4:output.append(0)
  old=view.get('byteOffset',0);payload=view_data.get(index,binary[old:old+view['byteLength']])
  view['byteOffset']=len(output);view['byteLength']=len(payload)
  if index in view_data:view.pop('byteStride',None)
  output.extend(payload)
 while len(output)%4:output.append(0)
 doc['buffers'][0]['byteLength']=len(output)
 encoded=json.dumps(doc,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
 path.write_bytes(struct.pack('<III',0x46546c67,2,28+len(encoded)+len(output))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(output),0x004e4942)+output)

def build(output_root=ROOT):
 previous_face,previous_repo=greek.face,a.REPO
 try:
  a.REPO=Path(output_root).resolve();(a.REPO/'assets').mkdir(parents=True,exist_ok=True)
  a.reset();greek.face=face;models=[]
  for identity in ['dorian','thaleia','ione']:
   c=greek.CAST[identity];r=a.root(identity)
   r['provenance']='Fictional Greek-informed companion; original interpretive wardrobe and gestures with fitted CC0 Quaternius head, eyes and hair. Not a historical portrait.'
   r['componentLicense']='Quaternius Universal Base Characters Kit: CC0 1.0'
   integrated_body(identity,c)
   a.anchor('Anchor_Talk',(0,-.45,1.52));a.anchor('Anchor_Label',(0,0,2.10))
   optimize_attributes(r)
   a.consolidate(r);greek.rig(r);bpy.context.view_layer.update()
   a.export_asset(r,'characters','alexandria-cast',c['title'],['Anchor_Talk','Anchor_Label'],['Idle','Greeting','Talk'])
   compact_vertex_data(a.REPO/'public/models/characters'/(identity+'.glb'))
   models.append(r)
  manifest_path=a.REPO/'assets/model-manifest.json'
  manifest=json.loads(manifest_path.read_text())
  for entry in manifest['assets']:
   if entry['id'] not in ['dorian','thaleia','ione']:continue
   blob=(a.REPO/'public/models/characters'/(entry['id']+'.glb')).read_bytes()
   entry['bytes']=len(blob);entry['sha256']=hashlib.sha256(blob).hexdigest()
   male=entry['id']=='dorian'
   entry['creator']='Counterfactual Worlds; Quaternius (CC0 head, eyes and hair)'
   entry['provenance']='Greek-informed fictional companion; original interpretive wardrobe, rig and gestures with adapted CC0 Quaternius head, eyes and hair. Stylized body; not a historical portrait or primary evidence.'
   entry['components']=[{'creator':'Quaternius','license':'CC0-1.0','licensePath':'assets/external/licenses/quaternius-base-characters.txt','source':'assets/external/prepared/quaternius-base-characters-superhero-'+('male' if male else 'female')+'-fullbody.glb','modifications':'Head and neck extracted by original skin weights, fitted to wardrobe, tinted through vertex colors and rebound to shared rig. Eyes retained; female face proportions varied.'},{'creator':'Quaternius','license':'CC0-1.0','licensePath':'assets/external/licenses/quaternius-base-characters.txt','source':'assets/external/models/quaternius-base-characters/hair/Hair_SimpleParted.gltf','modifications':'Parted hair fitted and recolored; original gathered buns and ribbons retained.'}]
   if male:entry['components'].append({'creator':'Quaternius','license':'CC0-1.0','licensePath':'assets/external/licenses/quaternius-base-characters.txt','source':'assets/external/models/quaternius-base-characters/hair/Hair_Beard.gltf','modifications':'Beard fitted to the extracted head, recolored and rebound to Head bone.'})
  manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
  bpy.ops.file.pack_all()
  for i,r in enumerate(models):r.location.x=(i-1)*1.05
  a.studio('alexandria-cast','characters',(0,0,1.0),3.65,1500,1100,view=(.3,-12,1.6))
 finally:
  greek.face,a.REPO=previous_face,previous_repo

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--output-root',type=Path,default=ROOT)
 args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
 build(args.output_root)
