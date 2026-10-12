/* CIFReach: "Reach a kidney transplant center now".
   Reads kidney-centers.json (every U.S. kidney transplant center by state: HRSA records for the center, CMS records for the
   hospital's main phone) and program-contacts.json (direct living-donor contacts a program publishes on its own website).
   Nothing is dialed or sent for the visitor: they tap Call, Directions or Copy, and their own phone or email does the rest. */
(function () {
  'use strict';
  var NAMES = {}, DATA = null, PC = {}, OPOS = window.CIF_OPOS || [];
  var CENT = { AL: [32.8, -86.8], AK: [64.2, -152.5], AZ: [34.3, -111.7], AR: [34.9, -92.4], CA: [37.2, -119.5], CO: [39.0, -105.5], CT: [41.6, -72.7], DE: [39.0, -75.5], DC: [38.9, -77.0], FL: [28.6, -82.4], GA: [32.7, -83.4], HI: [20.8, -156.3], ID: [44.4, -114.6], IL: [40.0, -89.2], IN: [39.9, -86.3], IA: [42.1, -93.5], KS: [38.5, -98.4], KY: [37.5, -85.3], LA: [31.1, -92.0], ME: [45.4, -69.2], MD: [39.0, -76.8], MA: [42.3, -71.8], MI: [44.3, -85.4], MN: [46.3, -94.3], MS: [32.7, -89.7], MO: [38.4, -92.5], MT: [47.0, -109.6], NE: [41.5, -99.8], NV: [39.3, -116.6], NH: [43.7, -71.6], NJ: [40.2, -74.7], NM: [34.4, -106.1], NY: [42.9, -75.5], NC: [35.5, -79.4], ND: [47.5, -100.5], OH: [40.3, -82.8], OK: [35.6, -97.5], OR: [43.9, -120.6], PA: [40.9, -77.8], PR: [18.2, -66.5], RI: [41.7, -71.5], SC: [33.9, -80.9], SD: [44.4, -100.2], TN: [35.9, -86.4], TX: [31.5, -99.3], UT: [39.3, -111.7], VT: [44.1, -72.7], VA: [37.5, -78.9], WA: [47.4, -120.5], WV: [38.6, -80.6], WI: [44.6, -89.9], WY: [43.0, -107.5] };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var tel = function (p) { return 'tel:+1' + String(p).replace(/\D/g, '').replace(/^1/, ''); };
  var getJSON = function (u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); };
  var km = function (a, b) { var R = 6371, t = Math.PI / 180, dl = (b[0] - a[0]) * t, dn = (b[1] - a[1]) * t, x = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dn / 2) * Math.sin(dn / 2); return 2 * R * Math.asin(Math.sqrt(x)); };
  var mi = function (k) { return Math.round(k * 0.621371); };

  function load() {
    if (DATA) return Promise.resolve();
    return Promise.all([getJSON('kidney-centers.json'), getJSON('program-contacts.json')]).then(function (r) {
      DATA = (r[0] && r[0].states) || {}; NAMES = (r[0] && r[0].names) || {}; window.CIF_REACH_META = r[0] || {};
      var raw = (r[1] && r[1].contacts) || {}, map = {};          // program-contacts keys are slug(name + '-' + OPO city): map them to the plain center name
      OPOS.forEach(function (o) { o.centers.forEach(function (c) { var k = slug(c.n + '-' + c.c); if (raw[k]) map[slug(c.n)] = raw[k]; }); });
      PC = map;
    });
  }
  function all() { var out = []; Object.keys(DATA).forEach(function (s) { DATA[s].forEach(function (c) { out.push(c); }); }); return out; }
  function stateName(s) { return NAMES[s] || s; }
  function savedState() { try { var p = JSON.parse(localStorage.getItem('cifDonorProfile.v1') || 'null'); return p && p.A && p.A.state || ''; } catch (e) { return ''; } }
  function centersFor(st, me) {
    var inState = (DATA[st] || []).slice(), pool = inState;
    if (inState.length < 4) {     // too few or none in this state: add the nearest centers in other states, measured from the middle of the state
      var from = CENT[st] || [39.5, -98.35];
      var others = all().filter(function (c) { return c.state !== st && c.lat != null; }).map(function (c) { return Object.assign({}, c, { _d: km(from, [c.lat, c.lon]), _out: true }); }).sort(function (a, b) { return a._d - b._d; }).slice(0, Math.max(0, 6 - inState.length));
      pool = inState.concat(others);
    }
    if (me) pool = pool.map(function (c) { return Object.assign({}, c, { _m: c.lat != null ? km(me, [c.lat, c.lon]) : 9e9 }); }).sort(function (a, b) { return a._m - b._m; });
    return pool;
  }
  function message(name, who) {
    return 'Hello, my name is ' + (name || '[your name]') + '. I am interested in becoming a living kidney donor' + (who ? ' for ' + who : '') + '. I would like to speak with a living donor coordinator or transplant social worker. If that is not possible, please connect me with the transplant program\u2019s administrative office so I can find out the first step and how to start my screening. My phone number is [your number] and the best times to reach me are [days and hours]. Thank you.';
  }
  function card(c, opts) {
    var d = PC[slug(c.name)], addr = [c.address, c.city, c.state, c.zip].filter(Boolean).join(', ');
    var h = '<article class="rc" data-code="' + esc(c.code) + '"><div class="rc-top"><div><h3>' + esc(c.name) + '</h3><div class="rc-sub">' + esc(c.address) + (c.address ? ', ' : '') + esc(c.city) + ', ' + esc(c.state) + ' ' + esc(c.zip) +
      (c._m != null && c._m < 9e9 ? ' &middot; <b>' + mi(c._m) + ' mi from you</b>' : c._out ? ' &middot; ' + mi(c._d) + ' mi from the middle of ' + esc(stateName(opts.state)) : '') + '</div></div><div class="rc-act">' +
      (c.phone ? '<a class="rc-btn gold" href="' + tel(c.phone) + '">Call ' + esc(c.phone) + '</a>' : '<a class="rc-btn gold" target="_blank" rel="noopener" href="https://www.google.com/search?q=' + encodeURIComponent(c.name + ' ' + c.city + ' ' + c.state + ' transplant phone number') + '">Find the phone number</a>') +
      '<a class="rc-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.name + ', ' + addr) + '">Directions</a>' +
      '<a class="rc-btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=' + encodeURIComponent(c.name + ' ' + c.city + ' living kidney donor program') + '">Living donor page</a></div></div>';
    h += '<div class="rc-ask"><b>When you call, ask for:</b> the living donor coordinator, the transplant social worker, or the transplant program\u2019s administrative office.' + (c.phone ? ' <span class="rc-src">Main hospital line, federal hospital records (CMS), ' + esc((window.CIF_REACH_META || {}).updated || '') + '. Confirm when you call.</span>' : '') + '</div>';
    if (d) {
      h += '<div class="rc-direct"><b>Published by the program on its own website</b> (read ' + esc(d.retrieved) + '):';
      (d.people || []).forEach(function (x) { h += '<div>' + esc(x.name) + ', ' + esc(x.credentials) + ' &middot; ' + esc(x.role) + '</div>'; });
      (d.phones || []).filter(function (x) { return !x.organ || x.organ === 'kidney' || x.organ === 'both' || x.organ === 'unknown'; }).forEach(function (x) { h += '<div><a href="' + tel(x.number) + '">' + esc(x.number) + '</a></div>'; });
      (d.emails || []).forEach(function (x) { h += '<div><a href="mailto:' + esc(x.email) + '?subject=' + encodeURIComponent('Living kidney donor inquiry') + '&body=' + encodeURIComponent(message('', '')) + '">' + esc(x.email) + '</a></div>'; });
      var u = (d.pages || [])[0]; if (u && /^https?:\/\//.test(u)) h += '<div><a href="' + esc(u) + '" target="_blank" rel="noopener">Open the program\u2019s page</a></div>';
      h += '</div>';
    }
    return h + '</article>';
  }
  var CSS = '<style>.reach{--b2:rgba(100,140,200,.22)}.rc{border:1px solid var(--b2);background:var(--surf,#0a1628);border-radius:10px;padding:16px;margin-top:12px}.rc h3{margin:0;font:600 21px Fraunces,Georgia,serif;color:#f3ede4}.rc-sub{font-size:15px;color:var(--ink60,#9aa7b8);margin-top:2px}.rc-top{display:flex;gap:14px;justify-content:space-between;flex-wrap:wrap}.rc-act{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start}.rc-btn{display:inline-block;border:1px solid var(--b2);color:#f3ede4;text-decoration:none;padding:11px 16px;border-radius:6px;font:500 13px "IBM Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;background:rgba(255,255,255,.03)}.rc-btn.gold{background:#c8902a;color:#0a1628;border-color:#c8902a;font-weight:700}.rc-btn:hover{filter:brightness(1.12)}.rc-ask{margin-top:10px;font-size:16px;color:var(--ink80,#cfd6e0)}.rc-src{font:11px "IBM Plex Mono",monospace;color:var(--ink60,#9aa7b8)}.rc-direct{margin-top:10px;border-left:3px solid #50c878;background:rgba(80,200,120,.07);padding:8px 12px;font-size:15.5px}.rtools{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:14px 0}.rtools select,.rtools input{background:#07101c;color:inherit;border:1px solid var(--b2);border-radius:6px;padding:10px 12px;font:inherit;font-size:16px}.rtools label{font-size:15px}.snap{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin:14px 0}.snap div{border:1px solid var(--b2);border-radius:10px;padding:12px 14px;background:rgba(255,255,255,.03)}.snap b{display:block;font:600 34px Fraunces,Georgia,serif;color:#e8b84a;line-height:1.1}.snap span{font-size:14.5px;color:var(--ink60,#9aa7b8)}.msg{border:1px solid var(--b2);border-radius:10px;padding:14px;margin:14px 0;background:rgba(255,255,255,.03)}.msg textarea{width:100%;background:#07101c;color:inherit;border:1px solid var(--b2);border-radius:6px;padding:10px;font:inherit;font-size:16px;min-height:130px}.rnote{font-size:14.5px;color:var(--ink60,#9aa7b8);margin-top:10px}</style>';

  window.CIFReach = {
    mount: function (el, opts) {
      opts = opts || {}; var full = opts.mode === 'full';
      el.classList.add('reach');
      el.innerHTML = CSS + '<div class="rtools"><label>Your state <select class="r-state" aria-label="Your state"><option value="">Choose your state</option></select></label>' + '<button type="button" class="rc-btn r-near">Sort by distance from me</button>' + (full ? '<label>Search <input class="r-q" type="search" placeholder="Hospital or city" aria-label="Search centers"></label>' : '') + '</div><div class="r-body"><p>Loading the directory&hellip;</p></div>';
      var sel = el.querySelector('.r-state'), body = el.querySelector('.r-body'), me = null, st = opts.state || savedState() || (location.hash.match(/#state=([A-Z]{2})/) || [])[1] || '';
      function paint() {
        var q = full ? (el.querySelector('.r-q').value || '').toLowerCase() : '';
        if (!st) { body.innerHTML = '<p>Choose your state to see the kidney transplant centers you can call right now.</p>'; return; }
        var list = centersFor(st, me).filter(function (c) { return !q || (c.name + ' ' + c.city).toLowerCase().indexOf(q) > -1; }), inState = (DATA[st] || []).length, withPhone = (DATA[st] || []).filter(function (c) { return c.phone; }).length;
        var opo = OPOS.filter(function (o) { return (o.serves || []).indexOf(st) > -1 || o.state === st; });
        var h = '';
        if (full) {
          h += '<div class="snap"><div><b>' + inState + '</b><span>kidney transplant center' + (inState === 1 ? '' : 's') + ' in ' + esc(stateName(st)) + '</span></div><div><b>' + withPhone + '</b><span>with a hospital main line on federal record</span></div>' +
            (opo.length ? '<div><b>' + (opo[0].tier != null ? 'Tier ' + opo[0].tier : '\u2013') + '</b><span>CMS performance tier of ' + esc(opo[0].name) + ', the organ procurement organization serving the state (deceased donation)</span></div>' : '') + '</div>';
          h += '<div class="msg"><b>Your message, ready to send or say</b><p class="rnote">Say it on the phone, leave it as a voicemail, or paste it into the hospital\u2019s online living donor form.</p><label>Your name (optional) <input class="r-name" placeholder="Your name" style="background:#07101c;color:inherit;border:1px solid var(--b2);border-radius:6px;padding:8px"></label> <label><input type="checkbox" class="r-nd"> I am not donating to a specific person</label><textarea class="r-msg" aria-label="Your message"></textarea><button type="button" class="rc-btn r-copy">Copy my message</button></div>';
        }
        if (!inState) h += '<p class="rnote" style="font-size:16px"><b>' + esc(stateName(st)) + ' has no kidney transplant center on HRSA\u2019s list.</b> The nearest centers in other states are below, measured from the middle of the state. Ask each one whether it serves donors who live in ' + esc(stateName(st)) + '.</p>';
        else if (inState < 4) h += '<p class="rnote" style="font-size:16px">' + esc(stateName(st)) + ' has ' + inState + ' kidney transplant center' + (inState === 1 ? '' : 's') + '. Nearby centers in other states are added below.</p>';
        h += list.slice(0, opts.limit || (full ? 60 : 5)).map(function (c) { return card(c, { state: st }); }).join('') || '<p>No centers match.</p>';
        if (!full && list.length > (opts.limit || 5)) h += '<p style="margin-top:12px"><a class="rc-btn" href="kidney-transplant-centers.html#state=' + st + '">See all ' + list.length + ' centers in or near ' + esc(stateName(st)) + '</a></p>';
        h += '<p class="rnote">Centers and addresses: HRSA\u2019s organ transplantation center file. Main phone numbers: CMS hospital records' + ((window.CIF_REACH_META || {}).updated ? ', ' + esc(window.CIF_REACH_META.updated) : '') + '. Hospitals rename and merge, and a program can close, so always confirm when you call. We do not guess numbers: where none is matched you get a search link. The assessment and this list are education, not medical advice.</p>';
        body.innerHTML = h;
        if (full) {
          var nm = body.querySelector('.r-name'), nd = body.querySelector('.r-nd'), ta = body.querySelector('.r-msg'), fill = function () { ta.value = message(nm.value.trim(), nd.checked ? '' : 'someone I know'); }; nm.oninput = fill; nd.onchange = fill; fill();
          body.querySelector('.r-copy').onclick = function () { var b = this; (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(function () { b.textContent = 'Copied'; }, function () { ta.select(); }); };
        }
      }
      load().then(function () {
        sel.innerHTML += Object.keys(NAMES).sort(function (a, b) { return NAMES[a].localeCompare(NAMES[b]); }).map(function (s) { return '<option value="' + s + '"' + (s === st ? ' selected' : '') + '>' + esc(NAMES[s]) + '</option>'; }).join('');
        sel.onchange = function () { st = sel.value; if (full) history.replaceState(null, '', st ? '#state=' + st : location.pathname); paint(); };
        el.querySelector('.r-near').onclick = function () { var b = this; if (!navigator.geolocation) { b.textContent = 'Location not available'; return; } b.textContent = 'Finding you\u2026'; navigator.geolocation.getCurrentPosition(function (p) { me = [p.coords.latitude, p.coords.longitude]; b.textContent = 'Sorted by distance'; if (!st) { var best = null, bd = 9e9; Object.keys(CENT).forEach(function (s) { var d = km(me, CENT[s]); if (d < bd) { bd = d; best = s; } }); st = best; sel.value = st; } paint(); }, function () { b.textContent = 'Location blocked: choose your state'; }, { timeout: 8000 }); };
        if (full) el.querySelector('.r-q').oninput = paint;
        if (opts.onState) sel.addEventListener('change', function () { opts.onState(sel.value); });
        paint();
      });
    },
    load: load, contactFor: function (n) { return PC[slug(n)] || null; }, centersFor: function (st, me) { return centersFor(st, me); }, data: function () { return DATA; }, names: function () { return NAMES; }, centroids: CENT
  };
})();
