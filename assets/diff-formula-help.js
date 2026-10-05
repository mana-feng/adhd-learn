/* page-local formula explanations for diffusion chapters 04, 05 and 06.
 * No shared engine is changed. Full original TeX must match exactly (outer
 * whitespace only is trimmed); a lone symbol can never activate a rule.
 */
(function () {
  'use strict';
  const T = String.raw;
  const catalogs = {
    '06-条件控制与CFG.html': {
      locked: true,
      rules: [
        {
          id: 'cfg-prediction-difference', title: 'CFG：沿两份预测的差走多远',
          tex: T`\tilde{\varepsilon} = \varepsilon_{\text{uncond}} + s \cdot (\varepsilon_{\text{cond}} - \varepsilon_{\text{uncond}})`,
          part: T`s \cdot (\varepsilon_{\text{cond}} - \varepsilon_{\text{uncond}})`,
          meaning: 'ε_cond 是带指定语义条件的预测，ε_uncond 是训练时约定的空语义条件下的预测。两者必须来自同一个带噪状态、同一个时间，并使用相同预测参数化。括号求两份预测的差，s 再缩放这份差。',
          role: '把这份改变量加到 ε_uncond 上，得到本步使用的合成预测。s=1 正好返回 ε_cond；当两份预测不同，s>1 才会越过条件预测继续外推。这是在预测空间里运算，不是混合两张最终图片。',
          example: '用一维数值看：若 ε_uncond=1、ε_cond=2，s=3 时结果是 1+3×(2−1)=4；s=1 得 2，s=0 得 1。这里是公式边界，不保证某个 API 的 guidance_scale=0 会执行无条件分支，也不说明数值越大画质越好。原论文另一套记号满足 s=1+w。'
        }
      ]
    },
    '04-DDIM与采样加速.html': {
      locked: true,
      rules: [
        {
          id: 'ddpm-adjacent-mean', title: '相邻一步的去噪均值',
          tex: T`\mu_t=\frac{1}{\sqrt{\alpha_t}}\left(x_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\epsilon_\theta(x_t,t)\right).`,
          part: T`\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\epsilon_\theta(x_t,t)`,
          meaning: '模型预测的噪声乘以当前相邻步的校正系数，从 x_t 中扣除；外面还要乘 1/√α_t，才得到本式的均值。',
          role: 'β_t 记录从 t−1 到 t 的加噪量，所以这组系数对应反向的相邻一步。它不是更换目标下标后仍保持不变的通用大步公式。',
          example: '若要从 1000 直接到 500，不能只把输出下标改成 500。必须使用新间隔对应的累计信号比例与系数，并把时间标签正确传给原模型。'
        },
        {
          id: 'ddpm-adjacent-noise', title: 'DDPM 本步新增的随机量',
          tex: T`x_{t-1}=\mu_t+\sigma_t z,\qquad z\sim\mathcal N(0,I).`,
          part: T`\sigma_t z`,
          meaning: '在均值之外加入一份新的标准高斯噪声，并用标准差 σ_t 缩放。它不是模型刚刚预测的那份噪声。',
          role: '这一项指定更新的随机部分；具体方差由所选 DDPM 实现决定。因此比较 DDIM 与 DDPM 等价时，不能只看两者是否都含随机数。',
          example: '若 σ_t = 0.2，新噪声项每维方差是 0.04，不是 0.2。采用后验方差时，通向本页干净端点的最后一步方差为零；其他方差或裁剪约定需要单独核对。'
        },
        {
          id: 'ddim-noise-estimate', title: '当前步复用的噪声预测',
          tex: T`e_t=\epsilon_\theta(x_t,t).`, part: T`\epsilon_\theta(x_t,t)`,
          meaning: '把当前状态 x_t 和时间 t 交给噪声预测模型，得到本步使用的 e_t。它是模型对噪声的估计，不是读取生成这个样本时藏着的真实噪声。',
          role: '本页把同一个 e_t 用于估计干净样本和确定下一状态的方向，便于看清一次 DDIM 更新只需在当前 t 求值。',
          example: '本页的一维实验不用神经网络，而是解析计算 E[ε | x_t]。即使条件均值算得准确，有限步采样仍可能与目标分布有差异；不能据此声称模型知道了每个样本的真实 ε。'
        },
        {
          id: 'ddim-clean-estimate', title: '从当前状态反推干净样本',
          tex: T`\hat x_0=\frac{x_t-\sqrt{1-\bar\alpha_t}\,e_t}{\sqrt{\bar\alpha_t}}.`,
          part: T`\frac{x_t-\sqrt{1-\bar\alpha_t}\,e_t}{\sqrt{\bar\alpha_t}}`,
          meaning: '先扣除模型估计的噪声贡献，再除以当前信号系数，得到干净样本的估计值；帽子表示估计，并不保证等于真实 x_0。',
          role: '下一步按目标时间的信号系数重新使用这个估计。它没有要求先访问被跳过的每个时间步。',
          example: '若当前 ᾱ_t = 0.25，分母就是 0.5。小的 ᾱ_t 会放大噪声预测误差对这个估计的影响；不能把高噪声时间一概视为没有作用。'
        },
        {
          id: 'ddim-direction-budget', title: '方向项剩下多少方差预算',
          tex: T`c=\sqrt{1-\bar\alpha_{t'}-\sigma^2}.`,
          part: T`1-\bar\alpha_{t'}-\sigma^2`,
          meaning: '目标噪声尺度的平方是 1 − ᾱ_t′。新增随机噪声用掉 σ² 后，根号内的余量决定复用 e_t 的系数 c。',
          role: '它把方向项和新增噪声放在同一组目标系数下；根号内必须非负。这是更新式的系数关系，不等于宣称估计量彼此独立。',
          example: '若 ᾱ_t′ = 0.6、σ = 0.2，根号内为 0.36，所以 c = 0.6。η = 0 时 σ = 0，方向系数为 √(1 − ᾱ_t′)。'
        },
        {
          id: 'ddim-state-update', title: '下一状态的三项组合',
          tex: T`x_{t'}=\sqrt{\bar\alpha_{t'}}\,\hat x_0+c\,e_t+\sigma z.`,
          part: T`\sqrt{\bar\alpha_{t'}}\,\hat x_0+c\,e_t+\sigma z`,
          meaning: '下一状态由干净样本估计、沿用当前噪声预测的方向项，以及本步新抽的高斯噪声三项相加。t′ 比 t 更接近干净端。',
          role: '目标时间 t′ 可以与 t 相邻，也可以跨过若干训练时间；跳步时必须把这一整组系数一起换成对应 t、t′ 的值。',
          example: 'η = 0 令 σ = 0，因此更新不再抽取步内噪声；初始 x_T 仍通常是随机抽样。到本页定义的干净端 t′ = 0 时 ᾱ_0 = 1，方向项和随机项都为零。'
        },
        {
          id: 'ddim-eta-sigma', title: 'η 怎样控制本步新增噪声',
          tex: T`\sigma_{t\to t'}=\eta\sqrt{\frac{1-\bar\alpha_{t'}}{1-\bar\alpha_t}}\sqrt{1-\frac{\bar\alpha_t}{\bar\alpha_{t'}}}.`,
          part: T`\eta\sqrt{\frac{1-\bar\alpha_{t'}}{1-\bar\alpha_t}}\sqrt{1-\frac{\bar\alpha_t}{\bar\alpha_{t'}}}`,
          meaning: 'η 缩放当前 t 到目标 t′ 的新增噪声标准差；其余两项由这两个时间的累计信号比例决定。',
          role: '同一噪声预测模型可以配合不同的 η 和采样时间网格。随机采样本身不禁止跳步，但目标时间改变后方差也必须重新计算。',
          example: '在本页正 β 调度、0 ≤ η ≤ 1 的约定下，稀疏步的 σ² 和方向项根号均合法。η = 1 且 t′ = t − 1 时，σ² 等于 DDPM 的后验方差；这不表示任意稀疏 η = 1 路径都逐步等同于原始完整 DDPM 链。'
        },
        {
          id: 'ddim-conditional-marginal', title: '训练保留的是哪个条件边缘',
          tex: T`q(x_t\mid x_0)=\mathcal N\!\left(\sqrt{\bar\alpha_t}x_0,(1-\bar\alpha_t)I\right).`,
          part: T`\mathcal N\!\left(\sqrt{\bar\alpha_t}x_0,(1-\bar\alpha_t)I\right)`,
          meaning: '固定一张真实干净样本 x_0 后，时间 t 的带噪状态服从这一个高斯：均值是缩小的 x_0，协方差是噪声尺度的平方乘单位矩阵。',
          role: '噪声预测训练可以直接从这一个时刻的条件分布取样。DDIM 保留它，并改变不同时刻怎样相连，这是复用兼容训练目标的依据。',
          example: '本页两峰实验给定某个真实 x_0 时，x_t 是这里的高斯；但不固定 x_0、把整个数据分布混合起来后，一般不是单个高斯。条件边缘相同也不保证换入预测后有限步生成分布精确相同。'
        },
        {
          id: 'ddim-known-clean-residual', title: '已知真实干净样本时的残差',
          tex: T`r=\frac{x_t-\sqrt{\bar\alpha_t}x_0}{\sqrt{1-\bar\alpha_t}}.`,
          part: T`\frac{x_t-\sqrt{\bar\alpha_t}x_0}{\sqrt{1-\bar\alpha_t}}`,
          meaning: '在这段数学构造中，真实 x_0 已经给定。扣除条件均值，再除以噪声标准差，就得到标准化残差 r。',
          role: '它用来构造下一个时刻的条件均值，并检查目标噪声方差；它不同于实际生成时模型预测出的 e_t。',
          example: '当 t > 0 且当前噪声方差非零，给定 x_0 时 r 的协方差为 I。到干净端 t = 0 分母为零，不在这里计算残差；采样以 t′ = 0 作为输出端点结束。'
        },
        {
          id: 'ddim-family-mean', title: '条件分布均值如何沿用已有残差',
          tex: T`m=\sqrt{\bar\alpha_{t'}}x_0+\sqrt{1-\bar\alpha_{t'}-\sigma^2}\,r.`,
          part: T`\sqrt{1-\bar\alpha_{t'}-\sigma^2}\,r`,
          meaning: '这部分把当前已知残差 r 缩放后放入目标条件均值；剩下的 σ² 留给下一行分布新增的独立噪声。',
          role: '根号内必须非负。给定真实 x_0 后，将这个残差项与新的独立噪声合起来，目标噪声协方差才是所需的 (1 − ᾱ_t′)I。',
          example: '若 ᾱ_t′ = 0.6、σ² = 0.04，残差项的每维方差为 0.36；再加独立新噪声的 0.04 得到 0.4。这里是已知真实 x_0 的边缘核验，不能直接套作预测采样精确性的证明。'
        },
        {
          id: 'ddim-family-conditional', title: '改变时刻连接方式的条件分布',
          tex: T`q_\sigma(x_{t'}\mid x_t,x_0)=\mathcal N(m,\sigma^2I).`,
          part: T`\mathcal N(m,\sigma^2I)`,
          meaning: '同时给定当前状态和真实干净样本后，目标状态的均值是上一式的 m，条件协方差为 σ²I。',
          role: '改变合法 σ 会改变时刻间的连接方式。配合上一式的 m，积分掉当前状态后仍能保住所指定的条件边缘分布。',
          example: 'σ = 0 时按集中在 m 的退化分布理解：给定 x_t、x_0 后没有新的随机量。这不表示对整个数据分布而言所有状态都没有随机性，更不表示实际采样已经知道真实 x_0。'
        }
      ]
    },
    '05-Latent-Diffusion.html': {
      locked: true,
      rules: [
        {
          id: 'latent-attention-size', title: '全像素注意力矩阵有多大',
          tex: T`N=512^2=262144,\qquad N^2=68719476736.`,
          part: T`N^2=68719476736`,
          meaning: '假设每个像素都是一个 token，N² 就是一张完整、稠密注意力分数矩阵的元素数。这里统计的是单个样本、单个注意力头的一张矩阵。',
          role: '它说明空间长度变大后，显式存储全局注意力矩阵为什么昂贵，从而引出在较小潜空间工作的动机。',
          example: '512² 个 token 产生 68,719,476,736 个元素。每个元素 2 字节时约为 137.44 GB（128 GiB）。这是特定显式矩阵的算账，不是所有像素扩散模型必需的显存；多分辨率网络和不显式存整张矩阵的实现不满足该假设。'
        },
        {
          id: 'latent-forward-noise', title: '加到潜变量上的噪声尺度',
          tex: T`z_t=\sqrt{\bar\alpha_t}\,z_0+\sqrt{1-\bar\alpha_t}\,\epsilon,\qquad \epsilon\sim\mathcal N(0,I).`,
          part: T`\sqrt{1-\bar\alpha_t}\,\epsilon`,
          meaning: '把单位方差高斯噪声乘以当前时间的噪声标准差，再与缩小的干净潜变量相加。这里的 z 是扩散模型使用的潜变量，不是输入像素。',
          role: '这一项给潜空间去噪训练制造带噪输入；去噪模型要从 z_t 学会预测噪声或等价目标。编码器负责得到干净潜变量，不负责在每个去噪步重复编码图像。',
          example: '若 ᾱ_t = 0.25，噪声系数为 √0.75，噪声项的每维方差为 0.75。信号项的方差还取决于 z_0 的尺度；不能把 0.25 直接读成任意潜分布的信号方差。'
        },
        {
          id: 'latent-reconstruction', title: '先检查自编码器的重建路径',
          tex: T`\hat x=D(E(x)).`, part: T`D(E(x))`,
          meaning: '把一张真实图像编码为潜表示，再用配套解码器恢复图像。这是对同一张输入的重建检查，不是从高斯噪声开始生成。',
          role: '它帮助区分自编码器的表示损失和后续潜空间生成模型的问题：如果细小文字在重建中已经受损，就应先检查这条压缩与解码路径。',
          example: 'KL 编码器可能从后验取样。对照两次重建时要固定取样规则或随机种子，才能避免把采样差异误认成模型改进。单张重建表现是诊断线索，不是所有生成图像质量都无法超过的数学硬上限。'
        },
        {
          id: 'latent-weighted-kl', title: 'KL 项在自编码器损失中的权重',
          tex: T`\mathcal L_{\mathrm{AE}}=\mathcal L_{\mathrm{rec}}+\lambda_{\mathrm{KL}}\mathcal L_{\mathrm{KL}}+\lambda_{\mathrm{adv}}\mathcal L_{\mathrm{adv}}.`,
          part: T`\lambda_{\mathrm{KL}}\mathcal L_{\mathrm{KL}}`,
          meaning: 'KL 正则的数值先乘权重，再与重建相关目标和生成侧的对抗项共同影响自编码器训练。',
          role: '它约束潜表示，又要与保留图像信息的目标权衡。本式只是组成示意：重建部分还可能含感知损失，判别器也有自己的目标。',
          example: '本页引用的 LDM 设置使用约 10⁻⁶ 的 KL 权重，但这个数依赖损失定义、求和或平均等约定。权重小不自动等于该项作用小，也不能据此给所有 VAE 或 LDM 规定统一权重。'
        },
        {
          id: 'latent-posterior-kl', title: '被约束的是给定图像的后验',
          tex: T`\mathcal L_{\mathrm{KL}}=\mathbb E_x\!\left[D_{\mathrm{KL}}\!\left(q_\phi(z_{\mathrm{AE}}\mid x)\,\|\,\mathcal N(0,I)\right)\right].`,
          part: T`D_{\mathrm{KL}}\!\left(q_\phi(z_{\mathrm{AE}}\mid x)\,\|\,\mathcal N(0,I)\right)`,
          meaning: '对一张给定图像 x，比较编码器后验 q 与标准正态参考分布；外面的期望再汇总不同图像的这项代价。',
          role: '这里讨论的是自编码器训练时的潜变量正则，不是文生图起点 z_T 的去噪过程，也不要求每张图的后验都严格变成同一个分布。',
          example: '如果所有 x 的后验都完全等于同一个 N(0,I)，采出的潜变量便不再携带这张 x 的信息。这说明“每图后验严格标准正态”不能单独作为训练成功的标准。'
        },
        {
          id: 'latent-scaling', title: '扩散潜变量与自编码器潜变量的缩放',
          tex: T`z_0=s\,z_{\mathrm{AE}},\qquad s=0.18215.`,
          part: T`s\,z_{\mathrm{AE}}`,
          meaning: '用配套模型约定的系数 s，把自编码器的潜变量转换为扩散模型训练时使用的尺度。它们表示同一潜内容，但数值单位不同。',
          role: '尺度会改变信号相对于单位方差噪声的强弱，因此训练和采样必须使用一致的缩放约定。生成结束交给原解码器前，要做逆变换。',
          example: '本式的 0.18215 来自 SD 1.x 的具体约定：扩散前乘 s，解码时使用 D(z_0/s)。它不是所有 LDM 的常数，也不是给输入像素或文本向量套用的系数；标准差接近 1 本身不证明分布是标准高斯。'
        }
      ]
    }
  };

  // A read-only export supports local checks without a browser or DOM shims.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {catalogs};
    return;
  }

  function init() {
    let segments;
    try { segments = decodeURIComponent(location.pathname).split('/'); }
    catch (_) { return; }
    const filename = segments.pop();
    if (segments.pop() !== '扩散模型' || !catalogs[filename]) return;
    if (document.documentElement.dataset.diffFormulaHelp) return;
    const catalog = catalogs[filename];
    const report = {page: filename, locked: catalog.locked,
      expected: catalog.rules.length, matched: [], errors: []};
    window.DiffFormulaHelpStatus = report;
    // Leave any future unlocked draft inert until exact source TeX is reviewed.
    if (!catalog.locked) { report.pending = '等待正文完整 TeX 锁定'; return; }
    function fail(message) {
      report.errors.push(message);
      console.error('[DiffFormulaHelp] ' + filename + ': ' + message);
    }
    if (!window.katex) { fail('KaTeX 未就绪；保留原公式。'); return; }
    const main = document.querySelector('main');
    if (!main) { fail('未找到正文 main；未修改页面。'); return; }
    const dialog = document.createElement('dialog');
    if (typeof dialog.showModal !== 'function') {
      fail('浏览器不支持原生 dialog；保留原公式。'); return;
    }
    document.documentElement.dataset.diffFormulaHelp = '1';
    const displays = [...main.querySelectorAll('.katex-display')];
    const getTex = display => display.querySelector(
      '.katex-mathml annotation[encoding="application/x-tex"]')?.textContent;
    let opener = null;
    dialog.id = 'diff-formula-help-dialog';
    dialog.setAttribute('aria-labelledby', 'diff-formula-help-title');
    dialog.innerHTML = '<header class="diff-fh-header"><div><p class="diff-fh-eyebrow">当前公式的局部读法</p><h2 id="diff-formula-help-title"></h2></div><button type="button" class="diff-fh-close" aria-label="关闭公式解释">×</button></header><div class="diff-fh-body"><div class="diff-fh-selected" tabindex="0" role="region" aria-label="选中的公式组合，可横向滚动"></div><h3>它是什么</h3><p class="diff-fh-meaning"></p><h3>在当前公式中做什么</h3><p class="diff-fh-role"></p><section class="diff-fh-example"><h3>本页的数值或边界</h3><p></p></section><details><summary>对照完整原式</summary><div class="diff-fh-context" tabindex="0" role="region" aria-label="完整原式，可横向滚动"></div></details></div><footer class="diff-fh-footer"><button type="button">关闭，回到公式</button></footer>';
    document.body.appendChild(dialog);
    const closeButton = dialog.querySelector('.diff-fh-close');
    const body = dialog.querySelector('.diff-fh-body');
    function close() { if (dialog.open) dialog.close(); }
    closeButton.addEventListener('click', close);
    dialog.querySelector('.diff-fh-footer button').addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('diff-formula-modal-open');
      if (opener?.isConnected) opener.focus({preventScroll: true});
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) close();
    });
    dialog.querySelector('details').addEventListener('toggle', event => {
      if (!event.currentTarget.open || !dialog.open) return;
      const missing = dialog.querySelector('.diff-fh-context').getBoundingClientRect().bottom -
        body.getBoundingClientRect().bottom;
      if (missing > 0) body.scrollTop += missing + 16;
    });
    function show(rule, originalTex, trigger) {
      window.scrollTo({left: window.scrollX, top: window.scrollY, behavior: 'instant'});
      const box = trigger.getBoundingClientRect();
      const navBottom = document.querySelector('header.site')?.getBoundingClientRect().bottom || 0;
      if (box.top < Math.max(0, navBottom) + 12 || box.bottom > innerHeight - 12) {
        trigger.scrollIntoView({block: 'center', inline: 'nearest', behavior: 'instant'});
      }
      opener = trigger;
      dialog.querySelector('h2').textContent = rule.title;
      dialog.querySelector('.diff-fh-meaning').textContent = rule.meaning;
      dialog.querySelector('.diff-fh-role').textContent = rule.role;
      dialog.querySelector('.diff-fh-example p').textContent = rule.example;
      try {
        [ [rule.part, '.diff-fh-selected'], [originalTex, '.diff-fh-context'] ]
          .forEach(([tex, selector]) => window.katex.render(tex, dialog.querySelector(selector),
            {displayMode: true, throwOnError: true, strict: 'ignore', trust: false}));
      } catch (error) { fail(rule.id + ' 弹窗渲染失败：' + error.message); return; }
      dialog.querySelector('details').open = false;
      dialog.showModal();
      document.body.classList.add('diff-formula-modal-open');
      body.scrollTop = 0;
      closeButton.focus({preventScroll: true});
    }

    catalog.rules.forEach(rule => {
      const matches = displays.filter(display => (getTex(display) || '').trim() === rule.tex.trim());
      if (matches.length !== 1) {
        fail(rule.id + ' 需要唯一完整 TeX 匹配，实际 ' + matches.length + ' 条；未绑定。'); return;
      }
      const display = matches[0];
      const originalTex = getTex(display);
      const originalVisible = display.querySelector('.katex > .katex-html');
      if (!originalVisible || display.closest('.diff-fh-formula') || originalTex.split(rule.part).length !== 2) {
        fail(rule.id + ' 可见结构或唯一局部组合不符合预期；保留原式。'); return;
      }
      const annotated = originalTex.replace(rule.part,
        T`\htmlData{diff-formula-part=` + rule.id + '}{' + rule.part + '}');
      const temporary = document.createElement('span');
      try {
        window.katex.render(annotated, temporary, {displayMode: true, throwOnError: true,
          strict: 'ignore', trust: context => context.command === T`\htmlData`});
      } catch (error) { fail(rule.id + ' 标注渲染失败：' + error.message); return; }
      const visible = temporary.querySelector('.katex > .katex-html');
      const targets = visible?.querySelectorAll('[data-diff-formula-part]');
      if (targets?.length !== 1) { fail(rule.id + ' 标注数不为 1；保留原式。'); return; }
      const target = targets[0];
      target.classList.add('diff-fh-target');
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
      // Keep original MathML and source annotation. Expose the one visual
      // button without repeating the noninteractive visual math to AT.
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
      wrapper.className = 'diff-fh-formula';
      wrapper.dataset.diffFormula = rule.id;
      display.replaceWith(wrapper);
      wrapper.appendChild(display);
      const hint = document.createElement('span');
      hint.className = 'diff-fh-hint';
      hint.textContent = '点击着色组合，或用下方按钮查看当前公式的解释。';
      const control = document.createElement('button');
      control.type = 'button';
      control.className = 'diff-fh-trigger';
      control.textContent = '解释：' + rule.title;
      control.setAttribute('aria-haspopup', 'dialog');
      control.setAttribute('aria-controls', dialog.id);
      control.addEventListener('click', () => show(rule, originalTex, control));
      wrapper.append(hint, control);
      report.matched.push(rule.id);
      if (getTex(display) !== originalTex) fail(rule.id + ' 原式 annotation 意外变化。');
    });
    if (!report.matched.length) {
      dialog.remove();
      delete document.documentElement.dataset.diffFormulaHelp;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
