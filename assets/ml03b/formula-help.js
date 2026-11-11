/* Supply regression terms to the shared formula reader before it initializes. */
(() => {
  "use strict";

  const prediction = [
    "预测时间 ŷ",
    "模型在送达之前估计的分钟数。",
    "用实际时间 y 减去预测时间 ŷ，得到带方向的残差。下标 i 表示第 i 单。",
    "A 单实际 20 分钟，预测 18 分钟。残差是 20−18=+2 分钟。"
  ];

  function register(event) {
    if (!(event.target instanceof HTMLScriptElement) ||
        !event.target.src.endsWith("/assets/guided-batch1.js")) return;

    window.guidedLessonProfiles["regression-loss"] = {
      terms: { prediction },
      pattern: /\\hat y(?:_i)?/g,
      termFor: () => "prediction"
    };
    document.removeEventListener("load", register, true);
  }

  document.addEventListener("load", register, true);
})();
