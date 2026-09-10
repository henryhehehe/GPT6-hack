"""Three original stylized teaching characters, shared rig and gesture clips.
Blender --background --factory-startup --python scripts/blender/build_characters.py
"""
import sys
import math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import asset_utils as a
from mathutils import Vector

CAST = {
    'thaleia': {'title':'Thaleia · market trader','cloth':(.075,.32,.285,1),'skin':(.57,.335,.21,1),'hair':(.07,.039,.025,1),'trim':(.77,.57,.27,1)},
    'dorian': {'title':'Dorian · harbor merchant','cloth':(.63,.365,.135,1),'skin':(.46,.25,.145,1),'hair':(.075,.05,.038,1),'trim':(.22,.12,.06,1)},
    'ione': {'title':'Ione · archivist','cloth':(.46,.22,.205,1),'skin':(.64,.415,.30,1),'hair':(.115,.083,.061,1),'trim':(.80,.70,.50,1)},
}


def limb(name, p, q, r0, r1, color, bone):
    a.BONE=bone
    p,q=Vector(p),Vector(q)
    axis=(q-p).normalized()
    u=axis.cross(Vector((0,1,0))).normalized();v=axis.cross(u)
    verts=[]
    for t,r in [(0,r0*.85),(.12,r0),(.82,r1),(1,r1*.75)]:
        center=p.lerp(q,t)
        for i in range(16):
            angle=i*math.tau/16
            verts.append(tuple(center+r*(math.cos(angle)*u+math.sin(angle)*v)))
    faces=[]
    for k in range(3):
        for i in range(16): faces.append((k*16+i,k*16+(i+1)%16,(k+1)*16+(i+1)%16,(k+1)*16+i))
    faces.extend([tuple(reversed(range(16))),tuple(48+i for i in range(16))])
    return a.mesh(name,verts,faces,color)


def hair_cap(color, identity):
    verts,faces=[],[]
    # Scalp surface follows the head; front hairline is higher than the back.
    for k in range(9):
        for i in range(32):
            angle=i*math.tau/32
            front=max(0,-math.sin(angle))
            phi=(k/8)*(.56*math.pi-.17*front*math.pi)
            verts.append((.162*math.sin(phi)*math.cos(angle),.145*math.sin(phi)*math.sin(angle)+.01,1.685+.213*math.cos(phi)))
    for k in range(8):
        for i in range(32): faces.append((k*32+i,k*32+(i+1)%32,(k+1)*32+(i+1)%32,(k+1)*32+i))
    a.mesh('Sculpted hair cap',verts,faces,color)
    for i in range(7):
        theta=-math.pi*.95+i*.32
        pts=[]
        for j in range(10):
            phi=.10+j*.105
            angle=theta+(.85 if identity=='ione' else .48)*math.sin(phi)
            pts.append((.165*math.sin(phi)*math.cos(angle),.149*math.sin(phi)*math.sin(angle)+.01,1.685+.216*math.cos(phi)))
        a.tube('Swept hair lock',pts,.007,color,6)


