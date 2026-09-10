"""Original Alexandria-inspired scenery. Blender 4.5; no acquired geometry.

blender --background --factory-startup --python scripts/blender/build_alexandria_pack.py -- /absolute/output
All dimensions are scene metres. Z-up in Blender, Y-up in GLB; fronts face -Y.
Deterministic, editable geometry; decorative interpretation, not source evidence.
"""
import bpy, math, random, sys, os, json
from mathutils import Vector

random.seed(49)
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/private/tmp/alexandria-pack'
os.makedirs(OUT, exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
M = {}; ROOT = None; ASSETS = []

def material(name, color, rough=.8, metal=0):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metal
    M[name] = m

for name, color, rough, metal in [
    ('limestone',(.67,.57,.40),.91,0),('marble',(.88,.81,.65),.7,0),
    ('mortar',(.35,.30,.23),1,0),('wood',(.26,.13,.062),.88,0),
    ('woodlight',(.43,.26,.13),.86,0),('endgrain',(.18,.085,.038),.95,0),
    ('linen',(.83,.72,.51),.95,0),('teal',(.045,.32,.30),.87,0),
    ('indigo',(.08,.14,.25),.85,0),('clay',(.61,.245,.115),.83,0),
    ('slip',(.14,.055,.03),.74,0),('ochre',(.79,.49,.18),.81,0),
    ('bronze',(.33,.24,.10),.45,.72),('patina',(.07,.24,.20),.65,.4),
    ('rope',(.48,.35,.18),.94,0),('green',(.17,.28,.08),.92,0),
    ('leaflight',(.28,.37,.10),.9,0),('fruit',(.51,.075,.028),.7,0),
    ('olive',(.16,.20,.036),.76,0),('water',(.075,.32,.34),.2,.2)]:
    material(name,color,rough,metal)

def finish(o, name, mat):
    o.name=name; o.parent=ROOT; o.data.materials.append(M[mat]); return o

def mesh(name, verts, faces, mat, smooth=False):
    data=bpy.data.meshes.new(name); data.from_pydata(verts,[],faces); data.update()
    o=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(o); finish(o,name,mat)
    if smooth:
        for p in data.polygons: p.use_smooth=True
    return o

def box(name, pos, size, mat='wood', bevel=.02):
    x,y,z=pos; a,b,c=[v/2 for v in size]
    o=mesh(name,[(x+i*a,y+j*b,z+k*c) for i,j,k in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]],[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)],mat)
    if bevel:
        bpy.context.view_layer.objects.active=o
        mod=o.modifiers.new('Worn edges','BEVEL'); mod.width=bevel; mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def lathe(name, profile, pos=(0,0,0), mat='clay', n=48):
    x,y,z=pos
    verts=[(x+r*math.cos(i*math.tau/n),y+r*math.sin(i*math.tau/n),z+h) for r,h in profile for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(profile)-1) for i in range(n)]
    return mesh(name,verts,faces,mat,True)

def tube(name, points, radius=.025, mat='rope', sides=8):
    pts=[Vector(p) for p in points]; verts=[]
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        normal=tangent.cross(Vector((0,0,1)))
        if normal.length<.01: normal=tangent.cross(Vector((0,1,0)))
        normal.normalize(); bitangent=tangent.cross(normal).normalized()
        verts.extend([p+radius*(normal*math.cos(j*math.tau/sides)+bitangent*math.sin(j*math.tau/sides)) for j in range(sides)])
    faces=[(i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j) for i in range(len(pts)-1) for j in range(sides)]
    faces += [tuple(reversed(range(sides))),tuple((len(pts)-1)*sides+j for j in range(sides))]
    return mesh(name,verts,faces,mat,True)

def ring(name, pos, radius, thick=.025, mat='bronze', n=40, sides=8):
    x,y,z=pos
    return tube(name,[(x+radius*math.cos(i*math.tau/n),y+radius*math.sin(i*math.tau/n),z) for i in range(n+1)],thick,mat,sides)

