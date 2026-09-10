#!/usr/bin/env python3
"""Re-edit verified recorded app footage into the version-3 one-minute pitch."""
import argparse, difflib, hashlib, json, re, subprocess, wave
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/demo/v3'; DOCS=ROOT/'docs/demo/v3'; RAW=ROOT/'output/demo/v2/raw'
FULL='crop=3456:1712:68:340,scale=1920:952'
DETAIL='crop=2400:1190:1124:502,scale=1920:952'
EDL=[
 ('full-take',72,79,DETAIL,'THE FIRST CLAIM'),
 ('full-take',3,7,FULL,'TEACHER · PREPARED ALEXANDRIA'),
 ('full-take',11,14,FULL,'STUDENT · ENTER THE INVESTIGATION'),
 ('full-take',31,34,FULL,'STUDENT · WALK INTO THE WORLD'),
 ('full-take',45,48,FULL,'STUDENT · CHANGE ONE ASSUMPTION'),
 ('full-take',86,91,DETAIL,'ASTRA · CHALLENGE CERTAINTY'),
 ('full-take',110,113,FULL,'TEACHER · CHANGE THE CHALLENGE'),
 ('teacher',12,18,'crop=2400:1190:1124:862,scale=1920:952','TEACHER · PREVIEW THE QUESTION'),
 ('teacher',18,21,FULL,'TEACHER · APPLY TO THE SAME WORLD'),
 ('source',12,17,FULL,'STUDENT · READ THE SOURCE'),
 ('source',17,20,FULL,'STUDENT · USE THE CITATION'),
 ('result',1,10,FULL,'STUDENT · A DIFFERENT EXPLANATION'),
 ('result',22,28,FULL,'COUNTERFACTUAL WORLDS'),
]
SLOTS=[0,7,17,25,37,45,54,60]
def norm(word):return re.sub('[^a-z0-9]','',word.lower())
def align_words(expected, observed):
 result=[];cursor=0
 for word in expected:
  target=norm(word);joined='';start=cursor
  while cursor<len(observed) and joined!=target:
   joined+=norm(observed[cursor]['word']);cursor+=1
   assert target.startswith(joined), f'Spoken wording differs: {word} / {joined}'
  assert joined==target, f'Missing spoken word: {word}'
  result.append({'word':word,'start':observed[start]['start'],'end':observed[cursor-1]['end']})
 return result,cursor
def run(cmd):subprocess.run([str(x) for x in cmd],check=True)
def stamp(t,ass=False):
 n=round(t*(100 if ass else 1000)); base=100 if ass else 1000
 return f'{n//(3600*base):02}:{n//(60*base)%60:02}:{n//base%60:02}'+('.' if ass else ',')+f'{n%base:0{2 if ass else 3}}'
