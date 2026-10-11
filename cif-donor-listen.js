/* Cold Ischemia Foundation: "In your own words" reader for the Living Donor Journey.
   This is a rules-based language reader, not a chat model and not a person. It runs entirely in the visitor's
   browser: the text is never sent anywhere unless the visitor chooses to share the anonymous summary.
   It looks for 18 themes in what someone writes (with simple negation handling), reflects them back so the
   visitor can correct it, and answers each with plain facts written by people. Every theme can be switched on
   or off by the visitor, because trust depends on being able to say "that's not what I meant". */
(function () {
  'use strict';
  var NEG = /\b(not|no|never|n't|dont|don't|didn't|isn't|wasn't|without|nothing|none|neither|nor)\b/;

  var T = {
    crisis: { re: /\b(kill myself|suicid\w*|end my life|want to die|hurt myself|self[- ]harm)\b/, label: 'You mentioned thoughts of harming yourself',
      say: 'Your safety comes before any donation question. Please call or text 988 (Suicide & Crisis Lifeline, 24/7) or call 911 in an emergency. A transplant program will also want to support you before anything else.', urgent: 1 },
    fear_surgery: { re: /\b(scared|afraid|fear\w*|terrified|nervous|worr\w*|anxious|anesthesia|surger\w+|operation|die on the table|complication\w*)\b/, need: /\b(surger\w+|operation|anesthesia|table|complication\w*|scared|afraid|fear\w*|terrified)\b/, label: 'Fear or worry about the surgery',
      say: 'Worry about surgery is common and reasonable. Most living kidney donors have the kidney removed through small keyhole incisions and stay in hospital about 1 to 3 days. Serious complications are uncommon but real, and the evaluation includes a full discussion of the risks so you can decide with the numbers in front of you. You can ask any question, and you can stop at any point.', ask: 'What are the surgical risks at this center, and how many living donor operations does the team do each year?' },
    cost: { re: /\b(afford\w*|money|cost\w*|pay|paid|bills?|rent|mortgage|income|insurance|debt|lost wages|paycheck|expens\w+)\b/, label: 'Money and lost income',
      say: 'The recipient’s insurance usually covers the donor’s evaluation and surgery. Travel, lodging and lost wages are the usual gaps. The National Living Donor Assistance Center can help eligible donors with those costs (the amount depends on the recipient’s household income). Ask the program’s financial coordinator before you commit to anything.', ask: 'Which of my costs will be covered, and can the financial coordinator help me apply to NLDAC?' },
    job: { re: /\b(job|work\w*|boss|employer|leave|fmla|time off|shift|self[- ]employed|business)\b/, label: 'Work and time off',
      say: 'Plan on about 5 to 6 weeks away from a desk job and longer for physical work. The federal Family and Medical Leave Act can protect unpaid leave for many workers, and some states add paid leave or donor leave. Ask the program’s social worker how to document this for your employer.', ask: 'Can you give me a letter for my employer and explain my leave options?' },
    family: { re: /\b(kids?|children|toddler|baby|babies|single (mom|dad|parent)|caregiv\w+|dependents?|take care of (my|a))\b/, label: 'Family and caregiving duties',
      say: 'Your recovery will need a helper for the first one to two weeks, and the team will ask about this. NLDAC can cover some dependent-care costs for eligible donors. Naming your helper early makes evaluation go faster.', ask: 'What help do donors with young children or dependents usually need?' },
    recipient: { re: /\b(on dialysis|dialysis|waiting list|waitlist|transplant list|kidney failure|failing|needs? a kidney|sick|dying|running out of time)\b/, label: 'Someone you love is waiting',
      say: 'Time matters, and so does your own health. The most useful thing you can do for them is start your own separate evaluation early, because your team works only for you and the recipient’s team works only for them. That separation protects both of you.', ask: 'Can my evaluation start now, in parallel with my loved one’s listing?' },
    nondirected: { re: /\b(stranger|anonymous|non[- ]?directed|altruistic|good samaritan|anyone who needs|don'?t know (who|anyone)|no one in particular)\b/, label: 'Giving to someone you don’t know',
      say: 'This is called non-directed (or altruistic) donation. Not every program accepts non-directed donors, so ask early. A single non-directed kidney can start a chain of several transplants through a paired exchange.', ask: 'Do you accept non-directed living donors, and do you take part in kidney chains?', flag: 'nondirected' },
    paired: { re: /\b(blood type|incompatible|not a match|isn'?t a match|wrong blood|crossmatch|antibod\w+|mismatch\w*|paired|swap|exchange|chain)\b/, label: 'A match problem (blood type or antibodies)',
      say: 'Not matching your recipient does not end the story. In a paired exchange your kidney goes to a compatible stranger and a compatible donor gives to your recipient. Programs usually join one or more registries: the National Kidney Registry, the Alliance for Paired Donation, or the OPTN pilot program. Ask which ones your recipient’s center uses.', ask: 'Do you take part in paired exchange, and which registries do you use?', flag: 'paired' },
    bp: { re: /\b(blood pressure|hypertension|high bp|bp meds?|lisinopril|amlodipine|losartan)\b/, label: 'Blood pressure',
      say: 'Blood pressure that is well controlled can still be reviewed, though many programs are stricter about hypertension in donors, especially under 50 or on several medicines. Bring your readings (a home log helps) to the first call.', ask: 'What are your blood pressure limits for donors, and does a home log count?' },
    diabetes: { re: /\b(diabet\w+|prediabet\w+|a1c|insulin|metformin|blood sugar)\b/, label: 'Diabetes or blood sugar',
      say: 'Diabetes usually rules out donation, and prediabetes is judged case by case because it raises the long-term risk to your remaining kidney. Programs differ, so a short call can settle where you stand.', ask: 'How does your program treat prediabetes or a family history of diabetes?' },
    weight: { re: /\b(overweight|obes\w+|bmi|weigh\w*|pounds|lbs|heavy)\b/, label: 'Weight or BMI',
      say: 'BMI limits vary between programs, from about 30 to 35. A person turned away at one program may be accepted at another, and many programs will support a plan to lose weight first.', ask: 'What is your BMI limit for donors, and do you offer a weight-loss plan to become eligible?' },
    smoking: { re: /\b(smok\w+|vap\w+|cigarette\w*|nicotine|tobacco)\b/, label: 'Smoking or vaping',
      say: 'Programs generally require you to stop nicotine before surgery and some test for it. Stopping is one of the most useful things you can do now, for donation and for you.', ask: 'How long must I be nicotine-free before surgery, and do you test?' },
    stones: { re: /\b(kidney stones?|stones?|uti|infections?|protein in|hematuria|blood in (my )?urine|polycystic|pkd|single kidney|one kidney)\b/, label: 'A kidney or urinary history',
      say: 'A past stone or infection does not automatically rule you out, but the team will want the details and your scans. Bring any records.', ask: 'Does my kidney or urinary history change my eligibility?' },
    pregnancy: { re: /\b(pregnan\w+|have more kids|more children|trying to conceive|expecting)\b/, label: 'Pregnancy plans',
      say: 'Pregnancy and donation are not a good mix at the same time. Programs usually ask donors to wait until after a pregnancy, and women can usually carry pregnancies after donating with closer monitoring. Ask the team about timing.', ask: 'What timing do you advise around pregnancy?' },
    pressure: { re: /\b(pressur\w+|guilt\w*|obligat\w+|have to|expected|forced|made me|owe|ashamed|feel like i must|can'?t say no|family expects)\b/, label: 'Pressure or guilt',
      say: 'A gift has to be freely given. Every program must provide an independent living donor advocate whose only job is to protect you, and you may change your mind at any stage. Ask the team how they keep that decision private, including what they will tell your family if you decide not to continue.', ask: 'Who is my independent living donor advocate, and how do you protect my privacy if I decide not to donate?', flag: 'pressure' },
    mental: { re: /\b(depress\w+|anxiety|panic|therapy|therapist|ptsd|bipolar|antidepressant\w*|mental health)\b/, label: 'Mental health',
      say: 'Mental health history is not an automatic barrier. The evaluation includes a psychosocial review with a social worker, and being honest and in treatment usually helps. It is also protective for you: donation is a major life event.', ask: 'How does the psychosocial evaluation work, and does treatment history matter?' },
    turned_down: { re: /\b(turned down|rejected|declined|denied|told (me )?no|said no|ruled out|disqualif\w+|not approved|not accepted|ghosted|never (called|heard)|(nobody|no one) (ever )?(called|answered|responded|got back)|no response|didn'?t call back)\b/, label: 'Being turned away or not getting a call back',
      say: 'That is exactly the gap this page exists to close. Programs set their own limits, so a no from one is not a no from all. Ask for the reason in writing, then ask another program. If nobody called you back, call again after two business days and ask for the living donor coordinator or the transplant social worker by name.', ask: 'What exactly was the reason, and can you put it in writing?' },
    distrust: { re: /\b(don'?t trust|distrust|skeptical|suspicious|scam|get used|taken advantage|they don'?t care|system is (broken|rigged)|nobody listens)\b/, label: 'Doubt about the system',
      say: 'Your doubt is fair, and you do not have to take our word for anything. Every statement on this page cites a public source, the program’s duty is to you as a donor, and you can bring someone with you to every appointment.', ask: 'Can a support person join my appointments?' },
    distance: { re: /\b(far|miles|drive|hours away|rural|flight|travel\w*|no transplant center)\b/, label: 'Distance to a transplant center',
      say: 'Many programs do most of the evaluation near your home through local labs and imaging, and NLDAC can help with travel and lodging. Ask what can be done close to home.', ask: 'Can part of the evaluation be done near my home?' }
  };

  function sentences(t) { return t.split(/(?<=[.!?])\s+|\n+/).filter(Boolean); }
  function hit(re, s) {
    var m, g = new RegExp(re.source, 'g'); s = s.toLowerCase();
    while ((m = g.exec(s))) {
      var before = s.slice(Math.max(0, m.index - 28), m.index);
      var hasNeg = NEG.test(before);
      if (!hasNeg) return true;
    }
    return false;
  }

  window.CIFListen = {
    THEMES: T,
    analyze: function (text) {
      text = String(text || '').trim();
      var found = [];
      if (!text) return { themes: [], words: 0 };
      var ss = sentences(text);
      Object.keys(T).forEach(function (k) {
        var t = T[k], re = t.need || t.re;
        // Fear needs a fear word AND a surgery word in the same sentence, otherwise "worried about money" would trigger it.
        var ok = ss.some(function (s) {
          if (k === 'fear_surgery') return hit(t.re, s) && hit(t.need, s) && /(scared|afraid|fear|terrified|nervous|worr|anxious|complication|die)/.test(s.toLowerCase()) && /(surger|operation|anesthesia|table|complication)/.test(s.toLowerCase());
          return hit(t.re, s);
        });
        if (ok) found.push(k);
      });
      // urgent first, then in lexicon order, cap at 7 so the reply stays readable
      found.sort(function (a, b) { return (T[b].urgent ? 1 : 0) - (T[a].urgent ? 1 : 0); });
      return { themes: found.slice(0, 7), words: text.split(/\s+/).length };
    },
    // Trust: say what was heard, name the method, and make every item removable by the visitor.
    reflect: function (keys) {
      if (!keys.length) return 'I did not pick out a specific concern, and that is fine. Everything you wrote stays on your device. You can add a few more words, or continue.';
      return 'Here is what I picked up. I am a rules-based reader, not a person, so I can be wrong: untick anything that is not what you meant.';
    }
  };
})();
