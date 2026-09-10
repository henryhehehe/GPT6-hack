"""Original historically inspired Hellenistic teaching-world assets.
Run: blender --background --python build_landmarks.py -- /absolute/output
No claim of archaeological reconstruction; no external assets.
"""
import bpy, math, random, sys, os
from mathutils import Vector
random.seed(49)
OUTPUT = sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else '/private/tmp/cw-landmarks/output'
LIBRARY_ONLY = '--library-only' in sys.argv
os.makedirs(OUTPUT, exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
M={}
def mat(name, color, rough=.8, metal=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    M[name]=m; return m
mat('warm limestone',(0.72,.64,.48)); mat('cream marble',(.87,.81,.65)); mat('stone shadow',(.46,.41,.32)); mat('recess',(.15,.18,.18)); mat('roof base',(.39,.16,.10)); mat('bronze',(.27,.22,.11),.43,.65); mat('aged turquoise',(.12,.31,.30),.55,.25); mat('linen',(.73,.67,.49)); mat('terracotta',(.61,.29,.17)); mat('dark wood',(.20,.13,.075))
for i in range(5): mat('roof tile '+str(i),(.46+i*.031,.205+i*.018,.125+i*.013))
for i in range(4): mat('masonry '+str(i),(.69+i*.025,.60+i*.025,.45+i*.026))
ROOT=None

def finish(o,name, material):
    o.name=name; o.data.materials.append(M[material]); o.parent=ROOT
    return o

def box(name, loc, scale, material='warm limestone', bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o=bpy.context.object; o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish(o,name,material)
    if bevel:
        b=o.modifiers.new('Dressed edges','BEVEL'); b.width=bevel; b.segments=1
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=b.name)
    return o

def mesh(name, verts, faces, material):
    me=bpy.data.meshes.new(name); me.from_pydata(verts,[],faces); me.update(); o=bpy.data.objects.new(name,me); bpy.context.collection.objects.link(o); return finish(o,name,material)

def cylinder(name, loc, radius, depth, material='cream marble', sides=32, top=None):
    bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=radius, radius2=radius if top is None else top, depth=depth, location=loc)
    return finish(bpy.context.object,name,material)

def ring(name,loc,major,minor,material='cream marble'):
    bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=6,location=loc,major_radius=major,minor_radius=minor)
    return finish(bpy.context.object,name,material)

def column(x,y,z,height=6.1,r=.42):
    box('Column square plinth',(x,y,z+.10),(r*2.6,r*2.6,.20),'cream marble',.025)
    cylinder('Attic base',(x,y,z+.28),r*1.15,.20)
    ring('Base torus',(x,y,z+.39),r*.93,r*.15)
    verts=[]; n=80
    for zz, taper in [(z+.42,1),(z+height*.35,.99),(z+height-.48,.84)]:
        for i in range(n):
            a=i*math.tau/n; rr=r*taper*(1-.078*(1+math.cos(a*20)))
            verts.append((x+rr*math.cos(a),y+rr*math.sin(a),zz))
    faces=[]
    for h in range(2):
        for i in range(n): faces.append((h*n+i,h*n+(i+1)%n,(h+1)*n+(i+1)%n,(h+1)*n+i))
    faces.extend([tuple(reversed(range(n))),tuple(range(n*2,n*3))]); mesh('Twenty fluted shaft',verts,faces,'cream marble')
    ring('Necking',(x,y,z+height-.46),r*.84,r*.07)
    cylinder('Echinus',(x,y,z+height-.27),r*.89,.28,top=r*1.24)
    box('Abacus',(x,y,z+height-.075),(r*2.8,r*2.8,.15),'cream marble',.022)

def masonry_wall(name,center,width,height,thick,axis='x',zbase=1.1):
    x,y=center
    box(name+' core',(x,y,zbase+height/2),(width,thick,height) if axis=='x' else (thick,width,height),'stone shadow')
    rowh=.56; rows=int(height/rowh)
    for row in range(rows):
        # Narrow deliberate mortar gaps and alternate long/short ashlar courses.
        length=1.8; start=-width/2
        while start<width/2-.001:
            end=min(width/2,start+(length/2 if start==-width/2 and row%2 else length))
            ll=end-start-.025; pos=(start+end)/2
            box(name+' ashlar',(x+pos,y,zbase+(row+.5)*rowh) if axis=='x' else (x,y+pos,zbase+(row+.5)*rowh),(ll,thick+.045,rowh-.023) if axis=='x' else (thick+.045,ll,rowh-.023),'masonry '+str(random.randrange(4)))
            start=end

