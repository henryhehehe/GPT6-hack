"""Thin, gravity-led interpretive clothing for the fictional Greek companions.

The chiton/girdle and rectangular mantle are informed by the Met's Ancient Greek
Dress essay and Walters 48.297. The exact cuts, colors and drapes are authored
interpretations, not replicas. Mesh folds carry the shape; no noisy weave shader.
"""
import math
import bpy
from mathutils import Vector
import asset_utils as a

TAU=math.tau

def smooth(value):
    value=max(0,min(1,value))
    return value*value*(3-2*value)

def material(name,color,roughness=.91):
    mat=bpy.data.materials.get(name)
    if mat:return mat
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=(*color[:3],1)
    shader.inputs['Roughness'].default_value=roughness
    shader.inputs['Metallic'].default_value=0
    shader.inputs['Specular IOR Level'].default_value=.2
    return mat

def attach_weights(obj,cloth=True):
    groups={name:obj.vertex_groups.new(name=name) for name in ['Pelvis','Spine','UpperArm.L','UpperArm.R']}
    for vertex in obj.data.vertices:
        x,y,z=vertex.co
        spine=smooth((z-1.025)/.15)
        arm=(smooth((abs(x)-.19)/.105)*smooth((z-1.235)/.10))*.65 if cloth else 0
        weights={'Pelvis':1-spine,'Spine':spine*(1-arm),'UpperArm.L' if x<0 else 'UpperArm.R':spine*arm}
        for bone,weight in weights.items():
            if weight>0:groups[bone].add([vertex.index],weight,'REPLACE')

def cloth_mesh(name,vertices,faces,mat,thickness=.0017,weights=True):
    a.BONE=None
    obj=a.mesh(name,vertices,faces,(1,1,1,1))
    obj.data.materials.clear();obj.data.materials.append(mat)
    if thickness:
        modifier=obj.modifiers.new('Actual thin fabric edge','SOLIDIFY')
        modifier.thickness=thickness;modifier.offset=-.5;modifier.use_even_offset=True
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    if weights:attach_weights(obj)
    return obj

def interpolate(nodes,z):
    # Shape-preserving cubic slopes avoid a visible horizontal band at every row
    # control point while keeping the waist and shoulder silhouettes bounded.
    if z<=nodes[0][0]:return nodes[0][1:]
    if z>=nodes[-1][0]:return nodes[-1][1:]
    index=next(i for i in range(len(nodes)-1) if z<=nodes[i+1][0])
    low,high=nodes[index:index+2];h=high[0]-low[0];t=(z-low[0])/h
    result=[]
    for channel in [1,2]:
        deltas=[(b[channel]-a[channel])/(b[0]-a[0]) for a,b in zip(nodes,nodes[1:])]
        def slope(i):
            if i==0:return deltas[0]
            if i==len(nodes)-1:return deltas[-1]
            before,after=deltas[i-1],deltas[i]
            if before*after<=0:return 0
            hl=nodes[i][0]-nodes[i-1][0];hr=nodes[i+1][0]-nodes[i][0]
            w1=2*hr+hl;w2=hr+2*hl
            return (w1+w2)/(w1/before+w2/after)
        result.append((2*t**3-3*t*t+1)*low[channel]+(t**3-2*t*t+t)*h*slope(index)+(-2*t**3+3*t*t)*high[channel]+(t**3-t*t)*h*slope(index+1))
    return tuple(result)

def profile(identity):
    hem=.46 if identity=='dorian' else (.145 if identity=='thaleia' else .16)
    return [
        (hem,.226 if identity=='dorian' else .248,.140 if identity=='dorian' else .158),
        (hem+.055,.228 if identity=='dorian' else .244,.143 if identity=='dorian' else .155),
        (.73,.219,.136),(.91,.214,.128),
        (1.01,.189,.111),(1.042,.182,.106),
        (1.062,.206,.126),(1.105,.219,.140),
        (1.22,.235,.137),(1.305,.256,.121),
        (1.365,.255,.092),(1.400,.213,.072),(1.433,.078,.062),
    ]

