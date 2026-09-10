"""Build original market, cargo and writing assets; run with Blender --python.
Arguments after --: market | cargo | archive (default market).
"""
import sys
import math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import asset_utils as a


def amphora():
    a.lathe('Hollow fired clay body',[(.001,0),(.12,0),(.15,.04),(.14,.12),(.22,.21),(.30,.40),(.31,.56),(.26,.72),(.15,.82),(.115,.88),(.115,1.02),(.15,1.04),(.15,1.085),(.105,1.085),(.08,1.02),(.085,.88),(.12,.79),(.22,.67),(.26,.51),(.24,.32),(.14,.17),(.001,.16)],'clay_light')
    for side in [-1,1]:
        points=[(side*x,0,z) for x,z in [(.12,1),(.21,1.01),(.29,.96),(.34,.85),(.34,.72),(.30,.63),(.27,.62)]]
        a.tube('Hand pulled handle',points,.032,'clay',10)
    for z,r in [(.19,.20),(.71,.265),(.755,.222)]:
        a.ring('Painted slip band',(0,0,z),r,.012,'ink',40)
    a.ring('Neck slip band',(0,0,.945),.117,.013,'ink')
    for i in range(16):
        t=i*math.tau/16
        a.tube('Shoulder painted dash',[(r*math.cos(t),r*math.sin(t),z) for r,z in [(.228,.75),(.201,.775),(.178,.793)]],.008,'cream',5)


def jar():
    a.lathe('Open storage vessel',[(.001,0),(.21,0),(.27,.05),(.35,.20),(.375,.40),(.32,.59),(.25,.65),(.265,.68),(.265,.72),(.213,.72),(.207,.66),(.275,.59),(.33,.40),(.30,.20),(.20,.07),(.001,.07)],'clay')
    for z,r in [(.10,.3),(.58,.326),(.61,.3)]: a.ring('Incised raised band',(0,0,z),r,.012,'clay_light')
    for side in [-1,1]:
        a.tube('Lug handle',[(side*.30,-.05,.55),(side*.405,-.06,.54),(side*.425,-.06,.44),(side*.36,-.05,.38)],.032,'clay_light',10)
    a.lathe('Inset lid',[(0,.711),(.205,.711),(.221,.725),(.205,.751),(.06,.778),(.05,.80),(0,.80)],'clay_light')
    a.ellipsoid('Lid grip',(0,0,.80),(.055,.055,.043),'clay')


def bowl():
    a.lathe('Glazed bowl',[(.001,0),(.14,0),(.16,.03),(.155,.05),(.23,.10),(.32,.20),(.34,.26),(.335,.275),(.307,.268),(.298,.22),(.21,.12),(.10,.064),(.001,.064)],'teal',48,'glaze')
    a.ring('Cream rim',(0,0,.26),.324,.013,'cream',48)
    for r in [.065,.095]: a.ring('Interior rings',(0,0,.069),r,.005,'cream',32,'glaze')


def stall():
    # Four planted feet and a clear, open front. Separate slats and joinery.
    for x in [-1.1,1.1]:
        for y in [-.48,.48]:
            a.box('Square post',(x,y,1.13),(.095,.095,2.26),'wood',.018)
            a.box('Post shoe',(x,y,.055),(.13,.13,.11),'wood_light',.012)
            a.box('Peg',(x,y-.056,.85),(.038,.025,.038),'gold',.009,'metal')
        a.beam('Side stretcher',(x,-.5,.28),(x,.5,.28),.08)
    for y in [-.49,.49]: a.beam('Long apron',(-1.15,y,.80),(1.15,y,.80),.12)
    for i in range(8): a.box('Table plank',(-1.02+i*.291,0,.92),(.28,1.17,.065),'wood_light',.012)
    for x in [-1.1,1.1]: a.beam('Side brace',(x,-.45,.32),(x,.43,.78),.06)
    a.beam('Lower long brace',(-1.09,.47,.24),(1.09,.47,.78),.07)
    for y in [-.63,.63]: a.beam('Canopy edge',(-1.30,y,2.15),(1.30,y,2.15),.075)
    a.beam('Canopy ridge',(-1.32,0,2.43),(1.32,0,2.43),.07)
    # Striped, gently sagging fabric surfaces with scalloped valance.
    for stripe in range(8):
        x0=-1.35+stripe*.3375
        verts=[]
        for ix in range(3):
            for iy in range(13):
                x=x0+ix*.3375/2;y=-.72+iy*.12
                z=2.44-abs(y)*.42-.045*math.sin(ix*math.pi/2)
                verts.append((x,y,z))
        faces=[]
        for ix in range(2):
            for iy in range(12):
                n=ix*13+iy;faces.append((n,n+13,n+14,n+1))
        o=a.mesh('Woven canopy stripe',verts,faces,'linen' if stripe%2==0 else 'teal')
        mod=o.modifiers.new('Fabric thickness','SOLIDIFY');mod.thickness=.009
        a.bpy.context.view_layer.objects.active=o;a.bpy.ops.object.modifier_apply(modifier=mod.name)
        for side in [-1,1]:
            v=[(x0+i*.3375/8,side*.722,2.137) for i in range(9)]+[(x0+i*.3375/8,side*.722,2.02-.055*math.sin(i*math.pi/8)) for i in range(9)]
            a.mesh('Scalloped cloth edge',v,[(i,i+1,10+i,9+i) for i in range(8)],'linen' if stripe%2==0 else 'teal',False)
    for x in [-1.12,1.12]:
        for y in [-.48,.48]:
            for z in [2.13,2.16,2.19]: a.ring('Lashing',(x,y,z),.059,.009,'rope',12)


