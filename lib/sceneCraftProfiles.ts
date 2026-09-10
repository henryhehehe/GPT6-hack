import catalog from './curriculum/catalog.json';
import {CHARACTER_COSTUMES} from './characterCostumes';
import {SceneCraftProfileSchema,type SceneCraftProfile} from './sceneCraft';

type Direction=SceneCraftProfile['direction'];
type Creature=SceneCraftProfile['life']['creatures'][number];
type Input={context:Omit<SceneCraftProfile['context'],'sourceFrame'>;direction:Direction;activities:string[];creatures?:Creature[];creatureRestraint:string;space:SceneCraftProfile['space'];atmosphere:SceneCraftProfile['atmosphere'];avoid:string[];nextPasses:string[]};
function profile(worldId:string,input:Input):SceneCraftProfile{
 const entry=catalog.worlds.find(w=>w.id===worldId),costume=CHARACTER_COSTUMES[worldId];
 if(!entry||!costume)throw new Error(`Missing authored scene context: ${worldId}`);
 return SceneCraftProfileSchema.parse({version:1,worldId,context:{...input.context,sourceFrame:`${entry.source.title} · ${entry.source.edition}`},
  direction:input.direction,life:{activities:input.activities,creatures:input.creatures??[],creatureRestraint:input.creatureRestraint},space:input.space,atmosphere:input.atmosphere,avoid:input.avoid,nextPasses:input.nextPasses,
  references:[{id:'source',title:entry.source.title,url:entry.source.url,supports:'Literary or historical source context; does not certify this scene geometry, species, costume or staging.'},
   ...costume.references.map((r,i)=>({id:`costume-${i+1}`,...r,supports:costume.interpretation}))]});
}
const backgroundBird:Creature={name:'Distant bird silhouettes',kind:'wildlife',basis:'interpretive',referenceIds:[],state:'candidate',habitat:'Outdoor sky beyond the walkable area; choose species only after a local ecology review.',behavior:'Brief wingbeats and glides, varied timing; no constant circling over the reader.',representation:'Ambient illustration, not a species identification or historical occurrence claim.'};

