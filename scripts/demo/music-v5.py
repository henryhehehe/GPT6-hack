#!/usr/bin/env python3
"""Original 60-second instrumental: warm pads, soft keys and a restrained pulse."""
from pathlib import Path
import numpy as np, wave, json
SR=48000;DUR=60;N=SR*DUR;rng=np.random.default_rng(511)
mix=np.zeros((N,2),np.float32)
def hz(m):return 440*2**((m-69)/12)
def add(sig,start,amp=1,pan=0):
 i=round(start*SR);n=min(len(sig),N-i)
 if n<=0:return
 mix[i:i+n,0]+=sig[:n]*amp*np.sqrt((1-pan)/2)
 mix[i:i+n,1]+=sig[:n]*amp*np.sqrt((1+pan)/2)
def tone(note,duration,kind):
 t=np.arange(round(duration*SR))/SR;f=hz(note)
 if kind=='pad':
  y=sum(np.sin(2*np.pi*f*det*t+phase)*a for det,phase,a in [(1,0,.55),(.998,.7,.23),(1.002,1.5,.22),(2,0,.10),(3,.2,.025)])
  env=np.minimum(t/.7,1)*np.minimum((duration-t)/1.5,1)
 elif kind=='key':
  y=sum(a*np.sin(2*np.pi*f*k*np.sqrt(1+.00005*k*k)*t)*np.exp(-t/(1.8/(k**.7))) for k,a in [(1,1),(2,.28),(3,.12),(4,.04)])
  env=(1-np.exp(-t/.008))*np.minimum((duration-t)/.2,1)
 else:
  y=np.sin(2*np.pi*f*t)+.12*np.sin(4*np.pi*f*t);env=np.minimum(t/.04,1)*np.exp(-t/1.2)*np.minimum((duration-t)/.2,1)
 return (y*env).astype(np.float32)
# 80 BPM, twenty 3-second bars; Em9–Cmaj7–Gadd9–Dsus2, with a resolved outro.
chords=[[52,55,59,62,66],[48,55,59,64],[43,55,57,59,62],[50,57,62,64]]
for bar in range(20):
 chord=chords[bar%4] if bar<18 else ([48,55,59,64] if bar==18 else [52,55,59,64,66])
 start=bar*3
 for j,note in enumerate(chord):add(tone(note,4.3,'pad'),start,.025,(j-2)/3)
 add(tone(chord[0]-12,2.8,'bass'),start,.065)
 # Sparse syncopated upper notes keep attention on the voice.
 for j,beat in enumerate([0,.75,1.875,2.625]):
  note=chord[(j+bar//4)%len(chord)]+12
  key=tone(note,2.5,'key');pan=(-.35 if j%2 else .35)
  add(key,start+beat,.035,pan);add(key,start+beat+.375,.009,-pan);add(key,start+beat+.75,.004,pan)
 # Airy tick and soft low pulse, introduced after the opening sentence.
 if 2<=bar<18:
  for beat in [0,1.5]:
   t=np.arange(round(.3*SR))/SR;phase=2*np.pi*(44*t+30*.025*(1-np.exp(-t/.025)))
   add((np.sin(phase)*np.exp(-t/.08)*(1-np.exp(-t/.003))).astype(np.float32),start+beat,.035)
  for beat in [.75,2.25]:
   noise=rng.normal(0,1,round(.07*SR));noise=np.diff(noise,prepend=0);t=np.arange(len(noise))/SR
   add((noise*np.exp(-t/.012)*np.minimum(t/.003,1)).astype(np.float32),start+beat,.0025,.4)
# Gentle stereo ambience; no samples or third-party recordings are used.
for delay,amt in [(.113,.10),(.197,.07),(.311,.045)]:
 k=round(delay*SR);mix[k:]+=mix[:-k,::-1].copy()*amt
fade=np.minimum(np.arange(N)/SR/1.4,1)*np.minimum((DUR-np.arange(N)/SR)/2.2,1)
mix*=fade[:,None];mix*=.45/max(.01,float(np.max(np.abs(mix))))
out=Path(__file__).resolve().parents[2]/'output/demo/v5';out.mkdir(parents=True,exist_ok=True)
with wave.open(str(out/'music-original.wav'),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
(out/'music-provenance.json').write_text(json.dumps({'title':'A Question Opens','composition':'Original synthesized instrumental created for this demo','tempoBPM':80,'seconds':60,'thirdPartySamples':False,'instruments':['soft synthesized keys','warm stereo pad','subtle bass and percussion'],'generator':'scripts/demo/music-v5.py','mixIntent':'Quiet beneath narration, gently lifted in pauses'},indent=2)+'\n')
print('Composed original 60-second music bed.')
