/* Candidate: chapter 12 only. No shared dictionary or global KaTeX changes. */
(() => {
  'use strict';
  const T = String.raw;
  const rules = [
  {
    "id": "rec12-gauc",
    "tex": "\\mathrm{GAUC}=\\frac{\\sum_{u\\in\\mathcal{G}}w_u\\,\\mathrm{AUC}_u}{\\sum_{u\\in\\mathcal{G}}w_u}.",
    "parts": [
      {
        "id": "gauc-eligible-groups",
        "part": "\\mathcal{G}",
        "count": 2,
        "title": "G：本次能计算AUC的组",
        "meaning": "同时包含正例和负例的组，才进入这里的有效组集合。",
        "role": "分子与分母使用同一个G，只汇总这些组的AUC和权重。",
        "example": "5条记录的代码例中，G包含u1、u2；u3只有正例，被跳过。",
        "boundary": "G为空时分母为0，GAUC未定义，代码返回null及原因。组可以按用户或请求定义，但应在比较前固定。"
      },
      {
        "id": "gauc-record-weight",
        "part": "w_u",
        "count": 2,
        "title": "wᵤ：有效组的记录数权重",
        "meaning": "本例让一个有效组的权重等于该组记录数。",
        "role": "分子中放大该组AUC的贡献；分母将加权总量归一化为平均数。",
        "example": "u1、u2各有2条记录，权重都是2；GAUC=(2×1+2×0)/(2+2)=0.5。",
        "boundary": "只有每条记录确实代表一次曝光时，才能把这个权重叫曝光数。换成每组一票会成为另一种汇总协议。"
      },
      {
        "id": "gauc-within-group-auc",
        "part": "\\mathrm{AUC}_u",
        "title": "AUCᵤ：只在这一组内比较正负例",
        "meaning": "在组u内部，正例分数高于负例记1，低于记0，同分记0.5，再对正负对平均。",
        "role": "它是GAUC要加权汇总的组内表现，不包含跨用户或跨组的样本对。",
        "example": "代码中u1正例0.9高于负例0.1，AUC为1；u2相反，AUC为0。",
        "boundary": "正文另有20条记录的例子，两个用户内AUC均为0，但全局AUC是0.81。那与代码5条输入是两个独立例子。"
      }
    ]
  },
  {
    "id": "rec12-dcg",
    "tex": "\\mathrm{DCG}@K=\\sum_{i=1}^{K}\\frac{2^{\\mathrm{rel}_i}-1}{\\log_2(i+1)}.",
    "parts": [
      {
        "id": "dcg-top-k-sum",
        "part": "\\sum_{i=1}^{K}",
        "title": "求和：检查前K个展示位置",
        "meaning": "i从第1个位置数到第K个位置，把每处折损后的贡献加起来。",
        "role": "限制实际列表的计分范围，K之后的返回项不计入这次DCG@K。",
        "example": "K=2且返回[a,b]时，只计算a、b两处；如果只返回a，第2个位置贡献0。",
        "boundary": "返回不足K项时缺位贡献0，但下一式的IDCG仍使用事先固定的完整合法候选集合。"
      },
      {
        "id": "dcg-exponential-gain",
        "part": "2^{\\mathrm{rel}_i}-1",
        "title": "指数增益：把相关度变成收益",
        "meaning": "relᵢ是第i个位置物品的非负真实相关度；本页采用2的相关度次方减1。",
        "role": "先决定该物品的基础贡献，再除以位置折损因子。",
        "example": "相关度0、1、2、3分别变成0、1、3、7；a相关度2，所以增益为3。",
        "boundary": "这是本页选定的等级收益约定，不是点击概率。直接使用相关度作增益的实现可能得到不同分数。"
      },
      {
        "id": "dcg-position-discount",
        "part": "\\log_2(i+1)",
        "title": "log₂(i+1)：越靠后，贡献越打折",
        "meaning": "以2为底的对数；位置i越大，这个分母越大。",
        "role": "同一个增益被放到后面时，对DCG的贡献更小。",
        "example": "第1位分母log₂2=1；第2位分母log₂3≈1.585。增益3放在第2位时，贡献约1.89279。",
        "boundary": "代码从0开始枚举，因此写position+2；它对应公式从1开始的i+1。"
      }
    ]
  },
  {
    "id": "rec12-ndcg",
    "tex": "\\mathrm{NDCG}@K=\\frac{\\mathrm{DCG}@K}{\\mathrm{IDCG}@K}.",
    "parts": [
      {
        "id": "ndcg-actual-dcg",
        "part": "\\mathrm{DCG}@K",
        "title": "分子DCG：实际返回列表的表现",
        "meaning": "按照实际返回顺序，对前K个位置计算得到的折损增益。",
        "role": "它是当前模型得到的收益，下一步与同一问题的理想收益比较。",
        "example": "返回[a,b]，相关度为[2,0]，K=2时分子为3；漏掉的c不会替实际列表加分。"
      },
      {
        "id": "ndcg-complete-candidate-idcg",
        "part": "\\mathrm{IDCG}@K",
        "title": "IDCG：完整合法候选里的理想基准",
        "meaning": "把同一完整候选集合按真实相关度从高到低排列，再计算理想前K项的DCG。",
        "role": "作为固定分母，让当前列表相对这个理想基准归一化；未返回的合法候选仍参与。",
        "example": "a、b、c的相关度为2、0、3；理想前2项是[c,a]，IDCG≈8.89279。实际3除以它得到约0.33735。",
        "boundary": "完整候选无正相关项时IDCG=0，比值本身未定义。本页代码额外约定记0并报告空候选/无相关项状态；汇总时披露是否纳入。"
      }
    ]
  }
];

  function annotate(rule) {
    const ranges = [];
    for (const part of rule.parts) {
      let at = 0, count = 0;
      while ((at = rule.tex.indexOf(part.part, at)) !== -1) {
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
      tex = tex.slice(0, range.start) + T`\htmlData{rec12-term=` +
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
    if (path.pop() !== '12-评估与AB实验.html' || path.pop() !== '推荐算法' ||
        !document.body.matches('.rec-evaluation-reading.rec-12') ||
        document.documentElement.dataset.rec12FormulaHelp) return;
    const report = {expected: rules.length, matched: [], errors: [], terms: 0, targets: 0};
    window.Rec12FormulaHelpStatus = report;
    const fail = message => {
      report.errors.push(message);
      console.error('[Rec12FormulaHelp] ' + message);
    };
    if (!window.katex) { fail('KaTeX 未就绪，保留原式。'); return; }
    const main = document.querySelector('main');
    if (!main) { fail('缺少 main，未绑定。'); return; }
    const dialog = document.createElement('dialog');
    if (typeof dialog.showModal !== 'function') { fail('不支持 dialog，保留原式。'); return; }
    document.documentElement.dataset.rec12FormulaHelp = '1';
    dialog.id = 'rec12-formula-dialog';
    dialog.setAttribute('aria-labelledby', 'rec12-formula-title');
    dialog.innerHTML = '<header class="rec12-fh-header"><div><p class="rec12-fh-eyebrow">这条公式里的作用</p><h2 id="rec12-formula-title"></h2></div><button type="button" class="rec12-fh-close" aria-label="关闭公式解释">×</button></header><div class="rec12-fh-body"><div class="rec12-fh-selected" tabindex="0" role="region" aria-label="选中的公式组合，可横向滚动"></div><h3>它是什么</h3><p class="rec12-fh-meaning"></p><h3>在本式里做什么</h3><p class="rec12-fh-role"></p><section class="rec12-fh-example"><h3>用本页小例子看</h3><p></p></section><details class="rec12-fh-boundary"><summary>再看一个适用边界</summary><p></p></details><details class="rec12-fh-original"><summary>对照完整原式</summary><div class="rec12-fh-context" tabindex="0" role="region" aria-label="完整原式，可横向滚动"></div></details></div><footer class="rec12-fh-footer"><button type="button">关闭，回到公式</button></footer>';
    document.body.append(dialog);
    const root = document.documentElement;
    let active = null, serial = 0;
    const body = dialog.querySelector('.rec12-fh-body');
    const closeButton = dialog.querySelector('.rec12-fh-close');
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
      if (!saved.hadClass) document.body.classList.remove('rec12-formula-modal-open');
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
    dialog.querySelector('.rec12-fh-footer button').addEventListener('click', close);
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
    dialog.querySelector('.rec12-fh-original').addEventListener('toggle', event => {
      if (!dialog.open || !event.currentTarget.open) return;
      const missing = dialog.querySelector('.rec12-fh-context').getBoundingClientRect().bottom -
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
      dialog.dataset.rec12Term = part.id;
      dialog.querySelector('h2').textContent = part.title;
      dialog.querySelector('.rec12-fh-meaning').textContent = part.meaning;
      dialog.querySelector('.rec12-fh-role').textContent = part.role;
      dialog.querySelector('.rec12-fh-example p').textContent = part.example;
      const boundary = dialog.querySelector('.rec12-fh-boundary');
      boundary.hidden = !part.boundary;
      boundary.querySelector('p').textContent = part.boundary || '';
      for (const details of dialog.querySelectorAll('details')) details.open = false;
      try {
        for (const [tex, selector] of [[part.part, '.rec12-fh-selected'], [rule.tex, '.rec12-fh-context']]) {
          window.katex.render(tex, dialog.querySelector(selector),
            {displayMode: true, throwOnError: true, strict: 'ignore', trust: false});
        }
      } catch (error) { fail(part.id + ': 弹窗渲染失败 ' + error.message); return; }
      const rootStyles = Object.fromEntries(['overflow-x', 'overflow-y', 'scrollbar-gutter',
        'scroll-behavior'].map(name => [name, readStyle(root, name)]));
      active = {id: ++serial, trigger, x: window.scrollX, y: window.scrollY, rootStyles,
        bodyBehavior: readStyle(document.body, 'scroll-behavior'),
        hadClass: document.body.classList.contains('rec12-formula-modal-open')};
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
      document.body.classList.add('rec12-formula-modal-open');
      body.scrollTop = 0;
      for (const scroller of dialog.querySelectorAll('.rec12-fh-selected, .rec12-fh-context')) {
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
      const wrappers = main.querySelectorAll('[data-rec12-formula="' + rule.id + '"]');
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
      const targets = [...visible.querySelectorAll('[data-rec12-term]')];
      if (targets.length !== annotated.targetCount ||
          rule.parts.some(part => targets.filter(t => t.dataset.rec12Term === part.id).length !== (part.count || 1))) {
        fail(rule.id + ': 可见局部数不匹配，未绑定'); continue;
      }
      for (const target of targets) {
        const part = rule.parts.find(p => p.id === target.dataset.rec12Term);
        target.classList.add('rec12-fh-target');
        bind(target, rule, part);
      }
      // Preserve original MathML/TeX. Expose only local visual buttons to AT.
      // Hide non-target sibling branches, never an ancestor of another target.
      visible.removeAttribute('aria-hidden');
      function hideNonInteractive(node) {
        for (const child of node.children) {
          if (child.matches('[data-rec12-term]')) continue;
          if (child.querySelector('[data-rec12-term]')) hideNonInteractive(child);
          else child.setAttribute('aria-hidden', 'true');
        }
      }
      hideNonInteractive(visible);
      originalVisible.replaceWith(visible);
      displays[0].tabIndex = 0;
      displays[0].setAttribute('role', 'region');
      displays[0].setAttribute('aria-label', '当前公式，可横向滚动；着色组合可打开解释');
      wrapper.classList.add('rec12-fh-bound');
      const menu = document.createElement('details');
      menu.className = 'rec12-fh-menu';
      const summary = document.createElement('summary');
      summary.textContent = '解释目录（公式内也可点击）';
      menu.append(summary);
      const controls = document.createElement('div');
      controls.className = 'rec12-fh-controls';
      for (const part of rule.parts) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'rec12-fh-trigger';
        button.dataset.rec12Term = part.id;
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
      delete document.documentElement.dataset.rec12FormulaHelp;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
