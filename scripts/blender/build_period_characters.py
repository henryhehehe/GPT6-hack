"""Original period-informed companions; costume sources in CHARACTER-COSTUMES.md.
Blender --background --factory-startup --python scripts/blender/build_period_characters.py
Optional: -- medieval|earlymodern|georgian|regency. These are fictional readers.
"""
import sys
import math
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import asset_utils as a
from build_characters import face, limb, rig

LINEN=(.81,.76,.63,1)
LEATHER=(.065,.047,.030,1)
CAST={
 'medieval': [('tunic','short',(.22,.32,.26,1)),('gown','covered',(.38,.21,.19,1)),('cloak','beard',(.22,.25,.32,1))],
 'earlymodern': [('doublet','short',(.23,.28,.36,1)),('gown','covered',(.29,.34,.20,1)),('jerkin','beard',(.38,.26,.16,1))],
 'georgian': [('coat','short',(.16,.25,.33,1)),('gown','covered',(.35,.23,.32,1)),('waistcoat','short',(.40,.28,.18,1))],
 'regency': [('coat','short',(.13,.19,.27,1)),('gown','thaleia',(.73,.76,.65,1)),('dress','ione',(.38,.48,.57,1))],
 'romantic': [('gown','thaleia',(.31,.42,.39,1)),('coat','short',(.25,.23,.20,1)),('waistcoat','short',(.40,.26,.20,1))],
}

def shaped(name,profile,color,depth=.70,flutes=.012,bone='Spine'):
    a.BONE=bone
    o=a.lathe(name,profile,color,48,flutes=flutes);o.scale.y=depth
    return o

def curved_panel(name,high,low,color,width=.25,depth=.25):
    verts=[]
    for row in [0,1]:
        for x in [-width,-width*.65,0,width*.65,width]:
            verts.append((x,-math.sqrt(max(.04,1-(x/(width+.035))**2))*depth-.016,
                          (high if row==0 else low)+abs(x)*.30))
    a.mesh(name,verts,[(i,i+1,i+6,i+5) for i in range(4)],color)

def clothes(period,style,color):
    gown=style in ['gown','dress']
    medieval=period=='medieval'; regency=period=='regency'
    waist=1.27 if regency and gown else 1.055
    if gown:
        radius=.285 if regency else (.36 if medieval else .405)
        shaped('Gathered full-length skirt',[(radius,.105),(radius+.01,.15),(radius*.92,.45),(.25,.90),(.247 if regency else .217,waist)],color,.73,.026,'Pelvis')
        shaped('Woven hem',[(radius+.007,.12),(radius+.013,.145)],color,.73,.026,'Pelvis')
    elif medieval:
        shaped('Knee-length wool tunic',[(.29,.53),(.285,.62),(.225,1.10)],color,.72,.015,'Pelvis')
    else:
        shaped('Breeches or trouser seat',[(.218,.79),(.235,.92),(.217,1.10)],color,.73,.009,'Pelvis')
    shaped('Upper garment',[(.207,1.035),(.22,1.12),(.24,1.26),(.278,1.36),(.26,1.40),(.088,1.448)],color,.69)
    if medieval:
        shaped('Leather girdle',[(.241,1.04),(.238,1.08)],LEATHER,.74,0,'Pelvis')
        shaped('Bound round neck',[(.106,1.435),(.082,1.454)],LINEN,.84,0)
        if style=='cloak':
            # Back-and-side wool mantle leaves both gesturing arms clear.
            verts=[]
            for z,r in [(1.42,.29),(1.28,.32),(.80,.36),(.48,.38)]:
                for i in range(25):
                    t=-.14+i*(math.pi+.28)/24
                    verts.append((r*math.cos(t),r*.73*math.sin(t)+.025,z))
            a.mesh('Wool mantle',verts,[(k*25+i,k*25+i+1,(k+1)*25+i+1,(k+1)*25+i) for k in range(3) for i in range(24)],(.32,.24,.17,1))
            a.ellipsoid('Plain cloak clasp',(.24,-.036,1.40),(.025,.014,.025),'gold',12,8,'metal')
    elif gown:
        if regency:
            shaped('Raised under-bust waist ribbon',[(.258,1.263),(.26,1.290)],(.37,.39,.27,1),.75,0)
            curved_panel('Modest gathered neckline',1.375,1.335,LINEN,.19,.24)
        else:
            curved_panel('Linen neckerchief' if period=='georgian' else 'Linen partlet',1.35,1.18,LINEN)
            shaped('Natural waist seam',[(.223,1.053),(.225,1.070)],color,.72,0)
    else:
        curved_panel('Waistcoat front' if period in ['georgian','regency'] else 'Buttoned doublet front',1.36,1.04, (.56,.48,.33,1),.115,.24)
        if style=='coat':
            # Open curved fronts and separate tails, rather than a skirt around both legs.
            verts=[]
            for z,r,start in [(1.09,.231,-1.16),(.91,.258,-.66),(.68,.278,-.12),(.56,.282,.10)]:
                for i in range(33):
                    t=start+i*(math.pi-2*start)/32
                    verts.append((r*math.cos(t),r*.73*math.sin(t),z))
            a.BONE='Pelvis'
            a.mesh('Cutaway coat skirts and tails',verts,[(k*33+i,k*33+i+1,(k+1)*33+i+1,(k+1)*33+i) for k in range(3) for i in range(32)],color)
            a.BONE='Spine'
            for side in [-1,1]:
                a.mesh('Coat lapel',[(side*.07,-.262,1.42),(side*.22,-.255,1.36),(side*.105,-.265,1.19),(side*.05,-.26,1.30)],[(0,1,2,3)],color)
        shaped('Standing collar',[(.09,1.427),(.091,1.484)],color if regency else LINEN,.90,0)
        for z in [1.09,1.17,1.25,1.33]:a.ellipsoid('Small front button',(0,-.274,z),(.011,.007,.011),'gold',10,8,'metal')
        if period in ['georgian','regency']:
            a.box('Folded linen neckcloth',(0,-.119,1.444),(.145,.051,.041),LINEN,.012)
    return gown

