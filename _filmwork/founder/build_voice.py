import json,re
PH=json.load(open('/tmp/pt/voice/phr_medium.json'))['phr']
D=2.0
CT={
0:"Good morning, everyone. This is Jeff Parke, as I have introduced myself many times, and hopefully the name starts to sound familiar.",
1:"I am the founder of the Cold Ischemia Foundation. I wanted to make this video",
2:"to ensure that we all understand why we exist and to send this personal message directly",
3:"from me. So if you're watching this, kidney disease has probably walked into your life",
4:"or into the life of someone you love. Maybe you're on dialysis. Maybe you're waiting for the call that just has not come.",
5:"Maybe you're the care partner, the one driving, scheduling,",
6:"filling the pillbox and holding the whole family together. You see, I want to start with what nobody said to me:",
7:"that I do see you. I truly, deeply,",
8:"transparently see you. I'm a patient myself.",
9:"I've shared my journey. I've dealt with the system for almost three decades.",
10:"I know what the chair is like. I know how the waiting goes. I've waited to have my third transplant for 10 years.",
11:"I know what it feels like to be handed a pamphlet when what you needed was an answer.",
12:"Just an answer. A conversation with a social worker or the transplant coordinator. Something you didn't receive.",
13:"And I know the moment you realize that nobody's coming to explain it. And like myself,",
14:"you are left to figure everything out yourself.",
15:"This is exactly why I wanted to start this foundation, and that is why",
16:"I decided to make this audio video. So just let me introduce you quickly, very properly.",
17:"This is the Cold Ischemia Foundation.",
18:"The background: in medicine, cold ischemia is the time an organ can survive once it's been cut off from what keeps it alive.",
19:"And we took that name for a reason. We get a lot of questions as to why we did take that route.",
20:"We have watched the same thing happen to people. Cut off from the answers,",
21:"cut off from respect, cut off from any real say",
22:"in their own care, slowly going cold as they become, to simply feel",
23:"obsolete, very unimportant, and",
24:"absolutely have no control over what happens to them and their care. Our whole job",
25:"of the Cold Ischemia Foundation is to end that cold... interval. Apologies.",
26:"And here's what that looks like. We have built many free tools you can use tonight:",
27:"a living donor assessment, for example, a state-by-state directory of transplant centers with direct phone numbers,",
28:"guides written for care partners. We build the guides and the mentors who have been where you are,",
29:"and we build the confidence to understand your own body, your own numbers, and your own choices.",
30:"Because you do have choices. If you remember one sentence",
31:"from this video, remember that one: you have choices.",
32:"So why this particular video, and why now? Because every week someone newly diagnosed types \"kidney disease\" into a search bar",
33:"and it lands on a page that feels caring and independent. And too often, that page is paid for",
34:"by the companies that profit from what happens next. I'm not calling anyone a villain.",
35:"I'm telling you that you deserve to know who is paying for the voice that is talking to you.",
36:"Nobody else is going to say it, and so I've made a point.",
37:"I made it a mission to make sure that I will be the one",
38:"saying this, and saying it loudly. Let's just start with the size of",
39:"kidney disease. 37 million Americans have kidney disease, and the CDC says 87% of the adults who have it",
40:"do not know. Think about that. They don't know. Most people find out when it's already a crisis.",
41:"That's what happened to me. You kind of crash into dialysis.",
42:"And when it is a crisis, there are two companies, simply two companies, that you're usually",
43:"almost always stuck to choose. DaVita and Fresenius treat roughly three in four dialysis patients",
44:"in this country. DaVita alone brought in $13.6 billion last year.",
45:"In 2024, it paid more than $34 million to settle federal kickback allegations without admitting any liability.",
46:"Those are allegations. The revenue is not. Meanwhile, only about one patient in seven dialyzes at home.",
47:"A 2025 analysis of 72 studies found that seeing a kidney specialist early cut catheter starts by more than half.",
48:"That's early, before the crisis. That is what prevention looks like,",
49:"and it does not bill by the treatment. Now here comes the part some people just won't like.",
50:"In 2017, researchers in the New England Journal of Medicine looked at the hundred",
51:"and four largest patient advocacy organizations in America. And 83% took money from drug, device, or biotech companies.",
52:"Only, only one of the hundred and four",
53:"said plainly that it did not. Chew on that, please.",
54:"Kidney care is no different. The American Kidney Fund has been reported to draw roughly 80% of its donor base from DaVita and Fresenius.",
55:"It denies steering patients, and the Justice Department declined to join the whistleblower suit.",
56:"The National Kidney Foundation's corporate membership lists Boehringer Ingelheim, Novo Nordisk, and Vertex. The American Association of Kidney Patients",
57:"lists DaVita, Fresenius, and Amgen. Dialysis Patient Citizens was founded with an educational grant",
58:"from DaVita. Now, none of that is illegal. Taking industry money is legal and common, and some of these groups do real work.",
59:"I'm not telling you what to think about any of them. I'm telling you to look at the table",
60:"in this video. Now look at us, the Cold Ischemia Foundation. No donations, no funding, gifts, grants, or sponsorships from",
61:"drugmakers, device makers, dialysis companies, insurers, hospital systems, or any advocacy group they fund.",
62:"We charge fees only for services you ask for, at posted rates,",
63:"and a fee never buys influence. No drugmaker, dialysis company, insurer, or hospital system has a seat",
64:"on our up-and-coming board. Ask any organization five questions.",
65:"Who pays you? Who governs you? Who shapes your message? What can't you say?",
66:"And who do you answer to? Our answers are simple. Patients and care partners. That's all. And because we have no sponsor to protect,",
67:"we can name every institution. Independence is not a slogan.",
68:"It is a structure, and structure builds things.",
69:"Free toolkits with no paywall, a weekly investigation called the Inside Files, a public scorecard of how Congress acts on transplant and kidney care,",
70:"formal demand letters to the agencies that run this system.",
71:"And what is really happening: in 2024, 3,743 people were removed",
72:"from the kidney waiting list because they died. 29% of the kidneys recovered that year were never transplanted.",
73:"Those are not numbers. Those are people. These are real people",
74:"who died, gave their lives to a system that has betrayed them and let them down,",
75:"and we will continue to keep saying this very loudly.",
76:"People, we know, we understand, if you're listening and you're part of an advocacy organization, we get it. You're just going to say, \"I'm making accusations that we're just doing this to",
77:"create a rift, trying to tear apart whatever bridges that you may think we have been creating.",
78:"But that's your opinion. But the facts don't lie. And we have the facts, and we share them.",
79:"So here's what I'm asking. Don't take my word for it. Not mine, not theirs. Read their Form 990s. Find their sponsor page. Read the board list.",
80:"Ask what they have ever said against the people who fund them. We built a free Advocacy Assessment that walks you through it.",
81:"Then come with us. Use the tools. Send this to a care partner who is exhausted tonight.",
82:"Volunteer. Tell us where the system has failed you, because your experience is evidence.",
83:"We need people to start using their voices. We get it.",
84:"We fear retaliation. It happens. Patients get blacklisted. We understand it.",
85:"But if we can just continue to try and build a unified front,",
86:"maybe we can get through to people. And we started this foundation because we were tired of waiting for somebody else to do it.",
87:"We're not asking for permission. We're building it in the open, with nobody",
88:"to protect but you, folks. You have choices.",
89:"And always know you have choices, and you're never alone.",
90:"Think about it. Share this. Check us out. Just sign up for our free information, and you will see where we are different.",
91:"And we are what the future looks like for true patient-centered care.",
92:"Thank you.",
}
assert sorted(CT)==list(range(93))
N='/night-shift.png';S='/stress.png';SIT='/the-situation-room.png';ACC='/accountability-corridor.png';LOOP='/transplant-loopholes.png';RES='/research-banner.png';MAR='/march-for-care.jpg'
def B(src,dim=.64,blur=8,pan='left',zoom=.06):return {'src':src,'dim':dim,'blur':blur,'pan':pan,'zoom':zoom}
T=lambda *a:[{'t':x,'c':c} for x,c in a]
segs=[]
def T0(i):return PH[i]['s']+D
def T1(i):return PH[i]['e']+D
def seg(id,typ,i0,i1,bg,intensity=.6,tail=.35,**kw):
    t0=T0(i0)-.2
    nxt=T0(i1+1)-.2 if i1+1<len(PH) else T1(i1)+1.5
    dur=max(T1(i1)+tail,min(nxt,T1(i1)+2.5))-t0   # hold through short pauses
    cc=[{'t':CT[i],'a':round(T0(i),2),'b':round(T1(i)+.05,2)} for i in range(i0,i1+1)]
    o={'id':id,'type':typ,'text':' '.join(CT[i] for i in range(i0,i1+1)),'t0':round(t0,2),'dur':round(dur,2),'cc':cc,'bg':bg,'intensity':intensity};o.update(kw);segs.append(o)
