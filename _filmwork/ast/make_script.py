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
MC='AST membership categories page, myast.org'
NM='AST board nominations criteria, myast.org'
BD='AST board of directors page, myast.org'
A(seg('o1','open',0,1,'title',.6,kicker='American Society of Transplantation',lines=L(('THE AST HAD','ink'),('ONE JOB.','accent')),**ch(-1)))
A(seg('o2','open',2,2,'title',.7,lines=L(('IT ISSUED','ink'),('A STATEMENT.','accent')),**ch(1,push=.2),src=SA))
A(seg('o3','open',3,3,'list',.8,rows=[{"t":"NO TARGET"},{"t":"NO DEADLINE"},{"t":"NO DOLLAR AMOUNT"},{"t":"NO ROLE FOR PATIENTS"}],bg=NIGHT,src=SA))
A(seg('o4','open',4,4,'title',.8,lines=L(('WHO IS THE AST','ink'),('BUILT FOR?','accent')),bg=NIGHT))
A(seg('door','dues',0,1,'title',.6,lines=L(('START WITH','ink'),('THE DOOR.','accent')),**ch(-1,n=3)))
A(seg('d485','dues',2,2,'stat',.85,stat=dict(prefix='$',value=485,suffix=' / YEAR',label='Doctoral membership, as listed',c='accent'),bg=NIGHT,src=MC))
A(seg('work','dues',3,3,'title',.7,lines=L(('MEMBERSHIP IS BUILT AROUND','ink'),('PEOPLE WHO WORK','ink'),('IN TRANSPLANTATION.','accent')),bg=NIGHT,src='AST membership categories page and bylaws, myast.org'))
A(seg('notlist','dues',4,4,'title',.85,lines=L(('BEING A PATIENT','ink'),('IS NOT ON THE LIST.','accent')),bg=NIGHT))
A(seg('aff','industry',0,0,'title',.7,kicker='2025',lines=L(('AN AFFILIATE TIER FOR','ink'),('INDUSTRY WITH A BUSINESS','accent'),('OR STRATEGIC INTEREST.','accent')),bg=NIGHT,src='AST affiliate membership page, myast.org'))
A(seg('corp','industry',1,1,'title',.6,lines=L(('CORPORATE PARTNERS','ink'),('MEET THE BOARD','ink'),('EVERY YEAR.','accent')),bg=NIGHT,src='AST Corporate Affiliates Program page, myast.org'))
A(seg('pat','industry',2,2,'cards',.6,cards=[dict(big='TOOLKIT',head='For patients',c='ink'),dict(big='LINK',head='To register as a donor',c='ink')],bg=NIGHT))
A(seg('now','board',0,0,'title',.55,lines=L(('NOW','ink'),('THE BOARD.','accent')),**ch(-1,n=3)))
A(seg('crit','board',1,1,'list',.8,rows=[{"t":"5 YEARS A MEMBER","s":"In good standing"},{"t":"ATTENDED AST MEETINGS"},{"t":"LEADERSHIP INSIDE THE AST"},{"t":"TWO LETTERS OF REFERENCE"}],bg=NIGHT,src=NM))
A(seg('five','board',2,2,'stat',.8,stat=dict(value=5,suffix=' YEARS',label='Of dues and meetings, just to be considered',c='accent'),bg=NIGHT,src=NM))
A(seg('zero','board',3,3,'cards',.8,cards=[dict(big='0',head='Patient seats',c='accent',sub='Board of directors'),dict(big='0',head='Care partner seats',c='accent',sub='Board of directors')],bg=NIGHT,src=BD))
A(seg('club','board',4,4,'title',.85,lines=L(('A BOARD THAT STAYS','ink'),('INSIDE THE CLUB.','accent')),bg=NIGHT))
A(seg('fol','network',0,0,'title',.6,lines=L(('FOLLOW','ink'),('THE STRUCTURE.','accent')),**ch(-1,n=3)))
A(seg('three','network',1,1,'list',.8,rows=[{"t":"DUES IN"},{"t":"MEETINGS"},{"t":"INDUSTRY AT THE TABLE"}],bg=NIGHT))
A(seg('net','network',2,2,'title',.8,lines=L(('A NETWORK THAT','ink'),('CHARGES TO ENTER.','accent')),bg=NIGHT))
A(seg('edge','network',3,3,'title',.85,lines=L(('PATIENTS AT THE EDGE.','accent'),('HOLDING A TOOLKIT.','ink')),bg=NIGHT))
A(seg('q2020','quote',0,0,'quote',.65,quote=dict(text='"For-profit organizations inherently are incentivized to prolong dialysis over offering transplantation."',by='AST position statement on the BETTER Kidney Care Act, 2020',size=60),captions=False,bg=NIGHT))
A(seg('words','quote',1,1,'title',.7,lines=L(('THEIR WORDS.','accent')),bg=NIGHT))
A(seg('test','quote',2,2,'title',.9,lines=L(('NOW APPLY THAT TEST','ink'),('TO THE AST.','accent')),bg=NIGHT))
A(seg('dir1','plan',0,0,'title',.8,lines=L(('THE FEDERAL PLAN:','ink'),('NO RULES. NO DEADLINES.','accent')),bg=NIGHT))
A(seg('dir2','plan',1,1,'title',.85,lines=L(('A SOCIETY THAT PUT','ink'),('PATIENTS FIRST','ink'),('WOULD DEMAND BOTH.','accent')),bg=NIGHT))
A(seg('dir3','plan',2,2,'title',.95,lines=L(('THIS ONE ISSUED','ink'),('A STATEMENT.','accent')),bg=NIGHT))
A(seg('dm0','demands',0,0,'title',.9,lines=L(('SO HERE IS','ink'),('WHAT WE DEMAND.','accent')),bg=NIGHT))
A(seg('dm1','demands',1,1,'title',.9,kicker='Demand one',lines=L(('PATIENTS AND CARE PARTNERS','ink'),('ON THE BOARD. FULL VOTES.','accent')),bg=NIGHT))
A(seg('dm2','demands',2,2,'title',.9,kicker='Demand two',lines=L(('NOMINATIONS OPEN TO PEOPLE','ink'),('OUTSIDE THE DUES-PAYING CLUB.','accent')),bg=NIGHT))
A(seg('dm3','demands',3,3,'title',.95,kicker='Demand three',lines=L(('A PUBLIC ACCOUNT OF','ink'),('EVERY DOLLAR FROM INDUSTRY.','accent')),bg=NIGHT))
A(seg('dm4','demands',4,4,'title',1,kicker='Demand four',lines=L(('DATED, PUBLIC TARGETS','ink'),('FOR THE OUTCOMES','accent'),('IT CLAIMS TO CARE ABOUT.','accent')),bg=NIGHT))
A(seg('f1','final',0,0,'title',1,lines=L(('THIS IS NOT','ink'),('LEADERSHIP.','accent')),bg=NIGHT,hits=[.05]))
A(seg('f2','final',1,1,'title',1,lines=L(('IT IS PUBLIC','ink'),('RELATIONS.','accent')),bg=NIGHT,hits=[.05]))
A(seg('f3','final',2,2,'title',1,lines=L(('WE HAVE BURIED','ink'),('TOO MANY PEOPLE','ink'),('TO KEEP PRETENDING.','accent')),bg=NIGHT))
G=[[B['dues']['t0']+2,B['board']['t1']+.5,112,.9],[B['plan']['t0']-.5,B['final']['t1']+1.5,116,1.0]]
J=dict(pace=2.6,gap=0,lead=0,style=dict(bar=110,ink='#ffffff',accent='#ff2a2a',accent2='#ffffff',alert='#ff2a2a',dim='rgba(255,255,255,.55)',tone=[-12,-18,-28]),
 music=dict(mood='ominous',dark=True,level=.95,piano=True,heartbeat=False,lift=False,booms=[1.25],groove=G),
 open=dict(logo='/_filmwork/ast/img/logo.png',w=820,y=160,**{'from':.9},until=4.2),
 end=dict(logo='/_filmwork/ast/img/logo.png',logoW=700,logoY=50,hold=6.3,sub='Cold Ischemia Foundation',lines=['coldischemia.foundation']),segments=S)
json.dump(J,open('script.json','w'),indent=1);print(len(S),'segments; last t1',S[-1]['t0']+S[-1]['dur'])
