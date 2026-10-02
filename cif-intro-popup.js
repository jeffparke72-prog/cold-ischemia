/* Cold Ischemia Foundation — homepage introduction pop-up.
   Opens once per browser session shortly after the homepage finishes loading and plays the narrated
   2-minute introduction (cif-trailer.html + cif-narration.mp3). It is dismissible (X, Escape, backdrop,
   or "Explore the site") and leaves a small "Watch the introduction" button behind.
   Browsers usually block autoplay with sound: the visuals start silently and a prominent button
   starts the narration with one tap (it is tried automatically first, in case the browser allows it).
   To remove it, delete the <script src="cif-intro-popup.js"> line from index.html. */
(function () {
  'use strict';
  if (window.__cifIntro) return;
  window.__cifIntro = true;

  var VIDEO = 'cif-trailer.html?embed=1';
  var AUDIO = 'cif-narration.mp3';
  var VW = 960, VH = 540;            /* the video is rendered at 960x540 and scaled to fit the dialog */
  var ONCE_PER_SESSION = true;       /* false = open on every homepage load */
  var OPEN_DELAY_MS = 1200;
  var KEY = 'cifIntroSeen';

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var seen = false;
  try { seen = ONCE_PER_SESSION && sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  /* ---------- styles ---------- */
  var css = [
    '.cifp,.cifp *,.cifp-pill{box-sizing:border-box}',
    '.cifp{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:12px;font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;opacity:0;transition:opacity .35s ease}',
    '.cifp[hidden]{display:none}',
    '.cifp.on{opacity:1}',
    '.cifp-back{position:absolute;inset:0;background:rgba(2,4,8,.78);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}',
    '.cifp-card{position:relative;width:min(960px,calc(100vw - 24px),calc((100vh - 176px) * 1.7778));min-width:min(320px,calc(100vw - 24px));background:#030509;border:1px solid rgba(200,144,42,.42);border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.7);overflow:hidden;transform:translateY(14px) scale(.985);transition:transform .35s ease}',
    '.cifp.on .cifp-card{transform:none}',
    '.cifp-head{display:flex;align-items:center;gap:12px;padding:12px 14px 12px 18px;border-bottom:1px solid rgba(100,140,200,.16)}',
    '.cifp-ttl{flex:1;min-width:0}',
    '.cifp-eyebrow{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c8902a;margin-bottom:4px}',
    '.cifp-h{font:700 clamp(15px,2.3vw,21px)/1.2 "Playfair Display",Georgia,serif;color:#e8dfd2;margin:0}',
    '.cifp-x{flex:none;width:36px;height:36px;border-radius:50%;border:1px solid rgba(216,207,196,.3);background:transparent;color:#d8cfc4;font-size:18px;line-height:1;cursor:pointer}',
    '.cifp-x:hover,.cifp-x:focus-visible{background:#c8902a;border-color:#c8902a;color:#030509;outline:none}',
    '.cifp-frame{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#05080f}',
    '.cifp-frame iframe{position:absolute;left:0;top:0;width:' + VW + 'px;height:' + VH + 'px;border:0;transform-origin:0 0;pointer-events:none}',
    '.cifp-snd{position:absolute;left:50%;bottom:7%;transform:translateX(-50%);z-index:2;display:inline-flex;align-items:center;gap:10px;padding:13px 24px;border:0;border-radius:999px;background:#c8902a;color:#030509;font:600 clamp(11px,1.7vw,14px) "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px;text-transform:uppercase;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.55);animation:cifpPulse 2s ease-in-out infinite;white-space:nowrap}',
    '.cifp-snd:hover,.cifp-snd:focus-visible{background:#e8b84a;outline:none}',
    '.cifp-snd[hidden]{display:none}',
    '@keyframes cifpPulse{0%,100%{box-shadow:0 10px 30px rgba(0,0,0,.55),0 0 0 0 rgba(200,144,42,.55)}50%{box-shadow:0 10px 30px rgba(0,0,0,.55),0 0 0 14px rgba(200,144,42,0)}}',
    '.cifp-foot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;background:#070d16;border-top:1px solid rgba(100,140,200,.14)}',
    '.cifp-meta{flex:1;min-width:120px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(216,207,196,.5)}',
    '.cifp-b{font:500 10px "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:1.8px;text-transform:uppercase;text-decoration:none;color:#d8cfc4;background:transparent;border:1px solid rgba(200,144,42,.45);border-radius:3px;padding:9px 13px;cursor:pointer;line-height:1;white-space:nowrap}',
    '.cifp-b:hover,.cifp-b:focus-visible{background:rgba(200,144,42,.18);outline:none}',
    '.cifp-b.go{background:#c8902a;border-color:#c8902a;color:#030509;font-weight:600}',
    '.cifp-b.go:hover,.cifp-b.go:focus-visible{background:#e8b84a}',
    '.cifp-b[hidden]{display:none}',
    '.cifp-pill{position:fixed;right:16px;bottom:16px;z-index:900;font:500 10px "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px;text-transform:uppercase;color:#030509;background:#c8902a;border:0;border-radius:999px;padding:11px 17px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45);opacity:0;transform:translateY(10px);transition:opacity .4s ease,transform .4s ease}',
    '.cifp-pill.on{opacity:1;transform:none}',
    '.cifp-pill:hover,.cifp-pill:focus-visible{background:#e8b84a;outline:none}',
    '.cifp-pill[hidden]{display:none}',
    '@media(max-width:640px){.cifp-head{padding:10px 10px 10px 14px}.cifp-eyebrow{display:none}.cifp-meta{display:none}.cifp-foot{justify-content:space-between}.cifp-b{padding:10px 11px;font-size:9px;letter-spacing:1.2px}.cifp-b.go{flex:1;text-align:center}.cifp-snd{padding:11px 18px;letter-spacing:1.4px}.cifp-pill{right:10px;bottom:10px}}',
    '@media(max-height:480px){.cifp-eyebrow,.cifp-meta{display:none}.cifp-head{padding:6px 8px 6px 14px}.cifp-foot{padding:6px 10px}}',
    '@media(prefers-reduced-motion:reduce){.cifp,.cifp-card,.cifp-pill{transition:none}.cifp-snd{animation:none}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- markup ---------- */
  var dlg = document.createElement('div');
  dlg.className = 'cifp';
  dlg.hidden = true;
  dlg.setAttribute('role', 'dialog');
  dlg.setAttribute('aria-modal', 'true');
  dlg.setAttribute('aria-labelledby', 'cifp-h');
  dlg.innerHTML =
    '<div class="cifp-back" data-close></div>' +
    '<div class="cifp-card">' +
      '<div class="cifp-head"><div class="cifp-ttl"><div class="cifp-eyebrow">Cold Ischemia Foundation</div>' +
        '<h2 class="cifp-h" id="cifp-h">Welcome. Our mission in about two minutes.</h2></div>' +
        '<button type="button" class="cifp-x" data-close aria-label="Close introduction">✕</button></div>' +
      '<div class="cifp-frame"><iframe title="Cold Ischemia Foundation introduction video" tabindex="-1" allow="autoplay"></iframe>' +
        '<button type="button" class="cifp-snd" data-a="snd" hidden>▶&nbsp; Play with sound</button></div>' +
      '<div class="cifp-foot"><span class="cifp-meta">Introduction · 2 min 14 sec</span>' +
        '<button type="button" class="cifp-b" data-a="mute" hidden>Mute</button>' +
        '<button type="button" class="cifp-b" data-a="replay" hidden>Replay</button>' +
        '<a class="cifp-b" href="projects.html">Free Toolkit</a>' +
        '<a class="cifp-b" href="donate.html">Donate</a>' +
        '<button type="button" class="cifp-b go" data-close>Explore the site →</button></div>' +
    '</div>';

  var pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'cifp-pill';
  pill.hidden = true;
  pill.textContent = '▶ Watch the introduction';
  pill.setAttribute('aria-label', 'Watch the two minute introduction to the Cold Ischemia Foundation');

  var frameWrap = dlg.querySelector('.cifp-frame');
  var iframe = dlg.querySelector('iframe');
  var bSnd = dlg.querySelector('[data-a="snd"]');
  var bMute = dlg.querySelector('[data-a="mute"]');
  var bReplay = dlg.querySelector('[data-a="replay"]');
  var closeBtn = dlg.querySelector('.cifp-x');

  function rescale() {
    var w = frameWrap.clientWidth;   /* layout width: unaffected by the card's open animation */
    if (w > 0) iframe.style.transform = 'scale(' + (w / VW) + ')';
  }
  if (window.ResizeObserver) new ResizeObserver(rescale).observe(frameWrap);
  window.addEventListener('resize', rescale);

  /* ---------- narration (owned here so a tap always satisfies browser autoplay rules) ---------- */
  var audio = null, hasAudio = false, soundOn = false, pump = null, ready = false, pendingStart = false, finished = false, autoTried = false;
  var state = 'hidden', lastFocus = null;

  function post(msg) { try { iframe.contentWindow.postMessage(msg, location.origin); } catch (e) {} }
  function ui() {
    bSnd.hidden = !(hasAudio && !soundOn && !touched);
    bMute.hidden = !(hasAudio && soundOn);
    bReplay.hidden = !finished;
  }
  var touched = false;      /* once the visitor has used any sound control, the big button stays away */

  function startPump() {
    stopPump();
    pump = setInterval(function () {
      post({ cif: 'clock', t: audio.currentTime, playing: !audio.paused && audio.readyState >= 3 });
    }, 200);
  }
  function stopPump() { if (pump) { clearInterval(pump); pump = null; } }

  function soundStart(fromGesture) {
    if (!hasAudio) return;
    if (fromGesture) touched = true;
    audio.currentTime = 0;
    finished = false;
    var p = audio.play();
    soundOn = true; ui();
    if (p && p.catch) p.catch(function () {          /* blocked: fall back to silent visuals + the Play button */
      soundOn = false; stopPump(); post({ cif: 'audio-off', t: audio.currentTime }); ui();
    });
    if (ready) { post({ cif: 'audio-start', t: 0 }); startPump(); } else { pendingStart = true; }
  }
  function soundStop() {
    if (!hasAudio) return;
    audio.pause(); stopPump();
    if (soundOn) post({ cif: 'audio-off', t: audio.currentTime });
    soundOn = false; pendingStart = false; ui();
  }
  function tryAutoSound() {          /* succeeds only if the browser allows autoplay with sound */
    if (autoTried || !hasAudio || state !== 'open') return;
    autoTried = true;
    var p = audio.play();
    if (!p || !p.then) return;
    p.then(function () {
      soundOn = true; ui();
      if (ready) { post({ cif: 'audio-start', t: audio.currentTime }); startPump(); } else { pendingStart = true; }
    }).catch(function () { soundOn = false; ui(); });
  }

  function initAudio() {
    audio = new Audio();
    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', function () {
      hasAudio = true; ui();
      if (ready) post({ cif: 'duration', d: audio.duration });
      tryAutoSound();
    });
    audio.addEventListener('ended', function () {
      stopPump(); post({ cif: 'audio-off', t: audio.duration }); soundOn = false; ui();
    });
    audio.src = AUDIO;
  }

  /* ---------- open / close ---------- */
  function remember() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }

  function open() {
    state = 'open'; finished = false; autoTried = false; touched = false; ready = false; pendingStart = false;
    lastFocus = document.activeElement;
    pill.classList.remove('on'); pill.hidden = true;
    dlg.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    if (audio) audio.preload = 'auto';
    iframe.src = VIDEO;
    ui(); rescale();
    requestAnimationFrame(function () { rescale(); dlg.classList.add('on'); });
    closeBtn.focus({ preventScroll: true });
    if (hasAudio) tryAutoSound();
    remember();
  }
  function close() {
    if (state !== 'open') return;
    state = 'pill';
    soundStop();
    dlg.classList.remove('on');
    document.documentElement.style.overflow = '';
    setTimeout(function () { if (state === 'pill') { dlg.hidden = true; iframe.src = 'about:blank'; } }, 360);
    pill.hidden = false;
    requestAnimationFrame(function () { pill.classList.add('on'); });
    try { if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function showPillOnly() {
    state = 'pill';
    pill.hidden = false;
    requestAnimationFrame(function () { pill.classList.add('on'); });
  }

  dlg.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-close]')) close(); });
  bSnd.addEventListener('click', function () { soundStart(true); });
  bMute.addEventListener('click', function () { touched = true; soundStop(); });
  bReplay.addEventListener('click', function () {
    touched = true; finished = false;
    if (hasAudio) soundStart(true); else { post({ cif: 'replay' }); ui(); }
  });
  pill.addEventListener('click', function () { open(); });

  document.addEventListener('keydown', function (e) {
    if (state !== 'open') return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {                          /* keep keyboard focus inside the dialog */
      var f = [].slice.call(dlg.querySelectorAll('button:not([hidden]),a[href]')).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener('message', function (ev) {
    if (ev.origin !== location.origin || ev.source !== iframe.contentWindow) return;
    var m = ev.data; if (!m || !m.cif) return;
    if (m.cif === 'ready') {
      ready = true;
      if (hasAudio) post({ cif: 'duration', d: audio.duration });
      if (pendingStart) { pendingStart = false; post({ cif: 'audio-start', t: audio.currentTime }); startPump(); }
    } else if (m.cif === 'done') {
      finished = true; ui();
    }
  });

  /* ---------- boot: only after the page has fully loaded, so the homepage is never slowed down ---------- */
  function boot() {
    document.body.appendChild(dlg);
    document.body.appendChild(pill);
    initAudio();
    if (reduceMotion || seen) { showPillOnly(); return; }
    setTimeout(open, OPEN_DELAY_MS);
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
