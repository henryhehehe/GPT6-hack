"""Build the original 28-model Alexandria pack. See alexandria_geometry.py for shared primitives."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from alexandria_geometry import *

start('merchant-ship','Rigged merchant ship','harbor','Curved planked hull, striped billowing sail, stays, sheets, steering oar, deck cargo.')
ship()
start('fishing-skiff','Fishing skiff','harbor','Open straked hull, thwarts, paired oars and woven catch basket.')
ship(True)

start('market-canopy','Linen market canopy','market','Joinery, tied posts, scalloped striped cloth, slatted counter and shelf.')
for x in [-2.25,2.25]:
    for y in [-1.14,1.14]:
        rod('Canopy upright',(x,y,0),(x,y,3.5),.075,'woodlight')
        for z in [3.16,3.22,3.28]:ring('Rope post lashing',(x,y,z),.078,.019,'rope',16)
for y in [-1.15,1.15]:rod('Canopy beam',(-2.4,y,3.3),(2.4,y,3.3),.085,'wood')
for i in range(12):
    x=-2.6+i*5.2/12; w=5.2/12
    verts=[(x+dx,-1.45+j*2.9/16,3.48-.22*math.sin(j*math.pi/16)+.08*math.sin((x+dx)*.6)) for j in range(17) for dx in [0,w]]
    mesh('Draped striped awning',verts,[(j*2,j*2+1,j*2+3,j*2+2) for j in range(16)],'teal' if i%3==0 else 'linen',True)
    mesh('Scalloped canopy valance',[(x,-1.45,3.48),(x+w,-1.45,3.48),(x+w,-1.45,3.19),(x+w*.75,-1.45,3.13),(x+w*.25,-1.45,3.13),(x,-1.45,3.19)],[(0,1,2,3,4,5)],'teal' if i%3==0 else 'linen')
for x in [-2,2]:
    for y in [-.85,.85]:box('Counter leg',(x,y,.47),(.13,.13,.94),'wood')
for i in range(12):box('Counter top plank',(-2.2+i*.4,0,.94),(.383,2.05,.10),'woodlight')
for i in range(17):box('Counter front slat',(-2.16+i*.27,-1,.44),(.23,.08,.77),'wood')
box('Under counter shelf',(0,0,.26),(4.55,1.9,.07),'woodlight')
anchor('DisplayAnchor',(0,0,1))

start('amphora','Painted transport amphora','market','Hollow mouth, handles, foot and painted shoulder ornaments.');pot()
start('hydria','Three-handled water jar','market','Hollow hydria with lifting handle, turned foot and slip bands.');pot(kind='hydria')
start('krater','Wide mixing bowl','market','Hollow krater with flared rim, loop handles and repeated ornament.');pot(kind='krater')
start('pottery-display','Pottery merchant display','market','Three vessel forms with a small stand and bowls.')
pot((-1.35,.15,0),.72);pot((-.3,.17,0),.64,'hydria');pot((.75,.13,0),.7,'krater')
for x in [-1,.1,1.4]:lathe('Shallow serving dish',[(0,.01),(.18,.02),(.28,.10),(.29,.14),(.25,.14),(.16,.055),(0,.05)],(x,-.65,0),'ochre')
start('produce-display','Market produce display','market','Woven baskets of pomegranates and golden fruit.')
for x in [-1.45,-.45,.65,1.55]:basket((x,0,0),.85,True)
start('textile-display','Folded linen and dyed cloth','market','Layered folded bolts with visible hems and tassels.')
for i in range(4):
    x=-1.4+i*.92
    for j in range(3):
        box('Folded textile',(x,.05,j*.085+.045),(.79,1.12,.075),['linen','teal','indigo','clay'][i],.035)
        for yy in [-.46,.53]:tube('Stitched hem',[(x-.35,yy,j*.085+.085),(x+.35,yy,j*.085+.085)],.009,'ochre',5)
    for k in range(10):rod('Fringe tassel',(x-.33+k*.073,-.51,.24),(x-.33+k*.073,-.68,.20),.012,'linen',5)

start('cargo-crate','Braced cargo crate','harbor','Individual planks, diagonal braces, battens and metal nail heads.');crate()
start('rope-coil','Coiled mooring rope','harbor','Continuous five-turn rope coil with projecting end.')
tube('Mooring coil',[((.10+i*.00125)*math.cos(i*.10),(.10+i*.00125)*math.sin(i*.10),.035+.006*math.sin(i*.16)) for i in range(310)],.029,'rope',8)
tube('Loose rope end',[(.42,-.13,.04),(.58,-.10,.034),(.68,.10,.03),(.55,.28,.03)],.029,'rope')
start('grain-sack','Tied grain sack','harbor','Soft bulging sack, gathered neck, tied cord and stitched seam.')
lathe('Bulging linen sack',[(0,0),(.25,.015),(.37,.13),(.39,.4),(.32,.69),(.13,.83),(.12,.92),(.18,1.02),(.1,1.04),(.06,.93)],mat='linen',n=40)
ring('Gathered neck tie',(0,0,.89),.132,.025,'rope')
for i in range(17):rod('Sack side stitch',(-.035,-.36,.14+i*.031),(.035,-.36,.16+i*.031),.008,'wood',5)
start('woven-basket','Woven reed basket','market','Open basket with horizontal weft, vertical warp and bound rim.');basket()

start('scroll-rack','Scholarly scroll cabinet','library','Freestanding joinery, twelve cubbies and individually tied papyrus rolls.')
for x in [-.9,.9]:box('Cabinet side',(x,0,1.22),(.13,.65,2.44),'wood')
box('Cabinet back',(0,.28,1.22),(1.83,.09,2.44),'wood')
for z in [.09,.65,1.21,1.77,2.4]:box('Cabinet shelf',(0,-.02,z),(1.95,.8,.09),'woodlight')
for x in [-.32,.32]:box('Cubbie divider',(x,0,1.22),(.055,.60,2.3),'woodlight')
for row in range(4):
    for col in range(3):
        for k in range(3):scroll((-.63+col*.63,-.19,row*.56+.23+k*.12),.82)
anchor('ScrollAnchor',(0,-.44,1.4))
start('writing-desk','Scribe writing desk','library','Pegged trestle desk, rolled papyrus, wax tablet, reed pens and ink cup.')
for x in [-.77,.77]:
    for y in [-.37,.37]:rod('Trestle leg',(x,y,0),(x*.87,y*.7,1.01),.065,'wood',8)
    box('Trestle foot',(x,0,.1),(.15,1.02,.12),'woodlight')
rod('Desk stretcher',(-.77,0,.37),(.77,0,.37),.07,'wood')
for i in range(7):box('Desk plank',(0,-.51+i*.17,1.02),(2.05,.16,.12),'woodlight')
box('Papyrus sheet',(-.35,-.02,1.089),(.83,.67,.014),'linen',0)
scroll((-.35,.3,1.13),1.45)
box('Wax tablet frame',(.59,-.13,1.12),(.49,.62,.05),'wood');box('Recessed wax',(.59,-.13,1.15),(.40,.53,.018),'slip',.005)
for i in range(3):rod('Cut reed pen',(.02+i*.09,-.37,1.105),(.21+i*.09,.13,1.105),.011,'ochre',6)
lathe('Ink cup',[(0,0),(.085,.015),(.095,.12),(.08,.16),(.05,.16),(.055,.08),(0,.065)],(.68,.3,1.09),'slip',24)
anchor('DocumentAnchor',(-.35,0,1.12))
start('wooden-stool','Turned wooden stool','library','Dished seat and turned splayed legs joined by stretchers.')
lathe('Stool seat',[(0,.59),(.33,.59),(.36,.64),(.35,.70),(.27,.70),(0,.665)],mat='woodlight')
for a in [0,math.tau/3,2*math.tau/3]:
    rod('Splayed stool leg',(.29*math.cos(a),.29*math.sin(a),.02),(.22*math.cos(a),.22*math.sin(a),.61),.046,'wood')
ring('Circular stretcher',(0,0,.22),.265,.025,'woodlight')
start('oil-lamp','Bronze oil lamp','library','Turned reservoir, fill opening, elongated spout, wick and loop handle.')
lathe('Lamp body',[(0,0),(.14,.025),(.23,.07),(.24,.13),(.18,.20),(.07,.22),(.052,.19),(.055,.12)],mat='bronze')
sphere('Lamp spout',(0,-.24,.12),(.12,.23,.07),'bronze',24)
rod('Charred wick',(0,-.42,.15),(0,-.46,.21),.025,'slip')
tube('Lamp ring handle',[(0,.18,.14),(0,.31,.18),(0,.33,.31),(0,.21,.32),(0,.17,.22)],.027,'bronze')
start('balance-scale','Merchant balance scale','market','Bronze beam, hanging pans, chains and calibrated weight shapes.')
box('Scale foot',(0,0,.075),(.56,.38,.15),'marble')
rod('Scale pillar',(0,0,.15),(0,0,1.13),.05,'bronze')
rod('Balance beam',(-.56,0,1.05),(.56,0,1.05),.026,'bronze')
for side in [-1,1]:
    x=side*.48
    lathe('Weighing pan',[(0,.34),(.15,.37),(.22,.43),(.23,.46),(.20,.46),(.13,.4),(0,.38)],(x,0,0),'bronze',32)
    for a in [0,math.tau/3,2*math.tau/3]:rod('Suspension chain',(x,0,1.04),(x+.21*math.cos(a),.21*math.sin(a),.45),.009,'bronze',5)
    lathe('Scale weight',[(0,0),(.06,0),(.045,.08),(.025,.11),(0,.11)],(x,0,.4),'patina',16)

start('bronze-brazier','Tripod bronze brazier','library','Hollow riveted fire bowl, riveted band and three curved feet.')
lathe('Brazier bowl',[(0,.83),(.13,.83),(.28,.91),(.42,1.08),(.44,1.18),(.39,1.18),(.37,1.08),(.23,.96),(.12,.92),(0,.92)],mat='bronze')
ring('Brazier lip',(0,0,1.18),.425,.03,'patina')
for i in range(3):
    a=i*math.tau/3
    tube('Curved tripod foot',[(r*math.cos(a),r*math.sin(a),z) for r,z in [(.42,.02),(.30,.05),(.24,.38),(.29,.92)]],.04,'bronze')
for i in range(16):
    a=i*math.tau/16;sphere('Rim rivet',(.435*math.cos(a),.435*math.sin(a),1.1),(.024,.024,.024),'ochre',8)

start('courtyard-fountain','Carved courtyard fountain','library','Stepped octagonal base, fluted pedestal, hollow stone basins and water surface.')
lathe('Fountain foundation',[(0,0),(1.35,0),(1.35,.16),(1.21,.16),(1.21,.32),(0,.32)],mat='limestone',n=8)
lathe('Lower carved basin',[(.35,.3),(.92,.38),(1.08,.63),(1.08,.81),(.96,.81),(.93,.62),(.76,.48),(.31,.43)],mat='marble',n=64)
lathe('Still basin water',[(0,.59),(.9,.59)],mat='water',n=64)
lathe('Pedestal',[(.26,.3),(.3,.42),(.2,.5),(.16,1.14),(.25,1.22),(.26,1.3)],mat='limestone')
lathe('Upper fountain dish',[(.1,1.22),(.4,1.3),(.58,1.48),(.58,1.6),(.51,1.6),(.47,1.46),(.1,1.37)],mat='marble')
for i in range(24):
    a=i*math.tau/24;rod('Carved radial basin rib',(.77*math.cos(a),.77*math.sin(a),.38),(1.06*math.cos(a),1.06*math.sin(a),.70),.025,'limestone',6)

start('marble-bench','Scroll-ended stone bench','library','Beveled seat with carved supports and volute ends.')
box('Polished bench seat',(0,0,.65),(2.35,.68,.18),'marble',.055)
for side in [-1,1]:
    box('Bench plinth',(side*.83,0,.06),(.51,.68,.12),'limestone')
    box('Carved bench support',(side*.83,0,.34),(.28,.46,.49),'marble',.04)
    for yy in [-.27,.27]:
        tube('Support volute',[(side*.83+.10*math.cos(i*.17),yy,.48+.10*math.sin(i*.17)) for i in range(40)],.025,'limestone')

start('date-palm','Feather-leaf date palm','setting','Ringed tapering trunk, arching fronds with individual leaflets and date clusters.')
lathe('Palm trunk',[(.25,0),(.27,.17),(.19,2),(.17,4.7),(.27,5.0)],mat='wood',n=20)
for i in range(35):ring('Old leaf scar',(0,0,.13+i*.136),.25-i*.0019,.032,'woodlight',20)
for i in range(13):
    a=i*math.tau/13; length=2.1+(i%3)*.3
    points=[]
    for j in range(13):
        t=j/12;points.append((math.cos(a)*length*t,math.sin(a)*length*t,4.94+1.18*math.sin(t*math.pi*.85)-.62*t))
    tube('Arched frond rib',points,.022,'leaflight',5)
    for j in range(1,12):
        t=j/12;center=Vector(points[j]);along=Vector((math.cos(a),math.sin(a),-.12));across=Vector((-math.sin(a),math.cos(a),0))
        for side in [-1,1]:
            tip=center+across*side*(.47*math.sin(math.pi*t)**.6)+along*.27+Vector((0,0,-.14))
            mesh('Individual folded palm leaflet',[center-along*.05,center+Vector((0,0,.035)),tip,center+along*.055],[(0,1,2),(1,3,2)],'green' if j%3 else 'leaflight')
for i in range(24):
    a=i*2.4;sphere('Date cluster',(.32*math.cos(a),.32*math.sin(a),4.6-(i%4)*.08),(.07,.07,.1),'ochre',8)

start('cypress-tree','Layered cypress tree','setting','Dense layered branch clusters and visible bark trunk.')
rod('Cypress trunk',(0,0,0),(0,0,4.6),.10,'wood',12)
for j in range(13):
    h=.65+j*.29;r=.63*(1-j/16)
    for i in range(7):
        a=i*math.tau/7+j*.72
        sphere('Cypress foliage',(.52*r*math.cos(a),.52*r*math.sin(a),h),(r*.55,r*.55,.6),'green' if (j+i)%4 else 'leaflight',8)

def building(w,d,h,tiled=False):
    box('Plaster building',(0,0,h/2),(w,d,h),'limestone',.06)
    for row in range(3):
        for i in range(int(w/.8)):
            box('Ashlar base course',(-w/2+(i+.5)*w/int(w/.8),-d/2-.025,.18+row*.34),(w/int(w/.8)-.022,.12,.31),'marble',.018)
    for x in [-w/2+.16,w/2-.16]:
        for j in range(int(h/.42)):box('Corner quoin',(x,-d/2-.06,.23+j*.42),(.43,.24,.36),'marble')
    box('Recessed doorway',(0,-d/2-.061,1.1),(1.45,.025,2.2),'endgrain',0)
    for x in [-.78,.78]:box('Carved door jamb',(x,-d/2-.17,1.17),(.15,.24,2.34),'marble')
    box('Stone lintel',(0,-d/2-.17,2.40),(1.85,.3,.23),'marble')
    for i in range(8):box('Timber door plank',(-.64+i*.183,-d/2-.085,1.06),(.168,.035,2.08),'wood')
    for z in [.38,1.74]:box('Door bronze strap',(0,-d/2-.12,z),(1.34,.035,.075),'bronze')
    for x in [-w*.29,w*.29]:
        for z in ([h*.65] if h<5 else [h*.43,h*.77]):
            box('Window recess',(x,-d/2-.064,z),(.9,.03,1.13),'endgrain',0)
            box('Window projecting sill',(x,-d/2-.16,z-.59),(1.12,.35,.13),'marble')
            for i in range(5):box('Shutter boards',(x-.35+i*.175,-d/2-.1,z),(.15,.035,1.04),'teal')
            for zz in [-.35,.35]:box('Shutter brace',(x,-d/2-.14,z+zz),(.84,.06,.075),'woodlight')
    box('Cornice',(0,0,h-.05),(w+.24,d+.24,.24),'marble')
    if tiled:roof(w+.32,d+.32,h+.07)
    else:
        for x in [-w/2,w/2]:box('Roof parapet',(x,0,h+.2),(.2,d,.45),'limestone')
        for y in [-d/2,d/2]:box('Roof parapet',(0,y,h+.2),(w,.2,.45),'limestone')
        box('Recessed roof terrace',(0,0,h+.02),(w-.2,d-.2,.08),'mortar')

start('harbor-warehouse','Harbor warehouse','harbor','Tiled roof, ashlar base, corner quoins, bronze-strapped plank door and shuttered windows.')
building(7.7,7.7,5,True)
start('courtyard-house','Courtyard neighborhood house','setting','Two-story plaster facade, rooftop parapets, shutters and carved doorway.')
building(7.7,9.7,7,False)
start('workshop-house','Market workshop','market','Low flat-roof workshop with shutters, masonry plinth and timber door.')
building(6.7,5.7,4,False)

start('mooring-bollard','Stone mooring bollard','harbor','Octagonal limestone base, mushroom cap and wrapped mooring rope.')
lathe('Bollard',[(0,0),(.28,0),(.28,.15),(.16,.23),(.16,.51),(.29,.55),(.30,.64),(.23,.73),(0,.75)],mat='limestone',n=12)
for z in [.33,.39,.45]:ring('Wrapped mooring line',(0,0,z),.19,.027,'rope')
start('quay-steps','Dressed quay steps','harbor','Four worn ashlar treads with fine mortar joints.')
for i in range(4):
    for j in range(4):box('Quay ashlar tread',(-.9+j*.6,.45-i*.3,.12+i*.15),(.58,1.5-i*.3,.24+i*.3),'limestone',.035)


export_pack()
