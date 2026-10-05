/* Cold Ischemia Foundation: the keyless writing engine.
   The Toolkit's instruments used to ask every visitor for a paid Anthropic API key. They now run here instead:
   no key, no account, nothing leaves the visitor's browser. This is NOT a chat model. It is a rules-based writer:
   every sentence below was written by a person, and what changes from visitor to visitor is which sentences are
   chosen and how the visitor's own words, scores and selections are woven in.
   Each instrument adds a module to window.CIFLocal and returns the same text format its page already renders. */
(function () {
  'use strict';
  var L = window.CIFLocal = window.CIFLocal || {};

  /* ---------- helpers ---------- */
  L.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
  L.clean = function (s, n) {                      // visitor text -> safe single line for embedding
    s = String(s == null ? '' : s).replace(/[#*_`]/g, '').replace(/\s+/g, ' ').trim();
    if (n && s.length > n) s = s.slice(0, n).replace(/\s+\S*$/, '') + '…';
    return L.esc(s);
  };
  L.hash = function (s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  L.pick = function (arr, key) { return arr[L.hash(key) % arr.length]; };
  L.list = function (a) { a = a.filter(Boolean); if (a.length < 2) return a[0] || ''; return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; };
  L.num = function (v) { var n = parseFloat(v); return isNaN(n) ? null : n; };
  L.cap = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
  L.delay = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };   // a short, honest pause so the result feels considered

  /* ====================================================================================================
     SIGNAL: the system intelligence report (Lean Six Sigma + Frankl). Returns markdown with four H3s.
     ctx: {wasteVals:[{name,id,sev}], wasteTotal, criticalWastes:[], domWaste:{name,id,sev}, spc:{mean,sigma,UCL,LCL,ooc},
           weekVals:[], causes:{CATEGORY:[causes]}, causeCount, problem, p1..p6, loadEff}
  ==================================================================================================== */
  var WASTE_PHRASE = {
    defects: 'every unclear instruction becomes a second trip, a second phone call, a second chance for something to go wrong',
    overprod: 'work done out of fear rather than need, which feels like vigilance and functions like erosion',
    waiting: 'hours that are neither work nor rest, taken from you by queues you did not build',
    talent: 'the skills you carry that nothing in this system has ever asked you to use',
    transport: 'the miles, the parking, the pharmacy runs, each one a small tax on a person already overdrawn',
    inventory: 'too many numbers, names, doses and deadlines held in one head at the same time',
    motion: 'the third time you explain the same history to a stranger holding a clipboard',
    process: 'forms and authorizations that consume your hours and serve no one’s recovery'
  };
  var WASTE_CAT = { defects: 'PEOPLE', overprod: 'PSYCHOLOGY', waiting: 'POLICY/SYSTEM', talent: 'PSYCHOLOGY', transport: 'ENVIRONMENT', inventory: 'RESOURCES', motion: 'PROCESS', process: 'POLICY/SYSTEM' };
  var CAT_NARR = {
    'PEOPLE': {
      up: 'The upstream problem is human, and it is the oldest one in caregiving: the work has collapsed onto one pair of shoulders. When no one else is trained, named or willing, every task routes to you by default, and the system learns that you will always absorb it.',
      flow: 'That is why communication failures keep repeating, why the backup plan lives only in your head, and why even a good week cannot be banked. Nothing is shared, so nothing is stored.'
    },
    'PROCESS': {
      up: 'The upstream problem is that your care runs on reaction. There is no handoff, no standing plan for the bad night, no written way for anyone else to step in. Every crisis is therefore the first crisis.',
      flow: 'A system without a standard way of doing things must re-decide everything, every time. That is where the duplication comes from, and why exhaustion arrives so much faster than the workload alone would predict.'
    },
    'ENVIRONMENT': {
      up: 'The upstream problem is physical and geographic: the place where you live and work was never arranged for what you are doing. Distance, stairs and the absence of any room that belongs to you turn small tasks into expeditions.',
      flow: 'Movement costs stack on top of recovery costs. You pay twice, once to do the thing and once to recover from the way the setting made you do it.'
    },
    'POLICY/SYSTEM': {
      up: 'The upstream problem is structural, and it is not yours. Coverage that does not exist, approvals that take weeks, and a rulebook with no line for the person actually doing the work are design choices made far from your kitchen.',
      flow: 'This is the root of your waiting waste and your paperwork waste. You are being asked to personally absorb the cost of a gap that someone else could close with a signature.'
    },
    'RESOURCES': {
      up: 'The upstream problem is scarcity: of money, of equipment, of professional help, and of clear information. When resources are thin, you substitute your own time and attention, which is the one resource the system treats as free.',
      flow: 'That substitution is what loads you with information and logistics that a funded system would carry. Scarcity does not just limit what you can do. It converts your hours into the missing budget.'
    },
    'PSYCHOLOGY': {
      up: 'The upstream problem is internal and understandable: grief that has nowhere to go, a self that has been quietly absorbed into a role, and decisions arriving faster than a person can make them well.',
      flow: 'This is not weakness. It is what happens when a mind is asked to hold the present emergency and the anticipated loss at the same time, for months. It shows up downstream as over-vigilance, as indecision, and as the sense that nothing you do is ever enough.'
    }
  };
  var CAT_ORDER = ['POLICY/SYSTEM', 'PEOPLE', 'PROCESS', 'RESOURCES', 'PSYCHOLOGY', 'ENVIRONMENT'];

  var ANALYZE = {
    'PEOPLE': ['The Single Name', 'Choose one person in your life who is not currently doing any care. Do not ask for help in general. Ask for one defined task, with a day and a time, that you will write down and hand over completely. Specific requests get yes more often than open ones, and a completed handoff is proof that the system can be redesigned.'],
    'PROCESS': ['The Handoff Card', 'Write one page that would let a stranger take over for a day: medications and times, who to call, what normal looks like, what is not normal. Put it where someone else can find it. You are building the standard work that your system has never had.'],
    'ENVIRONMENT': ['The Corner', 'Claim one physical space, even a chair and a lamp, where no care task is permitted for twenty minutes a day. This is not decoration. It is the first recovery space in a system that has had none.'],
    'POLICY/SYSTEM': ['The Paper Trail', 'Start one running log of every denial, hold and delay: date, name, reference number, what you were told. You are converting a private frustration into evidence. A pattern you can document can be escalated; a feeling cannot.'],
    'RESOURCES': ['The One Page', 'Reduce everything you track to a single page: the five numbers, the four names, the three deadlines that actually matter. Archive the rest. Information overload is a design failure, and you are allowed to redesign it.'],
    'PSYCHOLOGY': ['The Unfinished Sentence', 'Once a day, write the sentence you have not let yourself finish about what you have lost. One line, no audience, no solution required. Grief that is named stops consuming decisions it has nothing to do with.']
  };
  var IMPROVE = {
    defects: ['The Read-Back', 'At every appointment, close by saying back what you heard: “So the plan is X, by Y, and I call Z if W.” Ask them to confirm it. It takes thirty seconds and removes the rework that miscommunication creates.'],
    overprod: ['The Trigger Test', 'Before any anticipatory task, ask one question: what has actually changed, or am I responding to fear? If nothing has changed, the task can wait one hour. Do this three times a week and measure what did not go wrong.'],
    waiting: ['The Waiting Kit', 'Prepare for the queues you cannot avoid: a charged phone, the one-page record, a single task that matters to you. Hold time is only waste if you have nothing prepared to put into it.'],
    talent: ['The Skill Hour', 'Take one skill the caregiving never uses and give it sixty minutes this week, scheduled like an appointment you do not cancel. The point is not productivity. It is evidence that you are still someone the system cannot see.'],
    transport: ['The Batching Rule', 'Combine errands, ask the pharmacy about delivery or synchronized refills, and set one fixed day for outside logistics. You are not saving gas. You are removing decisions.'],
    inventory: ['The Weekly Brain Dump', 'Pick one fixed time each week, empty everything you are holding into one document, and decide for each item: do, delegate, defer, or delete. Then stop carrying it in your head.'],
    motion: ['The Template Folder', 'The next time you explain the same history, write it down once and keep it: a medical summary, a medication list, a script for phone calls. You should never have to produce the same explanation twice.'],
    process: ['The Forms Binder', 'Put every recurring form, authorization and appeal letter in one place with the next due date on the front. Then ask each office whether one request can cover the next three.']
  };

  L.signal = function (c) {
    var w = c.wasteVals || [], total = c.wasteTotal || 0, pct = Math.round(total / 40 * 100), dom = c.domWaste || w[0] || { name: 'process', id: 'process', sev: 1 };
    var spc = c.spc || { mean: 5, sigma: 1, ooc: 0 }, wk = c.weekVals || [], key = JSON.stringify([w.map(function (x) { return x.sev; }), wk, c.causeCount, c.p5, c.p6]);
    var p1 = L.num(c.p1), p2 = L.num(c.p2), p3 = L.num(c.p3), p4 = L.num(c.p4), p5 = L.clean(c.p5, 140), p6 = L.clean(c.p6, 220);
    var critical = (c.criticalWastes || []).map(function (n) { return n.replace(/\s+/g, ' '); });
    var dname = String(dom.name || '').replace(/\s+/g, ' ').toLowerCase();
    var out = [];

    /* 1: diagnosis */
    out.push('### System Diagnosis');
    var load = pct >= 60 ? 'A system running on emergency power: most of your effort is going into friction rather than care.' : pct >= 35 ? 'A system carrying more friction than it should, and carrying it quietly.' : 'A system under real load but not yet failing, which is exactly when intervention is cheapest.';
    out.push('Your scan reads ' + total + ' out of 40 on the waste index, which means roughly ' + pct + ' percent of the effort you are spending is absorbed by work that produces no care at all. ' + load);
    out.push('The first signal is the dominant waste, ' + dname + ', at ' + dom.sev + ' out of 5. In plain terms this is ' + (WASTE_PHRASE[dom.id] || 'effort that returns nothing') + '. ' +
      (critical.length > 1 ? 'It does not travel alone: ' + L.list(critical.map(function (n) { return n.toLowerCase(); })) + (critical.length === 2 ? ' are both' : ' are all') + ' in the critical range, which is how a single failure turns into a pattern.' : critical.length === 1 ? 'It is the only critical waste on your chart, which makes it unusually clear where to aim.' : 'Nothing on your chart has crossed into the critical range, so this is a system you can still redesign rather than rescue.'));
    var stab;
    if (spc.ooc >= 2) stab = 'The second signal is the stability of your own weeks. You rated eight weeks with an average of ' + spc.mean.toFixed(1) + ' out of 10, and ' + spc.ooc + ' of those eight fell outside the statistical control limits. In process terms that is not bad luck. It is special-cause variation: something outside the normal rhythm keeps pushing the system off its center, and it will keep doing so until it is found and named.';
    else if (spc.ooc === 1) stab = 'The second signal is the stability of your own weeks. You rated eight weeks with an average of ' + spc.mean.toFixed(1) + ' out of 10, and one of them broke the control limits. A single excursion can be an event; two would be a trend. You are standing on the line between the two.';
    else stab = 'The second signal is the stability of your own weeks. You rated eight weeks with an average of ' + spc.mean.toFixed(1) + ' out of 10 and none broke the control limits. That reads as stable, and ' + (spc.mean < 6 ? 'stable at a level most people would call a crisis is not good news: it means the strain has become normal.' : 'it deserves to be protected before the next shock arrives.');
    out.push(stab);
    var real = [];
    if (p1 != null) real.push('You are carrying about ' + p1 + ' hours of care a week' + (p2 != null && p1 > 0 ? ', and ' + p2 + ' of them (' + Math.round(Math.min(1, p2 / p1) * 100) + ' percent) produce no positive outcome of any kind' : ''));
    else if (p2 != null) real.push(p2 + ' hours of your week produce no positive outcome of any kind');
    if (p3 != null) real.push(p3 === 0 ? 'You have had a full day off recently' : 'It has been ' + p3 + ' week' + (p3 === 1 ? '' : 's') + ' since you had a full day to yourself');
    if (p4 != null) real.push(p4 === 0 ? 'No one else is part of this system with you' : p4 <= 2 ? 'Your whole support network is ' + p4 + ' ' + (p4 === 1 ? 'person' : 'people') : 'Your support network is ' + p4 + ' people');
    out.push('The third signal is the lived reality underneath the charts. ' + (real.length ? real.map(L.cap).join('. ') + '. ' : '') + (p5 ? 'The task that drains you most is \u201c' + p5 + '.\u201d ' : '') + 'Those numbers are not a character flaw. They are the output of a design.');
    out.push('Taken together, the data says one thing: this is not a person who is failing at caregiving. It is a process with too much waste, too little variation control, and no slack, being run by someone who has been treated as if they were free.');

    /* 2: cascade */
    out.push('### Root Cause Cascade');
    var cats = c.causes || {}, best = null, bestN = 0;
    CAT_ORDER.forEach(function (k) { var n = (cats[k] || []).length; if (n > bestN) { best = k; bestN = n; } });
    var fromWaste = false;
    if (!best) { best = WASTE_CAT[dom.id] || 'POLICY/SYSTEM'; fromWaste = true; }
    var named = (cats[best] || []).map(function (x) { return x.toLowerCase(); });
    var narr = CAT_NARR[best];
    out.push((fromWaste ? 'You did not select specific root causes, so the cascade starts from where your waste concentrates. The most likely upstream category is ' : 'The primary root cause is concentrated in the category ') + best.toLowerCase() + (named.length ? ', where you identified ' + L.list(named) + '.' : '.') + ' ' + narr.up);
    var downs = w.filter(function (x) { return x.sev >= 3 && x.id !== dom.id; }).slice(0, 3).map(function (x) { return String(x.name).replace(/\s+/g, ' ').toLowerCase(); });
    out.push(narr.flow + (downs.length ? ' You can see it in the data: ' + dname + ' feeds ' + L.list(downs) + ', and together they push the outcome you named, “' + L.esc(String(c.problem || 'system breakdown').toLowerCase()) + ',” closer with each cycle.' : ''));
    var other = Object.keys(cats).filter(function (k) { return k !== best && cats[k].length; });
    out.push((other.length ? 'Secondary causes sit in ' + L.list(other.map(function (k) { return k.toLowerCase(); })) + ', but they are downstream. Fix the primary and several of them soften without direct effort; leave it alone and every improvement elsewhere will be absorbed. ' : '') + 'This is the logic of a cascade: you do not repair twenty symptoms, you interrupt one cause.');

    /* 3: 30 days */
    out.push('### The 30-Day Process Improvement Map');
    out.push('Four phases, one named action each. None costs money, none needs anyone’s permission, and none requires a good week.');
    out.push('**Days 1–7, Define and Measure. The Seven-Day Ledger.** Each evening, write two numbers: the hours that produced nothing, and the one decision you made that someone else could have made. ' + (p5 ? 'Pay special attention to “' + p5 + '”; it is your highest-cost task and it will show up in the ledger first. ' : '') + 'You are not trying to change anything yet. You are replacing a feeling with a measurement, because a measured problem can be argued with and a felt one can only be endured.');
    var an = ANALYZE[best];
    out.push('**Days 8–14, Analyze. ' + an[0] + '.** ' + an[1]);
    var im = IMPROVE[dom.id] || IMPROVE.process;
    out.push('**Days 15–21, Improve. ' + im[0] + '.** ' + im[1] + ' It targets ' + dname + ', your largest source of waste, so the return will be visible quickly.');
    out.push('**Days 22\u201330, Control. The Monthly Control Chart.** Re-score the eight waste categories and your weekly stability. If two weeks fall below your lower control limit, treat it as a signal that something upstream has changed, and return to ' + an[0] + ' to reinforce it. ' + (p3 != null && p3 >= 4 ? 'Put a full day off on the calendar now, in ink, before anything else can claim it: ' + p3 + ' weeks without one is a control failure by any standard. ' : '') + 'Improvement in a process is not what you do once. It is what you keep measuring.');

    /* 4: existential */
    out.push('### Existential Integration');
    var talent = w.filter(function (x) { return x.id === 'talent'; })[0];
    out.push('Suppose the process stabilizes. Waste comes down, the weeks stop breaking their limits, and the system holds. What then? Viktor Frankl argued that people survive almost anything when they can answer one question: what is this for? Waste does not only consume hours. It buries the answer under the logistics of getting through the day.');
    out.push((p6 ? 'You wrote that with six free hours you would “' + p6 + '.”' : 'You did not say what you would do with six free hours, and that silence is itself informative.') + ' That sentence is not a daydream. It is the most reliable evidence in this entire report of what you have been paying to protect. ' + (talent && talent.sev >= 3 ? 'Your own scan agrees: you rated unused capability at ' + talent.sev + ' out of 5, which means the skills and the self that wrote that sentence are sitting unused in the same system that is wearing you down.' : 'It is what the system has been taking from you, quietly, one reasonable request at a time.'));
    out.push('Frankl described three roads to meaning: what you create, what you love or experience, and the stance you take toward what cannot be changed. This work has taken the third without asking and starved the first two. The 30-day map does not give you a different life. It returns some of the hours in which the first two roads become walkable again.');
    out.push('What becomes possible, once the waste is out of the way, is not rest. It is the return of the person who would spend those six hours' + (p6 ? ' on exactly what you wrote' : '') + ', and the quiet fact that they were never gone, only crowded out.');
    return out.join('\n\n');
  };

  /* ====================================================================================================
     TWO FUTURES: trajectory vs. intervention. ctx: {dims:[{name,score(1-5, higher=more pressure),context}], risk}
  ==================================================================================================== */
  var TF = {
    sleep: {
      hi: 'The alarm you did not need goes off at 5:40, because your body stopped trusting sleep months ago. You lie there doing the arithmetic of the day, and by seven you are already behind it.',
      mid: 'You wake before the alarm, again, with the particular tiredness that no single night explains. Coffee is doing a job that rest used to do.',
      lo: 'You wake rested enough, and you know better than to take that for granted, because the arrangement that makes it possible is fragile.'
    },
    social: {
      hi: 'By Thursday you realize you have not said a full sentence to anyone who was not a nurse, a pharmacist or a recording. Messages from friends sit unanswered. Not because you do not care, but because answering requires a version of you that no longer has the energy to appear.',
      mid: 'The people who used to ask how you are have slowly learned to ask how they are. You are polite about it, and you notice what it costs.',
      lo: 'People still reach you, and you let them, and it is one of the few things in the week that does not feel like a task.'
    },
    crisis: {
      hi: 'The phone call comes at the worst possible time, as it has so many times before. Something has gone wrong, and you do what you always do: you stop everything, you drive, you decide. The adrenaline carries you through. The crash arrives two days later, when no one is watching.',
      mid: 'There is a call this week that sends your pulse up, and it resolves into something manageable. You have learned not to exhale until the evening.',
      lo: 'The crises are rare enough now that you have started to trust the quiet, which is exactly when you are least prepared for the next one.'
    },
    time: {
      hi: 'You cannot remember the last hour that was only yours. Even the shower is a scheduled event, and the bathroom door is the only door in the house that closes. You are present in every room and absent from your own life.',
      mid: 'You have scraps of time, ten minutes here, a quiet car in a parking lot, and you have learned to take them like a person drinking from a tap in a fire.',
      lo: 'You have protected a little time, and it is the single most expensive thing you own.'
    },
    money: {
      hi: 'At eleven that night you are at the kitchen table with a pile of statements and a calculator, and the numbers do not close. You do not say it out loud. You move something from one column to another and call it a plan.',
      mid: 'There is a bill you have not opened. You know roughly what it says, and you have decided that knowing is enough for now.',
      lo: 'Money is a worry in the background rather than the foreground, which is a form of luck you should not feel guilty about and should not rely on.'
    }
  };
  var KEYS = ['sleep', 'social', 'crisis', 'time', 'money'];
  var LEV = {
    sleep: {
      name: 'sleep and physical recovery',
      alt: 'The change is not dramatic. Two nights a week, someone you named and trained covers the overnight, and you sleep in a different room with the phone in the hall. By the sixth month this has become a rule rather than a favor. On Tuesday morning you wake without the arithmetic. You are still tired in the way that caring makes people tired, but you are not carrying a debt, and you notice that you can hold a phone call without gripping the phone.',
      why: 'Sleep sits upstream of nearly everything else you scored. Short, broken sleep degrades patience, memory and judgment, and it makes every other pressure, the paperwork, the arguments, the fear, weigh more than it actually does. Move this one and the others become easier to carry before they change at all.',
      plan: ['Before noon tomorrow, choose one person and one night. Do not ask for general help. Send a message that names the night, the hours and the three things they would need to know, and let the plan be small enough that they can say yes without thinking.', 'By the end of the second day, write the one page they need: medications and times, who to call, what is normal and what is not. Put it where it can be found at three in the morning.', 'On the third night, take the phone out of the bedroom and leave it in the hall with the volume up. Go to sleep. Do not check it. The point is not rest. The point is proof that the arrangement holds.']
    },
    social: {
      name: 'social contact and isolation',
      alt: 'The change is a standing appointment, the same hour each week, with one person who does not need you to be okay. By the sixth month it is the fixed point of the week. On Tuesday morning you are not facing the day alone with your thoughts. You know that at four there will be a voice that asks a question and waits for the answer. Nothing about the workload has shrunk, but it has stopped being a secret.',
      why: 'Isolation is not just loneliness. It removes the only audience that could tell you what you are doing is too much. A single reliable human contact converts a private ordeal into a shared one and gives you someone who can see the drift before you can.',
      plan: ['Before noon tomorrow, pick the one person you have been meaning to call and send a message with a day and a time: Thursday at four, twenty minutes, I want to hear your voice.', 'By the end of the second day, decide what you will say if they ask how you are. Practice the true answer in one sentence, because you will need it.', 'On the third day, keep the call. Say the true sentence. Then book the same hour next week before you hang up.']
    },
    time: {
      name: 'time and space for yourself',
      alt: 'The change is a boundary, not a vacation: forty minutes a day, a door that closes, and a rule that no care task enters. By the sixth month this is as non-negotiable as a medication time. On Tuesday morning you know where your own hour sits, and the rest of the day feels less like a siege because there is a place in it that is not under attack.',
      why: 'When every hour belongs to someone else, a person stops being able to tell what they want. A protected block is not indulgence. It is the minimum space in which the self you are trying to keep alive can exist at all.',
      plan: ['Before noon tomorrow, pick the forty minutes and put it in the calendar like an appointment with a doctor. Tell whoever is in the house what it is.', 'By the end of the second day, choose what the forty minutes are for and keep it small and specific: a walk to the end of the street, a chapter, a chair. Decide now so you do not spend the time deciding.', 'On the third day, take the forty minutes. If it is interrupted, take it again the next day. A boundary is not what you say once. It is what you keep doing.']
    },
    money: {
      name: 'financial pressure',
      alt: 'The change is a map. You sit down once, with someone, and list every bill, every date and every program you might qualify for, and for the first time the problem has edges. By the sixth month two things have moved: one bill has been renegotiated, and one source of help has said yes. On Tuesday morning the kitchen table is just a table. The fear is still there, but it has a size now, and you know what it is.',
      why: 'Financial pressure thrives on vagueness. Most of the dread is not the number but not knowing the number. Giving it edges often releases more energy than the first dollar of relief.',
      plan: ['Before noon tomorrow, write down every recurring bill and the date it is due on one sheet of paper. Do not judge them. Just list them.', 'By the end of the second day, call the one creditor or provider with the largest bill and ask a single question: what hardship or payment programs do you have? Write down the name of the person you spoke to.', 'On the third day, share the sheet with one person you trust and ask them to sit with you for an hour. Two people looking at the same numbers change what the numbers mean.']
    },
    crisis: {
      name: 'the response plan for medical crises',
      alt: 'The change is a plan that exists before the emergency does: a bag by the door, a list of who calls whom, a one-page summary the paramedics can read. By the sixth month a crisis still hurts, but it no longer dissolves you. On Tuesday morning the phone rings and you know what the next ten minutes are. You are still afraid. You are no longer improvising.',
      why: 'You cannot control how often the crises come, but you can control how much of each one is chaos. A prepared response turns every emergency from a collapse into a procedure, and that is the difference between a recoverable week and a lost one.',
      plan: ['Before noon tomorrow, write the one-page summary: diagnoses, medications and doses, allergies, doctors, insurance numbers, and the person to call first. Print two copies.', 'By the end of the second day, pack the bag: charger, list, a change of clothes, a snack. Put it where you will see it every time you pass.', 'On the third day, tell two people where the bag and the page are, and what you want them to do if you call. Say it out loud so that it is a plan and not a hope.']
    }
  };
  function band(sc) { return sc >= 4 ? 'hi' : sc === 3 ? 'mid' : 'lo'; }

  L.twoFutures = function (c) {
    var d = c.dims || [], risk = c.risk || 15, key = JSON.stringify(d.map(function (x) { return [x.score, x.context]; }));
    var by = {}; d.forEach(function (x, i) { by[KEYS[i]] = x; });
    var q = function (k) { var t = L.clean((by[k] || {}).context, 120); if (!t) return ''; t = t.replace(/[.!?]+$/, ''); return ' ' + L.pick(['In your own words: \u201c' + t + '.\u201d', 'You put it this way: \u201c' + t + '.\u201d', 'You wrote: \u201c' + t + '.\u201d'], k + t); };
    var tidy = function (x) { x = x.replace(/^(By the end of the second day|On the third day|On the third night),\s*/, ''); return L.cap(x); };
    var lever;
    if (by.sleep.score >= 3) lever = 'sleep'; else if (by.social.score >= 4) lever = 'social'; else if (by.time.score >= 3) lever = 'time'; else if (by.money.score >= 4) lever = 'money'; else lever = 'crisis';
    var LV = LEV[lever], out = [];
    var scoreCount = d.filter(function (x) { return x.score >= 4; }).length;

    out.push('### The Trajectory: A Week in Your Life — Six Months From Now');
    out.push('Imagine nothing changes. Not because you are not trying, but because the system around you does not move, and you have already given everything you can spare. Here is a Tuesday six months from now.');
    out.push(TF.sleep[band(by.sleep.score)] + q('sleep') + ' ' + TF.crisis[band(by.crisis.score)] + q('crisis'));
    out.push(TF.social[band(by.social.score)] + q('social') + ' ' + TF.time[band(by.time.score)] + q('time'));
    out.push(TF.money[band(by.money.score)] + q('money') + ' ' + (risk >= 18 ? 'You go to bed knowing that this is not a rough week. It is the shape of the weeks now, and the shape has been getting tighter. A system with no slack does not fail dramatically; it fails by erosion, and you are the thing being worn away.' : risk >= 13 ? 'You go to bed knowing that you are holding it together, and knowing that holding is a verb with a limit. Nothing has broken yet. That is what makes it so hard to ask for anything.' : 'You go to bed knowing that you are managing. That is a real achievement, and it is also exactly the state in which a single shock can undo everything you built.'));
    out.push('The week is not a catastrophe. That is the point. It is the slow version, in which nothing dramatic happens and a person disappears a little at a time.');

    out.push('### The Alternate Week: Six Months on the Intervention Path');
    out.push('Now the same Tuesday, six months after one real change. This is not a fantasy. Nothing is cured and the illness has not gone anywhere. But one specific thing is different.');
    out.push(LV.alt + q(lever === 'crisis' ? 'crisis' : lever));
    out.push('Because that one pressure has eased, others have eased with it without being touched. ' + (lever === 'sleep' ? 'You are less short with the people around you, you remember things you used to lose, and a bad phone call lands on a rested mind rather than an exhausted one.' : lever === 'social' ? 'You make decisions with a second voice in your head, and you catch yourself earlier when you are doing too much.' : lever === 'time' ? 'You are more patient in the hours that are not yours, because you know a part of the day is.' : lever === 'money' ? 'You sleep a little better, and you ask for help a little sooner, because the thing you were hiding has a name now.' : 'You sleep a little better, because the worst moments have a script.') + ' The week is still hard. It is a week you can recognize as yours.');

    out.push('### The Leverage Point and 72-Hour Plan');
    out.push('The leverage point visible in your five dimensions is ' + LV.name + '. It is not necessarily the highest number on your scale. It is the place where a small, real change produces the largest shift in everything else. ' + LV.why);
    out.push('The research is consistent: caregivers carry higher stress and lower well-being than people who are not caregivers (Pinquart and Sörensen, 2003), and the pressures you scored, poor sleep, isolation, money worries and no time of your own, are among the ones most often tied to that strain. Motivational Interviewing adds the practical corollary: change that lasts starts from your own reasons, not from advice. You already know why this matters. So the plan below is small on purpose.');
    out.push('**Day one.** ' + tidy(LV.plan[0]));
    out.push('**Day two.** ' + tidy(LV.plan[1]));
    out.push('**Day three.** ' + tidy(LV.plan[2]));
    return out.join('\n\n');
  };

  /* ====================================================================================================
     NARRATIVE MIRROR: reads the visitor's own free writing. ctx: text, sig (page's local signal counts).
     Real text analysis: sentences, pronouns, absolutes, repeated words. Three H3 sections.
  ==================================================================================================== */
  var STOP = 'the and that this with have from they them their there what when where which would could should about because been being were was are for not but you your his her him she its our out all can will just like into than then very more some what who how why did does had has get got one two too also only still even over back down off our own such these those much many every other any ever another really'.split(' ');
  function sents(t) { return t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+|\n+/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 6; }); }
  function find(ss, res) { for (var j = 0; j < res.length; j++) for (var i = 0; i < ss.length; i++) if (res[j].test(ss[i])) return ss[i]; return ''; }
  function shortq(x, n) { x = x.replace(/[#*_`]/g, '').trim(); if (x.length > n) x = x.slice(0, n).replace(/\s+\S*$/, '') + '…'; return L.esc(x); }
  var NARR = {
    martyr: 'The story your words are building is one of obligation without exit. The recurring grammar is “have to,” “can’t,” “no choice”: verbs that describe a life being done to you rather than by you. It is a coherent and honorable story, and it carries a hidden price: if everything is required, nothing is chosen, and a person who never chooses slowly stops being able to feel that the life is theirs.',
    invisible: 'The story your words are building is one of being unseen. Look at who appears in your text and who does not: the person you care for is vivid, the professionals are present, and you are an outline. Words like “alone” and “no one” are doing structural work here. They do not describe a mood. They describe a position, the one in which a person performs essential labor for an audience that cannot see it.',
    tethered: 'The story your words are building is one of being tied to a fixed point. You describe a world that has contracted around a person, a schedule and a set of duties, with the old edges of your life drawn in a lighter ink. The language of attachment is love, and it is also the language of a tether: it holds, and it limits how far you can go.',
    grieving: 'The story your words are building is grief for someone who is still alive. The verbs are past tense and the nouns are what is missing: a person, a version of a marriage or a friendship, a self. Because nothing has formally ended, nothing is allowed to be mourned, and so the mourning leaks into every ordinary sentence.'
  };
  var PRACT = {
    martyr: ['The Externalizing Letter', 'Narrative Therapy begins by separating the person from the problem. Give the weight you carry a name, not a flattering one, something like the Obligation or the Machine. Write it a letter, one page, in your own voice. Tell it what it has taken, what it has not been allowed to take, and one thing you refuse to hand over. Do not argue with it and do not thank it. You are writing the sentence in which you are the author and it is the character. Read it aloud once, alone, and put it somewhere you will see it again.'],
    invisible: ['The Witness Letter', 'Being unseen is repaired by being witnessed, not by being praised. Choose one person who has watched part of this: a nurse, a neighbor, an old friend. Write them one page describing a single ordinary scene from the past week, as exactly as you can: the time, what was said, what it cost. Do not ask for anything. Send it, or if you cannot, read it aloud to someone. The act is not communication. It is the creation of one witness.'],
    tethered: ['The Unique Outcome Hunt', 'In Narrative Therapy a unique outcome is any moment that does not fit the dominant story. Go back through the last month and find one time you stepped outside the tether, even briefly: a decision made for yourself, a task refused, a laugh. Write it down in detail: what happened, what you did, what it says about you. The dominant story will tell you it was nothing. Keep the page. A person is not defined by their average day but by the moments they were free.'],
    grieving: ['The Remembering Hour', 'Grief that has nowhere to go needs a place. Once this week, give one hour to the person or the life that has changed, deliberately and out loud: look at one photograph, play one song, tell one story to someone who will not fix it. Then write two columns, what has been lost and what remains. Frankl called this an attitudinal value: the freedom to choose your stance toward what cannot be undone. Do not let the second column be shorter than it is. Do not let it be longer.']
  };

  L.mirror = function (text, sig) {
    sig = sig || {};
    var ss = sents(text), lower = text.toLowerCase(), words = lower.match(/[a-z’']+/g) || [], total = words.length;
    var dom = sig.dominant && NARR[sig.dominant] ? sig.dominant : 'martyr';
    var I = (text.match(/\bI\b|\bI['’](?:m|ve|d|ll)\b|\bmy\b|\bme\b/gi) || []).length;
    var other = (lower.match(/\b(he|she|him|her|his|hers|they|them|their|mom|dad|husband|wife|son|daughter|mother|father|partner)\b/g) || []).length;
    var we = (lower.match(/\b(we|us|our)\b/g) || []).length;
    var abs = {}; ['always', 'never', 'nothing', 'everything', 'everyone', 'no one', 'nobody', 'anymore'].forEach(function (w) { var n = lower.split(w).length - 1; if (n) abs[w] = n; });
    var absTop = Object.keys(abs).sort(function (a, b) { return abs[b] - abs[a]; }).slice(0, 3);
    var freq = {}; words.forEach(function (w) { if (w.length > 3 && STOP.indexOf(w) < 0) freq[w] = (freq[w] || 0) + 1; });
    var rep = Object.keys(freq).filter(function (w) { return freq[w] >= 3; }).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 3);
    var idl = find(ss, [/\bused to\b/i, /who i was/i, /before (this|all this|the diagnosis|he|she)/i, /old me/i, /don'?t recognize/i, /i was once/i]);
    var hel = find(ss, [/\bhave to\b/i, /\bno choice\b/i, /\bcan'?t\b/i, /\bstuck\b/i, /\btrapped\b/i, /\bnever\b/i]);
    var res = find(ss, [/\bno one\b/i, /\bnobody\b/i, /\balone\b/i, /tired of/i, /unfair/i, /shouldn'?t have to/i, /don'?t (care|get it)/i]);
    var agl = find(ss, [/\bI (decided|chose|started|made|learned)\b/i, /\bI (will|want|plan)\b/i, /\bI can\b(?!['\u2019]?t)/i, /\bI'?m learning\b/i]);
    var love = find(ss, [/\blove\b/i, /\bproud\b/i, /\bgrateful\b/i, /\bworth it\b/i, /\bwouldn'?t trade\b/i]);
    var fut = find(ss, [/\bsomeday\b/i, /\bone day\b/i, /\bwish\b/i, /\bhope\b/i, /when this is over/i]);
    var qs = function (x, n) { return x ? '“' + shortq(x, n || 110) + '”' : ''; };
    var out = [];

    out.push('### What Your Language Is Actually Saying');
    out.push(NARR[dom]);
    var shape = [];
    if (I + other > 0) {
      var ratio = other ? I / other : 99;
      shape.push('You used the first person (I, me, my) ' + I + ' times and referred to the person you care for, or to someone else, ' + other + ' times' + (we ? ', and “we” only ' + we : '') + '. ' + (ratio < 0.7 ? 'The grammar of your life has someone else in the subject position. You appear mostly as the one who does things for them.' : ratio > 2 ? 'Most of the sentences are about you, which means this text is a place where the self has been trying to speak, and that is worth noticing.' : 'The balance is close, which usually means the two lives have become hard to separate in the telling.'));
    }
    if (rep.length) shape.push('The words you return to are ' + L.list(rep.map(function (w) { return '“' + L.esc(w) + '”'; })) + '. Repetition is the mind’s way of pointing at what it cannot put down.');
    if (absTop.length) shape.push('You reach for absolutes, ' + L.list(absTop.map(function (w) { return '“' + w + '”'; })) + ', which are the language of exhaustion: when a person is tired enough, every exception disappears from view.');
    if (shape.length) out.push(shape.join(' '));
    var cost = [];
    if (hel) cost.push('Here is one of the sentences that carries the weight: ' + qs(hel));
    if (res) cost.push('And here is one where the anger is close to the surface, even if it is not named: ' + qs(res));
    cost.push('The cost of this narrative is not that it is false. It is that it is complete: it leaves no room for the parts of you that are neither duty nor loss.');
    out.push(cost.join(' '));

    out.push('### The Fracture Points');
    out.push('Frankl argued that suffering becomes bearable when it is attached to meaning, and that what breaks people is not pain but the loss of the thread that explains why. Reading your text for where that thread has frayed, three things stand out.');
    var fr = [];
    fr.push('**The self before.** ' + (idl ? 'You wrote ' + qs(idl) + ' A sentence like that is a small obituary. The person described in it is not dead, but the text treats them as gone, and no one has been allowed to hold the funeral.' : 'The person you were before this role barely appears in your text. That absence is data: a self that is not mentioned has usually stopped being consulted.'));
    fr.push('**The future.** ' + (fut ? 'The one future-tense sentence is ' + qs(fut).replace('.\u201d','\u201d') + ', and it is conditional, tentative, held at arm’s length. ' : 'Almost nothing in your writing points forward. ') + 'When the future shrinks to the next appointment, meaning has nowhere to land, and exhaustion takes its place.');
    fr.push('**The voice.** ' + (res ? 'The anger in your text is real, and it is mostly indirect, spoken through exhaustion rather than addressed to anyone. ' : 'Your text is controlled to the point of being flat, which is its own signal. ') + 'Feelings that are never addressed to a person tend to get redirected into the body or the relationship nearest at hand.');
    out.push(fr.join('\n\n'));
    var flags = [];
    if ((sig.helplessCount || 0) >= 5 || /have to|no choice|can'?t/.test(lower)) flags.push('a vocabulary of no-choice');
    if (!agl) flags.push('no sentence in which you are the one deciding');
    if (!love && !fut) flags.push('almost nothing warm or forward-looking');
    if (flags.length) out.push('The red flags, said plainly: ' + L.list(flags) + '. None of this means you are failing. It means the writing sounds like someone who has been surviving for a long time, and survival and living use different verbs.');

    out.push('### The Reframe and First Step');
    var anchor = agl ? 'You wrote ' + qs(agl) + ' That is the only sentence in your text where you are the subject doing the choosing, and it is the thread to pull.' : love ? 'You wrote ' + qs(love) + ' That is the line in which something other than duty speaks, and it is the one the rest of the story has not yet earned.' : 'The most powerful sentence in your text may be the fact that you wrote it. Putting this on a page is an act of authorship, and authors can revise.';
    out.push('In Narrative Therapy the facts do not change. The author does. ' + anchor + ' The reframe available to you is this: the story you have been telling says you are someone who gets used up. The same facts can be told as the story of someone who has been doing something enormous without any of the support it requires, and who is starting to say so.');
    var pr = PRACT[dom];
    out.push('**' + pr[0] + '.** ' + pr[1]);
    return out.join('\n\n');
  };


  /* ====================================================================================================
     CARTOGRAPHY: reads the spatial map of eight emotional nodes. ctx = the page's analyzeTopology() result.
     Returns three H3 sections: The Terrain / The Red Flags / The Leverage Point.
  ==================================================================================================== */
  var NODE_CLOSE = {
    IDENTITY: 'your old identity sits right against you, which is rare and good: the person you were before this has not been exiled',
    GRIEF: 'grief has moved in with you and taken a room. It is close enough to color every decision, which usually means it has not yet been given a place of its own',
    RESENTMENT: 'resentment is at your elbow. Anger that close is not a flaw. It is an unacknowledged signal that something is being asked of you that is not fair',
    LOVE: 'love is within arm’s reach, which tells me the bond is alive and is not buried under the logistics',
    EXHAUSTION: 'exhaustion has collapsed into you entirely. It is no longer something you feel; it is the medium you are standing in',
    FUTURE: 'the future is close, which means you can still picture it and reach for it'
  };
  var NODE_FAR = {
    IDENTITY: 'your pre-caregiving identity has been pushed to the far edge of the map. That is exile, not forgetting: the self you were is somewhere out there, unvisited',
    GRIEF: 'grief has been pushed to the periphery. That is usually not because it is small but because there has been no permission to feel it, and grief that is kept at a distance does not leave, it waits',
    RESENTMENT: 'resentment has been exiled to the edge. Anger kept that far away is anger that is being managed rather than heard, and it tends to come back through other doors',
    LOVE: 'love has drifted to the edge. This is often the most painful placement on the map: not an absence of love, but the sense that duty has crowded it out of reach',
    EXHAUSTION: 'exhaustion has been placed far away, which often means it is being denied. The body knows differently, and eventually it will send the bill',
    FUTURE: 'the future is far away, near the edge of the map. When tomorrow shrinks to the next appointment, the mind stops planning, and with it goes the sense that anything you do now will matter later'
  };
  var PRACTICES = {
    identity: ['The Old Self Interview', 'In Acceptance and Commitment Therapy, values are the compass you keep even when circumstances take the map away. Write down three things the person you were before this cared about, not achievements but values: making things, being outdoors, being funny, being curious. Then choose one and give it fifteen minutes this week, in whatever form is possible. The goal is not to reclaim the old life. It is to prove to yourself that the person who valued those things still exists and can act on them.'],
    grief: ['The Ledger of What Has Changed', 'Ambiguous loss, in Pauline Boss’s work, is loss without closure: someone is physically present but not what they were, so the grief has no ceremony. Write two columns. In the first, name specifically what has been lost: a shared joke, a trip, a division of labor, a future you assumed. In the second, name what remains, just as specifically. Then read the first column aloud to someone safe. The point is not to resolve it. It is to give it a form, because grief that has a name takes up less of the room.'],
    resentment: ['Defusion and the Unsent Letter', 'ACT teaches that you can acknowledge a feeling without being governed by it. Say the thought in a new frame: “I am having the thought that this is unfair.” Notice the small gap between you and the thought. Then write the letter you will never send, to the person, the institution or the situation that has made you angry. Say everything. Keep it for a day, then decide whether to burn it or keep it. The anger is not the enemy. Unspoken, it becomes the thing that decides things for you.'],
    exhaustion: ['The Permission Ledger', 'Exhaustion this central is a signal about structure, not character. For one week, write down every task you did and mark each one: required, requested, or assumed. Most people discover that a third of what they carry is assumed, meaning no one asked and no one would notice if it stopped. Pick one assumed task and stop doing it. Watch what happens. Often the answer is nothing, and nothing is a significant finding.'],
    future: ['The Task of Tomorrow', 'Viktor Frankl observed that people endured the unendurable when they could point to a task waiting for them. Choose one small, specific thing that is yours and that sits two to four weeks ahead: a call, a trip, a person you will see, a piece of writing. It does not have to be large. It has to be concrete, dated and yours. Put it on the calendar. A future the mind can see is a future it can walk toward.'],
    merged: ['The Hour of Separate Facts', 'When two lives are this close, it becomes hard to know which feelings, which fatigue and which preferences are yours. Once a day for a week, take ten minutes and write three facts that are only about you: what you ate, what you noticed, what you wanted. This is not selfishness. It is differentiation, the slow practice of remembering where your edges are, so that you can stay close without disappearing.'],
    distant: ['The Ten-Minute Bond', 'When the distance between you and the person you care for has grown, the repair is usually small. Choose ten minutes this week with no task attached: no medication, no appointment, no planning. Sit near them and do something ordinary together, a show, a song, a meal. Attachment research is consistent that connection is rebuilt in small repeated moments, not in grand gestures.']
  };

  L.cartography = function (t) {
    var out = [], key = JSON.stringify([t.proximity, t.collapsedIntoSelf, t.severedFromSelf, t.isolated, t.totalConnections]);
    var col = t.collapsedIntoSelf || [], sev = t.severedFromSelf || [], iso = t.isolated || [], nd = t.nodeData || [];
    var has = function (arr, x) { return arr.indexOf(x) >= 0; };
    var prox = { 'near-merged': 'Self and Patient are almost the same landmass, with no water between them.', 'closely entangled': 'Self and Patient sit close, with only a narrow channel between them.', 'moderate distance': 'Self and Patient are a comfortable distance apart: close enough to reach, far enough to remain two.', 'significant distance': 'Self and Patient have drifted apart, with real water between them.', 'severe separation': 'Self and Patient are on opposite shores.' }[t.proximity] || '';

    out.push('### The Terrain');
    out.push('This is the map you drew, read as land. ' + prox + (t.selfPatConnected ? ' You drew a line between them, so the bond is acknowledged even where the space between is large.' : ' You did not draw a line between them, which is its own statement: the closeness or the distance has not been named as a relationship.'));
    var lines = [];
    col.forEach(function (n) { if (NODE_CLOSE[n]) lines.push(L.cap(NODE_CLOSE[n].replace(/^your /, 'Your ')) + '.'); });
    if (lines.length) out.push('Here is what sits against you. ' + lines.join(' '));
    else out.push('Nothing has collapsed against you. Every node on your map holds some distance from the center, which is a structural kind of health.');
    var flines = [];
    sev.forEach(function (n) { if (NODE_FAR[n]) flines.push(L.cap(NODE_FAR[n]) + '.'); });
    if (flines.length) out.push('And here is what has been pushed to the edges. ' + flines.join(' '));
    if (iso.length) out.push((iso.length === 1 ? 'The only node with no connections at all is ' : 'The nodes with no connections at all are ') + L.list(iso.map(function (n) { return n.toLowerCase(); })) + '. Isolation on a map is the same as it is in a life: something that is present but not related to anything else, and therefore unable to be integrated.');
    out.push('The dominant feature of your terrain is ' + (col.indexOf('EXHAUSTION') >= 0 ? 'a plain of exhaustion that everything else is built on' : col.indexOf('GRIEF') >= 0 ? 'a grief-shaped basin at your center' : sev.indexOf('IDENTITY') >= 0 ? 'the distance between you and your own identity' : sev.indexOf('FUTURE') >= 0 ? 'a future that has been moved to the horizon' : t.proximity === 'near-merged' || t.proximity === 'closely entangled' ? 'how little space there is between you and the person you care for' : t.totalConnections === 0 ? 'disconnection: eight points with no lines between them' : 'a map with space on it, which is the best precondition for change') + '. You drew ' + t.totalConnections + ' connection' + (t.totalConnections === 1 ? '' : 's') + (t.totalConnections < 3 ? ', few enough that most of what you feel is still unrelated to the rest.' : ', which suggests you can see how some of these parts relate.'));

    out.push('### The Red Flags');
    var flags = [];
    if ((t.proximity === 'near-merged' || t.proximity === 'closely entangled') && (sev.indexOf('IDENTITY') >= 0 || iso.indexOf('IDENTITY') >= 0 || (nd.filter(function (n) { return n.label === 'IDENTITY'; })[0] || { dFromSelf: 0 }).dFromSelf > 0.3))
      flags.push('**Role engulfment.** The person you care for is almost fused with your sense of self, and your own identity has been moved out of reach. This is the classic pattern of a caregiver whose role has swallowed the person. It does not feel like a problem from inside, because the role is full of meaning. The danger is that when the role changes or ends, there is no one standing behind it.');
    if (has(col, 'GRIEF') || has(sev, 'GRIEF') || has(iso, 'GRIEF'))
      flags.push('**Ambiguous loss and disenfranchised grief.** Your map puts grief ' + (has(col, 'GRIEF') ? 'in the middle of everything' : 'at a distance or without connection') + '. Boss’s research on ambiguous loss shows that grief with no ceremony, for a person who is still here, is among the hardest to carry because the world does not recognize that anything has been lost. Disenfranchised grief is grief no one has given you permission to feel.');
    if (has(col, 'EXHAUSTION') && (has(sev, 'LOVE') || has(iso, 'LOVE')))
      flags.push('**Compassion fatigue.** Exhaustion has collapsed onto you while love has drifted to the edge. This is the signature pattern: not that you have stopped caring, but that the capacity to feel it has been spent. It is a signal of depletion, not of failure.');
    if (has(sev, 'IDENTITY') && !flags.length)
      flags.push('**Identity erosion.** Your sense of who you were has been pushed far out. Without regular contact, identities do not disappear, they go quiet, and the quiet can be mistaken for permanence.');
    if (has(col, 'RESENTMENT') || has(sev, 'RESENTMENT'))
      flags.push('**Unspoken anger.** Resentment ' + (has(col, 'RESENTMENT') ? 'is pressed against you' : 'has been exiled') + '. Either way, it is not being heard. Unacknowledged resentment in caregivers is strongly associated with guilt, which then compounds the isolation.');
    if (t.proximity === 'severe separation' || t.proximity === 'significant distance')
      flags.push('**Attachment disruption.** You placed yourself far from the person you care for. In attachment terms this can reflect protective distance, burnout, or a bond under strain. Whichever it is, the distance is information, not a verdict.');
    if (t.totalConnections === 0) flags.push('**Fragmentation.** With no connections drawn, each part of your emotional life is holding its own weight. Nothing is shared between them. That is exhausting in itself.');
    if (!flags.length) flags.push('**No acute flags.** Your map is not showing collapse or exile. The risk in a balanced map is drift: the quiet movement toward the patterns above if the load continues unchanged. Notice which node moves first.');
    out.push(flags.join('\n\n'));
    out.push('None of these are diagnoses, and this is not therapy. They are patterns that the research on caregiving has named, and they are named here because naming is the first step.');

    out.push('### The Leverage Point');
    var pick, why;
    if (has(sev, 'IDENTITY') || has(iso, 'IDENTITY')) { pick = 'identity'; why = 'the most useful move is to reconnect SELF with IDENTITY. Almost everything else on your map is organized around the absence of that line.'; }
    else if (has(col, 'GRIEF') || has(sev, 'GRIEF')) { pick = 'grief'; why = 'the highest-leverage point is the position of GRIEF. It is either too close to function around or too far to be felt, and either way it is shaping everything near it.'; }
    else if (has(col, 'RESENTMENT') || has(sev, 'RESENTMENT')) { pick = 'resentment'; why = 'the highest-leverage point is RESENTMENT. Most of the other tensions on your map are being held in place by anger that has not been allowed to speak.'; }
    else if (has(col, 'EXHAUSTION')) { pick = 'exhaustion'; why = 'the highest-leverage point is EXHAUSTION, which has collapsed into your center. Nothing else on the map can move while it occupies that ground.'; }
    else if (has(sev, 'FUTURE')) { pick = 'future'; why = 'the highest-leverage point is FUTURE. It has drifted to the horizon, and a mind without a visible tomorrow cannot hold the present for long.'; }
    else if (t.proximity === 'near-merged' || t.proximity === 'closely entangled') { pick = 'merged'; why = 'the highest-leverage point is the space between SELF and PATIENT. The closeness is love, and it is also the reason nothing on the map has room to move.'; }
    else if (t.proximity === 'severe separation' || t.proximity === 'significant distance') { pick = 'distant'; why = 'the highest-leverage point is the distance between SELF and PATIENT. Repairing even a little of it will reorganize more of the map than any other change.'; }
    else { pick = 'future'; why = 'the highest-leverage point is FUTURE. Your map is balanced, so the best investment is to give it somewhere to go.'; }
    var pr = PRACTICES[pick];
    out.push('In your map, ' + why);
    out.push('**' + pr[0] + '.** ' + pr[1]);
    return out.join('\n\n');
  };


  /* ====================================================================================================
     AUTHORITY DISPATCH: a private stabilization brief + a formal escalation letter, joined by ===LETTER===.
     ctx: situation, cogState, pressures (comma string), urgency, instType, instName, recipient, relationship,
          failures (comma string), failDetail, demand, evidence (comma string), consequence
  ==================================================================================================== */
  var COG = {
    overloaded: 'You reported being overloaded: too many things arriving at once and no clear way to rank them. When everything is urgent, the mind either freezes or grabs whatever is loudest, and the loudest thing is rarely the most important. Your judgment is not gone. It is being asked to process more inputs than any working memory can hold.',
    shutdown: 'You reported being shut down. That is not weakness; it is a protective response. When a threat feels both enormous and unsolvable, the nervous system stops offering options. The practical effect is that you may know exactly what needs to happen and be unable to start. That gap is what we are designing around.',
    reactive: 'You reported reacting emotionally rather than strategically. That is the normal result of being under threat for long enough: anger and fear move faster than planning. Reactions are useful information, but they are poor negotiators. The institution you are dealing with is counting on the version of you that responds in the moment.',
    exhausted: 'You reported exhaustion. Tired minds narrow: they take the shortest path, accept the first answer, and read neutral signals as hostile ones. You are likely to be most vulnerable to saying yes to something you will regret, or to dropping something that matters, in the next few days.',
    frightened: 'You reported that fear is making the decisions. Fear is rational here, because the stakes are real. But fear shortens time horizons and exaggerates the power of the other side. It makes the institution look larger and you look smaller than either of you is.',
    functional: 'You reported that you are functioning. That is useful, and it can be misleading. Functional people tend to delay asking for help because they are still coping, and the moment they stop coping is usually the moment the hardest decision lands.'
  };
  var PRESS = {
    'sleep deprivation': 'Lack of sleep is degrading your judgment more than you can feel from the inside. Do not make irreversible decisions on a night you have not slept.',
    'grief or anticipatory loss': 'Grief, including the grief you feel in advance, competes with strategy for the same attention. It is not a distraction. It is a second job running at the same time.',
    'financial stress': 'Financial pressure tied to care decisions pushes people toward accepting a worse option because it is cheaper today.',
    'information overload': 'Medical information overload means you may be holding more facts than you can weigh. Reduce them to the three that matter before you act.',
    'institutional stonewalling': 'Stonewalling is a tactic that works by exhausting you. It is not evidence that you are wrong; it is evidence that delay is cheaper for them than an answer.',
    'time pressure': 'Extreme time pressure is the condition under which people agree to things they would otherwise refuse. If a decision does not have to be made in the next hour, say so and ask for the deadline in writing.',
    'isolation': 'You are doing this without support, which means no one is checking your reasoning. Find one person to read what you are about to send.',
    'fear of retaliation': 'Fear of retaliation is common and has a practical answer: put everything in writing, calmly and factually, so that any change in how your family is treated becomes visible.'
  };
  var MECH = {
    'dialysis center': 'the facility’s own written grievance process, the ESRD Network for your region, the state survey agency, and the Centers for Medicare & Medicaid Services (CMS), which sets the federal conditions for coverage that dialysis facilities must meet (42 CFR Part 494)',
    'transplant hospital': 'the hospital’s patient advocate, the OPTN Patient Services line, the Health Resources and Services Administration (HRSA), CMS, and the state department of health',
    'hospital or health system': 'the hospital’s grievance process (hospitals that take Medicare must have one, 42 CFR 482.13), the state department of health, CMS, and The Joint Commission',
    'insurance company': 'the plan’s internal appeal, an independent external review, and your state insurance commissioner (or, for a Medicare Advantage plan, the plan’s appeal process and CMS)',
    'Medicare or Medicaid': 'the program’s appeal process, your state Medicaid agency or the CMS regional office, and your member of Congress',
    'pharmacy or PBM': 'the plan’s appeals process, your state insurance commissioner or pharmacy board, and, where applicable, CMS',
    'specialist office': 'the practice’s patient relations office, the state medical board, and the patient’s insurer',
    'home health agency': 'the agency’s grievance process, the state department of health, and CMS (home health agencies that take Medicare are bound by federal conditions of participation)',
    'state health department': 'the department’s own appeals procedures, the state ombudsman, and CMS where federal programs apply',
    'federal agency': 'the agency’s ombudsman or inspector general, and your member of Congress',
    'other healthcare institution': 'the institution’s grievance process, the relevant state licensing authority, and CMS where applicable'
  };

  L.authority = function (c) {
    var rel = c.relationship || 'care partner', cog = c.cogState || 'functional', urg = parseInt(c.urgency, 10) || 3, inst = c.instType || 'other healthcare institution';
    var instName = L.clean(c.instName, 120) || '[Institution Name]', recipient = L.clean(c.recipient, 80) || 'responsible party';
    var fails = (c.failures || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    var ev = (c.evidence || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x && x !== 'none specified'; });
    var pres = (c.pressures || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x && x !== 'none specified'; });
    var sit = L.clean(c.situation, 600), det = L.clean(c.failDetail, 800), dem = L.clean(c.demand, 400), con = L.clean(c.consequence, 400);
    var deadline = urg >= 4 ? '48 hours' : urg === 3 ? '72 hours' : '5 business days';
    var today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var isPatient = rel === 'I am the patient';
    var out = [];

    /* ---- stabilization brief ---- */
    out.push('WHAT IS HAPPENING TO YOUR AUTHORITY');
    out.push(COG[cog] || COG.functional);
    var pl = pres.filter(function (x) { return PRESS[x]; }).slice(0, 3).map(function (x) { return PRESS[x]; });
    out.push(pl.length ? pl.join(' ') : 'You did not flag specific pressure signals, which may mean they are quietly present rather than absent. Assume your judgment is working at a discount until you have slept and eaten.');
    out.push(urg >= 4 ? 'You rated this ' + urg + ' out of 5 in urgency. That level of urgency is real, and it is also the level at which institutions are most likely to exploit hurry. Move fast on the written record and slowly on any agreement.' : 'You rated this ' + urg + ' out of 5 in urgency, which gives you a little room. Use it to document before you escalate.');

    out.push('WHAT REMAINS INTACT');
    var intact = [];
    if (ev.length) intact.push('You have ' + L.list(ev.map(function (e) { return e.toLowerCase(); })) + '. In every dispute with an institution, the person who holds the paper holds most of the leverage, because the institution’s version of events is only a memory until yours is in writing.');
    else intact.push('You did not list documentation, which is the first thing to fix. Start tonight: a dated note of who you spoke to, what was said and what was promised.');
    intact.push(isPatient ? 'As the patient, you have the strongest standing in this conversation: it is your care, your records and your decision.' : rel === 'legal guardian or POA' ? 'As guardian or POA, you hold documented legal authority, and you are entitled to treat the institution’s obligations to the patient as obligations to you.' : 'As the person who shows up, you hold knowledge no one else has: the timeline, the patterns and what has actually happened at home. Institutions depend on that knowledge and rarely say so.');
    intact.push('You also have this: you are specific. You can name the failure, the date and the demand. Most complaints fail because they are vague. Yours does not have to be.');
    out.push(intact.join(' '));

    out.push('YOUR PRIORITY SEQUENCE — NEXT 72 HOURS');
    var steps = [];
    steps.push('Write down the timeline tonight, in plain sentences: date, who, what was said, what was promised, what was refused. Do this before you speak to anyone else. It anchors the story in your own words and makes every later conversation easier.');
    steps.push(ev.length ? 'Gather the documents you listed into one folder, paper or digital, and put the single strongest one on top. Strength means it states the failure in the institution’s own words.' : 'Ask for the missing paper in writing: a denial letter, a written reason, the policy they say applies. A refusal to put it in writing is itself useful information.');
    steps.push('Send the escalation letter below by a method that leaves a record, such as email plus certified mail or the patient portal. Note the date and time. Do not wait for a reply before taking the next step.');
    if (fails.indexOf('insurance denial') >= 0) steps.push('File the formal internal appeal today. In parallel, ask in writing about expedited review if delay could harm health. Ask about external review, which is an independent decision outside the insurer.');
    else if (fails.indexOf('records access refusal') >= 0) steps.push('Make the records request in writing, citing your right of access under HIPAA (45 CFR 164.524), which generally requires a response within 30 days. Keep a copy.');
    else if (fails.indexOf('patient safety concern') >= 0 || fails.indexOf('provider misconduct or negligence') >= 0) steps.push('Report the safety concern in writing to the facility’s patient safety or risk office and, separately, to the state department of health. A safety report is a different channel from a complaint and is handled differently.');
    else steps.push('Identify the formal grievance channel for this institution and file there as well. A complaint that exists only as a phone call is deniable. A complaint that exists in a grievance log is not.');
    steps.push('Tell one person what you have done and what you plan to do next. Ask them to check on you at the deadline. You are not doing this alone, and the plan is stronger when someone else holds it.');
    steps.push('At the deadline, escalate exactly as the letter says. Do not renegotiate it down in your head. Follow through is the only thing that makes a deadline real.');
    out.push(steps.map(function (x, i) { return (i + 1) + '. ' + x; }).join('\n'));

    out.push('YOUR COMMUNICATION POSITION');
    out.push('You are going into this letter as someone who has done the reasonable thing, asked politely and been delayed, and who is now putting the request in writing. That is a strong position. The tone that fits it is calm, specific and unemotional: not hostile, because hostility gives the institution a way to change the subject, and not deferential, because deference signals that the request is optional. A realistic outcome is not an apology but a written response, a corrected action or a documented reason. Any of those moves the situation forward. If none arrives by the deadline, the paths you can take are ' + (MECH[inst] || MECH['other healthcare institution']) + '.');

    /* ---- letter ---- */
    out.push('===LETTER===');
    var letter = [];
    letter.push('Date: ' + today);
    letter.push('From: [Your Name], [Your Address], [Your Phone and Email]');
    letter.push('To: ' + (c.recipient ? 'The ' : 'The ') + recipient.replace(/\b\w/g, function (m) { return m.toUpperCase(); }) + ', ' + instName);
    letter.push('Re: Formal request for resolution on behalf of [Patient Name], [Date of Birth / Account or Member Number]' + (fails.length ? ' — ' + L.list(fails.slice(0, 3)) : ''));
    letter.push('');
    letter.push('To the ' + recipient.replace(/\b\w/g, function (m) { return m.toUpperCase(); }) + ':');
    letter.push('I am writing as ' + (isPatient ? 'the patient' : 'the ' + rel + ' of [Patient Name]') + ' regarding the matter described below. I am requesting a written response and resolution within ' + deadline + ' of the date of this letter.');
    if (sit) letter.push('Background. ' + sit);
    if (det) letter.push('The failure. ' + det);
    if (ev.length) letter.push('Documentation. I hold ' + L.list(ev.map(function (e) { return e.toLowerCase(); })) + ', and I am prepared to provide copies on request.');
    if (con) letter.push('Consequence. If this is not resolved, the result for the patient is: ' + con.charAt(0).toLowerCase() + con.slice(1) + (/[.!?]$/.test(con) ? '' : '.') + ' I am putting this on the record so that it is not later described as unforeseen.');
    letter.push('Request. ' + (dem || '[State the specific action you are requesting.]') + (dem && !/[.!?]$/.test(dem) ? '.' : ''));
    letter.push('Please respond in writing within ' + deadline + ' to the address and email above. If I do not receive a response, I will escalate this matter through ' + (MECH[inst] || MECH['other healthcare institution']) + ', and I will ask that this letter be included in the patient’s record and in any grievance log.');
    letter.push('I would prefer to resolve this directly and promptly. Thank you for your attention.');
    letter.push('');
    letter.push('Sincerely,');
    letter.push('[Your Signature]');
    letter.push('[Your Printed Name]');
    letter.push('[Relationship to Patient]');
    letter.push('');
    letter.push('Prepared with the Cold Ischemia Foundation Authority Dispatch tool. This letter is a template for your use and is not legal advice; consider having it reviewed by a patient advocate or attorney before sending.');
    out.push(letter.join('\n'));
    return out.join('\n\n');
  };


  /* ====================================================================================================
     MERIDIAN: three living documents from one intake. ctx = collectData() from the page.
     Returns {journey, collective, pressure}, each markdown with H3 headers. Uses only statistics the site already cites.
  ==================================================================================================== */
  var TERR = {
    grief: 'a grief that has no ceremony', love: 'a love that goes unrewarded', exhaustion: 'an exhaustion that sleep does not reach',
    pride: 'a pride held privately', anger: 'anger at what you were never warned about', hope: 'a hope that has survived being tested',
    isolation: 'isolation even among people', meaning: 'a hard-won sense of meaning', fear: 'a fear that has become part of the furniture', gratitude: 'a gratitude that sits beside the rest', resolve: 'resolve'
  };
  function q1(x, n) { x = L.clean(x, n || 220); return x ? '“' + x.replace(/[.!?]+$/, '') + '.”' : ''; }
  L.meridian = function (d) {
    var name = L.clean(d.name, 60) || 'you'; if (/^anonymous/i.test(name)) name = 'you'; var first = name.split(' ')[0];
    var hrs = L.num(d.hrs), cost = L.num(String(d.cost || '').replace(/[,$]/g, '')), last = L.num(d.lastday), net = L.num(d.network), years = L.clean(d.years, 20);
    if (/^\d+(\.\d+)?$/.test(years)) years = years + (parseFloat(years) === 1 ? ' year' : ' years');
    var terr = (d.terrain || []).map(function (t) { return TERR[t] || t; });
    var cond = L.clean(d.condition, 60) || 'a chronic illness', rel = L.clean(d.rel, 40) || 'care partner', state = L.clean(d.state, 40) || 'the United States'; if (/^united states$/i.test(state)) state = 'the United States';
    var today = new Date(), dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var in90 = new Date(today.getTime() + 90 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var J = [], C = [], P = [];

    J.push('### Who You Were Before');
    J.push(d.before ? 'Before any of this, you were a person with a life that had its own gravity. In your words: ' + q1(d.before, 300) + ' That is the portrait, and it is not a footnote. Everything you have done since was done by that person, which is why it has cost so much and why it has been possible at all.' : 'You did not describe who you were before, and that silence may be telling: sometimes the old self is too far away to describe. It existed. It had preferences, a way of laughing, plans that were nobody’s business but yours. This record leaves a place for it.');

    J.push('### The Transformation');
    J.push((d.moment ? 'There was a moment when it changed. You described it this way: ' + q1(d.moment, 300) + ' ' : 'There was a moment when it changed, even if you cannot date it. ') + 'No one gave you an orientation. You were handed ' + cond + ' and the unspoken expectation that you would learn the job, ' + (years && years !== 'unspecified' ? 'and for ' + years + ' ' : 'and ') + 'you have been learning it as a ' + rel.toLowerCase() + ': the schedules, the vocabulary, the phone trees, the particular silence of a waiting room. The transformation was not a decision. It was an accumulation, and it deserves to be named as the achievement it is.');

    J.push('### What Has Been Lost — And What Was Found');
    J.push((d.taken ? 'What has been taken, in your words: ' + q1(d.taken, 260) + ' That belongs in the record without being softened. ' : 'You did not name what has been taken, but the cost exists whether or not it has a name. ') + (d.found ? 'And what you found: ' + q1(d.found, 260) + ' Loss and discovery are not a trade; neither cancels the other. You are carrying both.' : 'What you have found may not have words yet. That is not a failure. Some discoveries only become speakable later.') + (terr.length ? ' The emotional terrain you marked is ' + L.list(terr.slice(0, 4)) + '. That is not a mood. It is a landscape, and it is yours.' : ''));

    J.push('### The Hidden Life: What No Chart Has Ever Counted');
    var hid = [];
    if (hrs) hid.push('You give about ' + hrs + ' hours of care a week, roughly ' + Math.round(hrs * 52).toLocaleString('en-US') + ' hours a year, the equivalent of about ' + Math.round(hrs * 52 / 40) + ' full-time work weeks');
    if (cost) hid.push('You spend about $' + Math.round(cost).toLocaleString('en-US') + ' a year of your own money');
    if (last != null) hid.push(last === 0 ? 'You have recently had a full day to yourself' : 'It has been ' + last + ' week' + (last === 1 ? '' : 's') + ' since you had a full day to yourself');
    if (net != null) hid.push(net === 0 ? 'No one else shares the load' : 'Your support network is ' + net + ' ' + (net === 1 ? 'person' : 'people'));
    J.push((hid.length ? hid.join('. ') + '. ' : '') + (d.collapse ? 'What you described as the invisible collapse: ' + q1(d.collapse, 300) + ' ' : '') + (d.employ && !/^none|no impact|^$/i.test(d.employ) ? 'Your work has been affected (' + L.clean(d.employ, 60).toLowerCase() + '), and ' : '') + (d.health && !/^none|no impact|^$/i.test(d.health) ? 'your own health has been affected (' + L.clean(d.health, 60).toLowerCase() + '). ' : '') + 'None of this appears on any chart in the building where your person is treated. The chart records the patient. It has no column for the person who makes the treatment possible, and that absence is not neutral. It is how a system hides what it costs.');

    J.push('### Who You Are Protecting');
    J.push((d.who ? 'What you celebrate about the person you care for: ' + q1(d.who, 300) + ' ' : '') + (d.best ? 'Their best day looks like this: ' + q1(d.best, 260) + ' ' : '') + (d.love ? 'And here is what love looks like in your house: ' + q1(d.love, 260) + ' ' : '') + (d.who || d.best || d.love ? 'These are not the details of a case. They are the details of a person, and you are the one keeping the record of them. That is part of the work, and it is the part that lasts.' : 'You did not describe the person you are protecting. When you are ready, write down three things about them that no chart will ever hold: how they laugh, what they refuse to give up, what they say when no one is listening. That is what you are guarding.'));

    J.push('### Where Joy Lives In This');
    J.push(d.joy ? 'You described a moment of real joy: ' + q1(d.joy, 300) + ' It is not a contradiction of everything above. It is the reason everything above is worth carrying. Joy in the middle of this is not denial. It is evidence that the person you love is still here, and that you are still able to see it.' : 'You did not describe a moment of joy, which does not mean there have been none. Joy in this kind of life is small and quick: a joke in a waiting room, a good meal, the end of a bad day. Start collecting them. They are the most reliable proof that the life is still a life.');

    J.push('### Your Legacy Words');
    J.push('Whatever else happens, this is what you chose to leave. It is not a conclusion. It is a record of who you were at this moment and what you meant by it. You will not be remembered for the paperwork. You will be remembered for what you chose to stand for while carrying it.');
    J.push(d.legacy ? '**' + (function () { var t = L.clean(d.legacy, 300); return /[.!?]$/.test(t) ? t : t + '.'; })() + '**' : '**You did not write a legacy sentence yet. Write one when you are ready: it takes only one.**');

    /* ---- collective ---- */
    C.push('### You Are Not An Anomaly — You Are The Pattern');
    C.push('At your lowest, the experience of caring for someone with ' + cond + ' feels singular: no one else could understand this particular texture of tired. But the number of Americans who provide unpaid care for a chronically ill family member is about 53 million (AARP and the National Alliance for Caregiving, 2020). You are not the exception. You are one of the most common people in the country, and one of the least counted.');
    C.push(terr.length ? 'You marked ' + L.list(terr.slice(0, 3)) + '. These are not private quirks. They are among the emotional patterns most often described by people in your position, and the feeling of being alone with them is part of the pattern itself.' : 'Whatever you are feeling is more shared than it seems. The sense of being the only one is itself one of the most common features of caregiving.');
    C.push('### What The Data Shows About People Who Carry What You Carry');
    C.push('Research is consistent about the cost. A widely cited meta-analysis found that caregivers experience higher stress and depression and lower well-being than people who are not caregivers (Pinquart and Sörensen, 2003). AARP estimates the economic value of unpaid family care at about $600 billion a year (AARP Public Policy Institute, 2023), more than the entire annual spending of Medicaid. ' + (hrs ? 'Your ' + hrs + ' hours a week is part of that number. ' : '') + (cost ? 'Your $' + Math.round(cost).toLocaleString('en-US') + ' a year is part of what the system does not count. ' : '') + 'These are not abstractions. They are your life, summed across millions of kitchens.');
    C.push('### The Invisible Workforce: What 53 Million Care Partners Prove Together');
    C.push((d.invisible ? 'You named what the system fails to see: ' + q1(d.invisible, 260) + ' ' : '') + 'Taken together, millions of people are doing skilled work, scheduling, medication management, advocacy, and nursing tasks, without training, pay, protection or a seat at the tables where the rules are made. A system that depends on this labor and does not count it has built a hidden subsidy out of people’s lives. Seeing that clearly is the first step toward refusing to treat it as natural.');
    C.push('### What Your Experience, Added To All The Others, Now Makes Possible');
    C.push('One account can be dismissed as an anecdote. A pattern cannot. When the same structural failure is described in the same terms by many people, in writing, with dates, it becomes evidence. The Cold Ischemia Foundation was built to collect and use that evidence, and it does so without drug-company or hospital money. Your record is private on this page. If you choose to share it, it becomes one more documented voice. If you do not, it is still a true account of one life, and it belongs to you.');

    /* ---- pressure ---- */
    var tgt = { Congress: 'the United States Congress, including the Senate Committee on Health, Education, Labor and Pensions and the House Committee on Energy and Commerce', CMS: 'the Centers for Medicare and Medicaid Services, Office of Policy', Hospital: 'the hospital system’s Chief Patient Experience Officer and Chief Quality Officer', Insurance: 'the insurer’s Medical Director and Chief Medical Officer' }[d.pressure] || 'the decision-makers with authority over this policy';
    P.push('### Statement of Standing and Purpose');
    P.push('I am ' + (name === 'you' ? 'a ' + rel.toLowerCase() : name + ', a ' + rel.toLowerCase()) + ' in ' + state + ', and ' + (years && years !== 'unspecified' ? 'for ' + years + ' ' : '') + 'I have provided unpaid care to a person with ' + cond + '. I am writing to ' + tgt + ' because the arrangement I describe below is within your authority to change. This statement is dated ' + dateStr + '.');
    P.push('### The Measurable Impact: What This Life Actually Costs');
    var imp = [];
    if (hrs) imp.push('I provide about ' + hrs + ' hours of care each week, roughly ' + Math.round(hrs * 52).toLocaleString('en-US') + ' hours a year');
    if (cost) imp.push('I spend about $' + Math.round(cost).toLocaleString('en-US') + ' a year of my own money');
    if (last != null && last > 0) imp.push('It has been ' + last + ' weeks since I had a full day free of care');
    if (net != null) imp.push('My support network is ' + net + ' ' + (net === 1 ? 'person' : 'people'));
    if (d.employ && !/^none|no impact|^$/i.test(d.employ)) imp.push('My employment has been affected: ' + L.clean(d.employ, 60).toLowerCase());
    if (d.health && !/^none|no impact|^$/i.test(d.health)) imp.push('My own health has been affected: ' + L.clean(d.health, 60).toLowerCase());
    P.push(imp.length ? imp.join('. ') + '. These figures are mine and are provided as testimony; they are consistent with national estimates that about 53 million Americans provide unpaid care (AARP and the National Alliance for Caregiving, 2020) with an economic value of about $600 billion a year (AARP Public Policy Institute, 2023).' : 'I have provided care without compensation, protection or training. These costs are real, and I am prepared to document them. They are consistent with national estimates that about 53 million Americans provide unpaid care (AARP and the National Alliance for Caregiving, 2020).');
    P.push('### The Structural Failure: What This Institution Has Failed To Do');
    P.push((d.invisible ? 'The failure I experienced is this: ' + q1(d.invisible, 400) + ' ' : '') + 'This is not a personal grievance. It is a pattern in how the system is designed: it depends on my labor, assigns me responsibilities, and provides no corresponding training, support, protection or voice. A responsible institution would have anticipated this. This one has not.');
    P.push('### The Demand: One Specific, Named, Actionable Change');
    P.push(d.change ? 'I am requesting one change: ' + q1(d.change, 400) + ' I ask that you respond in writing, naming who is responsible for the decision and the date by which it will be made.' : 'I am requesting one specific, written commitment to address the failure described above, with a named person responsible and a date.');
    if (d.direct) P.push('In my own words to the decision-makers: ' + q1(d.direct, 400));
    P.push('### The Consequence of Inaction: What The Record Will Show');
    P.push('If this is not addressed, the record will show that the failure was documented, communicated in writing on ' + dateStr + ', and left unresolved. It will show that the person responsible was informed, and what was done or not done in response. I am keeping a copy of this statement and the date it was sent.');
    P.push('A copy of this statement is retained by me and, with my consent, may be shared with the Cold Ischemia Foundation, which compiles care partner testimony and public-record evidence of system failures. If the change requested above has not been addressed by ' + in90 + ', I intend to bring this statement, together with any response I receive, to my elected representatives and the relevant oversight bodies. This document is not a request for dialogue. It is a record.');

    return { journey: J.join('\n\n'), collective: C.join('\n\n'), pressure: P.join('\n\n') };
  };


  /* ====================================================================================================
     SITUATION ROOM: a plain-language rights analysis and the letters that follow. No guessing at law: every
     citation below is a public federal rule, stated generally, with instructions to check the current text.
     L.rights({text,state,treatment,duration,sit}) -> {severity,severityText,plainLanguage,violations,agencySequence,immediateActions}
     L.rightsDoc(analysis, docType) -> letter text
  ==================================================================================================== */
  var RC = {
    discharge: {
      v: ['42 CFR §494.180(f)', 'Involuntary discharge and transfer procedures', 'A dialysis facility must follow written discharge and transfer procedures before it involuntarily discharges a patient. Those procedures generally require documented efforts to resolve the problem, advance written notice (with limited exceptions for an immediate threat to safety), and notice to the ESRD Network. If a step was skipped, the discharge may not comply.'],
      p: ['A discharge or removal threat is the most time-sensitive situation on this list. Dialysis facilities that take Medicare are bound by federal Conditions for Coverage, and those conditions set out how and when a facility may involuntarily discharge or transfer a patient. The details matter, so ask for the notice, the reason and the facility’s written policy in writing.',
        'You are not required to accept a discharge because you were told verbally that it is happening. Keep attending treatment, keep every document, and use the grievance channels below before any deadline in the notice passes.'],
      a: [['Within 24 hours', 'Facility administrator', 'Request in writing the discharge notice, the stated reason, the dates of any prior warnings, and a copy of the facility’s involuntary discharge policy and grievance process. Do not sign anything you have not read.', '42 CFR §494.180'], ['Within 48 hours', 'Your regional ESRD Network', 'Contact the ESRD Network that covers your state and ask it to review the discharge and to help with placement if one is unavoidable. Networks are CMS contractors that handle patient grievances.', '42 CFR Part 494; 42 U.S.C. §1395rr'], ['Within 72 hours', 'State survey agency (state health department)', 'File a complaint about the discharge process. The agency inspects dialysis facilities for CMS and can investigate.', '42 CFR Part 494'], ['Within 5 days', 'CMS Regional Office', 'If the Network and state agency do not resolve it, ask the CMS regional office to review.', '42 CFR Part 494'], ['Within 7 days', 'Your U.S. Representative or Senator', 'Ask the office to open a casework inquiry with CMS. A congressional inquiry often gets a faster, written answer.', 'Constituent casework']],
      i: ['Ask for the discharge notice, the reason and the policy in writing today.', 'Keep attending every scheduled treatment. Do not stop going because of a verbal notice.', 'Do not sign any “voluntary” transfer or discharge paper until you have read it and spoken to the ESRD Network.', 'Write down dates, names and exactly what was said, starting now.', 'Contact the ESRD Network for your state and the state survey agency this week.']
    },
    transplant: {
      v: ['42 CFR §482.90', 'Patient selection and notification', 'Hospitals that perform transplants must use written patient selection criteria and apply them consistently, and must notify patients of their listing status or non-selection. A delay or denial with no written reason may not meet those requirements.'],
      v2: ['42 CFR §482.102', 'Patient and living donor rights', 'Transplant programs must inform patients about their rights, including information about the program and their evaluation. Missing or withheld information may be a rights issue.'],
      p: ['Transplant programs decide who is listed, but they do so under federal rules: selection criteria must be written, applied consistently, and communicated to the patient. A listing delay or denial is not necessarily improper, but a delay without a documented reason, or a denial you cannot get in writing, is worth challenging.',
        'You can also ask for a second evaluation at another transplant center, because a patient may be evaluated and listed at more than one program. Ask each program for its written criteria and for its outcomes, which are published by the Scientific Registry of Transplant Recipients (srtr.org).'],
      a: [['Within 24 hours', 'The transplant program', 'Request in writing: the specific reason for the delay or denial, the written selection criteria applied, the date of your last evaluation, and what would change the decision.', '42 CFR §482.90'], ['Within 72 hours', 'Transplant hospital patient advocate or patient relations office', 'File a formal grievance with the hospital. Hospitals that take Medicare must have a grievance process.', '42 CFR §482.13'], ['Within 5 days', 'OPTN Patient Services (via UNOS) and HRSA', 'Report the problem. The OPTN is the national transplant network, and HRSA oversees it.', '42 CFR Part 121'], ['Within 7 days', 'State health department and CMS', 'If the program is not responding, complain to the state survey agency and CMS, which certify transplant programs.', '42 CFR Part 482'], ['Within 10 days', 'A second transplant center', 'Request an evaluation at another program in parallel. Do not wait for the first to finish.', 'Patient choice']],
      i: ['Request the reason for the delay or denial, in writing.', 'Ask for the written selection criteria the program used.', 'File a grievance with the hospital’s patient advocate today.', 'Request an evaluation at a second transplant center in parallel.', 'Keep a dated log of every call, letter and portal message.']
    },
    blacklist: {
      v: ['42 CFR Part 494 and §1557 of the Affordable Care Act (42 U.S.C. §18116)', 'Access and non-discrimination', 'Multiple facilities refusing a patient without explanation can raise concerns about discrimination based on disability, language, national origin or other protected characteristics. Federal non-discrimination law applies to facilities that take federal funds.'],
      p: ['When several facilities refuse the same patient without explaining why, the pattern itself is worth reporting. Dialysis facilities that receive federal funds cannot refuse patients because of disability, national origin, language or other protected characteristics. They can decline patients for legitimate clinical or capacity reasons, but that reason should be documentable.',
        'Your regional ESRD Network is specifically charged with helping patients who cannot find placement. Start there.'],
      a: [['Within 24 hours', 'Your regional ESRD Network', 'Report the refusals and ask the Network to find placement. This is part of what Networks do.', '42 U.S.C. §1395rr'], ['Within 48 hours', 'Each refusing facility', 'Ask each, in writing, for the specific reason for refusal. Keep the replies or the refusals to reply.', '42 CFR §494.70'], ['Within 5 days', 'State survey agency', 'File a complaint describing the pattern of refusals.', '42 CFR Part 494'], ['Within 7 days', 'HHS Office for Civil Rights', 'If you believe the refusals were because of disability, language, national origin or another protected trait, file a civil rights complaint.', '42 U.S.C. §18116; 29 U.S.C. §794'], ['Within 10 days', 'Your member of Congress', 'Ask for a casework inquiry to CMS.', 'Constituent casework']],
      i: ['List every facility that refused, the date and who spoke to you.', 'Ask each, in writing, for the reason for refusal.', 'Call your regional ESRD Network and ask for placement help today.', 'Ask your nephrologist’s office to refer you directly.', 'Do not accept a lapse in treatment while placement is sorted; tell your doctor immediately if treatment is at risk.']
    },
    information: {
      v: ['45 CFR §164.524', 'Right of access to your health records', 'You generally have a right to inspect and obtain a copy of your health records. The provider generally must respond within 30 days, with one possible 30-day extension if it tells you why.'],
      v2: ['42 CFR §494.70', 'Patients’ rights', 'Dialysis patients have the right to be informed about their treatment, their plan of care and the facility’s policies, in a way they can understand.'],
      p: ['Being unable to get information is not a minor irritation. It is a rights problem. You have a right of access to your own records, and dialysis patients have a right to understand their treatment and participate in their plan of care.',
        'Put the request in writing, keep a copy, and note the date. The response clock starts when you ask in writing.'],
      a: [['Within 24 hours', 'The provider’s records or privacy office', 'Make a written records request citing your right of access. Ask for electronic copy if available.', '45 CFR §164.524'], ['Within 7 days', 'Facility administrator', 'Ask in writing for your current plan of care and a meeting to review it.', '42 CFR §494.90'], ['Within 30 days', 'HHS Office for Civil Rights', 'If records are not provided on time, file a complaint.', '45 CFR §164.524'], ['Within 30 days', 'State survey agency', 'File a complaint if you are denied information about your care.', '42 CFR Part 494']],
      i: ['Write a dated records request and keep a copy.', 'Ask for your plan of care in writing.', 'Ask what the response deadline is and note it.', 'Keep a log of every request and reply.']
    },
    retaliation: {
      v: ['42 CFR §494.180', 'Grievance process and patient protections', 'Dialysis facilities must maintain a grievance process. Retaliating against a patient for raising a concern is inconsistent with it, and may also violate patients’ rights.'],
      v2: ['42 CFR §494.70', 'Patients’ rights', 'Patients have the right to be treated with respect and dignity and to raise concerns about their care.'],
      p: ['If you complained and then saw a change in how you or your family member was treated, such as a shortened treatment, a schedule change, hostility or a discharge threat, the timing is itself evidence. Retaliation is difficult to prove in the moment, so the most useful thing is a dated record that makes the timing visible.',
        'Keep communicating in writing, calmly and factually. A written trail changes how the people on the other side behave.'],
      a: [['Within 24 hours', 'You', 'Write down the timeline: what you raised, when, and what changed afterward.', 'Documentation'], ['Within 48 hours', 'Facility administrator', 'Put your original concern and the changes in writing and request a response.', '42 CFR §494.180'], ['Within 72 hours', 'Your regional ESRD Network', 'File a grievance describing the pattern.', '42 U.S.C. §1395rr'], ['Within 7 days', 'State survey agency', 'File a complaint about retaliation and the underlying concern.', '42 CFR Part 494'], ['Within 10 days', 'Your member of Congress', 'Ask for a casework inquiry.', 'Constituent casework']],
      i: ['Write the timeline tonight: the concern, the date, what changed after.', 'Keep all communication in writing from now on.', 'Do not stop attending treatment.', 'Tell one trusted person what is happening.', 'File with the ESRD Network and the state survey agency this week.']
    },
    other: {
      v: ['42 CFR §494.70', 'Patients’ rights', 'Dialysis patients have rights to respect, dignity, information about their care and participation in their plan of care.'],
      v2: ['42 CFR §494.180', 'Governance and grievance process', 'Facilities must have a grievance process and a way for patients to raise concerns without being penalized.'],
      p: ['You did not select a specific situation, so this analysis starts from the core rights that apply broadly to patients in dialysis and transplant care: respect, information, participation in your plan of care, and a working grievance process. Add the specifics of what happened in the description and re-run it for a more targeted reading.',
        'A reliable pattern in these situations: the outcome improves when the problem is described in writing, with dates and names, and sent through a formal channel rather than raised only in conversation.'],
      a: [['Within 24 hours', 'You', 'Write the timeline in plain sentences: date, who, what happened, what was said.', 'Documentation'], ['Within 72 hours', 'Facility or program administrator', 'Put your concern and your requested fix in writing and request a response by a specific date.', '42 CFR §494.180'], ['Within 7 days', 'Your regional ESRD Network', 'File a grievance if unresolved.', '42 U.S.C. §1395rr'], ['Within 10 days', 'State survey agency and CMS', 'Complain to the state agency that inspects the facility and, if needed, CMS.', '42 CFR Part 494'], ['Within 14 days', 'Your member of Congress', 'Ask for a casework inquiry.', 'Constituent casework']],
      i: ['Write the timeline tonight.', 'Ask for what you need in writing, with a date.', 'Find the facility’s grievance process and file there too.', 'Keep copies of everything.']
    }
  };
  var EXTRA = [
    [/record|chart|copy of my|copies/i, ['45 CFR §164.524', 'Right of access to your health records', 'You generally have a right to a copy of your records and the provider generally must respond within 30 days. Refusal or delay may be a HIPAA access issue.']],
    [/insurance|denied|denial|prior auth|appeal|claim|coverage/i, ['42 CFR Part 405 Subpart I; 45 CFR §147.136; 29 CFR §2560.503-1', 'Coverage appeal rights', 'Coverage denials carry appeal rights: Medicare claims have a multi-level appeal process, and most other health plans must offer internal appeal and independent external review. The deadlines in the denial letter are strict.']],
    [/infection|sepsis|bleed|injur|fell|wrong (dose|med)|error|unsafe|safety/i, ['42 CFR §494.30 and §494.110', 'Infection control and quality improvement', 'Dialysis facilities must have infection control procedures and a quality assessment and performance improvement program. Safety events should be reported in writing to the facility’s quality office and to the state survey agency.']],
    [/interpreter|language|spanish|deaf|blind|disab|wheelchair|accommodat/i, ['29 U.S.C. §794 and 42 U.S.C. §18116', 'Disability and language access', 'Facilities that receive federal funds must provide reasonable accommodations and meaningful language access. Refusals can be reported to the HHS Office for Civil Rights.']],
    [/emergency|ambulance|\ber\b|emergency room/i, ['42 U.S.C. §1395dd (EMTALA)', 'Emergency screening and stabilization', 'Hospitals with emergency departments must screen and stabilize anyone who arrives with an emergency condition, regardless of ability to pay.']],
    [/shorten|cut (my|his|her|the)|chair time|fewer hours|reduced (my|his|her)|treatment time/i, ['42 CFR §494.90', 'Plan of care', 'A patient’s plan of care, including treatment time, must be set by the interdisciplinary team with the patient’s participation. A change without a documented order or review may not comply.']]
  ];
  L.rights = function (c) {
    var text = String(c.text || ''), sit = RC[c.sit] ? c.sit : 'other', R = RC[sit];
    var v = [R.v]; if (R.v2) v.push(R.v2);
    EXTRA.forEach(function (e) { if (e[0].test(text) && !v.some(function (x) { return x[0] === e[1][0]; })) v.push(e[1]); });
    var urgentWords = /tomorrow|this week|immediately|\b\d+ days?\b|final notice|no longer|terminated|banned|cut off|today|will not be allowed/i.test(text);
    var sev = (sit === 'discharge' || sit === 'blacklist' || (sit === 'transplant' && urgentWords)) ? (urgentWords || sit === 'discharge' ? 'critical' : 'high') : (urgentWords ? 'high' : (sit === 'information' ? 'moderate' : 'high'));
    var sevText = { critical: 'Time-sensitive: federal rules set specific steps for this situation, and any deadline in your notice is real. Act this week.', high: 'This deserves a formal written response. The channels below are free and you can start today.', moderate: 'This is a rights issue with a clear remedy. Start with a written request and keep a copy.' }[sev];
    var ctxLine = [c.state && 'in ' + L.esc(c.state), c.treatment && 'for ' + L.esc(String(c.treatment).toLowerCase())].filter(Boolean).join(' ');
    var plain = R.p.map(function (x) { return '<p>' + x + '</p>'; });
    plain.push('<p><strong>What this is and is not.</strong> This reading is based on your description' + (ctxLine ? ' ' + ctxLine : '') + ' and on public federal regulations stated in general terms. It is educational information, not legal advice, and your facts may not meet every requirement listed. Check the current text of each rule at ecfr.gov, and consider asking a patient advocate or attorney to review before you send anything.</p>');
    return { severity: sev, severityText: sevText, plainLanguage: plain.join(''), violations: v.map(function (x) { return { cfr: x[0], title: x[1], description: x[2] }; }), agencySequence: R.a.map(function (x, i) { return { step: i + 1, timing: x[0], agency: x[1], action: x[2], cfr: x[3] }; }), immediateActions: R.i.slice() };
  };
  var DOCS = {
    complaint: ['formal complaint', 'Facility Administrator', 'I am writing to file a formal complaint and to request a written response.'],
    appeal: ['administrative appeal', 'Facility Administrator and Regional ESRD Network', 'I am writing to appeal the decision described below and to request a formal review.'],
    cms: ['complaint to the ESRD Network and CMS Regional Office', 'ESRD Network and CMS Regional Office', 'I am writing to file a complaint and to ask that you review the facility’s compliance with the federal Conditions for Coverage.'],
    oig: ['complaint narrative for the HHS Office of Inspector General', 'HHS Office of Inspector General', 'I am submitting the following narrative for review. I believe the conduct described may involve improper practices affecting a Medicare beneficiary.'],
    state: ['complaint to the state survey agency', 'State Department of Health, Complaint Intake', 'I am requesting that the agency investigate the facility described below for compliance with federal and state requirements.'],
    congressional: ['request for congressional casework assistance', 'Member of Congress, Constituent Services', 'I am writing as a constituent to request your office’s help with a federal agency regarding a patient’s care.']
  };
  L.rightsDoc = function (r, type) {
    var d = DOCS[type] || DOCS.complaint, today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var v = (r.violations || []).map(function (x) { return x.cfr + ' (' + x.title + ')'; });
    var sitName = { discharge: 'a discharge or removal notice', transplant: 'a transplant listing denial or delay', blacklist: 'refusal of care by multiple facilities', information: 'refusal to provide information or records', retaliation: 'retaliation after raising a concern', other: 'a care problem' }[r._sit] || 'a care problem';
    var dl = r.severity === 'critical' ? '48 hours' : '7 business days';
    var o = [];
    o.push('Date: ' + today); o.push('From: [Your Name], [Address], [Phone and Email]'); o.push('To: ' + d[1]);
    o.push('Re: ' + L.cap(d[0]) + ' on behalf of [Patient Name], [Date of Birth], [Facility or Account Number]' + (r._state ? ', ' + L.esc(r._state) : ''));
    o.push(''); o.push('To whom it may concern:'); o.push('');
    o.push(d[2] + ' The matter concerns ' + sitName + (r._treatment ? ' affecting ' + L.esc(String(r._treatment).toLowerCase()) : '') + (r._duration ? ' (duration: ' + L.esc(String(r._duration).toLowerCase()) + ')' : '') + '.');
    o.push(''); o.push('WHAT HAPPENED'); o.push(L.clean(r._text, 1500)); o.push('');
    if (v.length) { o.push('REQUIREMENTS I BELIEVE ARE RELEVANT'); o.push('Based on my understanding of the public federal rules, the following may apply: ' + L.list(v) + '. I ask that you review these against the facts above, and I understand that I may be mistaken on any point of law.'); o.push(''); }
    o.push('WHAT I AM ASKING'); o.push('1. A written response within ' + dl + ' of the date of this letter.'); o.push('2. A written statement of the reason for the action described above and the policy or rule relied on.'); o.push('3. A copy of any related policy, notice or record, including my right of access to records.'); o.push('4. A review and, where appropriate, correction of the situation, with the name of the person responsible for the decision.'); o.push('');
    o.push(type === 'oig' ? 'I am providing this narrative so that the Office of Inspector General can assess whether it warrants review. I am willing to be contacted for further information.' : type === 'congressional' ? 'I respectfully ask your office to inquire with the relevant federal agency, request a written response, and let me know the outcome.' : 'If I do not receive a response by the deadline above, I intend to escalate this matter to the next appropriate agency, including the state survey agency, the ESRD Network and CMS, and to my elected representatives.');
    o.push(''); o.push('Thank you for your attention to this matter.'); o.push(''); o.push('Sincerely,'); o.push('[Signature]'); o.push('[Printed Name]'); o.push('[Relationship to Patient]'); o.push('');
    o.push('Prepared with the Cold Ischemia Foundation Situation Room. This is a template based on public federal regulations, not legal advice. Please verify each citation against the current text at ecfr.gov before sending.');
    return o.join('\n');
  };

})();
