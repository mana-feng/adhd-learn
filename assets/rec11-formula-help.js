/* Candidate: chapter 11 only. No shared dictionary or global KaTeX changes. */
(() => {
  'use strict';
  const T = String.raw;
  const rules = [
    {id: 'mmr-redundancy', tex: T`r(i)=\max_{j\in S}\mathrm{sim}(i,j).`, parts: [
      {id: 'mmr-r-definition', part: 'r(i)', title: 'r(i)：这个候选的最大冗余',
        meaning: '候选 i 与已选前缀中最相似的那一项，有多相似。',
        role: '把多次两两比较压成一个惩罚值，下一式会减去它的加权值。',
        example: '已经选了 0 时，本页候选 1 的 r=.9，候选 2 的 r=.1；这还不是最终选择分数。'},
      {id: 'mmr-max-redundancy', part: T`\max`, title: 'max：只取最大的一次相似度',
        meaning: '在下标指定的已选物品中取最大值，不是求平均。',
        role: '只要候选与某个已选物品很像，就会得到较大的冗余项。',
        example: '如果与两个已选物品的相似度是 .2 和 .9，这里取 .9。',
        boundary: '这个最大值不代表整份列表的全部关系。S 为空时本页不算此式，而是先按最高相关性选首项。'},
      {id: 'mmr-prefix-s', part: 'S', title: 'MMR 的 S：已经选出的前缀',
        meaning: '本轮逐项选择中，已经放进结果的那些物品。',
        role: '限制冗余比较对象：只与已选物品比较，不与所有候选比较。',
        example: '首项选了物品 0 后，S={0}。再选物品 2 后，下一轮对 S={0,2} 计算最大相似度。'},
      {id: 'mmr-similarity', part: T`\mathrm{sim}(i,j)`, title: 'sim(i,j)：候选与已选项的相似度',
        meaning: '这里由输入矩阵指定 i 与 j 有多像，数值越大表示越相似。',
        role: '它是最大冗余的原料；不是候选对用户的相关性 rel(i)。',
        example: '教学矩阵规定 sim(1,0)=.9、sim(2,0)=.1。内容标签不自动决定这两个数。',
        boundary: '本页 MMR 接受有限实数业务相似度，不要求它是 DPP 的半正定核；是否符合用户感受仍需验证。'}
    ]},
    {id: 'mmr-value', tex: T`v(i)=\lambda\,\mathrm{rel}(i)-(1-\lambda)r(i).`, parts: [
      {id: 'mmr-value-definition', part: 'v(i)', title: 'v(i)：这一轮用来比较的分数',
        meaning: '相关性奖励减去最大冗余惩罚后的数值，不是点击概率。',
        role: '把当前候选的两种考虑放在同一个比较式里，下一步取 v 最大的候选。',
        example: 'λ=.5 时，候选 1 得 .5×.9−.5×.9=0；候选 2 得 .5×.8−.5×.1=.35。'},
      {id: 'mmr-lambda', part: T`\lambda`, count: 2, title: 'λ：本式两项的相对权重',
        meaning: '本例取 0 到 1：λ 乘相关性，1−λ 乘最大冗余。',
        role: '调节当步选择偏重相关性还是去冗余；不能脱离两类分数的尺度来解释。',
        example: 'λ=.5 时原分数选 [0,2]；仅把相关性乘 10，同一 λ 就选 [0,1]。',
        boundary: '首项仍按最高相关性初始化，即使 λ=0。后续 λ=0 只看去冗余，λ=1 只看相关性；最终 ILD、CTR 或留存都没有单调保证。'},
      {id: 'mmr-relevance', part: T`\mathrm{rel}(i)`, title: 'rel(i)：候选对当前请求的相关性',
        meaning: '输入的单项相关性分数，表示候选对当前用户或请求有多合适。',
        role: '作为正向奖励，与重复惩罚一起参与选择；它不一定经过概率校准。',
        example: '三个候选的分数为 1、.9、.8。首项选 0；后续不一定仍按这个原始顺序。',
        boundary: '乘正常数保留相关性排序，却会改变它相对冗余的大小，所以可能改变 MMR 结果。'},
      {id: 'mmr-r-penalty', part: 'r(i)', title: 'r(i)：在分数里扣掉最大冗余',
        meaning: '上一式得到的最大相似度，不是另一套独立指标。',
        role: '乘 1−λ 后被减去。相同相关性下，更重复的候选通常因此处于劣势。',
        example: 'λ=.5 时，候选 1 的冗余罚分是 .45，候选 2 的冗余罚分是 .05。'}
    ]},
    {id: 'mmr-choice', tex: T`i^\star=\arg\max_{i\in R\setminus S}v(i).`, parts: [
      {id: 'mmr-argmax', part: T`\arg\max`, title: 'arg max：返回分数最大的物品',
        meaning: 'max 返回最大分数；arg max 返回取得这个分数的候选。',
        role: '本轮把该候选加入结果前缀，然后更新冗余，再选下一项。',
        example: '候选 1 的 v=0、候选 2 的 v=.35 时，返回物品 2，不是返回 .35。',
        boundary: '数学上可能并列；本页代码用较小输入索引打破严格同分。这是逐步贪心，不是所有列表的全局最优搜索。'},
      {id: 'mmr-remaining', part: T`R\setminus S`, title: 'R∖S：还没有选中的候选',
        meaning: 'R 是本轮候选集合；减去已经选出的前缀 S，留下可继续选择的项。',
        role: '防止同一个输入物品被重复选入结果。',
        example: 'R={0,1,2}、S={0} 时，这一轮只比较 1 和 2。请求 5 项也不会凭空得到 5 个不同物品。'},
      {id: 'mmr-value-selection', part: 'v(i)', title: 'v(i)：用于本轮取最大的数',
        meaning: '紧邻上一式定义的加权分数，随已选前缀变化而变化。',
        role: '只在剩余候选间比较当前 v，而不是一次算好后永远不更新。',
        example: '已经选了 0 时，λ=.5 下候选 2 的 .35 高于候选 1 的 0，所以接着选 2。'}
    ]},
    {id: 'dpp-kernel', tex: T`L_{ij}=q_iq_j\langle\phi_i,\phi_j\rangle.`, parts: [
      {id: 'dpp-kernel-entry', part: 'L_{ij}', title: 'Lᵢⱼ：Gram 核矩阵的一格',
        meaning: '把各项带质量尺度的向量两两做内积，得到矩阵 L；这里是第 i 行、第 j 列。',
        role: '后面挑出子矩阵并算行列式，给整个子集赋权重，不是把这一格直接当概率。',
        example: '两向量为 (2,0)、(0,3) 时，L 的对角是 4、9，非对角为 0。',
        boundary: '这种 Gram 构造保证 L 半正定，也就保证集合权重不为负。任意业务相似度表不一定是合法的 DPP 核。'},
      {id: 'dpp-quality', part: 'q_iq_j', title: 'qᵢqⱼ：两个质量系数',
        meaning: 'qᵢ 是本例非负的质量系数，用来缩放物品 i 的向量长度。',
        role: '方向不变时，质量尺度越大，相关的 Gram 元素和集合权重会随之改变。',
        example: '这里可以固定 q₁=2、q₂=3，不要求质量相等。',
        boundary: '这里的 q 不是上一章 ANN 的查询向量，也不默认等于 CTR 概率；从预测分数如何得到质量系数需要另行定义。'},
      {id: 'dpp-direction', part: T`\langle\phi_i,\phi_j\rangle`, title: '⟨φᵢ,φⱼ⟩：单位方向的内积',
        meaning: 'φᵢ、φⱼ 是长度为 1 的方向向量；尖括号表示两者的内积，在这里等于夹角余弦。',
        role: '把当前特征空间中的方向关系写进核矩阵，质量长度由 q 单独提供。',
        example: '垂直方向的内积为 0；同向为 1；反向为 −1。',
        boundary: '反向虽然余弦距离为 2，却仍线性相关；DPP 不等于“语义距离越大，权重越大”。'}
    ]},
    {id: 'dpp-choice', tex: T`S^\star\in\arg\max_{\substack{S\subseteq R\\|S|=k}}\det(L_S).`, parts: [
      {id: 'dpp-fixed-argmax', part: T`\arg\max`, title: 'DPP 的 arg max：比较整组权重',
        meaning: '在满足固定大小的子集中，找行列式权重最大的集合；允许多个并列最优。',
        role: '这里写的是固定 k 的选择目标，不是随机采样过程。',
        example: '固定选 2 项时，只比较两项子集，不会因为空集权重较大就改选空集。',
        boundary: '这个目标式不是高效精确算法的承诺。正文讨论的快速贪心是近似选择，不保证一般问题的全局最优。'},
      {id: 'dpp-subset-s', part: T`S\subseteq R`, title: 'DPP 的 S：正在比较的候选子集',
        meaning: 'R 是本次可选物品集合；S 是从 R 中取出的一个子集。',
        role: '这里是在比较整组物品，不是 MMR 中“已经选出的前缀”这个语境。',
        example: 'R={0,1,2}、k=2 时，比较 {0,1}、{0,2}、{1,2} 三个子集。'},
      {id: 'dpp-fixed-size', part: '|S|=k', title: '|S|=k：恰好 k 项的限制',
        meaning: '|S| 是子集中的物品数量；本章把它固定为 k。',
        role: '把变长集合选择与固定长度推荐需求分开。',
        example: 'k=2 时单项和空集都不在这个 arg max 的比较范围内。',
        boundary: 'k-DPP 的随机采样还要对所有 k 项权重归一化。若独立方向不足，即 rank(L)<k，所有 k 项权重为 0，固定 k 的分布无法正规化。'},
      {id: 'dpp-determinant', part: T`\det`, title: 'det：把子矩阵变成集合权重',
        meaning: 'det 表示行列式。在这里，它是带质量向量张成的平行多面体体积平方。',
        role: '一起衡量质量尺度和线性独立性，而不是把各项相关性分数相加。',
        example: '两向量 (2,0)、(0,3) 张成的平行四边形面积为 6，det=36，不是 6 或三角形面积 3。'},
      {id: 'dpp-principal-submatrix', part: 'L_S', title: 'Lₛ：只保留这一子集的行与列',
        meaning: '从同一个 L 中，用 S 的物品索引同时选行和列，得到主子矩阵。',
        role: '让行列式只计算当前子集的集合权重。',
        example: 'S={0,2} 时选原矩阵的第 0、2 行以及第 0、2 列，得到 2×2 矩阵；不是只取两行。'}
    ]},
    {id: 'dpp-pair', tex: T`\det(L_{\{i,j\}})=q_i^2q_j^2(1-\cos^2\theta).`, parts: [
      {id: 'dpp-pair-weight', part: T`\det(L_{\{i,j\}})`, title: '两项权重：平行四边形面积平方',
        meaning: '只取 i、j 两项的 2×2 Gram 主子矩阵，再计算行列式。',
        role: '把一般的体积平方具体化为可以手算的二维例子。',
        example: '固定质量 2、3 时，30° 的面积为 3、权重为 9；90° 的面积为 6、权重为 36。'},
      {id: 'dpp-squared-quality', part: 'q_i^2q_j^2', title: 'qᵢ²qⱼ²：质量尺度的平方乘积',
        meaning: '两向量长度的乘积先给出面积尺度，行列式又把面积平方。',
        role: '因此本式出现的是两个质量系数各自的平方，不是仅 qᵢqⱼ。',
        example: '固定质量为 2 和 3，平方乘积为 4×9=36；剩下再乘夹角因子。'},
      {id: 'dpp-angle-factor', part: T`1-\cos^2\theta`, title: '1−cos²θ：方向独立性的因子',
        meaning: 'θ 是两个单位方向之间的夹角；这一因子也等于 sin²θ。',
        role: '固定质量尺度时，垂直方向取 1；平行或反向都取 0。',
        example: '30° 时因子为 1/4，36×1/4=9；90° 时为 1，得到 36。',
        boundary: '不是要求两项质量相等。也不能把反向自动当成 DPP 最喜欢的“最远”方向：180° 时权重仍为 0。'}
    ]}
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
      tex = tex.slice(0, range.start) + T`\htmlData{rec11-term=` +
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
    if (path.pop() !== '11-重排与多样性.html' || path.pop() !== '推荐算法' ||
        !document.body.matches('.rec-rerank-reading.rec-11') ||
        document.documentElement.dataset.rec11FormulaHelp) return;
    const report = {expected: rules.length, matched: [], errors: [], terms: 0, targets: 0};
    window.Rec11FormulaHelpStatus = report;
    const fail = message => {
      report.errors.push(message);
      console.error('[Rec11FormulaHelp] ' + message);
    };
    if (!window.katex) { fail('KaTeX 未就绪，保留原式。'); return; }
    const main = document.querySelector('main');
    if (!main) { fail('缺少 main，未绑定。'); return; }
    const dialog = document.createElement('dialog');
    if (typeof dialog.showModal !== 'function') { fail('不支持 dialog，保留原式。'); return; }
    document.documentElement.dataset.rec11FormulaHelp = '1';
    dialog.id = 'rec11-formula-dialog';
    dialog.setAttribute('aria-labelledby', 'rec11-formula-title');
    dialog.innerHTML = '<header class="rec11-fh-header"><div><p class="rec11-fh-eyebrow">这条公式里的作用</p><h2 id="rec11-formula-title"></h2></div><button type="button" class="rec11-fh-close" aria-label="关闭公式解释">×</button></header><div class="rec11-fh-body"><div class="rec11-fh-selected" tabindex="0" role="region" aria-label="选中的公式组合，可横向滚动"></div><h3>它是什么</h3><p class="rec11-fh-meaning"></p><h3>在本式里做什么</h3><p class="rec11-fh-role"></p><section class="rec11-fh-example"><h3>用本页小例子看</h3><p></p></section><details class="rec11-fh-boundary"><summary>再看一个适用边界</summary><p></p></details><details class="rec11-fh-original"><summary>对照完整原式</summary><div class="rec11-fh-context" tabindex="0" role="region" aria-label="完整原式，可横向滚动"></div></details></div><footer class="rec11-fh-footer"><button type="button">关闭，回到公式</button></footer>';
    document.body.append(dialog);
    const root = document.documentElement;
    let active = null, serial = 0;
    const body = dialog.querySelector('.rec11-fh-body');
    const closeButton = dialog.querySelector('.rec11-fh-close');
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
      if (!saved.hadClass) document.body.classList.remove('rec11-formula-modal-open');
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
    dialog.querySelector('.rec11-fh-footer button').addEventListener('click', close);
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
    dialog.querySelector('.rec11-fh-original').addEventListener('toggle', event => {
      if (!dialog.open || !event.currentTarget.open) return;
      const missing = dialog.querySelector('.rec11-fh-context').getBoundingClientRect().bottom -
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
      dialog.dataset.rec11Term = part.id;
      dialog.querySelector('h2').textContent = part.title;
      dialog.querySelector('.rec11-fh-meaning').textContent = part.meaning;
      dialog.querySelector('.rec11-fh-role').textContent = part.role;
      dialog.querySelector('.rec11-fh-example p').textContent = part.example;
      const boundary = dialog.querySelector('.rec11-fh-boundary');
      boundary.hidden = !part.boundary;
      boundary.querySelector('p').textContent = part.boundary || '';
      for (const details of dialog.querySelectorAll('details')) details.open = false;
      try {
        for (const [tex, selector] of [[part.part, '.rec11-fh-selected'], [rule.tex, '.rec11-fh-context']]) {
          window.katex.render(tex, dialog.querySelector(selector),
            {displayMode: true, throwOnError: true, strict: 'ignore', trust: false});
        }
      } catch (error) { fail(part.id + ': 弹窗渲染失败 ' + error.message); return; }
      const rootStyles = Object.fromEntries(['overflow-x', 'overflow-y', 'scrollbar-gutter',
        'scroll-behavior'].map(name => [name, readStyle(root, name)]));
      active = {id: ++serial, trigger, x: window.scrollX, y: window.scrollY, rootStyles,
        bodyBehavior: readStyle(document.body, 'scroll-behavior'),
        hadClass: document.body.classList.contains('rec11-formula-modal-open')};
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
      document.body.classList.add('rec11-formula-modal-open');
      body.scrollTop = 0;
      for (const scroller of dialog.querySelectorAll('.rec11-fh-selected, .rec11-fh-context')) {
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
      const wrappers = main.querySelectorAll('[data-rec11-formula="' + rule.id + '"]');
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
      const targets = [...visible.querySelectorAll('[data-rec11-term]')];
      if (targets.length !== annotated.targetCount ||
          rule.parts.some(part => targets.filter(t => t.dataset.rec11Term === part.id).length !== (part.count || 1))) {
        fail(rule.id + ': 可见局部数不匹配，未绑定'); continue;
      }
      for (const target of targets) {
        const part = rule.parts.find(p => p.id === target.dataset.rec11Term);
        target.classList.add('rec11-fh-target');
        bind(target, rule, part);
      }
      // Preserve original MathML/TeX. Expose only local visual buttons to AT.
      // Hide non-target sibling branches, never an ancestor of another target.
      visible.removeAttribute('aria-hidden');
      function hideNonInteractive(node) {
        for (const child of node.children) {
          if (child.matches('[data-rec11-term]')) continue;
          if (child.querySelector('[data-rec11-term]')) hideNonInteractive(child);
          else child.setAttribute('aria-hidden', 'true');
        }
      }
      hideNonInteractive(visible);
      originalVisible.replaceWith(visible);
      displays[0].tabIndex = 0;
      displays[0].setAttribute('role', 'region');
      displays[0].setAttribute('aria-label', '当前公式，可横向滚动；着色组合可打开解释');
      wrapper.classList.add('rec11-fh-bound');
      const menu = document.createElement('details');
      menu.className = 'rec11-fh-menu';
      const summary = document.createElement('summary');
      summary.textContent = '解释目录（公式内也可点击）';
      menu.append(summary);
      const controls = document.createElement('div');
      controls.className = 'rec11-fh-controls';
      for (const part of rule.parts) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'rec11-fh-trigger';
        button.dataset.rec11Term = part.id;
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
      delete document.documentElement.dataset.rec11FormulaHelp;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