def rod(name,a,b,r=.04,mat='wood',sides=12): return tube(name,[a,b],r,mat,sides)

def sphere(name,pos,scale,mat='fruit',n=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n,ring_count=6 if n<=12 else 8,location=pos)
    o=bpy.context.object; o.scale=scale
    finish(o,name,mat)
    for p in o.data.polygons:p.use_smooth=True
    return o

def start(name, title, zone, description):
    global ROOT
    ROOT=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(ROOT)
    ROOT['title']=title; ROOT['provenance']='Original interpretive scenery; not historical evidence.'
    ASSETS.append(dict(id=name,title=title,zone=zone,description=description,root=ROOT))

def anchor(name,pos):
    o=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(o);o.parent=ROOT;o.location=pos

def pot(pos=(0,0,0),s=1,kind='amphora'):
    x,y,z=pos
    profiles={
      'amphora':[(.02,0),(.1,.08),(.19,.28),(.34,.64),(.32,.87),(.17,1.03),(.12,1.16),(.13,1.29),(.18,1.31),(.18,1.36),(.12,1.36),(.095,1.28),(.095,1.15),(.13,1.04),(.28,.85),(.29,.65),(.14,.28),(.02,.16)],
      'hydria':[(0,0),(.22,.03),(.25,.09),(.24,.15),(.4,.32),(.46,.57),(.40,.79),(.21,.96),(.18,1.06),(.27,1.1),(.27,1.15),(.20,1.15),(.15,1.07),(.17,.98),(.35,.79),(.4,.56),(.33,.31),(.18,.2),(0,.2)],
      'krater':[(0,0),(.22,.02),(.24,.09),(.16,.18),(.24,.26),(.38,.43),(.46,.68),(.48,.8),(.53,.84),(.53,.9),(.46,.9),(.42,.78),(.40,.65),(.32,.42),(.18,.29),(0,.26)]}
    lathe(kind,[(r*s,h*s) for r,h in profiles[kind]],pos)
    for h,r in ([(.87,.322),(1.23,.134)] if kind=='amphora' else [(.32,.402),(.74,.427)] if kind=='hydria' else [(.64,.45),(.78,.485)]):
        for d in [-.02,.02]:ring('Painted slip band',(x,y,z+(h+d)*s),r*s,.012*s,'slip')
    for side in [-1,1]:
        points=[(x+side*a*s,y,z+b*s) for a,b in ([(.13,1.26),(.30,1.27),(.40,1.13),(.37,.96),(.30,.9)] if kind=='amphora' else [(.38,.73),(.61,.8),(.64,.6),(.43,.5)] if kind=='hydria' else [(.45,.72),(.66,.77),(.66,.57),(.39,.5)])]
        tube('Hand formed handle',points,.043*s,'clay',10)
    if kind=='hydria':tube('Rear lifting handle',[(x,y+.19*s,z+1.05*s),(x,y+.42*s,z+1.03*s),(x,y+.51*s,z+.82*s),(x,y+.43*s,z+.7*s)],.044*s,'clay')
    # Incised repeating ornament around the shoulder, geometry survives glTF export.
    r=.329 if kind=='amphora' else .452 if kind=='hydria' else .469
    h=.70 if kind=='amphora' else .58 if kind=='hydria' else .72
    for i in range(20):
        a=i*math.tau/20
        tube('Shoulder ornament',[(x+(r+.002)*s*math.cos(a+t),y+(r+.002)*s*math.sin(a+t),z+(h+v)*s) for t,v in [(0,0),(.055,.035),(.11,0)]],.007*s,'ochre',4)

