/* Cold Ischemia Foundation — homepage trailer corner player
   Adds a small, dismissible player to the bottom-right corner. Autoplays silently on load
   (browsers block autoplay with sound); a Sound button appears once cif-narration.mp3 exists.
   To remove it from the site, delete the single <script src="cif-trailer-widget.js"> line in index.html. */
(function () {
  'use strict';
  if (window.__cifTrailerWidget) return;
  window.__cifTrailerWidget = true;

  var TRAILER = 'cif-trailer.html?embed=1';
  var AUDIO_SRC = 'cif-narration.mp3';
  var VW = 960, VH = 540;            /* virtual screen the trailer is rendered at, then scaled down */
  var ONCE_PER_SESSION = true;       /* false = autoplay on every homepage load */
  var KEY = 'cifTrailerSeen';

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var seen = false;
  try { seen = ONCE_PER_SESSION && sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  /* ---------- styles ---------- */
  var css = [
    '.cifc,.cifc *{box-sizing:border-box}',
    '.cifc{position:fixed;right:16px;bottom:16px;z-index:900;width:360px;background:#030509;border:1px solid rgba(200,144,42,.38);border-radius:8px;box-shadow:0 14px 40px rgba(0,0,0,.55);overflow:hidden;opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s ease,width .3s ease;font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace}',
    '.cifc.on{opacity:1;transform:none}',
    '.cifc[hidden]{display:none}',
    '.cifc.big{width:640px}',
    '.cifc-frame{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#05080f}',
    '.cifc-frame iframe{position:absolute;left:0;top:0;width:' + VW + 'px;height:' + VH + 'px;border:0;transform-origin:0 0;pointer-events:none}',
    '.cifc-bar{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#070d16;border-top:1px solid rgba(100,140,200,.14)}',
    '.cifc-title{flex:1;min-width:0;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(216,207,196,.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.cifc-btn{font:500 9px "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:1.5px;text-transform:uppercase;color:#d8cfc4;background:transparent;border:1px solid rgba(200,144,42,.4);border-radius:3px;padding:5px 8px;cursor:pointer;line-height:1}',
    '.cifc-btn:hover,.cifc-btn:focus-visible{background:#c8902a;color:#030509;outline:none}',
    '.cifc-btn[hidden]{display:none}',
    '.cifc-btn.snd{background:#c8902a;color:#030509;border-color:#c8902a;font-weight:600}',
    '.cifc-btn.snd:hover,.cifc-btn.snd:focus-visible{background:#e8b84a}',
    '.cifc-pill{position:fixed;right:16px;bottom:16px;z-index:900;font:500 10px "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px;text-transform:uppercase;color:#030509;background:#c8902a;border:0;border-radius:999px;padding:10px 16px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45);opacity:0;transform:translateY(10px);transition:opacity .4s ease,transform .4s ease}',
    '.cifc-pill.on{opacity:1;transform:none}',
    '.cifc-pill:hover,.cifc-pill:focus-visible{background:#e8b84a;outline:none}',
    '.cifc-pill[hidden]{display:none}',
    '@media(max-width:640px){.cifc{right:10px;bottom:10px;width:230px}.cifc.big{width:calc(100vw - 20px)}.cifc-title{display:none}.cifc-pill{right:10px;bottom:10px}}',
    '@media(prefers-reduced-motion:reduce){.cifc,.cifc-pill{transition:none}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- markup ---------- */
  var box = document.createElement('aside');
  box.className = 'cifc';
  box.hidden = true;
  box.setAttribute('aria-label', 'Cold Ischemia Foundation trailer');
  box.innerHTML =
    '<div class="cifc-frame"><iframe title="Cold Ischemia Foundation trailer" tabindex="-1" aria-hidden="true" allow="autoplay"></iframe></div>' +
    '<div class="cifc-bar">' +
      '<span class="cifc-title">Foundation trailer</span>' +
      '<button type="button" class="cifc-btn snd" data-a="snd" hidden aria-label="Turn narration on">\u25B6 Sound on</button>' +
      '<button type="button" class="cifc-btn" data-a="size" aria-label="Enlarge trailer">Enlarge</button>' +
      '<button type="button" class="cifc-btn" data-a="min" aria-label="Minimize trailer">Hide</button>' +
    '</div>';

  var pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'cifc-pill';
  pill.hidden = true;
  pill.textContent = '▶ Watch trailer';
  pill.setAttribute('aria-label', 'Watch the Cold Ischemia Foundation trailer');

  var frameWrap = box.querySelector('.cifc-frame');
  var iframe = box.querySelector('iframe');
  var bSnd = box.querySelector('[data-a="snd"]');
  var bSize = box.querySelector('[data-a="size"]');
  var bMin = box.querySelector('[data-a="min"]');

  /* ---------- scaling the 960x540 trailer into whatever width the box has ---------- */
  function rescale() {
    var w = frameWrap.getBoundingClientRect().width;
    if (w > 0) iframe.style.transform = 'scale(' + (w / VW) + ')';
  }
  if (window.ResizeObserver) new ResizeObserver(rescale).observe(frameWrap);
  window.addEventListener('resize', rescale);

  /* ---------- narration (owned here so a tap always satisfies browser autoplay rules) ---------- */
  var audio = null, hasAudio = false, soundOn = false, pump = null, ready = false, pendingStart = false;

  function post(msg) {
    try { iframe.contentWindow.postMessage(msg, location.origin); } catch (e) {}
  }
  function setSoundUI() {
    bSnd.textContent = soundOn ? 'Mute' : '\u25B6 Sound on';
    bSnd.setAttribute('aria-label', soundOn ? 'Mute narration' : 'Turn narration on');
  }
  function startPump() {
    stopPump();
    pump = setInterval(function () {
      post({ cif: 'clock', t: audio.currentTime, playing: !audio.paused && audio.readyState >= 3 });
    }, 200);
  }
  function stopPump() { if (pump) { clearInterval(pump); pump = null; } }

  function soundStart() {           /* must run inside a click handler */
    if (!hasAudio) return;
    audio.currentTime = 0;
    var p = audio.play();
    soundOn = true; setSoundUI();
    if (p && p.catch) p.catch(function () { soundOn = false; setSoundUI(); stopPump(); post({ cif: 'audio-off', t: audio.currentTime }); });
    if (ready) { post({ cif: 'audio-start', t: 0 }); startPump(); } else { pendingStart = true; }
  }
  function soundStop() {
    if (!hasAudio) return;
    audio.pause(); stopPump();
    if (soundOn) post({ cif: 'audio-off', t: audio.currentTime });
    soundOn = false; pendingStart = false; setSoundUI();
  }

  function initAudio() {
    audio = new Audio();
    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', function () {
      hasAudio = true; bSnd.hidden = false;
      if (ready) post({ cif: 'duration', d: audio.duration });
    });
    audio.addEventListener('ended', function () {
      stopPump(); post({ cif: 'audio-off', t: audio.duration }); soundOn = false; setSoundUI();
    });
    audio.src = AUDIO_SRC;          /* 404 before the recording is uploaded: no Sound button, silent trailer */
  }

  /* ---------- open / close ---------- */
  var state = 'hidden';
  function remember() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }

  function open(withSound) {
    state = 'open';
    pill.classList.remove('on'); pill.hidden = true;
    ready = false;
    box.hidden = false;
    iframe.src = TRAILER;
    rescale();
    requestAnimationFrame(function () { rescale(); box.classList.add('on'); });
    if (withSound) soundStart();
  }
  function collapse() {
    state = 'pill';
    soundStop();
    box.classList.remove('on', 'big');
    bSize.textContent = 'Enlarge';
    setTimeout(function () { if (state === 'pill') { box.hidden = true; iframe.src = 'about:blank'; } }, 320);
    pill.hidden = false;
    requestAnimationFrame(function () { pill.classList.add('on'); });
    remember();
  }
  function showPillOnly() {
    state = 'pill';
    pill.hidden = false;
    requestAnimationFrame(function () { pill.classList.add('on'); });
  }

  bSnd.addEventListener('click', function () { soundOn ? soundStop() : soundStart(); });
  bSize.addEventListener('click', function () {
    var big = box.classList.toggle('big');
    bSize.textContent = big ? 'Shrink' : 'Enlarge';
    bSize.setAttribute('aria-label', big ? 'Shrink trailer' : 'Enlarge trailer');
    setTimeout(rescale, 320);
  });
  bMin.addEventListener('click', collapse);
  pill.addEventListener('click', function () { open(hasAudio); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state === 'open') collapse(); });

  window.addEventListener('message', function (ev) {
    if (ev.origin !== location.origin || ev.source !== iframe.contentWindow) return;
    var m = ev.data; if (!m || !m.cif) return;
    if (m.cif === 'ready') {
      ready = true;
      if (hasAudio) post({ cif: 'duration', d: audio.duration });
      if (pendingStart) { pendingStart = false; post({ cif: 'audio-start', t: audio.currentTime }); startPump(); }
    } else if (m.cif === 'done' && state === 'open') {
      setTimeout(function () { if (state === 'open') collapse(); }, 1200);
    }
  });

  /* ---------- boot: after the page has fully loaded, so the homepage is never slowed down ---------- */
  function boot() {
    document.body.appendChild(box);
    document.body.appendChild(pill);
    initAudio();
    if (reduceMotion || seen) { showPillOnly(); return; }
    setTimeout(function () { open(false); remember(); }, 900);
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
