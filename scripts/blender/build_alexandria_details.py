"""Twenty original street/workshop props; scene context, not archaeological evidence."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from alexandria_geometry import *

def wheel(x,y,z,r=.48):
    # Wheels stand in the Y/Z plane with separate rims, spokes, hub and axle pin.
    for xx in [x-.055,x+.055]:
        tube('Felloe rim',[(xx,y+r*math.cos(i*math.tau/40),z+r*math.sin(i*math.tau/40)) for i in range(41)],.045,'woodlight',6)
    tube('Metal wheel tire',[(x,y+(r+.028)*math.cos(i*math.tau/40),z+(r+.028)*math.sin(i*math.tau/40)) for i in range(41)],.026,'bronze',6)
    rod('Turned hub',(x-.11,y,z),(x+.11,y,z),.13,'woodlight',16)
    rod('Axle pin',(x-.15,y,z),(x+.15,y,z),.038,'bronze')
    for j in range(10):
        a=j*math.tau/10
        rod('Wheel spoke',(x,y+.1*math.cos(a),z+.1*math.sin(a)),(x,y+.45*math.cos(a),z+.45*math.sin(a)),.032,'wood',6)

start('cargo-handcart','Spoked cargo handcart','harbor','Separate planks, ten-spoke wheels, tire bands, pegged side rails and long handles.')
for x in [-.78,.78]:wheel(x,.28,.52)
rod('Cart axle',(-.94,.28,.52),(.94,.28,.52),.06,'wood')
for i in range(8):box('Cart floor plank',(-.56+i*.16,.22,.66),(.15,1.72,.09),'woodlight',.012)
for x in [-.66,.66]:
    for y in [-.65,1.04]:box('Corner stake',(x,y,1.05),(.10,.10,.92),'wood')
    for z in [.81,1.02,1.25]:box('Side rail',(x,.2,z),(.09,1.83,.14),'woodlight',.012)
    rod('Long cart handle',(x,1,.62),(x*.8,-2,.68),.055,'woodlight',8)
    rod('Resting cart foot',(x,-.5,.65),(x,-.68,.04),.047,'wood')
for z in [.85,1.1]:box('Tail gate',(0,1.06,z),(1.35,.085,.16),'woodlight')
anchor('LoadAnchor',(0,.25,.73))

start('fishing-net-rack','Hanging fishing net','harbor','Sagging diamond-mesh net on braced posts, with top floats and bottom weights.')
for x in [-1.12,1.12]:
    rod('Net drying post',(x,0,0),(x,0,2.24),.065,'woodlight')
    rod('Rack foot',(x,-.42,.04),(x,.42,.04),.06,'wood')
    rod('Rack brace',(x,-.4,.05),(x,0,.72),.037,'wood')
rod('Drying rail',(-1.3,0,2.1),(1.3,0,2.1),.07,'wood')
def netpoint(i,j):
    x=-1+i*.125;z=.33+j*.15-.18*(1-(x*x));return (x,-.035-.065*math.sin(j*.7+i*.2),z)
for j in range(11):
    for i in range(16):
        if (i+j)%2==0:
            for offset in [-1,1]:
                k=i+offset
                if 0<=k<=16:rod('Knotted net diamond',netpoint(i,j),netpoint(k,j+1),.007,'rope',4)
for i in range(9):
    x=-1+i*.25;sphere('Cork net float',(x,0,2),(.045,.035,.068),'woodlight',8)
    sphere('Net sinker',(x,-.02,.25),(.03,.025,.043),'limestone',8)

start('stone-anchor','Stone-weight anchor','harbor','Pierced triangular stone weight and attached lifting line.')
# Three stone bars form a true opening for the line.
for side in [-1,1]:
    rod('Tapered stone arm',(side*.48,0,.12),(side*.10,0,.83),.14,'limestone',6)
box('Anchor weight base',(0,0,.12),(1.13,.36,.24),'limestone',.06)
tube('Anchor lifting loop',[(0,-.05,.69),(-.15,-.04,.87),(-.08,.02,1.07),(.1,.05,1.07),(.17,.04,.88),(0,-.05,.69)],.027,'rope',6)

start('harbor-capstan','Wooden winding capstan','harbor','Bound timber drum, spindle, radial handspikes, foot frame and wrapped rope.')
box('Capstan footing',(0,0,.10),(1.1,1.1,.20),'wood',.035)
lathe('Capstan drum',[(.20,.2),(.30,.25),(.32,.37),(.22,.45),(.22,.91),(.32,1),(.32,1.1),(.1,1.16)],mat='woodlight',n=24)
for h in [.37,.94,1.07]:ring('Drum binding',(0,0,h),.325,.024,'bronze',24,6)
for h in [.53,.58,.63,.68,.73,.78]:ring('Rope turns',(0,0,h),.247,.023,'rope',24,5)
for a in [0,math.pi/2]:rod('Capstan handspike',(-.85*math.cos(a),-.85*math.sin(a),1.04),(.85*math.cos(a),.85*math.sin(a),1.04),.047,'wood')

start('fish-tray','Fishmonger display tray','market','Slatted tray with individually modeled fish, tails, fins and eyes.')
for j in range(6):box('Fish tray slat',(-.49+j*.196,0,.04),(.185,.83,.08),'woodlight',.008)
for x in [-.62,.62]:box('Tray edge',(x,0,.12),(.07,.91,.18),'wood')
for y in [-.46,.46]:box('Tray end',(0,y,.12),(1.3,.07,.18),'wood')
for i in range(4):
    x=-.42+i*.28
    sphere('Fish body',(x,-.02,.17),(.10,.29,.077),'patina',12)
    mesh('Tail fin',[(x,-.23,.18),(x-.12,-.41,.16),(x,-.37,.17),(x+.12,-.41,.16)],[(0,1,2),(0,2,3)],'teal')
    mesh('Dorsal fin',[(x,-.1,.20),(x,.09,.20),(x,-.04,.29)],[(0,1,2)],'teal')
    for side in [-1,1]:sphere('Fish eye',(x+side*.061,.18,.21),(.016,.016,.013),'slip',8)

start('scroll-case','Sealed cylindrical scroll case','library','Timber tube with separate fitted lid, bronze bands, shoulder strap and wax seal.')
lathe('Case body',[(0,0),(.18,0),(.19,.05),(.19,1.03),(.21,1.04),(.21,1.12),(.18,1.15),(0,1.15)],mat='wood',n=32)
for z in [.10,.94,1.08]:ring('Case bronze band',(0,0,z),.195,.015,'bronze',32,5)
tube('Leather carrying strap',[(.18,0,.14),(.38,0,.25),(.44,0,.58),(.35,0,.88),(.19,0,.99)],.035,'clay',6)
tube('Seal string',[(0,-.2,1.1),(0,-.215,.89),(.07,-.215,.86)],.008,'rope',4)
sphere('Plain wax seal',(.07,-.23,.83),(.058,.018,.06),'fruit',12)
anchor('InspectAnchor',(0,0,.7))

start('open-papyrus','Open papyrus roll','library','Thin curved sheet with curled ends, reed roller and blank reading surface.')
verts=[]
for i in range(33):
    t=i/32;y=-.58+1.16*t;zz=.03+.17*math.exp(-t*24)+.13*math.exp(-(1-t)*24)
    for x in [-.45,.45]:verts.append((x,y,zz+.003*math.cos(t*25)))
mesh('Curled papyrus sheet',verts,[(2*i,2*i+1,2*i+3,2*i+2) for i in range(32)],'linen',True)
for y in [-.6,.6]:rod('Rolled papyrus end',(-.46,y,.14),(.46,y,.14),.055,'linen',20)
rod('Reed roller',(-.51,.6,.14),(.51,.6,.14),.018,'woodlight')
anchor('DocumentAnchor',(0,0,.06))

start('wax-diptych','Hinged wax diptych','library','Recessed wax panels, carved wooden frames, cord hinges and bronze stylus.')
for side in [-1,1]:
    x=side*.22
    box('Tablet back',(x,0,.025),(.41,.61,.05),'woodlight',.012)
    box('Wax inset',(x,0,.055),(.33,.51,.018),'slip',.01)
    for xx in [-.19,.19]:box('Raised tablet edge',(x+xx,0,.062),(.027,.61,.028),'wood')
for y in [-.20,.20]:tube('Tablet cord hinge',[(-.025,y,.07),(0,y-.03,.09),(.025,y,.07)],.012,'rope',5)
rod('Bronze stylus',(.05,-.31,.09),(.32,.27,.09),.008,'bronze',6)
anchor('DocumentAnchor',(0,0,.09))

start('seven-string-lyre','Seven-string lyre','library','Carved hollow soundbox, curved arms, tuning pegs, bridge and seven strings.')
lathe('Soundbox bowl',[(0,0),(.32,.04),(.37,.14),(.32,.28),(.19,.37),(0,.4)],mat='woodlight',n=32)
for side in [-1,1]:
    tube('Curved lyre arm',[(side*.25,.04,.2),(side*.39,.03,.53),(side*.43,.02,1.1),(side*.34,0,1.27)],.055,'wood',8)
rod('Lyre crossbar',(-.42,0,1.17),(.42,0,1.17),.04,'woodlight')
box('Lyre bridge',(0,-.18,.23),(.43,.055,.075),'wood')
for i in range(7):
    x=-.24+i*.08
    rod('Tuning peg',(x,-.04,1.14),(x,.05,1.25),.014,'bronze',6)
    rod('Lyre string',(x*.78,-.20,.27),(x,-.03,1.18),.004,'linen',4)

start('armillary-model','Ringed astronomy model','library','Nested engraved bronze rings on a turned stand; illustrative instrument.')
lathe('Instrument base',[(0,0),(.29,0),(.29,.09),(.23,.13),(.10,.17),(.08,.48),(.14,.53)],mat='bronze',n=32)
for axis,r,mat in [('xy',.44,'bronze'),('xz',.48,'patina'),('yz',.51,'bronze')]:
    points=[]
    for i in range(65):
        a=i*math.tau/64;c=r*math.cos(a);s=r*math.sin(a)
        points.append((c,s,.97) if axis=='xy' else (c,0,.97+s) if axis=='xz' else (0,c,.97+s))
    tube('Nested astronomy ring',points,.025,mat,6)
sphere('Central globe',(0,0,.97),(.09,.09,.09),'ochre',16)
rod('Inclined polar axis',(0,-.31,.60),(0,.31,1.34),.019,'bronze',8)
for i in range(24):
    a=i*math.tau/24
    rod('Ring graduation',(.42*math.cos(a),.42*math.sin(a),.991),(.46*math.cos(a),.46*math.sin(a),.991),.006,'linen',4)

start('courtyard-sundial','Stone sundial','library','Octagonal pedestal with bronze gnomon and incised radial hour marks.')
lathe('Sundial pedestal',[(0,0),(.37,0),(.37,.14),(.24,.19),(.2,.7),(.32,.77),(.43,.80),(.43,.9),(0,.9)],mat='marble',n=8)
for i in range(13):
    a=(i/12)*math.pi
    rod('Radial dial mark',(.09*math.cos(a),.09*math.sin(a),.906),(.37*math.cos(a),.37*math.sin(a),.906),.006,'mortar',4)
mesh('Triangular bronze gnomon',[(0,0,.91),(0,.25,.91),(0,0,1.14)],[(0,1,2)],'bronze')

start('courtyard-well','Stone well with windlass','setting','Hollow ashlar well, timber uprights, winding axle, rope and hanging bucket.')
for row in range(3):
    for i in range(16):
        a=i*math.tau/16+(row%2)*math.pi/16
        # Annular masonry blocks retain an actual open shaft.
        verts=[]
        for z in [row*.23,row*.23+.215]:
            for r in [.62,.81]:
                for theta in [a+.014,a+math.tau/16-.014]:verts.append((r*math.cos(theta),r*math.sin(theta),z))
        mesh('Well ashlar block',verts,[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)],'limestone' if i%3 else 'marble')
lathe('Rounded coping',[(.61,.69),(.85,.69),(.85,.79),(.61,.79),(.61,.69)],mat='marble',n=48)
for x in [-.94,.94]:box('Well upright',(x,0,1.05),(.14,.17,2.1),'woodlight')
rod('Windlass axle',(-1.1,0,1.69),(1.1,0,1.69),.075,'wood',16)
for i in range(9):tube('Windlass rope turn',[(-.14+i*.035,.098*math.cos(j*math.tau/20),1.69+.098*math.sin(j*math.tau/20)) for j in range(21)],.014,'rope',5)
rod('Bucket line',(0,-.10,1.69),(0,-.1,.72),.018,'rope')
lathe('Wood bucket',[(0,.30),(.20,.30),(.23,.65),(.19,.65),(.16,.36),(0,.36)],(0,-.1,0),'woodlight',n=16)
tube('Bucket handle',[(-.21,-.1,.60),(-.16,-.1,.78),(0,-.1,.83),(.16,-.1,.78),(.21,-.1,.60)],.017,'bronze',6)
rod('Windlass crank',(1.1,0,1.69),(1.1,0,1.40),.035,'wood')
rod('Crank grip',(1.1,0,1.4),(1.29,0,1.4),.04,'woodlight')

start('rotary-quern','Hand grain mill','market','Two stone grinding discs, central grain opening and offset wooden handle.')
lathe('Lower quern stone',[(0,0),(.43,0),(.44,.11),(.38,.15),(0,.15)],mat='limestone',n=40)
lathe('Upper grinding stone',[(.10,.16),(.37,.16),(.39,.24),(.24,.39),(.11,.40),(.085,.34),(.10,.16)],mat='marble',n=40)
rod('Mill wooden handle',(.27,0,.25),(.27,0,.65),.031,'woodlight',10)
for i in range(16):
    a=i*math.tau/16
    rod('Stone dressing groove',(.27*math.cos(a),.27*math.sin(a),.352),(.35*math.cos(a+.07),.35*math.sin(a+.07),.27),.004,'mortar',4)

start('bread-board','Baker bread board','market','Round scored loaves and braided bread on a slatted serving board.')
for i in range(6):box('Bread board slat',(-.5+i*.2,0,.035),(.19,.8,.07),'woodlight',.007)
for x,y in [(-.27,.10),(.25,.10),(-.25,-.24),(.27,-.24)]:
    sphere('Baked round loaf',(x,y,.13),(.20,.16,.10),'ochre',16)
    for d in [-.065,0,.065]:rod('Scored bread crust',(x-.08,y+d,.215),(x+.09,y+d+.025,.215),.007,'linen',4)

start('pouring-jug','Handled pouring jug','market','Hollow ceramic jug, narrow pouring lip, curved handle and slip bands.')
lathe('Jug body',[(0,0),(.15,.015),(.21,.10),(.26,.30),(.21,.48),(.12,.59),(.13,.72),(.11,.75),(.085,.71),(.083,.60),(.17,.46),(.21,.28),(.12,.09),(0,.08)],mat='clay',n=40)
tube('Jug handle',[(.13,0,.68),(.34,0,.65),(.38,0,.44),(.23,0,.35)],.036,'clay',8)
for z,r in [(.14,.229),(.47,.216)]:ring('Jug painted band',(0,0,z),r,.012,'slip',32,5)
mesh('Pouring lip',[(-.08,-.09,.72),(.08,-.09,.72),(0,-.22,.74)],[(0,1,2)],'clay')

start('weighted-loom','Warp-weighted loom','market','Braced timber frame, individually strung warp, dyed weaving and hanging clay weights.')
for x in [-.8,.8]:
    rod('Loom upright',(x,.15,0),(x,-.12,2.15),.06,'wood')
    rod('Loom supporting leg',(x,.65,0),(x,-.03,1.50),.045,'woodlight')
for z in [.85,1.9,2.13]:rod('Loom crossbeam',(-.95,-.12,z),(.95,-.12,z),.053,'woodlight')
for i in range(25):
    x=-.69+i*.0575
    rod('Individual warp',(x,-.15,.43),(x,-.15,2.03),.006,'linen',4)
    if i%2==0:lathe('Clay loom weight',[(0,0),(.045,0),(.057,.065),(.025,.14),(0,.14)],(x,-.15,.28),'clay',n=10)
for j in range(12):
    z=1.08+j*.07
    box('Woven cloth stripe',(0,-.17,z),(1.36,.024,.071),'teal' if j%4<2 else 'linen',0)
rod('Weaving shuttle',(-.43,-.23,1.25),(.42,-.23,1.38),.023,'woodlight',8)

start('reed-screen','Woven reed screen','setting','Framed privacy panel of individual reeds, bound cross weave and splayed feet.')
for x in [-.65,.65]:
    rod('Screen frame',(x,0,.07),(x,0,1.7),.042,'woodlight')
    rod('Screen foot',(x,-.32,.04),(x,.32,.04),.05,'wood')
for z in [.12,1.63]:rod('Screen rail',(-.7,0,z),(.7,0,z),.04,'wood')
for i in range(29):
    x=-.59+i*.042;rod('Vertical reed',(x,0,.15),(x,0,1.59),.014,'rope',5)
for j in range(9):rod('Horizontal bound reed',(-.62,-.022,.22+j*.15),(.62,-.022,.22+j*.15),.012,'linen',5)

start('stone-planter','Carved stone planter','setting','Fluted hollow planter with layered rim and a cluster of broad leaves.')
lathe('Planter',[(0,0),(.30,0),(.3,.12),(.25,.18),(.39,.62),(.44,.66),(.44,.75),(.36,.75),(.32,.58),(.21,.23),(0,.23)],mat='limestone',n=40)
lathe('Planter soil',[(0,.60),(.34,.60)],mat='endgrain',n=32)
for i in range(12):
    a=i*math.tau/12
    tube('Carved planter flute',[(r*math.cos(a),r*math.sin(a),z) for r,z in [(.26,.2),(.29,.34),(.33,.49),(.38,.61)]],.018,'marble',5)
for i in range(13):
    a=i*2.4;r=.35+(i%3)*.07
    mesh('Broad folded leaf',[(0,0,.61),(r*.3*math.cos(a+.4),r*.3*math.sin(a+.4),.92),(r*math.cos(a),r*math.sin(a),1.05+(i%3)*.1),(r*.3*math.cos(a-.4),r*.3*math.sin(a-.4),.92)],[(0,1,2),(0,2,3)],'green' if i%3 else 'leaflight')

start('craft-tool-rack','Craftsman tool rack','market','Pegboard with mallet, bow drill, chisel and wooden measuring square.')
for x in [-.56,.56]:box('Tool rack leg',(x,.05,.68),(.075,.09,1.36),'wood')
for i in range(5):box('Tool rack back slat',(0,.07,.59+i*.15),(1.3,.065,.14),'woodlight')
for x in [-.39,-.13,.15,.40]:rod('Tool peg',(x,.02,1.17),(x,-.13,1.17),.018,'wood',6)
rod('Mallet handle',(-.4,-.12,.7),(-.4,-.12,1.2),.025,'woodlight')
box('Mallet head',(-.4,-.12,1.13),(.26,.14,.13),'wood')
rod('Chisel handle',(-.13,-.12,1.15),(-.13,-.12,.94),.027,'woodlight')
rod('Bronze chisel',(-.13,-.12,.94),(-.13,-.12,.66),.016,'bronze',4)
rod('Drill spindle',(.16,-.13,.65),(.16,-.13,1.18),.017,'wood')
tube('Bow drill frame',[(.02,-.17,.80),(.17,-.17,.90),(.32,-.17,.80)],.015,'woodlight',6)
rod('Bow string',(.02,-.17,.8),(.32,-.17,.8),.006,'rope',4)
box('Square long arm',(.46,-.12,.93),(.035,.04,.5),'woodlight',.005)
box('Square short arm',(.35,-.12,.7),(.25,.04,.035),'woodlight',.005)

start('mosaic-pavement','Geometric mosaic pavement','setting','Individual inset tesserae in a meander border and central diamond pattern.')
box('Mosaic stone bed',(0,0,.018),(2.84,2.84,.036),'mortar',0)
n=22
for i in range(n):
    for j in range(n):
        edge=min(i,j,n-1-i,n-1-j)
        dark=(edge==1 and (i+j)%4<3) or (edge==3) or (edge>4 and abs(i-10.5)+abs(j-10.5)<5.5)
        mat='teal' if dark else 'ochre' if edge==0 else 'marble'
        box('Inset mosaic tessera',(-1.35+i*.1286,-1.35+j*.1286,.043),(.120,.120,.03),mat,0)

export_pack('alexandria-details','alexandria-details-contact-sheet','scripts/blender/build_alexandria_details.py')