def crate(pos=(0,0,0),s=1):
    x,y,z=pos
    for i in range(5):
        for side in [-1,1]:
            box('Separate crate plank',(x+(-.4+i*.2)*s,y+side*.47*s,z+.5*s),(.185*s,.09*s,.96*s),'woodlight' if i%2 else 'wood',.01)
            box('Crate end plank',(x+side*.47*s,y,z+(.1+i*.2)*s),(.09*s,.9*s,.183*s),'wood',.01)
        box('Crate lid plank',(x+(-.4+i*.2)*s,y,z+.97*s),(.185*s,.96*s,.08*s),'woodlight',.01)
    for yoff in [-.53,.53]:
        for h in [.16,.83]:box('Crate cross batten',(x,y+yoff*s,z+h*s),(1.04*s,.07*s,.12*s),'woodlight',.01)
        rod('Diagonal brace',(x-.4*s,y+yoff*s,z+.23*s),(x+.4*s,y+yoff*s,z+.77*s),.06*s,'woodlight',4)
        for xx in [-.38,.38]:
            for zz in [.16,.83]:sphere('Bronze nail',(x+xx*s,y+yoff*s,z+zz*s),(.025*s,.018*s,.025*s),'bronze',8)

def basket(pos=(0,0,0),s=1,produce=False):
    x,y,z=pos
    lathe('Basket shadow lining',[(0,0),(.29*s,0),(.33*s,.12*s),(.42*s,.6*s),(.39*s,.6*s),(.29*s,.1*s),(0,.1*s)],pos,'rope',32)
    for j in range(17):
        h=.025+j*.035; ring('Woven horizontal reed',(x,y,z+h*s),(.30+.2*h)*s,.014*s,'linen' if j%4==0 else 'rope',24,4)
    for i in range(24):
        a=i*math.tau/24
        tube('Basket warp',[(x+(.3+.2*h)*s*math.cos(a),y+(.3+.2*h)*s*math.sin(a),z+h*s) for h in [0,.2,.4,.61]],.014*s,'woodlight',5)
    ring('Bound basket rim',(x,y,z+.61*s),.425*s,.035*s,'linen',32,6)
    if produce:
        for i in range(19):
            a=i*2.4;r=.30*math.sqrt(i/19)
            sphere('Pomegranates',(x+r*s*math.cos(a),y+r*s*math.sin(a),z+(.62+.08*(1-i/19))*s),(.1*s,.1*s,.095*s),'fruit' if i%3 else 'ochre')

def scroll(pos=(0,0,0),s=1):
    x,y,z=pos
    rod('Papyrus roll',(x-.24*s,y,z),(x+.24*s,y,z),.075*s,'linen',16)
    for xx in [-.26,.26]:
        rod('Wooden scroll end',(x+xx*s-.025*s,y,z),(x+xx*s+.025*s,y,z),.083*s,'woodlight',12)
    # A narrow tie across the roll.
    rod('Scroll tie',(x,y-.077*s,z),(x,y+.077*s,z),.012*s,'clay',8)

def roof(w,d,z):
    rise=w*.24
    for side in [-1,1]:
        mesh('Roof deck',[(0,-d/2,z+rise),(0,d/2,z+rise),(side*w/2,d/2,z),(side*w/2,-d/2,z)],[(0,1,2,3)],'clay')
        for row in range(max(2,int(w/.8))):
            t=(row+.5)/max(2,int(w/.8)); x=side*t*w/2; zz=z+rise*(1-t)
            for j in range(int(d/.42)):
                yy=-d/2+(j+.5)*d/int(d/.42)
                tube('Curved overlapping roof tile',[(x-side*.22,yy,zz+.16),(x,yy,zz+.06),(x+side*.22,yy,zz-.05)],.065,'clay',6)
    for j in range(int(d/.4)):rod('Ridge cap',(0,-d/2+j*.4,z+rise+.09),(0,-d/2+j*.4+.43,z+rise+.09),.12,'ochre')

