import type {ZoneId} from './world';

export type CharacterCostume={
  period:string;
  interpretation:string;
  models:Record<ZoneId,string>;
  references:readonly {title:string;url:string}[];
};
const greek={title:'The Met · Ancient Greek dress',url:'https://www.metmuseum.org/es/essays/ancient-greek-dress'};
const georgian={title:'The Met · Suit, 1770–80',url:'https://www.metmuseum.org/art/collection/search/623325'};
const regency={title:'The Met · Evening dress, 1810–12',url:'https://www.metmuseum.org/art/collection/search/157539'};
const victorian={title:'The Met · Morning dress, 1840–45',url:'https://www.metmuseum.org/art/collection/search/108064'};
const cast=(harbor:string,market:string,library:string)=>({harbor,market,library});

/** Deliberate assignments: neither publication dates nor hashes determine clothing. */
export const CHARACTER_COSTUMES:Readonly<Record<string,CharacterCostume>>={
  alexandria:{period:'Ancient Mediterranean interpretation',interpretation:'Tunic and mantle companions; Strabo’s passage does not specify their clothing.',models:cast('dorian','thaleia','ione'),references:[greek]},
  'odyssey-ix':{period:'Greek literary interpretation',interpretation:'Greek-inspired tunics and mantles illustrate a mythic story; they are not a verified Bronze Age reconstruction.',models:cast('thaleia','dorian','ione'),references:[greek]},
  macbeth:{period:'Eleventh-century-inspired clothing',interpretation:'Plain tunics, a gown and a mantle use broad medieval analogies. Exact Scottish dress is not established by these models.',models:cast('medieval-tunic','medieval-gown','medieval-cloak'),references:[{title:'Reading Museum · Bayeux costume guide',url:'https://collections.readingmuseum.org.uk/pdfs/H193B.pdf'}]},
  tempest:{period:'Early seventeenth-century stage inspiration',interpretation:'Doublet, gown and jerkin evoke Shakespeare’s theatre period. The fictional island has no verified local wardrobe.',models:cast('earlymodern-gown','earlymodern-doublet','earlymodern-jerkin'),references:[{title:'V&A · Shakespeare trail, doublet 1615–20',url:'https://www.vam.ac.uk/articles/vampa-trail-shakespeares-magic'},{title:'Folger · The Tempest performance record',url:'https://shakespearedocumented.folger.edu/plays-poetry/tempest'}]},
  declaration:{period:'Philadelphia, 1776 · clothing interpretation',interpretation:'Curved-front coats, waistcoats, knee breeches and a full-length gown draw on eighteenth-century garments. These readers are not convention delegates.',models:cast('georgian-coat','georgian-gown','georgian-waistcoat'),references:[georgian]},
  frankenstein:{period:'Eighteenth-century narrative frame',interpretation:'Walton dates his letters 17—. The wardrobe uses a late-eighteenth-century analogy, with no exact decade asserted; 1831 is the edition date.',models:cast('georgian-gown','georgian-waistcoat','georgian-coat'),references:[georgian,{title:'Frankenstein · Letter I',url:'https://www.gutenberg.org/files/42324/42324-h/42324-h.htm'}]},
  'austen-letter':{period:'Regency clothing interpretation',interpretation:'Raised-waist gowns and a cutaway coat replace the later silhouettes. An 1810–12 museum gown informs the shape, not an exact daywear replica.',models:cast('regency-gown','regency-coat','regency-dress'),references:[regency]},
  'douglass-literacy':{period:'Baltimore, 1826–1833 · clothing interpretation',interpretation:'A transitional gown, coat and trousers follow the narrated literacy years, not the 1845 publication date. These companions do not portray Douglass or the Auld family.',models:cast('romantic-gown','romantic-coat','romantic-waistcoat'),references:[{title:'National Park Service · Douglass chronology',url:'https://www.nps.gov/frdo/learn/kidsyouth/chronology.htm'},{title:'The Met · American morning dress, 1825–30',url:'https://www.metmuseum.org/art/collection/search/174272'}]},
  'christmas-carol':{period:'1840s reading companions',interpretation:'Coats, trousers and a natural-waist gown frame the 1843 story. They do not reconstruct every time visited by the ghosts.',models:cast('reader-waistcoat','reader-dress','reader-coat'),references:[victorian]},
  'seneca-falls':{period:'Seneca Falls, 1848 · clothing interpretation',interpretation:'Natural-waist dress, full skirt and tailored separates. The later 1851 Bloomer reform costume is not used.',models:cast('reader-dress','reader-coat','reader-waistcoat'),references:[{title:'The Met · American afternoon dress, c.1845',url:'https://www.metmuseum.org/art/collection/search/159519'},{title:'National Park Service · Bloomers on the Trail',url:'https://www.nps.gov/articles/000/bloomers-on-the-trail.htm'}]},
};
const generic:CharacterCostume={period:'Fictional reading companions',interpretation:'General illustrative clothing; no historical period has been verified for this custom world.',models:cast('reader-coat','reader-dress','reader-waistcoat'),references:[]};
export function characterCostume(worldId:string):CharacterCostume{
  return Object.hasOwn(CHARACTER_COSTUMES,worldId)?CHARACTER_COSTUMES[worldId]:generic;
}