# HELLO (upbeat)
seg('hello','title',0,2,B(MAR,.52,6,'left',.08),.15,lines=T(("HI. I'M JEFF.",'accent')),kicker='Founder, Cold Ischemia Foundation')
seg('watching','list',3,6,B(MAR,.62,8,'right',.07),.15,rows=[{'t':'Maybe you are on dialysis'},{'t':'Maybe you are waiting for the call'},{'t':'Maybe you are the care partner','s':'Holding the whole family together'}])
seg('isee','title',7,8,B(MAR,.5,4,'up',.1),.2,lines=T(('I DO SEE YOU.','accent')))
seg('decades','title',9,9,B(N,.66,8,'left'),.3,lines=T(("I'M A PATIENT MYSELF.",'ink'),('ALMOST THREE DECADES','accent'),('IN THIS SYSTEM.','accent')))
seg('ten','stat',10,10,B(N,.7,8,'right'),.35,stat={'value':10,'suffix':' YEARS','label':'waiting for a third transplant','sub':['In his own words'],'c':'accent'})
seg('pamphlet','title',11,12,B(S,.68,12,'right'),.3,lines=T(('A PAMPHLET.','ink'),('NOT AN ANSWER.','alert')))
seg('nobody','title',13,14,B(N,.68,8,'left'),.3,lines=T(('NOBODY IS COMING','ink'),('TO EXPLAIN IT.','accent2')))
seg('why1','title',15,16,B(MAR,.52,5,'left',.09),.25,lines=T(('THAT IS WHY','ink'),('I STARTED THIS.','accent')))
# REVEAL
seg('reveal','blank',17,17,B(MAR,.6,10,'up',.05),.2,tail=1.6)
seg('name','title',18,19,B(RES,.74,22,'right'),.45,lines=T(('COLD ISCHEMIA:','accent2'),('CUT OFF FROM WHAT','ink'),('KEEPS IT ALIVE.','ink')),hits=[.05])
seg('people','list',20,24,B(S,.7,14,'left'),.5,rows=[{'t':'Cut off from the answers'},{'t':'Cut off from respect'},{'t':'Cut off from any real say in their own care'},{'t':'Slowly going cold'}])
seg('end','title',25,25,B(N,.62,8,'right'),.55,lines=T(('END THE','ink'),('COLD INTERVAL.','accent')),hits=[.3])
seg('tools','list',26,28,B(MAR,.7,8,'left',.07),.5,rows=[{'t':'A living donor assessment'},{'t':'Transplant centers, state by state','s':'With direct phone numbers'},{'t':'Guides written for care partners'},{'t':'Guides and mentors who have been there'}])
seg('confid','title',29,29,B(MAR,.62,6,'right',.07),.55,lines=T(('YOUR OWN BODY.','ink'),('YOUR OWN NUMBERS.','ink'),('YOUR OWN CHOICES.','accent')))
seg('choices','title',30,31,B(MAR,.52,4,'left',.1),.6,lines=T(('YOU HAVE','ink'),('CHOICES.','accent')),hits=[.12])
seg('whynow','title',32,32,B(N,.66,8,'down'),.45,lines=T(('WHY THIS VIDEO?','ink'),('WHY NOW?','accent')))
seg('search','title',33,34,B(SIT,.74,18,'left'),.6,lines=T(('A PAGE THAT FEELS','ink'),('CARING AND INDEPENDENT,','ink'),('PAID FOR BY THE COMPANIES','alert'),('THAT PROFIT FROM WHAT\'S NEXT.','alert')))
seg('villain','title',35,35,B(N,.68,8,'right'),.65,lines=T(('WHO IS PAYING FOR','ink'),('THE VOICE TALKING TO YOU?','accent')))
seg('mission','title',36,38,B(N,.64,8,'left'),.7,lines=T(('A MISSION:','accent'),('SAY IT. LOUDLY.','ink')),hits=[.6])
seg('s37','stat',39,39,B(ACC,.74,22,'left'),.6,stat={'value':37,'suffix':' MILLION','label':'Americans with kidney disease','c':'accent2'},src='CDC chronic kidney disease fact sheet, March 2026')
seg('s87','stat',40,41,B(ACC,.74,22,'right'),.7,stat={'value':87,'suffix':'%','label':'of adults with kidney disease do not know it','sub':['Adults 20 and older'],'c':'alert'},src='CDC chronic kidney disease fact sheet, March 2026')
seg('duo','stat',42,43,B(SIT,.74,18,'left'),.75,stat={'value':75,'prefix':'~','suffix':'%','label':'of dialysis patients: two companies','sub':['DaVita + Fresenius'],'c':'alert'},src='DaVita 10-K FY2025; industry analyses (estimated 70 to 75 percent)')
seg('rev','stat',44,44,B(ACC,.74,22,'right'),.8,stat={'value':13.6,'prefix':'$','suffix':'B','label':'DaVita revenue, 2025','c':'accent'},src='DaVita 4th quarter 2025 results, Feb 2, 2026')
seg('settle','stat',45,45,B(SIT,.76,18,'left'),.85,stat={'value':34.5,'prefix':'$','suffix':'M','label':'2024 settlement of federal kickback allegations','sub':['No admission of liability'],'c':'alert'},src='U.S. Department of Justice, July 2024 (as reported by the ABA)')
seg('home','cards',46,48,B(RES,.76,22,'right'),.7,cards=[{'big':'1 IN 7','head':'Dialyze at home','sub':'USRDS 2024','c':'accent2'},{'big':'57%','head':'Fewer catheter starts','sub':'With early referral, 2025','c':'accent2'}],src='USRDS 2024 Annual Data Report; BMC Nephrology 2025 meta-analysis (relative risk 0.43)')
seg('prevent','title',49,49,B(N,.66,8,'right'),.75,lines=T(('PREVENTION DOES NOT','ink'),('BILL BY THE TREATMENT.','accent')),hits=[.5])
seg('nejm','stat',50,53,B(SIT,.76,20,'left'),.8,stat={'value':83,'suffix':'%','label':'of the 104 largest patient advocacy groups took industry money','sub':['Only 1 of 104 said it did not'],'c':'alert'},src='McCoy et al., New England Journal of Medicine, 2017')
seg('akf','stat',54,55,B(ACC,.76,22,'right'),.8,stat={'value':80,'prefix':'~','suffix':'%','label':'American Kidney Fund donor base from DaVita and Fresenius','sub':['As reported. The fund denies steering patients.'],'c':'alert'},src='KFF Health News; American Prospect, 2019')
seg('others','list',56,57,B(RES,.76,22,'left'),.75,rows=[{'t':'National Kidney Foundation','s':'Corporate members include Boehringer Ingelheim, Novo Nordisk, Vertex'},{'t':'American Association of Kidney Patients','s':'Corporate partners include DaVita, Fresenius, Amgen'},{'t':'Dialysis Patient Citizens','s':'Founded with an educational grant from DaVita'}],src="Each organization's own website; Dialysis Patient Citizens funding fact sheet")
seg('legal','title',58,59,B(N,.66,8,'down'),.7,lines=T(('NONE OF THAT IS ILLEGAL.','ink'),('LOOK AT THE TABLE.','accent')),hits=[.9])
tbl={'title':'Who funds the voices that speak for patients?','cols':[{'h':'Cold Ischemia Foundation'},{'h':'American Kidney Fund'},{'h':'National Kidney Foundation'},{'h':'American Assoc. of Kidney Patients'},{'h':'Dialysis Patient Citizens'}],
'rows':[
 {'q':'Takes drugmaker money','cells':[{'t':'No','ok':True,'s':'No donations or sponsors'},{'t':'Yes','s':'2025 members: Novartis, Amgen, Novo Nordisk'},{'t':'Yes','s':'2026 members: Boehringer, Novo Nordisk, Vertex'},{'t':'Yes','s':'Partners: Amgen, AstraZeneca, Bayer'},{'t':'Unverified','gray':True,'s':'See its Form 990'}]},
 {'q':'Takes dialysis-company money','cells':[{'t':'No','ok':True,'s':'None, of any kind'},{'t':'Yes','s':'DaVita + Fresenius, ~80% of donors (reported)'},{'t':'Yes','s':'Fresenius publicized its support'},{'t':'Yes','s':'DaVita, Fresenius listed as partners'},{'t':'Yes','s':'Founded with a DaVita grant; DaVita, Fresenius, U.S. Renal Care listed'}]},
 {'q':'Lists corporate sponsors on its site','cells':[{'t':'None to list','ok':True,'s':'No sponsor to protect'},{'t':'Yes','s':'Corporate members page'},{'t':'Yes','s':'Corporate membership program'},{'t':'Yes','s':'Corporate membership'},{'t':'Yes','s':'Supporters page'}]}]}
