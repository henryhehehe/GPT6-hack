#!/usr/bin/env python3
"""Rebuild the current 60-second demo from new, actual screen captures."""
import argparse,json,subprocess,wave
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'output/demo/v4';DOCS=ROOT/'docs/demo'
OLD='crop=3456:1712:68:340,scale=1920:952'
FULL='crop=3456:1712:112:368,scale=1920:952'
EDL=[
 ('final-first-claim',3,9,FULL,'STUDENT · THE FIRST ANSWER'),
 ('landing-library',2,5,OLD,'COUNTERFACTUAL WORLDS'),
 ('final-walk',24,27,FULL,'STUDENT · WALK THROUGH THE QUESTION'),
 ('final-teacher',2,4.7,OLD,'TEACHER · 30 PREPARED LESSONS'),
 ('final-teacher',9.5,11,OLD,'TEACHER · REVIEW THE SOURCE PACKET'),
 ('final-teacher',32,33.8,OLD,'TEACHER · GUIDE + WORKSHEET'),
 ('final-walk',18.5,22,FULL,'STUDENT · CHANGE ONE ASSUMPTION'),
 ('final-walk',1,5,FULL,'ALEXANDRIA · WHAT IF HARBOR TRADE COLLAPSED?'),
 ('final-source-world',40.7,45,FULL,'STUDENT · READ STRABO IN CONTEXT'),
 ('final-feedback',1,4.7,FULL,'ASTRA · CHALLENGE UNSUPPORTED CERTAINTY'),
 ('final-challenge',1,3.5,FULL,'TEACHER · DIRECT THE NEXT QUESTION'),
 ('final-challenge',14,17,FULL,'TEACHER · REVIEW THE GENERATED PREVIEW'),
 ('final-hint',17,19.5,FULL,'STUDENT · THE TEACHER’S QUESTION ARRIVES'),
 ('final-source-world',7,11.5,FULL,'STUDENT · REVISE WITH EVIDENCE'),
 ('final-report',1,4,FULL,'TEACHER · REVIEW SUBMITTED WORK'),
 ('final-report',10,14.7,FULL,'TEACHER · FIRST AND LATEST EXPLANATIONS'),
 ('final-walk',30,36.3,FULL,'COUNTERFACTUAL WORLDS · BUILT WITH ASTRA'),
]
BOUNDS=[0,5.4,11.1,16.7,23.7,31.2,38.65,47.3]
SLOTS=[0,6,12,18,25.5,33.5,41.5]
# Exact phrases from the narration. Timings follow its word-level transcript.
PHRASES=[(0,2.6,'“The library will definitely close.”'),(3.1,5.3,'That’s the first answer. Let’s test it.'),
(5.8,8.2,'Counterfactual Worlds turns history and literature'),(8.2,10.8,'into investigations students can walk through.'),
(11.64,13.9,'Teachers choose from thirty prepared lessons,'),(14.2,16.4,'review the sources, and get a teaching guide.'),
(17.16,19.6,'In Alexandria, we collapse harbor trade.'),(19.95,21.4,'Fewer ships. Less income.'),(21.6,23.4,'But must the scholars disappear?'),
(24.14,26.35,'Students read Strabo, cite the evidence,'),(26.46,27.8,'and defend their explanation.'),(27.81,30.9,'Astra challenges unsupported certainty.'),
(31.72,33.2,'Then the teacher changes the challenge:'),(33.48,34.7,'could a new patron help?'),(35.55,36.8,'Preview. Apply.'),(37.14,38.4,'The student keeps their work.'),
(39.06,40.25,'Now the answer changes:'),(40.7,42.6,'“Closure is possible, not inevitable.”'),(43.48,45.4,'The teacher can review the first and latest'),(45.4,47.15,'explanations side by side.')]

def run(c):subprocess.run([str(x) for x in c],check=True)
def at(t):
 c=round(t*100);return f'{c//360000}:{c//6000%60:02}:{c//100%60:02}.{c%100:02}'
def st(t):
 c=round(t*1000);return f'{c//3600000:02}:{c//60000%60:02}:{c//1000%60:02},{c%1000:03}'
def loadwav(p):
 with wave.open(str(p)) as w:
  assert w.getnchannels()==1 and w.getsampwidth()==2
  return w.getframerate(),np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)
