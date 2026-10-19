import json,re,sys
N='/night-shift.png';S='/stress.png';SIT='/the-situation-room.png';ACC='/accountability-corridor.png';LOOP='/transplant-loopholes.png';RES='/research-banner.png';MAR='/march-for-care.jpg'
def B(src,dim=.64,blur=8,pan='left',zoom=.06):return {'src':src,'dim':dim,'blur':blur,'pan':pan,'zoom':zoom}
T=lambda *a:[{'t':x,'c':c} for x,c in a]
segs=[]
def seg(id,typ,text,bg,intensity=.6,**kw):
    o={'id':id,'type':typ,'text':text,'bg':bg,'intensity':intensity};o.update(kw);segs.append(o)
# --- 1 HELLO (upbeat)
seg('hello','title',"Hi. I'm Jeff, the founder of the Cold Ischemia Foundation.",B(MAR,.52,6,'left',.08),.15,lines=T(("HI. I'M JEFF.",'accent')),kicker='Founder, Cold Ischemia Foundation')
seg('watching','list',"If you're watching this, kidney disease has probably walked into your life, or into the life of someone you love. Maybe you're on dialysis. Maybe you're waiting for a call that hasn't come. Maybe you're the care partner, the one driving, scheduling, filling the pill box, and holding the whole family together.",B(MAR,.62,8,'right',.07),.15,rows=[{'t':'Maybe you are on dialysis'},{'t':'Maybe you are waiting for a call'},{'t':'Maybe you are the care partner','s':'Holding the whole family together'}])
seg('iseeyou','title',"I want to start with what nobody said to me: I see you.",B(MAR,.5,4,'up',.1),.2,lines=T(('I SEE YOU.','accent')))
seg('patient','title',"I'm a patient. I've lived this system from the inside. I know the chair. I know the waiting. I know what it feels like to be handed a pamphlet when what you needed was an answer.",B(N,.66,8,'left'),.3,lines=T(("I'M A PATIENT.",'ink'),("I'VE LIVED THIS SYSTEM.",'accent')))
seg('nobody','title',"And I know the moment you realize that nobody is coming to explain it, and you have to figure it out yourself.",B(N,.68,8,'right'),.3,lines=T(('NOBODY IS COMING','ink'),('TO EXPLAIN IT.','accent2')))
seg('why1','title',"That is why I started this foundation. And that is why I made this video.",B(MAR,.52,5,'left',.09),.25,lines=T(('THAT IS WHY','ink'),('I STARTED THIS.','accent')))
# --- 2 WHO WE ARE (logo reveal)
seg('reveal','blank',"So let me introduce us properly. This is the Cold Ischemia Foundation.",B(MAR,.6,10,'up',.05),.2,dur=9.5,captions_center=False)
seg('name','title',"In medicine, cold ischemia is the time an organ can survive once it's been cut off from what keeps it alive. We took that name for a reason.",B(RES,.74,22,'right'),.45,lines=T(('COLD ISCHEMIA:','accent2'),('CUT OFF FROM WHAT','ink'),('KEEPS IT ALIVE.','ink')),hits=[.05])
seg('people','list',"We have watched the same thing happen to people. Cut off from answers. Cut off from respect. Cut off from any real say in their own care. Slowly going cold.",B(S,.7,14,'left'),.5,rows=[{'t':'Cut off from answers'},{'t':'Cut off from respect'},{'t':'Cut off from any real say in their own care'}])
seg('end','title',"Our whole job is to end that cold interval.",B(N,.62,8,'right'),.55,lines=T(('END THE','ink'),('COLD INTERVAL.','accent')),hits=[.3],dur=4.2)
seg('tools','list',"Here is what that looks like. We build free tools you can use tonight: a living donor assessment, a state-by-state directory of transplant centers with direct phone numbers, guides written for care partners.",B(MAR,.7,8,'left',.07),.5,rows=[{'t':'A living donor assessment'},{'t':'Transplant centers, state by state','s':'With direct phone numbers'},{'t':'Guides written for care partners'}])
seg('mentors','title',"We build the guides and the mentors who have been where you are. And we build the confidence to understand your own body, your own numbers, and your own choices.",B(MAR,.62,6,'right',.07),.55,lines=T(('YOUR OWN BODY.','ink'),('YOUR OWN NUMBERS.','ink'),('YOUR OWN CHOICES.','accent')))
seg('choices','title',"Because you have choices. If you remember one sentence from this video, remember that one.",B(MAR,.52,4,'left',.1),.6,lines=T(('YOU HAVE','ink'),('CHOICES.','accent')),hits=[.12])
# --- 3 WHY THIS VIDEO
seg('whynow','title',"So why this video, and why now?",B(N,.66,8,'down'),.45,lines=T(('WHY THIS VIDEO?','ink'),('WHY NOW?','accent')),dur=3.6)
seg('search','title',"Because every week, someone newly diagnosed types \"kidney disease\" into a search bar and lands on a page that feels caring and independent. And too often, that page is paid for by the companies that profit from what happens next.",B(SIT,.74,18,'left'),.6,lines=T(('A PAGE THAT FEELS','ink'),('CARING AND INDEPENDENT.','ink'),('PAID FOR BY THE COMPANIES','alert'),('THAT PROFIT FROM WHAT\'S NEXT.','alert')))
seg('villain','title',"I'm not calling anyone a villain. I'm telling you that you deserve to know who is paying for the voice that is talking to you. Nobody else is going to say it. So I will.",B(N,.68,8,'right'),.65,lines=T(('WHO IS PAYING FOR','ink'),('THE VOICE TALKING TO YOU?','accent')),hits=[.9])
# --- 4 RECEIPTS
seg('s37','stat',"Start with the size of it. Thirty-seven million Americans have kidney disease,",B(ACC,.74,22,'left'),.6,stat={'value':37,'suffix':' MILLION','label':'Americans with kidney disease','c':'accent2'},src='CDC chronic kidney disease fact sheet, March 2026')
seg('s87','stat',"and the CDC says eighty-seven percent of the adults who have it do not know. Most people find out when it is already a crisis.",B(ACC,.74,22,'right'),.7,stat={'value':87,'suffix':'%','label':'of adults with kidney disease do not know it','sub':['Adults 20 and older'],'c':'alert'},src='CDC chronic kidney disease fact sheet, March 2026')
seg('duo','stat',"And when it is a crisis, there are two companies. DaVita and Fresenius treat roughly three in four dialysis patients in this country.",B(SIT,.74,18,'left'),.75,stat={'value':75,'prefix':'~','suffix':'%','label':'of dialysis patients: two companies','sub':['DaVita + Fresenius'],'c':'alert'},src='DaVita 10-K FY2025; industry analyses (estimated 70 to 75 percent)')
seg('rev','stat',"DaVita alone brought in thirteen point six billion dollars last year.",B(ACC,.74,22,'right'),.8,stat={'value':13.6,'prefix':'$','suffix':'B','label':'DaVita revenue, 2025','c':'accent'},src='DaVita 4th quarter 2025 results, Feb 2, 2026')
seg('settle','stat',"In 2024 it paid more than thirty-four million to settle federal kickback allegations, without admitting liability. Those are allegations. The revenue is not.",B(SIT,.76,18,'left'),.85,stat={'value':34.5,'prefix':'$','suffix':'M','label':'2024 settlement of federal kickback allegations','sub':['No admission of liability'],'c':'alert'},src='U.S. Department of Justice, July 2024 (as reported by the ABA)')
seg('home','stat',"Meanwhile only about one patient in seven dialyzes at home.",B(N,.74,10,'up'),.7,stat={'value':1,'prefix':'1 IN ','suffix':'','label':'dialyze at home','c':'accent2','plain':True},src='USRDS 2024 Annual Data Report (14.5 percent, 2022)')
seg('refer','stat',"And a 2025 analysis of seventy-two studies found that seeing a kidney specialist early cut catheter starts by more than half. Early. Before the crisis. That is what prevention looks like, and it does not bill by the treatment.",B(RES,.76,22,'left'),.7,stat={'value':57,'suffix':'%','label':'lower risk of a catheter start with early referral','sub':['72 studies, 2025 meta-analysis'],'c':'accent2'},src='BMC Nephrology 2025 meta-analysis (relative risk 0.43)')
# --- 5 WHO PAYS
seg('part','title',"Now here is the part some people won't like.",B(N,.66,8,'right'),.7,lines=T(('NOW, THE PART SOME','ink'),("PEOPLE WON'T LIKE.",'accent')),dur=3.8)
seg('nejm','stat',"In 2017, researchers in the New England Journal of Medicine looked at the hundred and four largest patient advocacy organizations in America. Eighty-three percent took money from drug, device, or biotech companies. Only one of the hundred and four said plainly that it did not.",B(SIT,.76,20,'left'),.8,stat={'value':83,'suffix':'%','label':'of the 104 largest patient advocacy groups took industry money','sub':['Only 1 of 104 said it did not'],'c':'alert'},src='McCoy et al., New England Journal of Medicine, 2017')
seg('akf','stat',"Kidney care is no different. The American Kidney Fund has been reported to draw roughly eighty percent of its donor base from DaVita and Fresenius. It denies steering patients, and the Justice Department declined to join the whistleblower suit.",B(ACC,.76,22,'right'),.8,stat={'value':80,'prefix':'~','suffix':'%','label':'American Kidney Fund donor base from DaVita and Fresenius','sub':['As reported. The fund denies steering patients.'],'c':'alert'},src='KFF Health News; American Prospect, 2019')
seg('others','list',"The National Kidney Foundation's corporate membership lists Boehringer Ingelheim, Novo Nordisk, and Vertex. The American Association of Kidney Patients lists DaVita, Fresenius, and Amgen. And Dialysis Patient Citizens was founded with an educational grant from DaVita.",B(RES,.76,22,'left'),.75,rows=[{'t':'National Kidney Foundation','s':'Corporate members include Boehringer Ingelheim, Novo Nordisk, Vertex'},{'t':'American Association of Kidney Patients','s':'Corporate partners include DaVita, Fresenius, Amgen'},{'t':'Dialysis Patient Citizens','s':'Founded with an educational grant from DaVita'}],src="Each organization's own website; Dialysis Patient Citizens funding fact sheet")
seg('legal','title',"None of that is illegal. Taking industry money is legal, and common, and some of these groups do real work. I'm not telling you what to think about any of them. I'm telling you to look at the table.",B(N,.66,8,'down'),.7,lines=T(('NONE OF THAT IS ILLEGAL.','ink'),('LOOK AT THE TABLE.','accent')),hits=[.88])
# --- 6 TABLE
tbl={'title':'Who funds the voices that speak for patients?','cols':[{'h':'Cold Ischemia Foundation'},{'h':'American Kidney Fund'},{'h':'National Kidney Foundation'},{'h':'American Assoc. of Kidney Patients'},{'h':'Dialysis Patient Citizens'}],
'rows':[
 {'q':'Takes drugmaker money','cells':[{'t':'No','ok':True,'s':'No donations or sponsors'},{'t':'Yes','s':'2025 members: Novartis, Amgen, Novo Nordisk'},{'t':'Yes','s':'2026 members: Boehringer, Novo Nordisk, Vertex'},{'t':'Yes','s':'Partners: Amgen, AstraZeneca, Bayer'},{'t':'Unverified','gray':True,'s':'See its Form 990'}]},
 {'q':'Takes dialysis-company money','cells':[{'t':'No','ok':True,'s':'None, of any kind'},{'t':'Yes','s':'DaVita + Fresenius, ~80% of donors (reported)'},{'t':'Yes','s':'Fresenius publicized its support'},{'t':'Yes','s':'DaVita, Fresenius listed as partners'},{'t':'Yes','s':'Founded with a DaVita grant; DaVita, Fresenius, U.S. Renal Care listed'}]},
 {'q':'Lists corporate sponsors on its site','cells':[{'t':'None to list','ok':True,'s':'No sponsor to protect'},{'t':'Yes','s':'Corporate members page'},{'t':'Yes','s':'Corporate membership program'},{'t':'Yes','s':'Corporate membership'},{'t':'Yes','s':'Supporters page'}]}]}
