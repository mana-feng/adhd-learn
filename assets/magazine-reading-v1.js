(function () {
  'use strict';

  var body = document.body;
  if (!body || body.getAttribute('data-magazine-reading') !== 'v1' ||
      !body.getAttribute('data-magazine-module')) return;

  var main = body.querySelector('main.mg-main');
  if (!main || main.getAttribute('data-mg-reader-ready') === 'v1') return;
  main.setAttribute('data-mg-reader-ready', 'v1');

  function revealTarget(hash) {
    if (!hash || hash.charAt(0) !== '#') return;
    var id;
    try { id = decodeURIComponent(hash.slice(1)); }
    catch (_) { return; }
    if (!id) return;

    var target = document.getElementById(id);
    if (!target || !main.contains(target)) return;
    for (var node = target.parentElement; node && node !== main; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
  }

  revealTarget(window.location.hash);
  window.addEventListener('hashchange', function () {
    revealTarget(window.location.hash);
  });

  main.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link || !main.contains(link) || event.defaultPrevented) return;
    var url;
    try { url = new URL(link.href, window.location.href); }
    catch (_) { return; }
    if (url.origin === window.location.origin && url.pathname === window.location.pathname &&
        url.search === window.location.search) revealTarget(url.hash);
  });
}());
