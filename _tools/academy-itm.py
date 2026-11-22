#!/usr/bin/env python3
"""Adds material from Jeff A. Parke's field manual, Inside the Machine (2026), to The Advocate's Academy.
Run once after academy-restructure.py. Each insertion is anchored to an existing scene by a unique text fragment,
so the script is safe to read as a record of what came from the manual and where it went."""
import json, os
AC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'academy')
ITM = {'t': 'Parke, J. A. (2026). Inside the Machine: What Hemodialysis Really Does to Your Body (field manual)', 'u': 'https://payhip.com/coldischemia'}
def T(_t, **v): return {'text': _t, 'v': v}
def Q(q, o, a, why): return {'q': q, 'o': o, 'a': a, 'why': why}
def S(t, u): return {'t': t, 'u': u}

ADD = {  # module id: list of (anchor fragment, 'after' | 'replace', scene)
 'c1m1': [
  ("Clinicians have a name for what happened to our patient. A crash start.", 'after', T(
   "I wrote a whole chapter about this in my field manual, Inside the Machine, because your access is your lifeline. A fistula is your own artery joined to your vein. A graft is a soft tube under the skin. A catheter is a tube into a large vein in your neck or chest, and it is meant to be temporary. In a large review of studies, people dialyzing with a catheter had about a fifty-three percent higher risk of death and roughly twice the risk of a fatal infection compared with people using a fistula. If you have a catheter, ask one question at every care-plan meeting: how long have I had this, and what is the written plan for a permanent access?",
   k='compare', a={'h': 'Fistula or graft', 'tag': 'Planned, permanent', 'items': ['Check the buzz and whoosh every day', 'No blood pressure, IVs or blood draws in that arm', 'Report swelling, redness or a cold hand']}, b={'h': 'Catheter', 'tag': 'Meant to be temporary', 'items': ['About 53% higher risk of death vs fistula', 'About twice the risk of fatal infection', 'Ask: how long, and what is the plan?']}, src='Ravani et al., J Am Soc Nephrol 2013; Inside the Machine, ch. 3.15')),
  ("Here is a fact many patients never hear. In the United States, a person can be added", 'after', T(
   "The first ninety days on dialysis carry the highest risk of the whole dialysis career, and they are also when the biggest decisions are easiest to make: the access plan, the transplant referral, the living donor conversation, home dialysis, and your own goals. Two more things from the evidence. A major trial found that starting dialysis earlier, at a higher filtration rate, did not help people live longer, so the start should be guided by symptoms, not a lab number alone. And if you still make urine, that remaining kidney function is precious. Ask your team how they are protecting it.",
   k='list', title='Your first 90 days', items=['Access plan, written down', 'Transplant referral sent, with the date', 'Living donor conversation started', 'Home dialysis options explained', 'Remaining kidney function measured and protected'], src='Cooper et al. (IDEAL), NEJM 2010; Inside the Machine, ch. 1.14')),
 ],
 'c1m2': [
  ("You saw how valuable private insurance is to a dialysis business.", 'after', T(
   "Cost does not stay in your wallet. When it forces you to skip a pill or a ride, it enters your bloodstream. Original Medicare generally leaves patients responsible for twenty percent of approved costs unless they have secondary coverage. Add three round trips a week, medicines, food and lost work. If premium help is keeping you on a private plan, ask one question before you choose or keep it: what happens to my coverage, and to the cost of anti-rejection drugs, if I get a transplant? And if you are skipping anything because of cost, say so, and ask that your chart record the cost barrier, not the word non-adherence.",
   k='list', title='Financial toxicity: what to ask', items=['What do I really pay each month: rides, medicines, premiums, food?', 'Who funds my premium help?', 'What happens to coverage and drug costs after a transplant?', 'Record the cost barrier in my chart, not "non-adherence"'], src='Inside the Machine, ch. 3.19')),
  ("Look at Medicare's side of the ledger too.", 'after', T(
   "Here is a payment change most patients never heard about. Starting January first, 2025, Medicare moved oral-only dialysis drugs, mainly phosphate binders, into the dialysis payment bundle. For many patients, binders now come through the dialysis facility instead of the pharmacy. If your binder supply has changed, been interrupted, or switched to a different product, ask the clinic who is responsible for it now, and tell them if a gap has left you without it. A change on a payment form can become a missed dose at your kitchen table.",
   k='timeline', title='The 2025 binder change', items=[{'y': 'Before 2025', 't': 'Phosphate binders usually dispensed through Part D pharmacies'}, {'y': 'Jan 1, 2025', 't': 'Oral-only dialysis drugs move into the Medicare dialysis bundle'}, {'y': 'Now', 't': 'Many patients get binders through the facility: ask who owns the supply'}], src='CMS ESRD PPS; Inside the Machine, ch. 1.11')),
 ],
 'c1m3': [
  ("If home dialysis might fit your life, the questions decide", 'replace', T(
   "Home dialysis is right for many people, not all, and you have a right to be told about it. National registry data show that in 2022, fourteen and a half percent of people starting dialysis began at home, up from eight and a half percent ten years earlier. In the same year, almost fifty-eight percent of clinics were either not certified for home dialysis or had no home patients. Where you dialyze shapes what you are offered. And Medicare's main payment experiment to encourage home dialysis and transplant, the ESRD Treatment Choices model, was ended early, at the close of 2025. So ask directly: am I a candidate for peritoneal dialysis or home hemodialysis, where is the nearest training program, and what would have to change for home to work for me?",
   k='stats', items=[{'value': 14.5, 'suffix': '%', 'label': 'of new patients started at home, 2022'}, {'value': 8.5, 'suffix': '%', 'label': 'in 2012'}, {'value': 57.9, 'suffix': '%', 'label': 'of clinics not home-certified or with no home patients'}], src='USRDS 2024 Annual Data Report via Home Dialysis Central; CMS (ETC ended Dec 31, 2025); Inside the Machine, ch. 3.22')),
  ("About two percent a month. That sounds small", 'after', T(
   "One pattern in those deaths is not random, and it is in my manual because it can be acted on. If you dialyze Monday, Wednesday and Friday, or Tuesday, Thursday and Saturday, one gap each week is a full day longer. In a study of more than thirty-two thousand U.S. patients, deaths, cardiac arrests and admissions for heart rhythm problems were all higher on the day after that long gap. Potassium builds up over the weekend and is then pulled down fast. So ask: what is my potassium before the first treatment of the week, what potassium is in my dialysis fluid, and could a longer or extra session help me?",
   k='callout', text='The most dangerous day of the dialysis week follows the longest gap. Ask what your potassium is, and what is in your bath.', src='Foley et al., NEJM 2011; Inside the Machine, ch. 3.5')),
 ],
 'c2m1': [
  ("Timing matters enormously. A transplant before dialysis", 'after', T(
   "In my manual I call this the transplant argument, and I'll say it plainly. The machine is keeping you alive. It is not making you well. In a landmark national study, people who received a transplant had a forty-eight to eighty-two percent lower long-term risk of death than similar people who stayed on the waiting list, depending on age and health. And time matters. In a study of pairs of kidneys from the same donors, kidneys given to people who had been on dialysis less than six months were still working at ten years sixty-nine percent of the time. For people who had waited more than two years, it was thirty-nine percent. Time on dialysis is debt.",
   k='bars', title='Kidney still working at 10 years, same-donor pairs', unit='%', items=[{'l': 'On dialysis under 6 months', 'v': 69}, {'l': 'On dialysis over 2 years', 'v': 39}], src='Meier-Kriesche & Kaplan, Transplantation 2002; Wolfe et al., NEJM 1999; Inside the Machine, ch. 3.16')),
  ("Here's something many people don't realize. Your waiting time", 'after', T(
   "Why the urgency? A working transplant brings back what the machine cannot: continuous cleaning, the kidney's own hormones, steady fluid and acid balance, and an end to the blood pressure crashes and the weekly potassium roller coaster. But some damage does not reverse. Calcium that has hardened the arteries, scarring in the heart muscle, injury to the brain's white matter. A transplant stops new damage. It does not reliably undo the old. That is why every month of delay in a referral is a month someone should have to explain.",
   k='compare', a={'h': 'What a transplant restores', 'tag': 'New damage stops', 'items': ['Continuous cleaning', 'Hormones and acid balance', 'No more treatment crashes']}, b={'h': 'What it cannot undo', 'tag': 'Old damage tends to stay', 'items': ['Hardened, calcified arteries', 'Scarring in the heart', 'White-matter injury in the brain']}, src='Inside the Machine, ch. 3.16')),
 ],
 'c2m2': [
  ("Which kidneys go unused? Mostly those from older donors", 'after', T(
   "Here is the comparison that should end the argument that discards are inevitable. A study of deceased-donor kidneys recovered in the United States from 2004 to 2014 found that about eighteen percent were discarded, roughly double the rate in France. When the researchers looked at the discarded American kidneys, they estimated that more than sixty percent of them would likely have been transplanted under French practice. Same biology. Different system. That is a choice, and choices can change.",
   k='compare', a={'h': 'United States', 'tag': '2004 to 2014', 'items': ['About 18% of recovered kidneys discarded', 'More than 60% of those likely usable in France']}, b={'h': 'France', 'tag': 'Same period', 'items': ['About half the U.S. discard rate', 'Older and higher-risk kidneys used more often']}, src='Aubert et al., JAMA Internal Medicine 2019; Inside the Machine, ch. 3.17')),
  ("One more choice belongs to you. Kidneys are scored", 'after', T(
   "Two more things happen behind the list that patients rarely hear about. First, the kidney score is less precise than it sounds. The model behind it predicts only modestly better than a coin toss for any single kidney. Second, a growing number of kidneys are placed out of sequence, outside the order set by the national match, often under time pressure. A research letter in JAMA Internal Medicine found that out-of-sequence placements grew from about two percent of deceased-donor kidney transplants in 2020 to almost sixteen percent in 2023. So ask your center: when a kidney is offered to me and declined, will I be told, and why?",
   k='bars', title='Kidneys placed out of sequence', unit='%', items=[{'l': '2020', 'v': 2.2}, {'l': '2023', 'v': 15.7}], src='Schold et al., research letter, JAMA Internal Medicine (via CU Anschutz); Inside the Machine, ch. 3.17')),
 ],
 'c2m3': [
  ("Then money. Federal law, the National Organ Transplant Act", 'after', T(
   "Donors deserve honest numbers, and my manual gives them. Donating a kidney carries a small increase in the donor's own long-term risk of kidney failure. In a large U.S. study, about ninety in ten thousand donors developed kidney failure over the following years, compared with fourteen in ten thousand similar healthy people who did not donate. A small risk, but a real one. And you do not have to ask anyone directly for a kidney. It is enough to share, openly and without pressure, that living donation is something you are exploring, and that the transplant center's donor team will talk with anyone who is curious, in confidence.",
   k='stats', items=[{'value': 90, 'label': 'per 10,000 donors later developed kidney failure'}, {'value': 14, 'label': 'per 10,000 similar non-donors'}], src='Muzaale et al., JAMA 2014; Inside the Machine, ch. 3.16')),
  ("Start with what's proven. Machine perfusion has randomized trial evidence", 'after', T(
   "Innovation is not only about organs. Your standard monthly number, Kt/V, measures how well dialysis clears one small waste, urea. Researchers have catalogued more than a hundred wastes that build up in kidney failure, and many are larger or stuck to proteins the machine barely touches. A treatment called high-volume hemodiafiltration pulls more of the larger wastes out. In a European trial of thirteen hundred sixty patients published in 2023, people who received it had a twenty-three percent lower risk of dying than people on standard dialysis. The question for American patients is shifting from does it work, to will I be offered it.",
   k='stat', value=23, suffix='%', label='lower risk of death with high-volume hemodiafiltration (CONVINCE trial, 1,360 patients)', src='Blankestijn et al., NEJM 2023; Inside the Machine, ch. 3.2')),
  ("So what does an advocate ask for? Ask your transplant center whether it uses machine perfusion", 'replace', T(
   "So how do you tell hope from hype? My manual gives six questions for any new treatment. Has it been tested in people, or only in animals or the lab? Was it compared fairly with standard care, ideally in a randomized trial? Did it improve something you would notice, like survival or how you feel, or only a lab number? Who paid for the study, and who profits? Is it available outside a trial, and covered? And what would you give up to try it? Clinical trials are listed at ClinicalTrials.gov. A legitimate trial will never ask you to pay to take part. Ask the same six questions about every claim, including the ones you hope are true.",
   k='list', title='Hope or hype? Six questions', items=['Tested in people, or only in the lab?', 'Compared fairly, ideally in a randomized trial?', 'Improved something you would notice?', 'Who paid, and who profits?', 'Available outside a trial? Covered?', 'What would you give up to try it?'], src='Inside the Machine, ch. 3.25')),
 ],
 'c3m1': [
  ("Two more rights you can use tomorrow.", 'after', T(
   "Now a chapter of my manual I wish every patient could read: labeled. A word written in your chart can follow you from unit to unit for years. In a study of more than four hundred medical students and residents, people who read a note with judgmental language about a patient planned to treat his pain less aggressively than people who read the same facts in neutral words. In dialysis, the heavy words are familiar: non-compliant, refused, difficult, disruptive. Each can describe a real event. Each can also hide the reason behind it, like a missed ride, a binder you could not afford, or a treatment you stopped because of cramps.",
   k='flow', title='How a label travels', steps=['A barrier nobody writes down', 'A label in the chart', 'An expectation at the next unit', 'A decision about care'], broken=[1, 2], note='Each step is a point where the record can be corrected.', src='Goddu et al., J Gen Intern Med 2018; Inside the Machine, ch. 3.26')),
  ("The rights section reaches further than most people realize.", 'after', T(
   "And you can correct the record. Under federal privacy law, you can ask a provider to amend information you believe is inaccurate or incomplete. The provider must generally act within sixty days. If it refuses, it must explain why in writing and let you file a statement of disagreement that becomes part of your record. Name the entry, the date, and what is missing. For example: the note of March third says I refused treatment. I stopped after two hours because of cramps and a low blood pressure, which I reported. Please add this context.",
   k='case', h='Your right to amend your record', sub='45 CFR 164.526', items=['Ask in writing to amend an inaccurate or incomplete entry', 'Provider generally must act within 60 days', 'A refusal must be explained in writing', 'You may file a statement of disagreement'], src='45 CFR 164.526; Inside the Machine, ch. 3.26')),
 ],
 'c3m3': [
  ("Care partners need protection too, and there is some.", 'before', T(
   "If you are a care partner, this is for you, and it is in my manual because nobody else says it. You are not the patient on the record, but in almost every way that matters you are part of this treatment, and your wellbeing is part of the patient's safety. Ask yourself one question every month: on a scale of one to ten, how sustainable is my situation right now? If the answer is below five, something needs to change, and it is worth telling the social worker, your own doctor, or someone you trust, this week. Book your own medical visit, and tell your clinician you are a dialysis care partner.",
   k='callout', text='Once a month: "On a scale of 1 to 10, how sustainable is my situation right now?" Below 5 means something has to change.', src='Inside the Machine, ch. 3.24')),
 ],
}
NEWQ = {  # module id: list of (question text to replace, new question)
 'c1m1': [("When can a person begin accruing waiting time for a deceased-donor kidney?", Q("Compared with a fistula, a dialysis catheter carries about:", ["The same risk", "A 53% higher risk of death and about twice the risk of fatal infection", "Lower infection risk", "Half the risk of death"], 1, "Ravani et al. (2013), cited in Inside the Machine, ch. 3.15. A catheter is meant to be temporary."))],
 'c1m3': [("What is the most useful tool for spotting a dropped hand-off?", Q("Which day of the dialysis week carries the highest risk of death and cardiac arrest?", ["Any day equally", "The day after the longest gap between treatments", "The middle treatment of the week", "Sunday"], 1, "Foley et al., NEJM 2011, in more than 32,000 patients (Inside the Machine, ch. 3.5)."))],
 'c2m1': [("From when is deceased-donor waiting time generally counted?", Q("In same-donor kidney pairs, what share were still working at 10 years for people on dialysis under 6 months vs over 2 years?", ["Same for both", "69% vs 39%", "39% vs 69%", "90% vs 80%"], 1, "Meier-Kriesche & Kaplan (2002). Time on dialysis is debt (Inside the Machine, ch. 3.16)."))],
 'c3m1': [("Which database shows industry payments to physicians?", Q("If you ask a provider to amend an inaccurate chart entry, what must happen?", ["Nothing", "The provider must generally act within 60 days and explain any refusal in writing", "The entry is deleted automatically", "You must hire a lawyer"], 1, "45 CFR 164.526; you may also file a statement of disagreement (Inside the Machine, ch. 3.26)."))],
}
NEWS = {
 'c1m1': [S('Ravani et al., Vascular access and mortality: systematic review (J Am Soc Nephrol 2013)', 'https://pubmed.ncbi.nlm.nih.gov/?term=Ravani+2013+vascular+access+mortality+systematic+review'), S('Cooper et al., IDEAL trial (NEJM 2010)', 'https://pubmed.ncbi.nlm.nih.gov/?term=Cooper+2010+randomized+trial+early+versus+late+initiation+of+dialysis')],
 'c1m2': [S('CMS: ESRD Prospective Payment System (oral-only drugs in the bundle, 2025)', 'https://www.cms.gov/medicare/payment/prospective-payment-systems/end-stage-renal-disease-esrd')],
 'c1m3': [S('Home Dialysis Central: Home dialysis updates from the 2024 USRDS Annual Data Report', 'https://homedialysis.org/news-and-research/blog/628-home-dialysis-updates-from-the-2024-usrds-annual-data-report'), S('STAT: CMS dialysis payment experiment ends two years early (Dec 2025)', 'https://www.statnews.com/2025/12/01/cms-dialysis-payment-experiment-ends-two-years-early/'), S('Foley et al., Long interdialytic interval and mortality (NEJM 2011)', 'https://pubmed.ncbi.nlm.nih.gov/?term=Foley+2011+long+interdialytic+interval+mortality')],
 'c2m1': [S('Wolfe et al., Mortality in patients on dialysis and transplant recipients (NEJM 1999)', 'https://pubmed.ncbi.nlm.nih.gov/?term=Wolfe+1999+comparison+of+mortality+dialysis+awaiting+transplantation'), S('Meier-Kriesche & Kaplan, Waiting time on dialysis and transplant outcomes (Transplantation 2002)', 'https://pubmed.ncbi.nlm.nih.gov/?term=Meier-Kriesche+Kaplan+2002+waiting+time+on+dialysis')],
 'c2m2': [S('Penn Medicine: Many kidneys discarded in the U.S. would be transplanted in France (Aubert et al., 2019)', 'https://pennmedicine.org/news/news-releases/2019/august/many-kidneys-discarded-in-the-united-states-would-be-transplanted-in-france'), S('CU Anschutz: Out-of-sequence allocation of deceased-donor organs', 'https://news.cuanschutz.edu/department-of-surgery/allocation-out-of-sequence-deceased-donor-organs')],
 'c2m3': [S('Muzaale et al., Risk of ESRD after living kidney donation (JAMA 2014)', 'https://pubmed.ncbi.nlm.nih.gov/?term=Muzaale+2014+risk+of+end-stage+renal+disease+following+live+kidney+donation'), S('Blankestijn et al., CONVINCE trial (NEJM 2023)', 'https://pubmed.ncbi.nlm.nih.gov/?term=Blankestijn+2023+hemodiafiltration+CONVINCE'), S('ClinicalTrials.gov', 'https://clinicaltrials.gov/')],
 'c3m1': [S('Goddu et al., Stigmatizing language in the medical record (J Gen Intern Med 2018)', 'https://pubmed.ncbi.nlm.nih.gov/?term=Goddu+2018+stigmatizing+language+medical+record'), S('eCFR: 45 CFR 164.526 (amendment of health information)', 'https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.526')],
 'c3m3': [],
}