def ship(skiff=False):
    length=5 if skiff else 7; width=1.6 if skiff else 2.65
    # Separate curved strakes, full volume, open bulwarks and internal deck.
    for j in range(9):
        verts=[]
        for k in range(33):
            u=-1+2*k/32; yy=u*length/2; taper=max(.015,1-u*u)**.55
            for side in [-1,1]:
                for edge in [0,1]:
                    t=(j+edge*.92)/9; xx=side*width/2*taper*math.sin(t*math.pi/2)
                    zz=-.37+.99*t+abs(u)**5*.56
                    verts.append((xx,yy,zz))
        faces=[]
        for k in range(32):
            for side in [0,2]:faces.append((k*4+side,(k+1)*4+side,(k+1)*4+side+1,k*4+side+1))
        mesh('Clinker hull strake',verts,faces,'wood' if j%3 else 'woodlight')
    for side in [-1,1]:
        for h in [.62,.46]:tube('Continuous gunwale',[(side*width/2*max(.015,1-u*u)**.55,u*length/2,h+abs(u)**5*.56) for u in [-1+i/24*2 for i in range(25)]],.045,'woodlight')
    for i in range(23):
        yy=-length*.43+i*length*.86/22; u=yy/(length/2)
        box('Deck plank',(0,yy,.35),(width*max(.01,1-u*u)**.55*.82,length*.86/23-.014,.07),'woodlight',.008)
    for yy in [-length*.32,0,length*.3]:box('Bench thwart',(0,yy,.65),(width*.75,.24,.1),'woodlight')
    for yy in [-length/2,length/2]:tube('Raised curved stem',[(0,yy*.92,.25),(0,yy,1.0),(0,yy*1.015,1.35),(0,yy*.97,1.48)],.09,'wood')
    rod('Steering oar',(width*.38,length*.34,1.0),(width*.65,length*.55,-.1),.045,'woodlight')
    box('Steering blade',(width*.65,length*.55,-.07),(.17,.48,.38),'woodlight')
    if skiff:
        for side in [-1,1]:
            rod('Rowing oar',(side*.3,-.3,.73),(side*1.4,1,.24),.035,'woodlight')
            rod('Oar blade',(side*1.4,1,.24),(side*1.6,1.25,.16),.09,'woodlight',6)
        basket((0,1,.4),.75)
    else:
        rod('Mast heel',(0,0,.35),(0,0,5.7),.095,'woodlight',16)
        rod('Yard',(-2.03,0,5.15),(2.03,0,5.15),.065,'woodlight')
        for stripe in range(9):
            verts=[]; rows=16
            for j in range(rows+1):
                t=j/rows
                for side in [0,1]:
                    u=-1+2*(stripe+side)/9
                    verts.append((u*1.9*(1-.1*t),-.18-.53*math.sin(t*math.pi)*(1-u*u),5.05-3.15*t+.08*u*u))
            mesh('Billowing sewn sail panel',verts,[(2*j,2*j+1,2*j+3,2*j+2) for j in range(rows)],'linen' if stripe%4 else 'teal',True)
        for x in [-1.9,1.9]:
            tube('Sail leech',[(x*(1-.1*t),-.18,5.05-3.15*t+.08) for t in [j/16 for j in range(17)]],.018,'rope')
        for side in [-1,1]:
            for yy in [-2.7,2.7]:rod('Standing rigging',(0,0,5.55),(side*.95,yy,.63),.02,'rope')
            rod('Sheet',(side*1.71,-.18,1.98),(side*1.12,1.5,.63),.019,'rope')
        for x,y in [(-.53,1.2),(.15,1.35),(.6,1.1)]:pot((x,y,.39),.54)
        crate((-.2,-1.5,.39),.65)
        anchor('CargoAnchor',(0,1,.5))
    anchor('Waterline',(0,0,0))

# Consolidated export and studio review, shared by both packs.
def descendants(root):return [o for o in root.children_recursive if o.type=='MESH']
def consolidate(root):
    groups={}
    for o in descendants(root):groups.setdefault(o.data.materials[0].name,[]).append(o)
    for key,objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=objects[0];o.name=root.name+'__'+key
        # Apply transforms to preserve straightforward instancing and bounds.
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)