# Unequal spacing and strength: folds are suspended from a gathered waist and
# shoulder fastenings, not equally spaced radial flutes.
FOLDS=[(-3.01,.011,.085),(-2.65,.017,.068),(-2.32,.012,.056),(-2.04,.021,.081),
       (-1.82,.012,.052),(-1.54,.020,.080),(-1.21,.015,.064),(-.91,.019,.076),
       (-.61,.011,.065),(-.29,.014,.090),(.19,.010,.100),(.63,.015,.078),
       (1.12,.017,.086),(1.66,.013,.081),(2.04,.018,.065),(2.52,.012,.094)]

def wrap(angle):return (angle+math.pi)%TAU-math.pi

def surface(identity,angle,z):
    rx,ry=interpolate(profile(identity),z)
    hem=profile(identity)[0][0]
    if z<1.04:
        drop=max(0,min(1,(1.04-z)/(1.04-hem)))
        displacement=0
        for index,(center,strength,width) in enumerate(FOLDS):
            lean=.10*math.sin(index*2.3)*drop+.05*math.sin(drop*2.7+index)
            ridge=wrap(angle-center-lean)
            growth=.28+.72*math.sin(min(1,drop*2)*math.pi/2)
            displacement+=strength*growth*(math.exp(-ridge*ridge/(width*width))-.40*math.exp(-(ridge-width*1.4)**2/(width*width*1.8)))
        # Slight side gathering raises one part of the hem and interrupts the bell silhouette.
        lift=(.022 if identity=='dorian' else .013)*math.sin(angle+.45)*(1-smooth((z-hem)/.18))
        z+=lift
    else:
        shoulder=smooth((z-1.06)/.36)
        waist_envelope=math.exp(-((z-1.115)/.078)**2)
        displacement=waist_envelope*.005*math.sin(angle*7+.7)
        for index,center in enumerate([-2.7,-2.22,-1.9,-1.1,-.70,-.31,.45,1.30,2.16]):
            target=center+.21*math.sin(center)*(1-shoulder)
            distance=wrap(angle-target)
            displacement+=(.004+index%3*.0015)*math.exp(-distance*distance/.015)*(.35+.65*math.sin(shoulder*math.pi))
    return Vector(((rx+displacement)*math.cos(angle),(ry+displacement*.8)*math.sin(angle),z))

def front(identity,x,z,clearance=.006):
    rx,_=interpolate(profile(identity),z)
    angle=-math.acos(max(-.985,min(.985,x/rx)))
    p=surface(identity,angle,z);p.x=x;p.y-=clearance
    return p

def body_shell(identity,mat):
    nodes=profile(identity);hem=nodes[0][0];vertices=[];faces=[]
    rows=91;segments=96
    for row in range(rows):
        z=hem+(1.433-hem)*row/(rows-1)
        for index in range(segments):vertices.append(tuple(surface(identity,index*TAU/segments,z)))
    for row in range(rows-1):
        for index in range(segments):
            nxt=(index+1)%segments
            faces.append((row*segments+index,row*segments+nxt,(row+1)*segments+nxt,(row+1)*segments+index))
    cloth_mesh('Continuous gathered chiton',vertices,faces,mat)

def edge_binding(identity,mat,neck=False):
    segments=144;vertices=[];faces=[]
    z0=1.430 if neck else profile(identity)[0][0]+.006
    width=.003 if neck else .005
    for row in range(3):
        for index in range(segments):
            point=surface(identity,index*TAU/segments,z0+row*width/2)
            radial=Vector((point.x,point.y,0)).normalized();point+=radial*.0015
            vertices.append(tuple(point))
    for row in range(2):
        for index in range(segments):faces.append((row*segments+index,row*segments+(index+1)%segments,(row+1)*segments+(index+1)%segments,(row+1)*segments+index))
    cloth_mesh('Turned neckline' if neck else 'Fine turned hem',vertices,faces,mat,.0013)

