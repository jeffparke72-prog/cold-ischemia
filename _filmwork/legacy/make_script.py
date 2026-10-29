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
def bgx(f,dim=.7,blur=6,pan='left'): return {"src":"/"+f,"dim":dim,"blur":blur,"pan":pan,"zoom":.06}
STRESS=bgx('stress.png',.62,5);NIGHT2=bgx('night-shift.png',.8,12);HERO=bgx('hero-banner.jpg',.62,3,'right');RES=bgx('research-banner.png',.66,4,'right')
SIT=bgx('the-situation-room.png',.6,2,'left');BUND=bgx('cif-resource-bundle.png',.66,4,'right');MARCH=bgx('march-for-care.jpg',.62,4,'up')
IND='Cold Ischemia Foundation independence pledge, independence.html'
A(seg('o1','open',0,1,'title',.5,kicker='Dramatized narration / composite patient / AI voice',lines=L(('29 YEARS OLD.','ink'),('8 MONTHS AFTER A KIDNEY.','accent')),bg=STRESS))
A(seg('o2','open',2,2,'title',.7,lines=L(('AN INFECTION.','accent'),('THE KIDNEY IS FAILING.','ink')),bg=STRESS))
A(seg('o3','open',3,3,'title',.7,lines=L(('NOBODY EXPLAINED','ink'),('HOW THE SYSTEM WORKS.','accent')),bg=NIGHT2))
A(seg('s1','system',0,0,'list',.55,rows=[{"t":"PAMPHLETS"},{"t":"CONSENT FORMS"},{"t":"A LIST OF PHONE NUMBERS"}],bg=NIGHT2))
A(seg('s2','system',1,1,'title',.7,lines=L(('NOBODY TOLD ME','ink'),('I HAD RIGHTS.','accent')),bg=NIGHT2))
A(seg('s3','system',2,2,'title',.7,lines=L(('NOBODY TAUGHT ME','ink'),('WHAT TO ASK.','accent')),bg=NIGHT2))
A(seg('s4','system',3,3,'title',.8,lines=L(('WHAT DOES THE SYSTEM DO','ink'),('WITH A PATIENT','ink'),('WHO STAYS QUIET?','accent')),bg=NIGHT2))
A(seg('f1','found',0,0,'title',.7,kicker='Then',lines=L(('COLD ISCHEMIA','ink'),('FOUNDATION.','accent')),bg=HERO))
A(seg('f2','found',1,1,'cards',.7,cards=[dict(big='3',head='Kidney transplants',c='accent',sub='Jeff Parke, patient'),dict(big='ALL 3',head='Beside him: Marie',c='ink',sub='His wife, his care partner')],bg=HERO))
A(seg('t0','tools',0,0,'title',.75,lines=L(('TOOLS. GUIDES.','ink'),('RESEARCH. FREE.','accent')),bg=BUND,src='Command Center and terms, coldischemia.foundation'))
A(seg('t1','tools',1,1,'title',.8,kicker='14 daily lessons / 100 scenarios',lines=L(('THE UNSPOKEN','ink'),('CURRICULUM.','accent')),bg=RES,src='test-your-knowledge.html'))
A(seg('t2','tools',2,2,'title',.85,kicker='Free guide',lines=L(('THE FIRST','ink'),('24 HOURS.','accent')),bg=NIGHT2,src='free-guide.html'))
A(seg('t3','tools',3,3,'title',.85,lines=L(('THE','ink'),('SITUATION ROOM.','accent')),bg=SIT,src='situation-room.html'))
A(seg('t4','tools',4,4,'title',.85,kicker='Communications handbook',lines=L(('THE AUTHORITY','ink'),('YOU ALREADY HAVE.','accent')),bg=RES,src='Communications Handbook, Research Library'))
A(seg('t5','tools',5,5,'stat',.9,stat=dict(value=109,suffix=' PAGES',label='Not a Spare: the living kidney donor field guide',c='accent'),bg=BUND,src='living-donor-guide-full.html'))
A(seg('d0','diff',0,0,'title',.8,lines=L(('WHAT MAKES IT','ink'),('DIFFERENT.','accent')),bg=NIGHT2))
A(seg('d1','diff',1,1,'list',.85,rows=[{"t":"NO DONATIONS"},{"t":"NO DRUG OR DEVICE MAKER MONEY"},{"t":"NO DIALYSIS COMPANY MONEY"},{"t":"NO INSURER OR HOSPITAL MONEY"}],bg=NIGHT2,src=IND))
A(seg('d2','diff',2,2,'title',.8,lines=L(('FEES ONLY FOR SERVICES','ink'),('YOU REQUEST.','accent'),('AT POSTED RATES.','ink')),bg=NIGHT2,src='services.html'))
A(seg('d3','diff',3,3,'title',.9,lines=L(('DON\'T TAKE','ink'),('ITS WORD FOR IT.','accent')),bg=NIGHT2))
A(seg('d4','diff',4,4,'list',.95,rows=[{"t":"WHO PAYS YOU?"},{"t":"WHO GOVERNS YOU?"},{"t":"WHO SHAPES YOUR MESSAGE?"},{"t":"WHAT CAN'T YOU SAY?"},{"t":"WHO DO YOU ANSWER TO?"}],bg=NIGHT2,src=IND))
A(seg('d5','diff',5,5,'title',.95,lines=L(('THEN ASK US','ink'),('THE SAME FIVE.','accent')),bg=NIGHT2))
A(seg('l0','leaders',0,0,'title',.85,lines=L(('WE ARE LOOKING','ink'),('FOR LEADERS.','accent')),bg=MARCH))
A(seg('l1','leaders',1,1,'title',.9,lines=L(('PATIENTS QUIET TOO LONG.','ink'),('CARE PARTNERS','ink'),('TIRED OF BEING INVISIBLE.','accent')),bg=MARCH))
A(seg('l2','leaders',2,2,'title',.9,lines=L(('LEARN TO SPEAK UP.','ink'),('HELP THE NEXT PATIENT.','accent')),bg=MARCH))
A(seg('l3','leaders',3,3,'list',.9,rows=[{"t":"FREE TRAINING","s":"Ten modules"},{"t":"A REAL PERSON","s":"Reads your application"}],bg=MARCH,src='cif-volunteer-page.html, volunteer-training.html'))
A(seg('c0','close',0,0,'title',.5,lines=L(('I MAY NOT GET','ink'),('MY KIDNEY BACK.','accent')),**ch(0,push=.2)))
A(seg('c1','close',1,1,'title',.6,lines=L(('WHAT I WISH','ink'),('SOMEONE HAD TOLD ME.','accent')),**ch(-1)))
A(seg('c2','close',2,2,'title',.8,lines=L(('LEARN YOUR RIGHTS','ink'),('BEFORE YOU NEED THEM.','accent')),bg=NIGHT2))
A(seg('c3','close',3,3,'title',.85,lines=L(('ASK','ink'),('WHO PAYS.','accent')),bg=NIGHT2))
A(seg('c4','close',4,4,'title',.9,lines=L(('FIND THE PEOPLE','ink'),('WHO WILL STAND BESIDE YOU.','accent')),bg=NIGHT2,hits=[.05]))
A(seg('c5','close',5,5,'title',1,lines=L(('COLDISCHEMIA.FOUNDATION','accent')),bg=NIGHT2,hits=[.05]))
G=[[B['tools']['t0']-.5,B['diff']['t1']+.5,108,.9],[B['leaders']['t0']-.5,B['close']['cc'][2]['b'],114,1.0]]
J=dict(pace=2.6,gap=0,lead=0,style=dict(bar=110,ink='#ffffff',accent='#ff2a2a',accent2='#ffffff',alert='#ff2a2a',dim='rgba(255,255,255,.55)',tone=[-12,-18,-28]),
 music=dict(mood='ominous',dark=True,level=.95,piano=True,heartbeat=False,lift=False,booms=[1.25],groove=G),
 open=dict(logo='/_filmwork/legacy/img/logo.png',w=820,y=160,**{'from':.9},until=4.2),
 bug=dict(src='/_filmwork/legacy/img/logo-crop.png',x=88,y=124,w=200,**{'in':5}),
 end=dict(logo='/_filmwork/legacy/img/logo.png',logoW=700,logoY=50,hold=6.3,sub='Cold Ischemia Foundation',lines=['coldischemia.foundation','Dramatized narration: a composite, not a real patient. AI-generated voice.'],strong=1),segments=S)
json.dump(J,open('script.json','w'),indent=1);print(len(S),'segments; last t1',S[-1]['t0']+S[-1]['dur'])