def event(start,end,style,text):return f'Dialogue: 0,{stamp(start,True)},{stamp(end,True)},{style},,0,0,0,,{text}\n'
def main():
 p=argparse.ArgumentParser();p.add_argument('--ffmpeg',required=True);a=p.parse_args()
 ff=[a.ffmpeg,'-hide_banner','-loglevel','error','-y'];OUT.mkdir(exist_ok=True)
 segments=OUT/'edited-segments';segments.mkdir(exist_ok=True)
 paragraphs=[p.split() for p in (DOCS/'voiceover.txt').read_text().strip().split('\n\n')]
 assert len(paragraphs)==7
 spoken=json.loads((OUT/'transcript.json').read_text())['words']
 closing=json.loads((OUT/'closing-transcript.json').read_text())['words']
 expected=[norm(w) for para in paragraphs[:6] for w in para]
 assert expected==[norm(w['word']) for w in spoken[:len(expected)]], 'First six spoken paragraphs must match the script'
 closing,used=align_words(paragraphs[6],closing)
 assert used==len(json.loads((OUT/'closing-transcript.json').read_text())['words']), 'Unexpected extra spoken closing words'
 # Align each paragraph to its scene; slight tempo adjustment only where a natural take exceeds its slot.
 audio=[];captions=[];timing=[];offset=0
 for i,words in enumerate(paragraphs):
  source=OUT/('closing-natural.wav' if i==6 else 'voiceover-natural.wav')
  aligned=closing if i==6 else spoken[offset:offset+len(words)]
  offset+=len(words)
  with wave.open(str(source)) as w:total=w.getnframes()/w.getframerate()
  start=max(0,aligned[0]['start']-.08);end=min(total,aligned[-1]['end']+.18)
  length=SLOTS[i+1]-SLOTS[i];speed=max(1,(end-start)/(length-.3))
  assert speed<=1.2, f'Paragraph {i+1} needs a new take, not excessive acceleration'
  dst=segments/f'voice-{i}.wav'
  run(ff+['-ss',start,'-i',source,'-t',end-start,'-af',f'atempo={speed},adelay=120:all=1,apad=whole_dur={length},atrim=duration={length}', '-ar','24000','-ac','1','-c:a','pcm_s16le',dst]);audio.append(dst)
  timing.append({'paragraph':i+1,'source':source.name,'in':start,'out':end,'speed':speed,'start':SLOTS[i]+.12,'end':SLOTS[i]+.12+(end-start)/speed})
  begin=0
  for j,word in enumerate(words):
   chunk=' '.join(words[begin:j+1])
   if j==len(words)-1 or j-begin>=7 or len(chunk)>=52 or word.rstrip('”').endswith(('.', '?')):
    s=SLOTS[i]+.12+(aligned[begin]['start']-start)/speed
    e=min(SLOTS[i+1]-.06,SLOTS[i]+.12+(aligned[j]['end']-start)/speed+.12)
    if j+1<len(words):e=min(e,SLOTS[i]+.12+(aligned[j+1]['start']-start)/speed)
    assert e>s, 'Caption timing must be nonempty'
    captions.append((s,e,chunk));begin=j+1
 (OUT/'narration-timing.json').write_text(json.dumps(timing,indent=2)+'\n')
 audio_list=OUT/'audio-concat.txt';audio_list.write_text(''.join(f"file '{p}'\n" for p in audio))
 run(ff+['-f','concat','-safe','0','-i',audio_list,'-c:a','pcm_s16le',OUT/'voiceover-final.wav'])
 paths=[];manifest=[];cursor=0
 for i,(name,start,end,crop,label) in enumerate(EDL):
  dst=segments/f'{i:02}.mp4';duration=end-start
  run(ff+['-ss',start,'-i',RAW/f'{name}.mov','-t',duration,'-vf',crop+',setsar=1,fps=30,pad=1920:1080:0:0:color=0x0b151d','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',dst])
  paths.append(dst);manifest.append({'start':cursor,'end':cursor+duration,'source':f'output/demo/v2/raw/{name}.mov','in':start,'out':end,'crop':crop,'label':label});cursor+=duration
  print(f'Edited shot {i+1}/{len(EDL)}',flush=True)
 assert cursor==60
 (OUT/'edit-decision-list.json').write_text(json.dumps(manifest,indent=2)+'\n')
 video_list=OUT/'video-concat.txt';video_list.write_text(''.join(f"file '{p}'\n" for p in paths))
 silent=OUT/'picture-edit.mp4';run(ff+['-f','concat','-safe','0','-i',video_list,'-c','copy',silent])
 srt='\n'.join(f'{i+1}\n{stamp(s)} --> {stamp(e)}\n{t}\n' for i,(s,e,t) in enumerate(captions))
 (OUT/'captions.srt').write_text(srt);(DOCS/'captions.srt').write_text(srt)
 ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Arial,38,&H00FFFFFF,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,0,0,1,0,0,2,80,80,22,1
Style: Label,Arial,20,&H00CAE7DC,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,1,0,1,0,0,7,35,35,967,1
Style: Note,Arial,18,&H00ADBDBF,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,0,0,1,0,0,9,35,35,967,1
Style: Quote,Arial,55,&H00FFFFFF,&H00FFFFFF,&H00151D0B,&H00151D0B,0,0,0,0,100,100,0,0,3,18,0,7,55,750,605,1
Style: Title,Arial,65,&H00FFFFFF,&H00FFFFFF,&H00151D0B,&H00151D0B,0,0,0,0,100,100,0,0,3,18,0,5,140,140,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
 for s,e,t in captions:ass+=event(s,e,'Caption',t)
 for shot in manifest:ass+=event(shot['start'],shot['end'],'Label',shot['label'])
 ass+=event(0,60,'Note','RECORDED APP · EDITED TAKES · WAITS CUT · AI NARRATION')
 ass+=event(.15,6.85,'Quote','INITIAL STUDENT CLAIM · EXCERPT\\N“The library would\\Ndefinitely close.”')
 ass+=event(20,25,'Quote','ACTUAL ASTRA FEEDBACK\\N“Closure is not certain.”')
 ass+=event(45,54,'Quote','REVISED STUDENT CLAIM\\N“Closure is possible,\\Nnot inevitable.”')
 ass+=event(55,60,'Title','Counterfactual Worlds\\N{\\fs42}Step inside a question.\\NCome back with an argument.\\N{\\fs23}Built with Astra · AI feedback and teacher challenges')
 subs=OUT/'captions.ass';subs.write_text(ass)
 final=OUT/'counterfactual-worlds-60s.mp4'
 run(ff+['-i',silent,'-i',OUT/'voiceover-final.wav','-vf',f'ass={subs}','-map','0:v','-map','1:a','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-af','loudnorm=I=-16:TP=-1.5:LRA=9','-ar','48000','-t','60','-movflags','+faststart','-map_metadata','-1',final])
 provenance={'version':3,'picture':'Re-edit of actual September 10 version-2 screen recordings; not a capture of the latest local UI','narration':'New Marin take with a separate closing pickup; AI-generated','durationSeconds':60,'bytes':final.stat().st_size,'sha256':hashlib.sha256(final.read_bytes()).hexdigest(),'lastNarrationEndsSeconds':timing[-1]['end'],'sourceSha256':{name:hashlib.sha256((RAW/f'{name}.mov').read_bytes()).hexdigest() for name in sorted({row[0] for row in EDL})}}
 (OUT/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n');print(final,flush=True)
if __name__=='__main__':main()
