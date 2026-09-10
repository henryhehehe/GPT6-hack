"""Original illustrative Odyssey/Austen object kits, not source reconstructions.
Run with Blender --python this_file -- odyssey | austen.
"""
import sys
import math
import random
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import asset_utils as a
from mathutils import Vector


def letter(opened=False):
    if opened:
        verts=[]
        for j in range(7):
            y=-.24+j*.08
            for i in range(3):verts.append((-.18+i*.18,y,.012+.009*abs(math.sin(j*math.pi/3))))
        a.mesh('Blank letter sheet',verts,[(j*3+i,j*3+i+1,(j+1)*3+i+1,(j+1)*3+i) for j in range(6) for i in range(2)],'paper')
    else:
        a.box('Folded letter',(0,0,.008),(.27,.16,.016),'paper',.003)
        a.mesh('Folded paper flap',[(-.135,.08,.018),(.135,.08,.018),(0,-.035,.022)],[(0,1,2)],'linen',False)
        a.ellipsoid('Wax seal',(0,-.025,.022),(.023,.023,.006),'rose',20,8,'glaze')


def writing_set():
    a.lathe('Ink bottle',[(.001,0),(.053,0),(.067,.025),(.058,.09),(.026,.11),(.026,.145),(.015,.145),(.015,.115),(.001,.115)],'ink',28,'glaze')
    a.ring('Bottle lip',(0,0,.144),.023,.006,'gold',24,'metal')
    a.tube('Quill shaft',[(0,0,.12),(.06,0,.24),(.15,.015,.42),(.20,.015,.58)],.004,'cream',6)
    points=[(.065,0,.27),(.105,0,.34),(.142,.01,.42),(.17,.01,.49),(.20,.015,.58)]
    widths=[.010,.030,.039,.030,0]
    verts=[]
    for (x,y,z),w in zip(points,widths):verts.extend([(x-w,y,z+.4*w),(x,y-.005,z),(x+w,y,z-.4*w)])
    a.mesh('Feather vane',verts,[(i*3+j,i*3+j+1,(i+1)*3+j+1,(i+1)*3+j) for i in range(4) for j in range(2)],'paper')
    for i in range(10):
        t=i/10;x=.083+t*.10;z=.30+t*.23;w=.028*math.sin(t*math.pi)
        a.tube('Feather barbs',[(x-w,0,z+.4*w),(x,-.006,z),(x+w,0,z-.4*w)],.0015,'linen',4)


def chair():
    for x in [-.225,.225]:
        for y in [-.215,.215]:
            a.beam('Tapered chair leg',(x*1.15,y*1.15,.025),(x,y,.47),.046)
    a.box('Seat frame',(0,0,.46),(.54,.52,.065),'wood',.024)
    a.ellipsoid('Upholstered seat',(0,-.01,.51),(.259,.246,.055),'teal',28,12)
    for x in [-.23,.23]:
        a.beam('Back upright',(x,.23,.43),(x,.29,1.02),.048)
    a.box('Curved crest rail',(0,.28,1.01),(.53,.065,.10),'wood_light',.03)
    a.box('Lower back rail',(0,.245,.64),(.46,.05,.05),'wood',.012)
    a.beam('Crossed back slat',(-.195,.25,.65),(.195,.27,.95),.023,'wood_light',.033)
    a.beam('Crossed back slat',(.195,.25,.65),(-.195,.27,.95),.023,'wood_light',.033)
    a.ellipsoid('Back medallion',(0,.225,.805),(.048,.018,.048),'gold',20,12,'metal')


def desk():
    for x in [-.56,.56]:
        for y in [-.28,.28]:
            a.beam('Tapered desk leg',(x*1.05,y*1.05,.015),(x,y,.78),.06)
            a.box('Leg collar',(x,y,.68),(.085,.085,.048),'wood_light')
    a.box('Desk top',(0,0,.805),(1.30,.74,.075),'wood_light',.025)
    a.box('Inset writing surface',(0,-.035,.845),(1.12,.56,.008),'teal',.018)
    a.box('Desk apron',(0,0,.71),(1.15,.57,.15),'wood')
    for x in [-.29,.29]:
        a.box('Drawer face',(x,-.295,.724),(.54,.04,.12),'wood_light')
        a.ellipsoid('Drawer pull',(x,-.33,.724),(.023,.02,.015),'gold',12,8,'metal')
    a.box('Back gallery',(0,.342,.895),(1.27,.04,.12),'wood',.01)