seg('table','table',60,63,B(N,.78,10,'left'),.8,table=tbl,captions=False,hits=[.06],src="Each organization's own website; KFF Health News; Fresenius Medical Care press release; coldischemia.foundation/independence.html")
seg('five','list',64,67,B(MAR,.76,10,'right',.07),.75,rows=[{'t':'Who pays you?','s':'No donations. No industry money.'},{'t':'Who governs you?','s':'No drugmaker, dialysis company, insurer or hospital system has a seat'},{'t':'Who shapes your message?','s':'Patients, care partners, and the published evidence'},{'t':"What can't you say?",'s':'Nothing is off limits'},{'t':'Who do you answer to?','s':'Only the patients and care partners we serve'}])
seg('structure','title',68,68,B(MAR,.58,6,'left',.08),.7,lines=T(('INDEPENDENCE IS','ink'),('A STRUCTURE.','accent')),hits=[.5])
seg('builds','list',69,70,B(MAR,.72,8,'right',.07),.7,rows=[{'t':'Free toolkits, no paywall'},{'t':'The Inside Files','s':'A weekly investigation'},{'t':'A public congressional scorecard','s':'On transplant and kidney care'},{'t':'Formal demand letters','s':'To the agencies that run this system'}])
seg('waste','cards',71,72,B(N,.8,10,'down'),.9,cards=[{'big':'3,743','head':'Died on the waiting list','sub':'Removed in 2024','c':'alert'},{'big':'29%','head':'Never transplanted','sub':'Of recovered kidneys, 2024','c':'alert'}],src='SRTR 2024 Annual Data Report, kidney')
seg('people2','title',73,75,B(S,.7,14,'right'),.8,lines=T(('THOSE ARE','ink'),('REAL PEOPLE.','alert')),hits=[.3])
seg('facts','title',76,78,B(SIT,.78,22,'left'),.8,lines=T(("THE FACTS DON'T LIE.",'accent'),('WE HAVE THEM.','ink'),('WE SHARE THEM.','ink')),hits=[.8])
seg('ask','list',79,80,B(MAR,.72,8,'right',.07),.6,rows=[{'t':"Don't take my word for it"},{'t':'Read their Form 990'},{'t':'Find their sponsor page'},{'t':'Read the board list'},{'t':'Ask what they have said against their funders','s':'Use our free Advocacy Assessment'}])
seg('come','title',81,82,B(MAR,.58,5,'left',.09),.6,lines=T(('USE THE TOOLS.','ink'),('SEND THIS TO A CARE PARTNER.','ink'),('VOLUNTEER.','accent')))
seg('voices','title',83,85,B(S,.68,12,'right'),.65,lines=T(('WE NEED YOUR VOICES.','accent'),('A UNIFIED FRONT.','ink')))
seg('build','title',86,88,B(MAR,.54,4,'right',.1),.7,lines=T(('WE ARE BUILDING IT,','ink'),('IN THE OPEN.','accent')),hits=[.6])
seg('final','title',89,89,B(MAR,.5,3,'left',.1),.75,lines=T(('YOU HAVE CHOICES.','accent'),('YOU ARE NOT ALONE.','ink')),hits=[.1])
seg('share','title',90,92,B(MAR,.5,3,'right',.1),.8,tail=1.2,lines=T(('SHARE THIS.','ink'),('SEE WHERE WE DIFFER.','accent')),hits=[.05])
# end card
J={'pace':2.45,'gap':.0,'lead':0,'style':{'bar':110},
'music':{'mood':'neutral','level':.92,'piano':True,'heartbeat':False,'groove':[]},
'open':{'logo':'/_filmwork/founder/img/logo.png','w':820,'y':160,'from':0,'until':0},
'bug':{'src':'/_filmwork/founder/img/logo-crop.png','x':88,'y':124,'w':230,'in':0},
'overlay':{'src':'/_filmwork/founder/img/jeff-cut.png','right':1840,'y':136,'w':230,'in':1.4,'tag':'Jeff Parke','tag2':'Founder'},
'end':{'logo':'/_filmwork/founder/img/logo.png','logoW':520,'logoY':90,'mark':'/_filmwork/policy/img/donate.png','markW':120,'markY':820,'headline':'You have choices','sub':'Cold Ischemia Foundation','lines':['coldischemia.foundation/founder-message.html','Sources and the full transcript are on that page.','Allegations are allegations. Educational advocacy, not medical or legal advice.'],'strong':1,'hold':14},
'segments':segs}
# reveal/groove/bug timing
R=[s for s in segs if s['id']=='reveal'][0];Nm=[s for s in segs if s['id']=='name'][0];A=[s for s in segs if s['id']=='ask'][0]
J['open'].update({'from':round(R['t0']+.1,2),'until':round(Nm['t0']+.6,2)})
J['bug']['in']=1.4
last=segs[-1];total=last['t0']+last['dur']
J['music']['groove']=[[0,round(Nm['t0']+1.0,2),104,.85],[round(A['t0']-.2,2),round(total+10,2),104,1.0]]
json.dump(J,open('script.json','w'),indent=1)
# verification of segment timing sanity
prev=0
for s in segs:
    if s['t0']<prev-1.5:print('OVERLAP',s['id'],s['t0'],prev)
    prev=s['t0']+s['dur']
print(len(segs),'segments; ends',round(total,1))