def face(identity,c):
    a.BONE='Head'
    # Deliberately illustrative faces, not historical portraits.
    verts,faces=[],[]
    for z,rx,ry,yc in [(1.485,.045,.06,-.01),(1.515,.095,.09,-.015),(1.57,.132,.119,0),(1.66,.151,.136,0),(1.75,.147,.130,.01),(1.83,.107,.096,.016),(1.87,.035,.036,.02)]:
        for i in range(24):
            t=i*math.tau/24;verts.append((rx*math.cos(t),yc+ry*math.sin(t),z))
    for k in range(6):
        for i in range(24):faces.append((k*24+i,k*24+(i+1)%24,(k+1)*24+(i+1)%24,(k+1)*24+i))
    faces += [tuple(reversed(range(24))),tuple(144+i for i in range(24))]
    a.mesh('Face and shaped jaw',verts,faces,c['skin'])
    for side in [-1,1]:
        a.ellipsoid('Ear',(side*.148,.001,1.655),(.030,.037,.055),c['skin'],16,10)
        a.ellipsoid('Ear inner',(side*.168,-.019,1.655),(.009,.013,.027),tuple(x*.78 for x in c['skin'][:3])+(1,),12,8)
        a.ellipsoid('Eye',(side*.06,-.124,1.694),(.034,.019,.022),'paper',16,10,'glaze')
        a.ellipsoid('Iris',(side*.06,-.141,1.693),(.012,.005,.015),'ink',12,8,'glaze')
        a.ellipsoid('Eye highlight',(side*.057,-.146,1.699),(.003,.002,.004),'paper',8,6,'glaze')
        a.tube('Upper eyelid',[(side*.026,-.133,1.696),(side*.046,-.143,1.713),(side*.070,-.139,1.713),(side*.089,-.125,1.697)],.0045,c['skin'],6)
        a.tube('Eyebrow',[(side*.025,-.126,1.741),(side*.049,-.134,1.749),(side*.076,-.129,1.745),(side*.093,-.113,1.735)],.009,c['hair'],6)
    a.ellipsoid('Nose bridge',(0,-.135,1.66),(.023,.028,.063),c['skin'],16,10)
    a.ellipsoid('Nose tip',(0,-.162,1.631),(.035,.033,.023),c['skin'],16,10)
    lip=tuple(x*.76 for x in c['skin'][:3])+(1,)
    a.tube('Mouth', [(-.043,-.113,1.576),(-.022,-.125,1.570),(0,-.128,1.570),(.025,-.124,1.573),(.043,-.111,1.579)],.006,lip,6)
    hair_cap(c['hair'],identity)
    if identity=='dorian':
        verts=[]
        for k,(rx,ry,z) in enumerate([(.055,.076,1.475),(.10,.104,1.51),(.127,.120,1.55),(.14,.122,1.565)]):
            for j in range(17):
                t=-math.pi+j*math.pi/16
                verts.append((rx*math.cos(t),ry*math.sin(t)-.007,z+(abs(math.cos(t))*.075 if k==3 else 0)))
        a.mesh('Sculpted short beard',verts,[(k*17+j,k*17+j+1,(k+1)*17+j+1,(k+1)*17+j) for k in range(3) for j in range(16)],c['hair'])
        for side in [-1,1]:a.ellipsoid('Moustache',(side*.024,-.135,1.605),(.028,.011,.012),c['hair'],12,8)
    else:
        bun_z=1.755 if identity=='thaleia' else 1.69
        a.ellipsoid('Gathered hair bun',(0,.146,bun_z),(.095,.075,.095),c['hair'],20,12)
        for i in range(5):
            angle=i*math.tau/5
            a.ellipsoid('Twisted bun strand',(.045*math.cos(angle),.19,bun_z+.055*math.sin(angle)),(.040,.036,.035),c['hair'],12,8)
        a.tube('Hair ribbon',[(-.14,-.038,1.80),(-.10,.02,1.865),(0,.025,1.902),(.10,.02,1.865),(.14,-.038,1.80)],.010,c['trim'],6)
        if identity=='thaleia':
            for side in [-1,1]:
                for i in range(4):
                    a.ellipsoid('Temple braid',(side*(.128+i*.008),.016,1.79-i*.041),(.024,.035,.030),c['hair'],12,8)
            for side in [-1,1]:
                o=a.ring('Small bronze earring',(0,0,0),.018,.005,'gold',16,'metal')
                o.rotation_euler[0]=math.pi/2;o.location=(side*.163,-.015,1.60)


