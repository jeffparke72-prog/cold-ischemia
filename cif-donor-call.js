/* "Make the call" panel for living-donor-journey.html.
   Click-to-call numbers, a call script, a private call log with follow-up reminder, and contact-reliability ratings.
   Nothing here dials anyone: the visitor taps a number and their own phone places the call.
   Ratings stay on the visitor's device unless they choose to send one; published rankings come from contact-ratings.json. */
(function () {
  var KEY = 'cifCallLog.v1', MIN_REPORTS = 3;
  var NATIONAL = [
    { id: 'nldac', name: 'National Living Donor Assistance Center (NLDAC)', phone: '888-870-5002',
      why: 'Ask about help with travel, lodging and lost wages. Open 9 a.m.-5 p.m. ET, Monday-Friday.', src: 'https://livingdonorassistance.org/About-Us/Contact-Us' },
    { id: 'optn', name: 'OPTN patient services line', phone: '866-678-6411',
      why: 'Questions about how transplant programs work, or a problem with one. Weekdays, 8:30 a.m.-6 p.m. ET. Also written 1-866-OPTN-411.', src: 'https://www.hrsa.gov/sites/default/files/hrsa/optn/optn_patient_info_letter.pdf' }
  ];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var tel = function (p) { return 'tel:+1' + String(p).replace(/\D/g, '').replace(/^1/, ''); };
  var OUT = [['reached', 'Reached a person'], ['voicemail', 'Left a voicemail'], ['hold', 'On hold or transferred, no answer'], ['wrong', 'Wrong or disconnected number'], ['redirect', 'Told to call somewhere else']];

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }

  var published = {};
  function loadPublished() {
    return fetch('contact-ratings.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) { published = (j && j.contacts) || {}; }).catch(function () { published = {}; });
  }

  function script(ctx) {
    var org = ctx.liver ? 'a portion of my liver' : 'a kidney';
    return 'Hello, my name is [your name]. I am calling to ask about becoming a living donor. ' +
      (ctx.nonDirected ? 'I do not have a specific recipient in mind and would like to know if you accept non-directed donors.' : 'I would like to donate ' + org + (ctx.recipient ? ' to ' + ctx.recipient : ' to someone I know') + '.') +
      '\n\nPlease tell me:\n1. Do you have a living donor program, and who is the living donor coordinator?\n2. What is the first step, and can you start my screening by phone today?\n3. How long does evaluation usually take at your center?\n4. Is there a direct number or email for the coordinator, and when is the best time to reach them?\n5. If I do not hear back, who should I call next, and after how many days?\n\n' +
      'If you reach voicemail, leave: your full name, a number where a person can reach you, the days and hours you can talk, and one sentence: "I am calling about living ' + (ctx.liver ? 'liver' : 'kidney') + ' donation."';
  }

  function remind(name, phone) {
    var d = new Date(); var add = 2; while (add) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) add--; }
    var p = function (n) { return ('0' + n).slice(-2); };
    var ds = d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cold Ischemia Foundation//EN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@coldischemia.foundation',
      'DTSTAMP:' + ds + 'T120000Z', 'DTSTART;VALUE=DATE:' + ds, 'SUMMARY:Follow up: living donor call to ' + name.replace(/[,;\n]/g, ' '),
      'DESCRIPTION:Call again ' + phone + ' if no one has called back. Ask for the living donor coordinator.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'follow-up-call.ics';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function row(c, log) {
    var l = log[c.id] || {}, pub = published[c.id], h = '<div class="cc" data-id="' + esc(c.id) + '"><div class="cc-top"><div><b>' + esc(c.name) + '</b>' +
      (c.city ? '<span class="cc-sub"> &middot; ' + esc(c.city) + '</span>' : '') + (c.why ? '<div class="cc-why">' + esc(c.why) + '</div>' : '') + '</div><div class="cc-act">';
    h += c.phone ? '<a class="btn gold" href="' + tel(c.phone) + '" data-call="1">Call ' + esc(c.phone) + '</a>' :
      '<a class="btn line" target="_blank" rel="noopener" href="https://www.google.com/search?q=' + encodeURIComponent(c.name + ' ' + (c.city || '') + ' living donor program phone number') + '">Find the living donor line</a>';
    h += '</div></div>';
    if (pub && pub.reports >= MIN_REPORTS) h += '<div class="cc-pub">Reported by ' + pub.reports + ' people: ' + Math.round(pub.reached * 100) + '% reached a person' + (pub.days ? ', typical callback ' + esc(pub.days) + ' days' : '') + '</div>';
    h += '<div class="cc-log"><select aria-label="Outcome of your call to ' + esc(c.name) + '"><option value="">How did the call go?</option>' +
      OUT.map(function (o) { return '<option value="' + o[0] + '"' + (l.out === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
      '<span class="cc-stars" role="radiogroup" aria-label="Rate how helpful this contact was">' +
      [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" role="radio" aria-checked="' + (l.stars === n) + '" aria-label="' + n + ' of 5" data-s="' + n + '">' + (l.stars >= n ? '★' : '☆') + '</button>'; }).join('') + '</span>' +
      '<button type="button" class="btn line cc-rem">Remind me in 2 business days</button>' +
      (l.out ? '<button type="button" class="btn line cc-send">Share this rating (anonymous)</button>' : '') + '</div>' +
      (l.at ? '<div class="cc-when">Logged ' + esc(l.at) + (l.sent ? ' &middot; shared, thank you' : '') + '</div>' : '') + '</div>';
    return h;
  }

  window.cifCallPanel = function (ctx) {
    var contacts = [], seen = {};
    (ctx.centers || []).forEach(function (c) { var id = slug(c.n + '-' + c.c); if (!seen[id]) { seen[id] = 1; contacts.push({ id: id, name: c.n, city: c.c + (c.st ? ', ' + c.st : ''), why: 'Ask for the living donor coordinator.' }); } });
    var opos = (ctx.opos || []).map(function (o) { return { id: slug(o.name), name: o.name + ' (OPO)', city: o.city + ', ' + o.state, phone: o.phone, why: 'Handles deceased donation. They can tell you which local programs run a living donor program, but they do not evaluate living donors.' }; });
    var all = contacts.concat(opos, NATIONAL.map(function (n) { return { id: n.id, name: n.name, phone: n.phone, why: n.why }; }));
    var css = '<style>.cc{border:1px solid var(--b2);border-radius:8px;padding:14px;margin-top:10px;background:var(--surf)}.cc-top{display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap}.cc-sub,.cc-why,.cc-when,.cc-pub{font-size:14px;color:var(--ink60)}.cc-pub{color:#50c878;margin-top:6px}.cc-log{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}.cc-log select{background:var(--void);color:var(--ink);border:1px solid var(--b2);border-radius:6px;padding:8px;font:inherit;font-size:15px}.cc-stars button{background:none;border:0;color:#e8b84a;font-size:22px;cursor:pointer;padding:0 2px}.cc pre{white-space:pre-wrap;font:inherit;font-size:15.5px;background:var(--void);padding:12px;border-radius:6px;border:1px solid var(--b2)}.cc-note{font-size:14px;color:var(--ink60);margin-top:12px}@media print{.cc-log{display:none}}</style>';
    var h = css + '<div class="rbox wide" id="callpanel"><h3>Make the call</h3><p style="font-size:17px;color:var(--ink80)">Nothing starts until a coordinator hears from you. Pick one or two programs below, tap the number on your phone, and use the script. On a computer, copy the number and dial from your phone. Calls are placed by your own phone: this page never dials for you or stores your number.</p>' +
      '<div class="mono" style="font-size:11px;color:var(--pulse);margin-top:12px">Your call script</div><div class="cc"><pre id="ccs">' + esc(script(ctx)) + '</pre><button type="button" class="btn line" id="ccc">Copy script</button></div>' +
      '<div class="mono" style="font-size:11px;color:var(--pulse);margin-top:16px">Who to call (' + all.length + ')</div><div id="cclist"></div>' +
      '<div class="cc-note">Program names and OPO phones come from HRSA data on this site. HRSA does not publish which programs run a living donor line or a coordinator&rsquo;s direct number, so for programs we link a search instead of guessing one. National lines were checked against NLDAC and HRSA pages. Numbers change; if one is wrong, rate it &ldquo;wrong or disconnected&rdquo; and tell us.</div>' +
      '<div class="cc-note"><b>How ratings work.</b> Your log stays on this device. If you choose &ldquo;Share this rating,&rdquo; only the contact, outcome and stars go to the foundation, with no name or phone number. A contact&rsquo;s reliability appears here only after ' + MIN_REPORTS + ' or more people have reported on it.</div></div>';
    return {
      html: h,
      bind: function (root, toast, send) {
        var log = load(), list = root.querySelector('#cclist');
        var paint = function () { var ph = all.filter(function (c) { return c.phone; }), pr = all.filter(function (c) { return !c.phone; }), open = list.querySelector('details') && list.querySelector('details').open; list.innerHTML = ph.map(function (c) { return row(c, log); }).join('') + (pr.length ? '<details' + (open ? ' open' : '') + ' style="margin-top:14px"><summary style="cursor:pointer;font-size:17px">Transplant programs in your area (' + pr.length + '): find each living donor line</summary>' + pr.map(function (c) { return row(c, log); }).join('') + '</details>' : ''); };
        paint(); loadPublished().then(paint);
        root.querySelector('#ccc').onclick = function () { var t = root.querySelector('#ccs').textContent; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('Script copied'); }, function () { prompt('Copy your script:', t); }); };
        var find = function (e) { var el = e.target.closest('.cc'); return el && all.filter(function (c) { return c.id === el.dataset.id; })[0]; };
        list.addEventListener('change', function (e) { var c = find(e); if (!c || e.target.tagName !== 'SELECT') return; var l = log[c.id] = log[c.id] || {}; l.out = e.target.value; l.at = new Date().toLocaleDateString(); save(log); paint(); });
        list.addEventListener('click', function (e) {
          var c = find(e); if (!c) return; var l = log[c.id] = log[c.id] || {};
          if (e.target.dataset.s) { l.stars = +e.target.dataset.s; l.at = new Date().toLocaleDateString(); save(log); paint(); }
          else if (e.target.classList.contains('cc-rem')) { remind(c.name, c.phone || 'the program'); toast('Reminder file downloaded'); }
          else if (e.target.classList.contains('cc-send')) {
            e.target.disabled = true;
            var msg = 'CONTACT RATING (anonymous)\nContact: ' + c.name + ' ' + (c.city || '') + '\nId: ' + c.id + '\nPhone: ' + (c.phone || 'n/a') + '\nOutcome: ' + l.out + '\nStars: ' + (l.stars || 'n/a');
            send({ formType: 'contact', name: 'Anonymous rating', email: 'noreply@coldischemia.foundation', subject: 'Contact rating', message: msg, category: 'contact-rating' })
              .then(function () { l.sent = 1; save(log); paint(); toast('Thank you. Rating shared.'); }, function () { e.target.disabled = false; toast('Could not send. Your rating is saved on this device.'); });
          }
        });
      }
    };
  };
})();