def bench():
    for x in [-.60,.60]:
        for y in [-.20,.20]:a.beam('Bench leg',(x*1.05,y*1.2,.025),(x,y,.50),.065,'wood_light')
    for y in [-.2,-.067,.067,.2]:a.box('Seat slat',(0,y,.51),(1.50,.12,.055),'wood_light',.015)
    for x in [-.65,.65]:a.beam('Back upright',(x,.2,.40),(x,.29,.99),.06,'wood')
    for z in [.70,.86,.98]:a.box('Back slat',(0,.27,z),(1.49,.05,.095),'wood_light',.015)


def window():
    # Open glazed areas remain empty to avoid implying a rendered room behind them.
    for x in [-.59,.59]:a.box('Outer sash stile',(x,0,1.07),(.095,.12,2.14),'cream',.012)
    for z in [.06,1.07,2.08]:a.box('Horizontal sash rail',(0,0,z),(1.20,.12,.08),'cream',.009)
    for x in [-.18,.18]:a.box('Glazing bar',(x,0,1.07),(.026,.048,2.02),'cream',.003)
    for z in [.56,1.58]:a.box('Glazing bar',(0,0,z),(1.10,.048,.026),'cream',.003)
    a.box('Window sill',(0,-.07,.07),(1.38,.30,.085),'paper',.018)
    a.box('Window cornice',(0,0,2.17),(1.37,.20,.09),'paper',.012)


def doorway():
    for x in [-.61,.61]:
        a.box('Paneled door jamb',(x,0,1.12),(.13,.19,2.24),'cream',.015)
        a.box('Jamb base',(x,0,.14),(.17,.23,.28),'paper',.012)
    for z,w in [(2.23,1.38),(2.31,1.50)]:a.box('Door entablature',(0,0,z),(w,.23,.08),'paper',.015)
    # Door is a separate named mesh with a hinge origin for runtime animation.
    parts=[]
    parts.append(a.box('Door leaf',(0,0,1.10),(1.08,.065,2.18),'wood_light',.012))
    for x in [-.25,.25]:
        for z,h in [(.47,.58),(1.37,.98)]:
            parts.append(a.box('Raised door panel',(x,-.04,z),(.43,.025,h),'wood',.014))
    parts.append(a.ellipsoid('Door handle',(.40,-.083,1.08),(.025,.029,.025),'gold',12,8,'metal'))
    bpy=a.bpy;bpy.ops.object.select_all(action='DESELECT')
    for p in parts:p.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join()
    door=parts[0];door.name='austen-doorway__DoorLeaf'
    bpy.context.scene.cursor.location=(-.54,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    hinge=bpy.data.objects.new('austen-doorway__DoorHinge',None);bpy.context.collection.objects.link(hinge);hinge.parent=a.ROOT;hinge.location=(-.54,0,0)
    door.parent=hinge;door.location=(0,0,0)


def paneled_wall():
    a.box('Plaster wall',(0,0,1.30),(2.4,.16,2.6),'cream',.008)
    a.box('Wall skirting',(0,-.10,.10),(2.42,.07,.20),'paper',.008)
    for z in [.94,1.01,2.56]:a.box('Wall molding',(0,-.105,z),(2.42,.10,.045),'paper',.008)
    for x in [-.8,0,.8]:
        a.box('Inset panel',(x,-.10,.55),(.67,.035,.58),'linen',.012)
        for dx in [-.335,.335]:a.box('Panel upright',(x+dx,-.13,.55),(.026,.035,.62),'paper',.004)
        for z in [.24,.86]:a.box('Panel rail',(x,-.13,z),(.696,.035,.027),'paper',.004)


def garden_path():
    for row in range(8):
        for col in range(4):
            color=(.44+row%3*.018,.45+col%2*.018,.40,1)
            a.box('Garden paving',(-.75+col*.5,-1.75+row*.5,.045),(.48,.48,.09),color,.025)
    for side in [-1,1]:
        for row in range(8):a.box('Path edging',(side*1.04,-1.75+row*.5,.07),(.13,.485,.14),'cream',.014)


def rock():
    rng=random.Random(19)
    for p,s in [((0,0,.52),(1.0,.73,.62)),((.68,.10,.26),(.53,.44,.30)),((-.40,-.48,.18),(.43,.30,.22))]:
        a.bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=p)
        o=a.bpy.context.object
        for v in o.data.vertices:
            v.co*=rng.uniform(.9,1.12)
            v.co.z=max(v.co.z,-p[2]/s[2])
        o.scale=s;a.bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        a.finish(o,'Weathered coast rock',(.34,.365,.345,1),smooth=False)


