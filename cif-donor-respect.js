/* "Protect your time and money" panel for living-donor-journey.html.
   1) Questions to settle by phone BEFORE any trip, built from the visitor's own answers, so nobody travels or loses a
      day's pay to find out about a limit that a two-minute call would have revealed.
   2) A staged path (cheap and local first, one bundled visit, decision last).
   3) A cost estimator with editable assumptions. All figures come from the visitor, none are claims about any program.
   Everything runs in the browser. */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };

  var LIMITS = {   // answer flagged (not "good") -> the one question that would settle it by phone
    bp: 'What is your blood pressure limit for donors, and do home readings count?',
    dm: 'How does your program treat prediabetes or a family history of diabetes?',
    kd: 'Does a past kidney stone, infection or other kidney history rule me out here?',
    ld: 'Does my liver history change my eligibility here?',
    heart: 'Does my heart or clotting history rule me out here?',
    cancer: 'How long after my cancer history must I wait, and which types do you accept?',
    inf: 'How do you handle my infection history for a living donor?',
    preg: 'What timing do you advise around pregnancy?',
    smoke: 'How long must I be nicotine-free before surgery, and do you test?',
    alc: 'What are your limits on alcohol for donors?',
    sub: 'What are your rules on drug and opioid use for donors?',
    meds: 'Which of my regular medicines would need to change before surgery?',
    mh: 'How does the psychosocial evaluation treat mental health history and treatment?'
  };

  var STAGES = [
    ['1', 'This self-screen', 'Free, about 10 minutes, at home', 'No travel. Catches the common reasons programs decline, before you spend anything.'],
    ['2', 'Phone screen with the coordinator', '15 to 30 minutes by phone', 'No travel. Ask your limits questions first (below). Many programs can start your paperwork and pre-screen by phone or online.'],
    ['3', 'Local testing, where you live', 'Labs, urine tests, blood pressure log, imaging', 'Ask whether these can be done near home with your own clinic or a local lab, with results sent to the program.'],
    ['4', 'One bundled visit', 'One day, scheduled back to back', 'Ask the program to put the donor tests, the social worker, the independent donor advocate and the surgeon on the same day or two.'],
    ['5', 'Decision and surgery planning', 'Team review, consent, date', 'You decide last, with every result in front of you. You can stop at any step.']
  ];

  window.cifRespectPanel = function (ctx) {
    var A = ctx.A || {}, R = ctx.R || {}, qs = [];
    var bmi = parseFloat(A._bmi);
    if (!isNaN(bmi) && bmi >= 28) qs.push('What is your BMI limit for donors, and do you offer a plan to become eligible if I am slightly over it?');
    Object.keys(LIMITS).forEach(function (k) { if (R[k] && (R[k].s === 'A1' || R[k].s === 'A2' || R[k].s === 'R')) qs.push(LIMITS[k]); });
    var core = ['Can you start my screening by phone or online before I travel anywhere?',
      'Can the labs and imaging be done near my home, with results sent to you?',
      'Will you schedule my donor tests, social worker, advocate and surgeon on one or two consecutive days?',
      'If you decide I am not a candidate, will you tell me why, in writing, and how soon?',
      'Can the financial coordinator help me apply to NLDAC before I book travel?'];
    var list = qs.slice(0, 4).concat(core);
    var h = '<div class="rbox wide" id="respectpanel"><h3>Protect your time, your travel and your pay</h3>' +
      '<p style="font-size:17px;color:var(--ink80)">You should never lose a day’s wages to find out something a phone call could have told you. This plan puts the cheap, local and reversible steps first, and the trip last. Try it in this order.</p>' +
      '<ol class="stg">' + STAGES.map(function (s) { return '<li><b>' + s[1] + '</b><span class="stg-t"> &middot; ' + s[2] + '</span><div>' + s[3] + '</div></li>'; }).join('') + '</ol>' +
      '<div class="mono" style="font-size:11px;color:var(--pulse);margin-top:16px">Ask these on the phone before you book any trip</div><ol class="stg2" id="rqs">' + list.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
      '<button type="button" class="btn line" id="rqc">Copy these questions</button>' +
      '<div class="mono" style="font-size:11px;color:var(--pulse);margin-top:20px">What could an extra trip cost you? (your numbers, your estimate)</div>' +
      '<div class="est"><label>One-way miles to the program<input id="e_mi" type="number" min="0" value="' + (ctx.miles || 60) + '"></label>' +
      '<label>Pay you lose per day off ($)<input id="e_pay" type="number" min="0" value="200"></label>' +
      '<label>Trips if scheduled one at a time<input id="e_t1" type="number" min="1" value="4"></label>' +
      '<label>Trips if bundled<input id="e_t2" type="number" min="1" value="1"></label>' +
      '<label>Days off per trip<input id="e_d" type="number" min="0" step="0.5" value="1"></label>' +
      '<label>Cost per mile ($)<input id="e_pm" type="number" min="0" step="0.01" value="0.70"></label>' +
      '<label>Hotel per trip ($)<input id="e_h" type="number" min="0" value="0"></label></div>' +
      '<div id="e_out" class="est-out" aria-live="polite"></div>' +
      '<div class="cc-note">These are not claims about any program. The starting numbers are placeholders: change every one to match your life. The recipient’s insurance usually covers your medical evaluation and surgery, while travel, lodging and lost wages are the usual gaps that the <a href="https://livingdonorassistance.org/How-to-Apply/Eligibility-Guidelines" target="_blank" rel="noopener">National Living Donor Assistance Center</a> may help with, based on the recipient’s household income. Ask about it before you travel, not after.</div></div>';
    return {
      html: h,
      bind: function (root, toast) {
        var $ = function (s) { return root.querySelector(s); };
        var calc = function () {
          var v = function (id) { return Math.max(0, parseFloat($(id).value) || 0); };
          var trip = function (n) { return n * (2 * v('#e_mi') * v('#e_pm') + v('#e_d') * v('#e_pay') + v('#e_h')); };
          var a = trip(v('#e_t1')), b = trip(v('#e_t2')), days1 = v('#e_t1') * v('#e_d'), days2 = v('#e_t2') * v('#e_d');
          $('#e_out').innerHTML = '<div><span>One at a time</span><b>' + money(a) + '</b><small>' + days1 + ' days off, ' + Math.round(v('#e_t1') * 2 * v('#e_mi')) + ' miles</small></div>' +
            '<div><span>Bundled</span><b>' + money(b) + '</b><small>' + days2 + ' days off, ' + Math.round(v('#e_t2') * 2 * v('#e_mi')) + ' miles</small></div>' +
            '<div class="save"><span>Saved by asking</span><b>' + money(Math.max(0, a - b)) + '</b><small>' + Math.max(0, days1 - days2) + ' days of work</small></div>';
        };
        root.querySelectorAll('.est input').forEach(function (i) { i.oninput = calc; });
        calc();
        $('#rqc').onclick = function () {
          var t = Array.prototype.map.call(root.querySelectorAll('#rqs li'), function (li, i) { return (i + 1) + '. ' + li.textContent; }).join('\n');
          (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('Questions copied'); }, function () { prompt('Copy:', t); });
        };
      }
    };
  };
})();
