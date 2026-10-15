/* Offline search for the original question cards. No network or stored state. */
(function () {
  'use strict';
  var search = document.getElementById('interview-search');
  var count = document.getElementById('interview-count');
  if (!search || !count) return;
  var cards = Array.from(document.querySelectorAll('.interview-card'));
  var text = cards.map(function (card) { return card.textContent.toLocaleLowerCase(); });
  function filter() {
    var query = search.value.trim().toLocaleLowerCase();
    var words = query.split(/\s+/).filter(Boolean);
    var visible = 0;
    cards.forEach(function (card, index) {
      var matches = words.every(function (word) { return text[index].includes(word); });
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = query
      ? '找到 ' + visible + ' / ' + cards.length + ' 张卡。清空搜索可恢复全部；学习说明与检查点仍保留。'
      : '共 ' + cards.length + ' 张卡。按六类阅读，或输入关键词筛选；搜索仅在本页进行。';
  }
  search.addEventListener('input', filter);
  search.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      search.value = '';
      filter();
    }
  });
  filter();
})();