def sleeve(identity,side,mat):
    suffix='L' if side<0 else 'R';rows=25;segments=48;verts=[];faces=[]
    start=Vector((side*.199,0,1.351));end=Vector((side*.351,-.012,1.188))
    axis=(end-start).normalized();u=axis.cross(Vector((0,1,0))).normalized();v=axis.cross(u)
    for row in range(rows):
        t=row/(rows-1);center=start.lerp(end,t)
        radius=(.084*(1-t)+.074*t)*(.63+.37*smooth(t/.37))
        for index in range(segments):
            angle=index*TAU/segments
            fold=.005*math.sin(angle*5+t*6)*math.sin(t*math.pi)+.003*math.sin(angle*8+.7)*smooth(t)
            p=center+(radius+fold)*(math.cos(angle)*u+math.sin(angle)*v)
            p.z-=.014*math.sin(angle)**2*smooth(t)
            verts.append(tuple(p))
    for row in range(rows-1):
        for index in range(segments):faces.append((row*segments+index,row*segments+(index+1)%segments,(row+1)*segments+(index+1)%segments,(row+1)*segments+index))
    obj=cloth_mesh('Soft shoulder sleeve '+suffix,verts,faces,mat,.0017,False)
    spine=obj.vertex_groups.new(name='Spine');arm=obj.vertex_groups.new(name='UpperArm.'+suffix)
    # Weight by distance along the sleeve, not by world height, including its inner layer.
    for vertex in obj.data.vertices:
        t=max(0,min(1,(vertex.co-start).dot(axis)/(end-start).length));weight=.45+.55*smooth(t/.52)
        spine.add([vertex.index],1-weight,'REPLACE');arm.add([vertex.index],weight,'REPLACE')

def girdle(identity,mat):
    vertices=[];faces=[];segments=128
    for row in range(3):
        for i in range(segments):
            angle=i*TAU/segments;z=1.044+(row-1)*.004+.003*math.cos(angle+.5)
            p=Vector((.189*math.cos(angle),.113*math.sin(angle),z));vertices.append(tuple(p))
    for row in range(2):
        for i in range(segments):faces.append((row*segments+i,row*segments+(i+1)%segments,(row+1)*segments+(i+1)%segments,(row+1)*segments+i))
    cloth_mesh('Narrow woven girdle',vertices,faces,mat,.002)
    # Two soft, thin ends; a small tuck replaces the previous oversized knot/tube.
    for side in [-1,1]:
        points=[];quads=[];rows=23
        for row in range(rows):
            t=row/(rows-1);x=-.084+side*(.004+.016*t)+.006*math.sin(t*4);z=1.043-.118*t
            center=front(identity,x,z,.009);center.y-=.003*math.sin(t*math.pi)
            for edge in [-1,1]:points.append(tuple(center+Vector((edge*.004,0,edge*.0015*math.sin(t*4)))))
        for row in range(rows-1):quads.append((row*2,row*2+1,(row+1)*2+1,(row+1)*2))
        cloth_mesh('Flat girdle end',points,quads,mat,.001)

def mantle(identity,mat):
    columns=81;rows=47;vertices=[];faces=[]
    for row in range(rows):
        v=row/(rows-1)
        for column in range(columns):
            u=column/(columns-1);angle=-3.75+3.95*u
            top=1.416-.238*smooth((u-.20)/.80)
            bottom=.915+.18*u-.045*math.sin(u*math.pi)
            z=top*(1-v)+bottom*v
            p=surface(identity,angle,z)
            support=math.exp(-((u-.18)/.15)**2)*(1-v)**3
            p.x-=.021*support;p.y-=.018*support
            outward=.012
            for center,strength,width in [(.16,.012,.044),(.43,.018,.057),(.76,.014,.062)]:
                distance=v-center-.105*math.sin(u*math.pi*1.15+center)
                outward+=strength*math.exp(-distance*distance/(width*width))*math.sin(u*math.pi)**.5
            normal=Vector((math.cos(angle)*.6,math.sin(angle),0)).normalized()
            p+=normal*outward;p.z-=.008*math.sin(u*math.pi)*math.sin(v*math.pi)
            vertices.append(tuple(p))
    for row in range(rows-1):
        for column in range(columns-1):faces.append((row*columns+column,(row+1)*columns+column,(row+1)*columns+column+1,row*columns+column+1))
    cloth_mesh('Rectangular mantle with falling diagonal folds',vertices,faces,mat,.0019)

