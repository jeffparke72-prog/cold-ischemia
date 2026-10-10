/* Cold Ischemia Foundation — homepage exit-intent pop-up.

   WHEN IT APPEARS
   - It arms itself after the visitor has been on the page for 10 seconds.
   - Once armed, it opens the first time the visitor tries to leave:
       * desktop: the pointer leaves the top of the window (toward the tab bar, address bar or Back button);
       * any device: the visitor clicks a link that would take this tab to another page.
         That click is held, the pop-up plays, and the visitor is sent on to the page they chose when it closes.
   - It stays up for exactly 10 seconds, then closes by itself. X, Escape, "No thanks" and the backdrop close it sooner.
   - Once per browser session. It never opens over the introduction pop-up (cif-intro-popup.js).

   WHAT IT DOES
   - A 2-second build-up ("WAIT."), then a drop: photo, four book covers, headline and the link to the library.
   - A short synthesized score (no audio file) builds, drops on the same beat as the picture, and fades out at 10 s.
     Browsers only allow sound after the visitor has clicked, tapped or pressed a key somewhere on the page; if none has
     happened yet the pop-up runs silently and shows a SOUND ON button.

   TESTING:  index.html?exitpopup=now   opens it immediately (ignores the once-per-session rule).
             index.html?exitpopup=1     ignores the once-per-session rule but keeps the 10-second arming and exit triggers.
   TO REMOVE: delete the <script src="cif-exit-popup.js"> line from index.html.
   LIBRARY LINK: change LIBRARY below. Images live in exit-assets/. */
