/* ExamMate PWA：只快取網站介面，不快取登入、雲端資料或 AI 題目內容。 */
(function () {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      /* PWA 快取失敗時仍可正常使用網站與雲端同步。 */
    });
  });
})();
