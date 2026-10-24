/* Agent Engineering only: explicit per-page Markdown opt-in.
   Load as external defer after legacy readers and before magazine-reading-v1.js.
   With no marker or no JavaScript, the complete original article stays intact. */
(function () {
  'use strict';

  var body = document.body;
  if (!body) return;
  var mains = body.querySelectorAll('main');
  if (mains.length !== 1) return;
  var main = mains[0];
  var markers = main.querySelectorAll('[hidden][data-agent-magazine="v1"]');
  if (markers.length !== 1 || markers[0].parentElement !== main) return;

  var kind = markers[0].getAttribute('data-magazine-kind');
  if (['narrative', 'math-code', 'engineering', 'reference'].indexOf(kind) < 0) return;
  var module = body.getAttribute('data-magazine-module');
  var version = body.getAttribute('data-magazine-reading');
  if ((module && module !== 'agent-engineering') || (version && version !== 'v1')) return;

  body.setAttribute('data-magazine-reading', 'v1');
  body.setAttribute('data-magazine-module', 'agent-engineering');
  body.setAttribute('data-magazine-kind', kind);
  main.classList.add('mg-main');
}());
