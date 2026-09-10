"""Original clothed reading companions, derived from the project's authored face/rig kit.
Run with Blender --background --factory-startup --python this_file.py.
These are illustrative fictional readers, not reconstructed historical people.
"""
import sys
import math
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import asset_utils as a
from build_characters import face, limb, rig

READERS = [
    ('reader-coat', 'dorian', {'title':'Reader in a tailored coat', 'cloth':(.09,.15,.20,1), 'skin':(.46,.25,.145,1), 'hair':(.075,.05,.038,1), 'trim':(.55,.43,.29,1)}),
    ('reader-dress', 'thaleia', {'title':'Reader in a dress and shoulder shawl', 'cloth':(.10,.27,.24,1), 'skin':(.57,.335,.21,1), 'hair':(.07,.039,.025,1), 'trim':(.67,.56,.42,1)}),
    ('reader-waistcoat', 'ione', {'title':'Reader in a waistcoat and long sleeves', 'cloth':(.34,.16,.17,1), 'skin':(.64,.415,.30,1), 'hair':(.115,.083,.061,1), 'trim':(.76,.67,.51,1)}),
]

def reader(asset_id, identity, c):
    dress=asset_id=='reader-dress'
    a.BONE='Pelvis'
    if not dress:
        hips=a.lathe('Trouser waist and seat',[(.21,.79),(.235,.9),(.222,1.04),(.213,1.08)],c['cloth'],40);hips.scale.y=.72
    if dress:
        skirt=a.lathe('Long gathered skirt',[(.30,.11),(.33,.16),(.30,.43),(.265,.70),(.215,1.05),(.20,1.10)],c['cloth'],48,flutes=.028)
        skirt.scale.y=.72
        edge=a.lathe('Stitched hem',[(.314,.125),(.331,.16),(.326,.18)],c['trim'],48,flutes=.028);edge.scale.y=.72
    elif asset_id=='reader-coat':
        coat=a.lathe('Lower coat panels',[(.265,.68),(.275,.73),(.25,.9),(.215,1.1)],c['cloth'],40,flutes=.01);coat.scale.y=.71
    a.BONE='Spine'
    torso=a.lathe('Fitted upper garment',[(.205,1.025),(.218,1.1),(.235,1.23),(.283,1.36),(.265,1.40),(.09,1.448)],c['cloth'],40,flutes=.009);torso.scale.y=.67
    # A shirt inset, lapels and buttons make the clothing read at conversational distance.
    a.mesh('Linen shirt inset',[(-.09,-.225,1.40),(.09,-.225,1.40),(.058,-.21,1.15),(-.058,-.21,1.15)],[(0,1,2,3)],'linen')
    if not dress:
        for side in [-1,1]:
            a.mesh('Tailored lapel',[(side*.085,-.245,1.41),(side*.23,-.245,1.36),(side*.075,-.235,1.20),(side*.035,-.24,1.31)],[(0,1,2,3)],c['trim'])
        for z in [1.11,1.19,1.27]:a.ellipsoid('Garment button',(.03,-.24,z),(.013,.010,.013),'gold',10,8,'metal')
        a.mesh('Collar left',[(-.09,-.08,1.445),(-.02,-.14,1.45),(-.06,-.165,1.37),(-.12,-.12,1.41)],[(0,1,2,3)],'linen')
        a.mesh('Collar right',[(.09,-.08,1.445),(.02,-.14,1.45),(.06,-.165,1.37),(.12,-.12,1.41)],[(0,1,2,3)],'linen')
    else:
        verts=[]
        for row in [0,1]:
            for x in [-.27,-.18,0,.18,.27]:
                y=-math.sqrt(max(0,1-(x/.30)**2))*.23-.018
                z=(1.30+abs(x)*.4) if row==0 else (1.07+abs(x)*.35)
                verts.append((x,y,z))
        a.mesh('Draped shoulder shawl',verts,[(i,i+1,i+6,i+5) for i in range(4)],c['trim'])
        a.ellipsoid('Shawl pin',(-.2,-.195,1.38),(.022,.01,.022),'gold',12,8,'metal')
    limb('Neck',(0,0,1.38),(0,0,1.56),.071,.064,c['skin'],'Neck')
    for side,suffix in [(-1,'L'),(1,'R')]:
        x=side*.125
        limb('Trouser leg',(x,0,.92),(x,0,.13),.085,.057,c['cloth'],'Shin.'+suffix)
        a.BONE='Foot.'+suffix
        a.ellipsoid('Closed leather shoe',(x,-.054,.08),(.078,.15,.066),(.035,.029,.025,1),20,12)
        a.box('Shoe sole',(x,-.054,.021),(.16,.28,.032),'ink',.014)
        shoulder=(side*.25,0,1.36);elbow=(side*.37,-.012,1.13);wrist=(side*.43,-.04,.93)
        sleeve=c['trim'] if asset_id=='reader-waistcoat' else c['cloth']
        limb('Upper sleeve',shoulder,elbow,.098,.073,sleeve,'UpperArm.'+suffix)
        limb('Forearm sleeve',elbow,wrist,.074,.048,sleeve,'Forearm.'+suffix)
        limb('Linen cuff',(side*.424,-.037,.95),(side*.434,-.042,.91),.050,.048,'linen','Forearm.'+suffix)
        a.BONE='Hand.'+suffix
        a.ellipsoid('Palm',(side*.439,-.045,.885),(.045,.029,.063),c['skin'],16,10)
        for i in range(4):
            a.ellipsoid('Finger',(side*(.414+i*.017),-.045,.835+abs(i-1.5)*.01),(.010,.019,.035),c['skin'],10,8)
        a.ellipsoid('Thumb',(side*.393,-.059,.893),(.018,.022,.031),c['skin'],12,8)
    face(identity,c)
    a.BONE=None

if __name__=='__main__':
    a.reset();models=[]
    for asset_id,identity,c in READERS:
        root=a.root(asset_id);reader(asset_id,identity,c)
        a.anchor('Anchor_Talk',(0,-.45,1.52));a.anchor('Anchor_Label',(0,0,2.10))
        a.consolidate(root);rig(root);a.bpy.context.view_layer.update()
        a.export_asset(root,'characters','reader-cast',c['title'],['Anchor_Talk','Anchor_Label'],['Idle','Greeting','Talk'])
        models.append(root)
    for i,root in enumerate(models):root.location.x=(i-1)*1.4
    a.studio('reader-cast','characters',(0,0,1),4.9,1400,900,view=(1.5,-12,3.8))