def clothes(identity,c):
    a.BONE='Pelvis'
    hem=.38 if identity=='dorian' else .18
    o=a.lathe('Pleated lower garment',[(.29,hem),(.31,hem+.045),(.285,.48),(.255,.73),(.215,.99),(.205,1.07),(.18,1.09)],c['cloth'],48,flutes=.045)
    o.scale.y=.71
    o=a.lathe('Hem border',[(.296,hem+.014),(.311,hem+.050),(.304,hem+.070)],c['trim'],48,flutes=.044);o.scale.y=.71
    a.BONE='Spine'
    o=a.lathe('Draped tunic',[(.205,1.04),(.218,1.09),(.235,1.19),(.285,1.33),(.29,1.38),(.215,1.42),(.09,1.448)],c['cloth'],40,flutes=.025);o.scale.y=.64
    o=a.lathe('Finished neckline',[(.108,1.438),(.094,1.453),(.066,1.454)],c['trim'],32);o.scale.y=.8
    a.BONE='Pelvis'
    o=a.lathe('Woven waist sash',[(.237,1.005),(.233,1.055),(.243,1.10)],c['trim'],40);o.scale.y=.70
    a.ellipsoid('Sash knot',(-.115,-.15,1.058),(.054,.025,.046),c['trim'],12,8)
    a.tube('Sash tail',[(-.115,-.15,1.05),(-.13,-.177,.94),(-.10,-.20,.82)],.025,c['trim'],8)
    a.BONE='Spine'
    if identity=='ione':
        # A shawl with a distinct asymmetric drape, kept outside the torso.
        verts=[(-.28,-.02,1.39),(-.24,-.12,1.405),(-.12,-.18,1.35),(.13,-.18,1.24),(.27,-.06,1.33),
               (-.28,.0,1.10),(-.235,-.15,1.10),(-.12,-.176,1.09),(.13,-.163,1.10),(.245,-.065,1.12)]
        a.mesh('Cream shoulder shawl',verts,[(i,i+1,i+6,i+5) for i in range(4)],c['trim'])
        a.tube('Shawl hem',[(-.28,0,1.10),(-.235,-.15,1.10),(-.12,-.18,1.09),(.13,-.17,1.10),(.245,-.065,1.12)],.009,'gold',6)
        a.ellipsoid('Shawl clasp',(-.23,-.125,1.39),(.024,.012,.024),'gold',12,8,'metal')
    elif identity=='dorian':
        a.tube('Cross-body leather strap',[(-.235,-.075,1.42),(-.14,-.166,1.31),(0,-.18,1.20),(.18,-.165,1.03)],.025,'wood',6)
        a.BONE='Pelvis'
        a.box('Merchant pouch',(.20,-.16,.96),(.19,.115,.20),'wood',.04)
        a.box('Pouch flap',(.20,-.222,1.01),(.18,.018,.095),'wood_light',.025)
        a.ellipsoid('Pouch button',(.20,-.236,.98),(.015,.008,.015),'gold',10,8,'metal')
    else:
        a.ellipsoid('Shoulder pin',(-.245,-.087,1.40),(.025,.012,.025),'gold',12,8,'metal')


def body(identity,c):
    clothes(identity,c)
    a.BONE='Neck'
    limb('Neck',(0,0,1.38),(0,0,1.56),.071,.064,c['skin'],'Neck')
    for side,suffix in [(-1,'L'),(1,'R')]:
        x=side*.125
        limb('Leg',(x,0,.86),(x,0,.13),.067,.048,c['skin'],'Shin.'+suffix)
        a.BONE='Foot.'+suffix
        a.ellipsoid('Foot',(x,-.058,.093),(.070,.13,.064),c['skin'],16,10)
        a.ellipsoid('Leather sandal sole',(x,-.052,.030),(.080,.145,.030),'wood',16,8)
        a.tube('Sandal toe strap',[(x-.063,-.11,.070),(x,-.14,.139),(x+.063,-.11,.070)],.015,'wood_light',6)
        a.tube('Sandal ankle strap',[(x-.05,.035,.105),(x,-.03,.16),(x+.05,.035,.105)],.013,'wood_light',6)
        shoulder=(side*.25,0,1.36);elbow=(side*.37,-.012,1.13);wrist=(side*.43,-.04,.93)
        limb('Short sleeve',shoulder,(side*.34,-.006,1.21),.096,.086,c['cloth'],'UpperArm.'+suffix)
        limb('Upper arm',(side*.32,0,1.23),elbow,.060,.053,c['skin'],'UpperArm.'+suffix)
        limb('Forearm',elbow,wrist,.054,.039,c['skin'],'Forearm.'+suffix)
        a.BONE='Forearm.'+suffix
        a.ellipsoid('Elbow',elbow,(.052,.050,.052),c['skin'],12,8)
        a.BONE='Hand.'+suffix
        a.ellipsoid('Palm',(side*.439,-.045,.885),(.045,.029,.063),c['skin'],16,10)
        for i in range(4):
            px=side*(.414+i*.017)
            a.ellipsoid('Finger',(px,-.045,.835+(abs(i-1.5))*.01),(.010,.019,.035),c['skin'],10,8)
        a.ellipsoid('Thumb',(side*.393,-.059,.893),(.018,.022,.031),c['skin'],12,8)
    face(identity,c)
    if identity=='ione':
        a.BONE='Hand.L'
        o=a.lathe('Archivist scroll',[(.001,0),(.035,0),(.035,.30),(.001,.30)],'paper',20)
        o.rotation_euler[0]=math.pi/2;o.location=(-.44,.085,.91)
        o=a.ring('Scroll tie',(0,0,0),.037,.006,'teal',16);o.rotation_euler[0]=math.pi/2;o.location=(-.44,-.06,.91)
    elif identity=='thaleia':
        a.BONE='Pelvis'
        a.box('Small folded market cloth',(.23,-.04,.95),(.10,.075,.17),'linen',.018)
    a.BONE=None


