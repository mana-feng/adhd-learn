/* 站点访问统计：供应商配置仅在此处维护，由共享 glossary.js 独立引入。
 * 仅生产域 HTTPS 页面启动；本地文件、预览和其他域不加载供应商脚本。
 * 每份文档最多尝试一次；统计失败不影响阅读，不显示计数徽章。
 */
(function () {
  try {
    if (window.location.protocol !== "https:" ||
        window.location.hostname !== "adhd-learn.manafeng.com" ||
        window.__siteAnalyticsStarted) return;
    window.__siteAnalyticsStarted = true;

    window.sc_project = 13342066;
    window.sc_invisible = 1;
    window.sc_security = "59a4ca9d";

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://www.statcounter.com/counter/counter.js";
    script.onerror = function () {};
    (document.head || document.documentElement).appendChild(script);
  } catch (_) { /* Analytics must never interrupt the page. */ }
})();
