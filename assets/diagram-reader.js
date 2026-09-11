/* 提高内联图的标签可读性，并为复杂图提供放大阅读窗口。 */
(function () {
  "use strict";

  function addStyles() {
    var style = document.createElement("style");
    style.textContent = "figure.dia{position:relative}.diagram-tools{position:absolute;z-index:2;width:44px;height:44px;display:grid;place-items:center}.diagram-expand{position:relative;isolation:isolate;width:44px;height:44px;border:0;padding:0;display:grid;place-items:center;background:transparent;color:var(--muted,#7b6558);font:inherit;cursor:pointer;transition:color 180ms ease}.diagram-expand::before{content:\"\";position:absolute;z-index:0;width:30px;height:30px;border:1px solid rgba(128,100,82,.22);border-radius:50%;background:rgba(255,253,249,.88);box-shadow:0 2px 9px rgba(75,54,38,.09);transition:background 180ms ease,border-color 180ms ease,box-shadow 180ms ease}.diagram-expand svg{position:relative;z-index:1;width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.diagram-expand:hover{color:#b95e3c}.diagram-expand:hover::before{background:#fff9f5;border-color:rgba(194,98,62,.42);box-shadow:0 4px 12px rgba(125,70,43,.14)}.diagram-zoom,.diagram-close{min-height:44px;border:1px solid var(--border,#d9e0ea);background:var(--card,#fff);color:var(--fg,#172033);font:inherit;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(25,38,60,.16)}.diagram-zoom:hover,.diagram-close:hover{background:var(--quote-bg,#f2f5f8)}.diagram-expand:focus-visible,.diagram-zoom:focus-visible,.diagram-close:focus-visible,.diagram-reader-stage:focus-visible{outline:3px solid #c8724e;outline-offset:3px}#diagram-reader{width:min(1120px,calc(100% - 24px));height:fit-content;max-height:calc(100% - 24px);border:1px solid var(--border,#d9e0ea);border-radius:16px;padding:0;background:var(--card,#fff);color:var(--fg,#172033);box-shadow:0 20px 65px rgba(0,0,0,.3)}#diagram-reader::backdrop{background:rgba(20,28,42,.52)}.diagram-reader-sheet{height:auto;max-height:calc(100dvh - 40px);display:flex;flex-direction:column;padding:18px}.diagram-reader-head{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.diagram-reader-title{margin:0;font-size:1.1em;line-height:1.35}.diagram-reader-actions{display:flex;align-items:center;gap:7px}.diagram-zoom{min-width:44px;border-radius:9px;padding:8px}.diagram-close{min-width:44px;border-radius:9px;padding:8px;font-size:1.25em}.diagram-reader-stage{flex:0 1 auto;min-height:0;overflow:auto;border:1px solid var(--border,#d9e0ea);border-radius:10px;background:var(--quote-bg,#f4f7fb);padding:16px}.diagram-reader-stage svg{display:block;width:calc(100% * var(--diagram-zoom,1));min-width:0;max-width:none;height:auto;margin:0 auto}.diagram-reader-stage svg text{paint-order:stroke;stroke:var(--card,#fff);stroke-width:.7px;stroke-linejoin:round}@media(max-width:640px){.diagram-reader-sheet{padding:12px}.diagram-reader-stage{padding:10px}.diagram-reader-title{font-size:1em}.diagram-reader-stage svg{min-width:0}}";
    document.head.appendChild(style);
  }

  function increaseSmallLabels(svg) {
    Array.prototype.forEach.call(svg.querySelectorAll("text[font-size]"), function (text) {
      if (text.dataset.diagramFontAdjusted) return;
      var original = parseFloat(text.getAttribute("font-size"));
      if (!isFinite(original) || original >= 12) return;
      var adjusted = Math.min(12.8, Math.max(11.7, original * 1.15));
      text.dataset.diagramFontAdjusted = String(original);
      text.setAttribute("font-size", String(adjusted));
    });
  }

  function makeDialog() {
    var dialog = document.createElement("dialog");
    dialog.id = "diagram-reader";
    dialog.setAttribute("aria-labelledby", "diagram-reader-title");
    dialog.innerHTML = "<div class=\"diagram-reader-sheet\"><div class=\"diagram-reader-head\"><h2 class=\"diagram-reader-title\" id=\"diagram-reader-title\">图示放大阅读</h2><div class=\"diagram-reader-actions\"><button class=\"diagram-zoom\" type=\"button\" data-change=\"-0.2\" aria-label=\"缩小图示\">−</button><button class=\"diagram-zoom\" type=\"button\" data-change=\"0.2\" aria-label=\"放大图示\">＋</button><button class=\"diagram-close\" type=\"button\" aria-label=\"关闭放大图示\">×</button></div></div><div class=\"diagram-reader-stage\" id=\"diagram-reader-stage\"></div></div>";
    dialog.querySelector(".diagram-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
    document.body.appendChild(dialog);
    var stage = dialog.querySelector("#diagram-reader-stage");
    stage.tabIndex = 0;
    stage.setAttribute("role", "region");
    stage.setAttribute("aria-label", "图示；放大后可左右滑动，或聚焦后用方向键移动");
    var help = document.createElement("p");
    help.textContent = "点 ＋ 看细节；放大后可左右滑动。键盘可 Tab 到图示，再用方向键移动。";
    help.style.cssText = "flex-shrink:0;margin:0 0 12px;font-size:.85em;line-height:1.5;color:var(--muted,#7b6558)";
    stage.before(help);
    return dialog;
  }

  function titleFor(figure) {
    var caption = figure.querySelector("figcaption");
    return caption ? caption.textContent.trim().slice(0, 70) : (figure.querySelector("svg").getAttribute("aria-label") || "图示放大阅读");
  }

  function openDialog(dialog, figure) {
    var stage = dialog.querySelector("#diagram-reader-stage");
    var clone = figure.querySelector("svg").cloneNode(true);
    stage.replaceChildren(clone);
    stage.style.setProperty("--diagram-zoom", "1");
    dialog.querySelector("#diagram-reader-title").textContent = titleFor(figure);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    stage.scrollLeft = 0;
    stage.scrollTop = 0;
  }

  function placeTools(figure, tools) {
    var svg = figure.querySelector("svg");
    if (!svg) return;
    var figureBox = figure.getBoundingClientRect();
    var svgBox = svg.getBoundingClientRect();
    // The absolute tool lives in the figure's scrollable content coordinates.
    // Convert the visible SVG edge back into those coordinates so horizontal
    // panning cannot carry the control off screen. Keep small centered drawings
    // and any text above the SVG anchored to the same edge as before.
    tools.style.left = (figure.scrollLeft + Math.max(0, Math.round(Math.min(svgBox.right, figureBox.right) - figureBox.left - 44))) + "px";
    tools.style.top = (figure.scrollTop + Math.max(0, Math.round(svgBox.top - figureBox.top + 5))) + "px";
  }

  function addButton(figure, dialog) {
    if (figure.querySelector(".diagram-tools")) return;
    var tools = document.createElement("div");
    tools.className = "diagram-tools";
    var button = document.createElement("button");
    button.type = "button";
    button.className = "diagram-expand";
    button.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"10.5\" cy=\"10.5\" r=\"5.5\"></circle><path d=\"m14.5 14.5 4 4\"></path></svg>";
    button.setAttribute("aria-label", "放大阅读此图");
    button.addEventListener("click", function () { openDialog(dialog, figure); });
    tools.appendChild(button);
    figure.appendChild(tools);
    placeTools(figure, tools);
    figure.addEventListener("scroll", function () { placeTools(figure, tools); }, { passive: true });
  }

  function run() {
    addStyles();
    var dialog = makeDialog();
    dialog.querySelectorAll(".diagram-zoom").forEach(function (button) {
      button.addEventListener("click", function () {
        var stage = dialog.querySelector("#diagram-reader-stage");
        var current = parseFloat(stage.style.getPropertyValue("--diagram-zoom")) || 1;
        var next = Math.max(0.8, Math.min(3, current + parseFloat(button.dataset.change)));
        stage.style.setProperty("--diagram-zoom", String(next));
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("figure.dia"), function (figure) {
      var svg = figure.querySelector("svg");
      if (!svg) return;
      increaseSmallLabels(svg);
      addButton(figure, dialog);
    });
    window.addEventListener("resize", function () {
      Array.prototype.forEach.call(document.querySelectorAll("figure.dia .diagram-tools"), function (tools) {
        placeTools(tools.parentElement, tools);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
