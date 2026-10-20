/* R01 pytorch-framework only: reachable narrow save; existing cross-reading.js owns persistence.
 * Requires the existing cross-reading.js before this deferred script. No new storage keys.
 */
(function () {
  'use strict';
  function run() {
    const body = document.body;
    if (!body || body.dataset.polishModule !== 'pytorch-framework') return;
    const layout = body.querySelector('.cross-layout[data-reading-profile="torch-lookup"]');
    if (!layout || layout.dataset.polishResumeReady) return;
    const originalSave = layout.querySelector('.lesson-save');
    const originalStatus = layout.querySelector('.lesson-save-status');
    const routes = Array.from(layout.querySelectorAll('.lesson-route-links a'));
    if (!originalSave || !originalStatus || !routes.length ||
        routes.some(a => !document.getElementById(a.hash.slice(1)))) return;
    layout.dataset.polishResumeReady = 'true';
    body.classList.add('polish-resume-enabled');

    const control = document.createElement('div');
    control.className = 'polish-cross-save';
    const feedback = document.createElement('p');
    feedback.className = 'polish-cross-save-feedback';
    feedback.id = 'polish-pytorch-framework-save-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.hidden = true;
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'polish-cross-save-button';
    save.textContent = '记住当前小节';
    save.setAttribute('aria-describedby', feedback.id);
    control.append(feedback, save);
    body.appendChild(control);
    let timer;
    save.addEventListener('click', function () {
      // Programmatic activation does not focus/scroll to the old rail. Its existing
      // handler selects the current section and writes reading-place:v1:<pathname>.
      originalSave.click();
      const current = routes.find(a => a.getAttribute('aria-current') === 'location');
      if (!current) return;
      feedback.replaceChildren(...Array.from(originalStatus.childNodes, n => n.cloneNode(true)));
      const savedLink = feedback.querySelector('a');
      if (!savedLink || savedLink.hash !== current.hash) {
        // The original handler catches denied storage. Supply a usable URL beside
        // that failure message, without claiming a save or changing the old record.
        if (!feedback.textContent.trim()) feedback.textContent = '无法确认保存结果。';
        const bookmark = document.createElement('a');
        bookmark.href = current.hash;
        bookmark.textContent = '本节链接（可收藏或复制）';
        feedback.append(' ', bookmark);
      }
      feedback.hidden = false;
      clearTimeout(timer);
      if (savedLink && savedLink.hash === current.hash) {
        timer = setTimeout(function () {
          if (!feedback.contains(document.activeElement)) feedback.hidden = true;
        }, 6000);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