(function () {
  'use strict';
  if (window.__cifExit) return;
  window.__cifExit = true;

  var LIBRARY = 'https://payhip.com/coldischemia';
  var ARM_AFTER_MS = 10000;      /* visitor must be on the page this long before an exit can trigger it */
  var SHOW_FOR_MS = 10000;       /* how long it stays up */
  var DROP_AT_S = 2.0;           /* the beat drop, in seconds after it opens */
  var KEY = 'cifExitSeen';
  var A = 'exit-assets/';

  var qs = '';
  try { qs = new URLSearchParams(location.search).get('exitpopup') || ''; } catch (e) {}
  var forced = qs === '1' || qs === 'now';
  var seen = false;
  try { seen = !forced && sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  if (seen) return;

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ------------------------------------------------------------ styles */
  var css = `
.xp,.xp *{box-sizing:border-box}
.xp{position:fixed;inset:0;z-index:2100;display:flex;align-items:center;justify-content:center;padding:12px;font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;opacity:0;transition:opacity .3s ease}
.xp[hidden]{display:none}
.xp.on{opacity:1}
.xp-back{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(40,20,4,.82),rgba(2,3,6,.95) 70%);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}
.xp-card{position:relative;width:min(1000px,100%);height:min(660px,calc(100vh - 24px));background:linear-gradient(160deg,#07101b 0%,#030509 55%,#0d0803 100%);border:1px solid rgba(232,184,74,.55);border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.6),0 40px 120px rgba(0,0,0,.85),0 0 90px rgba(255,138,31,.18);display:flex;flex-direction:column;color:#efe6d8}
.xp-glow{position:absolute;left:50%;top:46%;width:760px;height:760px;margin:-380px 0 0 -380px;background:radial-gradient(circle,rgba(255,150,40,.42) 0%,rgba(255,110,20,.16) 38%,rgba(0,0,0,0) 68%);opacity:0;transition:opacity .4s}
.xp-rays{position:absolute;left:50%;top:46%;width:1500px;height:1500px;margin:-750px 0 0 -750px;background:repeating-conic-gradient(from 0deg,rgba(255,170,60,.10) 0 6deg,rgba(0,0,0,0) 6deg 18deg);-webkit-mask:radial-gradient(circle,#000 0,rgba(0,0,0,.0) 62%);mask:radial-gradient(circle,#000 0,rgba(0,0,0,0) 62%);opacity:0;animation:xpSpin 40s linear infinite}
.xp-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(25,195,230,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(25,195,230,.07) 1px,transparent 1px);background-size:44px 44px;-webkit-mask:radial-gradient(ellipse at 50% 50%,#000 0,transparent 75%);mask:radial-gradient(ellipse at 50% 50%,#000 0,transparent 75%);opacity:.7}
.xp-x{position:absolute;right:12px;top:12px;z-index:30;width:38px;height:38px;border-radius:50%;border:1px solid rgba(239,230,216,.35);background:rgba(3,5,9,.6);color:#efe6d8;font-size:18px;line-height:1;cursor:pointer}
.xp-x:hover,.xp-x:focus-visible{background:#e8b84a;border-color:#e8b84a;color:#030509;outline:none}
.xp-snd{position:absolute;left:12px;top:12px;z-index:30;height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(239,230,216,.35);background:rgba(3,5,9,.6);color:#efe6d8;font:500 10px "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px;text-transform:uppercase;cursor:pointer}
.xp-snd:hover,.xp-snd:focus-visible{background:#e8b84a;border-color:#e8b84a;color:#030509;outline:none}
.xp-snd.cta{animation:xpPulse 1.4s ease-in-out infinite;border-color:#e8b84a;color:#e8b84a}
/* build-up */
.xp-pre{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none}
.xp-wait{font:900 clamp(84px,19vw,230px)/1 "Playfair Display",Georgia,serif;letter-spacing:4px;color:#ffb347;text-shadow:0 0 40px rgba(255,140,30,.75),0 0 120px rgba(255,100,0,.55);animation:xpShake .09s linear infinite,xpWaitIn 2s ease-in forwards}
.xp-prel{margin-top:10px;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#19c3e6;animation:xpBlink .5s steps(2) infinite}
.xp-scan{position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(25,195,230,.9),transparent);box-shadow:0 0 18px rgba(25,195,230,.9);animation:xpScan 1s linear infinite}
.xp.drop .xp-pre{display:none}
/* main layout */
.xp-main{position:relative;z-index:10;flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:26px 22px 38px;opacity:0}
.xp.drop .xp-main{opacity:1}
.xp.drop .xp-glow,.xp.drop .xp-rays{opacity:1}
.xp.drop .xp-glow{animation:xpBeat .5s ease-out infinite}
.xp-top{text-align:center}
.xp-eyebrow{font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#19c3e6;margin:0 0 8px}
.xp-h{font:900 clamp(26px,5.2vw,52px)/1.04 "Playfair Display",Georgia,serif;margin:0;letter-spacing:.5px;text-transform:uppercase;background:linear-gradient(100deg,#fff2d6 0%,#ffc258 35%,#ff8a1f 60%,#ffd98f 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;background-size:220% 100%}
.xp.drop .xp-h{animation:xpSlam .55s cubic-bezier(.2,1.6,.3,1) both,xpSheen 3s linear .6s infinite}
.xp-sub{margin:10px auto 0;max-width:640px;font-size:clamp(11px,1.45vw,14px);line-height:1.6;color:rgba(239,230,216,.82);letter-spacing:.4px}
.xp-stage{position:relative;flex:1;min-height:0;width:100%;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:clamp(8px,2.2vw,28px);padding:8px 0}
.xp-col{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,1.6vw,16px);min-height:0}
.xp-book{display:block;width:clamp(80px,min(12vw,17vh),128px);aspect-ratio:288/422;height:auto;border-radius:4px;box-shadow:0 14px 34px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.14),0 0 28px rgba(255,150,40,.25);opacity:0;object-fit:cover;background:#111}
.xp-book.l1{--r:-6deg}.xp-book.l2{--r:4deg}.xp-book.r1{--r:5deg}.xp-book.r2{--r:-4deg}
.xp.drop .xp-book{animation:xpBook .7s cubic-bezier(.2,1.5,.35,1) both,xpFloat 3.4s ease-in-out 1s infinite}
.xp.drop .xp-book.l1{animation-delay:.05s,1s}.xp.drop .xp-book.r1{animation-delay:.15s,1.4s}.xp.drop .xp-book.l2{animation-delay:.25s,1.8s}.xp.drop .xp-book.r2{animation-delay:.35s,2.2s}
.xp-me{position:relative;width:clamp(130px,min(22vw,26vh),236px);aspect-ratio:2/3;opacity:0}
.xp.drop .xp-me{animation:xpPhoto .75s cubic-bezier(.2,1.4,.3,1) both}
.xp-me:before{content:"";position:absolute;inset:-6px;border-radius:14px;background:conic-gradient(from 0deg,#ff8a1f,#19c3e6,#ffd98f,#ff8a1f);animation:xpHue 4s linear infinite}
.xp-me img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 14%;border-radius:10px;border:2px solid #030509}
.xp-me figcaption{position:absolute;left:0;right:0;bottom:0;padding:34px 8px 9px;border-radius:0 0 10px 10px;background:linear-gradient(transparent,rgba(3,5,9,.92));text-align:center;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#ffd98f}
.xp-me figcaption b{display:block;font:700 15px "Playfair Display",Georgia,serif;letter-spacing:.5px;text-transform:none;color:#fff;margin-bottom:2px}
.xp-shock{position:absolute;left:50%;top:46%;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;border:3px solid #ffd98f;opacity:0;z-index:25;pointer-events:none}
.xp.drop .xp-shock{animation:xpShock .9s ease-out both}
.xp-flash{position:absolute;inset:0;background:#fff;opacity:0;z-index:40;pointer-events:none}
.xp.drop .xp-flash{animation:xpFlash .5s ease-out both}
/* call to action + countdown */
.xp-bottom{width:100%;display:flex;flex-direction:column;align-items:center;gap:9px}
.xp-go{position:relative;display:inline-flex;align-items:center;gap:12px;padding:16px 34px;border-radius:999px;background:linear-gradient(100deg,#ffb347,#ff8a1f);color:#1a0d00;text-decoration:none;font:700 clamp(12px,1.9vw,16px) "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:3px;text-transform:uppercase;box-shadow:0 12px 40px rgba(255,120,20,.55);opacity:0;overflow:hidden}
.xp.drop .xp-go{animation:xpRise .5s ease-out .5s both,xpPulse 1.1s ease-in-out 1.1s infinite}
.xp-go:after{content:"";position:absolute;top:0;bottom:0;width:60px;left:-80px;background:linear-gradient(100deg,transparent,rgba(255,255,255,.7),transparent);transform:skewX(-20deg);animation:xpGlint 2.2s ease-in-out 1.2s infinite}
.xp-go:hover,.xp-go:focus-visible{filter:brightness(1.12);outline:2px solid #fff;outline-offset:3px}
.xp-meta{display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(239,230,216,.6)}
.xp-no{background:none;border:0;padding:6px 4px;font:inherit;letter-spacing:2px;text-transform:uppercase;color:rgba(239,230,216,.75);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.xp-no:hover,.xp-no:focus-visible{color:#ffd98f;outline:none}
.xp-bar{position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(255,255,255,.08);z-index:30}
.xp-bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#19c3e6,#ffb347,#ff8a1f);transform-origin:0 50%;animation:xpBar ${SHOW_FOR_MS}ms linear forwards}

.xp-fx{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .6s}
.xp.drop .xp-fx{opacity:1}
.xp-wm{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);white-space:nowrap;font:900 clamp(120px,24vw,300px)/1 "Playfair Display",Georgia,serif;letter-spacing:6px;color:transparent;-webkit-text-stroke:2px rgba(255,170,60,.22);opacity:0;translate:calc(var(--mx,0) * -26px) calc(var(--my,0) * -16px);pointer-events:none;user-select:none}
.xp.drop .xp-wm{animation:xpWm 1.2s ease-out .1s both}
.xp-hud{position:absolute;width:34px;height:34px;border:0 solid #19c3e6;opacity:0;z-index:12}
.xp-hud.a{left:88px;top:12px;border-top-width:2px;border-left-width:2px}.xp-hud.b{right:58px;top:12px;border-top-width:2px;border-right-width:2px}
.xp-hud.c{left:12px;bottom:36px;border-bottom-width:2px;border-left-width:2px}.xp-hud.d{right:12px;bottom:36px;border-bottom-width:2px;border-right-width:2px}
.xp.drop .xp-hud{animation:xpRise .5s ease-out .2s both}
.xp-vt{position:absolute;top:50%;z-index:12;font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(25,195,230,.75);white-space:nowrap;opacity:0}
.xp-vt{writing-mode:vertical-rl;margin-top:-90px}
.xp-vt.l{left:16px;transform:rotate(180deg)}
.xp-vt.r{right:16px}
.xp.drop .xp-vt{animation:xpFade .6s ease-out .6s both}
.xp-ecg{position:absolute;left:0;right:0;top:46%;width:100%;height:120px;margin-top:-60px;opacity:0;pointer-events:none;z-index:5}
.xp.drop .xp-ecg{opacity:.75;transition:opacity .6s .4s}
.xp-ecg path{fill:none;stroke:#19c3e6;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:260 740;filter:drop-shadow(0 0 6px #19c3e6);animation:xpEcg 2s linear infinite}
.xp-ecg path.g{stroke:rgba(25,195,230,.18);stroke-dasharray:none;animation:none;filter:none}
.xp-links{position:absolute;inset:0;width:100%;height:100%;z-index:6;pointer-events:none;overflow:visible}
.xp-links line{stroke:rgba(255,190,90,.55);stroke-width:1.4;stroke-dasharray:5 7;animation:xpDash 1.2s linear infinite}
.xp-links circle{fill:#ffb347;filter:drop-shadow(0 0 5px #ffb347)}
.xp-orbit{position:absolute;inset:-26px;border-radius:50%;border:1px dashed rgba(25,195,230,.55);animation:xpSpin 18s linear infinite;pointer-events:none}
.xp-orbit:before,.xp-orbit:after{content:"";position:absolute;width:9px;height:9px;border-radius:50%;background:#19c3e6;box-shadow:0 0 12px #19c3e6;left:50%;top:-5px}
.xp-orbit:after{top:auto;bottom:-5px;background:#ffb347;box-shadow:0 0 12px #ffb347}
.xp-ticker{position:absolute;left:0;right:0;bottom:5px;height:24px;overflow:hidden;z-index:12;border-top:1px solid rgba(255,179,71,.28);background:rgba(3,5,9,.55);opacity:0}
.xp.drop .xp-ticker{opacity:1;transition:opacity .5s .5s}
.xp-ticker div{display:inline-block;white-space:nowrap;padding-left:100%;line-height:24px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#ffd98f;animation:xpTick 22s linear infinite}
.xp-chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}
.xp-chips span{padding:6px 12px;border:1px solid rgba(255,179,71,.55);border-radius:3px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#ffd98f;background:rgba(255,138,31,.1)}
.xp-chips span:first-child{border-color:#19c3e6;color:#19c3e6;background:rgba(25,195,230,.08)}
.xp-h{position:relative}
.xp.drop .xp-h:before,.xp.drop .xp-h:after{content:attr(data-t);position:absolute;left:0;right:0;top:0;opacity:0;pointer-events:none;-webkit-text-fill-color:currentColor;background:none}
.xp.drop .xp-h:before{color:#19c3e6;animation:xpGlitch 3.2s steps(1) 1s infinite}
.xp.drop .xp-h:after{color:#ff3d6e;animation:xpGlitch 3.2s steps(1) 1.04s infinite reverse}
.xp-book{translate:calc(var(--mx,0) * var(--d,10) * 1px) calc(var(--my,0) * var(--d,10) * .6px);-webkit-box-reflect:below 3px linear-gradient(transparent 72%,rgba(255,255,255,.2))}
.xp-book.l1{--d:-14}.xp-book.l2{--d:-8}.xp-book.r1{--d:14}.xp-book.r2{--d:8}
.xp-me{translate:calc(var(--mx,0) * 6px) calc(var(--my,0) * 4px)}
.xp-rays{translate:calc(var(--mx,0) * 10px) calc(var(--my,0) * 8px)}
@keyframes xpFade{0%{opacity:0}100%{opacity:1}}
@keyframes xpWm{0%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes xpEcg{to{stroke-dashoffset:-1000}}
@keyframes xpDash{to{stroke-dashoffset:-24}}
@keyframes xpTick{to{transform:translateX(-100%)}}
@keyframes xpGlitch{0%,92%,100%{opacity:0;transform:none}93%{opacity:.8;transform:translate(-4px,1px)}95%{opacity:.8;transform:translate(5px,-2px)}97%{opacity:.8;transform:translate(-2px,2px)}}
@media(max-width:700px){.xp-vt,.xp-links,.xp-wm{display:none}.xp-hud.a{left:84px}.xp-chips span{padding:5px 8px;letter-spacing:2px}}
@media(max-height:560px){.xp-chips{display:none}}

 
.xp-tile{position:relative;width:clamp(120px,17vw,176px);padding:12px 12px 11px;border:1px solid rgba(255,179,71,.45);border-radius:8px;background:linear-gradient(145deg,rgba(255,138,31,.16),rgba(25,195,230,.07));box-shadow:0 10px 30px rgba(0,0,0,.5),inset 0 0 20px rgba(255,170,60,.08);opacity:0;display:grid;grid-template-columns:30px 1fr;column-gap:10px;align-items:center;text-align:left;overflow:hidden}
.xp-tile svg{grid-row:1/3;width:30px;height:30px;fill:none;stroke:#ffb347;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 6px rgba(255,170,60,.8))}
.xp-tile b{font:700 12px "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px;text-transform:uppercase;color:#fff}
.xp-tile span{font-size:9px;letter-spacing:1px;color:rgba(239,230,216,.65)}
.xp-tile:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(#19c3e6,#ff8a1f)}
.xp-col:last-of-type .xp-tile svg{stroke:#19c3e6;filter:drop-shadow(0 0 6px rgba(25,195,230,.8))}
.xp.drop .xp-tile{animation:xpTile .6s cubic-bezier(.2,1.4,.3,1) both,xpFloat2 4s ease-in-out 1s infinite}
.xp.drop .xp-col:first-child .xp-tile:nth-child(1){animation-delay:.1s,1s}.xp.drop .xp-col:first-child .xp-tile:nth-child(2){animation-delay:.22s,1.4s}.xp.drop .xp-col:first-child .xp-tile:nth-child(3){animation-delay:.34s,1.8s}
.xp.drop .xp-col:nth-child(3) .xp-tile:nth-child(1){animation-delay:.16s,1.2s}.xp.drop .xp-col:nth-child(3) .xp-tile:nth-child(2){animation-delay:.28s,1.6s}.xp.drop .xp-col:nth-child(3) .xp-tile:nth-child(3){animation-delay:.4s,2s}
.xp-col:first-child .xp-tile{--sx:-80px}.xp-col:nth-child(3) .xp-tile{--sx:80px}
.xp-eq{position:absolute;left:6%;right:6%;bottom:0;height:70px;display:flex;align-items:flex-end;gap:4px;opacity:0;z-index:2;pointer-events:none}
.xp.drop .xp-eq{opacity:.55;transition:opacity .6s .5s}
.xp-eq i{flex:1;background:linear-gradient(#19c3e6,#ff8a1f);border-radius:2px 2px 0 0;height:20%;animation:xpEq .5s ease-in-out infinite alternate}
@keyframes xpTile{0%{opacity:0;transform:translateX(var(--sx,0)) scale(.7)}100%{opacity:1;transform:none}}
@keyframes xpFloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes xpEq{to{height:100%}}
@media(max-width:700px){.xp-stage{grid-template-columns:repeat(3,1fr)}.xp-col{display:contents}.xp-tile{width:100%;grid-template-columns:1fr;row-gap:2px;padding:8px 6px;text-align:center;justify-items:center}.xp-tile svg{grid-row:auto;width:22px;height:22px}.xp-tile span{display:none}.xp-tile b{font-size:8px;letter-spacing:1px}.xp-eq{height:40px}}

@keyframes xpSpin{to{transform:rotate(360deg)}}
@keyframes xpHue{to{filter:hue-rotate(360deg)}}
@keyframes xpShake{0%{transform:translate(0,0)}25%{transform:translate(2px,-2px)}50%{transform:translate(-3px,1px)}75%{transform:translate(1px,3px)}100%{transform:translate(0,0)}}
@keyframes xpWaitIn{0%{opacity:0;transform:scale(.7)}25%{opacity:1}100%{opacity:1;transform:scale(1.18)}}
@keyframes xpBlink{50%{opacity:.2}}
@keyframes xpScan{0%{top:-4%}100%{top:104%}}
@keyframes xpFlash{0%{opacity:.95}100%{opacity:0}}
@keyframes xpShock{0%{transform:scale(.1);opacity:.95}100%{transform:scale(6);opacity:0}}
@keyframes xpBeat{0%{transform:scale(1.07);opacity:1}100%{transform:scale(1);opacity:.78}}
@keyframes xpSlam{0%{transform:scale(2.6);opacity:0;letter-spacing:14px}100%{transform:none;opacity:1;letter-spacing:.5px}}
@keyframes xpSheen{to{background-position:-220% 0}}
@keyframes xpBook{0%{opacity:0;transform:translateY(60px) scale(1.5) rotate(calc(var(--r) * 3))}100%{opacity:1;transform:rotate(var(--r))}}
@keyframes xpFloat{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-9px) rotate(var(--r))}}
@keyframes xpPhoto{0%{opacity:0;transform:scale(.55);filter:blur(10px)}100%{opacity:1;transform:none;filter:none}}
@keyframes xpRise{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:none}}
@keyframes xpPulse{0%,100%{box-shadow:0 12px 40px rgba(255,120,20,.55),0 0 0 0 rgba(255,170,60,.7)}50%{box-shadow:0 12px 40px rgba(255,120,20,.55),0 0 0 16px rgba(255,170,60,0)}}
@keyframes xpGlint{0%{left:-80px}60%,100%{left:120%}}
@keyframes xpBar{to{transform:scaleX(0)}}
@media(max-width:700px){
  .xp{padding:6px}
  .xp-card{height:calc(100vh - 12px);height:calc(100dvh - 12px)}
  .xp-main{padding:50px 12px 36px}
  .xp-stage{display:grid;gap:8px;align-content:center;align-items:start}
  .xp-col{display:contents}
  .xp-me{grid-column:1/-1;order:-1;justify-self:center;width:clamp(130px,44vw,190px)}
  .xp-eyebrow{letter-spacing:4px}
  .xp-go{padding:14px 22px;letter-spacing:2px}
}
@media(max-width:700px) and (max-height:700px){.xp-sub{display:none}.xp-me{width:104px}}
@media(max-height:560px) and (min-width:701px){.xp-sub{display:none}.xp-main{padding-top:14px}}
@media(prefers-reduced-motion:reduce){
  .xp,.xp *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition:none!important}
  .xp-rays,.xp-orbit,.xp-ticker div,.xp-ecg path,.xp-links line,.xp-eq i,.xp-tile{animation:none!important}.xp-me:before{animation:none!important}
  .xp-bar i{animation:xpBar ${SHOW_FOR_MS}ms linear forwards!important}
}`;

  /* ------------------------------------------------------------ markup */
  var root = document.createElement('div');
  root.className = 'xp';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'xp-title');
  root.innerHTML = `
<div class="xp-back" data-close></div>
<div class="xp-card">
  <div class="xp-grid"></div><div class="xp-rays"></div><div class="xp-glow"></div><canvas class="xp-fx"></canvas><div class="xp-wm" aria-hidden="true">LIBRARY</div>
  <svg class="xp-ecg" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true"><path class="g" d="M0 60H330l12-8 10 8h20l14-44 18 86 16-70 12 28h30H640l12-8 10 8h20l14-44 18 86 16-70 12 28H1000"/><path d="M0 60H330l12-8 10 8h20l14-44 18 86 16-70 12 28h30H640l12-8 10 8h20l14-44 18 86 16-70 12 28H1000"/></svg>
  <i class="xp-hud a"></i><i class="xp-hud b"></i><i class="xp-hud c"></i><i class="xp-hud d"></i><span class="xp-vt l" aria-hidden="true">Cold Ischemia Foundation &middot; Library</span><span class="xp-vt r" aria-hidden="true">Toolkits &middot; Playbooks &middot; Guides</span>
  <button type="button" class="xp-snd" hidden>Sound on</button>
  <button type="button" class="xp-x" aria-label="Close" data-close>&times;</button>
  <div class="xp-pre" aria-hidden="true"><div class="xp-scan"></div><div class="xp-wait">WAIT.</div><div class="xp-prel">Before you go</div></div>
  <div class="xp-main">
    <div class="xp-top">
      <p class="xp-eyebrow">Before you go</p>
      <h2 class="xp-h" id="xp-title" data-t="The toolkit is waiting">The toolkit is waiting</h2>
      <p class="xp-sub">Toolkits, playbooks and guides for patients, care partners and families, written by someone who has lived this system.</p>
      <div class="xp-chips" aria-hidden="true"><span>Exit detected</span><span>Toolkits</span><span>1 library</span></div>
    </div>
    <div class="xp-stage">
      <div class="xp-col"><div class="xp-tile"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg><b>Toolkits</b><span>Step by step</span></div><div class="xp-tile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6c-2-1.5-5-2-8-2v13c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v13"/></svg><b>Playbooks</b><span>Plans you can use</span></div><div class="xp-tile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg><b>Guides</b><span>Find your way</span></div></div>
      <figure class="xp-me" style="margin:0"><i class="xp-orbit"></i><img src="${A}jeff.jpg" alt="Jeff Parke, founder of the Cold Ischemia Foundation" width="640" height="960"><figcaption><b>Jeff A. Parke</b>Founder &middot; Cold Ischemia Foundation</figcaption></figure>
      <div class="xp-col"><div class="xp-tile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><b>Patients</b><span>Dialysis &amp; CKD</span></div><div class="xp-tile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 1.5 6 5.5"/></svg><b>Care partners</b><span>Beside the patient</span></div><div class="xp-tile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7v9H3zM10 20v-6h4v6"/></svg><b>Families</b><span>Together</span></div></div>
      <div class="xp-eq" aria-hidden="true"><i style="animation-delay:-0.00s;animation-duration:0.38s"></i><i style="animation-delay:-0.04s;animation-duration:0.45s"></i><i style="animation-delay:-0.07s;animation-duration:0.52s"></i><i style="animation-delay:-0.11s;animation-duration:0.59s"></i><i style="animation-delay:-0.15s;animation-duration:0.66s"></i><i style="animation-delay:-0.18s;animation-duration:0.38s"></i><i style="animation-delay:-0.22s;animation-duration:0.45s"></i><i style="animation-delay:-0.26s;animation-duration:0.52s"></i><i style="animation-delay:-0.30s;animation-duration:0.59s"></i><i style="animation-delay:-0.33s;animation-duration:0.66s"></i><i style="animation-delay:-0.37s;animation-duration:0.38s"></i><i style="animation-delay:-0.41s;animation-duration:0.45s"></i><i style="animation-delay:-0.44s;animation-duration:0.52s"></i><i style="animation-delay:-0.48s;animation-duration:0.59s"></i><i style="animation-delay:-0.52s;animation-duration:0.66s"></i><i style="animation-delay:-0.55s;animation-duration:0.38s"></i><i style="animation-delay:-0.59s;animation-duration:0.45s"></i><i style="animation-delay:-0.63s;animation-duration:0.52s"></i><i style="animation-delay:-0.67s;animation-duration:0.59s"></i><i style="animation-delay:-0.70s;animation-duration:0.66s"></i><i style="animation-delay:-0.74s;animation-duration:0.38s"></i><i style="animation-delay:-0.78s;animation-duration:0.45s"></i><i style="animation-delay:-0.81s;animation-duration:0.52s"></i><i style="animation-delay:-0.85s;animation-duration:0.59s"></i><i style="animation-delay:-0.89s;animation-duration:0.66s"></i><i style="animation-delay:-0.02s;animation-duration:0.38s"></i><i style="animation-delay:-0.06s;animation-duration:0.45s"></i><i style="animation-delay:-0.10s;animation-duration:0.52s"></i><i style="animation-delay:-0.14s;animation-duration:0.59s"></i><i style="animation-delay:-0.17s;animation-duration:0.66s"></i><i style="animation-delay:-0.21s;animation-duration:0.38s"></i><i style="animation-delay:-0.25s;animation-duration:0.45s"></i><i style="animation-delay:-0.28s;animation-duration:0.52s"></i><i style="animation-delay:-0.32s;animation-duration:0.59s"></i><i style="animation-delay:-0.36s;animation-duration:0.66s"></i><i style="animation-delay:-0.39s;animation-duration:0.38s"></i><i style="animation-delay:-0.43s;animation-duration:0.45s"></i><i style="animation-delay:-0.47s;animation-duration:0.52s"></i><i style="animation-delay:-0.51s;animation-duration:0.59s"></i><i style="animation-delay:-0.54s;animation-duration:0.66s"></i><i style="animation-delay:-0.58s;animation-duration:0.38s"></i><i style="animation-delay:-0.62s;animation-duration:0.45s"></i><i style="animation-delay:-0.65s;animation-duration:0.52s"></i><i style="animation-delay:-0.69s;animation-duration:0.59s"></i><i style="animation-delay:-0.73s;animation-duration:0.66s"></i><i style="animation-delay:-0.76s;animation-duration:0.38s"></i><i style="animation-delay:-0.80s;animation-duration:0.45s"></i><i style="animation-delay:-0.84s;animation-duration:0.52s"></i></div>
    </div>
    <div class="xp-bottom">
      <a class="xp-go" href="${LIBRARY}" target="_blank" rel="noopener">Open the library <span aria-hidden="true">&rarr;</span></a>
      <div class="xp-meta"><span class="xp-count" aria-hidden="true">Closing in 10s</span><button type="button" class="xp-no" data-close>No thanks</button></div>
    </div>
  </div>
  <div class="xp-ticker" aria-hidden="true"><div>Toolkits &nbsp;&middot;&nbsp; Playbooks &nbsp;&middot;&nbsp; Field guides &nbsp;&middot;&nbsp; For patients &nbsp;&middot;&nbsp; For care partners &nbsp;&middot;&nbsp; For families &nbsp;&middot;&nbsp; Cold Ischemia Foundation Library &nbsp;&middot;&nbsp; payhip.com/coldischemia</div></div>
  <div class="xp-shock"></div><div class="xp-flash"></div>
  <div class="xp-bar"><i></i></div>
</div>`;

  /* ------------------------------------------------------------ audio (synthesized, 120 bpm, A minor) */
  var ctxA = null, audio = null, muted = false;
  function getCtx() {
    if (ctxA) return ctxA;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctxA = new AC(); } catch (e) { ctxA = null; }
    return ctxA;
  }
  /* sound is only allowed after a click, tap or key press: prepare the context on the first one */
  function unlock() {
    var c = getCtx();
    if (c && c.state === 'suspended') { try { c.resume(); } catch (e) {} }
  }
  ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (n) {
    window.addEventListener(n, unlock, { passive: true });
  });

  function buildScore(c, from) {
    var T0 = c.currentTime - from;
    var master = c.createGain();
    var comp = c.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.2;
    var sat = c.createWaveShaper(), curve = new Float32Array(1024), lim = c.createGain();
    for (var q = 0; q < 1024; q++) { var xq = q / 511.5 - 1; curve[q] = Math.tanh(1.6 * xq) / Math.tanh(1.6); }   /* soft limiter: no digital clipping */
    sat.curve = curve; sat.oversample = '2x'; lim.gain.value = 0.9;
    master.connect(comp); comp.connect(sat); sat.connect(lim); lim.connect(c.destination);
    var now = c.currentTime;
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.7, now + 0.06);
    var fadeStart = Math.max(now + 0.07, T0 + 9.2);
    master.gain.setValueAtTime(0.7, fadeStart);
    master.gain.linearRampToValueAtTime(0, Math.max(fadeStart + 0.05, T0 + 9.95));

    /* shared noise and a dotted-eighth echo for the arpeggio */
    var nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = nb.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var echo = c.createDelay(1); echo.delayTime.value = 0.375;
    var fb = c.createGain(); fb.gain.value = 0.34; var wet = c.createGain(); wet.gain.value = 0.32;
    echo.connect(fb); fb.connect(echo); echo.connect(wet); wet.connect(master);
    var arpBus = c.createGain(); arpBus.connect(master); arpBus.connect(echo);

    function when(t) { return T0 + t; }
    function live(t) { return t >= from - 0.02; }
    function env(g, t, a, peak, dur) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    function osc(type, f, t, dur, peak, o) {
      o = o || {}; t = Math.max(t, c.currentTime);
      var x = c.createOscillator(), g = c.createGain(), out = x;
      x.type = type; x.frequency.setValueAtTime(f, t);
      if (o.to) x.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || dur));
      if (o.detune) x.detune.value = o.detune;
      if (o.lp) { var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; x.connect(lp); out = lp; }
      out.connect(g); g.connect(o.bus || master);
      env(g, t, o.a || 0.005, peak, dur);
      x.start(t); x.stop(t + dur + 0.05);
    }
    function noise(t, dur, peak, o) {
      o = o || {}; t = Math.max(t, c.currentTime);
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = nb; f.type = o.type || 'highpass'; f.frequency.setValueAtTime(o.f || 5000, t);
      if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      if (o.q) f.Q.value = o.q;
      s.connect(f); f.connect(g); g.connect(master);
      env(g, t, o.a || 0.002, peak, dur);
      s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.05);
    }

    /* build-up, 0 to 2 s: rising noise, a climbing saw, accelerating ticks, then a hard cut */
    if (from < DROP_AT_S - 0.1) {
      var rs = c.createBufferSource(), rf = c.createBiquadFilter(), rg = c.createGain();
      rs.buffer = nb; rs.loop = true; rf.type = 'bandpass'; rf.Q.value = 2.2;
      var t0 = c.currentTime;
      rf.frequency.setValueAtTime(300, t0); rf.frequency.exponentialRampToValueAtTime(7500, when(DROP_AT_S - 0.03));
      rg.gain.setValueAtTime(0.0001, t0); rg.gain.linearRampToValueAtTime(0.55, when(DROP_AT_S - 0.05)); rg.gain.linearRampToValueAtTime(0, when(DROP_AT_S - 0.01));
      rs.connect(rf); rf.connect(rg); rg.connect(master); rs.start(t0); rs.stop(when(DROP_AT_S));
      osc('sawtooth', 90, when(0), DROP_AT_S - 0.02, 0.16, { to: 900, glide: DROP_AT_S - 0.05, lp: 1800, a: 0.4 });
      [0, 0.5, 1.0, 1.25, 1.5, 1.625, 1.75, 1.8125, 1.875, 1.9375].forEach(function (tk) { if (live(tk)) noise(when(tk), 0.05, 0.3, { f: 6500 }); });
      osc('sine', 55, when(0), 0.5, 0.35, { a: 0.02 });
    }

    /* the drop at DROP_AT_S: boom, crash, chord stab */
    if (live(DROP_AT_S)) {
      var D = when(DROP_AT_S);
      osc('sine', 120, D, 1.4, 1.0, { to: 38, glide: 0.9, a: 0.003 });
      noise(D, 1.6, 0.55, { f: 2500, to: 9000 });
      [110, 130.81, 164.81, 220, 329.63].forEach(function (f, k) {
        osc('sawtooth', f, D, 0.9, 0.16, { detune: k % 2 ? 7 : -7, lp: 2600, a: 0.004 });
      });
    }

    /* 8 seconds of groove: 4 bars of Am F C G */
    var chords = [
      { root: 55, pad: [110, 130.81, 164.81], arp: [220, 261.63, 329.63, 440] },
      { root: 43.65, pad: [87.31, 130.81, 174.61], arp: [174.61, 220, 261.63, 349.23] },
      { root: 65.41, pad: [130.81, 164.81, 196], arp: [196, 261.63, 329.63, 392] },
      { root: 49, pad: [98, 123.47, 146.83], arp: [196, 246.94, 293.66, 392] }
    ];
    for (var b = 0; b < 16; b++) {
      var tb = DROP_AT_S + b * 0.5, ch = chords[Math.floor(b / 4)];
      if (!live(tb) && !live(tb + 0.25)) continue;
      var T = when(tb);
      if (live(tb)) {
        osc('sine', 150, T, 0.28, 0.95, { to: 44, glide: 0.12, a: 0.002 });                  /* kick */
        osc('sawtooth', ch.root, T, 0.24, 0.28, { lp: 420, a: 0.004 });                       /* bass on the beat */
        if (b % 2 === 1) { noise(T, 0.16, 0.5, { type: 'bandpass', f: 1900, q: 0.8 }); noise(T + 0.012, 0.1, 0.3, { type: 'bandpass', f: 1200, q: 0.8 }); } /* clap */
      }
      if (live(tb + 0.25)) {
        noise(T + 0.25, 0.05, 0.22, { f: 8000 });                                              /* offbeat hat */
        osc('sawtooth', ch.root * (b % 4 === 3 ? 4 : 2), T + 0.25, 0.2, 0.22, { lp: 520, a: 0.004 }); /* bass on the off-beat */
      }
      if (b >= 2) for (var s = 0; s < 4; s++) {                                              /* 16th-note arpeggio after the first bar */
        var ts = tb + s * 0.125;
        if (live(ts)) osc('triangle', ch.arp[[0, 1, 2, 3, 2, 1, 3, 2][(b * 4 + s) % 8]], when(ts), 0.2, 0.17, { bus: arpBus, a: 0.003 });
      }
    }
    for (var k = 0; k < 4; k++) {                                                              /* one pad chord per bar */
      var tp = DROP_AT_S + k * 2;
      if (tp + 2 < from) continue;
      chords[k].pad.forEach(function (f, j) {
        osc('sawtooth', f * 2, Math.max(when(tp), c.currentTime), 2.0, 0.07, { detune: (j - 1) * 9, lp: 1100, a: 0.25 });
      });
    }

    return {
      stop: function () {
        var t = c.currentTime;
        try { master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 0.12); } catch (e) {}
        setTimeout(function () { try { master.disconnect(); } catch (e) {} }, 400);
      }
    };
  }


  /* ------------------------------------------------------------ graphics: embers, links, parallax */
  var fxRaf = 0, fxOn = false, dropT = 0;
  function startFx() {
    var cv = root.querySelector('.xp-fx'), card = root.querySelector('.xp-card');
    var g = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0, P = [];
    function size() { W = card.clientWidth; H = card.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size();
    var n = reduceMotion ? 0 : (W < 700 ? 34 : 70);
    for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: -.15 - Math.random() * .5, r: .8 + Math.random() * 2, h: Math.random() < .3 ? 190 : 32 });
    fxOn = true;
    function frame() {
      if (!fxOn) return;
      var beat = dropT ? ((performance.now() - dropT) / 1000 % .5) / .5 : 1;       /* 0 on the beat, 1 just before the next */
      g.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var a = P[i]; a.x += a.vx; a.y += a.vy;
        if (a.y < -6) { a.y = H + 6; a.x = Math.random() * W; } if (a.x < -6) a.x = W + 6; if (a.x > W + 6) a.x = -6;
        g.beginPath(); g.fillStyle = 'hsla(' + a.h + ',100%,65%,' + (.35 + .5 * (1 - beat)) + ')'; g.arc(a.x, a.y, a.r * (1 + .7 * (1 - beat)), 0, 6.283); g.fill();
        for (var j = i + 1; j < P.length; j++) {
          var b = P[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < 9000) { g.strokeStyle = 'rgba(25,195,230,' + (.22 * (1 - d / 9000)) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        }
      }
      fxRaf = requestAnimationFrame(frame);
    }
    frame();
  }
  function stopFx() { fxOn = false; cancelAnimationFrame(fxRaf); dropT = 0; }
  function drawLinks() {
    var svg = root.querySelector('.xp-links'), st = root.querySelector('.xp-stage');
    if (!svg || window.innerWidth <= 700) return;
    var sb = st.getBoundingClientRect(), m = root.querySelector('.xp-me').getBoundingClientRect();
    var cx = m.left + m.width / 2 - sb.left, cy = m.top + m.height / 2 - sb.top, h = '';
    ['l1', 'l2', 'r1', 'r2'].forEach(function (k) {
      var r = root.querySelector('.xp-book.' + k).getBoundingClientRect();
      var x = r.left + r.width / 2 - sb.left, y = r.top + r.height / 2 - sb.top;
      h += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/><circle cx="' + x + '" cy="' + y + '" r="4"/>';
    });
    svg.innerHTML = h;
  }
  function onMove(e) {
    var r = root.querySelector('.xp-card').getBoundingClientRect();
    root.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    root.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  }

  /* ------------------------------------------------------------ behaviour */
  var openedAt = 0, timers = [], pendingHref = null, lastFocus = null, shown = false;
  var sndBtn, countEl, goEl;

  function elapsed() { return (performance.now() - openedAt) / 1000; }
  function startAudio() {
    var c = getCtx(); if (!c || muted) return false;
    var e = elapsed(); if (e > 9.2) return false;
    if (c.state === 'suspended') { try { c.resume(); } catch (x) {} }
    if (c.state !== 'running') return false;
    if (audio) audio.stop();
    audio = buildScore(c, e);
    return true;
  }
  function syncSoundButton() {
    var c = ctxA;
    var playing = !!audio && !muted && c && c.state === 'running';
    sndBtn.hidden = false;
    sndBtn.textContent = playing ? 'Mute' : 'Sound on';
    sndBtn.classList.toggle('cta', !playing && !muted);
  }

  function open(href) {
    if (shown) return;
    var intro = document.querySelector('.cifp');
    if (intro && !intro.hidden) return;              /* never over the introduction pop-up */
    shown = true; pendingHref = href || null;
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    lastFocus = document.activeElement;
    document.body.appendChild(root);
    root.hidden = false;
    sndBtn = root.querySelector('.xp-snd'); countEl = root.querySelector('.xp-count'); goEl = root.querySelector('.xp-go');
    openedAt = performance.now();
    requestAnimationFrame(function () { root.classList.add('on'); });
    startFx();
    if (!reduceMotion) root.addEventListener('mousemove', onMove);
    function doDrop() { root.classList.add('drop'); dropT = performance.now(); }
    if (reduceMotion) doDrop(); else timers.push(setTimeout(doDrop, DROP_AT_S * 1000));
    if (reduceMotion) { /* no build-up and no strobing; the score still plays unless muted */ }
    startAudio();
    syncSoundButton();
    timers.push(setInterval(function () {
      var left = Math.max(0, Math.ceil((SHOW_FOR_MS / 1000) - elapsed()));
      countEl.textContent = 'Closing in ' + left + 's';
      syncSoundButton();
    }, 250));
    timers.push(setTimeout(function () { close(); }, SHOW_FOR_MS));
    setTimeout(function () { try { goEl.focus({ preventScroll: true }); } catch (e) {} }, reduceMotion ? 50 : DROP_AT_S * 1000 + 700);
  }

  function close() {
    if (root.hidden) return;
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = [];
    if (audio) { audio.stop(); audio = null; }
    stopFx(); root.removeEventListener('mousemove', onMove);
    root.classList.remove('on');
    var go = pendingHref; pendingHref = null;
    setTimeout(function () {
      root.hidden = true; root.classList.remove('drop');
      if (root.parentNode) root.parentNode.removeChild(root);
      if (go) { location.href = go; return; }
      try { if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
    }, 320);
  }

  function wire() {
    var st = document.createElement('style'); st.id = 'xp-style'; st.textContent = css; document.head.appendChild(st);
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) close();
      else if (e.target.closest('.xp-snd')) {
        if (audio && !muted && ctxA && ctxA.state === 'running') { muted = true; audio.stop(); audio = null; }
        else { muted = false; unlock(); startAudio(); }
        syncSoundButton();
      } else if (e.target.closest('.xp-go')) { pendingHref = null; }   /* the visitor chose the library: do not redirect afterwards */
    });
    document.addEventListener('keydown', function (e) {
      if (!root.hidden && e.key === 'Escape') close();
      if (!root.hidden && e.key === 'Tab') {          /* keep focus inside the dialog */
        var f = [].filter.call(root.querySelectorAll('button,a[href]'), function (n) { return !n.hidden; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function arm() {
    /* 1. pointer leaves through the top of the window (desktop) */
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) open(null);
    });
    /* 2. a click that would navigate this tab to another page */
    document.addEventListener('click', function (e) {
      if (shown || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || root.contains(a)) return;
      var t = (a.getAttribute('target') || '').toLowerCase();
      if (t && t !== '_self') return;
      if (a.hasAttribute('download')) return;
      var raw = a.getAttribute('href') || '';
      if (/^(#|javascript:|mailto:|tel:|sms:)/i.test(raw)) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin === location.origin && u.pathname === location.pathname && u.search === location.search) return;
      if (/(^|\.)payhip\.com$/i.test(u.hostname)) return;     /* heading to the library already */
      var intro = document.querySelector('.cifp');
      if (intro && !intro.hidden) return;
      e.preventDefault();
      open(a.href);
    }, true);
  }

  function boot() {
    wire();
    if (qs === 'now') { open(null); return; }
    setTimeout(arm, ARM_AFTER_MS);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
