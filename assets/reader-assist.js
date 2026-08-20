/*
 * 把「走神救援」从一整段回顾改成可扫读的短要点。
 *
 * 这是纯前端渐进增强：JavaScript 被禁用时仍显示原文；启用时改为
 * 短要点，让读者不用在救援区里再次面对整段文字。
 */
(function () {
  "use strict";

  var MIN_LENGTH = 160;

  function normalise(text) {
    return text.replace(/\s+/g, " ").replace(/⭐/g, "。 ").trim();
  }

  function splitLongPiece(text, limit) {
    if (text.length <= limit) return [text];
    var result = [];
    var rest = text;
    while (rest.length > limit) {
      var cut = rest.lastIndexOf("，", limit);
      if (cut < Math.floor(limit * 0.45)) cut = rest.lastIndexOf("、", limit);
      if (cut < Math.floor(limit * 0.45)) cut = limit;
      result.push(rest.slice(0, cut + (rest.charAt(cut) === "，" || rest.charAt(cut) === "、" ? 1 : 0)).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) result.push(rest);
    return result;
  }

  function makePoints(text) {
    var sentences = normalise(text).match(/[^。！？；]+[。！？；]?/g) || [];
    var points = [];
    sentences.forEach(function (sentence) {
      sentence = sentence.trim();
      if (!sentence) return;
      splitLongPiece(sentence, 72).forEach(function (piece) {
        if (piece) points.push(piece);
      });
    });
    return points;
  }

  function nextRescueParagraph(label) {
    if (normalise(label.textContent).length >= MIN_LENGTH) return label;
    var node = label.nextElementSibling;
    while (node && !/^H[1-6]$/.test(node.tagName)) {
      if (node.tagName === "P" && normalise(node.textContent).length >= MIN_LENGTH) return node;
      var candidate = node.querySelector && node.querySelector("p");
      if (candidate && normalise(candidate.textContent).length >= MIN_LENGTH) return candidate;
      node = node.nextElementSibling;
    }
    return null;
  }

  function enhance(target) {
    if (!target || target.dataset.readerAssist === "done") return;
    var points = makePoints(target.textContent);
    if (points.length < 2) return;

    target.dataset.readerAssist = "done";
    var box = document.createElement("section");
    box.className = "reader-rescue";
    box.setAttribute("aria-label", "走神救援，短要点版");

    var intro = document.createElement("p");
    intro.className = "reader-rescue-intro";
    intro.textContent = "先只读这些：";
    box.appendChild(intro);

    var list = document.createElement("ol");
    points.forEach(function (point) {
      var item = document.createElement("li");
      item.textContent = point;
      list.appendChild(item);
    });
    box.appendChild(list);

    target.replaceWith(box);
  }

  function addStyles() {
    var style = document.createElement("style");
    style.textContent = [
      ".reader-rescue{margin:1em 0 1.45em;padding:1em 1.15em 1.1em;border:1px solid var(--border);border-left:5px solid var(--accent);border-radius:0 12px 12px 0;background:var(--card);box-shadow:var(--shadow);}",
      ".reader-rescue-intro{margin:0 0 .45em;font-weight:700;color:var(--accent);}",
      ".reader-rescue ol{margin:.2em 0 0;padding-left:1.55em;}",
      ".reader-rescue li{margin:.45em 0;padding-left:.25em;line-height:1.8;}",
      ".reader-rescue li::marker{font-weight:700;color:var(--accent);}",
      "@media (max-width:640px){.reader-rescue{padding:.85em .9em}.reader-rescue li{margin:.6em 0;line-height:1.9;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function run() {
    addStyles();
    Array.prototype.forEach.call(document.querySelectorAll("p"), function (paragraph) {
      if (/走神救援/.test(paragraph.textContent)) enhance(nextRescueParagraph(paragraph));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