def main():
 p=argparse.ArgumentParser();p.add_argument('--ffmpeg',required=True);a=p.parse_args();ff=[a.ffmpeg,'-hide_banner','-loglevel','error','-y']
 segs=OUT/'edited-segments';segs.mkdir(exist_ok=True);paths=[];manifest=[];cursor=0
 for i,(name,start,end,crop,label) in enumerate(EDL):
  dest=segs/f'{i:02}.mp4';dur=round(end-start,3)
  run(ff+['-ss',start,'-i',OUT/'raw'/f'{name}.mov','-t',dur,'-vf',crop+',setsar=1,fps=30,pad=1920:1080:0:0:color=0x0b151d','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',dest])
  paths.append(dest);manifest.append(dict(start=round(cursor,3),end=round(cursor+dur,3),source=name+'.mov',sourceIn=start,sourceOut=end,crop=crop,label=label));cursor+=dur
  print(f'Shot {i+1}/{len(EDL)}',flush=True)
 assert abs(cursor-60)<.001,cursor
 (OUT/'edit-decision-list.json').write_text(json.dumps(manifest,indent=2)+'\n')
 concat=OUT/'video-concat.txt';concat.write_text(''.join(f"file '{p}'\n" for p in paths))
 run(ff+['-f','concat','-safe','0','-i',concat,'-c','copy',OUT/'picture-edit.mp4'])
 rate,raw=loadwav(OUT/'voiceover-natural.wav');track=np.zeros(rate*60,dtype=np.int16)
 for i in range(7):
  clip=raw[round(BOUNDS[i]*rate):round(BOUNDS[i+1]*rate)]
  n=round(SLOTS[i]*rate);track[n:n+len(clip)]=clip
 cr,closing=loadwav(OUT/'closing/voiceover-natural.wav');assert cr==rate
 clip=closing[:round(6.3*rate)].copy();clip[-round(.1*rate):]=(clip[-round(.1*rate):]*np.linspace(1,0,round(.1*rate))).astype(np.int16)
 n=round(53.7*rate);track[n:n+len(clip)]=clip
 with wave.open(str(OUT/'voiceover-final.wav'),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(track.tobytes())
 caps=[]
 for s,e,t in PHRASES:
  i=next(i for i in range(7) if BOUNDS[i]<=s<BOUNDS[i+1]);shift=SLOTS[i]-BOUNDS[i];caps.append((s+shift,e+shift,t))
 caps += [(53.7,55.15,'Built with Astra.'),(55.65,56.95,'Counterfactual Worlds.'),(57.2,58.35,'Step inside a question.'),(58.75,59.95,'Come back with an argument.')]
 srt='\n'.join(f'{i+1}\n{st(s)} --> {st(e)}\n{t}\n' for i,(s,e,t) in enumerate(caps));(OUT/'captions.srt').write_text(srt);(DOCS/'captions.srt').write_text(srt)
 ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Arial,38,&H00FFFFFF,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,0,0,1,0,0,2,50,50,23,1
Style: Label,Arial,19,&H00CAE7DC,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,1,0,1,0,0,7,30,30,965,1
Style: Note,Arial,16,&H00ADBDBF,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,0,0,1,0,0,9,30,30,965,1
Style: Quote,Arial,39,&H00FFFFFF,&H00FFFFFF,&H001D150B,&H001D150B,0,0,0,0,100,100,0,0,3,20,0,7,80,650,470,1
Style: Compare,Arial,32,&H00FFFFFF,&H00FFFFFF,&H001D150B,&H001D150B,0,0,0,0,100,100,0,0,3,15,0,7,80,80,600,1
Style: Brand,Arial,58,&H00FFFFFF,&H00FFFFFF,&H001D150B,&H001D150B,-1,0,0,0,100,100,0,0,3,20,0,5,50,50,0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
 def ev(s,e,style,t):return f'Dialogue: 0,{at(s)},{at(e)},{style},,0,0,0,,{t}\n'
 for s,e,t in caps:ass+=ev(s,e,'Caption',t)
 for m in manifest:ass+=ev(m['start'],m['end'],'Label',m['label'])
 ass+=ev(0,60,'Note','RECORDED APP · EDITED TAKES · WAITS CUT · AI NARRATION')
 ass+=ev(.15,5.8,'Quote','{\\fs20\\c&HCAE7DC&}RECORDED FIRST ANSWER · EXCERPT{\\rQuote}\\N“The library will definitely close.”')
 ass+=ev(29.8,33.5,'Quote','{\\fs20\\c&HCAE7DC&}ACTUAL ASTRA FEEDBACK · EXCERPT{\\rQuote}\\N“‘Definitely’ goes beyond the packet.”')
 ass+=ev(41.7,46,'Quote','{\\fs20\\c&HCAE7DC&}RECORDED REVISION · EXCERPT{\\rQuote}\\N“Closure is possible, not inevitable.”\\N“A new patron could replace lost support.”')
 ass+=ev(49,53.7,'Compare','{\\pos(90,650)\\fs19\\c&HCAE7DC&}RECORDED SUBMISSIONS · EXCERPTS{\\rCompare}\\NFIRST  “The library will definitely close…”\\NLATEST  “Closure is possible, not inevitable.”')
 ass+=ev(55.65,60,'Brand','Counterfactual Worlds\\N{\\fs30}Step inside a question. Come back with an argument.')
 subs=OUT/'captions.ass';subs.write_text(ass)
 run(ff+['-i',OUT/'picture-edit.mp4','-i',OUT/'voiceover-final.wav','-vf',f'ass={subs}','-map','0:v','-map','1:a','-c:v','libx264','-preset','fast','-crf','19','-c:a','aac','-b:a','192k','-af','loudnorm=I=-16:TP=-1.5:LRA=9','-ar','48000','-t',60,'-movflags','+faststart','-map_metadata','-1',OUT/'counterfactual-worlds-60s.mp4'])
 print('Rendered 60 seconds.',flush=True)
if __name__=='__main__':main()
