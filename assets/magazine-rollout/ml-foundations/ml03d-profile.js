/* Supply 03d terms after the shared registry is initialized. */
(() => {
  "use strict";

  function register(event) {
    if (!(event.target instanceof HTMLScriptElement) ||
        !event.target.src.endsWith("/assets/guided-batch1.js")) return;

    window.guidedLessonProfiles["probabilistic-regression"] = {
      terms: {
        poissonRate: [
          "λ：每个固定窗口的期望计数",
          "给定相似输入条件时，每个窗口平均会发生多少次。",
          "λ 决定泊松分布各整数的概率。在本模型中，条件方差在数值上也等于 λ。",
          "λ = 2.5 表示同类十分钟窗平均有 2.5 单。实际每窗的计数仍是整数。"
        ],
        logTarget: [
          "T：取自然对数后的训练标签",
          "先用统一单位记录原始正值 Y，再取自然对数得到 T。",
          "平方损失比较的是 log 刻度的标签与预测。交付时按需要还原到原单位。",
          "送达时间 Y = 20 分钟时，训练标签 T = ln(20) ≈ 2.996。"
        ]
      },
      pattern: /\\lambda|\bT\b/g,
      termFor(token) {
        return token === "\\lambda" ? "poissonRate" : "logTarget";
      }
    };

    document.removeEventListener("load", register, true);
  }

  document.addEventListener("load", register, true);

  const routeLabels = {
    "#prerequisites": "本章需要的基础",
    "#distribution-basics": "比较分散程度",
    "#gaussian": "读懂高斯曲线",
    "#gaussian-nll": "手算高斯损失",
    "#poisson": "预测每窗订单数",
    "#poisson-nll": "手算泊松损失",
    "#log-target": "在对数尺度比较",
    "#model-choice": "按问题选方法",
    "#checkpoint": "用新输入检查"
  };

  document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(
      '.lesson-layout[data-lesson="probabilistic-regression"] .lesson-route-links a'
    );
    links.forEach((link, index) => {
      const label = routeLabels[link.hash];
      if (!label) return;
      link.textContent = (index + 1) + "  " + label;
      document.getElementById(link.hash.slice(1)).dataset.route = label;
    });
  });
})();
