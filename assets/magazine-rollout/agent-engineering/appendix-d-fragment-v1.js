/* Appendix D only. The original interview script owns filtering and Escape.
   After its deferred initialization, keep the current fragment's card readable
   alongside query matches without clearing the reader's restored search. */
(function () {
  'use strict';

  function initialize() {
    var body = document.body;
    var main = document.querySelector('main.mg-main');
    var search = document.getElementById('interview-search');
    var count = document.getElementById('interview-count');
    if (!body || body.getAttribute('data-magazine-module') !== 'agent-engineering' ||
        !main || !main.querySelector('[data-agent-appendix-d="v1"]') || !search || !count) return;

    var cards = Array.from(main.querySelectorAll('.interview-card'));
    var originalHidden;
    var originalCount;
    var originalQuery;
    var originalText = cards.map(function (card) { return card.textContent.toLocaleLowerCase(); });
    function captureOriginalFilter() {
      originalHidden = cards.map(function (card) { return card.hidden; });
      originalCount = count.textContent;
      originalQuery = search.value;
    }

    // Native history restoration can change the value after the legacy filter ran,
    // without an input event. Apply its same predicate without assigning the value.
    function reconcileRestoredQuery() {
      if (search.value === originalQuery) return;
      var query = search.value.trim().toLocaleLowerCase();
      var words = query.split(/\s+/).filter(Boolean);
      var visible = 0;
      originalHidden = originalText.map(function (text) {
        var matches = words.every(function (word) { return text.includes(word); });
        if (matches) visible += 1;
        return !matches;
      });
      originalCount = query
        ? '找到 ' + visible + ' / ' + cards.length + ' 张卡。清空搜索可恢复全部；学习说明与检查点仍保留。'
        : '共 ' + cards.length + ' 张卡。按六类阅读，或输入关键词筛选；搜索仅在本页进行。';
      originalQuery = search.value;
    }

    function targetFromHash() {
      var id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch (_) { return null; }
      var target = id && document.getElementById(id);
      return target && main.contains(target) ? target : null;
    }

    function revealFragment() {
      var target = targetFromHash();
      if (!target) return;
      var card = target.closest('.interview-card');
      if (!card || !main.contains(card)) return;
      for (var node = target; node && node !== main; node = node.parentElement) {
        if (node.tagName === 'DETAILS') node.open = true;
      }
      if (card.hidden) {
        card.hidden = false;
        count.textContent += ' 另显示当前锚点所在的 1 张卡；搜索词保持不变。';
      }
    }

    function refreshFragment(scroll) {
      cards.forEach(function (card, index) { card.hidden = originalHidden[index]; });
      count.textContent = originalCount;
      revealFragment();
      var target = targetFromHash();
      if (scroll && target) window.requestAnimationFrame(function () {
        target.scrollIntoView({ block: 'start' });
      });
    }

    // Registered after the legacy filter: its exact matching/count rules run first.
    search.addEventListener('input', function () { captureOriginalFilter(); revealFragment(); });
    search.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { captureOriginalFilter(); revealFragment(); }
    });
    window.addEventListener('hashchange', function () { refreshFragment(true); });
    window.addEventListener('pageshow', function () {
      reconcileRestoredQuery();
      refreshFragment(false);
      // Session-history form restoration may finish after pageshow dispatch.
      window.requestAnimationFrame(function () {
        reconcileRestoredQuery();
        refreshFragment(false);
      });
    });
    captureOriginalFilter();
    refreshFragment(true);
  }

  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}());
