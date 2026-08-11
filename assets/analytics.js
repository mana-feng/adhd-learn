/* 站点访问统计（StatCounter）
 *
 * ⭐ 全站的统计配置只存在这一个文件里 —— 改这里，392 个页面一起变，不需要重新构建。
 *   页面那边只有一行 <script src="../assets/analytics.js" async></script>。
 *
 * ⚠️ 这个文件只在【部署分支 html】里被引用，源码分支不带统计（见 _src/publish.py）。
 * ⚠️ sc_invisible=1 表示不显示计数徽章，不占版面、不影响布局。
 * ⚠️ 本地 file:// 双击打开时，counter.js 拉不到是正常的，不影响页面阅读。
 */
(function () {
  window.sc_project = 13342066;
  window.sc_invisible = 1;
  window.sc_security = "59a4ca9d";

  var s = document.createElement("script");
  s.type = "text/javascript";
  s.async = true;
  s.src = "https://www.statcounter.com/counter/counter.js";
  // 统计失败绝不能影响页面本身，所以静默吞掉
  s.onerror = function () {};
  (document.head || document.documentElement).appendChild(s);
})();