def crate():
    for i in range(5):
        x=-.4+i*.2
        a.box('Base plank',(x,0,.05),(.19,.88,.10),'wood_light')
        a.box('Lid plank',(x,0,.79),(.19,.88,.075),'wood_light')
    for x in [-.45,.45]:
        for y in [-.40,.40]: a.box('Corner upright',(x,y,.43),(.075,.075,.79),'wood')
    for z in [.18,.37,.56,.735]:
        for y in [-.445,.445]: a.box('Long side slat',(0,y,z),(.98,.07,.16),'wood_light')
        for x in [-.48,.48]: a.box('End slat',(x,0,z),(.06,.84,.16),'wood_light')
    for y in [-.49,.49]:
        a.beam('Diagonal brace',(-.43,y,.12),(.43,y,.77),.075)
        for x in [-.42,.42]:
            for z in [.16,.7]: a.ellipsoid('Wooden peg',(x,y,z),(.02,.011,.02),'ink',8,6)


def sack():
    a.lathe('Gathered linen sack',[(.001,0),(.24,0),(.32,.08),(.36,.24),(.34,.43),(.25,.57),(.12,.65),(.105,.70),(.15,.76),(.14,.79),(.09,.78),(.07,.69),(.001,.69)],'linen',36,flutes=.035)
    for z in [.664,.686,.708]: a.ring('Tied cord',(0,0,z),.108,.013,'rope',24)
    a.tube('Loose tie',[(.10,-.035,.70),(.19,-.045,.69),(.23,-.055,.60),(.18,-.07,.55)],.013,'rope')
    a.tube('Stitched seam',[(.012,-r*1.035-.004,z) for r,z in [(.25,.04),(.32,.10),(.36,.24),(.34,.43),(.25,.57)]],.006,'wood',5)


def basket():
    a.lathe('Basket lining',[(.001,0),(.25,0),(.28,.04),(.34,.45),(.32,.47),(.30,.44),(.25,.05),(.001,.05)],'rope',32)
    for i in range(11):
        z=.055+i*.037
        a.ring('Woven horizontal rib',(0,0,z),.281+z*.13,.011,'wood_light',32)
    for i in range(24):
        t=i*math.tau/24
        a.tube('Basket warp',[(r*math.cos(t),r*math.sin(t),z) for r,z in [(.272,.025),(.295,.16),(.313,.31),(.338,.46)]],.009,'cream',5)
    a.ring('Bound rim',(0,0,.46),.328,.025,'rope')
    a.tube('Arched carrying handle',[(.33*math.cos(t),0,.47+.38*math.sin(t)) for t in [i*math.pi/20 for i in range(21)]],.025,'wood_light',8)


def rope():
    pts=[]
    for i in range(200):
        t=i/199*math.tau*4.2;r=.13+.051*t/math.tau
        pts.append((r*math.cos(t),r*math.sin(t),.027+.008*math.sin(t*3)))
    a.tube('Four loop coil',pts,.024,'rope',8)
    a.tube('Loose rope end',[pts[-1],(.40,.23,.028),(.48,.21,.027),(.55,.23,.025)],.024,'rope',8)


