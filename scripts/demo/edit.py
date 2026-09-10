#!/usr/bin/env python3
"""Edit actual window recordings and a single natural speech take into 60 seconds."""
import argparse, json, subprocess, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/demo/v2'
DOCS = ROOT / 'docs/demo'
FULL = 'crop=3456:1712:68:340,scale=1920:952'
# Source in/out seconds. Every shot is moving screen footage; no still-image holds.
EDL = [
    ('full-take', 1, 8, FULL, 'TEACHER · PREPARED ALEXANDRIA'),
    ('full-take', 11, 14, FULL, 'STUDENT · EXPLORE THE WORLD'),
    ('full-take', 31, 34, FULL, 'STUDENT · EXPLORE THE WORLD'),
    ('full-take', 45, 49, FULL, 'STUDENT · CHANGE ONE ASSUMPTION'),
    ('full-take', 73, 76, FULL, 'STUDENT · INITIAL CLAIM'),
    ('full-take', 86, 92, 'crop=2400:1190:1124:502,scale=1920:952', 'STUDENT · ASTRA CHALLENGES CERTAINTY'),
    ('full-take', 110, 113, FULL, 'TEACHER · DIRECT THE LESSON'),
    ('teacher', 12, 18, 'crop=2400:1190:1124:862,scale=1920:952', 'TEACHER · PREVIEW THE QUESTION'),
    ('teacher', 18, 21, FULL, 'TEACHER · APPLY TO THE SAME WORLD'),
    ('source', 12, 17, FULL, 'STUDENT · READ THE SOURCE'),
    ('source', 17, 20, FULL, 'STUDENT · USE THE CITATION'),
    ('result', 1, 11, FULL, 'STUDENT · REVISED REASONING'),
    ('result', 24, 28, FULL, 'COUNTERFACTUAL WORLDS'),
]
BOUNDS = [0,5.72,14.17,21.90,30.47,37.35,44.86,47.30]
SLOTS = [0,7,17,26,38,46,56,60]

def run(cmd):
    subprocess.run([str(x) for x in cmd], check=True)

def ass_time(t):
    c=round(t*100)
    return f'{c//360000:01}:{c//6000%60:02}:{c//100%60:02}.{c%100:02}'

def srt_time(t):
    m=round(t*1000)
    return f'{m//3600000:02}:{m//60000%60:02}:{m//1000%60:02},{m%1000:03}'

def main():
    p=argparse.ArgumentParser();p.add_argument('--ffmpeg',required=True);a=p.parse_args()
    ff=[a.ffmpeg,'-hide_banner','-loglevel','error','-y']
    segs=OUT/'edited-segments';segs.mkdir(exist_ok=True)
    paths=[]; manifest=[]; cursor=0
    for i,(name,start,end,crop,label) in enumerate(EDL):
        dst=segs/f'{i:02}.mp4';duration=end-start
        run(ff+['-ss',start,'-i',OUT/'raw'/f'{name}.mov','-t',duration,
            '-vf',crop+',setsar=1,fps=30,pad=1920:1080:0:0:color=0x0b151d',
            '-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',dst])
        paths.append(dst);manifest.append({'start':cursor,'end':cursor+duration,'source':name+'.mov','in':start,'out':end,'crop':crop,'label':label});cursor+=duration
        print(f'Edited shot {i+1}/{len(EDL)}',flush=True)
    assert cursor==60
    (OUT/'edit-decision-list.json').write_text(json.dumps(manifest,indent=2)+'\n')
    concat=OUT/'video-concat.txt';concat.write_text(''.join(f"file '{x}'\n" for x in paths))
    silent=OUT/'picture-edit.mp4'
    run(ff+['-f','concat','-safe','0','-i',concat,'-c','copy',silent])

    # Preserve natural delivery within paragraphs. Insert breathing room only at paragraph boundaries.
    with wave.open(str(OUT/'voiceover-natural.wav')) as w:
        rate=w.getframerate(); raw=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)
    track=np.zeros(60*rate,dtype=np.int16)
    for i in range(7):
        clip=raw[round(BOUNDS[i]*rate):round(BOUNDS[i+1]*rate)]
        at=round((SLOTS[i]+.15)*rate);track[at:at+len(clip)]=clip
    with wave.open(str(OUT/'voiceover-final.wav'),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(track.tobytes())
    transcript=json.loads((OUT/'transcript.json').read_text())
    caps=[]
    for s in transcript['segments']:
        i=next(i for i in range(7) if BOUNDS[i]<=s['start']<BOUNDS[i+1])
        shift=SLOTS[i]+.15-BOUNDS[i]
        text=s['text'].strip().replace('counterfactual worlds','Counterfactual Worlds').replace('Counterfactual worlds','Counterfactual Worlds')
        caps.append((s['start']+shift,s['end']+shift+.12,text))
    (DOCS/'captions.srt').write_text('\n'.join(f'{i+1}\n{srt_time(s)} --> {srt_time(e)}\n{t}\n' for i,(s,e,t) in enumerate(caps)))
    ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Arial,38,&H00FFFFFF,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,0,0,1,0,0,2,80,80,19,1
Style: Label,Arial,20,&H00CAE7DC,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,1,0,1,0,0,7,35,35,967,1
Style: Note,Arial,18,&H00ADBDBF,&H00FFFFFF,&H000B151D,&H000B151D,0,0,0,0,100,100,0,0,1,0,0,9,35,35,967,1
Style: Quote,Arial,35,&H00FFFFFF,&H00FFFFFF,&H00151D0B,&H00151D0B,0,0,0,0,100,100,0,0,3,16,0,7,45,700,710,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    def event(s,e,style,text):
        return f'Dialogue: 0,{ass_time(s)},{ass_time(e)},{style},,0,0,0,,{text}\n'
    for s,e,t in caps:ass+=event(s,e,'Caption',t)
    for s in manifest:ass+=event(s['start'],s['end'],'Label',s['label'])
    ass+=event(0,60,'Note','RECORDED APP · EDITED TAKES · WAITS CUT · AI NARRATION')
    ass+=event(20,26,'Quote','ACTUAL ASTRA FEEDBACK · EXCERPT\\N“Closure is not certain.”')
    ass+=event(46,56,'Quote',"STUDENT’S REVISED CLAIM · EXCERPT\\N“Closure is possible, not inevitable.”\\N“A new patron could replace lost support.”")
    subs=OUT/'captions.ass';subs.write_text(ass)
    final=OUT/'counterfactual-worlds-60s.mp4'
    run(ff+['-i',silent,'-i',OUT/'voiceover-final.wav','-vf',f'ass={subs}',
       '-map','0:v','-map','1:a','-c:v','libx264','-preset','fast','-crf','19',
       '-c:a','aac','-b:a','192k','-af','loudnorm=I=-16:TP=-1.5:LRA=9',
       '-ar','48000','-t','60','-movflags','+faststart','-map_metadata','-1',final])
    print(final,flush=True)

if __name__=='__main__':main()
