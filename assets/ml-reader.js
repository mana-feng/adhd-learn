/* Board-only fixes: reliable saved-place jumps and unique IDs in the shared zoom copy. */
(function () {
  'use strict';
  if (!document.body.classList.contains('ml-reader')) return;
  let serial = 0;
  document.addEventListener('click', function (event) {
    const resume = event.target.closest('.lesson-save-status a[href^="#"]');
    if (resume && !event.defaultPrevented && event.button === 0 &&
        !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      const fragment = resume.getAttribute('href');
      const target = document.getElementById(fragment.slice(1));
      if (target) {
        event.preventDefault();
        if (location.hash !== fragment) history.pushState(null, '', fragment);
        target.scrollIntoView({behavior: 'instant', block: 'start'});
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
      }
      return;
    }
    if (!event.target.closest('.diagram-expand')) return;
    const svg = document.querySelector('#diagram-reader-stage > svg');
    if (!svg) return;
    const elements = [svg, ...svg.querySelectorAll('*')];
    const names = new Map();
    const prefix = 'ml-zoom-' + (++serial) + '-';
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
        } else if (value.charAt(0) === '#' && names.has(value.slice(1))) {
          value = '#' + names.get(value.slice(1));
        }
        if (value !== attribute.value) attribute.value = value;
      });
      if (element.tagName.toLowerCase() === 'style') element.textContent = references(element.textContent);
    });
  });
})();