def rig(r):
    bpy=a.bpy
    data=bpy.data.armatures.new(r.name+' shared humanoid skeleton')
    arm=bpy.data.objects.new(r.name+'__Rig',data);bpy.context.collection.objects.link(arm);arm.parent=r
    bpy.ops.object.select_all(action='DESELECT');arm.select_set(True);bpy.context.view_layer.objects.active=arm
    bpy.ops.object.mode_set(mode='EDIT')
    specs=[('Root',(0,0,0),(0,0,.15),None),('Pelvis',(0,0,.88),(0,0,1.08),'Root'),('Spine',(0,0,1.08),(0,0,1.39),'Pelvis'),('Neck',(0,0,1.39),(0,0,1.53),'Spine'),('Head',(0,0,1.53),(0,0,1.86),'Neck')]
    for side,s in [(-1,'L'),(1,'R')]:
        specs += [('UpperArm.'+s,(side*.25,0,1.36),(side*.37,-.012,1.13),'Spine'),('Forearm.'+s,(side*.37,-.012,1.13),(side*.43,-.04,.93),'UpperArm.'+s),('Hand.'+s,(side*.43,-.04,.93),(side*.44,-.045,.84),'Forearm.'+s),('Thigh.'+s,(side*.125,0,.88),(side*.125,0,.49),'Pelvis'),('Shin.'+s,(side*.125,0,.49),(side*.125,0,.13),'Thigh.'+s),('Foot.'+s,(side*.125,0,.13),(side*.125,-.13,.05),'Shin.'+s)]
    for name,head,tail,parent in specs:
        b=data.edit_bones.new(name);b.head=head;b.tail=tail
        if parent:b.parent=data.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    for o in list(r.children):
        if o.type=='MESH':
            mod=o.modifiers.new('Shared teaching-character rig','ARMATURE');mod.object=arm
            o.parent=arm
    scene=bpy.context.scene;scene.render.fps=24
    arm.animation_data_create()
    for clip,duration in [('Idle',96),('Greeting',48),('Talk',72)]:
        action=bpy.data.actions.new(r.name+'__'+clip)
        arm.animation_data.action=action
        for frame in range(0,duration+1,6):
            t=frame/duration*math.tau
            for p in arm.pose.bones:
                p.rotation_mode='XYZ';p.rotation_euler=(0,0,0)
            arm.pose.bones['Spine'].rotation_euler[0]=math.sin(t)*.013
            arm.pose.bones['Head'].rotation_euler[1]=math.sin(t)*.035
            if clip=='Greeting':
                wave=math.sin(frame/duration*math.pi)**2
                arm.pose.bones['UpperArm.R'].rotation_euler[0]=wave*.28
                arm.pose.bones['UpperArm.R'].rotation_euler[2]=wave*-.25
                arm.pose.bones['Forearm.R'].rotation_euler[0]=wave*1.15
                arm.pose.bones['Hand.R'].rotation_euler[2]=wave*math.sin(t*2)*.20
                arm.pose.bones['Head'].rotation_euler[0]=wave*.075
            if clip=='Talk':
                arm.pose.bones['Forearm.R'].rotation_euler[0]=(.5-.5*math.cos(t))*.32
                arm.pose.bones['Head'].rotation_euler[0]=math.sin(t*2)*.025
            for p in arm.pose.bones:p.keyframe_insert(data_path='rotation_euler',frame=frame)
        track=arm.animation_data.nla_tracks.new();track.name=clip
        track.strips.new(clip,0,action)
        track.mute=True
    arm.animation_data.action=None
    for p in arm.pose.bones:p.rotation_euler=(0,0,0)
    scene.frame_set(0)
    return arm


if __name__=='__main__':
    a.reset();models=[]
    for identity,c in CAST.items():
        r=a.root(identity);body(identity,c)
        a.anchor('Anchor_Talk',(0,-.45,1.52));a.anchor('Anchor_Label',(0,0,2.10))
        a.consolidate(r);arm=rig(r);a.bpy.context.view_layer.update()
        a.export_asset(r,'characters','alexandria-cast',c['title'],['Anchor_Talk','Anchor_Label'],['Idle','Greeting','Talk'])
        models.append(r)
    for i,r in enumerate(models):r.location.x=(i-1)*1.35
    a.studio('alexandria-cast','characters',(0,0,1),4.8,1500,950,view=(2,-12,4))