def cave():
    # Open-ended barrel cave with a real clear central passage, no invisible back wall.
    verts=[];steps=20;rows=9
    for layer in [0,1]:
        for row in range(rows):
            y=-2+row*.5
            for j in range(steps+1):
                t=j*math.pi/steps
                wobble=(.05 if layer==0 else .16)*math.sin(j*2.1+row*.7)
                rx=(1.50 if layer==0 else 2.05)+wobble
                rz=(2.05 if layer==0 else 2.55)+wobble
                verts.append((rx*math.cos(t),y,rz*math.sin(t)))
    stride=rows*(steps+1);faces=[]
    for layer in [0,1]:
        for row in range(rows-1):
            for j in range(steps):
                n=layer*stride+row*(steps+1)+j
                f=(n,n+1,n+steps+2,n+steps+1);faces.append(f if layer else tuple(reversed(f)))
    for row in [0,rows-1]:
        for j in range(steps):
            n=row*(steps+1)+j;faces.append((n,n+stride,n+stride+1,n+1))
    shell=a.mesh('Rock cave shell',verts,faces,(.32,.34,.32,1),False)
    palette=shell.data.color_attributes['Col']
    for face in shell.data.polygons:
        shade=.93+.10*math.sin(face.index*.71)
        for loop in face.loop_indices:palette.data[loop].color=(.32*shade,.34*shade,.32*shade,1)
    # Side footholds stay outside the 2.8 m clear route.
    for side in [-1,1]:
        for i in range(4):
            a.bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=(side*(1.67+i*.025),-2.01,.20+i*.40))
            stone=a.bpy.context.object;stone.scale=(.35,.28,.27)
            a.bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
            a.finish(stone,'Angular entrance stone',(.36,.38,.35,1))
        for i in range(4):
            a.bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=(side*1.65,-1.45+i*.95,.58+i%2*.45))
            stone=a.bpy.context.object;stone.scale=(.61,.71,.61)
            a.bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
            a.finish(stone,'Rock shell outcrop',(.32+i*.015,.35+i*.01,.32,1))
    a.anchor('Anchor_Entrance',(0,-2.3,0));a.anchor('Anchor_Exit',(0,2.3,0))


def ship():
    verts=[];rows=19;steps=12
    for k in range(rows):
        y=-2.8+k*5.6/(rows-1);t=y/2.8
        w=.92*(max(0,1-t*t)**.60)+.035
        for j in range(steps+1):
            u=-1+j*2/steps
            verts.append((w*u,y,.10+.72*u*u+.34*abs(t)**4))
    faces=[]
    for k in range(rows-1):
        for j in range(steps):
            n=k*(steps+1)+j;faces.append((n,n+steps+1,n+steps+2,n+1))
    hull=a.mesh('Curved merchant hull',verts,faces,'wood')
    mod=hull.modifiers.new('Hull plank thickness','SOLIDIFY');mod.thickness=.055
    a.bpy.context.view_layer.objects.active=hull;a.bpy.ops.object.modifier_apply(modifier=mod.name)
    for side in [-1,1]:
        pts=[]
        for k in range(rows):
            y=-2.8+k*5.6/(rows-1);t=y/2.8;pts.append((side*(.92*max(0,1-t*t)**.60+.035),y,.86+.34*abs(t)**4))
        a.tube('Gunwale',pts,.045,'wood_light',8)
    for k in range(15):
        y=-2.4+k*.34;w=.87*(1-(y/2.8)**2)**.60
        a.box('Deck planking',(0,y,.79+.18*abs(y/2.8)**4),(w*2,.326,.07),'wood_light',.007)
    for y in [-1.6,-.8,.8,1.6]:a.box('Thwart',(0,y,.95),(1.4*(1-(y/2.8)**2),.16,.08),'wood',.012)
    a.beam('Mast',(0,0,.78),(0,0,4.15),.095,'wood')
    a.beam('Yard',(-1.43,0,3.77),(1.43,0,3.77),.067,'wood')
    verts=[]
    for row in range(11):
        t=row/10
        for col in range(13):
            u=-1+col/6;x=u*(1.30+.06*math.sin(t*math.pi))
            verts.append((x,-.10-.32*math.sin(t*math.pi)*(1-u*u),3.74-t*1.93+.10*u*u*math.sin(t*math.pi)))
    sail=a.mesh('Bowed woven sail',verts,[(r*13+c,r*13+c+1,(r+1)*13+c+1,(r+1)*13+c) for r in range(10) for c in range(12)],'linen')
    mod=sail.modifiers.new('Sail thickness','SOLIDIFY');mod.thickness=.008;a.bpy.context.view_layer.objects.active=sail;a.bpy.ops.object.modifier_apply(modifier=mod.name)
    for side in [-1,1]:
        for y in [-1.8,1.8]:a.tube('Standing rigging',[(0,0,4.08),(side*.65,y,.90)],.012,'rope',6)
        a.tube('Sail edge',[(side*1.3,-.10,3.74),(side*1.35,-.14,2.8),(side*1.3,-.10,1.81)],.014,'cream',6)
    a.beam('Steering oar',(1.12,2.2,.20),(.55,1.65,1.38),.05,'wood')
    o=a.box('Oar blade',(1.16,2.23,.23),(.23,.10,.60),'wood_light',.04);o.rotation_euler[1]=.40


