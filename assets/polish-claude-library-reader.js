/* R02 Q02-CL-02: context-notes page only. Existing cross-reading.js owns
 * reading-place:v1 persistence, section selection and storage error handling.
 * Load this deferred script after the existing deferred cross-reading.js.
 */
(function () {
  'use strict';
  function run() {
    const body = document.body;
    if (!body || !body.classList.contains('polish-claude-library-reading')) return;
    const layout = body.querySelector('.cross-layout[data-reading-profile="context-notes"]');
    if (!layout || layout.dataset.polishClaudeResumeReady) return;
    const originalSave = layout.querySelector('.lesson-save');
    const originalStatus = layout.querySelector('.lesson-save-status');
    const routes = Array.from(layout.querySelectorAll('.lesson-route-links a'));
    if (!originalSave || !originalStatus || !routes.length ||
        routes.some(a => !document.getElementById(a.hash.slice(1)))) return;
    layout.dataset.polishClaudeResumeReady = 'true';
    body.classList.add('polish-claude-resume-enabled');

    const control = document.createElement('div');
    control.className = 'polish-claude-save';
    const feedback = document.createElement('p');
    feedback.className = 'polish-claude-save-feedback';
    feedback.id = 'polish-claude-save-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.hidden = true;
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'polish-claude-save-button';
    save.textContent = '记住当前小节';
    save.setAttribute('aria-describedby', feedback.id);
    control.append(feedback, save);
    body.appendChild(control);
    let timer;
    save.addEventListener('click', function () {
      // Do not focus, scroll to or expand the rail before the original handler
      // selects the currently read section. That layout change caused CL-02.
      originalSave.click();
      const current = routes.find(a => a.getAttribute('aria-current') === 'location');
      if (!current) return;
      feedback.replaceChildren(...Array.from(originalStatus.childNodes, n => n.cloneNode(true)));
      const savedLink = feedback.querySelector('a');
      if (!savedLink || savedLink.hash !== current.hash) {
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
