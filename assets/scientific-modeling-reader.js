/* Module-only repair for duplicate IDs in the shared diagram zoom copy.
   Load after diagram-reader.js. No storage, scrolling, or reading-state logic. */
(function () {
  'use strict';
  if (!document.body.classList.contains('scientific-modeling-reader')) return;
  let serial = 0;
  document.addEventListener('click', function (event) {
    if (!(event.target instanceof Element) || !event.target.closest('.diagram-expand')) return;
    const svg = document.querySelector('#diagram-reader[open] #diagram-reader-stage > svg');
    if (!svg) return;
    const elements = [svg, ...svg.querySelectorAll('*')];
    const names = new Map();
    let prefix;
    do { prefix = 'sc-model-zoom-' + (++serial) + '-'; }
    while (elements.some(element => element.id && document.getElementById(prefix + element.id)));
    elements.forEach(element => {
      if (element.id) names.set(element.id, prefix + element.id);
    });
    function references(value) {
      return value.replace(/url\((['"]?)#([^)'"]+)\1\)/g, function (whole, quote, id) {
        return names.has(id) ? 'url(#' + names.get(id) + ')' : whole;
      });
    }
    elements.forEach(element => {
      if (element.id) element.id = names.get(element.id);
      [...element.attributes].forEach(attribute => {
        if (attribute.name === 'id') return;
        let value = references(attribute.value);
        if (attribute.name === 'aria-labelledby' || attribute.name === 'aria-describedby') {
          value = value.split(/\s+/).map(id => names.get(id) || id).join(' ');
        } else if ((attribute.name === 'href' || attribute.name === 'xlink:href') && value.charAt(0) === '#' && names.has(value.slice(1))) {
          value = '#' + names.get(value.slice(1));
        }
        if (value !== attribute.value) attribute.value = value;
      });
      if (element.tagName.toLowerCase() === 'style') element.textContent = references(element.textContent);
    });
  });
})();