def gabled_roof(x,y,z,width,depth,rise):
    # Thin sloping roof decks, individual staggered terracotta tile rows, ridge caps.
    slope=math.atan2(rise,width/2); slength=math.hypot(width/2,rise)
    for sign in [-1,1]:
        o=box('Thin sloping roof deck',(x+sign*width/4,y,z+rise/2),(slength,depth,.14),'roof base'); o.rotation_euler[1]=sign*slope
        cols=max(1,int(depth/.48)); rows=max(1,int(slength/.46))
        for row in range(rows):
            t=(row+.5)/rows
            for c in range(cols):
                yy=y-depth/2+(c+.5)*depth/cols
                xx=x+sign*t*width/2; zz=z+rise*(1-t)+.105
                tile=box('Overlapping fired clay roof tile',(xx,yy,zz),(slength/rows+.055,depth/cols-.025,.085),'roof tile '+str(random.randrange(5)))
                tile.rotation_euler[1]=sign*slope
    for yy in [y-depth/2,y+depth/2]:
        # Pediments remain shallow architectural faces rather than massive wedge solids.
        mesh('Pediment tympanum',[(x-width/2,yy,z),(x+width/2,yy,z),(x,yy,z+rise-.10)],[(0,1,2)],'cream marble')
        for sign in [-1,1]:
            o=box('Raking cornice',(x+sign*width/4,yy,z+rise/2+.13),(slength+.2,.32,.20),'cream marble');o.rotation_euler[1]=sign*slope
    for i in range(max(1,int(depth/.52))):
        o=cylinder('Roof ridge cap',(x,y-depth/2+(i+.5)*.52,z+rise+.10),.15,.54,'terracotta',12); o.rotation_euler[0]=math.pi/2

def root(name):
    global ROOT
    ROOT=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(ROOT); return ROOT

library=root('AlexandrianScholarlyComplex_Interpretation')
# The center opening and staircase are real geometry; no concealed backdrop or solid ramp volume.
# Blender Y becomes negative Three.js Z; world origin is (0,2.9,-13).
box('Reading hall floor',(0,.5,.55),(27,13.2,1.1),'warm limestone',.015)
for x in [-9.5,9.5]: box('Portico side platform',(x,-7.6,.55),(8,3,1.1),'warm limestone',.015)
# Eight shallow treads continue the existing terrace flight, ending at world y=4.
for i in range(8):
    height=(i+1)*1.15/8
    box('Enterable portico tread',(0,-10+(i+.5)*3.9/8,-.05+height/2),(11,3.9/8,height),'cream marble',.008)

# Main hall and two slightly projecting flanking study wings.
masonry_wall('Rear hall wall',(0,5.45),20.6,6.2,.5)
masonry_wall('West hall wall',(-9.8,.6),9.7,6.2,.45,'y')
masonry_wall('East hall wall',(9.8,.6),9.7,6.2,.45,'y')
# Split the facade around a full-height central passage. The old solid backdrop
# made animated doors decorative only. Warm plaster also lights the interior naturally.
for x in [-5.11,5.11]: box('Hall entrance wall',(x,-2.35,4.3),(7.38,.3,6.4),'warm limestone')
box('Hall entrance overdoor',(0,-2.35,6.5),(2.84,.3,2.0),'warm limestone')
# A fine inlaid border and low skirting give the newly accessible hall human scale.
for x in [-8.9,8.9]: box('Interior floor border',(x,1.5,1.112),(.16,7.1,.024),'stone shadow')
for y in [-1.8,4.9]: box('Interior floor border',(0,y,1.112),(17.9,.16,.024),'stone shadow')
for x in [-9.53,9.53]: box('Interior stone skirting',(x,.7,1.24),(.12,8.9,.28),'cream marble')

for x in [-6.5,-3.5,3.5,6.5]:
    box('Portico wall pier',(x,-2.6,4.15),(2.6,.55,6.1),'warm limestone',.04)
    box('Scroll niche shadow',(x,-2.90,4.45),(1.26,.025,2.3),'recess')
    for zz in [3.7,4.25,4.8,5.3]:
        box('Library shelf',(x,-3.04,zz),(1.18,.32,.08),'dark wood')
        for s in range(5):
            cylinder('Papyrus scroll',(x-.43+s*.20,-3.04,zz+.12),.065,.26,'linen',8)
for x in [-8.5,-6.07,-3.64,-1.21,1.21,3.64,6.07,8.5]: column(x,-5.7,1.1)
for x in [-8.5,8.5]:
    for y in [-2.8,.1,3.0]: column(x,y,1.1)
