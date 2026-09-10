'use client';

import {useId,useState} from 'react';
import {Info,X} from 'lucide-react';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';

export default function SceneProvenance({imported}:{imported:boolean}){
 const [open,setOpen]=useState(false);
 const titleId=useId(),descriptionId=useId();
 return <Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild><button className="icon-button" aria-label="About this setting" title="About this setting"><Info size={17}/></button></PopoverTrigger>
  <PopoverContent className="scene-provenance" side="bottom" align="end" sideOffset={10} collisionPadding={12} aria-labelledby={titleId} aria-describedby={descriptionId} onEscapeKeyDown={event=>event.stopPropagation()}>
   <header><h2 id={titleId}>About this setting</h2><button onClick={()=>setOpen(false)} aria-label="Close setting information"><X size={17}/></button></header>
   <span className="provenance-kind">Interpretive learning setting</span>
   <p id={descriptionId}>{imported?'This is a symbolic setting for the reading. The scenery and guides are teaching representations. Source excerpts are available in your journal.':'The scholarly complex and lighthouse are artist interpretations, not verified replicas. Amber changes depend on explicit scenario assumptions. Historical evidence is labeled separately.'}</p>
   <p className="provenance-guidance">Use the labeled evidence cards to support your explanation.</p>
  </PopoverContent>
 </Popover>;
}
