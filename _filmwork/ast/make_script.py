import json
TL=json.load(open('timeline.json'));B={b['id']:b for b in TL['beats']}
NIGHT={"src":"/night-shift.png","dim":.84,"blur":16,"pan":"left","zoom":.05}
def seg(id,bid,a,b,typ,intensity=.5,**kw):
    cc=B[bid]['cc'][a:b+1];s=dict(id=id,type=typ,text=' '.join(x['t'] for x in cc),t0=round(cc[0]['a']-.1,2),dur=round(cc[-1]['b']-cc[0]['a']+.4,2),cc=[dict(t=x['t'],a=x['a'],b=x['b']) for x in cc],intensity=intensity)
    s.update(kw);return s
L=lambda *a:[dict(t=t,c=(c if c else 'ink')) for t,c in a]
S=[]
A=S.append
ch=lambda lit=-1,n=4,**k:dict(chairs=dict(lit=lit,n=n,**k))
A(seg('w1','wait',0,0,'title',.3,lines=L(('REFERRAL.',None)),**ch(),captions=False))
A(seg('w2','wait',1,1,'title',.3,lines=L(('REFERRAL.','dim'),('EVALUATION.',None)),**ch(),captions=False))
A(seg('w3','wait',2,2,'title',.35,lines=L(('REFERRAL.','dim'),('EVALUATION.','dim'),('WAITING.',None)),**ch(),captions=False))
A(seg('w4','wait',3,3,'title',.4,lines=L(('A PHONE THAT','accent'),('MAY NEVER RING.','accent')),**ch(2,push=.2)))
A(seg('wel','welcomes',0,1,'title',.55,kicker='American Society of Transplantation',lines=L(('"WELCOMES."','accent')),**ch(-1),src='AST statement on the HHS Kidney Care National Plan'))
A(seg('tonight','welcomes',2,2,'title',.5,lines=L(('THE PERSON IN THE CHAIR','ink'),('TONIGHT.','accent')),**ch(1,push=.2)))
ST_='AST statement on the HHS Kidney Care National Plan'
A(seg('praised','praised',0,3,'list',.6,rows=[{"t":"PREVENTION"},{"t":"EARLY DETECTION"},{"t":"LIVING DONATION"},{"t":"LIVING DONOR CIRCLE OF EXCELLENCE"}],bg=NIGHT,src=ST_))
A(seg('lot','praised',4,4,'title',.6,lines=L(('A LOT OF','ink'),('WELCOMING.','accent')),bg=NIGHT,src=ST_))
A(seg('left','missing',0,0,'title',.6,lines=L(('WHAT DID THE STATEMENT','ink'),('LEAVE OUT?','accent')),bg=NIGHT,src=ST_))
A(seg('none','missing',1,3,'list',.75,rows=[{"t":"NO NUMBER"},{"t":"NO DEADLINE"},{"t":"NO FUNDED COMMITMENT"}],bg=NIGHT,src=ST_))
A(seg('norole','missing',4,4,'title',.85,lines=L(('NO ROLE FOR','ink'),('PATIENTS.','accent'),('CARE PARTNERS.','accent')),bg=NIGHT,src=ST_))
SR='OPTN/SRTR 2024 Annual Data Report: Kidney'
A(seg('t4901','cost',0,0,'stat',.9,stat=dict(value=4901,label='Removed from the list: too sick to transplant',c='accent',sub=['2024']),bg=NIGHT,src=SR))
A(seg('d297','cost',1,1,'stat',.95,stat=dict(value=29.7,suffix='%',label='Deceased-donor kidneys discarded',c='accent',sub=['April 2024 - April 2025']),bg=NIGHT,src='Oki et al., WCN26 abstract, Kidney International Reports 2026'))
A(seg('where','cost',2,4,'list',.95,rows=[{"t":"PERFUSION?"},{"t":"FASTER PLACEMENT?"},{"t":"ACCOUNTABILITY?","s":"When centers turn organs down"}],bg=NIGHT))
A(seg('who','board',0,0,'title',.5,lines=L(('WHO RUNS','ink'),('THE AST?','accent')),**ch(-1,n=3),src='AST board of directors page, myast.org'))
A(seg('b14','board',1,1,'stat',.55,stat=dict(value=14,label='AST board members',c='ink'),bg=NIGHT,src='AST board of directors page, myast.org'))
A(seg('prof','board',2,2,'title',.55,lines=L(('PHYSICIANS','ink'),('SURGEONS','ink'),('SCIENTISTS','ink'),('ONE TRANSPLANT NURSE','accent')),bg=NIGHT,src='AST board of directors page, myast.org'))
A(seg('zero','board',3,3,'cards',.7,cards=[dict(big='0',head='Patient seats',c='accent',sub='Board of directors'),dict(big='0',head='Care partner seats',c='accent',sub='Board of directors')],bg=NIGHT,src='AST board of directors page, myast.org'))
A(seg('nom','board',4,4,'title',.55,lines=L(('NOMINATIONS:','dim'),('ONLY MEMBERS WHO HAVE','ink'),('ATTENDED AST MEETINGS','accent')),bg=NIGHT,src='AST nominations page, myast.org'))
A(seg('corp','industry',0,0,'title',.5,lines=L(('CORPORATE PARTNERS','ink'),('MEET THE BOARD','ink'),('EVERY YEAR.','accent')),bg=NIGHT,src='AST Corporate Affiliates Program page, myast.org'))
A(seg('pat','industry',1,1,'cards',.5,cards=[dict(big='TOOLKIT',head='A caregiver toolkit',c='ink'),dict(big='LINK',head='To register as a donor',c='ink')],bg=NIGHT))
A(seg('q2020','quote',0,0,'quote',.6,quote=dict(text='"For-profit organizations inherently are incentivized to prolong dialysis over offering transplantation."',by='AST position statement on the BETTER Kidney Care Act, 2020',size=60),captions=False,bg=NIGHT))
A(seg('six','quote',1,1,'stat',.7,stat=dict(value=6,suffix=' YEARS',label='Since they wrote it',c='accent'),bg=NIGHT))
A(seg('fix','quote',2,2,'title',.7,lines=L(('WHERE IS THE FIX?','accent')),**ch(-1,n=3)))
A(seg('dir1','direction',0,0,'title',.8,lines=L(('POLICY DIRECTION.',None)),bg=NIGHT))
A(seg('dir2','direction',1,1,'title',.85,lines=L(('DIRECTION','ink'),('COSTS NOTHING.','accent')),bg=NIGHT))
A(seg('dir3','direction',2,2,'title',.9,lines=L(('DIRECTION HAS','ink'),('NO DEADLINE.','accent')),bg=NIGHT))
A(seg('dir4','direction',3,3,'title',.95,lines=L(('AND THE AST','ink'),('APPLAUDED.','accent')),bg=NIGHT))
A(seg('dm1','demands',0,0,'title',.9,kicker='Demand one',lines=L(('PATIENTS AND CARE PARTNERS','ink'),('ON THE BOARD. FULL VOTES.','accent')),bg=NIGHT))
A(seg('dm2','demands',1,1,'title',.9,kicker='Demand two',lines=L(('A DATED TARGET','ink'),('FOR CUTTING DISCARDS.','accent')),bg=NIGHT))
A(seg('dm3','demands',2,2,'title',.95,kicker='Demand three',lines=L(('REAL FUNDING FOR','ink'),('PERFUSION AND PRESERVATION.','accent')),bg=NIGHT))
A(seg('dm4','demands',3,3,'title',1,lines=L(('REPORT EVERY YEAR:','ink'),('LISTED PATIENTS WHO DIE','accent'),('OR ARE REMOVED AS TOO SICK.','accent')),bg=NIGHT))
A(seg('f1','final',0,0,'title',1,lines=L(('THIS IS NOT','ink'),('LEADERSHIP.','accent')),bg=NIGHT,hits=[.05]))
A(seg('f2','final',1,1,'title',1,lines=L(('IT IS PUBLIC','ink'),('RELATIONS.','accent')),bg=NIGHT,hits=[.05]))
A(seg('f3','final',2,2,'title',1,lines=L(('WE HAVE BURIED','ink'),('TOO MANY PEOPLE','ink'),('TO KEEP PRETENDING.','accent')),bg=NIGHT))
G=[[B['praised']['t0']+6,B['cost']['t1']+.5,112,.9],[B['direction']['t0']-.5,B['final']['t1']+1.5,116,1.0]]
J=dict(pace=2.6,gap=0,lead=0,style=dict(bar=110,ink='#ffffff',accent='#ff2a2a',accent2='#ffffff',alert='#ff2a2a',dim='rgba(255,255,255,.55)',tone=[-12,-18,-28]),
 music=dict(mood='ominous',dark=True,level=.95,piano=True,heartbeat=False,lift=False,booms=[1.25],groove=G),
 open=dict(logo='/_filmwork/ast/img/logo.png',w=820,y=160,**{'from':.9},until=4.2),
 end=dict(logo='/_filmwork/ast/img/logo.png',logoW=700,logoY=50,hold=6.3,sub='Cold Ischemia Foundation',lines=['coldischemia.foundation']),segments=S)
json.dump(J,open('script.json','w'),indent=1);print(len(S),'segments; last t1',S[-1]['t0']+S[-1]['dur'])
