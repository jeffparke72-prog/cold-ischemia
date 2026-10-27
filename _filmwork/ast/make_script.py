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
SA='AST statement on the HHS Kidney Care National Plan'
BD='AST board of directors page, myast.org'
A(seg('o1','open',0,0,'title',.5,kicker='American Society of Transplantation',lines=L(('"WELCOMES"','accent'),('A NATIONAL KIDNEY PLAN','ink')),**ch(-1),src=SA))
A(seg('o2','open',1,1,'title',.7,lines=L(('WE ARE','ink'),('NOT CLAPPING.','accent')),**ch(1,push=.2)))
A(seg('o3','open',2,2,'title',.7,lines=L(('A WELCOME','ink'),('IS NOT A PLAN.','accent')),**ch(-1)))
A(seg('read','statement',0,0,'title',.55,lines=L(('READ THE STATEMENT','ink'),('CLOSELY.','accent')),bg=NIGHT,src=SA))
A(seg('praised','statement',1,4,'list',.6,rows=[{"t":"PREVENTION"},{"t":"EARLY DETECTION"},{"t":"LIVING DONATION"},{"t":"LIVING DONOR CIRCLE OF EXCELLENCE"}],bg=NIGHT,src=SA))
A(seg('nonum','statement',5,5,'title',.8,lines=L(('A NUMBER ON','ink'),('NONE OF IT.','accent')),bg=NIGHT,src=SA))
A(seg('none','silence',0,2,'list',.8,rows=[{"t":"NO TARGET"},{"t":"NO DEADLINE"},{"t":"NO DOLLAR AMOUNT"}],bg=NIGHT,src=SA))
A(seg('norole','silence',3,3,'title',.9,lines=L(('NO ROLE FOR','ink'),('PATIENTS.','accent'),('CARE PARTNERS.','accent')),bg=NIGHT,src=SA))
SR='OPTN/SRTR 2024 Annual Data Report: Kidney'
A(seg('cost','cost',0,0,'title',.7,lines=L(('THAT SILENCE','ink'),('HAS A COST.','accent')),**ch(0,push=.2)))
A(seg('t4901','cost',1,1,'stat',.9,stat=dict(value=4901,label='Removed from the list: too sick to transplant',c='accent',sub=['2024']),bg=NIGHT,src=SR))
A(seg('d297','cost',2,2,'stat',.95,stat=dict(value=29.7,suffix='%',label='Deceased-donor kidneys discarded',c='accent',sub=['April 2024 - April 2025']),bg=NIGHT,src='Oki et al., WCN26 abstract, Kidney International Reports 2026'))
A(seg('whowill','cost',3,3,'title',.9,lines=L(('IF THEY WILL NOT','ink'),('PUT A NUMBER ON IT,','ink'),('WHO WILL?','accent')),bg=NIGHT))
A(seg('who','board',0,0,'title',.5,lines=L(('WHO SPEAKS','ink'),('FOR THIS FIELD?','accent')),**ch(-1,n=3),src=BD))
A(seg('b14','board',1,1,'stat',.55,stat=dict(value=14,label='AST board members',c='ink',sub=['Physicians, surgeons, scientists','One transplant nurse']),bg=NIGHT,src=BD))
A(seg('zero','board',2,2,'cards',.7,cards=[dict(big='0',head='Patient seats',c='accent',sub='Board of directors'),dict(big='0',head='Care partner seats',c='accent',sub='Board of directors')],bg=NIGHT,src=BD))
A(seg('nom','board',3,3,'title',.55,lines=L(('NOMINATIONS:','dim'),('ONLY MEMBERS WHO HAVE','ink'),('ATTENDED AST MEETINGS','accent')),bg=NIGHT,src='AST nominations page, myast.org'))
A(seg('door','board',4,4,'title',.7,lines=L(('THE DOOR OPENS','ink'),('FROM THE INSIDE.','accent')),bg=NIGHT))
A(seg('corp','industry',0,0,'title',.5,lines=L(('CORPORATE PARTNERS','ink'),('MEET THE BOARD','ink'),('EVERY YEAR.','accent')),bg=NIGHT,src='AST Corporate Affiliates Program page, myast.org'))
A(seg('pat','industry',1,1,'cards',.5,cards=[dict(big='TOOLKIT',head='A caregiver toolkit',c='ink'),dict(big='LINK',head='To register as a donor',c='ink')],bg=NIGHT))
A(seg('seat','industry',2,2,'title',.7,lines=L(('ONE SIDE: A SEAT','ink'),('THE OTHER: A HANDOUT.','accent')),bg=NIGHT))
A(seg('inc','quote',0,0,'title',.6,lines=L(('THE SOCIETY KNOWS','ink'),('WHAT INCENTIVES DO.','accent')),**ch(-1,n=3)))
A(seg('q2020','quote',1,1,'quote',.65,quote=dict(text='"For-profit organizations inherently are incentivized to prolong dialysis over offering transplantation."',by='AST position statement on the BETTER Kidney Care Act, 2020',size=60),captions=False,bg=NIGHT))
A(seg('words','quote',2,2,'title',.7,lines=L(('THEIR WORDS.','accent')),bg=NIGHT))
A(seg('six','quote',3,3,'list',.9,rows=[{"t":"WHERE IS THE FIX?","s":"Six years later"},{"t":"WHERE IS THE NUMBER?"},{"t":"WHERE IS THE DEADLINE?"}],bg=NIGHT))
A(seg('dir1','plan',0,0,'title',.8,lines=L(('THE PLAN IT APPLAUDED','ink'),('SETS DIRECTION.','accent')),bg=NIGHT))
A(seg('dir2','plan',1,1,'title',.85,lines=L(('NO RULES.','accent'),('NO DEADLINES.','accent')),bg=NIGHT))
A(seg('dir3','plan',2,2,'title',.9,lines=L(('CLAPPING FOR IT','ink'),('COSTS THEM NOTHING.','accent')),bg=NIGHT))
A(seg('dm0','demands',0,0,'title',.9,lines=L(('WHAT LEADERSHIP','ink'),('WOULD LOOK LIKE.','accent')),bg=NIGHT))
A(seg('dm1','demands',1,1,'title',.9,kicker='Demand one',lines=L(('PATIENTS AND CARE PARTNERS','ink'),('ON THE BOARD. FULL VOTES.','accent')),bg=NIGHT))
A(seg('dm2','demands',2,2,'title',.9,kicker='Demand two',lines=L(('A DATED, PUBLIC TARGET','ink'),('FOR CUTTING DISCARDS.','accent')),bg=NIGHT))
A(seg('dm3','demands',3,3,'title',.95,kicker='Demand three',lines=L(('REAL FUNDING FOR','ink'),('PERFUSION AND PRESERVATION.','accent')),bg=NIGHT))
A(seg('dm4','demands',4,4,'title',1,lines=L(('EVERY YEAR, A COUNT:','ink'),('LISTED PATIENTS WHO DIE','accent'),('OR ARE REMOVED AS TOO SICK.','accent')),bg=NIGHT))
A(seg('f1','final',0,0,'title',1,lines=L(('THIS IS NOT','ink'),('LEADERSHIP.','accent')),bg=NIGHT,hits=[.05]))
A(seg('f2','final',1,1,'title',1,lines=L(('IT IS PUBLIC','ink'),('RELATIONS.','accent')),bg=NIGHT,hits=[.05]))
A(seg('f3','final',2,2,'title',1,lines=L(('WE HAVE BURIED','ink'),('TOO MANY PEOPLE','ink'),('TO KEEP PRETENDING.','accent')),bg=NIGHT))
G=[[B['statement']['t0']+4,B['cost']['t1']+.5,112,.9],[B['plan']['t0']-.5,B['final']['t1']+1.5,116,1.0]]
J=dict(pace=2.6,gap=0,lead=0,style=dict(bar=110,ink='#ffffff',accent='#ff2a2a',accent2='#ffffff',alert='#ff2a2a',dim='rgba(255,255,255,.55)',tone=[-12,-18,-28]),
 music=dict(mood='ominous',dark=True,level=.95,piano=True,heartbeat=False,lift=False,booms=[1.25],groove=G),
 open=dict(logo='/_filmwork/ast/img/logo.png',w=820,y=160,**{'from':.9},until=4.2),
 end=dict(logo='/_filmwork/ast/img/logo.png',logoW=700,logoY=50,hold=6.3,sub='Cold Ischemia Foundation',lines=['coldischemia.foundation']),segments=S)
json.dump(J,open('script.json','w'),indent=1);print(len(S),'segments; last t1',S[-1]['t0']+S[-1]['dur'])