for x in [-11.55,11.55]:
    masonry_wall('Study wing facade',(x,-4.1),3.0,5.6,.5)
    masonry_wall('Study wing outer',(x+(-1.48 if x<0 else 1.48),.2),9.1,5.6,.4,'y')
    box('Wing recessed window',(x,-4.37,4.45),(1.30,.04,1.9),'recess')
    box('Wing window sill',(x,-4.52,3.48),(1.65,.5,.16),'cream marble')
    for xx in [-.55,.55]: box('Window surround',(x+xx,-4.45,4.45),(.12,.15,2.05),'cream marble')
    gabled_roof(x,.1,6.9,3.4,10.0,.8)
for z,h,w,d in [(7.32,.30,19.4,12.4),(7.64,.28,19.65,12.6),(8.02,.38,19.55,12.5),(8.34,.20,20,12.8)]: box('Layered entablature',(0,-.2,z),(w,d,h),'cream marble',.025)
# Applied alternating triglyphs and recessed metopes on the front frieze.
for i in range(34):
    xx=-9.45+i*.573
    box('Frieze triglyph',(xx,-6.49,8.02),(.18,.105,.37),'stone shadow')
    for dx in [-.048,0,.048]: box('Triglyph channel',(xx+dx,-6.55,8.02),(.013,.01,.29),'cream marble')
for xx in [i*.38-9.5 for i in range(51)]: box('Front cornice dentil',(xx,-6.54,8.26),(.19,.25,.18),'cream marble')
for x in [-9.78,9.78]:
    for i in range(31):box('Side cornice dentil',(x,-6.2+i*.4,8.26),(.25,.19,.18),'cream marble')
gabled_roof(0,-.2,8.48,20.4,13.4,2.45)
# Central bronze archive doors retain separate object names and origin at hinges.
box('Archive flush threshold',(0,-3.04,1.105),(3.05,1.1,.01),'cream marble')
for x in [-1.46,1.46]:box('Archive jamb',(x,-2.95,3.20),(.25,.46,4.2),'cream marble')
box('Archive lintel',(0,-2.95,5.38),(3.25,.53,.32),'cream marble')
for side,name in [(-1,'ArchiveDoorLeft'),(1,'ArchiveDoorRight')]:
    door=box(name,(side*.66,-3.03,3.16),(1.29,.16,3.77),'bronze',.035)
    # Child panel ornaments will be joined into their corresponding movable door.
    pieces=[door]
    for zz in [2.12,3.17,4.22]:
        pieces.append(box('Door inset panel',(side*.66,-3.13,zz),(1.03,.09,.80),'aged turquoise',.04))
        for dx in [-.48,.48]:
            for dz in [-.33,.33]: pieces.append(cylinder('Bronze door rivet',(side*.66+dx,-3.205,zz+dz),.036,.05,'bronze',8))
    bpy.ops.object.select_all(action='DESELECT')
    for o in pieces:o.select_set(True)
    bpy.context.view_layer.objects.active=door;bpy.ops.object.join();door.name=name
    bpy.context.scene.cursor.location=(side*1.305,-3.03,1.25);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
# Acroteria and a restrained central roof emblem.
for x in [-10.2,10.2]:
    cylinder('Corner acroterion plinth',(x,-6.9,8.68),.20,.25)
    cylinder('Corner finial',(x,-6.9,9.0),.15,.40,top=.025)
cylinder('Pediment bronze medallion',(0,-6.93,9.31),.47,.08,'bronze',40).rotation_euler[0]=math.pi/2
# Low foreground courtyard paving and braziers anchor entrance scale.
for x in [-7,7]:
    cylinder('Bronze brazier stand',(x,-7.0,1.58),.12,.85,'bronze',16)
    cylinder('Bronze brazier bowl',(x,-7,2.03),.20,.25,'bronze',24,top=.36)

