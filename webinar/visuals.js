/* Cold Ischemia Foundation webinar: animated slide visuals.
   CIFVisual(el, spec) builds the visual; .update(p) advances it with scene progress p (0..1). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var C = { gold: '#C9A84C', teal: '#2E7D74', teal2: '#4fb3a6', blood: '#B23A3A', amber: '#D98A2B', ice: '#7fb8e6', txt: '#eef1f6', mut: '#8f9ab0', line: 'rgba(255,255,255,.14)' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function seg(p, a, b) { return ease((p - a) / (b - a)); }
  function fmtN(n, dec) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); }

  var B = {};

  B.title = function (el, v) {
    el.innerHTML = '<div class="vx-title"><div class="vx-ring"></div><div class="vx-th">' + esc(v.h) + '</div><div class="vx-ts">' + esc(v.sub || '') + '</div></div>';
    return function () {};
  };

  B.stat = function (el, v) {
    el.innerHTML = '<div class="vx-stat"><div class="vx-num"><span class="n">0</span><span class="suf">' + esc(v.suf || '') + '</span></div><div class="vx-cap">' + esc(v.cap) + '</div><div class="vx-bar"><i></i></div></div>';
    var n = el.querySelector('.n'), bar = el.querySelector('.vx-bar i');
    return function (p) { var k = seg(p, 0.02, 0.28); n.textContent = fmtN(v.n * k, v.dec); bar.style.width = (k * 100) + '%'; };
  };

  B.dots = function (el, v) {
    var total = v.total, cols = total > 150 ? 27 : 10, r = total > 150 ? 5.2 : 13, gap = total > 150 ? 13.5 : 34;
    var rows = Math.ceil(total / cols), W = cols * gap, H = rows * gap;
    var s = '<svg class="vx-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">';
    for (var i = 0; i < total; i++) s += '<circle cx="' + ((i % cols) * gap + gap / 2) + '" cy="' + (Math.floor(i / cols) * gap + gap / 2) + '" r="' + r + '" fill="rgba(255,255,255,.12)"/>';
    s += '</svg>';
    el.innerHTML = '<div class="vx-dots">' + s + '<div class="vx-legend"><span><i style="background:' + C.blood + '"></i><b class="hn">0</b> ' + esc(v.hiLabel) + '</span><span><i style="background:' + C.teal2 + '"></i>' + esc(v.loLabel) + '</span></div><div class="vx-cap">' + esc(v.cap) + '</div></div>';
    var cs = el.querySelectorAll('circle'), hn = el.querySelector('.hn');
    return function (p) {
      var a = seg(p, 0.03, 0.2), h = seg(p, 0.15, 0.42), nh = Math.round(v.hi * h);
      for (var i = 0; i < total; i++) {
        var shown = i < Math.round(total * a);
        var hi = i >= total - nh;
        cs[i].setAttribute('fill', !shown ? 'rgba(255,255,255,.08)' : hi ? C.blood : C.teal2);
      }
      hn.textContent = fmtN(nh);
    };
  };

  B.grid = function (el, v) {
    var total = v.total, cols = 11, gap = 46;
    var s = '<svg class="vx-svg" viewBox="0 0 ' + (cols * gap) + ' ' + (Math.ceil(total / cols) * gap) + '">';
    for (var i = 0; i < total; i++) {
      var x = (i % cols) * gap + 6, y = Math.floor(i / cols) * gap + 6;
      s += '<g transform="translate(' + x + ',' + y + ')"><path d="M17 1 L33 10 L33 26 L17 35 L1 26 L1 10Z" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" stroke-width="1"/></g>';
    }
    s += '</svg>';
    el.innerHTML = '<div class="vx-dots">' + s + '<div class="vx-cap">' + esc(v.cap) + '</div></div>';
    var ps = el.querySelectorAll('path');
    return function (p) {
      var a = seg(p, 0.02, 0.25), h = seg(p, 0.3, 0.6);
      for (var i = 0; i < total; i++) {
        var on = i < Math.round(total * a), hi = v.hi && i >= total - Math.round(v.hi * h);
        ps[i].setAttribute('fill', hi ? 'rgba(178,58,58,.75)' : on ? 'rgba(201,168,76,.28)' : 'rgba(255,255,255,.04)');
        ps[i].setAttribute('stroke', hi ? C.blood : on ? C.gold : 'rgba(255,255,255,.15)');
      }
    };
  };

  B.line = function (el, v) {
    var W = 640, H = 300, pl = 40, pr = 30, pt = 30, pb = 40;
    var xs = v.pts.map(function (q) { return q[0]; }), ys = v.pts.map(function (q) { return q[1]; });
    var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), ymax = Math.max.apply(0, ys) * 1.15;
    var cat = v.pts.length > 2; function X(x) { var i = xs.indexOf(x); return cat ? pl + 30 + i / (xs.length - 1) * (W - pl - pr - 60) : pl + (x - x0) / (x1 - x0) * (W - pl - pr); }
    function Y(y) { return H - pb - y / ymax * (H - pt - pb); }
    var d = v.pts.map(function (q, i) { return (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }).join(' ');
    var area = d + ' L' + X(xs[xs.length - 1]) + ' ' + (H - pb) + ' L' + X(xs[0]) + ' ' + (H - pb) + 'Z';
    var s = '<svg class="vx-svg" viewBox="0 0 ' + W + ' ' + H + '"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.gold + '" stop-opacity=".35"/><stop offset="1" stop-color="' + C.gold + '" stop-opacity="0"/></linearGradient><clipPath id="lc"><rect class="clip" x="0" y="0" width="0" height="' + H + '"/></clipPath></defs>';
    s += '<line x1="' + pl + '" y1="' + (H - pb) + '" x2="' + (W - pr) + '" y2="' + (H - pb) + '" stroke="' + C.line + '"/>';
    s += '<g clip-path="url(#lc)"><path d="' + area + '" fill="url(#lg)"/><path d="' + d + '" fill="none" stroke="' + C.gold + '" stroke-width="4" stroke-linejoin="round"/></g>';
    v.pts.forEach(function (q, i) {
      s += '<g class="pt" data-i="' + i + '" opacity="0"><circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="7" fill="' + C.gold + '"/><text x="' + X(q[0]) + '" y="' + (Y(q[1]) - 16) + '" text-anchor="middle" fill="' + C.txt + '" font-size="22" font-family="Playfair Display,Georgia,serif" font-weight="900">' + q[1] + (v.suf || '') + '</text><text x="' + X(q[0]) + '" y="' + (H - pb + 26) + '" text-anchor="middle" fill="' + C.mut + '" font-size="15" font-family="IBM Plex Mono,monospace">' + q[0] + '</text></g>';
    });
    s += '</svg>';
    el.innerHTML = '<div class="vx-chart">' + s + '<div class="vx-cap">' + esc(v.lab) + '</div></div>';
    var clip = el.querySelector('.clip'), pts = el.querySelectorAll('.pt');
    return function (p) {
      var k = seg(p, 0.03, 0.4); clip.setAttribute('width', k * W);
      for (var i = 0; i < pts.length; i++) { var px = X(v.pts[i][0]) / W; pts[i].setAttribute('opacity', k >= px - 0.02 ? 1 : 0); }
    };
  };

  B.bars = function (el, v) {
    var max = Math.max.apply(0, v.items.map(function (q) { return q[1]; }));
    var h = '<div class="vx-bars">';
    v.items.forEach(function (q, i) {
      h += '<div class="vb"><div class="vl">' + esc(q[0]) + '</div><div class="vt"><i data-w="' + (q[1] / max * 100) + '" style="background:' + (i === v.items.length - 1 || q[1] === max ? C.blood : C.gold) + '"></i></div><div class="vv"><b data-v="' + q[1] + '">0</b>' + esc(v.suf || '') + '</div></div>';
    });
    h += '</div><div class="vx-cap">' + esc(v.cap) + '</div>';
    el.innerHTML = '<div class="vx-chart">' + h + '</div>';
    var is = el.querySelectorAll('.vt i'), bs = el.querySelectorAll('.vv b');
    return function (p) {
      for (var i = 0; i < is.length; i++) {
        var k = seg(p, 0.04 + i * 0.07, 0.2 + i * 0.07);
        is[i].style.width = (k * +is[i].dataset.w) + '%';
        var val = +bs[i].dataset.v; bs[i].textContent = fmtN(val * k, val % 1 ? 1 : 0);
      }
    };
  };

  B.flow = function (el, v) {
    var h = '<div class="vx-flow">';
    v.steps.forEach(function (s, i) { h += (i ? '<div class="fa"><i></i></div>' : '') + '<div class="fs"><span>' + (i + 1) + '</span>' + esc(s) + '</div>'; });
    el.innerHTML = h + '</div>';
    var fs = el.querySelectorAll('.fs'), fa = el.querySelectorAll('.fa i');
    return function (p) {
      var n = fs.length, cur = v.hi >= 0 ? v.hi : -1;
      for (var i = 0; i < n; i++) {
        var on = p >= 0.04 + i * (0.5 / n);
        fs[i].classList.toggle('on', on);
        fs[i].classList.toggle('hi', on && (cur === i || (cur < 0 && p > 0.6 && i === Math.floor((p - 0.6) / 0.4 * n))));
        if (i < fa.length) fa[i].style.width = (seg(p, 0.04 + i * (0.5 / n), 0.04 + (i + 1) * (0.5 / n)) * 100) + '%';
      }
    };
  };

  B.split = function (el, v) {
    function col(c, cls) { return '<div class="sc ' + cls + '"><div class="sh">' + esc(c.h) + '</div>' + c.items.map(function (t) { return '<div class="si">' + esc(t) + '</div>'; }).join('') + '</div>'; }
    el.innerHTML = '<div class="vx-split">' + col(v.l, 'l') + '<div class="sv"></div>' + col(v.r, 'r') + '</div>';
    var items = el.querySelectorAll('.si'), heads = el.querySelectorAll('.sh');
    var order = []; var L = v.l.items.length, R = v.r.items.length;
    for (var i = 0; i < Math.max(L, R); i++) { if (i < L) order.push(i); if (i < R) order.push(L + i); }
    return function (p) {
      heads[0].classList.toggle('in', p > 0.02); heads[1].classList.toggle('in', p > 0.05);
      order.forEach(function (ix, k) { items[ix].classList.toggle('in', p > 0.08 + k * (0.55 / order.length)); });
    };
  };

  B.checklist = function (el, v) {
    el.innerHTML = '<div class="vx-check">' + v.items.map(function (t) { return '<div class="ck"><span class="bx"><svg viewBox="0 0 20 20"><path d="M4 10.5 L8.5 15 L16 5.5"/></svg></span>' + esc(t) + '</div>'; }).join('') + '</div>';
    var ck = el.querySelectorAll('.ck');
    return function (p) { for (var i = 0; i < ck.length; i++) { var a = 0.04 + i * (0.7 / ck.length); ck[i].classList.toggle('in', p > a); ck[i].classList.toggle('done', p > a + 0.06); } };
  };

  B.timeline = function (el, v) {
    el.innerHTML = '<div class="vx-tl"><div class="tl-line"><i></i></div>' + v.ev.map(function (e) { return '<div class="te"><div class="td">' + esc(e[0]) + '</div><div class="tx">' + esc(e[1]) + '</div></div>'; }).join('') + '</div>';
    var te = el.querySelectorAll('.te'), ln = el.querySelector('.tl-line i');
    return function (p) { ln.style.height = (seg(p, 0.03, 0.75) * 100) + '%'; for (var i = 0; i < te.length; i++) te[i].classList.toggle('in', p > 0.05 + i * (0.7 / te.length)); };
  };

  B.quote = function (el, v) {
    el.innerHTML = '<div class="vx-quote"><div class="qm">“</div><div class="qt">' + esc(v.q) + '</div><div class="qb">' + esc(v.by) + '</div></div>';
    var q = el.querySelector('.vx-quote');
    return function (p) { q.classList.toggle('in', p > 0.02); };
  };

  B.pair = function (el, v) {
    function block(side, color) {
      var s = '<svg class="vx-svg" viewBox="0 0 280 330">';
      for (var i = 0; i < side.of; i++) s += '<circle cx="' + ((i % 10) * 27 + 14) + '" cy="' + (Math.floor(i / 10) * 29 + 14) + '" r="9" fill="rgba(255,255,255,.1)"/>';
      return '<div class="pb"><div class="ph">' + esc(side.lab) + '</div>' + s + '</svg><div class="pn"><b>' + side.n + '</b> of ' + side.of + '</div></div>';
    }
    el.innerHTML = '<div><div class="vx-pair">' + block(v.a) + block(v.b) + '</div><div class="vx-cap">' + esc(v.cap) + '</div></div>';
    var blocks = el.querySelectorAll('.pb');
    var sides = [v.a, v.b];
    return function (p) {
      for (var b = 0; b < 2; b++) {
        var cs = blocks[b].querySelectorAll('circle'), side = sides[b];
        var a = seg(p, 0.03 + b * 0.05, 0.25 + b * 0.05), f = seg(p, 0.3 + b * 0.08, 0.5 + b * 0.08);
        for (var i = 0; i < cs.length; i++) {
          var shown = i < Math.round(cs.length * a), bad = i >= cs.length - Math.round(side.n * f);
          cs[i].setAttribute('fill', !shown ? 'rgba(255,255,255,.06)' : bad ? C.blood : C.teal2);
        }
        blocks[b].classList.toggle('in', f > 0.98);
      }
    };
  };

  B.clock = function (el, v) {
    var R = 120, cx = 160, cy = 160, s = '<svg class="vx-svg" viewBox="0 0 320 320"><circle cx="160" cy="160" r="' + R + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="22"/>';
    s += '<circle class="arc" cx="160" cy="160" r="' + R + '" fill="none" stroke="url(#cg)" stroke-width="22" stroke-linecap="round" transform="rotate(-90 160 160)" stroke-dasharray="' + (2 * Math.PI * R) + '" stroke-dashoffset="' + (2 * Math.PI * R) + '"/>';
    s += '<defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + C.ice + '"/><stop offset=".6" stop-color="' + C.amber + '"/><stop offset="1" stop-color="' + C.blood + '"/></linearGradient></defs>';
    for (var h = 0; h < 24; h += 3) { var a = h / 24 * 2 * Math.PI - Math.PI / 2; s += '<text x="' + (cx + Math.cos(a) * (R - 36)) + '" y="' + (cy + Math.sin(a) * (R - 36) + 5) + '" text-anchor="middle" fill="' + C.mut + '" font-size="13" font-family="IBM Plex Mono,monospace">' + h + 'h</text>'; }
    s += '<text class="hr" x="160" y="172" text-anchor="middle" fill="' + C.txt + '" font-size="44" font-family="Playfair Display,Georgia,serif" font-weight="900">0h</text></svg>';
    el.innerHTML = '<div class="vx-clock">' + s + '<div class="vx-cap">' + esc(v.cap) + '</div></div>';
    var arc = el.querySelector('.arc'), hr = el.querySelector('.hr'), L = 2 * Math.PI * R;
    return function (p) { var k = seg(p, 0.03, 0.85); arc.setAttribute('stroke-dashoffset', L * (1 - k)); hr.textContent = Math.round(k * v.hours) + 'h'; };
  };

  B.circuit = function (el, v) {
    var mode = v.mode, warm = mode === 'warm', ice = mode === 'ice';
    var col = warm ? C.blood : C.ice, temp = warm ? '37°C' : '4°C';
    var s = '<svg class="vx-svg" viewBox="0 0 640 330">';
    if (ice) {
      s += '<rect x="170" y="60" width="300" height="210" rx="18" fill="rgba(127,184,230,.08)" stroke="' + C.ice + '" stroke-width="2"/>';
      for (var i = 0; i < 26; i++) s += '<rect class="cube" x="' + (190 + (i * 53) % 260) + '" y="' + (80 + Math.floor(i / 5) * 34) + '" width="24" height="24" rx="5" fill="rgba(200,230,255,.18)" stroke="rgba(200,230,255,.45)"/>';
      s += '<path d="M300 120 C260 120 250 170 270 200 C290 232 350 236 362 200 C372 172 345 160 340 150 C333 135 330 120 300 120Z" fill="#8a3b3b" stroke="#c46a6a" stroke-width="2"/>';
      s += '<text x="320" y="305" text-anchor="middle" fill="' + C.ice + '" font-size="16" font-family="IBM Plex Mono,monospace">STATIC · ' + temp + ' · NO FLOW · NO DATA</text>';
    } else {
      s += '<path id="cpath" d="M320 125 L320 70 L140 70 L140 270 L320 270 L320 215" fill="none" stroke="' + col + '" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>';
      s += '<circle cx="140" cy="165" r="38" fill="rgba(0,0,0,.35)" stroke="' + C.gold + '" stroke-width="2"/><path class="rotor" d="M140 135 L140 195 M110 165 L170 165" stroke="' + C.gold + '" stroke-width="5" stroke-linecap="round"/><text x="140" y="228" text-anchor="middle" fill="' + C.mut + '" font-size="13" font-family="IBM Plex Mono,monospace">PUMP</text>';
      if (mode !== 'cold') s += '<rect x="205" y="45" width="70" height="50" rx="8" fill="rgba(0,0,0,.4)" stroke="' + C.teal2 + '" stroke-width="2"/><text x="240" y="76" text-anchor="middle" fill="' + C.teal2 + '" font-size="13" font-family="IBM Plex Mono,monospace">O₂</text>';
      s += '<path d="M318 128 C278 128 268 178 288 208 C308 240 368 244 380 208 C390 180 363 168 358 158 C351 143 348 128 318 128Z" fill="' + (warm ? '#a8403b' : '#7a3434') + '" stroke="' + (warm ? '#e07a6e' : '#b86a6a') + '" stroke-width="2"><animate attributeName="opacity" values="' + (warm ? '.85;1;.85' : '1;1;1') + '" dur="1.1s" repeatCount="indefinite"/></path>';
      s += '<rect x="430" y="80" width="170" height="170" rx="12" fill="rgba(0,0,0,.35)" stroke="rgba(255,255,255,.2)"/>';
      s += '<text x="450" y="112" fill="' + C.mut + '" font-size="12" font-family="IBM Plex Mono,monospace">TEMP</text><text x="450" y="140" fill="' + col + '" font-size="26" font-family="Playfair Display,Georgia,serif" font-weight="900">' + temp + '</text>';
      s += '<text x="450" y="172" fill="' + C.mut + '" font-size="12" font-family="IBM Plex Mono,monospace">FLOW</text><text class="flow" x="450" y="198" fill="' + C.txt + '" font-size="22" font-family="Playfair Display,Georgia,serif" font-weight="900">0 mL/min</text>';
      s += '<text x="450" y="228" fill="' + C.mut + '" font-size="12" font-family="IBM Plex Mono,monospace">' + (mode === 'cold' ? 'RESISTANCE MONITORED' : 'OXYGENATED') + '</text>';
      for (var j = 0; j < 14; j++) s += '<circle r="5" fill="' + col + '"><animateMotion dur="3.2s" begin="' + (-j * 0.23) + 's" repeatCount="indefinite"><mpath href="#cpath" xlink:href="#cpath"/></animateMotion></circle>';
    }
    s += '</svg>';
    el.innerHTML = '<div class="vx-circuit">' + s + '<div class="vx-cap">' + esc(v.label) + '</div></div>';
    var flow = el.querySelector('.flow'), rotor = el.querySelector('.rotor'), cubes = el.querySelectorAll('.cube'), t0 = performance.now();
    return function (p) {
      var t = (performance.now() - t0) / 1000;
      if (rotor) rotor.setAttribute('transform', 'rotate(' + (t * 160 % 360) + ' 140 165)');
      if (flow) flow.textContent = Math.max(0, Math.round(seg(p, 0.03, 0.3) * (warm ? 92 : 80) + Math.sin(t * 2) * 2 * seg(p, 0.03, 0.3))) + ' mL/min';
      for (var i = 0; i < cubes.length; i++) cubes[i].setAttribute('opacity', 0.5 + 0.5 * Math.sin(t * 0.8 + i));
    };
  };

  B.molecule = function (el, v) {
    var s = '<svg class="vx-svg" viewBox="0 0 640 330"><defs><radialGradient id="hg"><stop offset="0" stop-color="#e07a6e"/><stop offset="1" stop-color="#7a2a2a"/></radialGradient></defs>';
    var sub = [[280, 130], [360, 130], [280, 210], [360, 210]];
    sub.forEach(function (q) { s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="46" fill="url(#hg)" stroke="#f0b0a5" stroke-opacity=".5" stroke-width="2"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="10" fill="' + C.gold + '"/>'; });
    for (var i = 0; i < 4; i++) s += '<g class="o2" data-i="' + i + '"><circle r="10" fill="' + C.ice + '"/><circle r="10" cx="14" fill="' + C.ice + '"/></g>';
    s += '<rect x="500" y="110" width="110" height="110" rx="10" fill="rgba(46,125,116,.15)" stroke="' + C.teal2 + '"/><text x="555" y="160" text-anchor="middle" fill="' + C.teal2 + '" font-size="13" font-family="IBM Plex Mono,monospace">TISSUE</text><text x="555" y="180" text-anchor="middle" fill="' + C.teal2 + '" font-size="13" font-family="IBM Plex Mono,monospace">IN NEED</text>';
    s += '<text x="320" y="310" text-anchor="middle" fill="' + C.mut + '" font-size="13" font-family="IBM Plex Mono,monospace">NO CELL MEMBRANE · NO BLOOD-GROUP ANTIGENS</text></svg>';
    el.innerHTML = '<div class="vx-circuit">' + s + '<div class="vx-cap">' + esc(v.cap) + '</div></div>';
    var o2 = el.querySelectorAll('.o2'), t0 = performance.now();
    return function () {
      var t = (performance.now() - t0) / 1000;
      for (var i = 0; i < o2.length; i++) {
        var ph = ((t * 0.25 + i / 4) % 1), x, y, q = sub[i];
        if (ph < 0.5) { var a = t * 1.6 + i * 1.57; x = q[0] + Math.cos(a) * 62; y = q[1] + Math.sin(a) * 62; }
        else { var k = ease((ph - 0.5) / 0.5); x = q[0] + (548 - q[0]) * k; y = q[1] + (165 - q[1]) * k; }
        o2[i].setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')');
        o2[i].setAttribute('opacity', ph > 0.93 ? (1 - ph) / 0.07 : 1);
      }
    };
  };

  B.photo = function (el, v) {
    el.innerHTML = '<div class="vx-photo"><img src="' + esc(v.src) + '" alt=""><div class="vx-cap">' + esc(v.cap) + '</div></div>';
    var img = el.querySelector('img');
    return function (p) { img.style.transform = 'scale(' + (1.04 + p * 0.08) + ') translate(' + (-p * 2) + '%,' + (-p * 1) + '%)'; };
  };

  window.CIFVisual = function (el, spec) {
    var f = (B[spec && spec.t] || B.title)(el, spec || { h: '' });
    return { update: f };
  };
})();
