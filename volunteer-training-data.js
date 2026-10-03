/* Cold Ischemia Foundation — Volunteer Readiness Training: content
   10 modules x 10 questions = 100.
   Question types:
     mc   : drop-down multiple choice.  o = options, a = index of the best answer, e = explanation
     tf   : true / false.               a = true|false, e = explanation
     self : drop-down self-assessment.  o = [label, points 0-3, honest feedback]
     text : short written answer.       min = minimum characters, ph = placeholder, e = why we ask
   d = dimension scored: K Knowledge · J Judgment & boundaries · T Time · C Commitment · E Empathy · R Reflection
   c = 1 marks a critical boundary question (must be answered correctly to be rated "Ready to serve"). */
window.CIF_TRAINING = {
  version: 1,
  modules: [

  /* ───────────────────────── MODULE 1 ───────────────────────── */
  {
    id: 'why', title: "Why You're Here", kicker: 'Module 1 · Motivation',
    lesson: [
      "People come to this work for different reasons. Some have lost someone. Some are living it right now, on a dialysis chair or beside one. Some are angry at a system that keeps failing the same people the same way. Some want experience for school or a career. Every one of those reasons is valid.",
      "But motivation is only where it starts. The patients and care partners we serve don't need your reasons. They need your attention, your accuracy, and your follow-through. This first module asks you to look honestly at what brought you here, because knowing your own 'why' is what keeps you steady when the work gets hard."
    ],
    keys: ['Every reason for coming is welcome; honesty about it is required.', 'The work is about the person in front of you, not about you.', 'Advocacy is a discipline, not a feeling.'],
    q: [
      { t:'text', d:'R', min:40, q:"In one or two sentences: why do you want to volunteer with the Cold Ischemia Foundation?", ph:"Be specific. There is no wrong answer, only a vague one.", e:"We read every answer. Specific reasons tend to last longer than general ones." },
      { t:'self', d:'C', q:"Which best describes what is drawing you to this work right now?", o:[
        ["Personal experience with kidney disease, dialysis, or transplant", 3, "Lived experience is powerful. We'll help you use it to support other people's stories, not replace them."],
        ["Wanting to fix a system I can see is broken", 3, "That is exactly the work of structural advocacy. Hold on to it on the slow days."],
        ["Building experience for school or my career", 2, "Honest, and welcome. Patients will need you to keep showing up after the résumé line is earned."],
        ["A friend asked me, or I'm not sure yet", 1, "That's okay. By the end of this program you'll know."] ] },
      { t:'tf', d:'J', a:false, q:"A volunteer's own story is the most useful thing they can share with a patient who is struggling.", e:"Your story can help, but a person in crisis first needs to be heard. Lead with listening. Share your experience only if it serves them, and keep it brief." },
      { t:'self', d:'E', q:"When someone tells you something painful, what do you usually do first?", o:[
        ["Listen and let them finish", 3, "That is the single most important skill in this role."],
        ["Try to cheer them up", 1, "It comes from kindness, but it can feel like being rushed out of a feeling. We'll practice staying with it."],
        ["Share a similar experience of my own", 1, "Connection matters, but it can shift the focus onto you. Listen first; share later, if at all."],
        ["Offer a solution right away", 1, "Solutions matter, but later. People need to feel heard before they can hear options."] ] },
      { t:'text', d:'R', min:60, q:"Describe a moment when healthcare, insurance, or 'the system' failed someone you care about, or you. What did it teach you?", ph:"A few honest sentences.", e:"Structural advocacy starts with noticing patterns. Your answer helps us understand what you see." },
      { t:'mc', d:'J', q:"What does the foundation mean when it says 'advocacy is a discipline, not a feeling'?", o:[
        "Feelings have no place in advocacy",
        "Good intentions must be backed by preparation, accuracy, and follow-through",
        "Only licensed professionals are allowed to advocate",
        "Advocates should never show emotion in public" ], a:1, e:"Caring is the starting point. Discipline is what makes caring useful to someone else." },
      { t:'self', d:'C', q:"If no one ever thanked you for this work, would you still do it?", o:[
        ["Yes. The work itself is the point.", 3, "That steadiness is what this role needs."],
        ["Probably, but recognition matters to me", 2, "Honest. Much of this work is invisible, so plan for that. We do try to say thank you."],
        ["I'm not sure", 1, "Worth thinking about. A lot of this work is quiet: research, follow-ups, fact-checking."],
        ["No", 0, "Then it may be wise to wait before committing. That's a respectable decision."] ] },
      { t:'tf', d:'E', a:true, q:"Anger at the system can be useful fuel, as long as it is never aimed at the patient, the family, or the frontline staff doing their best inside it.", e:"Anger aimed at structures drives reform. Anger aimed at people in the room causes harm." },
      { t:'self', d:'C', q:"How do you handle work that is slow, detailed, and repetitive, like fact-checking, data entry, or follow-up calls?", o:[
        ["I'm good at it, or even enjoy it", 3, "This is the backbone of credible advocacy. You'll be valued."],
        ["I can do it when I know why it matters", 2, "We will always tell you why."],
        ["I find it hard but I'll push through", 1, "Honest. Choose a track that plays to your strengths, and tell us if a task drains you."],
        ["I avoid it whenever I can", 0, "Every track includes some of this. Consider it before committing."] ] },
      { t:'text', d:'R', min:30, q:"What do you hope a patient or care partner will be able to say about you after you have helped them?", ph:"\"She listened, and she followed through…\"", e:"This becomes your standard. We'll remind you of it." }
    ]
  },

  /* ───────────────────────── MODULE 2 ───────────────────────── */
  {
    id: 'foundation', title: 'The Foundation You Would Represent', kicker: 'Module 2 · Who We Are',
    lesson: [
      "The Cold Ischemia Foundation is a patient-led 501(c)(3) structural healthcare advocacy organization based in Ellenton, Florida. Our name is our mission: cold ischemia is the time a donated organ spends on ice, without blood flow, waiting. It's an inexorable clock, and delay is never neutral.",
      "We don't patch symptoms. We analyze the structure behind the failure, expose the conflicts and barriers, and push for reform that holds. Our method is Lean Six Sigma: Define, Measure, Analyze, Improve, Control. Our toolkits are free. We take $0 in pharmaceutical funding, ever. And our standard is simple: transparency is not a slogan. It is a standard."
    ],
    keys: ['501(c)(3), patient-led, Ellenton, Florida.', 'Analyze → Expose → Reform.', 'Lean Six Sigma (DMAIC). Free tools. $0 pharma funding.'],
    q: [
      { t:'mc', d:'K', q:"What kind of organization is the Cold Ischemia Foundation?", o:[
        "A for-profit healthcare consulting firm",
        "A patient-led 501(c)(3) nonprofit focused on structural healthcare advocacy",
        "A transplant center",
        "A federal government agency" ], a:1, e:"CIF is a nonprofit. That status shapes what volunteers can and cannot do, especially around elections (Module 9)." },
      { t:'mc', d:'K', q:"Where is the foundation based?", o:["Washington, D.C.","Ellenton, Florida","Atlanta, Georgia","Boston, Massachusetts"], a:1, e:"Local roots, national reach: from Ellenton, Florida to Capitol Hill." },
      { t:'tf', d:'K', a:false, q:"The foundation accepts pharmaceutical-industry funding as long as it is publicly disclosed.", e:"$0 pharma funding. Ever. Independence is what lets CIF say uncomfortable things plainly." },
      { t:'mc', d:'K', q:"What does 'structural advocacy' focus on?", o:[
        "Winning individual cases one at a time",
        "Fixing the design of the system that keeps producing the same failures",
        "Raising money for individual patients",
        "Promoting particular hospitals" ], a:1, e:"Individual help matters, but a broken design keeps producing new victims. Structural advocacy targets the design." },
      { t:'mc', d:'K', q:"Which three-part approach describes CIF's mission?", o:["Raise, Rally, Repeat","Fund, Lobby, Litigate","Analyze, Expose, Reform","Recruit, Train, Deploy"], a:2, e:"Analyze the structure behind the failure. Expose the conflicts and barriers. Reform that holds." },
      { t:'mc', d:'K', q:"Which improvement method does CIF use to analyze systemic failure?", o:["Agile","Lean Six Sigma","Design thinking","The Delphi method"], a:1, e:"Lean Six Sigma treats a failure as a process defect that can be measured, analyzed, and engineered out." },
      { t:'mc', d:'K', q:"In Lean Six Sigma, DMAIC stands for:", o:[
        "Define, Measure, Analyze, Improve, Control",
        "Decide, Map, Act, Inspect, Correct",
        "Design, Model, Apply, Implement, Close",
        "Discover, Monitor, Assess, Inform, Change" ], a:0, e:"Define the problem, Measure it, Analyze root causes, Improve the process, Control so the gains hold." },
      { t:'tf', d:'K', a:true, q:"CIF's toolkits, playbooks, and field guides are free to patients and care partners.", e:"No paywall. No gatekeeper. Point people to them freely." },
      { t:'mc', d:'K', q:"Alongside patients, who does CIF treat as central to the chronic-illness and transplant story?", o:["Hospital administrators","Care partners","Insurance brokers","Pharmaceutical representatives"], a:1, e:"Care partners carry enormous unpaid work, usually without legal protection or compensation. Module 4 is about them." },
      { t:'mc', d:'J', q:"CIF's standard says: 'Transparency is not a slogan. It is a standard.' For a volunteer, that means:", o:[
        "Sharing everything you hear, with everyone",
        "Saying what you know, citing where it comes from, and saying plainly when you don't know",
        "Only speaking when you are 100% certain of everything",
        "Publishing patient stories so people see the truth" ], a:1, e:"Transparency is about honesty and sourcing, never about exposing private information." }
    ]
  },

  /* ───────────────────────── MODULE 3 ───────────────────────── */
  {
    id: 'clock', title: 'The Clock: Kidney Disease & Transplant Basics', kicker: 'Module 3 · System Literacy',
    lesson: [
      "You don't need to be a clinician. You do need a working understanding of how the system works, so you can explain it in plain language and know when to send someone to a professional. When kidneys fail, the two main treatments are dialysis and transplantation. Dialysis keeps people alive, but it doesn't replace everything healthy kidneys do.",
      "Kidneys are by far the most-needed organ on the U.S. transplant waiting list. Deceased-donor organs are recovered by regional Organ Procurement Organizations (OPOs), and the national waiting list and matching system is run by the Organ Procurement and Transplantation Network (OPTN). Once an organ is recovered, the cold ischemia clock is running. Not every recovered kidney is transplanted, and examining why is part of CIF's work."
    ],
    keys: ['Dialysis or transplant: the two main treatments for kidney failure.', 'Cold ischemia time: organ chilled, without blood flow, before transplant.', 'OPOs recover organs; the OPTN manages the national list and matching.'],
    q: [
      { t:'mc', d:'K', q:"What is 'cold ischemia time'?", o:[
        "The time a patient spends in a cold operating room",
        "The time a donated organ spends chilled, without blood supply, between recovery and transplant",
        "The recovery period after surgery",
        "The time between a diagnosis and a first dialysis session" ], a:1, e:"It's the foundation's namesake, the inexorable clock that runs while something vital waits." },
      { t:'tf', d:'K', a:true, q:"In general, longer cold ischemia time is associated with worse outcomes for a transplanted kidney.", e:"Every additional hour adds risk. That's why delay is never neutral." },
      { t:'mc', d:'K', q:"Which organ do the most people on the U.S. transplant waiting list need?", o:["Liver","Heart","Kidney","Lung"], a:2, e:"Kidneys, by far. The large majority of people on the national waiting list are waiting for one." },
      { t:'mc', d:'K', q:"What are the two main treatments for kidney failure?", o:["Surgery or chemotherapy","Dialysis or a kidney transplant","Antibiotics or rest","Diet changes or physical therapy"], a:1, e:"Diet and medication matter, but when kidneys fail, it's dialysis or transplant." },
      { t:'tf', d:'K', a:false, q:"Dialysis fully replaces everything healthy kidneys do.", e:"Dialysis filters waste and fluid, but it doesn't fully replace natural kidney function, and it takes a heavy toll on daily life." },
      { t:'mc', d:'K', q:"In-center hemodialysis typically means:", o:[
        "One short session a month",
        "About three sessions a week, often three to four hours each",
        "A single procedure that cures kidney failure",
        "A daily pill taken at home" ], a:1, e:"Add travel and recovery time and dialysis can consume most of a week. That's part of why care partners carry so much." },
      { t:'mc', d:'K', q:"Who generally recovers organs from deceased donors in a region?", o:["The patient's family doctor","An Organ Procurement Organization (OPO)","The patient's insurance company","A funeral home"], a:1, e:"OPO performance varies widely. That variation is one of the structural issues advocates examine." },
      { t:'tf', d:'K', a:true, q:"A healthy person can donate a kidney while alive and typically lives a full life with one kidney.", e:"Living donation is a major source of kidneys. Questions about a person's own eligibility always go to a transplant center." },
      { t:'mc', d:'K', q:"What is the OPTN?", o:[
        "A private insurance network",
        "The national network that manages the U.S. organ transplant waiting list and matching system",
        "A pharmaceutical trade association",
        "A patient support hotline" ], a:1, e:"The Organ Procurement and Transplantation Network. Its public data is a primary source for advocacy." },
      { t:'tf', d:'K', a:true, q:"Not every kidney recovered from a donor ends up being transplanted.", e:"A significant share of recovered kidneys are not used. Understanding why is exactly the kind of structural question CIF investigates." }
    ]
  },

  /* ───────────────────────── MODULE 4 ───────────────────────── */
  {
    id: 'carepartners', title: 'Care Partners: The Invisible Workforce', kicker: 'Module 4 · Care Partners',
    lesson: [
      "Fifty-five million Americans are managing a loved one's chronic illness right now, without legal protection, without compensation, and usually without a platform built for them. They drive to dialysis, manage medications, fight insurance denials, sit in waiting rooms, and lie awake at night.",
      "Care partners often feel they aren't allowed to struggle because they aren't the patient. They are. Exhaustion, guilt, resentment, and deep love can all live in the same person on the same day. Your role is to see them, believe them, and connect them to real resources, while remembering that the patient makes decisions about the patient's own care."
    ],
    keys: ['55 million Americans are care partners right now.', 'No legal protection, no compensation, rarely seen.', 'Validate, inform, connect. Never take sides on a patient\'s care decision.'],
    q: [
      { t:'mc', d:'K', q:"By CIF's count, about how many Americans are managing a loved one's chronic illness right now?", o:["5 million","15 million","55 million","200 million"], a:2, e:"Fifty-five million people, most of them unseen by the systems they navigate every day." },
      { t:'tf', d:'K', a:false, q:"Most care partners have formal legal protections and are paid for the care work they do.", e:"Most do this work without legal protection and without compensation." },
      { t:'mc', d:'E', q:"A care partner says, 'I'm not the patient, so I shouldn't complain.' Which response is best?", o:[
        "\"You're right, the patient has it much worse.\"",
        "\"What you're carrying is real, and it matters too. What's been the hardest part?\"",
        "\"You should join a gym to relieve stress.\"",
        "\"Let's focus on the patient instead.\"" ], a:1, e:"Validation first. Then curiosity. Care partners rarely hear either." },
      { t:'mc', d:'J', q:"A care partner asks you whether her husband should switch dialysis centers. What do you do?", o:[
        "Tell her which center you think is better",
        "Help her write down her questions and concerns, and suggest she raise them with his care team or the center's social worker",
        "Tell her to stay put; switching is too risky",
        "Search online reviews together and decide" ], a:1, e:"You equip people to decide. You don't decide for them, and you don't give clinical advice." },
      { t:'tf', d:'E', a:true, q:"Exhaustion, resentment, and guilt can all exist alongside deep love in a care partner.", e:"Hearing this without judgment is one of the kindest things you can offer." },
      { t:'mc', d:'K', q:"Which of these is NOT typically part of a dialysis care partner's load?", o:["Managing medications and appointments","Transportation to and from treatment","Insurance and benefits paperwork","Prescribing the patient's treatment"], a:3, e:"Care partners do almost everything except the clinical decisions, which belong to the patient and their care team." },
      { t:'mc', d:'E', q:"A care partner tells you she hasn't slept in two days and feels 'like I'm disappearing.' What is the best response?", o:[
        "Tell her to take a vacation",
        "Listen, acknowledge how much she's carrying, gently ask whether she's safe and has support, share CIF care-partner resources, and if there's any sign of crisis, give her 988",
        "Change the subject to something lighter",
        "Tell her everyone feels that way sometimes" ], a:1, e:"Listen, acknowledge, check safety, connect. 988 is the Suicide & Crisis Lifeline; call or text, 24/7." },
      { t:'tf', d:'J', a:false, q:"If a care partner and a patient disagree about a treatment choice, the volunteer should side with whoever seems more reasonable.", e:"The patient decides about their own care. You can help both of them get information and talk to each other. You don't take sides." },
      { t:'self', d:'E', q:"Have you been a care partner, or closely supported one?", o:[
        ["Yes, I am one right now", 3, "Thank you. Protect your own capacity; we'll help you size your commitment to fit."],
        ["Yes, in the past", 3, "That understanding will be felt by the people you help."],
        ["I've been close to someone who was", 2, "You've seen it up close. Keep listening for what's different in each story."],
        ["No", 2, "Many excellent volunteers haven't. Listening carefully matters more than shared experience."] ] },
      { t:'text', d:'R', min:20, q:"Name one thing you think care partners need that the healthcare system rarely gives them.", ph:"One honest answer.", e:"Your answer helps shape the care-partner tools we build next." }
    ]
  },

  /* ───────────────────────── MODULE 5 ───────────────────────── */
  {
    id: 'time', title: 'Your Time, Honestly', kicker: 'Module 5 · Availability',
    lesson: [
      "The most common reason volunteer relationships fail isn't lack of caring. It's overpromising. A patient waiting on a promised call, a partner waiting on a draft, a hearing that needs a prepared voice: each depends on someone doing what they said they'd do, when they said they'd do it.",
      "Answer this module as you actually are, not as you wish your calendar looked. Fewer hours kept faithfully are worth more than many hours promised and missed. If your time is limited, there are project-based tracks where your work still counts. Honesty here protects the people you'd serve, and it protects you."
    ],
    keys: ['Consistency matters more than intensity.', 'Patient-facing tracks need reliable response times.', 'It is okay to give less. It is not okay to promise more.'],
    q: [
      { t:'self', d:'T', q:"In a typical month, how many hours can you realistically give, after work, family, health, and rest?", o:[
        ["1–4 hours", 1, "A real contribution. Project-based tracks like content review or research fit well."],
        ["5–9 hours", 2, "Enough for most non-urgent tracks, and some patient-support work."],
        ["10–19 hours", 3, "Strong capacity. Make sure it is sustainable for months, not weeks."],
        ["20 or more hours", 3, "Generous. Check that it leaves room for rest; burnout helps no one."] ] },
      { t:'self', d:'T', q:"How predictable is your schedule from week to week?", o:[
        ["Very predictable", 3, "That makes you a good fit for time-sensitive roles."],
        ["Mostly predictable", 2, "Workable for most tracks."],
        ["It changes often", 1, "Choose work with flexible deadlines, and tell us your constraints."],
        ["Completely unpredictable", 0, "Project-based or as-needed work will fit better than patient-facing roles."] ] },
      { t:'self', d:'T', q:"Patient-support volunteers often need to reply within 48 hours. Could you do that reliably?", o:[
        ["Yes, reliably", 3, "Good. That reliability is a form of respect."],
        ["Most of the time", 2, "Let your CIF contact know your typical response window."],
        ["Only sometimes", 1, "Consider tracks that aren't time-sensitive."],
        ["No", 0, "That's fine. Choose a non-patient-facing track where deadlines are set in advance."] ] },
      { t:'self', d:'T', q:"How many other volunteer or caregiving commitments do you carry right now?", o:[
        ["None", 3, "You have room to commit."],
        ["One", 2, "Manageable. Keep both realistic."],
        ["Two", 1, "Be careful about stacking commitments; start small with us."],
        ["Three or more", 0, "Overcommitment is a common way volunteers burn out. Consider starting with one small project."] ] },
      { t:'self', d:'T', q:"When are you usually available?", o:[
        ["Weekday daytime", 3, "Useful for agency and office contact during business hours."],
        ["Weekday evenings", 3, "Great for writing, research, and follow-ups."],
        ["Weekends only", 2, "Workable for content, data, and event tracks."],
        ["It varies a lot", 1, "Tell us; we'll match you to work with flexible timing."] ] },
      { t:'self', d:'T', q:"Over the next six months, do you expect major life changes, such as a move, new job, new baby, surgery, or exams?", o:[
        ["No", 3, "Good stability for a lasting commitment."],
        ["Possibly", 2, "Plan for it and let us know early if it happens."],
        ["Yes, one", 1, "Consider starting after it settles, or with a short project."],
        ["Yes, several", 0, "It may be kinder to yourself to start later. We'll be here."] ] },
      { t:'tf', d:'C', a:true, q:"Committing to fewer hours and keeping that promise is better than committing to many and falling short.", e:"Reliability is what people remember. Promise what you can keep." },
      { t:'self', d:'T', q:"Can you set aside 2–3 hours for orientation and onboarding in your first month?", o:[
        ["Yes", 3, "Great. Orientation is required before any patient-facing work."],
        ["Probably", 2, "Block it on your calendar now."],
        ["It would be difficult", 1, "Tell us; we'll try to break it into smaller sessions."],
        ["No", 0, "Orientation is required, so it's best to wait until you can fit it in."] ] },
      { t:'mc', d:'J', q:"Your schedule changes and you can no longer keep your committed hours. What should you do?", o:[
        "Quietly do less and hope no one notices",
        "Tell your CIF contact as soon as you know, and work out a new plan together",
        "Stop responding until things calm down",
        "Ask another volunteer to cover without telling anyone" ], a:1, e:"Life happens. Silence doesn't serve anyone. Telling us early lets us protect the people depending on you." },
      { t:'self', d:'T', q:"How long do you expect to sustain your commitment?", o:[
        ["Less than 3 months", 1, "A short project may be the right fit."],
        ["3–6 months", 2, "Good for a defined project or campaign."],
        ["6–12 months", 3, "Long enough to build real relationships and skill."],
        ["A year or more", 3, "That continuity is invaluable, especially in patient support."] ] }
    ]
  },

  /* ───────────────────────── MODULE 6 ───────────────────────── */
  {
    id: 'commitment', title: 'Commitment & Reliability', kicker: 'Module 6 · Follow-Through',
    lesson: [
      "Reliability is a form of respect. When you tell a frightened care partner you'll call back Thursday, Thursday becomes something they're holding on to. When you tell a partner organization you'll deliver a draft, they plan around it.",
      "Reliable volunteers aren't people who never fall short. They're people who keep track of what they promised, document what they did, finish what they start, and speak up early when something slips. This module asks how you work, because how you work is what people will feel."
    ],
    keys: ['Track every commitment. Document what you did and said.', 'If something slips, say so early and set a new date.', 'Silence is the most harmful way to fall short.'],
    q: [
      { t:'self', d:'C', q:"When you say you'll do something by Friday, how often is it done by Friday?", o:[
        ["Almost always", 3, "That's the standard. Keep it."],
        ["Usually", 2, "Good. Build in a buffer for the times it isn't."],
        ["About half the time", 1, "Honest. Promise less, and use a reminder system."],
        ["Rarely", 0, "Worth working on before taking patient-facing commitments."] ] },
      { t:'mc', d:'C', q:"You promised a care partner a callback with a resource by Thursday, but you haven't found it yet. What do you do?", o:[
        "Wait until you find it, then call",
        "Call on Thursday anyway, explain where things stand, and give a new date",
        "Send a vague text saying you're busy",
        "Ask her to call you when she's free" ], a:1, e:"Keeping the appointment, even with partial news, tells her she matters. A missed call tells her the opposite." },
      { t:'tf', d:'C', a:false, q:"If a task feels too small to matter, it's fine to let it slide without telling anyone.", e:"Small tasks often have people waiting at the other end. If it slides, say so." },
      { t:'self', d:'C', q:"How do you keep track of your commitments?", o:[
        ["A calendar or task system I check daily", 3, "Ideal."],
        ["A mix of notes and memory", 2, "Consider putting CIF commitments somewhere you'll see them every day."],
        ["Mostly memory", 1, "Memory fails under stress. A simple list will protect you and the people you serve."],
        ["I don't really keep track", 0, "Start a system before you start volunteering."] ] },
      { t:'mc', d:'C', q:"Why does CIF ask volunteers to document what they did and said?", o:[
        "To monitor volunteers' every move",
        "So there is an accurate record that protects the person served, the volunteer, and the foundation",
        "To publish it later",
        "It's only a formality" ], a:1, e:"Good records mean continuity if someone else picks up a case, and clarity if questions ever arise." },
      { t:'self', d:'C', q:"When work gets frustrating or slow, what do you tend to do?", o:[
        ["Keep going and ask for help when I'm stuck", 3, "Exactly right."],
        ["Step away briefly, then come back to it", 3, "A healthy rhythm."],
        ["Push through alone until I'm exhausted", 1, "Common, and risky. Asking for help is part of the job."],
        ["Lose interest quietly", 0, "Quiet disappearance is the hardest thing for a team to recover from. Tell us instead."] ] },
      { t:'tf', d:'C', a:true, q:"Going silent, not answering messages for weeks, is a common way volunteer relationships end, and it leaves real people waiting.", e:"A two-line message ('I need to step back for a month') prevents real harm." },
      { t:'mc', d:'J', q:"You'll be traveling for three weeks with little connectivity. What do you do?", o:[
        "Nothing; it's only three weeks",
        "Tell your CIF contact ahead of time and hand off or pause open tasks",
        "Set an auto-reply and leave it at that",
        "Promise to catch up on everything when you're back" ], a:1, e:"Planned absences are fine. Unannounced ones leave gaps that people fall into." },
      { t:'self', d:'C', q:"How do you respond when someone corrects your work?", o:[
        ["Thank them and fix it", 3, "That makes you easy to work with and safe to trust."],
        ["Fix it, though it stings a little", 2, "Normal. What matters is that you fix it."],
        ["Explain why I was right", 1, "Discussion is fine, but accuracy comes first. Be ready to be wrong."],
        ["Avoid the conversation", 0, "Feedback is how we keep patients safe. Practice receiving it."] ] },
      { t:'text', d:'C', min:25, q:"What is one specific commitment you are confident you can keep every month?", ph:"e.g., \"Four hours on the second Saturday reviewing toolkit drafts.\"", e:"Specific commitments get kept. Vague ones get forgotten." }
    ]
  },

  /* ───────────────────────── MODULE 7 ───────────────────────── */
  {
    id: 'boundaries', title: 'Boundaries & Confidentiality', kicker: 'Module 7 · The Lines We Hold',
    lesson: [
      "This is the most important module in the program. CIF volunteers are non-clinical, non-legal advocates. When someone asks a medical, legal, or financial question, you recognize the line immediately and connect them to a qualified professional. You never guess, reassure beyond your knowledge, or make promises about outcomes.",
      "What people tell you is held in confidence by default, as if it were your own medical record. No story is shared, quoted, or posted without the person's explicit, informed consent for that specific use. Disclose conflicts of interest before they become problems. Decline personal gifts. If someone may be in danger, take it seriously: 911 for immediate danger, 988 for the Suicide & Crisis Lifeline. And always tell your CIF contact."
    ],
    keys: ['No medical, legal, or financial advice. Refer, every time.', 'Confidential by default. Consent before any story is shared.', 'Crisis: 911 for immediate danger · 988 call or text · tell your CIF contact.'],
    q: [
      { t:'mc', d:'J', c:1, q:"A patient asks: 'Should I stop taking this medication? It makes me feel awful.' What do you say?", o:[
        "\"If it makes you feel that bad, it's probably okay to stop.\"",
        "\"That's an important question for your doctor or pharmacist. Please don't stop without talking to them. Can I help you write down what you're experiencing to bring to them?\"",
        "\"I read online that a lot of people stop it.\"",
        "\"Try taking half for a while and see.\"" ], a:1, e:"Never advise on medications. Do help the person bring their concern to the right professional." },
      { t:'tf', d:'J', c:1, a:false, q:"Because CIF isn't a hospital, it's fine to share a patient's health details with others as long as you leave out their last name.", e:"Confidentiality is CIF's default, whether or not a law requires it. Details can identify someone even without a name." },
      { t:'mc', d:'J', c:1, q:"You want to share a powerful patient story on social media to raise awareness. What is required first?", o:[
        "Nothing, if you change the name",
        "Explicit, informed consent from that person for that specific use, and CIF approval for anything posted on CIF's behalf",
        "Approval from another volunteer",
        "Nothing, if the story is already public somewhere" ], a:1, e:"Their story belongs to them. Ask, explain exactly how it will be used, and respect a no." },
      { t:'mc', d:'J', c:1, q:"During a conversation, someone tells you they're thinking about ending their life. What do you do?", o:[
        "Change the subject to something more hopeful",
        "Take it seriously, stay with them, urge them to call or text 988 now (or 911 if they're in immediate danger), and notify your CIF contact",
        "Promise to keep it a secret",
        "Tell them things will get better and end the call" ], a:1, e:"You're not their counselor, but you can be the bridge to one. Never promise secrecy when someone's safety is at risk." },
      { t:'tf', d:'J', a:false, q:"Telling a patient 'Don't worry, you'll definitely get a kidney soon' is a kind way to keep their spirits up.", e:"False certainty is a broken promise waiting to happen. Offer presence and real information instead." },
      { t:'mc', d:'J', q:"A family you helped offers you $100 as a thank-you. What do you do?", o:[
        "Accept it; you earned it",
        "Thank them warmly, decline the personal gift, and let your CIF contact know",
        "Accept it and donate it later",
        "Ask for a smaller amount" ], a:1, e:"Personal gifts blur the relationship. Gratitude is enough." },
      { t:'mc', d:'J', c:1, q:"You used to work for a large dialysis provider. What should you do?", o:[
        "Keep it to yourself; it was in the past",
        "Disclose it to CIF before you start, so the foundation can decide how to handle any conflict of interest",
        "Mention it only if someone asks",
        "Use your inside knowledge in public posts" ], a:1, e:"Disclosure isn't an accusation. It's how trust is built. Many past affiliations are fine once disclosed." },
      { t:'tf', d:'J', a:true, q:"If a patient asks a legal question about an insurance denial, a volunteer can point them to CIF's toolkits and suggest they consult a qualified professional, but should not give legal advice.", e:"Tools and referrals, yes. Legal opinions, no." },
      { t:'mc', d:'J', q:"A reporter calls and asks you to comment on a transplant center's practices. What do you do?", o:[
        "Give your honest opinion as a CIF volunteer",
        "Explain that you don't speak on CIF's behalf and refer them to foundation leadership",
        "Decline and hang up",
        "Share what patients have told you, without names" ], a:1, e:"Media statements come from the foundation. That protects patients, you, and CIF's credibility." },
      { t:'mc', d:'J', c:1, q:"You see another volunteer sharing private patient details in a group chat. What do you do?", o:[
        "Ignore it; it isn't your business",
        "Report it promptly to your CIF contact",
        "Reply-all scolding them",
        "Screenshot it and post about it" ], a:1, e:"Escalation is one of CIF's core responsibilities, including when it's uncomfortable." }
    ]
  },

  /* ───────────────────────── MODULE 8 ───────────────────────── */
  {
    id: 'crisis', title: 'Talking With People in Crisis', kicker: 'Module 8 · Communication',
    lesson: [
      "Patients and families often reach us at their worst moments: a new diagnosis, a denied claim, a call that didn't come, a funeral. They may be grieving, terrified, or furious. Your job isn't to fix the feeling. It's to listen fully, reflect back what you heard, speak in plain language, and help them find their next step.",
      "Avoid platitudes ('everything happens for a reason'). Let silence breathe. Accept anger without defending the system. Ask about language needs and help people request a qualified interpreter. Advocate for every person with the same rigor, regardless of diagnosis, background, or how easy they are to help."
    ],
    keys: ['Listen fully. Reflect. Then inform.', 'Plain language, never jargon.', 'Same rigor for everyone. Equity is not optional.'],
    q: [
      { t:'mc', d:'E', q:"A patient says, 'I'm so tired of fighting.' Which response best validates them?", o:[
        "\"Stay positive! You've got this.\"",
        "\"That sounds exhausting. You've been carrying so much. What's been the hardest part lately?\"",
        "\"Others have it much worse.\"",
        "\"Have you tried meditation?\"" ], a:1, e:"Name the feeling, honor the effort, invite them to say more." },
      { t:'tf', d:'E', a:true, q:"When someone is angry at the system, the most helpful thing is often to let them finish without defending the system.", e:"Being heard calms people more than being corrected." },
      { t:'mc', d:'E', q:"Which is the clearest way to explain cold ischemia time to a frightened family?", o:[
        "\"It's the interval of hypothermic preservation preceding reperfusion.\"",
        "\"It's the time the donated kidney spends on ice, without blood flow, before it's placed in the patient.\"",
        "\"It's a technical thing the surgeons handle.\"",
        "\"It's not something you need to worry about.\"" ], a:1, e:"Plain language respects people. Jargon makes them feel shut out." },
      { t:'mc', d:'E', q:"A patient speaks limited English. What's the best approach?", o:[
        "Speak louder and slower",
        "Ask about their preferred language and help them request a qualified interpreter; don't rely on their children to translate",
        "Use a translation app for everything, including medical details",
        "Ask a bilingual family member to handle it" ], a:1, e:"Patients have a right to understand their own care. Children shouldn't carry medical conversations for their parents." },
      { t:'tf', d:'E', a:true, q:"Patients who are rude or difficult deserve the same quality of advocacy as anyone else.", e:"The system already sorts people by how easy they are to help. We don't." },
      { t:'mc', d:'E', q:"What does 'empowerment' mean in CIF's work?", o:[
        "Making decisions for people who are overwhelmed",
        "Giving people the information and support to make their own decisions",
        "Telling people what you would do in their place",
        "Fighting their battles for them" ], a:1, e:"Respect a person's choice, even when you would choose differently." },
      { t:'mc', d:'E', q:"A mother calls. Her son died while waiting for a transplant. What is the best first step?", o:[
        "Explain how the waiting list works",
        "Offer your condolences, then listen and let her lead the conversation",
        "Tell her about CIF's policy work right away",
        "Suggest grief counseling and end the call" ], a:1, e:"Information can come later, if she wants it. First, she needs to be heard." },
      { t:'tf', d:'E', a:false, q:"Saying 'everything happens for a reason' usually comforts people who are grieving.", e:"It often feels dismissive. 'I'm so sorry. I'm here' is usually better." },
      { t:'mc', d:'E', q:"Silence during a hard conversation is:", o:[
        "Awkward and should be filled quickly",
        "Often okay. It gives the person space to think and feel.",
        "A sign the call has gone badly",
        "A cue to end the conversation" ], a:1, e:"A few seconds of silence can be the most respectful thing in the conversation." },
      { t:'self', d:'E', q:"How comfortable are you staying present with someone's strong emotions, like crying or anger, without trying to fix them?", o:[
        ["Very comfortable", 3, "That's a gift. Patient-support tracks may be a strong fit."],
        ["Fairly comfortable", 2, "Good. It grows with practice and debriefing."],
        ["Somewhat uncomfortable", 1, "Honest. Start in a non-patient-facing track and build up."],
        ["Very uncomfortable", 0, "That's useful self-knowledge. Content, data, and operations tracks matter just as much."] ] }
    ]
  },

  /* ───────────────────────── MODULE 9 ───────────────────────── */
  {
    id: 'advocacy', title: 'Advocacy Done Right', kicker: 'Module 9 · Accuracy & Conduct',
    lesson: [
      "Credibility is the only currency an advocacy organization has. When you speak or write for CIF, you represent its positions exactly as documented, not as you remember them, and not stronger or softer than they are. Every number has a source. If you don't know, you say so and follow up.",
      "As a 501(c)(3), CIF educates and advocates on policy. It never endorses or opposes candidates for office. Respect is strategy: officials who disagree today may vote with patients tomorrow. On your personal social media, make clear your opinions are your own. And never exaggerate. A real problem doesn't need inflated numbers."
    ],
    keys: ['Positions as documented. Numbers with sources.', 'Nonpartisan: never endorse or oppose candidates.', 'Respectful disagreement. Personal views labeled as personal.'],
    q: [
      { t:'mc', d:'J', q:"When you speak for CIF, you should present its positions:", o:[
        "As you remember them",
        "Exactly as documented, citing the source",
        "A bit stronger, to make an impact",
        "Softened, to avoid conflict" ], a:1, e:"Precision, not paraphrase." },
      { t:'tf', d:'K', a:false, q:"As a 501(c)(3), CIF can endorse a candidate for Congress if that candidate supports transplant reform.", e:"501(c)(3) organizations may not endorse or oppose candidates. CIF can educate on issues and legislation." },
      { t:'mc', d:'J', q:"A legislative staffer asks you for a statistic you're not sure of. What do you do?", o:[
        "Give your best guess",
        "Say you'll confirm it, then follow up promptly with the sourced number",
        "Change the subject",
        "Cite a number you saw on social media" ], a:1, e:"\"Let me confirm that and get back to you today\" builds more credibility than any guess." },
      { t:'mc', d:'J', q:"Before sharing a dramatic transplant statistic you saw online, you should:", o:[
        "Share it quickly while it's trending",
        "Verify it against a primary source, such as OPTN or SRTR data or peer-reviewed research, and check with CIF before using it on CIF's behalf",
        "Share it with a disclaimer",
        "Trust it if it has many shares" ], a:1, e:"One wrong number can discredit a hundred right ones." },
      { t:'tf', d:'J', a:false, q:"Being respectful to an official who disagrees with CIF makes the advocacy weaker.", e:"You can disagree firmly without being adversarial. Respect keeps doors open." },
      { t:'mc', d:'J', q:"On your personal social media, when you post your own opinions about transplant policy:", o:[
        "Imply they're CIF's position to give them weight",
        "Make clear they're your personal views, not CIF's official positions",
        "Tag CIF so more people see them",
        "Post anonymously" ], a:1, e:"You're always free to have opinions. Just don't let them be mistaken for the foundation's." },
      { t:'mc', d:'K', q:"Which is a primary source for U.S. transplant data?", o:["A viral social media post","An online patient forum","OPTN and SRTR public data","An opinion blog"], a:2, e:"OPTN (the national network) and SRTR (the Scientific Registry of Transplant Recipients) publish the official data." },
      { t:'tf', d:'J', a:false, q:"It's acceptable to exaggerate a statistic slightly if it helps people pay attention to a real problem.", e:"Never. The truth, told plainly, is CIF's standard." },
      { t:'mc', d:'J', q:"A partner organization's position conflicts with CIF's. How do you handle a joint meeting?", o:[
        "Quietly agree with them to keep the peace",
        "Represent CIF's position clearly and respectfully, disagree without becoming adversarial, and report back to your CIF contact",
        "Argue until they change their position",
        "Skip the meeting" ], a:1, e:"Clarity and respect together. That's how coalitions survive disagreement." },
      { t:'mc', d:'K', q:"Which volunteer track prepares people for contact with congressional and agency offices?", o:["Events & community outreach","Policy & legislative outreach","Digital & social media","Administrative & operations support"], a:1, e:"Policy & legislative outreach: research, drafting, and direct contact with offices, always on documented positions." }
    ]
  },

  /* ───────────────────────── MODULE 10 ───────────────────────── */
  {
    id: 'pledge', title: 'Sustaining Yourself, and Your Pledge', kicker: 'Module 10 · Resilience & Commitment',
    lesson: [
      "You will hear things that stay with you. Feeling heavy after a hard conversation doesn't mean you aren't suited for this work. It means you're human. What matters is having a way to process it: debriefing with your CIF contact while protecting confidentiality, people who support you, and practices that restore you.",
      "Compassion fatigue is real, and planned breaks are responsible, not a failure. This last module brings everything together and asks for your commitment in your own words. Thank you for taking this seriously. The people we serve deserve volunteers who did."
    ],
    keys: ['Heaviness is normal. Silence about it is the risk.', 'Debrief safely. Rest deliberately.', 'Your pledge, in your own words.'],
    q: [
      { t:'tf', d:'E', a:false, q:"Feeling heavy after hearing someone's painful story is a sign you're not suited for this work.", e:"It's a sign you were listening. What matters is having a healthy way to process it." },
      { t:'mc', d:'E', q:"Which is a healthy way to process a hard conversation?", o:[
        "Keep it all to yourself",
        "Debrief with your CIF contact while protecting the person's confidentiality, then do something restorative",
        "Post about it on social media to release it",
        "Retell the details to friends" ], a:1, e:"Debriefing within the team protects both you and the person you helped." },
      { t:'self', d:'E', q:"Do you have people or practices that help you recover from stress?", o:[
        ["Yes, several", 3, "Use them deliberately, especially after hard days."],
        ["One or two", 2, "Good. Protect them."],
        ["Not really", 1, "Worth building before patient-facing work. We'll share ideas at orientation."],
        ["No", 0, "Please start with a lower-intensity track, and let us help you build support."] ] },
      { t:'mc', d:'E', q:"What is compassion fatigue?", o:[
        "Losing interest in a cause",
        "Emotional and physical exhaustion that can come from caring for people in distress",
        "Being too kind to people",
        "A medical diagnosis requiring medication" ], a:1, e:"Signs include numbness, irritability, dread, and trouble sleeping. Naming it early helps." },
      { t:'tf', d:'E', a:true, q:"Taking a planned break from volunteering, and telling CIF, is a responsible choice, not a failure.", e:"Sustainable advocates take breaks. Telling us means no one is left waiting." },
      { t:'self', d:'C', q:"After everything you've learned, how ready do you feel to commit?", o:[
        ["Ready, with clear eyes", 3, "We're glad you're here."],
        ["Ready, with a few concerns I'd like to discuss", 2, "Good. Raise them in your application; we'll talk."],
        ["I need more time to decide", 1, "That's a wise answer. Your progress is saved."],
        ["Not right now", 0, "An honest, respectable decision. Our free tools are always yours."] ] },
      { t:'mc', d:'J', q:"Which statement best summarizes a CIF volunteer's role?", o:[
        "A substitute for doctors and lawyers when patients can't reach them",
        "A trained, non-clinical advocate who listens, informs, connects people to the right resources, and helps hold the system accountable, within clear boundaries",
        "A fundraiser for individual patients",
        "A spokesperson free to speak for CIF on any topic" ], a:1, e:"That's the role, in one sentence." },
      { t:'text', d:'R', min:30, q:"Which volunteer track fits you best right now, and why?", ph:"Patient & care-partner support, policy outreach, content, data, digital, events, or operations.", e:"This helps us place you well from day one." },
      { t:'text', d:'R', min:15, q:"What support from the foundation would help you succeed?", ph:"Training, a mentor, check-ins, templates…", e:"We'd rather know now than guess later." },
      { t:'text', d:'C', min:40, q:"Write your commitment in your own words.", ph:"\"I will protect what people tell me, stay within my role, tell the truth, and show up when I say I will…\"", e:"This pledge is included with your training summary on your application." }
    ]
  }
  ]
};