def select_roots(roots):
    bpy.ops.object.select_all(action='DESELECT')
    for root in roots:
        root.select_set(True)
        for o in root.children_recursive:o.select_set(True)


def export_pack(bundle="alexandria-kit", preview="alexandria-contact-sheet", source_script="scripts/blender/build_alexandria_pack.py"):
    global ROOT
    manifest=[]
    for asset in ASSETS:consolidate(asset['root'])
    # Mesh primitives can temporarily occupy an asset's requested name during
    # authoring. Normalize root IDs after all temporary meshes have been joined.
    for asset in ASSETS:asset['root'].name=asset['id']
    for asset in ASSETS:
        root=asset['root'];select_roots([root])
        path=os.path.join(OUT,asset['id']+'.glb')
        bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,export_yup=True,export_extras=True)
        verts=[o.matrix_world@v.co for o in descendants(root) for v in o.data.vertices]
        minimum=[min(v[i] for v in verts) for i in range(3)];maximum=[max(v[i] for v in verts) for i in range(3)]
        entry={k:v for k,v in asset.items() if k!='root'}
        entry.update(file=asset['id']+'.glb',bytes=os.path.getsize(path),blenderBounds=[minimum,maximum],license='MIT',creator='Counterfactual Worlds',source=source_script)
        manifest.append(entry)
    select_roots([a['root'] for a in ASSETS])
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,bundle+'.glb'),export_format='GLB',use_selection=True,export_yup=True,export_extras=True)
    with open(os.path.join(OUT,'manifest.json'),'w') as f:json.dump(dict(version=1,provenance='Original interpretive scene assets; not archaeological replicas or primary evidence.',assets=manifest),f,indent=2)

    # Editable source opens as an organized collection, with a studio contact sheet.
    ROOT=None
    rows=math.ceil(len(ASSETS)/6); center_y=(rows-1)*6.3/2
    for i,asset in enumerate(ASSETS):
        root=asset['root'];bounds=manifest[i]['blenderBounds'];size=max(bounds[1][j]-bounds[0][j] for j in range(3))
        scale=3.45/size;root.scale=(scale,)*3
        root.location=((i%6-2.5)*4.9,(i//6)*6.3,-bounds[0][2]*scale+.17)
        box('Display plinth',(root.location.x,root.location.y,.04),(4.5,4.5,.16),'mortar',.07)
        bpy.ops.object.text_add(location=(root.location.x-2.1,root.location.y-2.13,.145))
        label=bpy.context.object;label.name='Label '+asset['id'];label.data.body=f'{i+1:02}  '+asset['title'];label.data.size=.22;label.data.extrude=0;label.data.materials.append(M['linen'])

    world=bpy.data.worlds.new('Studio World');bpy.context.scene.world=world;world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.16,.2,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.55
    box('Studio floor',(0,center_y,-.2),(200,200,.2),'endgrain',0)
    def area(loc,energy,size):
        bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=energy;o.data.shape='DISK';o.data.size=size
        o.rotation_euler=(Vector((0,center_y,0))-o.location).to_track_quat('-Z','Y').to_euler()
    area((-12,-5,25),9500,18);area((15,13,20),7000,16);area((-7,30,22),10000,15)
    bpy.ops.object.camera_add(location=(7,center_y-37,47));cam=bpy.context.object
    cam.rotation_euler=(Vector((0,center_y,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=max(36,rows*6.3+6.5)
    scene=bpy.context.scene;scene.camera=cam;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.resolution_x=2100;scene.render.resolution_y=2100;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(OUT,preview+'.png');scene.view_settings.view_transform='AgX'
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,bundle+'.blend'),compress=True)
    bpy.ops.render.render(write_still=True)
    print('ALEXANDRIA_PACK_COMPLETE',len(ASSETS),OUT)