def sheep():
    for x in [-.17,.17]:
        for y in [-.25,.25]:
            a.beam('Sheep leg',(x,y,.02),(x,y,.43),.065,'wood_light')
            a.box('Hoof',(x,y,.04),(.09,.10,.08),'ink',.025)
    a.ellipsoid('Wool body',(0,0,.55),(.29,.46,.28),'paper',24,14)
    for i in range(10):
        t=i*math.tau/10;a.ellipsoid('Wool curl',(.22*math.cos(t),.32*math.sin(t),.65),(.10,.13,.12),'cream' if i%4==0 else 'paper',12,8)
    a.ellipsoid('Sheep neck',(0,-.35,.65),(.14,.16,.22),'paper',16,10)
    a.ellipsoid('Sheep face',(0,-.49,.70),(.105,.19,.13),'wood_light',20,12)
    for side in [-1,1]:
        a.ellipsoid('Ear',(side*.13,-.40,.78),(.12,.047,.036),'wood_light',12,8)
        a.ellipsoid('Eye',(side*.085,-.55,.74),(.015,.016,.018),'ink',12,8,'glaze')
    a.ellipsoid('Tail',(0,.46,.58),(.07,.12,.08),'paper',16,8)


PACKS={
 'austen-architecture': [('paneled-wall','Paneled interior wall',paneled_wall,(-1.4,1.0,0)),('garden-path','Garden paving module',garden_path,(1.1,-.1,0))],
 'austen': [('folded-letter','Sealed folded letter',lambda:letter(False),(-1.4,-1.1,0)),('open-letter','Open blank letter',lambda:letter(True),(-.75,-1.1,0)),('quill-inkwell','Quill and inkwell',writing_set,(-.1,-1.1,0)),('period-chair','Period-inspired chair',chair,(-1.35,.1,0)),('writing-desk','Writing desk',desk,(0,.6,0)),('garden-bench','Garden bench',bench,(1.5,-.3,0)),('sash-window','Sash window frame',window,(-1.5,1.5,0)),('austen-doorway','Paneled doorway',doorway,(1.5,1.5,0))],
 'odyssey': [('coast-rocks','Coastal rock cluster',rock,(-2,-1,0)),('cave-module','Open cave module',cave,(-2,2,0)),('merchant-ship','Interpretive merchant ship',ship,(2.4,1,0)),('sheep','Woolly sheep',sheep,(0,-1.8,0))],
}
if __name__=='__main__':
    pack=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'austen'
    a.reset();roots=[]
    for asset_id,title,build,p in PACKS[pack]:
        r=a.root(asset_id);build();a.anchor('Anchor_Inspect',(0,-.30,.40))
        a.consolidate(r)
        # Normalize terrain and ship hull to the ground-origin contract.
        a.bpy.context.view_layer.update()
        low=min((o.matrix_world@v.co).z for o in r.children_recursive if o.type=='MESH' for v in o.data.vertices)
        if low<-.001 or low>.10:
            for o in list(r.children):o.location.z-=low
        a.bpy.context.view_layer.update()
        anchors=['Anchor_Inspect']+(['Anchor_Entrance','Anchor_Exit'] if asset_id=='cave-module' else [])
        a.export_asset(r,'props',pack,title,anchors);roots.append((r,p))
    for r,p in roots:r.location=p
    scale=8.8 if pack=='austen-architecture' else 7 if pack=='austen' else 12
    a.studio(pack,'props',(0,.4,1.0 if pack.startswith('austen') else 1.5),scale,1500,1000,view=(7,-12,8))