seg('table','table',"Now look at us. No donations. No funding, gifts, grants, or sponsorships from drugmakers, device makers, dialysis companies, insurers, hospital systems, or any advocacy group they fund. We charge fees only for services you ask for, at posted rates, and a fee never buys influence. No drugmaker, dialysis company, insurer, or hospital system has a seat on our board.",B(N,.78,10,'left'),.8,table=tbl,captions=False,hits=[.08],src="Each organization's own website; KFF Health News; Fresenius Medical Care press release; coldischemia.foundation/independence.html")
seg('five','list',"Ask any organization five questions. Who pays you? Who governs you? Who shapes your message? What can't you say? And who do you answer to? Our answers are simple. Patients and care partners. That is all. And because we have no sponsor to protect, we can name every institution.",B(MAR,.76,10,'right',.07),.75,rows=[{'t':'Who pays you?','s':'No donations. No industry money.'},{'t':'Who governs you?','s':'No drugmaker, dialysis company, insurer or hospital system has a seat'},{'t':'Who shapes your message?','s':'Patients, care partners, and the published evidence'},{'t':"What can't you say?",'s':'Nothing is off limits'},{'t':'Who do you answer to?','s':'Only the patients and care partners we serve'}])
# --- 7 WHAT INDEPENDENCE BUILDS
seg('structure','title',"Independence is not a slogan. It is a structure, and structures build things.",B(MAR,.58,6,'left',.08),.7,lines=T(('INDEPENDENCE IS','ink'),('A STRUCTURE.','accent')),hits=[.5],dur=5)
seg('builds','list',"Free toolkits with no paywall. A weekly investigation called the Inside Files. A public scorecard of how Congress acts on transplant and kidney care. Formal demand letters to the agencies that run this system.",B(MAR,.72,8,'right',.07),.7,rows=[{'t':'Free toolkits, no paywall'},{'t':'The Inside Files','s':'A weekly investigation'},{'t':'A public congressional scorecard','s':'On transplant and kidney care'},{'t':'Formal demand letters','s':'To the agencies that run this system'}])
seg('waste','cards',"And a spotlight on what is really happening. In 2024, three thousand seven hundred and forty-three people were removed from the kidney waiting list because they died. Twenty-nine percent of the kidneys recovered that year were never transplanted.",B(N,.8,10,'down'),.9,cards=[{'big':'3,743','head':'Died on the waiting list','sub':'Removed in 2024','c':'alert'},{'big':'29%','head':'Of recovered kidneys never transplanted','sub':'2024','c':'alert'}],src='SRTR 2024 Annual Data Report, kidney')
seg('people2','title',"Those are not numbers. Those are people. And we will keep saying so.",B(S,.7,14,'right'),.8,lines=T(('THOSE ARE','ink'),('PEOPLE.','alert')),hits=[.4],dur=4.4)
# --- 8 YOUR PART (outro groove from 'ask')
seg('ask','title',"So here is what I'm asking.",B(MAR,.58,5,'left',.08),.5,lines=T(('HERE IS WHAT','ink'),("I'M ASKING.",'accent')),dur=3.2)
seg('check','list',"Don't take my word for it. Not mine, not theirs. Read their Form 990. Find their sponsor page. Read the board list. Ask what they have ever said against the people who fund them. We built a free Advocacy Assessment that walks you through it.",B(MAR,.72,8,'right',.07),.5,rows=[{'t':'Read their Form 990'},{'t':'Find their sponsor page'},{'t':'Read the board list'},{'t':'Ask what they have said against their funders','s':'Use our free Advocacy Assessment'}])
seg('come','title',"Then come with us. Use the tools. Send this to a care partner who is exhausted tonight. Volunteer. Tell us where the system failed you, because your experience is evidence.",B(MAR,.58,5,'left',.09),.55,lines=T(('USE THE TOOLS.','ink'),('SEND THIS TO A CARE PARTNER.','ink'),('VOLUNTEER.','accent')))
seg('build','title',"We started this foundation because we were tired of waiting for somebody else to do it. We are not asking for permission. We are building it, in the open, with nobody to protect but you.",B(MAR,.54,4,'right',.1),.6,lines=T(('WE ARE BUILDING IT,','ink'),('IN THE OPEN.','accent')),hits=[.55])
seg('final','title',"You have choices. And you are not alone.",B(MAR,.5,3,'left',.1),.65,lines=T(('YOU HAVE CHOICES.','accent'),('YOU ARE NOT ALONE.','ink')),hits=[.1],dur=5)
for sg in segs:
    if sg['type']=='blank': sg['captions']=True
    sg.pop('captions_center',None)