def scroll(opened=False):
    if not opened:
        o=a.lathe('Papyrus roll',[(.001,0),(.073,0),(.079,.035),(.071,.55),(.076,.59),(.001,.59)],'paper',24)
        o.rotation_euler[1]=math.pi/2;o.location=(-.295,0,.079)
        for x in [-.27,.27]:
            o=a.ring('Rolled edge',(0,0,0),.054,.008,'linen',24);o.rotation_euler[1]=math.pi/2;o.location=(x,0,.079)
        o=a.ring('Binding',(0,0,0),.080,.009,'teal',24);o.rotation_euler[1]=math.pi/2;o.location=(-.035,0,.079)
    else:
        for x in [-.34,.34]:
            o=a.lathe('Rolled end',[(.001,0),(.051,0),(.051,.57),(.001,.57)],'paper',24)
            o.rotation_euler[0]=math.pi/2;o.location=(x,.285,.052)
        verts=[(-.34+i*.68/20,-.27+j*.54, .028+.025*(abs(i-10)/10)**5) for j in range(2) for i in range(21)]
        a.mesh('Blank readable-source proxy',verts,[(i,i+1,22+i,21+i) for i in range(20)],'paper')
        # No pseudo-quotation: exact text lives in the accessible source reader.


def tablet():
    a.box('Writing tablet',(0,0,.025),(.46,.60,.05),'wood_light',.02)
    a.box('Wax writing field',(0,0,.052),(.39,.52,.009),'ink',.014)
    a.beam('Stylus',(.27,-.23,.023),(.34,.23,.023),.018,'wood')
    a.ellipsoid('Wax scraper',(.34,.23,.023),(.027,.04,.015),'wood_light',12,8)


def table():
    for x in [-.65,.65]:
        for y in [-.34,.34]:
            a.box('Reading table leg',(x,y,.41),(.085,.085,.82),'wood')
            a.box('Leg collar',(x,y,.73),(.115,.115,.055),'wood_light')
    for i in range(6): a.box('Tabletop board',(-.65+i*.26,0,.86),(.249,.87,.085),'wood_light',.016)
    for y in [-.35,.35]:a.beam('Table apron',(-.70,y,.75),(.70,y,.75),.12)
    a.beam('Foot stretcher',(-.66,0,.25),(.66,0,.25),.07)


def rack():
    for x in [-.57,.57]:a.box('Shelf side',(x,0,.71),(.07,.41,1.42),'wood')
    a.box('Shelf back',(0,.19,.71),(1.20,.05,1.42),'wood')
    for z in [.07,.49,.91,1.35]:
        a.box('Shelf board',(0,0,z),(1.2,.43,.055),'wood_light')
    for i in range(12):
        x=-.42+(i%4)*.28;z=.18+(i//4)*.42
        o=a.lathe('Stored scroll',[(.001,0),(.073,0),(.073,.33),(.001,.33)],'paper' if i%3 else 'linen',16)
        o.rotation_euler[0]=math.pi/2;o.location=(x,.14,z)
        o=a.ring('Scroll end',(0,0,0),.040,.009,'rope',16);o.rotation_euler[0]=math.pi/2;o.location=(x,-.197,z)


PACKS={
    'market': [('amphora','Painted amphora',amphora,(-1.0,-1.4,0)),('storage-jar','Lidded storage jar',jar,(0,-1.4,0)),('ceramic-bowl','Glazed ceramic bowl',bowl,(.95,-1.4,0)),('market-stall','Striped market stall',stall,(0,.6,0))],
    'cargo': [('cargo-crate','Slatted cargo crate',crate,(-1.1,.3,0)),('tied-sack','Tied linen sack',sack,(.2,.3,0)),('woven-basket','Woven carrying basket',basket,(1.2,.3,0)),('rope-coil','Loose rope coil',rope,(.2,-.7,0))],
    'archive': [('rolled-scroll','Bound papyrus roll',lambda:scroll(False),(-1.1,-.9,0)),('open-scroll','Open blank scroll',lambda:scroll(True),(0,-.9,0)),('writing-tablet','Wax tablet and stylus',tablet,(1,-.9,0)),('reading-table','Wooden reading table',table,(-1,.5,0)),('scroll-rack','Scroll storage rack',rack,(1,.5,0))],
}

if __name__=='__main__':
    pack=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'market'
    a.reset(); roots=[]
    for asset_id,title,build,location in PACKS[pack]:
        r=a.root(asset_id);build()
        a.anchor('Anchor_Inspect',(0,-.25,.8 if asset_id=='market-stall' else .4))
        a.consolidate(r);a.bpy.context.view_layer.update()
        a.export_asset(r,'props',pack,title,['Anchor_Inspect'])
        roots.append((r,location))
    for r,p in roots:r.location=p
    a.studio(pack,'props',(0,0,1.05 if pack=='market' else .5),6.3 if pack=='market' else 4.8,view=(6,-10,7))
