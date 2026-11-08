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

/* Checkpoint quizzes: one click on an option shows right/wrong and opens the explanation.
   Markup is authored in each lesson; without JavaScript the explanation stays readable. */
(function () {
  'use strict';
  if (!document.body.classList.contains('ml-reader')) return;
  const quizzes = [...document.querySelectorAll('.ml-quiz')];
  if (!quizzes.length) return;
  const words = {t: '正确', f: '错误'};
  function score(quiz) {
    const all = quiz.querySelectorAll('.ml-q').length;
    const done = quiz.querySelectorAll('.ml-q[data-state]').length;
    const right = quiz.querySelectorAll('.ml-q[data-state="right"]').length;
    const out = quiz.querySelector('.ml-quiz-score');
    const again = quiz.querySelector('.ml-quiz-reset');
    if (out) {
      let text = '';
      if (done) {
        text = '已答 ' + done + ' / ' + all + '，答对 ' + right + ' 题';
        if (done === all) text += right === all ? '。全对！' : '。答错的题看一眼解析，再回正文对应位置。';
      }
      out.textContent = text;
    }
    if (again) again.hidden = !done;
  }
  function answer(question, button) {
    if (question.hasAttribute('data-state')) return;
    const correct = question.getAttribute('data-answer');
    const right = button.getAttribute('data-choice') === correct;
    question.setAttribute('data-state', right ? 'right' : 'wrong');
    question.querySelectorAll('.ml-q-options button').forEach(option => {
      const isAnswer = option.getAttribute('data-choice') === correct;
      option.setAttribute('aria-disabled', 'true');
      if (isAnswer) option.classList.add('is-answer');
      if (option === button) {
        option.classList.add('is-chosen');
        option.setAttribute('aria-pressed', 'true');
      }
      const mark = option.querySelector('.ml-q-mark');
      if (mark) mark.textContent = isAnswer ? '✓ 正确答案' : (option === button ? '✗ 你的选择' : '');
    });
    const feedback = question.querySelector('.ml-q-feedback');
    if (feedback) {
      const name = words[correct] || correct.toUpperCase();
      feedback.textContent = right ? '✓ 答对了。' : '✗ 不对，正确答案是「' + name + '」。';
    }
    const explain = question.querySelector('.ml-q-explain');
    if (explain) explain.open = true;
    score(question.closest('.ml-quiz'));
  }
  function reset(quiz) {
    quiz.querySelectorAll('.ml-q').forEach(question => {
      question.removeAttribute('data-state');
      question.querySelectorAll('.ml-q-options button').forEach(option => {
        option.classList.remove('is-answer', 'is-chosen');
        option.removeAttribute('aria-disabled');
        option.setAttribute('aria-pressed', 'false');
        const mark = option.querySelector('.ml-q-mark');
        if (mark) mark.textContent = '';
      });
      const feedback = question.querySelector('.ml-q-feedback');
      if (feedback) feedback.textContent = '';
      const explain = question.querySelector('.ml-q-explain');
      if (explain) explain.open = false;
    });
    score(quiz);
    const first = quiz.querySelector('.ml-q-options button');
    if (first) first.focus();
  }
  quizzes.forEach(quiz => {
    quiz.classList.add('is-ready');
    quiz.querySelectorAll('.ml-q-options button').forEach(option => option.setAttribute('aria-pressed', 'false'));
    quiz.addEventListener('click', event => {
      if (event.target.closest('.ml-quiz-reset')) { reset(quiz); return; }
      const option = event.target.closest('.ml-q-options button');
      if (option) answer(option.closest('.ml-q'), option);
    });
  });
})();
