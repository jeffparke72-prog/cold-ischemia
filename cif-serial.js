/* The Inside Files: renders serial/installments.json into a navigable, dynamic reading room.
   Everything is drawn here (SVG charts, timeline, waffle, counters) with no outside libraries. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var DAY = 864e5, D = function (s) { var p = String(s).split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2] || 1); };
  var fmt = function (s) { return new Date(D(s)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); };
  var today = new Date(), TODAY = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  var data, cur = 1, tab = 'read', pop;
  var TABS = [['read', 'Read'], ['evidence', 'Evidence'], ['charts', 'Charts'], ['plates', 'Plates'], ['sources', 'Sources'], ['terms', 'Terms']];

  fetch('serial/installments.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(init).catch(function () {
    $('#main').innerHTML = '<p>The file could not be loaded. Please refresh.</p>';
  });

  function words(i) { return i.sections.map(function (s) { return s.html.replace(/<[^>]+>|\{S\d+\}/g, ' '); }).join(' ').split(/\s+/).filter(Boolean).length; }
  function slotDate(n) { return new Date(D(data.series.first_date) + 7 * (n - 1) * DAY).toISOString().slice(0, 10); }
  function live() { return data.installments.filter(function (i) { return D(i.publish) <= TODAY; }); }

  function init(j) {
    data = j; $('#today').textContent = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    var h = location.hash.match(/^#i(\d+)(?:\/(\w+))?/); if (h) { cur = +h[1]; if (h[2]) tab = h[2]; }
    if (!live().some(function (i) { return i.n === cur; })) cur = live().length ? live()[live().length - 1].n : 1;
    $('#ruleList').innerHTML = data.series.rules.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('');
    $('#shr').onclick = function (e) { e.preventDefault(); var u = location.origin + location.pathname, t = 'The Inside Files: a serial investigation of kidney transplant and dialysis, built from the public record.'; if (navigator.share) navigator.share({ title: 'The Inside Files', text: t, url: u }).catch(function () {}); else location.href = 'mailto:?subject=' + encodeURIComponent('The Inside Files') + '&body=' + encodeURIComponent(t + '\n\n' + u); };
    $('#prt').onclick = function (e) { e.preventDefault(); window.print(); };
    document.addEventListener('keydown', keys); document.addEventListener('click', function (e) { if (!e.target.closest('.pop') && !e.target.classList.contains('cite')) closePop(); });
    window.addEventListener('hashchange', function () { var m = location.hash.match(/^#i(\d+)(?:\/(\w+))?/); if (m && (+m[1] !== cur || (m[2] && m[2] !== tab))) { cur = +m[1]; tab = m[2] || 'read'; draw(); } });
    draw();
  }

  function draw() {
    var live_ = live(), inst = data.installments.filter(function (i) { return i.n === cur; })[0]; if (!inst) return;
    var total = live_.reduce(function (a, i) { return a + words(i); }, 0), T = data.series.target_words;
    $('#progtxt').textContent = live_.length + ' of ' + data.series.planned + ' installments · ' + total.toLocaleString() + ' of ' + T.toLocaleString() + ' words';
    $('#progbar i').style.width = Math.min(100, total / T * 100) + '%'; $('#progbar').setAttribute('aria-valuenow', Math.round(total / T * 100));
    var rail = '';
    for (var n = 1; n <= data.series.planned; n++) {
      var it = data.installments.filter(function (i) { return i.n === n; })[0];
      if (it && D(it.publish) <= TODAY) rail += '<li><a href="#i' + n + '/read" ' + (n === cur ? 'aria-current="true"' : '') + '>' + n + '. ' + esc(it.title) + '</a></li>';
      else rail += '<li><span class="lk"><b>Arrives ' + fmt(slotDate(n)) + '</b>' + (n === 2 && inst.next ? esc(inst.next.teaser.split('?')[0] + '?') : 'Installment ' + n) + '</span></li>';
    }
    $('#rail').innerHTML = rail;
    document.title = inst.title + ' | The Inside Files | Cold Ischemia Foundation';
    $('#kick').textContent = 'Installment ' + inst.n + ' of ' + data.series.planned + ' · published ' + fmt(inst.publish);
    $('#title').textContent = inst.title; $('#dek').textContent = inst.dek;
    var age = Math.round((TODAY - D(inst.hook_date)) / DAY), ok = age <= inst.window_days;
    $('#badges').innerHTML = '<span class="badge ' + (ok ? 'ok' : 'warn') + '" title="Days since the event that prompted this installment">Hook event ' + age + ' days old · ' + (ok ? 'inside the ' + inst.window_days + '-day window' : 'now background') + '</span><span class="badge">' + words(inst).toLocaleString() + ' words · ' + Math.max(1, Math.round(words(inst) / 230)) + ' min</span><span class="badge">' + inst.evidence.length + ' graded claims</span>' + (inst.status === 'draft-for-approval' ? '<span class="badge draft">Draft for editor approval</span>' : '');
    $('#tabs').innerHTML = TABS.map(function (t) { return '<button role="tab" id="t-' + t[0] + '" aria-selected="' + (t[0] === tab) + '" aria-controls="p-' + t[0] + '" data-t="' + t[0] + '">' + t[1] + (t[0] === 'evidence' ? ' (' + inst.evidence.length + ')' : '') + '</button>'; }).join('');
    $$('#tabs button').forEach(function (b) { b.onclick = function () { tab = b.dataset.t; history.replaceState(null, '', '#i' + cur + '/' + tab); show(); }; });
    $('#panels').innerHTML = TABS.map(function (t) { return '<div class="panel" role="tabpanel" id="p-' + t[0] + '" aria-labelledby="t-' + t[0] + '" hidden></div>'; }).join('');
    buildRead(inst); buildEvidence(inst); buildCharts(inst); buildPlates(inst); buildSources(inst); buildTerms(inst); show();
  }
  function show() { $$('#tabs button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.t === tab); }); $$('.panel').forEach(function (p) { p.hidden = p.id !== 'p-' + tab; }); if (tab === 'read') spy(); }

  /* ---------- citations ---------- */
  function cite(html) {
    var order = [], n = 0;
    return html.replace(/\{(S\d+)\}/g, function (_, id) { if (order.indexOf(id) < 0) order.push(id); return '<button class="cite" data-s="' + id + '" aria-label="Source ' + id + '">[' + id.slice(1) + ']</button>'; });
  }
  function openPop(btn) {
    closePop(); var s = data.sources[btn.dataset.s]; if (!s) return;
    pop = document.createElement('div'); pop.className = 'pop'; pop.setAttribute('role', 'dialog');
    pop.innerHTML = '<span class="mono">' + esc(s.type) + ' · ' + esc(btn.dataset.s) + '</span><b>' + esc(s.title) + '</b>' + esc(s.publisher) + ', ' + esc(s.date) + '<br><a href="' + esc(s.url) + '" target="_blank" rel="noopener">Open the source</a>';
    document.body.appendChild(pop); var r = btn.getBoundingClientRect(), x = Math.min(window.innerWidth - 360, Math.max(8, r.left + scrollX - 20)); pop.style.left = x + 'px'; pop.style.top = (r.bottom + scrollY + 6) + 'px';
  }
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  document.addEventListener('click', function (e) { if (e.target.classList && e.target.classList.contains('cite')) { e.stopPropagation(); openPop(e.target); } });

  /* ---------- read ---------- */
  function buildRead(inst) {
    var figs = inst.figures || [], h = (inst.editor_note ? '<div class="note"><b>READ THIS FIRST.</b> ' + esc(inst.editor_note) + '</div>' : '') + '<div class="read"><article>';
    inst.sections.forEach(function (s) {
      h += '<section id="s-' + s.id + '"><h3>' + esc(s.heading) + '</h3>' + cite(s.html) + '</section>';
      figs.filter(function (f) { return f.where === s.id; }).forEach(function (f) { h += '<figure><img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy"><figcaption>' + esc(f.caption) + '</figcaption></figure>'; });
    });
    if (inst.next) h += '<p class="mono" style="margin-top:30px">Next · ' + fmt(inst.next.date) + '</p><p><i>' + esc(inst.next.teaser) + '</i></p>';
    h += '</article><nav class="toc" aria-label="In this installment">' + inst.sections.map(function (s) { return '<a href="#s-' + s.id + '" data-s="' + s.id + '">' + esc(s.heading) + '</a>'; }).join('') + '</nav></div>';
    $('#p-read').innerHTML = h;
    $$('#p-read figure img').forEach(function (im) { im.onclick = function () { lightbox(im.src, im.alt); }; });
  }
  function spy() {
    var ids = $$('#p-read section[id]'); if (!ids.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { $$('.toc a').forEach(function (a) { a.classList.toggle('on', a.dataset.s === e.target.id.slice(2)); }); } }); }, { rootMargin: '-20% 0px -70% 0px' });
    ids.forEach(function (s) { io.observe(s); });
  }
  function lightbox(src, alt) { var d = document.createElement('div'); d.className = 'lb'; d.innerHTML = '<img src="' + esc(src) + '" alt="' + esc(alt) + '">'; d.onclick = function () { d.remove(); }; document.body.appendChild(d); }
  function keys(e) {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === 'Escape') { closePop(); var lb = $('.lb'); if (lb) lb.remove(); }
    var order = TABS.map(function (t) { return t[0]; }), i = order.indexOf(tab);
    if (e.key === 'ArrowRight' && e.altKey) { tab = order[Math.min(order.length - 1, i + 1)]; history.replaceState(null, '', '#i' + cur + '/' + tab); show(); }
    if (e.key === 'ArrowLeft' && e.altKey) { tab = order[Math.max(0, i - 1)]; history.replaceState(null, '', '#i' + cur + '/' + tab); show(); }
    if ((e.key === 'j' || e.key === 'k') && tab === 'read') { var ss = $$('#p-read section[id]'), y = scrollY + 80, k = 0; ss.forEach(function (s, ix) { if (s.getBoundingClientRect().top + scrollY <= y) k = ix; }); var t = ss[Math.max(0, Math.min(ss.length - 1, k + (e.key === 'j' ? 1 : -1)))]; if (t) t.scrollIntoView(); }
  }

  /* ---------- evidence ---------- */
  function buildEvidence(inst) {
    var g = data.grades, h = '<div class="filters"><span class="mono">Grade</span>' + ['All'].concat(Object.keys(g)).map(function (k) { return '<button class="chip" data-g="' + k + '" aria-pressed="' + (k === 'All') + '" title="' + esc(g[k] || 'All claims') + '">' + k + '</button>'; }).join('') + '<input type="search" id="evq" placeholder="Search the claims" aria-label="Search claims"></div><div id="evl"></div><p class="note" style="margin-top:20px">' + Object.keys(g).map(function (k) { return '<b>' + k + '</b> ' + esc(g[k]); }).join(' &nbsp;·&nbsp; ') + '</p>';
    $('#p-evidence').innerHTML = h; var gsel = 'All';
    function paint() {
      var q = $('#evq').value.toLowerCase();
      $('#evl').innerHTML = inst.evidence.filter(function (e) { return (gsel === 'All' || e.grade === gsel) && (!q || (e.claim + ' ' + e.status).toLowerCase().indexOf(q) > -1); }).map(function (e) {
        return '<div class="ev"><div class="seal g-' + e.grade + '" title="' + esc(g[e.grade]) + '">' + e.grade + '</div><div><p><b>' + esc(e.id) + '.</b> ' + esc(e.claim) + '</p><p class="st">' + esc(e.status) + '</p><div class="srcs">' + e.sources.map(function (s) { return '<button class="cite" style="vertical-align:baseline;font-size:12px" data-s="' + s + '">[' + s.slice(1) + '] ' + esc(data.sources[s].publisher) + '</button>'; }).join('') + '</div></div></div>';
      }).join('') || '<p>No claims match.</p>';
    }
    $$('#p-evidence .chip').forEach(function (c) { c.onclick = function () { gsel = c.dataset.g; $$('#p-evidence .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c); }); paint(); }; });
    $('#evq').oninput = paint; paint();
  }

  /* ---------- charts ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function wrap(t, n) { var w = String(t).split(' '), L = [], c = ''; w.forEach(function (x) { if ((c + ' ' + x).trim().length > n) { L.push(c); c = x; } else c = (c + ' ' + x).trim(); }); if (c) L.push(c); return L; }
  function tspans(lines, x, y, lh) { return lines.map(function (l, i) { return '<tspan x="' + x + '" y="' + (y + i * lh) + '">' + esc(l) + '</tspan>'; }).join(''); }
  function csv(rows) { return rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n'); }
  function frame(c, svg, rows, aria) {
    var id = 'tb-' + c.id;
    return '<div class="chart" id="' + c.id + '"><h3>' + esc(c.title) + '</h3><p class="cn">' + esc(c.note) + '</p>' + svg.replace('<svg ', '<svg role="img" aria-label="' + esc(aria) + '" ') +
      '<div class="tools"><button type="button" data-csv="' + c.id + '">Copy data (CSV)</button><button type="button" data-svg="' + c.id + '">Download SVG</button></div><details><summary>View data as a table</summary><table><thead><tr>' + rows[0].map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.slice(1).map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></details></div>';
  }
  var CHARTS = {
    timeline: function (c) {
      var ev = c.events.slice().sort(function (a, b) { return D(a.date) - D(b.date); }), lanes = [], W = 980, padL = 120, padR = 60;
      ev.forEach(function (e) { if (lanes.indexOf(e.lane) < 0) lanes.push(e.lane); });
      var t0 = D(ev[0].date) - 30 * DAY, t1 = D(ev[ev.length - 1].date) + 30 * DAY, x = function (d) { return padL + (D(d) - t0) / (t1 - t0) * (W - padL - padR); }, laneH = 176, H = 40 + lanes.length * laneH + 36;
      var col = ['#8f2d22', '#35516b', '#3d6b3a', '#a8691a'], s = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="' + NS + '">';
      lanes.forEach(function (l, i) { var y = 40 + i * laneH + laneH / 2; s += '<rect x="' + padL + '" y="' + (y - laneH / 2 + 4) + '" width="' + (W - padL - padR) + '" height="' + (laneH - 8) + '" fill="' + (i % 2 ? 'rgba(90,70,40,.05)' : 'rgba(90,70,40,.1)') + '"/><text x="8" y="' + (y + 4) + '" font-size="15" font-style="italic">' + esc(l) + '</text><line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="#2b1f14" stroke-width="1.2"/>'; });
      for (var q = new Date(t0), k = 0; q < t1; q = new Date(Date.UTC(q.getUTCFullYear(), q.getUTCMonth() + 3, 1)), k++) { var xx = x(q.toISOString().slice(0, 10)); if (xx > padL) s += '<line x1="' + xx + '" x2="' + xx + '" y1="30" y2="' + (H - 30) + '" stroke="#b9a57f" stroke-dasharray="2 5"/><text x="' + xx + '" y="' + (H - 10) + '" font-size="12" text-anchor="middle" fill="#5a4631">' + q.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }) + '</text>'; }
      var seen = {};
      ev.forEach(function (e) {
        var li = lanes.indexOf(e.lane), y = 40 + li * laneH + laneH / 2, cx = x(e.date); seen[li] = (seen[li] || 0) + 1; var up = seen[li] % 2 === 1, anchor = cx > W - 170 ? 'end' : cx < padL + 90 ? 'start' : 'middle', lines = wrap(e.label, 24), y0 = up ? y - 24 - lines.length * 14 - 4 : y + 30;
        s += '<line x1="' + cx + '" x2="' + cx + '" y1="' + y + '" y2="' + (up ? y - 22 : y + 18) + '" stroke="#2b1f14" stroke-width="1"/><circle cx="' + cx + '" cy="' + y + '" r="8" fill="' + (e.approx ? '#f3ead4' : col[li % 4]) + '" stroke="' + col[li % 4] + '" stroke-width="3" ' + (e.approx ? 'stroke-dasharray="3 2"' : '') + '/>';
        s += '<text font-size="13.5" text-anchor="' + anchor + '"><tspan x="' + cx + '" y="' + y0 + '" font-weight="700" font-family="IBM Plex Mono,monospace" font-size="11">' + fmt(e.date).replace(/, /, ' ') + (e.approx ? ' (approx.)' : '') + '</tspan>' + lines.map(function (l) { return '<tspan x="' + cx + '" dy="14">' + esc(l) + '</tspan>'; }).join('') + '</text>';
      });
      return frame(c, s + '</svg>', [['Date', 'Lane', 'Event', 'Source', 'Date certainty']].concat(ev.map(function (e) { return [e.date, e.lane, e.label, e.s, e.approx ? 'approximate' : 'as reported']; })), 'Timeline of events: ' + ev.map(function (e) { return e.date + ' ' + e.label; }).join('; '));
    },
    waffle: function (c) {
      var cols = 27, rows = Math.ceil(c.total / cols), sz = 26, W = cols * sz + 20, H = rows * sz + 20, s = '<svg viewBox="0 0 ' + (W + 250) + ' ' + H + '" xmlns="' + NS + '">';
      for (var i = 0; i < c.total; i++) s += '<rect x="' + (10 + (i % cols) * sz) + '" y="' + (10 + Math.floor(i / cols) * sz) + '" width="' + (sz - 4) + '" height="' + (sz - 4) + '" fill="' + (i < c.n ? '#8f2d22' : '#d8c9a2') + '" stroke="#2b1f14" stroke-width=".6"/>';
      s += '<text x="' + (W + 20) + '" y="70" font-size="66" font-weight="800" font-family="Playfair Display,serif" fill="#8f2d22">' + (c.n / c.total * 100).toFixed(1) + '%</text><text x="' + (W + 20) + '" y="100" font-size="18">flagged: ' + c.n + ' of ' + c.total + '</text><text x="' + (W + 20) + '" y="126" font-size="15" font-style="italic" fill="#5a4631">as reported, ' + esc(c.s) + '</text><rect x="' + (W + 20) + '" y="160" width="16" height="16" fill="#8f2d22"/><text x="' + (W + 44) + '" y="174" font-size="15">concerning features</text><rect x="' + (W + 20) + '" y="186" width="16" height="16" fill="#d8c9a2" stroke="#2b1f14" stroke-width=".6"/><text x="' + (W + 44) + '" y="200" font-size="15">not flagged</text></svg>';
      return frame(c, s, [['Group', 'Cases', 'Share'], ['Flagged with concerning features', c.n, (c.n / c.total * 100).toFixed(1) + '%'], ['Not flagged', c.total - c.n, ((c.total - c.n) / c.total * 100).toFixed(1) + '%'], ['Total reviewed', c.total, '100%']], c.n + ' of ' + c.total + ' reviewed cases were flagged, ' + (c.n / c.total * 100).toFixed(1) + ' percent');
    },
    elapsed: function (c) {
      var seg = c.segments.map(function (g) { return { l: g.label, a: g.start, b: g.end, d: Math.round((D(g.end) - D(g.start)) / DAY) }; }), tot = seg.reduce(function (a, g) { return a + g.d; }, 0), W = 980, x0 = 20, bw = W - 40, y = 70, s = '<svg viewBox="0 0 ' + W + ' 230" xmlns="' + NS + '">', cx = x0, fills = ['#35516b', '#a8691a', '#8f2d22'];
      seg.forEach(function (g, i) { var w = g.d / tot * bw; s += '<rect x="' + cx + '" y="' + y + '" width="' + w + '" height="56" fill="' + fills[i % 3] + '" stroke="#2b1f14" stroke-width="1.5"/><text x="' + (cx + w / 2) + '" y="' + (y + 35) + '" text-anchor="middle" font-size="22" font-weight="700" fill="#f3ead4">' + g.d + ' days</text><text x="' + (cx + w / 2) + '" y="' + (y + 82) + '" text-anchor="middle" font-size="14.5">' + esc(wrap(g.l, w < 200 ? 16 : 30)[0]) + '</text>' + (wrap(g.l, w < 200 ? 16 : 30)[1] ? '<text x="' + (cx + w / 2) + '" y="' + (y + 98) + '" text-anchor="middle" font-size="14.5">' + esc(wrap(g.l, w < 200 ? 16 : 30)[1]) + '</text>' : '') + '<text x="' + cx + '" y="' + (y - 10) + '" font-size="12" font-family="IBM Plex Mono,monospace">' + fmt(g.a) + '</text>'; cx += w; });
      s += '<text x="' + (x0 + bw) + '" y="' + (y - 10) + '" text-anchor="end" font-size="12" font-family="IBM Plex Mono,monospace">' + fmt(seg[seg.length - 1].b) + '</text><text x="' + x0 + '" y="26" font-size="30" font-weight="800" font-family="Playfair Display,serif" fill="#8f2d22">' + tot + ' days</text><text x="' + (x0 + 150) + '" y="26" font-size="17" font-style="italic" fill="#5a4631">about ' + (tot / 30.44).toFixed(0) + ' months from public accounts to decertification</text></svg>';
      return frame(c, s, [['Stage', 'From', 'To', 'Days']].concat(seg.map(function (g) { return [g.l, g.a, g.b, g.d]; })).concat([['Total', seg[0].a, seg[seg.length - 1].b, tot]]), 'Stacked bar of ' + tot + ' days: ' + seg.map(function (g) { return g.l + ' ' + g.d + ' days'; }).join('; '));
    },
    counter: function (c) {
      var rows = c.rows.map(function (r) { return { l: r.label, d: r.since ? Math.max(0, Math.round((TODAY - D(r.since)) / DAY)) : r.days, n: r.note, done: r.done, live: !!r.since }; }), mx = Math.max.apply(null, rows.map(function (r) { return r.d; })) * 1.25, W = 980, s = '<svg viewBox="0 0 ' + W + ' ' + (rows.length * 120 + 20) + '" xmlns="' + NS + '">';
      rows.forEach(function (r, i) { var y = 20 + i * 120, w = Math.max(6, r.d / mx * 560); s += '<text x="10" y="' + (y + 18) + '" font-size="19" font-weight="700">' + esc(r.l) + '</text><rect x="10" y="' + (y + 30) + '" width="' + w + '" height="34" fill="' + (r.done ? '#3d6b3a' : '#8f2d22') + '" stroke="#2b1f14" stroke-width="1.4"/>' + (r.live ? '<rect x="' + (10 + w) + '" y="' + (y + 30) + '" width="30" height="34" fill="none" stroke="#8f2d22" stroke-width="2" stroke-dasharray="4 3"><animate attributeName="opacity" values="1;.2;1" dur="2.4s" repeatCount="indefinite"/></rect>' : '') + '<text x="' + (w + 54) + '" y="' + (y + 56) + '" font-size="30" font-weight="800" font-family="Playfair Display,serif">' + r.d + ' days</text><text x="' + (w + 54 + 150) + '" y="' + (y + 56) + '" font-size="15" font-style="italic" fill="#5a4631">' + (r.done ? 'replacement named' : 'no replacement found in our searches') + '</text><text x="10" y="' + (y + 88) + '" font-size="14.5" fill="#5a4631">' + esc(r.n) + (r.live ? '. Counted live from today.' : '') + '</text>'; });
      return frame(c, s + '</svg>', [['Case', 'Days', 'Status', 'Note']].concat(rows.map(function (r) { return [r.l, r.d, r.done ? 'replacement named' : 'no replacement found', r.n]; })), 'Days from decertification announcement: ' + rows.map(function (r) { return r.l + ' ' + r.d; }).join('; '));
    },
    reply: function (c) {
      var t = '<table><thead><tr><th></th>' + c.cols.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' + c.rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th>' + r.slice(1).map(function (x, i) { return '<td>' + (/^S\d/.test(x) ? x.split(/,\s*/).map(function (id) { return '<button class="cite" style="vertical-align:baseline;font-size:12px" data-s="' + id + '">[' + id.slice(1) + ']</button>'; }).join(' ') : esc(x)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      return '<div class="chart" id="' + c.id + '"><h3>' + esc(c.title) + '</h3><p class="cn">' + esc(c.note) + '</p>' + t + '</div>';
    }
  };
  var chartRows = {};
  function buildCharts(inst) {
    $('#p-charts').innerHTML = inst.charts.map(function (c) { return CHARTS[c.type](c); }).join('');
    $$('#p-charts [data-csv]').forEach(function (b) { b.onclick = function () { var tb = b.closest('.chart').querySelector('table'), rows = $$('tr', tb).map(function (r) { return $$('th,td', r).map(function (c) { return c.textContent; }); }), t = csv(rows); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'Copied'; }, function () { prompt('Copy the data:', t); }); }; });
    $$('#p-charts [data-svg]').forEach(function (b) { b.onclick = function () { var sv = b.closest('.chart').querySelector('svg'), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['<?xml version="1.0"?>' + new XMLSerializer().serializeToString(sv)], { type: 'image/svg+xml' })); a.download = b.dataset.svg + '.svg'; document.body.appendChild(a); a.click(); a.remove(); }; });
  }

  /* ---------- plates, sources, terms ---------- */
  function buildPlates(inst) {
    $('#p-plates').innerHTML = '<p class="note">Original illustrations in the manner of mid-century medical plates, made for this series. They are not archival photographs. Click a plate to enlarge.</p><div class="gal">' + (inst.figures || []).map(function (f) { return '<figure><img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy"><figcaption>' + esc(f.caption) + '</figcaption></figure>'; }).join('') + '</div>';
    $$('#p-plates img').forEach(function (im) { im.onclick = function () { lightbox(im.src, im.alt); }; });
  }
  function buildSources(inst) {
    var used = {}; JSON.stringify(inst).replace(/S\d+/g, function (m) { used[m] = 1; });
    var rows = Object.keys(data.sources).filter(function (k) { return used[k]; }).map(function (k) { return [k, data.sources[k]]; }), key = 'date', dir = -1;
    function paint() { rows.sort(function (a, b) { var A = key === 'id' ? +a[0].slice(1) : a[1][key], B = key === 'id' ? +b[0].slice(1) : b[1][key]; return (A > B ? 1 : A < B ? -1 : 0) * dir; }); $('#p-sources tbody').innerHTML = rows.map(function (r) { var s = r[1]; return '<tr><td>' + r[0] + '</td><td><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></td><td>' + esc(s.publisher) + '</td><td>' + esc(s.type) + '</td><td>' + esc(s.date) + '</td></tr>'; }).join(''); }
    $('#p-sources').innerHTML = '<p class="note">Sources are listed with their dates. Click a column heading to sort. Open the primary documents before you rely on a claim.</p><table class="src"><thead><tr><th data-k="id">#</th><th data-k="title">Title</th><th data-k="publisher">Publisher</th><th data-k="type">Type</th><th data-k="date">Date</th></tr></thead><tbody></tbody></table>';
    $$('#p-sources th').forEach(function (th) { th.onclick = function () { dir = key === th.dataset.k ? -dir : 1; key = th.dataset.k; paint(); }; }); paint();
  }
  function buildTerms(inst) { $('#p-terms').innerHTML = '<dl class="gl">' + (inst.glossary || []).map(function (g) { return '<dt>' + esc(g.term) + '</dt><dd>' + esc(g.text) + '</dd>'; }).join('') + '</dl>'; }
})();
