
/* Formula help and reading positions for 03a only. */
(function () {
  "use strict";

  const entries = [
    ["probability", [String.raw`\hat p_i`, String.raw`\hat p`], "估计的超时概率 p̂",
      "由原始分数经 Sigmoid 算出的超时概率。下标 i 指第 i 笔订单。",
      "算损失时和实际结果配对，发提醒时和门槛比较。",
      "R 的估计约为 35.43%，低于 50% 门槛。"],
    ["decision", [String.raw`\hat y_i`, String.raw`\hat y`], "模型判出的类别 ŷ",
      "达到门槛记 1，低于门槛记 0。",
      "提醒规则把概率变成类别。实际结果仍要在送达后记录。",
      "R 的概率是 35.43%，在 50% 门槛下判 0，在 30% 门槛下判 1。"],
    ["label", ["y_i"], "实际标签 yᵢ",
      "第 i 笔订单送达后记录的结果，超时记 1，准时记 0。",
      "标签决定算损失时取 p̂ 还是 1 − p̂。",
      "R 实际超时，标签是 1。"],
    ["sigmoid", [String.raw`\sigma`], "Sigmoid：把分数换成概率",
      "将分数平滑地换成 0 到 1 之间的数，保留分数的高低顺序。",
      "预测时先算分数，再用 Sigmoid 得到超时概率估计。",
      "R 的分数是 −0.6，换算后约为 0.3543。"],
    ["threshold", [String.raw`\tau`], "提醒门槛 τ",
      "模型估计的超时概率达到门槛时发提醒。",
      "门槛影响行动，不参与本课的训练损失。",
      "从 50% 降到 30%，R 的 35.43% 会触发提醒，风险估计仍是 35.43%。"],
    ["realizedProbability", ["q_{y_i}", "q_y"], "给实际结果的概率",
      "超时时取 p̂，准时时取 1 − p̂。",
      "二元交叉熵取这个概率的负自然对数。",
      "P 实际准时，用 1 − 0.0832 ≈ 0.9168。"],
    ["loss", [String.raw`\ell_i`, String.raw`\ell`], "一笔订单的损失 ℓ",
      "给实际结果的概率越小，负自然对数就越大。",
      "各单损失取平均，评价整批预测。",
      "R 实际超时，单笔损失约为 −ln(0.3543) = 1.0375。"],
    ["average", [String.raw`\frac{1}{n}`, String.raw`\frac1n`], "1/n：对订单取平均",
      "把各单的贡献相加，再除以订单数 n。",
      "既可以平均每单损失，也可以平均每单对某个参数的变化率贡献。",
      "P、Q、R 共 3 单，损失和约为 1.2294，平均约为 0.4098。"],
    ["sum", [String.raw`\sum_{j=1}^{d}`, String.raw`\sum_{i=1}^{n}`], "Σ：逐项加起来",
      "按下标给出的范围，将每个对应的项相加。",
      "j 数每单的特征，i 数不同订单。",
      "算 R 的分数时 j 走两项：距离贡献 2.4，排队贡献 1。"],
    ["rate", [String.raw`\eta`], "学习率 η",
      "控制沿着下降方向走多远。",
      "更新时从旧参数中减去学习率乘该参数的斜率。",
      "若距离权重的斜率约 −0.717，学习率 0.1，则从 0.8 更新到约 0.8717。"]
  ];

  const terms = {};
  const tokens = new Map();
  for (const [name, forms, ...explanation] of entries) {
    terms[name] = explanation;
    for (const form of forms) tokens.set(form, name);
  }
  const pattern = [...tokens.keys()]
    .sort((a, b) => b.length - a.length)
    .map(token => token.replace(/[.*+?^$(){[\]|\\]/g, "\\$&"))
    .join("|");
  window.guidedLessonProfiles["linear-classification"] = {
    terms,
    pattern: new RegExp(pattern, "g"),
    termFor: token => tokens.get(token)
  };

  document.addEventListener("DOMContentLoaded", () => {
    const layout = document.querySelector('.lesson-layout[data-lesson="linear-classification"]');
    const route = layout.querySelector(".lesson-route-links");
    const position = layout.querySelector(".lesson-position");
    for (const link of route.querySelectorAll("a")) {
      link.textContent = link.textContent.replace(/^\d+\s+/, "");
    }

    function describePosition() {
      const current = route.querySelector('[aria-current="step"]');
      if (!current) return;
      const text = "正在读：" + current.textContent;
      if (position.textContent !== text) position.textContent = text;
    }
    describePosition();
    new MutationObserver(describePosition).observe(position, { childList: true });

    const rail = layout.querySelector(".lesson-rail");
    const toggle = rail.querySelector(".lesson-route-toggle");
    const compact = matchMedia("(max-width: 900px)");
    const isOpen = () => compact.matches && toggle.getAttribute("aria-expanded") === "true";
    document.addEventListener("click", event => {
      if (isOpen() && (!rail.contains(event.target) || event.target.closest(".lesson-save-status a"))) {
        toggle.click();
      }
    });
    rail.addEventListener("keydown", event => {
      if (event.key === "Escape" && isOpen()) {
        toggle.click();
        toggle.focus({ preventScroll: true });
      }
    });

    // Older reading positions may point into the second pass rather than the main route.
    const status = layout.querySelector(".lesson-save-status");
    if (status.querySelector("a")) return;
    let saved;
    try { saved = localStorage.getItem("lesson-place:linear-classification"); }
    catch { return; }
    const target = saved && document.getElementById(saved);
    if (!target || !layout.querySelector(".lesson-content").contains(target)) return;
    const resume = document.createElement("a");
    resume.href = "#" + encodeURIComponent(saved);
    resume.textContent = "回到上次记下的位置";
    status.appendChild(resume);
  });
})();