J={'pace':2.45,'gap':.45,'lead':2.2,'style':{'bar':110},
'music':{'mood':'neutral','level':.92,'piano':True,'heartbeat':False,'groove':[]},
'open':{'logo':'/_filmwork/founder/img/logo.png','w':820,'y':160,'from':0,'until':0},
'bug':{'src':'/_filmwork/founder/img/logo-crop.png','x':88,'y':124,'w':190,'in':0},
'overlay':{'src':'/_filmwork/founder/img/jeff-cut.png','right':1840,'y':136,'w':230,'in':1.4,'tag':'Jeff Parke','tag2':'Founder'},
'end':{'logo':'/_filmwork/founder/img/logo.png','logoW':520,'logoY':90,'mark':'/_filmwork/policy/img/donate.png','markW':120,'markY':820,'headline':'You have choices','sub':'Cold Ischemia Foundation','lines':['coldischemia.foundation','Sources: CDC 2026; DaVita FY2025; DOJ via ABA 2024; KFF Health News; SRTR 2024; NEJM 2017; USRDS 2024; BMC Nephrology 2025; each organization\'s own website.','Allegations are allegations. Educational advocacy, not medical or legal advice.'],'strong':1,'hold':14},
'segments':segs}
for sg in segs:
    w=len(sg['text'].split());d=sg.get('dur',w/2.45)
    mind={'stat':4.8,'cards':6,'list':5.5,'table':26,'title':3.6}.get(sg['type'],3)
    if sg.get('dur') is None and d<mind: sg['dur']=mind
    elif sg.get('dur') is not None and sg['id'] not in ('reveal',) and sg['dur']<mind and sg['type']!='title': sg['dur']=mind
# fidelity check vs script
src=open('/home/user/cold-ischemia/_filmwork/founder/script.md').read()
src=re.sub(r'^#.*$','',src,flags=re.M)
norm=lambda t:re.findall(r"[a-z0-9']+",t.lower().replace('’',"'"))
a=norm(src);b=norm(' '.join(s['text'] for s in segs))
if a!=b:
    import difflib
    sm=difflib.SequenceMatcher(None,a,b)
    for tag,i1,i2,j1,j2 in sm.get_opcodes():
        if tag!='equal':print(tag,a[i1:i2][:12],b[j1:j2][:12])
    print('FIDELITY MISMATCH')
else: print('fidelity ok',len(a))
json.dump(J,open('/home/user/cold-ischemia/_filmwork/founder/script.json','w'),indent=1)