def leather_details(identity,mat):
    vertices=[];faces=[];rows=65
    for row in range(rows):
        t=row/(rows-1);x=-.205+.36*t;z=1.397-.379*t
        for side in [-1,1]:
            p=front(identity,x+side*.007,z+side*.006,.011);vertices.append(tuple(p))
    for row in range(rows-1):faces.append((row*2,row*2+1,(row+1)*2+1,(row+1)*2))
    cloth_mesh('Flat leather shoulder strap',vertices,faces,mat,.0018)
    # Small soft purse, compressed against the hip rather than a rigid satchel box.
    center=front(identity,.154,.955,.012);points=[];quads=[];segments=40
    for layer in [0,1]:
        for i in range(segments):
            angle=i*TAU/segments;x=math.copysign(abs(math.cos(angle))**.6,math.cos(angle))*.047
            z=math.copysign(abs(math.sin(angle))**.7,math.sin(angle))*.056
            points.append(tuple(center+Vector((x,-.012*layer,z))))
    for i in range(segments):quads.append((i,(i+1)%segments,(i+1)%segments+segments,i+segments))
    points.extend([tuple(center),tuple(center+Vector((0,-.021,0)))])
    for i in range(segments):quads.extend([(segments*2,(i+1)%segments,i),(segments*2+1,i+segments,(i+1)%segments+segments)])
    cloth_mesh('Soft flat leather purse',points,quads,mat,0)
    flap=[];faces=[]
    for row in range(12):
        t=row/11
        for i in range(17):
            u=i/16*2-1;flap.append(tuple(center+Vector((u*.046,-.024-.003*math.sin(t*math.pi),.055-t*.058+.006*u*u*t))))
    for row in range(11):
        for i in range(16):faces.append((row*17+i,row*17+i+1,(row+1)*17+i+1,(row+1)*17+i))
    cloth_mesh('Thin folded leather flap',flap,faces,mat,.0014)

def clothes(identity,c):
    linen=material('CW_Linen_'+identity,c['cloth'])
    binding=material('CW_Linen_Binding_'+identity,tuple(v*.76 for v in c['trim'][:3]),.95)
    body_shell(identity,linen);edge_binding(identity,linen,True);edge_binding(identity,binding)
    # Visible skin under an open fabric neckline; the actual head/rig is unchanged.
    a.BONE='Neck';skin=[];faces=[];segments=64
    for row in range(9):
        t=row/8
        for index in range(segments):
            angle=index*TAU/segments
            inner=Vector((.048*math.cos(angle),.043*math.sin(angle),1.460))
            outer=surface(identity,angle,1.428);outer.x*=1.05;outer.y*=1.05;outer.z=1.419
            skin.append(tuple(inner.lerp(outer,t)))
    for row in range(8):
        for index in range(segments):faces.append((row*segments+index,(row+1)*segments+index,(row+1)*segments+(index+1)%segments,row*segments+(index+1)%segments))
    a.mesh('Neckline skin beneath fabric edge',skin,faces,c['skin'])
    for side in [-1,1]:sleeve(identity,side,linen)
    girdle(identity,binding)
    if identity=='ione':
        mantle(identity,material('CW_Wool_Mantle_ione',(.63,.57,.45),.93))
        a.BONE='Spine';clasp=a.ellipsoid('Small shoulder fastening',(-.203,-.047,1.405),(.013,.005,.014),'gold',20,12,'metal')
        bronze=material('CW_Bronze_Fastening',(.35,.23,.095),.5);bronze.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.65
        clasp.data.materials.clear();clasp.data.materials.append(bronze)
    if identity=='dorian':leather_details(identity,material('CW_Leather_dorian',(.16,.085,.045),.72))
