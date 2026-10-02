/* Cold Ischemia Foundation — main navigation behavior (dropdown groups + mobile menu).
   Without JavaScript the dropdowns still open on hover/focus via CSS (see cif-nav.css). */
(function () {
  'use strict';
  var nav = document.querySelector('nav.cifnav');
  if (!nav || nav.__cn) return;
  nav.__cn = true;
  nav.classList.add('cn-js');

  var groups = [].slice.call(nav.querySelectorAll('.cn-g'));
  var burger = nav.querySelector('.cn-burger');
  var hoverMQ = window.matchMedia ? window.matchMedia('(hover:hover) and (min-width:901px)') : { matches: false };

  function setOpen(g, open) {
    g.classList.toggle('open', open);
    var b = g.querySelector('.cn-gb');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeAll(except) {
    groups.forEach(function (g) { if (g !== except) setOpen(g, false); });
  }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    if (burger) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (!open) closeAll();
  }

  groups.forEach(function (g) {
    var btn = g.querySelector('.cn-gb');
    var items = [].slice.call(g.querySelectorAll('.cn-dd a'));

    btn.addEventListener('click', function () {
      if (hoverMQ.matches) { closeAll(g); setOpen(g, true); return; }   /* hover already opened it */
      var willOpen = !g.classList.contains('open');
      closeAll(g); setOpen(g, willOpen);
    });
    g.addEventListener('mouseenter', function () {
      if (!hoverMQ.matches) return;
      clearTimeout(g._t); closeAll(g); setOpen(g, true);
    });
    g.addEventListener('mouseleave', function () {
      if (!hoverMQ.matches) return;
      g._t = setTimeout(function () { setOpen(g, false); }, 180);
    });
    g.addEventListener('keydown', function (e) {
      var i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault(); setOpen(g, true);
        (items[i + 1] || items[0]).focus();
      } else if (e.key === 'ArrowUp' && i >= 0) {
        e.preventDefault();
        (items[i - 1] || items[items.length - 1]).focus();
      } else if (e.key === 'Escape') {
        setOpen(g, false); btn.focus();
      }
    });
  });

  if (burger) burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) { closeAll(); setMenu(false); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); if (nav.classList.contains('open')) { setMenu(false); if (burger) burger.focus(); } }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
})();