TEXTFIX = [
 ("Medicare's ESRD Treatment Choices model, started in 2021, was designed to push the other way. The results so far are a slow climb, not a revolution.",
  "Medicare's ESRD Treatment Choices model, started in 2021, was designed to push the other way. It produced a slow climb, not a revolution, and Medicare ended it early, at the close of 2025."),
 ("The ESRD Treatment Choices model adjusted payments to encourage home dialysis and transplant waitlisting.",
  "The ESRD Treatment Choices model adjusted payments to encourage home dialysis and transplant waitlisting, until Medicare ended it early at the close of 2025."),
]
for n in (1, 2, 3):
    path = os.path.join(AC, f'course-{n}.json'); t = open(path).read()
    for a, b in TEXTFIX: t = t.replace(a, b)
    c = json.loads(t)
    for m in c['modules']:
        for frag, how, sc in ADD.get(m['id'], []):
            idx = [i for i, s in enumerate(m['scenes']) if frag in (s.get('text') or '')]
            assert len(idx) == 1, (m['id'], frag, idx)
            i = idx[0]
            if how == 'after': m['scenes'].insert(i + 1, sc)
            elif how == 'before': m['scenes'].insert(i, sc)
            else: m['scenes'][i] = sc
        for qtext, newq in NEWQ.get(m['id'], []):
            idx = [i for i, q in enumerate(m['quiz']) if q['q'] == qtext]
            assert len(idx) == 1, (m['id'], qtext)
            m['quiz'][idx[0]] = newq
        if m['id'] in ADD:
            urls = {s['u'] for s in m['sources']}
            for s in NEWS.get(m['id'], []) + [ITM]:
                if s['u'] not in urls: m['sources'].append(s); urls.add(s['u'])
        assert len(m['quiz']) == 10
    json.dump(c, open(path, 'w'), ensure_ascii=False, indent=1)
    print(n, [(m['id'], len(m['scenes']), sum(len((s.get('text') or '').split()) for s in m['scenes'])) for m in c['modules']])
