import runpy,json,html,re,os
ns=runpy.run_path('build_voice.py');CT=ns['CT'];PH=ns['PH'];D=ns['D'];segs=ns['segs']
ROOT='/home/user/cold-ischemia/'
def vt(t,ms=True):
    h=int(t//3600);m=int(t%3600//60);s=t%60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace('.',',' if not ms else '.')
# captions
cues=[]
for i in range(len(PH)):
    a=PH[i]['s']+D;b=PH[i]['e']+D+.05
    cues.append((a,b,CT[i]))
open(ROOT+'cif-founder-message.vtt','w').write('WEBVTT\n\n'+'\n\n'.join(f"{vt(a)} --> {vt(b)}\n{t}" for a,b,t in cues)+'\n')
open(ROOT+'_filmwork/founder/founder-message.srt','w').write('\n\n'.join(f"{i+1}\n{vt(a,False)} --> {vt(b,False)}\n{t}" for i,(a,b,t) in enumerate(cues))+'\n')
# chapters
def mmss(t):
    t=int(t);return f"{t//60}:{t%60:02d}"
ch=[(0,'Welcome, and why I made this video'),(PH[7]['s']+D,'I see you: my story'),(PH[17]['s']+D,'Who we are: the Cold Ischemia Foundation'),(PH[32]['s']+D,'Why this video, and why now'),(PH[39]['s']+D,'The facts: kidney disease, dialysis and the money'),(PH[50]['s']+D,'Who pays for the voices that speak for patients'),(PH[60]['s']+D,'How we are different: the comparison table'),(PH[68]['s']+D,'What independence builds'),(PH[79]['s']+D,"Don't take my word for it: check for yourself"),(PH[88]['s']+D,'You have choices, and you are not alone')]
json.dump([(round(a,1),t) for a,t in ch],open(ROOT+'_filmwork/founder/chapters.json','w'))
print([ (mmss(a),t) for a,t in ch])