def character(period,style,identity,color,index):
    c={'cloth':color,'skin':[(.46,.25,.145,1),(.57,.335,.21,1),(.64,.415,.30,1)][index],
       'hair':[(.075,.05,.038,1),(.07,.039,.025,1),(.115,.083,.061,1)][index],'trim':LINEN}
    gown=clothes(period,style,color)
    limb('Neck',(0,0,1.38),(0,0,1.56),.071,.064,c['skin'],'Neck')
    for side,suffix in [(-1,'L'),(1,'R')]:
        x=side*.125
        stocking=LINEN if period in ['georgian','earlymodern'] else (.23,.21,.18,1)
        limb('Hose',(x,0,.90),(x,0,.13),.064,.048,stocking,'Shin.'+suffix)
        if not gown and period!='medieval':
            trousers=period in ['regency','romantic']
            end=.14 if trousers else .51
            limb('Long trousers' if trousers else 'Knee breeches',(x,0,.94),(x,0,end),.096,.059,color,'Shin.'+suffix)
            if not trousers:limb('Breeches knee band',(x,0,.54),(x,0,.50),.066,.065,color,'Shin.'+suffix)
        a.BONE='Foot.'+suffix
        a.ellipsoid('Closed leather shoe',(x,-.054,.073),(.075,.14,.061),LEATHER,20,12)
        a.box('Leather sole',(x,-.054,.021),(.15,.26,.030),LEATHER,.012)
        if period=='georgian' and not gown:a.box('Shoe buckle',(x,-.127,.117),(.051,.017,.027),'gold',.003,'metal')
        shoulder=(side*.25,0,1.36);elbow=(side*.37,-.012,1.13);wrist=(side*.43,-.04,.93)
        sleeve=LINEN if style in ['jerkin','waistcoat'] else color
        limb('Long upper sleeve',shoulder,elbow,.128 if period=='romantic' and gown else .093,.068,sleeve,'UpperArm.'+suffix)
        limb('Long lower sleeve',elbow,wrist,.070,.047,sleeve,'Forearm.'+suffix)
        if not period=='medieval':limb('Linen wrist cuff',(side*.424,-.037,.95),(side*.434,-.042,.91),.050,.048,LINEN,'Forearm.'+suffix)
        a.BONE='Hand.'+suffix
        a.ellipsoid('Palm',(side*.439,-.045,.885),(.045,.029,.063),c['skin'],16,10)
        for i in range(4):a.ellipsoid('Finger',(side*(.414+i*.017),-.045,.835+abs(i-1.5)*.01),(.010,.019,.035),c['skin'],10,8)
        a.ellipsoid('Thumb',(side*.393,-.059,.893),(.018,.022,.031),c['skin'],12,8)
    before=set(a.ROOT.children_recursive)
    face('dorian' if identity=='beard' else identity,c)
    if identity in ['short','covered']:
        for obj in set(a.ROOT.children_recursive)-before:
            if any(word in obj.name for word in ['Gathered hair bun','Twisted bun strand','Hair ribbon']):a.bpy.data.objects.remove(obj,do_unlink=True)
    if identity=='covered':
        # Plain linen head covering, no invented clan, rank or biographical insignia.
        a.BONE='Head'
        verts=[]
        for z,rx,ry in [(1.91,.03,.04),(1.87,.13,.12),(1.73,.174,.162),(1.51,.185,.17)]:
            for i in range(25):
                t=-.17+i*(math.pi+.34)/24
                verts.append((rx*math.cos(t),ry*math.sin(t)+.01,z))
        a.mesh('Plain linen head covering',verts,[(k*25+i,k*25+i+1,(k+1)*25+i+1,(k+1)*25+i) for k in range(3) for i in range(24)],LINEN)
    a.BONE=None

if __name__=='__main__':
    selected=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else list(CAST)
    for period in selected:
        a.reset();models=[];pack=period+'-readers'
        for index,(style,identity,color) in enumerate(CAST[period]):
            asset_id=period+'-'+style;root=a.root(asset_id)
            character(period,style,identity,color,index)
            a.anchor('Anchor_Talk',(0,-.45,1.52));a.anchor('Anchor_Label',(0,0,2.10))
            a.consolidate(root);rig(root);a.bpy.context.view_layer.update()
            a.export_asset(root,'characters',pack,period.title()+'-informed reader: '+style,['Anchor_Talk','Anchor_Label'],['Idle','Greeting','Talk'])
            models.append(root)
        for i,root in enumerate(models):root.location.x=(i-1)*1.4
        a.studio(pack,'characters',(0,0,1),4.9,1400,900,view=(1.0,-12,3.4))
