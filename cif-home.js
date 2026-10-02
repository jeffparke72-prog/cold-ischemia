/* Cold Ischemia Foundation — guarantees a way back to the homepage on pages that don't carry the main nav.
   Adds a small fixed "Home" button (not shown inside iframes, on the homepage, or where the main nav / a Home link exists). */
(function () {
  'use strict';
  if (window.self !== window.top) return;
  var p = location.pathname.replace(/\/+$/, '');
  if (p === '' || /\/index\.html$/.test(p)) return;
  if (document.querySelector('nav.cifnav') || document.getElementById('cif-home')) return;
  var a = document.createElement('a');
  a.id = 'cif-home'; a.href = 'index.html'; a.setAttribute('aria-label', 'Cold Ischemia Foundation home');
  a.innerHTML = '<span aria-hidden="true">←</span> Home';
  a.style.cssText = 'position:fixed;top:12px;left:12px;z-index:2147483000;display:inline-flex;gap:6px;align-items:center;padding:9px 15px;font:600 11px/1 "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;color:#e8b84a;background:rgba(3,5,9,.92);border:1px solid rgba(200,144,42,.65);border-radius:999px;box-shadow:0 4px 18px rgba(0,0,0,.45)';
  document.body.appendChild(a);
})();
