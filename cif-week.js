/* Cold Ischemia Foundation · This Week engine
 * One release calendar for the whole site: The Inside Files (Sundays), The Watch List (Mondays, 9 AM ET)
 * and The Gatekeeper Files (Thursdays, 9 AM ET), plus BHOC Field Notes and the Research Digest when they publish.
 *
 * Loaded on every page through the main navigation. It:
 *   1. adds a live badge to the "This Week" link in the menu (a pulsing "New" after a release, otherwise a countdown);
 *   2. renders a compact week strip into any element with the attribute data-cif-week;
 *   3. exposes window.CIFWeek for the full calendar on this-week.html.
 * Data comes from feed.json (rebuilt hourly by .github/workflows/build-site-feed.yml). If it cannot load,
 * the fixed weekly schedule still drives the calendar, so nothing ever shows blank.
 */
(function () {
  'use strict';
  if (window.CIFWeek) return;
  var TZ = 'America/New_York';
  var SERIES = {
    inside: { name: 'The Inside Files', short: 'Inside Files', url: 'inside-files.html', color: '#4fb3a6', day: 0, hour: 7, verb: 'installment' },
    watch:  { name: 'The Watch List', short: 'Watch List', url: 'watch-list.html', color: '#e0574f', day: 1, hour: 9, verb: 'edition', first: [2026, 11, 9] },
    gate:   { name: 'The Gatekeeper Files', short: 'Gatekeeper Files', url: 'gatekeeper-files.html', color: '#C9A84C', day: 4, hour: 9, verb: 'file', first: [2026, 11, 5], total: 52 },
    notes:  { name: 'BHOC Field Notes', short: 'Field Notes', url: 'field-notes.html', color: '#d98a2b' },
    digest: { name: 'Research Digest', short: 'Research Digest', url: 'research-digest.html', color: '#8fa8d8' }
  };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ---- New York wall-clock helpers ---- */
  var fmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  function parts(d) { var o = {}; fmt.formatToParts(d).forEach(function (p) { o[p.type] = +p.value; }); o.dow = new Date(Date.UTC(o.year, o.month - 1, o.day)).getUTCDay(); return o; }
  function et(y, mo, d, h, mi) {
    var want = Date.UTC(y, mo - 1, d, h || 0, mi || 0), t = want + 5 * 3600e3;
    for (var i = 0; i < 3; i++) { var p = parts(new Date(t)); t += want - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute); }
    return new Date(t);
  }
  function dayKey(d) { var p = parts(d); return p.year * 10000 + p.month * 100 + p.day; }
  function weekStart(d) { var p = parts(d); return { y: p.year, m: p.month, d: p.day - p.dow }; }
  function dayOf(ws, k) { var u = new Date(Date.UTC(ws.y, ws.m - 1, ws.d + k)); return { y: u.getUTCFullYear(), m: u.getUTCMonth() + 1, d: u.getUTCDate() }; }
  function shiftWeek(ws, n) { return dayOf(ws, 7 * n); }
  function nameTime(d) { var p = parts(d), h = p.hour % 12 || 12; return DAYS[p.dow].slice(0, 3) + ' ' + MON[p.month - 1] + ' ' + p.day + ', ' + h + (p.minute ? ':' + String(p.minute).padStart(2, '0') : '') + ' ' + (p.hour < 12 ? 'AM' : 'PM') + ' ET'; }
  function countdown(ms) {
    var s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400); s %= 86400;
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60, z = function (n) { return String(n).padStart(2, '0'); };
    return { d: d, h: h, m: m, s: x, text: (d ? d + 'd ' : '') + z(h) + ':' + z(m) + ':' + z(x), short: d ? d + 'd' : h ? h + 'h' : m ? m + 'm' : 'now' };
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---- data model ---- */
  var model = null, loading = null;
  function load() {
    if (loading) return loading;
    loading = fetch('feed.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () { return { items: [], series: {} }; })
      .then(function (j) {
        model = {
          items: (j.items || []).map(function (it) { it.d = new Date(it.date); return it; }),
          status: j.series || {}, feed: j.feed_url || 'https://coldischemia.foundation/feed.xml', ics: j.calendar_url || 'https://coldischemia.foundation/cif-week.ics'
        };
        return model;
      });
    return loading;
  }

  /* Every release that belongs to the week starting on Sunday ws ({y,m,d}), with its state right now. */
  function week(ws, now) {
    now = now || new Date();
    var out = [], used = {};
    function find(series, key) { for (var i = 0; i < model.items.length; i++) { var it = model.items[i]; if (it.series === series && dayKey(it.d) === key) { used[it.id] = 1; return it; } } return null; }
    // The Watch List: Monday 9 AM ET
    var S = SERIES.watch, md = dayOf(ws, 1), mDate = et(md.y, md.m, md.d, 9);
    if (mDate >= et(S.first[0], S.first[1], S.first[2], 9)) {
      var wi = find('watch', dayKey(mDate)), wst = model.status.watch || {};
      var wn = Math.round((mDate - et(2026, 11, 9, 9)) / 6048e5) + 1;
      out.push({ series: 'watch', date: mDate, state: mDate <= now ? 'out' : 'sealed', title: wi ? wi.title : 'Edition No. ' + wn, summary: wi ? wi.summary : 'Fifty companies, scored on the public record. Make your call on who leads before the ledger opens.', url: wi ? wi.url : S.url });
    }
    // The Gatekeeper Files: Thursday 9 AM ET, weeks 1-52
    S = SERIES.gate; var td = dayOf(ws, 4), tDate = et(td.y, td.m, td.d, 9), n = Math.round((tDate - et(2026, 11, 5, 9)) / 6048e5) + 1;
    if (n >= 1 && n <= S.total) {
      var gi = find('gate', dayKey(tDate));
      out.push({ series: 'gate', date: tDate, state: tDate <= now ? 'out' : 'sealed', title: gi ? gi.title : 'Week ' + n + ' of 52', summary: gi ? gi.summary : 'A kidney care problem, the hidden rule behind it, and the fix. Sealed until Thursday.', url: gi ? gi.url : S.url + '#week-' + n });
    }
    // The Inside Files: published installments in this week, a scheduled one, or one still in verification
    var first = dayOf(ws, 0), endK = dayKey(et(dayOf(ws, 6).y, dayOf(ws, 6).m, dayOf(ws, 6).d, 12)), startK = dayKey(et(first.y, first.m, first.d, 12));
    model.items.forEach(function (it) {
      var k = dayKey(it.d);
      if (used[it.id] || k < startK || k > endK) return;
      used[it.id] = 1;
      out.push({ series: it.series, date: it.d, state: 'out', title: it.title, summary: it.summary, url: it.url });
    });
    var ins = model.status.inside;
    if (ins && ins.next) {
      if (ins.next.date) {
        var nd = new Date(ins.next.date), nk = dayKey(nd);
        if (nk >= startK && nk <= endK && !out.some(function (r) { return r.series === 'inside' && dayKey(r.date) === nk; }))
          out.push({ series: 'inside', date: nd, state: nd <= now ? 'out' : 'sealed', title: ins.next.label, summary: ins.next.teaser || '', url: SERIES.inside.url });
      } else if (ins.state === 'in-verification' && dayKey(now) >= startK && dayKey(now) <= endK && !out.some(function (r) { return r.series === 'inside'; })) {
        out.push({ series: 'inside', date: et(first.y, first.m, first.d, 7), state: 'verify', title: ins.next.label, summary: ins.next.teaser || '', url: SERIES.inside.url });
      }
    }
    out.sort(function (a, b) { return a.date - b.date; });
    return out;
  }

  function next(now) {
    now = now || new Date();
    var c = [], ws = weekStart(now);
    [0, 1].forEach(function (k) { week(shiftWeek(ws, k), now).forEach(function (r) { if (r.state === 'sealed' && r.date > now) c.push(r); }); });
    c.sort(function (a, b) { return a.date - b.date; });
    return c[0] || null;
  }
  function recent(now, hours) {
    now = now || new Date();
    var lim = now - (hours || 48) * 3600e3;
    return model.items.filter(function (it) { return it.d <= now && it.d >= lim && (it.series === 'watch' || it.series === 'gate' || it.series === 'inside'); })
      .concat(week(weekStart(now), now).filter(function (r) { return r.state === 'out' && r.date >= lim && r.date <= now && !model.items.some(function (i) { return i.url === r.url; }); }))
      .sort(function (a, b) { return (b.d || b.date) - (a.d || a.date); });
  }

  /* ---- styles for the badge and the compact strip (self-contained so any page can host it) ---- */
  var css = '' +
    '@font-face{font-family:"CWPF";src:url(fonts/playfairdisplay-900-normal.woff2) format("woff2");font-weight:900;font-display:swap}' +
    '@font-face{font-family:"CWPlex";src:url(fonts/ibmplexmono-500-normal.woff2) format("woff2");font-display:swap}' +
    'nav.cifnav .cn-r a.cn-wk{position:relative;display:inline-flex;align-items:center;gap:8px;color:#e9e3d6;border-color:rgba(201,168,76,.55)}' +
    'nav.cifnav .cn-r a.cn-wk:hover{color:#C9A84C}' +
    '.cn-wkb{display:inline-flex;align-items:center;gap:5px;font-size:9px;letter-spacing:1.5px;color:#C9A84C}' +
    '.cn-wkb i{width:6px;height:6px;border-radius:50%;background:#C9A84C}' +
    '.cn-wkb.new{color:#ff7a70}.cn-wkb.new i{background:#ff5a4f;box-shadow:0 0 0 0 rgba(255,90,79,.7);animation:cwp 1.8s infinite}' +
    '@keyframes cwp{0%{box-shadow:0 0 0 0 rgba(255,90,79,.7)}70%{box-shadow:0 0 0 7px rgba(255,90,79,0)}100%{box-shadow:0 0 0 0 rgba(255,90,79,0)}}' +
    '.cw{--ink:#070a10;--line:rgba(201,168,76,.28);--txt:#e9e3d6;--mut:#8f98a8;box-sizing:border-box;background:linear-gradient(180deg,#0b111b,#070a10);border:1px solid var(--line);color:var(--txt);font-family:"CWPlex",ui-monospace,Menlo,monospace;padding:16px 18px 14px;margin:24px auto;max-width:1120px;position:relative;overflow:hidden;text-align:left}' +
    '.cw *{box-sizing:border-box}' +
    '.cw a{color:inherit;text-decoration:none}' +
    '.cw-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px 18px;flex-wrap:wrap;margin-bottom:12px}' +
    '.cw-k{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#C9A84C}' +
    '.cw-nx{font-size:11px;letter-spacing:.06em;color:var(--mut)}.cw-nx b{color:var(--txt);font-weight:500}.cw-nx .cw-cd{color:#fff;font-variant-numeric:tabular-nums}' +
    '.cw-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;position:relative}' +
    '.cw-d{position:relative;border:1px solid rgba(143,152,168,.18);padding:8px 8px 9px;min-height:74px;display:flex;flex-direction:column;gap:4px;transition:border-color .15s,background .15s}' +
    'a.cw-d:hover{border-color:var(--c,#C9A84C);background:rgba(255,255,255,.03)}' +
    '.cw-d.today{border-color:#C9A84C;background:rgba(201,168,76,.07)}' +
    '.cw-dn{font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--mut)}' +
    '.cw-d.today .cw-dn{color:#C9A84C}' +
    '.cw-dd{font-family:"CWPF",Georgia,serif;font-weight:900;font-size:22px;line-height:1}' +
    '.cw-d.past .cw-dd{color:#7d8696}' +
    '.cw-ev{display:flex;align-items:center;gap:6px;font-size:9.5px;letter-spacing:.05em;line-height:1.25;color:var(--txt)}' +
    '.cw-ev i{flex:0 0 auto;width:8px;height:8px;border-radius:50%;border:1.5px solid var(--c);background:transparent}' +
    '.cw-ev.out i{background:var(--c)}.cw-ev.verify i{border-style:dashed}' +
    '.cw-ev.soon i{animation:cwb 1.2s ease-in-out infinite}' +
    '@keyframes cwb{50%{background:var(--c)}}' +
    '.cw-ev span{overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
    '.cw-bar{position:relative;height:2px;background:rgba(143,152,168,.18);margin-top:10px}' +
    '.cw-bar b{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,rgba(201,168,76,.15),#C9A84C)}' +
    '.cw-bar em{position:absolute;top:-4px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:#C9A84C;box-shadow:0 0 0 3px rgba(201,168,76,.25)}' +
    '.cw-foot{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase}' +
    '.cw-foot a{color:#C9A84C;border-bottom:1px solid rgba(201,168,76,.4)}.cw-foot span{color:var(--mut)}' +
    '@media (max-width:640px){.cw{padding:14px 12px 12px}.cw-days{grid-template-columns:repeat(7,minmax(0,1fr));gap:3px}.cw-d{padding:6px 4px;min-height:62px;align-items:center;text-align:center}.cw-dd{font-size:17px}.cw-ev span{display:none}.cw-ev{justify-content:center}}' +
    '@media (prefers-reduced-motion:reduce){.cw *,.cn-wkb i{animation:none!important}}';
  var st = document.createElement('style'); st.id = 'cif-week-css'; st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---- compact strip ---- */
  function strip(el) {
    var now = new Date(), ws = weekStart(now), rel = week(ws, now), nx = next(now), todayK = dayKey(now);
    var nowP = parts(now), frac = (nowP.dow + (nowP.hour + nowP.minute / 60) / 24) / 7;
    var h = '<div class="cw-top"><a class="cw-k" href="this-week.html">This week at the foundation</a>' +
      '<span class="cw-nx">' + (nx ? 'Next: <b>' + esc(SERIES[nx.series].name) + '</b> · ' + esc(nameTime(nx.date)) + ' · <span class="cw-cd" data-t="' + nx.date.getTime() + '">' + countdown(nx.date - now).text + '</span>' : 'Every release this week is out') + '</span></div><div class="cw-days">';
    for (var k = 0; k < 7; k++) {
      var dd = dayOf(ws, k), key = dd.y * 10000 + dd.m * 100 + dd.d, evs = rel.filter(function (r) { return dayKey(r.date) === key; });
      var cls = 'cw-d' + (key === todayK ? ' today' : key < todayK ? ' past' : ''), first = evs[0];
      var tag = first ? 'a' : 'div', href = first ? ' href="' + (first.state === 'out' ? esc(first.url) : 'this-week.html') + '"' : '';
      h += '<' + tag + ' class="' + cls + '"' + href + (first ? ' style="--c:' + SERIES[first.series].color + '"' : '') + '><span class="cw-dn">' + DAYS[k].slice(0, 3) + (key === todayK ? ' · Today' : '') + '</span><span class="cw-dd">' + dd.d + '</span>';
      evs.slice(0, 2).forEach(function (r) {
        var soon = r.state === 'sealed' && r.date - now < 864e5;
        h += '<span class="cw-ev ' + r.state + (soon ? ' soon' : '') + '" style="--c:' + SERIES[r.series].color + '" title="' + esc(SERIES[r.series].name + ': ' + r.title) + '"><i></i><span>' + esc(SERIES[r.series].short) + '</span></span>';
      });
      if (evs.length > 2) h += '<span class="cw-ev"><span>+' + (evs.length - 2) + ' more</span></span>';
      h += '</' + tag + '>';
    }
    h += '</div><div class="cw-bar" aria-hidden="true"><b style="width:' + (frac * 100).toFixed(2) + '%"></b><em style="left:' + (frac * 100).toFixed(2) + '%"></em></div>' +
      '<div class="cw-foot"><span>Sundays · Inside Files &nbsp; Mondays · Watch List &nbsp; Thursdays · Gatekeeper Files</span><a href="this-week.html">Open the full calendar and get alerts</a></div>';
    el.className = (el.className ? el.className + ' ' : '') + 'cw';
    el.innerHTML = h;
    el.setAttribute('aria-label', 'This week at the Cold Ischemia Foundation');
  }

  /* ---- menu badge ---- */
  function badge() {
    var a = document.querySelector('nav.cifnav a.cn-wk');
    if (!a) return;
    var b = a.querySelector('.cn-wkb');
    if (!b) { b = document.createElement('span'); b.className = 'cn-wkb'; a.appendChild(b); }
    var now = new Date(), r = recent(now, 48), nx = next(now);
    badge.t = nx ? nx.date.getTime() : 0;
    if (r.length) { b.className = 'cn-wkb new'; b.innerHTML = '<i></i>New'; a.title = 'Just released: ' + (SERIES[r[0].series] || {}).name; }
    else if (nx) { b.className = 'cn-wkb'; b.innerHTML = '<i></i>' + countdown(nx.date - now).short; a.title = 'Next release: ' + SERIES[nx.series].name + ', ' + nameTime(nx.date); }
    else { b.innerHTML = ''; }
  }

  function tick() {
    var now = Date.now();
    if (badge.t && now >= badge.t) { badge(); }
    else if (badge.t && badge.t - now < 3600e3 && now - (badge.last || 0) > 15e3) { badge.last = now; badge(); }
    [].forEach.call(document.querySelectorAll('.cw-cd[data-t]'), function (e) {
      var t = +e.getAttribute('data-t');
      if (t - now <= 0) { refresh(); return; }
      e.textContent = countdown(t - now).text;
    });
  }
  function refresh() { [].forEach.call(document.querySelectorAll('[data-cif-week]'), strip); badge(); }

  window.CIFWeek = { SERIES: SERIES, DAYS: DAYS, MON: MON, load: load, week: week, next: next, recent: recent, weekStart: weekStart, shiftWeek: shiftWeek, dayOf: dayOf, dayKey: dayKey, et: et, parts: parts, countdown: countdown, nameTime: nameTime, esc: esc, model: function () { return model; } };

  function start() { load().then(function () { refresh(); setInterval(tick, 1000); setInterval(badge, 60000); document.dispatchEvent(new CustomEvent('cifweek:ready')); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
