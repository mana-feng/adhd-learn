/* Scoped, contextual explanations for audited RL chapters. Original MathML/TeX stays untouched. */
(function () {
  'use strict';
  const R = s => s.replaceAll('@', String.fromCharCode(92));
  const compact = s => s.replace(/\s+/g, '');
  const catalogs = {
    '10-Actor-Critic.html': [
      {
        "id": "ac-td-continuation",
        "tex": "\\delta_t=r_t+\\gamma(1-d_t)V_w(s_{t+1})-V_w(s_t)",
        "part": "\\gamma(1-d_t)V_w(s_{t+1})",
        "title": "下一状态价值：还会继续，才把预测加回来",
        "meaning": "下一状态的价值项，是 Critic 对从下一状态开始的后续回报的估计；γ 是折扣，d 表示是否真正终止。",
        "role": "它提供尚未观察到的未来部分。真正终止 d=1 时此项为0；外部截断但任务可继续时 d=0，使用截断前最后观测，不用重置后的新状态。",
        "example": "本页 γ=1，奖励1、当前预测2、下一预测3：未终止 δ=1+3−2=2；真正终止 δ=1−2=−1。"
      },
      {
        "id": "ac-true-advantage",
        "tex": "A^\\pi(s,a)=Q^\\pi(s,a)-V^\\pi(s)",
        "part": "Q^\\pi(s,a)-V^\\pi(s)",
        "title": "真优势：这个动作比当前策略平均好多少",
        "meaning": "真实 Q 是先选该动作再按当前策略继续的期望回报；真实 V 是当前策略在该状态的平均回报，两者相减定义真优势。",
        "role": "它是相对于当前策略的比较，不表示 Q 的绝对值没有意义。实际网络给出的 TD 或 GAE 只是优势估计，不能无条件当作这条等式中的真 A。",
        "example": "两个动作各50%，Q为1001与999，V=1000，优势为+1、−1；概率总和为1，两个动作的概率不能同时上涨。"
      },
      {
        "id": "ac-gae-carry",
        "tex": "\\hat A_t=\\delta_t+\\gamma\\lambda c_t\\hat A_{t+1}",
        "part": "\\gamma\\lambda c_t\\hat A_{t+1}",
        "title": "GAE 的后续项：哪些误差可以接回来",
        "meaning": "把下一时刻已算好的优势按 γλ 缩放；c_t 只在后续误差仍属于同一连续片段时允许接入。",
        "role": "它控制误差递推，不是 TD 自举开关 d_t。终止、外部截断后不能接新回合；本批末尾没有后续采样项。外部截断可同时 d=0、c=0。",
        "example": "本页两步 δ=1.5、1，γ=1：第一步估计为1.5+λ；λ=.95时2.45，λ=1时2.5=完整回报3−当前预测.5。"
      }
    ],
    '附录A-速查.html': [
      {
        "id": "reference-discount",
        "tex": "g_t=\\gamma^t\\nabla_\\theta\\log\\pi_\\theta(a_t\\mid s_t)A_t",
        "part": "\\gamma^t",
        "title": "γᵗ：从起点目标看这一时刻的权重",
        "meaning": "这里的目标 Jγ 是从初始状态开始计算的期望折扣回报。第 t 步的策略梯度贡献还带着 γ 的 t 次方。",
        "role": "Gₜ 自己的折扣是从时刻 t 重新开始数的；γᵗ 把这一步放回从起点计分的目标。γ=1 时它等于 1，采用等价折扣状态采样时也可以把它吸收到采样权重中，不能默默漏掉。",
        "example": "γ=0.5、t=2 时 γᵗ=0.25。同一份从当前时刻算起的优势，在起点折扣目标中乘上这个权重。"
      },
      {
        "id": "reference-gae-weight",
        "tex": "\\hat A_t^{\\mathrm{GAE}(\\lambda)}=\\sum_{l=0}^{K-1}(\\gamma\\lambda)^l\\delta_{t+l}",
        "part": "(\\gamma\\lambda)^l\\delta_{t+l}",
        "title": "GAE 的一项：未来 TD 误差乘衰减权重",
        "meaning": "取同一段轨迹中后面第 l 步的 TD 误差，再乘 (γλ) 的 l 次方，最后在有限 K 步内相加。",
        "role": "γ 来自折扣定义，λ 调节把多远的 TD 误差纳入优势。它们不允许越过 reset 拼接新回合。λ=1 到真正终止时得到 Gₜ−V(sₜ)，并不是 Gₜ。",
        "example": "γ=0.9、λ=0.5，下一步 δₜ₊₁=2，那么它贡献 0.45×2=0.9；当前 δₜ 的权重为 1。"
      },
      {
        "id": "reference-dpo-margin",
        "tex": "m=\\beta(d_\\theta-d_{\\rm ref})",
        "part": "\\beta(d_\\theta-d_{\\rm ref})",
        "title": "DPO 间隔：相对参考的偏好差",
        "meaning": "dθ 是当前策略对同一提示下赢家与输家的回答 log-probability 差；dref 是固定参考模型的同一差。相减后再乘 β。",
        "role": "这个量送入 −log σ(m)，用来鼓励相对偏好变化。它不是赢家回答的生成概率，也不保证实际 KL 随 β 单调变化。",
        "example": "当前赢家/输家概率比为 5，参考比为 2，β=0.1，则 m=0.1×log(5/2)≈0.0916。"
      }
    ],
    '09-策略梯度.html': [
      {
        id: 'pg-score',
        tex: R('z_t=@nabla_@theta@log@pi_@theta(a_t|s_t)'),
        part: R('@nabla_@theta@log@pi_@theta(a_t|s_t)'),
        title: 'z：提高已采样动作对数概率的方向',
        meaning: '先取当前策略对这个已采样动作的对数概率，再对策略参数 θ 求梯度。结果是参数方向，不是动作概率。',
        role: '回报或优势会乘在这个方向上：正权重鼓励该样本动作，负权重抑制它。不同样本和共享参数会相互影响，所有动作概率不能同时上涨。',
        example: '两个按钮等概率时，若用单个参数令 p(按钮1)=sigmoid(θ)，按钮1的 z 为 0.5，按钮0为 −0.5；换参数化后数值也会变。'
      },
      {
        id: 'pg-return',
        tex: R('G_t=@sum_{k=t}^{T-1}r_k'),
        part: R('@sum_{k=t}^{T-1}r_k'),
        title: 'reward-to-go：只加这一步及之后的奖励',
        meaning: '从当前动作之后得到的 r_t 开始，一直加到本回合最后一步；本页主线 γ=1，没有折扣。',
        role: '它替换整局回报作为当前动作的权重，去掉动作不可能影响的过去奖励；不同回合不能首尾相接继续累加。',
        example: '两步的奖励为 [2,3]，第一步的 G 是 5，第二步是 3。第二步不能再把已经拿到的 2 分算进去。'
      },
      {
        id: 'pg-baseline',
        tex: R('w_t=G_t-b(s_t)'),
        part: 'G_t-b(s_t)',
        title: '减基线：评价这次比参考水平好多少',
        meaning: '这一步的采样未来回报减去状态参考值，得到策略梯度的权重。',
        role: '给定状态或历史后，基线不能依赖本次抽到的动作；在策略分支停止梯度。保持期望不变，不代表任何基线都能降低方差。',
        example: '回报为 1 或 2、各占一半时，基线 1.5 让权重成为 −0.5 或 +0.5；正文的单参数例子还展示了基线 100 会把方差放大。'
      }
    ],
    '11-PPO.html': [
      {
        id: 'ppo-ratio',
        tex: R('@rho_t=@frac{@pi_@theta(a_t@mid s_t)}{@pi_{@rm old}(a_t@mid s_t)}'),
        part: R('@frac{@pi_@theta(a_t@mid s_t)}{@pi_{@rm old}(a_t@mid s_t)}'),
        title: 'ρ：同一动作的新旧概率比',
        meaning: '在同一个状态下，当前策略给这个已采样动作的概率，除以采样时旧策略给它的概率。',
        role: '分母在这一批更新中固定，分子重新计算。它衡量这个动作的相对变化；不是整个策略的 KL，也不是与 RLHF 参考模型比较。连续动作使用概率密度比。',
        example: '旧概率 0.4，新概率 0.6，ρ=1.5：相对增加 50%，不是增加 50 个百分点。'
      },
      {
        id: 'ppo-clip',
        tex: R('c_t=@operatorname{clip}(@rho_t,1-@epsilon,1+@epsilon)'),
        part: R('@operatorname{clip}(@rho_t,1-@epsilon,1+@epsilon)'),
        title: 'clip：只夹住参与计算的 c',
        meaning: '把输入比值限制到 1−ε 与 1+ε 之间，得到另一个数 c。',
        role: '这个 c 用于裁剪代理项；实际网络的概率比 ρ 没有被强制夹进区间，参考策略 KL 也没有因此得到硬上限。',
        example: 'ε=0.2、ρ=1.5 时，c=1.2；ρ 仍然是 1.5。'
      },
      {
        id: 'ppo-min',
        tex: R('@ell_t=@min(@rho_t A_t,@ c_t A_t)'),
        part: R('@min(@rho_t A_t,@ c_t A_t)'),
        title: 'min：取两个代理项中较小者',
        meaning: '先分别算 ρA 和 cA，再取较小的数。这一项是要最大化的，代码通常最小化它的负数。',
        role: '它只在有利方向越过裁剪边界后停止提供额外收益。A 的符号很重要；这个代理项不是实际环境回报的普遍下界。',
        example: 'ε=0.2、ρ=1.5：A=2 时取 min(3,2.4)=2.4；A=−2 时取 min(−3,−2.4)=−3。'
      }
    ],
    '12-RLHF全流程.html': [
      {
        id: 'rlhf-reward-gap',
        tex: R('@Delta r=r(x,y_{win})-r(x,y_{lose})'),
        part: 'r(x,y_{win})-r(x,y_{lose})',
        title: 'Δr：同题两个回答的奖励分差',
        meaning: '奖励模型给标注赢家的分数，减去给标注输家的分数；两份回答对应同一个提示 x。',
        role: 'Bradley–Terry 模型把这个差送进 sigmoid 来拟合偏好。分差比绝对分数重要，奖励分数本身不是客观质量刻度。',
        example: '赢家 2 分、输家 1 分，Δr=1。两者同时加 10 分，差仍然是 1。'
      },
      {
        id: 'rlhf-logsigmoid',
        tex: R('L=-@log@sigma(@Delta r)'),
        part: R('-@log@sigma(@Delta r)'),
        title: '−log σ：把偏好概率变成损失',
        meaning: '先用 sigmoid 把分差映射到 0 与 1 之间，再取负对数；这里希望损失越小越好。',
        role: '它惩罚模型没有给标注赢家更高分的情况。拟合了标签不代表标签正确，也不意味着回答事实正确。',
        example: 'Δr=0 时 σ=0.5，损失约 0.693；Δr=1 时，损失约 0.313。'
      },
      {
        id: 'rlhf-group-advantage',
        tex: R('@hat A_i=@frac{r_i-@bar r}{s_r+@epsilon_{num}}'),
        part: R('@frac{r_i-@bar r}{s_r+@epsilon_{num}}'),
        title: '组相对优势：居中后按标准差缩放',
        meaning: '本回答奖励减去同题这一组回答的平均奖励，再除以组内标准差加防除零的小数。',
        role: '它提供同组相对信号，不是逐 token 的真实优势，也不是绝对质量。标准差缩放会改变训练权重；ε_num 不是 PPO 裁剪参数。',
        example: '组奖励 [1,1,0,0] 的均值与总体标准差都是 0.5；忽略很小的 ε_num，得到 [1,1,−1,−1]。'
      },
      {
        id: 'rlhf-nonnegative-kl',
        tex: R('@hat k(a)=u(a)-@log u(a)-1@ge0'),
        part: R('u(a)-@log u(a)-1'),
        title: '非负 KL 样本项：u−log u−1',
        meaning: '这里 u=q(a)/p(a)，p 是当前 token 分布，q 是参考分布。对正的 u，这个组合总是不小于 0。',
        role: '只有 token 按当前 p 采样且两分布满足文中支持条件时，其期望才等于 KL(p‖q)。旧策略采样后的多轮更新不能无条件沿用这个无偏结论；数值无偏也不是梯度无偏的保证。',
        example: 'p(a)=0.8、q(a)=0.5 时，u=0.625，样本项约 0.0950；这一个样本值还不是整套分布的 KL。'
      }
    ],
    '13-DPO与免RL对齐.html': [
      {
        id: 'dpo-reference-gap',
        tex: R('d_{@mathrm{ref}}=@log@pi_{@mathrm{ref}}(y_w|x)-@log@pi_{@mathrm{ref}}(y_l|x)'),
        part: R('@log@pi_{@mathrm{ref}}(y_w|x)-@log@pi_{@mathrm{ref}}(y_l|x)'),
        title: 'd_ref：冻结参考策略里的偏好差',
        meaning: '在同一个提示下，参考策略对完整 chosen 回答的 logprob，减去对完整 rejected 回答的 logprob。',
        role: 'DPO 从当前策略的差 dθ 中减掉它，以衡量相对起点的变化。参考策略冻结；回答 token 与结束边界一致，prompt 和 padding 不计分。',
        example: '参考 chosen 概率为 0.20、rejected 为 0.10，d_ref=log(2)，约 0.693。'
      },
      {
        id: 'dpo-margin',
        tex: R('m=@beta(d_@theta-d_{@mathrm{ref}})'),
        part: R('@beta(d_@theta-d_{@mathrm{ref}})'),
        title: 'β 间隔：缩放相对参考的偏好变化',
        meaning: '当前偏好差减去冻结参考的偏好差，再乘 β。',
        role: '它是下一条 log-sigmoid 损失的输入。β 会影响梯度，不是有限步训练中 KL 偏移的单调保证；直接设 β=0 时，这个标准 DPO 目标对策略的梯度也为 0。',
        example: '当前 chosen/rejected 概率比为 5，参考比为 2，β=0.1，则 m=0.1×log(5/2)，约 0.0916。'
      },
      {
        id: 'dpo-logsigmoid',
        tex: R('@ell_{@mathrm{DPO}}=-@log@sigma(m)'),
        part: R('-@log@sigma(m)'),
        title: '−log σ(m)：单条偏好记录的 DPO 损失',
        meaning: '把偏好间隔 m 经过 sigmoid 转为偏好概率，再取负对数；多条记录各自计算后求平均。',
        role: '在这条记录中，m 越大损失越小。σ(m) 是偏好模型的胜出概率，不是 chosen 文本的生成概率；损失下降不能替代独立质量评价。',
        example: '策略刚好等于参考时 m=0，损失约 0.693。某条 chosen 概率下降时，相对间隔仍可能改善。'
      }
    ]
  };

  function init() {
    let segments;
    try { segments = decodeURIComponent(location.pathname).split('/'); }
    catch (_) { return; }
    const filename = segments.pop();
    if (segments.pop() !== '强化学习基础' || !catalogs[filename]) return;
    if (document.documentElement.dataset.rlFormulaHelp) return;
    document.documentElement.dataset.rlFormulaHelp = '1';
    const rules = catalogs[filename];
    const report = {page: filename, expected: rules.length, matched: [], errors: []};
    window.RLFormulaHelpStatus = report;
    function fail(message) {
      report.errors.push(message);
      console.error('[RLFormulaHelp] ' + filename + ': ' + message);
    }
    if (!window.katex) { fail('KaTeX 未就绪；保留原公式，不添加解释。'); return; }
    const main = document.querySelector('main');
    if (!main) { fail('未找到正文 main；未修改页面。'); return; }
    const displays = [...main.querySelectorAll('.katex-display')];
    const getTex = display => display.querySelector('.katex-mathml annotation[encoding="application/x-tex"]')?.textContent;
    let opener = null;
    const dialog = document.createElement('dialog');
    dialog.id = 'rl-formula-help-dialog';
    dialog.setAttribute('aria-labelledby', 'rl-formula-help-title');
    dialog.innerHTML = '<header class="rl-fh-header"><div><p class="rl-fh-eyebrow">当前公式的局部读法</p><h2 id="rl-formula-help-title"></h2></div><button type="button" class="rl-fh-close" aria-label="关闭公式解释">×</button></header><div class="rl-fh-body"><div class="rl-fh-selected" tabindex="0" role="region" aria-label="选中的公式组合，可横向滚动"></div><h3>它是什么</h3><p class="rl-fh-meaning"></p><h3>在当前公式中做什么</h3><p class="rl-fh-role"></p><section class="rl-fh-example"><h3>看一个小例子</h3><p></p></section><details><summary>对照完整原式</summary><div class="rl-fh-context" tabindex="0" role="region" aria-label="完整原式，可横向滚动"></div></details></div><footer class="rl-fh-footer"><button type="button">关闭，回到公式</button></footer>';
    document.body.appendChild(dialog);
    const closeButton = dialog.querySelector('.rl-fh-close');
    const body = dialog.querySelector('.rl-fh-body');
    dialog.querySelector('details').addEventListener('toggle', event => {
      if (!event.currentTarget.open || !dialog.open) return;
      // Reveal the newly expanded equation by scrolling only the reading body.
      // Do not scroll the dialog/page, which would move its close controls.
      const context = dialog.querySelector('.rl-fh-context');
      const missing = context.getBoundingClientRect().bottom - body.getBoundingClientRect().bottom;
      if (missing > 0) body.scrollTop += missing + 16;
    });
    function close() { dialog.close(); }
    closeButton.addEventListener('click', close);
    dialog.querySelector('.rl-fh-footer button').addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('rl-formula-modal-open');
      if (opener?.isConnected) opener.focus({preventScroll: true});
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) close();
    });
    function renderMath(tex, host) {
      katex.render(tex, host, {displayMode: true, throwOnError: true, strict: 'ignore', trust: false});
    }
    function show(rule, originalTex, trigger) {
      // Keyboard focus may have started the site's smooth page scroll. Stop it
      // before putting a top-layer dialog on the screen; otherwise Chromium can
      // still composite the dialog at the old scrolling offset in screenshots
      // and during the first visible frames.
      window.scrollTo({left: window.scrollX, top: window.scrollY, behavior: 'instant'});
      const triggerBox = trigger.getBoundingClientRect();
      const navigationBottom = document.querySelector('header.site')?.getBoundingClientRect().bottom || 0;
      if (triggerBox.top < Math.max(0, navigationBottom) + 12 || triggerBox.bottom > innerHeight - 12) {
        trigger.scrollIntoView({block: 'center', inline: 'nearest', behavior: 'instant'});
      }
      opener = trigger;
      dialog.querySelector('h2').textContent = rule.title;
      dialog.querySelector('.rl-fh-meaning').textContent = rule.meaning;
      dialog.querySelector('.rl-fh-role').textContent = rule.role;
      dialog.querySelector('.rl-fh-example p').textContent = rule.example;
      try {
        renderMath(rule.part, dialog.querySelector('.rl-fh-selected'));
        renderMath(originalTex, dialog.querySelector('.rl-fh-context'));
      } catch (error) { fail(rule.id + ' 弹窗公式渲染失败：' + error.message); return; }
      dialog.querySelector('details').open = false;
      dialog.showModal();
      document.body.classList.add('rl-formula-modal-open');
      body.scrollTop = 0;
      closeButton.focus({preventScroll: true});
    }

    rules.forEach(rule => {
      const matches = displays.filter(display => compact(getTex(display) || '') === compact(rule.tex));
      if (matches.length !== 1) {
        fail(rule.id + ' 需要唯一整式匹配，实际 ' + matches.length + ' 条；未绑定。');
        return;
      }
      const display = matches[0];
      const originalTex = getTex(display);
      const originalVisible = display.querySelector('.katex > .katex-html');
      if (!originalVisible || display.closest('.rl-fh-formula')) {
        fail(rule.id + ' 可见公式结构不符合预期；未绑定。'); return;
      }
      // Match the full formula first; never infer a meaning from a lone symbol.
      // Whitespace is ignored ONLY for locating a full formula. Never render a
      // compacted TeX string: removing the space in '\\log u' changes the command.
      if (originalTex.split(rule.part).length !== 2) {
        fail(rule.id + ' 局部组合不是唯一匹配；未绑定。'); return;
      }
      const annotated = originalTex.replace(rule.part,
        R('@htmlData{rl-formula-part=') + rule.id + '}{' + rule.part + '}');
      const temporary = document.createElement('span');
      try {
        katex.render(annotated, temporary, {
          displayMode: true, throwOnError: true, strict: 'ignore',
          trust: context => context.command === R('@htmlData')
        });
      } catch (error) { fail(rule.id + ' 标注渲染失败：' + error.message); return; }
      const visible = temporary.querySelector('.katex > .katex-html');
      const targets = visible?.querySelectorAll('[data-rl-formula-part]');
      if (!targets || targets.length !== 1) {
        fail(rule.id + ' 可点击片段数量异常；保留原公式。'); return;
      }
      const target = targets[0];
      target.classList.add('rl-fh-target');
      target.tabIndex = 0;
      target.setAttribute('role', 'button');
      target.setAttribute('aria-label', '解释 ' + rule.title);
      target.setAttribute('aria-haspopup', 'dialog');
      target.setAttribute('aria-controls', dialog.id);
      target.addEventListener('click', () => show(rule, originalTex, target));
      target.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault(); show(rule, originalTex, target);
        }
      });
      // Keep original MathML as the math reading. Expose only the interactive
      // fragment in visual HTML, so a focusable control is not aria-hidden.
      visible.removeAttribute('aria-hidden');
      function hideNonInteractive(node) {
        [...node.children].forEach(child => {
          if (child === target) return;
          if (child.contains(target)) hideNonInteractive(child);
          else child.setAttribute('aria-hidden', 'true');
        });
      }
      hideNonInteractive(visible);
      originalVisible.replaceWith(visible);
      const wrapper = document.createElement('span');
      wrapper.className = 'rl-fh-formula';
      wrapper.dataset.rlFormula = rule.id;
      display.replaceWith(wrapper);
      wrapper.appendChild(display);
      const hint = document.createElement('span');
      hint.className = 'rl-fh-hint';
      hint.textContent = '点击公式中着色的组合，或用下方按钮查看本式解释。';
      wrapper.appendChild(hint);
      const control = document.createElement('button');
      control.type = 'button';
      control.className = 'rl-fh-trigger';
      control.textContent = '解释：' + rule.title;
      control.setAttribute('aria-haspopup', 'dialog');
      control.setAttribute('aria-controls', dialog.id);
      control.addEventListener('click', () => show(rule, originalTex, control));
      wrapper.appendChild(control);
      report.matched.push(rule.id);
      // The existing .katex-mathml and annotation nodes were never replaced.
      if (getTex(display) !== originalTex) fail(rule.id + ' 原式 annotation 意外变化。');
    });
    if (!report.matched.length) dialog.remove();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
