/* "Your first calls" panel for living-donor-journey.html.
   Ranks transplant programs for the visitor's state, shows a dated public phone number where one exists
   (center-contacts.json, built from CMS records by _tools/build-center-contacts.py), a call script written
   from the visitor's own answers, a private call log with a follow-up reminder, and reliability ratings.
   Nothing here dials anyone: the visitor taps a number and their own phone places the call. */
(function () {
  'use strict';
  var KEY = 'cifCallLog.v1', MIN_REPORTS = 3, PAGE = 10;
  var NATIONAL = [
    { id: 'nldac', name: 'National Living Donor Assistance Center (NLDAC)', phone: '888-870-5002', line: 'national line',
      why: 'Help with travel, lodging and lost wages for eligible donors. Weekdays 9 a.m.-5 p.m. ET.', src: 'https://livingdonorassistance.org/About-Us/Contact-Us' },
    { id: 'optn', name: 'OPTN patient services line', phone: '866-678-6411', line: 'national line',
      why: 'How programs work, or a problem with one. Weekdays 8:30 a.m.-6 p.m. ET. Also written 1-866-OPTN-411.', src: 'https://www.hrsa.gov/sites/default/files/hrsa/optn/optn_patient_info_letter.pdf' }
  ];
  var REGISTRIES = [
    ['National Kidney Registry', 'https://www.kidneyregistry.org/'],
    ['Alliance for Paired Donation', 'https://www.paireddonation.org/'],
    ['OPTN kidney paired donation', 'https://optn.transplant.hrsa.gov/patients/by-organ/kidney/kidney-paired-donation/']
  ];
  var OUT = [['reached', 'Reached a person'], ['voicemail', 'Left a voicemail'], ['hold', 'On hold or transferred, no answer'], ['wrong', 'Wrong or disconnected number'], ['redirect', 'Told to call somewhere else']];
  var RESPECT = [['cb', 'Called back within 2 business days'], ['steps', 'Explained the steps and timeline'], ['adv', 'Named an independent donor advocate'], ['local', 'Offered testing near my home'], ['bundle', 'Offered to bundle visits'], ['resp', 'Treated me with respect']];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var tel = function (p) { return 'tel:+1' + String(p).replace(/\D/g, '').replace(/^1/, ''); };
  var load = function () { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  var save = function (d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  var getJSON = function (u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); };

  function script(ctx) {
    var org = ctx.liver ? 'a portion of my liver' : 'a kidney';
    var qs = (ctx.asks || []).slice(0, 4);
    return 'Hello, my name is [your name]. I am calling to start the process of becoming a living donor. ' +
      (ctx.nonDirected ? 'I do not have a specific recipient in mind and would like to know whether you accept non-directed donors. ' : 'I would like to donate ' + org + ' to someone I know. ') +
      (ctx.pe ? 'My blood type may not match, so I also want to ask about paired exchange. ' : '') +
      'May I speak with the living donor coordinator or the transplant social worker?\n\nPlease tell me:\n' +
      '1. What is the first step, and can you begin my screening by phone today?\n2. How long does evaluation usually take here, and who is my independent living donor advocate?\n3. What are the most common reasons you decline a donor, and what are your limits for blood pressure and BMI?\n4. What is the coordinator’s direct number or email, and the best time to reach them?\n5. If I do not hear back, who should I call, and after how many days?' +
      qs.map(function (q, i) { return '\n' + (6 + i) + '. ' + q; }).join('') +
      '\n\nIf you reach voicemail, leave: your full name, a number where a person can reach you, the days and hours you can talk, and one sentence: “I am calling about living ' + (ctx.liver ? 'liver' : 'kidney') + ' donation.”';
  }

  function remind(name) {
    var d = new Date(), add = 2; while (add) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) add--; }
    var p = function (n) { return ('0' + n).slice(-2); }, ds = d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cold Ischemia Foundation//EN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@coldischemia.foundation', 'DTSTAMP:' + ds + 'T120000Z',
      'DTSTART;VALUE=DATE:' + ds, 'SUMMARY:Follow up: living donor call to ' + name.replace(/[,;\n]/g, ' '), 'DESCRIPTION:Call again if no one has called back. Ask for the living donor coordinator or the transplant social worker.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'follow-up-call.ics';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function stars(c, l) {
    return '<span class="cc-stars" role="radiogroup" aria-label="Rate how helpful this contact was">' + [1, 2, 3, 4, 5].map(function (n) {
      return '<button type="button" role="radio" aria-checked="' + (l.stars === n) + '" aria-label="' + n + ' of 5" data-s="' + n + '">' + (l.stars >= n ? '★' : '☆') + '</button>'; }).join('') + '</span>';
  }

  function row(c, log, pub) {
    var l = log[c.id] || {}, p = pub[c.id], h = '<div class="cc" data-id="' + esc(c.id) + '"><div class="cc-top"><div><b>' + esc(c.name) + '</b>' + (c.city ? '<span class="cc-sub"> &middot; ' + esc(c.city) + '</span>' : '') +
      '<div class="cc-why">' + esc(c.why) + '</div>' +
      (c.phone && c.retrieved ? '<div class="cc-src">Public record: ' + esc(c.line) + ', ' + esc(c.source) + ', retrieved ' + esc(c.retrieved) + '</div>' : '') +
      (p && p.direct ? '<div class="cc-pub">People reached this program at ' + esc(p.direct) + '</div>' : '') +
      (p && p.reports >= MIN_REPORTS ? '<div class="cc-pub">' + p.reports + ' people reported: ' + Math.round(p.reached * 100) + '% reached a person' + (p.respect != null ? ', ' + p.respect.toFixed(1) + ' of 6 respect checks met on average' : '') + '</div>' : '') +
      '</div><div class="cc-act">' +
      (c.phone ? '<a class="btn gold" href="' + tel(c.phone) + '">Call ' + esc(c.phone) + '</a>' :
        '<a class="btn line" target="_blank" rel="noopener" href="https://www.google.com/search?q=' + encodeURIComponent(c.name + ' ' + (c.city || '') + ' living donor program phone number') + '">Find the living donor line</a>') +
      '</div></div><div class="cc-log"><select aria-label="Outcome of your call to ' + esc(c.name) + '"><option value="">How did the call go?</option>' +
      OUT.map(function (o) { return '<option value="' + o[0] + '"' + (l.out === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' + stars(c, l) +
      '<input class="cc-direct" inputmode="tel" placeholder="Direct line you were given (optional)" value="' + esc(l.direct || '') + '" aria-label="Direct number you were given">' +
      '<button type="button" class="btn line cc-rem">Remind me in 2 business days</button>' +
      '<details class="cc-resp" style="flex-basis:100%"><summary style="cursor:pointer;font-size:15px;color:var(--ink80)">Respect check: what did they actually do?</summary>' + RESPECT.map(function (r) { return '<label style="display:block;font-size:15px;margin:4px 0"><input type="checkbox" class="cc-r" data-k="' + r[0] + '"' + ((l.r || {})[r[0]] ? ' checked' : '') + '> ' + r[1] + '</label>'; }).join('') + '</details>' +
      (l.out ? '<button type="button" class="btn line cc-send">Share this (anonymous)</button>' : '') + '</div>' +
      (l.at ? '<div class="cc-when">Logged ' + esc(l.at) + (l.sent ? ' &middot; shared, thank you' : '') + '</div>' : '') + '</div>';
    return h;
  }

  window.cifCallPanel = function (ctx) {
    var progs = [];
    var seen = {};
    (ctx.centers || []).forEach(function (c) {
      var id = slug(c.n + '-' + c.c); if (seen[id]) return; seen[id] = 1;
      progs.push({ id: id, name: c.n, city: c.c, why: 'Ask for the living donor coordinator or the transplant social worker.' });
    });
    var cities = progs.map(function (p) { return p.city; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).sort();
    var fixed = (ctx.opos || []).map(function (o) { return { id: slug(o.name), name: o.name + ' (OPO)', city: o.city + ', ' + o.state, phone: o.phone, line: 'OPO office', source: 'HRSA OPO directory', retrieved: '2026-09-28', why: 'Handles deceased donation. They can tell you which nearby programs run a living donor program, but they do not evaluate living donors.' }; })
      .concat(NATIONAL.map(function (n) { return { id: n.id, name: n.name, phone: n.phone, line: n.line, source: 'official page', retrieved: '2026-10', why: n.why }; }));
    var css = '<style>.cc{border:1px solid var(--b2);border-radius:8px;padding:14px;margin-top:10px;background:var(--surf)}.cc-top{display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap}.cc-sub,.cc-why,.cc-when,.cc-src{font-size:14px;color:var(--ink60)}.cc-src{font-family:\'IBM Plex Mono\',monospace;font-size:11px;margin-top:4px}.cc-pub{font-size:14px;color:#50c878;margin-top:6px}.cc-log{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}.cc-log select,.cc-direct{background:var(--void);color:var(--ink);border:1px solid var(--b2);border-radius:6px;padding:8px;font:inherit;font-size:15px}.cc-direct{width:230px;max-width:100%}.cc-stars button{background:none;border:0;color:#e8b84a;font-size:22px;cursor:pointer;padding:0 2px}.cc pre{white-space:pre-wrap;font:inherit;font-size:15.5px;background:var(--void);padding:12px;border-radius:6px;border:1px solid var(--b2)}.cc-note{font-size:14px;color:var(--ink60);margin-top:12px}.cc-tools{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:12px 0}.cc-tools select{background:var(--void);color:var(--ink);border:1px solid var(--b2);border-radius:6px;padding:8px;font:inherit}@media print{.cc-log{display:none}}</style>';
    var h = css + '<div class="rbox wide" id="callpanel"><h3>Your first calls</h3>' +
      '<p style="font-size:17px;color:var(--ink80)">Nothing starts until a coordinator hears from you. Call two or three programs the same day: each has its own limits, and a no from one is not a no from all. Tap a number on your phone, or copy it and dial. Your own phone places the call; this page never dials for you and never stores your number.</p>' +
      '<div class="mono" style="font-size:11px;color:var(--pulse);margin-top:12px">Your call script, built from your answers</div><div class="cc"><pre id="ccs">' + esc(script(ctx)) + '</pre><button type="button" class="btn line" id="ccc">Copy script</button></div>' +
      '<div class="mono" style="font-size:11px;color:var(--pulse);margin-top:16px">Transplant programs near you</div>' +
      (cities.length ? '<div class="cc-tools"><label for="cccity" style="font-size:15px">Closest city:</label><select id="cccity"><option value="">Any city in my state’s region</option>' + cities.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></div>' : '') +
      '<div id="ccprogs"></div><div id="ccmore"></div>' +
      '<div class="mono" style="font-size:11px;color:var(--pulse);margin-top:16px">Also worth a call</div><div id="ccfixed"></div>' +
      (ctx.pe ? '<div class="mono" style="font-size:11px;color:var(--pulse);margin-top:16px">Paired exchange registries</div><div class="cc">' + REGISTRIES.map(function (r) { return '<div><a href="' + r[1] + '" target="_blank" rel="noopener">' + r[0] + '</a></div>'; }).join('') + '<div class="cc-why" style="margin-top:6px">You usually join through a transplant program, not on your own. Ask which registries it uses.</div></div>' : '') +
      '<div class="cc-note"><b>Where these numbers come from.</b> Program names are from HRSA’s organ procurement organization data. Phone numbers come from CMS’s public hospital records and are each hospital’s <i>main line</i>, with the date retrieved. No public record lists a transplant social worker’s or coordinator’s direct number, so on the main line ask for the living donor coordinator or transplant social worker by title. If you get a direct line, enter it above and share it: that is how this list gets better. A number we cannot match with confidence is not shown; you get a search link instead.</div>' +
      '<div class="cc-note"><b>How ratings work.</b> Your log stays on this device. If you choose &ldquo;Share this,&rdquo; only the program, outcome, stars and any direct line you typed go to the foundation, with no name or number of yours. A program’s reliability appears here only after ' + MIN_REPORTS + ' or more people report on it, and direct lines are shown only after the foundation has checked them.</div></div>';
    return {
      html: h,
      bind: function (root, toast, send) {
        var log = load(), pub = {}, contacts = {}, city = '', shown = PAGE;
        var all = progs.concat(fixed);
        var byId = {}; all.forEach(function (c) { byId[c.id] = c; });
        var rank = function () {
          var withPhone = function (c) { return c.phone ? 1 : 0; };
          return progs.slice().sort(function (a, b) {
            var ca = city && a.city === city ? 1 : 0, cb = city && b.city === city ? 1 : 0;
            return (cb - ca) || (withPhone(b) - withPhone(a)) || a.name.localeCompare(b.name);
          });
        };
        var paint = function () {
          progs.forEach(function (p) { var k = contacts[p.id]; if (k) { p.phone = k.phone; p.line = k.line; p.source = 'CMS Hospital General Information'; p.retrieved = k.retrieved; } });
          var r = rank();
          root.querySelector('#ccprogs').innerHTML = r.slice(0, shown).map(function (c) { return row(c, log, pub); }).join('') || '<div class="cc-why">No programs found for this state in our data. Use the national lines below.</div>';
          root.querySelector('#ccmore').innerHTML = r.length > shown ? '<button type="button" class="btn line" id="ccm" style="margin-top:10px">Show ' + Math.min(PAGE, r.length - shown) + ' more (' + (r.length - shown) + ' left)</button>' : '';
          root.querySelector('#ccfixed').innerHTML = fixed.map(function (c) { return row(c, log, pub); }).join('');
        };
        paint();
        getJSON('center-contacts.json').then(function (j) { contacts = (j && j.contacts) || {}; paint(); });
        getJSON('contact-ratings.json').then(function (j) { if (j && j.contacts) { pub = j.contacts; paint(); } });
        var ep = window.CIF_CONFIG && window.CIF_CONFIG.formsEndpoint;
        if (ep && window.cifFormsReady && window.cifFormsReady()) getJSON(ep + '?ratings=1').then(function (j) {
          if (j && j.contacts) { Object.keys(j.contacts).forEach(function (k) { pub[k] = Object.assign({}, pub[k], j.contacts[k]); }); paint(); } });
        root.querySelector('#ccc').onclick = function () { var t = root.querySelector('#ccs').textContent; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('Script copied'); }, function () { prompt('Copy your script:', t); }); };
        var sel = root.querySelector('#cccity'); if (sel) sel.onchange = function () { city = sel.value; shown = PAGE; paint(); };
        var panel = root.querySelector('#callpanel');
        var find = function (e) { var el = e.target.closest('.cc'); return el && byId[el.dataset.id]; };
        panel.addEventListener('change', function (e) {
          var c = find(e); if (!c) return; var l = log[c.id] = log[c.id] || {};
          if (e.target.tagName === 'SELECT') { l.out = e.target.value; l.at = new Date().toLocaleDateString(); save(log); paint(); }
          else if (e.target.classList.contains('cc-r')) { l.r = l.r || {}; l.r[e.target.dataset.k] = e.target.checked; l.at = new Date().toLocaleDateString(); save(log); }
          else if (e.target.classList.contains('cc-direct')) { l.direct = e.target.value.replace(/[^\d()+\-. ext]/gi, '').slice(0, 24); save(log); }
        });
        panel.addEventListener('click', function (e) {
          if (e.target.id === 'ccm') { shown += PAGE; return paint(); }
          var c = find(e); if (!c) return; var l = log[c.id] = log[c.id] || {};
          if (e.target.dataset.s) { l.stars = +e.target.dataset.s; l.at = new Date().toLocaleDateString(); save(log); paint(); }
          else if (e.target.classList.contains('cc-rem')) { remind(c.name); toast('Reminder file downloaded'); }
          else if (e.target.classList.contains('cc-send')) {
            e.target.disabled = true;
            send({ formType: 'contact-rating', id: c.id, contact: c.name, city: c.city || '', listedPhone: c.phone || '', outcome: l.out, stars: l.stars || '', directLine: l.direct || '', respect: Object.keys(l.r || {}).filter(function (k) { return l.r[k]; }).join(',') })
              .then(function () { l.sent = 1; save(log); paint(); toast('Thank you. Shared.'); }, function () { e.target.disabled = false; toast('Could not send. Your log is saved on this device.'); });
          }
        });
      }
    };
  };
})();
