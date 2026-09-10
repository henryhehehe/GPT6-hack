#!/usr/bin/env python3
import argparse,json,subprocess,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--window',required=True,type=int);p.add_argument('--seconds',type=int,default=45);p.add_argument('--name',default='full-take');p.add_argument('--version',default='v2');a=p.parse_args()
out=Path(__file__).resolve().parents[2]/'output/demo'/a.version/'raw';out.mkdir(parents=True,exist_ok=True)
movie=out/f'{a.name}.mov'
proc=subprocess.Popen(['/usr/sbin/screencapture','-v',f'-l{a.window}',f'-V{a.seconds}','-x',str(movie)])
metadata={'pid':proc.pid,'windowId':a.window,'startedEpoch':time.time(),'movie':str(movie),'maxSeconds':a.seconds}
(out/f'{a.name}-session.json').write_text(json.dumps(metadata,indent=2));print(json.dumps(metadata),flush=True)
proc.wait();print(json.dumps({'exit':proc.returncode,'bytes':movie.stat().st_size if movie.exists() else 0}),flush=True)
