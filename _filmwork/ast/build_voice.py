import json,sys,numpy as np,soundfile as sf
from kokoro_onnx import Kokoro
from beats import BEATS
VOICE=sys.argv[1] if len(sys.argv)>1 else 'am_onyx'; SPEED=float(sys.argv[2]) if len(sys.argv)>2 else .82
k=Kokoro('/tmp/kk/model.onnx','/tmp/kk/voices.bin'); SR=24000
LEAD=4.2
out=[];t=LEAD;tl=[]
for b in BEATS:
    t+=b["gap"]*0.5;bt0=t;sents=[]
    for i,s in enumerate(b['s']):
        n=len(s.replace('.','').split())
        sp=SPEED*(0.92 if n<=4 else 1.0)
        a,_=k.create(s,voice=VOICE,speed=sp,lang='en-us');a=np.asarray(a,dtype=np.float64)
        f=int(.02*SR);a[:f]*=np.linspace(0,1,f);a[-f:]*=np.linspace(1,0,f)
        if i>0:t+= .55 if n<=4 else .3
        out.append((t,a));sents.append(dict(t=s,a=round(t,2),b=round(t+len(a)/SR,2)));t+=len(a)/SR
    tl.append(dict(id=b['id'],t0=round(bt0,2),t1=round(t,2),cc=sents))
END=t;N=int((END+1)*SR);y=np.zeros(N)
for st,a in out:s=int(st*SR);y[s:s+len(a)]+=a
sf.write('voice_raw.wav',y,SR);json.dump(dict(end=END,beats=tl),open('timeline.json','w'),indent=1)
print('speech ends',round(END,1))
