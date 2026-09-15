/* Candidate: chapter 13 only. No shared dictionary or global KaTeX changes. */
(() => {
  'use strict';
  const T = String.raw;
  const rules = [
  {
    "id": "rec13-ucb-bonus",
    "tex": "b_i(t)=c\\sqrt{\\frac{2\\ln t}{n_i}}.",
    "parts": [
      {
        "id": "bonus-output",
        "part": "b_i(t)",
        "title": "bᵢ(t)：这一式算出的乐观奖金",
        "meaning": "给候选i增加的一项探索奖金，与已观察均值分开计算。",
        "role": "本式把本轮编号、单项观察量和系数合成一个数；下一式再把它加到均值上。",
        "example": "代码中N=12，所以t=13。c=1时，观察10次的A奖金约0.716233，观察2次的B约1.601546。",
        "boundary": "这项奖金不是额外点击率，也不是对真实收益的保证。本式用于nᵢ>0；未试候选另按初始化规则处理。"
      },
      {
        "id": "bonus-coefficient",
        "part": "c",
        "after": "=",
        "title": "c：本式奖金的强度系数",
        "meaning": "乘在平方根前的非负系数。",
        "role": "在其余输入相同时按比例改变整项奖金；本页标准UCB1示例取1。",
        "example": "A在c=1时奖金约0.716233；若仅把c改成0，奖金为0，选择就只看当前均值。",
        "boundary": "其他c值是在修改选择规则，不能自动沿用标准UCB1的同一理论结论。"
      },
      {
        "id": "bonus-round-log",
        "part": "\\ln t",
        "title": "ln t：对下一轮编号取自然对数",
        "meaning": "ln是以自然常数e为底的对数；这里的t是下一次决策的轮号。",
        "role": "放在奖金分子中，使长时间没再观察的候选在固定nᵢ时逐渐得到更高奖金。",
        "example": "已经完成12次观察，下一轮t=13，因此这里用ln13≈2.564949，而不是ln12。",
        "boundary": "N记录已经完成的观察，t=N+1。代码没有自动统计并发请求或尚未成熟的反馈，调用方必须统一计数口径。"
      },
      {
        "id": "bonus-item-observations",
        "part": "n_i",
        "title": "nᵢ：这个候选的已观察次数",
        "meaning": "只统计候选i已经完成的有效反馈次数，不是全部候选的总数N。",
        "role": "它在分母中；固定t和c时，单项观察越少，这项奖金越大。",
        "example": "A的nᵢ=10，B的nᵢ=2。两项都用t=13，B的奖金约为A的√5倍。",
        "boundary": "nᵢ=0不能代入这一除法。代码用均值0占位并返回inf表示初始化，而不是声称其真实收益无限大。"
      }
    ]
  },
  {
    "id": "rec13-ucb-score",
    "tex": "\\mathrm{UCB}_i(t)=\\bar{x}_i+b_i(t),\\qquad t=N+1.",
    "parts": [
      {
        "id": "score-output",
        "part": "\\mathrm{UCB}_i(t)",
        "title": "UCBᵢ(t)：本轮用来比较的总分",
        "meaning": "把已有平均奖励与乐观奖金相加得到的选择分数。",
        "role": "在符合资格的候选之间比较大小，选当前总分最高者。",
        "example": "A约1.116233，B约2.101546，因此代码在这两个已观察候选中选B。",
        "boundary": "分数可以超过1，它不是成功概率。选B也不证明B的真实平均奖励更高；反馈还要继续观察。"
      },
      {
        "id": "score-observed-mean",
        "part": "\\bar{x}_i",
        "title": "x̄ᵢ：已有反馈的平均奖励",
        "meaning": "候选i已经观察到的奖励之和，除以它的观察次数。",
        "role": "提供利用已有证据的部分，再由右边的奖金补充探索倾向。",
        "example": "代码给A输入均值0.4、B输入0.5；本函数只接收这些统计量，并不替调用者收集反馈。",
        "boundary": "本页奖励范围为[0,1]。未观察过时样本均值未定义，代码中的0只是初始化占位。"
      },
      {
        "id": "score-added-bonus",
        "part": "b_i(t)",
        "title": "bᵢ(t)：把上一式的奖金加入总分",
        "meaning": "沿用刚才算好的奖金，不是另一项新的奖励。",
        "role": "在这一式中，它与当前样本均值相加，改变本轮候选的比较结果。",
        "example": "A：0.4+0.716233≈1.116233；B：0.5+1.601546≈2.101546。",
        "boundary": "奖金式说明它怎样算出；此处说明它怎样参与选择。完整学习循环还要接上动作、真实反馈与计数更新。"
      },
      {
        "id": "score-clock-bridge",
        "part": "t=N+1",
        "title": "t=N+1：从已观察次数走到下一轮",
        "meaning": "N是全部已完成观察的次数；t是紧接着要做决策的轮号。",
        "role": "让上一式的ln t与代码total_pulls使用同一条时钟，避免一处代12、另一处代13。",
        "example": "A已观察10次、B已观察2次，所以N=12，接下来要做的是第13轮决策。",
        "boundary": "单动作且每轮反馈完成后再决策是这里的教学口径。并发展示、延迟反馈与成组动作需要另行定义时钟和更新方式。"
      }
    ]
  }
];

  function annotate(rule) {
    const ranges = [];
    for (const part of rule.parts) {
      let at = 0, count = 0;
      while ((at = rule.tex.indexOf(part.part, at)) !== -1) {
        if (part.after && rule.tex.slice(at - part.after.length, at) !== part.after) {
          at += part.part.length;
          continue;
        }
        ranges.push({start: at, end: at + part.part.length, part});
        at += part.part.length;
        count++;
      }
      if (count !== (part.count || 1)) throw Error(part.id + ': 局部次数 ' + count);
    }
    ranges.sort((a, b) => a.start - b.start);
    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i].start < ranges[i - 1].end) throw Error(rule.id + ': 局部组合重叠');
    }
    let tex = rule.tex;
    for (const range of [...ranges].reverse()) {
      tex = tex.slice(0, range.start) + T`\htmlData{rec13-term=` +
        range.part.id + '}{' + tex.slice(range.start, range.end) + '}' + tex.slice(range.end);
    }
    return {tex, targetCount: ranges.length};
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {rules, annotate};
    return;
  }
  function init() {
    let path;
    try { path = decodeURIComponent(location.pathname).split('/'); } catch (_) { return; }
    if (path.pop() !== '13-冷启动与探索利用.html' || path.pop() !== '推荐算法' ||
        !document.body.matches('.rec-coldstart-reading.rec-13') ||
        document.documentElement.dataset.rec13FormulaHelp) return;
    const report = {expected: rules.length, matched: [], errors: [], terms: 0, targets: 0};
    window.Rec13FormulaHelpStatus = report;
    const fail = message => {
      report.errors.push(message);
      console.error('[Rec13FormulaHelp] ' + message);
    };
    if (!window.katex) { fail('KaTeX 未就绪，保留原式。'); return; }
    const main = document.querySelector('main');
    if (!main) { fail('缺少 main，未绑定。'); return; }
    const dialog = document.createElement('dialog');
    if (typeof dialog.showModal !== 'function') { fail('不支持 dialog，保留原式。'); return; }
    document.documentElement.dataset.rec13FormulaHelp = '1';
    dialog.id = 'rec13-formula-dialog';
    dialog.setAttribute('aria-labelledby', 'rec13-formula-title');
    dialog.innerHTML = '<header class="rec13-fh-header"><div><p class="rec13-fh-eyebrow">这条公式里的作用</p><h2 id="rec13-formula-title"></h2></div><button type="button" class="rec13-fh-close" aria-label="关闭公式解释">×</button></header><div class="rec13-fh-body"><div class="rec13-fh-selected" tabindex="0" role="region" aria-label="选中的公式组合，可横向滚动"></div><h3>它是什么</h3><p class="rec13-fh-meaning"></p><h3>在本式里做什么</h3><p class="rec13-fh-role"></p><section class="rec13-fh-example"><h3>用本页小例子看</h3><p></p></section><details class="rec13-fh-boundary"><summary>再看一个适用边界</summary><p></p></details><details class="rec13-fh-original"><summary>对照完整原式</summary><div class="rec13-fh-context" tabindex="0" role="region" aria-label="完整原式，可横向滚动"></div></details></div><footer class="rec13-fh-footer"><button type="button">关闭，回到公式</button></footer>';
    document.body.append(dialog);
    const root = document.documentElement;
    let active = null, serial = 0;
    const body = dialog.querySelector('.rec13-fh-body');
    const closeButton = dialog.querySelector('.rec13-fh-close');
    const readStyle = (node, name) => ({value: node.style.getPropertyValue(name),
      priority: node.style.getPropertyPriority(name)});
    function restoreStyle(node, name, saved) {
      if (saved.value) node.style.setProperty(name, saved.value, saved.priority);
      else node.style.removeProperty(name);
    }
    function finish(id) {
      if (dialog.open || !active || active.id !== id) return;
      const saved = active;
      active = null;
      for (const name of ['overflow-x', 'overflow-y', 'scrollbar-gutter']) {
        restoreStyle(root, name, saved.rootStyles[name]);
      }
      if (!saved.hadClass) document.body.classList.remove('rec13-formula-modal-open');
      if (saved.trigger.isConnected) saved.trigger.focus({preventScroll: true});
      window.scrollTo({left: saved.x, top: saved.y, behavior: 'instant'});
      restoreStyle(root, 'scroll-behavior', saved.rootStyles['scroll-behavior']);
      restoreStyle(document.body, 'scroll-behavior', saved.bodyBehavior);
    }
    function close() {
      if (!dialog.open) return;
      const id = active?.id;
      dialog.close();
      // Synchronous cleanup makes Escape -> Space safe in the same event turn.
      finish(id);
    }
    closeButton.addEventListener('click', close);
    dialog.querySelector('.rec13-fh-footer button').addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', () => {
      // A queued close may belong to a prior opening; never touch a new modal.
      if (dialog.open) return;
      finish(active?.id);
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) close();
    });
    dialog.querySelector('.rec13-fh-original').addEventListener('toggle', event => {
      if (!dialog.open || !event.currentTarget.open) return;
      const missing = dialog.querySelector('.rec13-fh-context').getBoundingClientRect().bottom -
        body.getBoundingClientRect().bottom;
      if (missing > 0) body.scrollTop += missing + 16;
    });
    function show(rule, part, trigger) {
      if (dialog.open) return;
      if (active) finish(active.id); // A direct native close may still be queued.
      window.scrollTo({left: window.scrollX, top: window.scrollY, behavior: 'instant'});
      const box = trigger.getBoundingClientRect();
      const navBottom = document.querySelector('header.site')?.getBoundingClientRect().bottom || 0;
      if (box.top < Math.max(0, navBottom) + 12 || box.bottom > innerHeight - 12) {
        trigger.scrollIntoView({block: 'center', inline: 'nearest', behavior: 'instant'});
      }
      dialog.dataset.rec13Term = part.id;
      dialog.querySelector('h2').textContent = part.title;
      dialog.querySelector('.rec13-fh-meaning').textContent = part.meaning;
      dialog.querySelector('.rec13-fh-role').textContent = part.role;
      dialog.querySelector('.rec13-fh-example p').textContent = part.example;
      const boundary = dialog.querySelector('.rec13-fh-boundary');
      boundary.hidden = !part.boundary;
      boundary.querySelector('p').textContent = part.boundary || '';
      for (const details of dialog.querySelectorAll('details')) details.open = false;
      try {
        for (const [tex, selector] of [[part.part, '.rec13-fh-selected'], [rule.tex, '.rec13-fh-context']]) {
          window.katex.render(tex, dialog.querySelector(selector),
            {displayMode: true, throwOnError: true, strict: 'ignore', trust: false});
        }
      } catch (error) { fail(part.id + ': 弹窗渲染失败 ' + error.message); return; }
      const rootStyles = Object.fromEntries(['overflow-x', 'overflow-y', 'scrollbar-gutter',
        'scroll-behavior'].map(name => [name, readStyle(root, name)]));
      active = {id: ++serial, trigger, x: window.scrollX, y: window.scrollY, rootStyles,
        bodyBehavior: readStyle(document.body, 'scroll-behavior'),
        hadClass: document.body.classList.contains('rec13-formula-modal-open')};
      // Preserve a real desktop scrollbar's space, but never add one on mobile.
      if (window.innerWidth > root.clientWidth && !getComputedStyle(root).scrollbarGutter.includes('stable')) {
        root.style.setProperty('scrollbar-gutter', 'stable', 'important');
      }
      root.style.setProperty('overflow-x', 'hidden', 'important');
      root.style.setProperty('overflow-y', 'hidden', 'important');
      root.style.setProperty('scroll-behavior', 'auto', 'important');
      document.body.style.setProperty('scroll-behavior', 'auto', 'important');
      try { dialog.showModal(); }
      catch (error) { finish(active.id); fail(part.id + ': 打开失败 ' + error.message); return; }
      document.body.classList.add('rec13-formula-modal-open');
      body.scrollTop = 0;
      for (const scroller of dialog.querySelectorAll('.rec13-fh-selected, .rec13-fh-context')) {
        scroller.scrollLeft = 0;
      }
      closeButton.focus({preventScroll: true});
    }
    function bind(target, rule, part) {
      target.setAttribute('aria-haspopup', 'dialog');
      target.setAttribute('aria-controls', dialog.id);
      target.addEventListener('click', () => show(rule, part, target));
      if (target.tagName !== 'BUTTON') {
        target.tabIndex = 0;
        target.setAttribute('role', 'button');
        target.setAttribute('aria-label', '解释 ' + part.title);
        target.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); show(rule, part, target);
          }
        });
      }
    }
    for (const rule of rules) {
      const wrappers = main.querySelectorAll('[data-rec13-formula="' + rule.id + '"]');
      if (wrappers.length !== 1) { fail(rule.id + ': 需要唯一公式容器'); continue; }
      const wrapper = wrappers[0];
      const displays = wrapper.querySelectorAll('.katex-display');
      const annotation = displays[0]?.querySelector('.katex-mathml annotation[encoding="application/x-tex"]');
      const originalVisible = displays[0]?.querySelector('.katex > .katex-html');
      if (displays.length !== 1 || !annotation || annotation.textContent.trim() !== rule.tex ||
          !originalVisible) { fail(rule.id + ': 完整 TeX 或可见结构不匹配，未绑定'); continue; }
      const originalTex = annotation.textContent;
      const temporary = document.createElement('span');
      let annotated;
      try {
        annotated = annotate(rule);
        window.katex.render(annotated.tex, temporary, {displayMode: true, throwOnError: true,
          strict: 'ignore', trust: context => context.command === T`\htmlData`});
      } catch (error) { fail(rule.id + ': 标注失败 ' + error.message); continue; }
      const visible = temporary.querySelector('.katex > .katex-html');
      if (!visible) { fail(rule.id + ': 缺少可见数学结构，未绑定'); continue; }
      const targets = [...visible.querySelectorAll('[data-rec13-term]')];
      if (targets.length !== annotated.targetCount ||
          rule.parts.some(part => targets.filter(t => t.dataset.rec13Term === part.id).length !== (part.count || 1))) {
        fail(rule.id + ': 可见局部数不匹配，未绑定'); continue;
      }
      for (const target of targets) {
        const part = rule.parts.find(p => p.id === target.dataset.rec13Term);
        target.classList.add('rec13-fh-target');
        bind(target, rule, part);
      }
      // Preserve original MathML/TeX. Expose only local visual buttons to AT.
      // Hide non-target sibling branches, never an ancestor of another target.
      visible.removeAttribute('aria-hidden');
      function hideNonInteractive(node) {
        for (const child of node.children) {
          if (child.matches('[data-rec13-term]')) continue;
          if (child.querySelector('[data-rec13-term]')) hideNonInteractive(child);
          else child.setAttribute('aria-hidden', 'true');
        }
      }
      hideNonInteractive(visible);
      originalVisible.replaceWith(visible);
      displays[0].tabIndex = 0;
      displays[0].setAttribute('role', 'region');
      displays[0].setAttribute('aria-label', '当前公式，可横向滚动；着色组合可打开解释');
      wrapper.classList.add('rec13-fh-bound');
      const menu = document.createElement('details');
      menu.className = 'rec13-fh-menu';
      const summary = document.createElement('summary');
      summary.textContent = '解释目录（公式内也可点击）';
      menu.append(summary);
      const controls = document.createElement('div');
      controls.className = 'rec13-fh-controls';
      for (const part of rule.parts) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'rec13-fh-trigger';
        button.dataset.rec13Term = part.id;
        button.textContent = part.title;
        bind(button, rule, part);
        controls.append(button);
      }
      menu.append(controls);
      wrapper.append(menu);
      if (annotation.textContent !== originalTex) fail(rule.id + ': 原始 annotation 变化');
      report.matched.push(rule.id);
      report.terms += rule.parts.length;
      report.targets += targets.length;
    }
    if (!report.matched.length) {
      dialog.remove();
      delete document.documentElement.dataset.rec13FormulaHelp;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