/** Targets and constraints for the ten existing worlds. These do not silently restyle runtime scenes. */
export const SCENE_CRAFT_PROFILES:Readonly<Record<string,SceneCraftProfile>>={
 alexandria:profile('alexandria',{
  context:{mode:'history',region:'Mediterranean Egypt',locality:'Alexandria waterfront and interpretive scholarly precinct',geography:'named-place',narrativeFrame:'Ancient Alexandria; distinguish the source account from the broader visual interpretation.',uncertainty:'Strabo describes the Mouseion. The library floor plan, cast, clothing and waterfront economy are not reconstructed from that passage.'},
  direction:{signature:'Working quay opening onto a monumental scholarly terrace',composition:'Cargo and fishing work along the quay, shoppers in real aisles, scholars around desks; keep the central library route clear.',wardrobe:'Thin gathered linen, narrow girdles and gravity-led mantles; different lengths and drape for each fictional role.',materialDetail:'Warm limestone joints, thin bronze door leaves, worn thresholds and matte cloth rather than inflated costume volumes.'},
  activities:['Handling nets and cargo beside quay equipment','Short independent market errands','Reading, greeting and turning toward work surfaces'],creatures:[backgroundBird],creatureRestraint:'Keep any future birds distant; the source does not establish a species list or require exotic animals.',
  space:{interiorTarget:'Library reading hall',access:'implemented',review:'Reuse the real entrance, two stair flights, desk/rack footprints and outdoor return route. Side study wings remain closed.'},
  atmosphere:{lighting:'Warm exterior key with readable shaded faces and a restrained roofed-hall fill; update water reflections with time and weather.',motion:'Pinned sail and canopy edges, moving palm tips, grounded guide gestures and staggered pedestrian routes.',sound:'Quay water and distant birds outside; a quieter interior transition is a future target, not an existing feature.'},
  avoid:['Treating a teaching interpretation as the excavated Library','Reusing the three-guide triangle as crowd composition','Copying the 20 MB core allowance as a universal scene budget'],
  nextPasses:['Review the denser clothing and library entrance on target devices','Add a tested exterior-to-interior ambience transition','Inspect hands, seated work and nearby prop contact before increasing distant crowd detail'],
 }),
 'odyssey-ix':profile('odyssey-ix',{
  context:{mode:'myth',region:'Greek epic Mediterranean',locality:'An interpretive rocky shore and Cyclops cave',geography:'fictional',narrativeFrame:'Book IX narrated by Odysseus; mythic time, not a verified archaeological date.',uncertainty:'Do not turn the cave into a verified location or the existing Greek garments into a Bronze Age reconstruction.'},
  direction:{signature:'A compressed shore-to-cave journey',composition:'Lead from the landing past the flock toward a dark cave mouth, with open sea visible on return.',wardrobe:'Differentiate travel wear, fabric weight and drape while retaining the current Greek-inspired cast.',materialDetail:'Weathered rock, rope, vessel rims and animal wool; reserve fine geometry for the cave threshold and close reader.'},
  activities:['Inspecting a landing and rope','Watching the flock beside the cave','Turning from the cave toward the escape route'],
  creatures:[{name:'Sheep',kind:'domestic',basis:'source-described',referenceIds:['source'],state:'existing',habitat:'Cave/flock area in the Book IX episode; breed is not established.',behavior:'Candidate grazing, ear turns and short obstacle-aware steps with varied pauses.',representation:'Existing setting asset; motion and breed detail need a dedicated pass.'},{name:'Polyphemus',kind:'mythic',basis:'source-described',referenceIds:['source'],state:'candidate',habitat:'His cave in the narrated episode.',behavior:'Use only when relevant to the selected passage; scale, breathing and presence before theatrical action.',representation:'A literary character with source-led anatomy; not historical fauna or an automatically installed model.'}],
  creatureRestraint:'Do not add unrelated fantasy monsters or assume all Book IX events are in the assigned excerpt.',
  space:{interiorTarget:'Cyclops cave',access:'needs-review',review:'Check an actual cave opening, ceiling, flock clearance and an unobstructed return to shore.'},
  atmosphere:{lighting:'Bright sea air outside and readable bounced light within the cave.',motion:'Restrained surf, rope movement and separately phased flock behavior.',sound:'Long-period surf and subdued flock sounds only when a suitable licensed or authored sound is available.'},
  avoid:['A verified real-world Cyclops island pin','Generic monster-pack anatomy','Replaying violence merely to animate the scene'],
  nextPasses:['Audit the cave mesh and return route for first-person entry','Upgrade flock anatomy and ground contact','Author a source-bounded Polyphemus brief before selecting a model'],
 }),
 'austen-letter':profile('austen-letter',{
  context:{mode:'literature',region:'England',locality:'Near Hunsford and the Rosings park boundary',geography:'interpretive',narrativeFrame:'Regency interpretation of the letter encounter and rereading.',uncertainty:'The garden reading furniture is teaching staging; the museum evening gown is a silhouette reference, not an exact daywear pattern.'},
  direction:{signature:'An intimate curved garden walk with secluded reading pauses',composition:'Place readers sequentially along hedges and a lane, with attention directed to a letter rather than a central platform.',wardrobe:'Refine raised-waist gown construction, sleeve volume and coat tails; review outdoor daywear and class before accessories.',materialDetail:'Fine fabric folds, paper thickness, pale plaster and selective wear on garden joinery.'},
  activities:['Pausing with a letter','Rereading beside a bench','A short garden walk followed by a still reflection'],creatures:[backgroundBird],creatureRestraint:'Restrained garden life; confirm season before choosing flowers, butterflies or species.',
  space:{interiorTarget:'Optional garden shelter',access:'not-planned',review:'Perfect the walk and bench access first; a grand interior is not required by this letter-reading scene.'},
  atmosphere:{lighting:'Soft angled daylight with clear facial expression and delicate fabric shadows.',motion:'Small leaf movement and varied reading gestures; keep paper readable.',sound:'Quiet breeze and sparse garden birds with long silences.'},
  avoid:['Later Victorian dress silhouettes','Turning private rereading into a crowd spectacle','Copying harbor activity density'],
  nextPasses:['Review outdoor clothing construction and sleeve deformation','Give each reader a distinct letter-handling pose','Refine the curved walking route and bench-scale sightlines'],
 }),
 macbeth:profile('macbeth',{
  context:{mode:'literature',region:'Scotland',locality:'An interpretive heath and stone threshold',geography:'interpretive',narrativeFrame:'The play evokes an eleventh-century setting; its dramatic events are not documentary history.',uncertainty:'Broad medieval wardrobe analogies do not establish exact Scottish dress or a castle floor plan.'},
  direction:{signature:'An exposed heath narrowing into a heavy stone threshold',composition:'Use shelter, distance and a threshold to separate witness, letter and decision, preserving the source stations.',wardrobe:'Weighty tunics and mantles with believable shoulder support; avoid modern fantasy armor and unsupported clan patterns.',materialDetail:'Wet rough stone, moss at sheltered joints and thick wool edges; local wear instead of uniform grunge.'},
  activities:['Seeking shelter near masonry','Examining a letter in stillness','Turning between the heath and the threshold'],creatures:[backgroundBird],creatureRestraint:'Do not use a generic monster roster for the Weird Sisters; source-led dramatic figures need their own character brief.',
  space:{interiorTarget:'Sheltered threshold or gate passage',access:'needs-review',review:'Check ruin openings, floor changes and return visibility before expanding into a castle.'},
  atmosphere:{lighting:'Cool overcast illumination with restrained mist; faces and stone steps remain readable.',motion:'Wind-weighted mantles and grasses with quiet held poses.',sound:'Low heath wind with deliberate silence around dialogue.'},
  avoid:['Exact historical claims inferred from the play','Generic fantasy castle props','Fog concealing navigation or faces'],
  nextPasses:['Refine mantle weight and garment layering','Review the gate passage and terrain clearance','Tune mist against faces and readable source props'],
 }),
 frankenstein:profile('frankenstein',{
  context:{mode:'literature',region:'European and Arctic narrative frame',locality:'An interpretive correspondence study',geography:'interpretive',narrativeFrame:'Walton’s letters use 17—; the selected 1831 edition is not the story date.',uncertainty:'A combined study is teaching staging, not a single verified room from all selected passages.'},
  direction:{signature:'A close lamplit study against a cold exterior',composition:'Cluster correspondence and research around room edges, leaving a human-scale aisle and a window sightline.',wardrobe:'Refine the existing eighteenth-century analogy, tailoring and cuffs; choose a decade only with further evidence.',materialDetail:'Paper, book boards, wood grain and restrained metal tools; exclude inherited film-laboratory apparatus.'},
  activities:['Handling correspondence','Comparing notes at a cabinet','Pausing and withdrawing from a work surface'],creatureRestraint:'The created being needs a dedicated literary character brief if introduced; do not substitute generic undead or treat him as decorative wildlife.',
  space:{interiorTarget:'Study entrance and circulation',access:'needs-review',review:'Confirm the open-front study has a navigable entrance, correctly grounded furniture and an exit before claiming a fully enterable building.'},
  atmosphere:{lighting:'Cold window light balanced against warm practical lamps without flattening faces.',motion:'Small hand, gaze and breathing changes; lamp shimmer remains subtle.',sound:'Soft hearth and occasional paper, with room for sustained quiet.'},
  avoid:['Using 1831 as the narrated year','Film bolts, electrical towers or a generic zombie model','Decorating every study surface with unreadable clutter'],
  nextPasses:['Review close-up hands, cuffs and paper contact','Validate study entrance and furniture clearances','Balance window and practical light on the current skin materials'],
 }),
 'christmas-carol':profile('christmas-carol',{
  context:{mode:'literature',region:'England',locality:'An interpretive London winter street',geography:'named-place',narrativeFrame:'1840s frame with memories and visions occupying different times.',uncertainty:'The three reading areas compress separate narrated places; they are not a survey of all Victorian households.'},
  direction:{signature:'Cold street frontage interrupted by warm domestic windows',composition:'Keep the counting-house, memory and household areas along a street, connected by doorways and changing enclosure.',wardrobe:'Layer coats and natural-waist clothing by role and indoor/outdoor use; refine cloth thickness rather than enlarging silhouettes.',materialDetail:'Brick joints, winter-damp paving, wool coats and localized window warmth.'},
  activities:['Walking a short street errand','Examining an account at a desk','Gathering around a household reading surface'],creatureRestraint:'Ghosts are literary figures, not wildlife; their appearance and episode must be separately sourced before any model is added.',
  space:{interiorTarget:'Counting-house or household doorway',access:'needs-review',review:'Choose one complete street-to-room route, including collision, light and return path, before opening every facade.'},
  atmosphere:{lighting:'Cold diffuse winter daylight with warm windows that do not overexpose nearby faces.',motion:'Coat hems, purposeful street steps and low hearth flicker.',sound:'Winter air outside and a quiet hearth within; no continuous crowd bed over reading.'},
  avoid:['One costume date for every ghostly time shift','Snow or fog used to hide unfinished surfaces','Every door looking enterable while remaining blocked'],
  nextPasses:['Complete one street-to-room entrance','Refine outerwear and planted walking','Review cold exterior versus warm interior exposure'],
 }),
 tempest:profile('tempest',{
  context:{mode:'literature',region:'Fictional island',locality:'An island after the storm',geography:'fictional',narrativeFrame:'Early seventeenth-century stage inspiration; no exact local historical wardrobe is established.',uncertainty:'Keep performance-period costume, fictional geography and source speaker attribution separate.'},
  direction:{signature:'A storm-scarred island with broken sightlines and sheltered listening places',composition:'Use rock, wreck fragments and a diagonal path to organize competing accounts; avoid the Odyssey flock-and-cave arrangement.',wardrobe:'Differentiate stage-inspired gowns, doublets and jerkins with weight and credible fastenings.',materialDetail:'Wet rock, bleached timber and restrained salt wear; every remnant has a visible physical support.'},
  activities:['Inspecting storm remnants','Listening from a sheltered rock edge','Turning between opposing account stations'],
  creatures:[{name:'Ariel',kind:'supernatural',basis:'source-described',referenceIds:['source'],state:'candidate',habitat:'The fictional island and the play’s changing manifestations.',behavior:'Use a source-specific presence or stage interpretation; do not auto-populate the island with fairies.',representation:'A dramatic spirit, not a documented local species. Appearance and embodiment require a separate design decision.'}],
  creatureRestraint:'Do not classify Caliban as generic fauna or import Odyssey sheep by theme inheritance.',
  space:{interiorTarget:'A sheltered island passage',access:'needs-review',review:'Check rock gaps, sea edges and a clear return route; add an enclosed cell only after a dedicated source and geometry review.'},
  atmosphere:{lighting:'Broken, cool post-storm light with readable wet surfaces.',motion:'Uneven wind and surf with still sheltered pockets; no synchronized foliage.',sound:'Rolling surf with pauses in gusts; supernatural sound, if added, belongs to a specified passage.'},
  avoid:['A verified real-world island ecology claim','Generic fairy or monster packs','Copying the Cyclops cave and flock'],
  nextPasses:['Review weathered wreck materials and supports','Shape safe island circulation through rock gaps','Prepare an Ariel-specific representation brief if the lesson calls for it'],
 }),
 declaration:profile('declaration',{
  context:{mode:'history',region:'North America · Pennsylvania',locality:'Philadelphia document workshop',geography:'named-place',narrativeFrame:'1776; distinguish drafting, adoption, signing and later effects.',uncertainty:'Fictional readers are not delegates, and the document workshop is not an exact Independence Hall reconstruction.'},
  direction:{signature:'A document workshop organized by tables and window light',composition:'Readers share documents across a working surface; leave a side aisle and an intentional approach to the principal text.',wardrobe:'Tailored coats, waistcoats, breeches and gowns; vary cloth and construction by fictional role rather than duplicating uniforms.',materialDetail:'Wood joinery, ink tools and paper edges scaled for close reading.'},
  activities:['Comparing document passages','Passing attention between a paper and another reader','A short step aside to make space at the table'],creatureRestraint:'No creatures are needed in the document room; omit ambient wildlife rather than filling every scene.',
  space:{interiorTarget:'Workshop entrance and table aisle',access:'needs-review',review:'Check room access, chair footprints and document reach while preserving all source targets.'},
  atmosphere:{lighting:'Daylight motivated by room openings, with restrained warm bounce on wood.',motion:'Varied paper and hand gestures followed by stillness.',sound:'Quiet paper handling and room tone; no ceremonial crowd loop.'},
  avoid:['Staging every signature on July 4','Presenting fictional guides as named signers','Reusing a grand library hall solely because it is available'],
  nextPasses:['Refine tailoring and hand-to-document contact','Recompose table-side activities within anchor limits','Validate workshop entry and daylight direction'],
 }),
 'douglass-literacy':profile('douglass-literacy',{
  context:{mode:'history',region:'North America · Maryland',locality:'Baltimore testimony reading courtyard',geography:'named-place',narrativeFrame:'The narrated literacy years, 1826–1833; distinguish them from the 1845 publication.',uncertainty:'Readers do not portray Douglass or the Auld family. The courtyard is interpretive staging, not a reconstructed household.'},
  direction:{signature:'A modest brick courtyard connected to an ordinary street',composition:'Reading and conversation follow the walls and an open route, with human-scale domestic work surfaces.',wardrobe:'Review transitional gowns, coats and trousers for the narrated years; separate role, occupation and economic circumstances.',materialDetail:'Brick, plain joinery, cloth and handled paper; wear should follow use, not stereotypes.'},
  activities:['Quietly comparing testimony','Turning between a street view and reading surface','Making space for another reader without crowding the evidence'],creatures:[backgroundBird],creatureRestraint:'No animals or coercion tableaux are needed as decorative activity; keep attention on the testimony.',
  space:{interiorTarget:'Courtyard-to-room threshold',access:'needs-review',review:'Check doorway, paving height and room function before extending the modest courtyard.'},
  atmosphere:{lighting:'Ordinary daylight with readable shaded courtyard faces.',motion:'Small purposeful reading gestures and restrained street movement.',sound:'Low courtyard breeze and sparse distant birds; keep dialogue primary.'},
  avoid:['Dressing the scene for the publication year by default','Presenting fictional companions as historical portraits','Using decorative violence to imply authenticity'],
  nextPasses:['Refine role-specific fabric and tailoring','Review courtyard contact shadows and prop scale','Plan one source-appropriate domestic threshold'],
 }),
 'seneca-falls':profile('seneca-falls',{
  context:{mode:'history',region:'North America · New York',locality:'Seneca Falls meeting-room interpretation',geography:'named-place',narrativeFrame:'1848 declaration and meeting context.',uncertainty:'The meeting layout and fictional readers do not reconstruct every participant or an exact surviving interior.'},
  direction:{signature:'A modest meeting aisle leading to a shared statement',composition:'Keep benches and reading stations along the meeting axis, with conversational clusters beside an open central aisle.',wardrobe:'Natural-waist dresses, full skirts and tailored separates; distinguish individual construction without later reform dress.',materialDetail:'Plain timber benches, plaster, paper and modest window trim at human scale.'},
  activities:['Comparing declarations beside a bench','Addressing a small reading group','Stepping aside in the meeting aisle'],creatureRestraint:'No indoor wildlife or fantasy beings; the gathering supplies the scene’s life.',
  space:{interiorTarget:'Meeting-room entry and aisle',access:'needs-review',review:'Check bench clearances, doorway and accessible source positions before adding more participants.'},
  atmosphere:{lighting:'Soft window light across faces and the statement, with restrained interior fill.',motion:'Asynchronous listening, speaking and reading gestures.',sound:'Still room and occasional pages; avoid a constant cheering audience.'},
  avoid:['The later 1851 Bloomer costume','Identical synchronized audience poses','Treating the declaration as implemented legislation'],
  nextPasses:['Refine dress volume and seated-body clearance','Compose small purposeful groups along the aisle','Review window light on all three readers'],
 }),
};

export function sceneCraftProfile(id:string):SceneCraftProfile{
 if(!Object.hasOwn(SCENE_CRAFT_PROFILES,id))throw new Error(`No reviewed authoring brief for "${id}". Use --list or create a new profile; period and region are never inferred from a palette.`);
 return structuredClone(SCENE_CRAFT_PROFILES[id]);
}