ROOT=None
if not LIBRARY_ONLY:
    lighthouse=root('PharosInspiredLighthouse_Interpretation')
    for zz,ww in [(.18,5.8),(.48,5.4),(.76,5.05)]:box('Lighthouse stepped footing',(0,0,zz),(ww,ww,.30),'warm limestone',.045)
    # Tapered square masonry shaft with visible course bands and recessed openings.
    def tapered_square(z0,z1,w0,w1,name):
        verts=[(x*w,y*w,z) for z,w in [(z0,w0/2),(z1,w1/2)] for x,y in [(-1,-1),(1,-1),(1,1),(-1,1)]]
        return mesh(name,verts,[(0,3,2,1),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)],'warm limestone')
    tapered_square(.92,7.6,4.5,3.62,'Tapered square lower Pharos tier')
    for i in range(12):
        zz=1+i*.55;ww=4.5-(zz-.92)/(7.6-.92)*.88
        box('Lower shaft masonry course',(0,0,zz),(ww+.02,ww+.02,.045),'stone shadow')
    for zz in [2.45,4.25,6.05]:
        ww=4.5-(zz-.92)/6.68*.88
        for side in [-1,1]:
            box('Narrow lower tier opening',(0,side*(ww/2+.01),zz),(.32,.028,.86),'recess')
            box('Narrow side tier opening',(side*(ww/2+.01),0,zz),(.028,.32,.86),'recess')
    box('Base entry shadow',(0,-2.26,1.70),(.9,.045,1.55),'recess')
    for zz,w,h in [(7.64,4.10,.28),(7.87,4.48,.18)]:box('First terrace cornice',(0,0,zz),(w,w,h),'cream marble',.03)
    for side in [-1,1]:
        for i in range(7):
            box('Lower balcony crenel',(side*2.06,-1.8+i*.6,8.08),(.30,.29,.40),'cream marble')
            box('Lower balcony crenel',(-1.8+i*.6,side*2.06,8.08),(.29,.30,.40),'cream marble')
    cylinder('Octagonal middle tier',(0,0,10.05),1.71,4.15,'warm limestone',8,top=1.40)
    for zz in [8.4,9.0,9.6,10.2,10.8,11.4]:
        rr=1.71-(zz-7.975)/4.15*.31
        cylinder('Octagonal stone course',(0,0,zz),rr+.014,.043,'stone shadow',8)
    for a in [i*math.pi/2 for i in range(4)]:
        rr=1.49;o=box('Middle tier slit',(rr*math.sin(a),-rr*math.cos(a),10.55),(.24,.032,1.10),'recess');o.rotation_euler[2]=a
    cylinder('Octagonal balcony',(0,0,12.16),1.80,.26,'cream marble',8)
    cylinder('Lantern base',(0,0,12.40),1.17,.25,'cream marble',32)
    for i in range(8):
        a=i*math.tau/8;column(math.cos(a)*.97,math.sin(a)*.97,12.53,height=1.53,r=.105)
    cylinder('Lantern basin',(0,0,12.8),.48,.24,'bronze',24,top=.62)
    cylinder('Lantern golden reflector',(0,0,13.22),.30,.72,'bronze',24,top=.18)
    cylinder('Lantern entablature',(0,0,14.13),1.32,.21,'cream marble',32)
    cylinder('Conical lantern roof',(0,0,14.49),1.39,.59,'aged turquoise',32,top=.12)
    cylinder('Roof finial',(0,0,15.00),.095,.58,'bronze',16,top=.025)
    ROOT=None
def descendants(r): return [o for o in bpy.data.objects if o.parent==r and o.type=='MESH']
def consolidate(r):
    groups={}
    for o in descendants(r):
        if o.name.startswith('ArchiveDoor'):continue
        key=o.data.materials[0].name;groups.setdefault(key,[]).append(o)
    for key,obs in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in obs:o.select_set(True)
        bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();obs[0].name=r.name+' / '+key
    for o in descendants(r):
        for poly in o.data.polygons:poly.use_smooth=False

def export(r,name):
    bpy.ops.object.select_all(action='DESELECT');r.select_set(True)
    for o in descendants(r):o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTPUT,name+'.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True)
for r,n in ([(library,'library')] if LIBRARY_ONLY else [(library,'library'),(lighthouse,'lighthouse')]):consolidate(r);export(r,n)
if LIBRARY_ONLY:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTPUT,'library-interior.blend'))
    print('LIBRARY_INTERIOR_OUTPUT',OUTPUT)
    sys.exit(0)
# QA studio scene has both assets; lighthouse is set aside after standalone export.
lighthouse.location=(19,4,0)
world=bpy.data.worlds.new('Navy studio');bpy.context.scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.035,.055,.09,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5
mat('studio floor',(.035,.054,.077));box('Studio floor',(0,0,-.13),(200,200,.10),'studio floor')
def area(name,loc,energy,size):
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=energy;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,4))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large warm key',(-15,-18,30),6500,15);area('Cool fill',(15,-5,18),4000,12);area('Rear rim',(-2,15,20),5500,10)
bpy.ops.object.camera_add(location=(32,-43,28));camera=bpy.context.object;camera.rotation_euler=(Vector((1,0,5))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=43
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(OUTPUT,'library.png')
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTPUT,'landmarks.blend'))
bpy.ops.render.render(write_still=True)
print('LANDMARK_OUTPUT',OUTPUT)
