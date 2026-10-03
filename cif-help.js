/* Cold Ischemia Foundation: site-wide "Questions?" button, live chat, and form delivery.
   Loaded on every page with the main navigation (see _tools/build-nav.py).

   SETTINGS: the only lines you ever need to edit.
   formsEndpoint : the Web app URL from cif-forms-apps-script.gs (ends in /exec). Until it is set,
                   questions open the visitor's own email app, addressed to fallbackEmail.
   tawkPropertyId / tawkWidgetId : from your free tawk.to account (Administration > Chat Widget >
                   "Direct Chat Link": https://tawk.to/chat/PROPERTY_ID/WIDGET_ID). When set, visitors
                   can chat live with you when you're online, and leave a message (emailed to you) when
                   you're not. The "Questions?" button is then replaced by the tawk.to chat bubble. */
window.CIF_CONFIG = {
  formsEndpoint: "PASTE_URL_HERE",
  fallbackEmail: "jeffparke72@gmail.com",
  tawkPropertyId: "",
  tawkWidgetId: "default"
};

(function () {
  'use strict';
  var C = window.CIF_CONFIG;
  var ready = /^https:\/\/script\.google\.com\/.+\/exec$/.test(C.formsEndpoint || '');

  /* ---- shared delivery helper (used by the training, the application, the contact page and this widget) ---- */
  window.cifFormsReady = function () { return ready; };
  window.cifSend = function (data) {
    if (!ready) return Promise.reject(new Error('not-configured'));
    return fetch(C.formsEndpoint, {
      method: 'POST', mode: 'no-cors',                       // Apps Script returns no CORS headers; the email still sends
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids a CORS preflight
      body: JSON.stringify(data)
    });
  };
  window.cifMailto = function (subject, body) {
    return 'mailto:' + C.fallbackEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };

  if (window.__cifHelp) return; window.__cifHelp = true;

  /* ---- live chat (tawk.to), when configured ---- */
  if (C.tawkPropertyId) {
    window.Tawk_API = window.Tawk_API || {}; window.Tawk_LoadStart = new Date();
    var s = document.createElement('script');
    s.async = true; s.charset = 'UTF-8'; s.setAttribute('crossorigin', '*');
    s.src = 'https://embed.tawk.to/' + encodeURIComponent(C.tawkPropertyId) + '/' + encodeURIComponent(C.tawkWidgetId || 'default');
    document.head.appendChild(s);
    return;
  }

  /* ---- "Questions?" button + message panel ---- */
  var css = [
    '.cifq-b{position:fixed;left:16px;bottom:16px;z-index:880;display:inline-flex;align-items:center;gap:8px;font:600 14px/1 "Work Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:#101a30;background:#C9A84C;border:0;border-radius:999px;padding:13px 18px;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.35);transition:transform .15s,background .2s}',
    '.cifq-b:hover,.cifq-b:focus-visible{background:#e2cd94;transform:translateY(-2px);outline:none}',
    '.cifq-b svg{width:18px;height:18px}',
    '.cifq-p{position:fixed;left:16px;bottom:76px;z-index:881;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 100px);overflow:auto;background:#101a30;color:#F3EEE3;border:1px solid rgba(226,205,148,.35);border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.55);padding:20px 20px 18px;font:15px/1.5 "Work Sans",system-ui,-apple-system,"Segoe UI",sans-serif;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .25s,transform .25s}',
    '.cifq-p.on{opacity:1;transform:none;pointer-events:auto}',
    '.cifq-p h2{font:600 22px/1.2 "Newsreader",Georgia,serif;margin:0 0 6px;color:#fff}',
    '.cifq-p p{margin:0 0 14px;color:#cfc6b2;font-size:14px}',
    '.cifq-p label{display:block;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#e2cd94;margin:10px 0 4px}',
    '.cifq-p input,.cifq-p textarea{width:100%;box-sizing:border-box;font:15px "Work Sans",system-ui,sans-serif;color:#fff;background:rgba(255,255,255,.06);border:1px solid rgba(226,205,148,.3);border-radius:10px;padding:10px 12px}',
    '.cifq-p input:focus,.cifq-p textarea:focus{outline:none;border-color:#C9A84C}',
    '.cifq-p textarea{min-height:110px;resize:vertical}',
    '.cifq-p .go{margin-top:14px;width:100%;font:600 15px "Work Sans",system-ui,sans-serif;color:#101a30;background:#C9A84C;border:0;border-radius:999px;padding:12px;cursor:pointer}',
    '.cifq-p .go:disabled{opacity:.5;cursor:default}',
    '.cifq-p .x{position:absolute;right:12px;top:10px;background:none;border:0;color:#cfc6b2;font-size:24px;line-height:1;cursor:pointer;padding:4px 8px}',
    '.cifq-p .fine{font-size:12px;color:#a69e8c;margin:12px 0 0}',
    '.cifq-p .ok{background:rgba(46,125,116,.2);border:1px solid #4CA396;border-radius:10px;padding:14px;color:#e8f3f1}',
    '@media(max-width:640px){.cifq-b{left:10px;bottom:10px;padding:12px 15px}.cifq-p{left:10px;bottom:66px}}',
    '@media print{.cifq-b,.cifq-p{display:none!important}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'cifq-b'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'cifq-p');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>Questions?';

  var p = document.createElement('div');
  p.className = 'cifq-p'; p.id = 'cifq-p'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Ask the foundation a question');
  p.innerHTML =
    '<button type="button" class="x" aria-label="Close">&times;</button>' +
    '<h2>Ask us anything.</h2><p>Your question goes straight to Jeff, the foundation’s founder. He reads every one personally and usually replies within a day or two.</p>' +
    '<form novalidate><label for="cifq-n">Your name</label><input id="cifq-n" autocomplete="name" required>' +
    '<label for="cifq-e">Your email</label><input id="cifq-e" type="email" autocomplete="email" required>' +
    '<label for="cifq-m">Your question</label><textarea id="cifq-m" required></textarea>' +
    '<button class="go" type="submit">' + (ready ? 'Send question' : 'Write the email') + '</button></form>' +
    '<p class="fine">In an emergency call 911. In emotional crisis, call or text 988, 24/7.</p>';

  function mount() {
    document.body.appendChild(btn); document.body.appendChild(p);
    var form = p.querySelector('form'), go = p.querySelector('.go');
    function open(on) { p.classList.toggle('on', on); btn.setAttribute('aria-expanded', on ? 'true' : 'false'); if (on) setTimeout(function () { p.querySelector('#cifq-n').focus(); }, 60); }
    btn.onclick = function () { open(!p.classList.contains('on')); };
    p.querySelector('.x').onclick = function () { open(false); btn.focus(); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && p.classList.contains('on')) { open(false); btn.focus(); } });
    form.onsubmit = function (e) {
      e.preventDefault();
      var n = p.querySelector('#cifq-n').value.trim(), em = p.querySelector('#cifq-e').value.trim(), m = p.querySelector('#cifq-m').value.trim();
      if (!n || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em) || m.length < 3) { form.reportValidity && form.reportValidity(); if (!/@/.test(em)) p.querySelector('#cifq-e').focus(); return; }
      var page = document.title.replace(/\s*\|.*$/, '');
      if (!ready) { location.href = window.cifMailto('Question from the website: ' + page, m + '\n\n— ' + n + ' (' + em + ')'); return; }
      go.disabled = true; go.textContent = 'Sending…';
      window.cifSend({ formType: 'question', name: n, email: em, message: m, page: page + ' (' + location.pathname.replace(/^\//, '') + ')' })
        .then(done, done);
      function done() { form.outerHTML = '<div class="ok"><strong>Sent. Thank you, ' + n.replace(/[<>&]/g, '') + '.</strong><br>You’ll get a confirmation email now, and a personal reply soon.</div>'; }
    };
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
