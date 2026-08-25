/*
 * ExamMate 外觀與資料備份
 * ------------------------------------------------------------------
 * 提供清爽版／繽紛馬卡龍版切換，以及完整 localStorage 備份與還原。
 * 備份檔只在學生的裝置上產生，不會自動上傳。
 */
(function () {
  "use strict";

  const THEME_KEY = "examMate.appearance.v1";
  const BACKUP_META_KEY = "examMate.backupMeta.v1";
  const PROFILE_KEY = "examJourney.profile.v1";
  const BACKUP_KEYS = [
    PROFILE_KEY,
    "examJourney.events.v1",
    "examJourney.dailyGoal.v1",
    "examMate.learning.v1",
    "examMate.wrongQuestions.v1",
    "examMate.unitReviews.v1",
    "examMate.studyPlan.v1",
    "examMate.digitalWrongNotebook.v1",
    "examMate.aiCoach.v1",
    "examMate.aiPracticeQuestions.v1",
    "examMate.weeklyPlanPrompt.v1",
    THEME_KEY
  ];
  const MANAGED_KEYS = [...BACKUP_KEYS, BACKUP_META_KEY];
  const THEMES = ["clean", "colorful"];
  const state = { currentTheme: "clean" };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(typeof document.querySelectorAll === "function" ? document.querySelectorAll(selector) : []);

  function normalizeTheme(value) {
    return THEMES.includes(value) ? value : "clean";
  }

  function readTheme() {
    try {
      return normalizeTheme(JSON.parse(localStorage.getItem(THEME_KEY) || '"clean"'));
    } catch (error) {
      return "clean";
    }
  }

  function writeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(theme));
      return true;
    } catch (error) {
      return false;
    }
  }

  function applyTheme(theme, save = false) {
    state.currentTheme = normalizeTheme(theme);
    document.documentElement.dataset.theme = state.currentTheme;
    if (save) writeTheme(state.currentTheme);
    const label = state.currentTheme === "colorful" ? "繽紛版" : "清爽版";
    if ($("#current-theme-label")) $("#current-theme-label").textContent = label;
    $$("[data-theme-choice]").forEach((button) => {
      const active = button.dataset.themeChoice === state.currentTheme;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      const badge = button.querySelector("b");
      if (badge) badge.textContent = active ? "目前使用" : "切換版本";
    });
    if (save && $("#appearance-saved-status")) $("#appearance-saved-status").textContent = `已切換為${label}`;
  }

  function formatRocDate(date) {
    return `民國 ${date.getFullYear() - 1911} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  }

  function formatRocDateTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "尚未備份";
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${formatRocDate(date)} ${date.getHours()}:${minutes}`;
  }

  function safeBackupMeta() {
    try {
      const parsed = JSON.parse(localStorage.getItem(BACKUP_META_KEY) || "null");
      return parsed && typeof parsed.exportedAt === "string" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function updateBackupMetaLabel() {
    const meta = safeBackupMeta();
    if ($("#last-backup-label")) $("#last-backup-label").textContent = meta ? `上次備份：${formatRocDateTime(meta.exportedAt)}` : "尚未備份";
  }

  function setFeedback(message, isError = false) {
    const feedback = $("#backup-feedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
  }

  function openDialog() {
    const dialog = $("#appearance-backup-dialog");
    if (!dialog) return;
    applyTheme(state.currentTheme);
    updateBackupMetaLabel();
    setFeedback("");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog() {
    const dialog = $("#appearance-backup-dialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function collectBackupData() {
    const data = {};
    BACKUP_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw === null) return;
      try {
        data[key] = JSON.parse(raw);
      } catch (error) {
        /* 損壞資料不放進備份，避免在其他裝置繼續造成問題。 */
      }
    });
    return data;
  }

  function exportBackup() {
    try {
      const now = new Date();
      const payload = {
        product: "ExamMate",
        formatVersion: 1,
        exportedAt: now.toISOString(),
        exportedAtRoc: formatRocDateTime(now),
        data: collectBackupData()
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      link.href = url;
      link.download = `ExamMate-備份-民國${now.getFullYear() - 1911}年${month}月${day}日.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      localStorage.setItem(BACKUP_META_KEY, JSON.stringify({ exportedAt: now.toISOString() }));
      updateBackupMetaLabel();
      setFeedback("完整備份檔已產生。請確認下載完成，再存到安全的位置。");
    } catch (error) {
      setFeedback("目前無法產生備份檔，請檢查瀏覽器是否允許下載。", true);
    }
  }

  function validBackupPayload(payload) {
    if (!payload || payload.product !== "ExamMate" || payload.formatVersion !== 1 ||
      !payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) return false;
    const keys = Object.keys(payload.data);
    if (!keys.length || keys.some((key) => !BACKUP_KEYS.includes(key))) return false;
    const profile = payload.data[PROFILE_KEY];
    if (profile !== undefined && (!profile || typeof profile !== "object" || typeof profile.studentName !== "string")) return false;
    try {
      keys.forEach((key) => JSON.stringify(payload.data[key]));
      return true;
    } catch (error) {
      return false;
    }
  }

  function restoreSnapshot(snapshot) {
    MANAGED_KEYS.forEach((key) => localStorage.removeItem(key));
    Object.entries(snapshot).forEach(([key, value]) => {
      if (value !== null) localStorage.setItem(key, value);
    });
  }

  async function importBackup(file) {
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setFeedback("備份檔超過 30MB，請確認是否選到正確的 ExamMate 備份檔。", true);
      return;
    }
    try {
      const payload = JSON.parse(await file.text());
      if (!validBackupPayload(payload)) throw new Error("格式不符");
      const itemCount = Object.keys(payload.data).length;
      if (!window.confirm(`要還原這份 ExamMate 備份嗎？\n\n備份時間：${payload.exportedAtRoc || formatRocDateTime(payload.exportedAt)}\n資料類別：${itemCount} 項\n\n這會覆蓋目前裝置上的 ExamMate 資料。`)) return;

      const snapshot = Object.fromEntries(MANAGED_KEYS.map((key) => [key, localStorage.getItem(key)]));
      try {
        BACKUP_KEYS.forEach((key) => localStorage.removeItem(key));
        Object.entries(payload.data).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
        localStorage.setItem(BACKUP_META_KEY, JSON.stringify({ exportedAt: payload.exportedAt || new Date().toISOString(), importedAt: new Date().toISOString() }));
      } catch (error) {
        restoreSnapshot(snapshot);
        throw new Error("裝置儲存空間不足");
      }
      setFeedback("資料已還原完成，正在重新載入 ExamMate。");
      window.setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setFeedback(error.message === "裝置儲存空間不足"
        ? "還原失敗：裝置儲存空間不足，原本資料已恢復。"
        : "這不是有效的 ExamMate 備份檔，沒有修改目前資料。", true);
    }
  }

  function reset() {
    try {
      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(BACKUP_META_KEY);
    } catch (error) {
      /* 外觀仍可在目前頁面恢復為清爽版。 */
    }
    applyTheme("clean");
  }

  function init() {
    applyTheme(readTheme());
    $("#open-appearance-backup")?.addEventListener("click", openDialog);
    $("#open-data-tools")?.addEventListener("click", openDialog);
    $("#close-appearance-backup")?.addEventListener("click", closeDialog);
    $$("[data-theme-choice]").forEach((button) => button.addEventListener("click", () => applyTheme(button.dataset.themeChoice, true)));
    $("#export-exammate-backup")?.addEventListener("click", exportBackup);
    $("#import-exammate-backup")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (file) importBackup(file);
      event.target.value = "";
    });
    $("#appearance-backup-dialog")?.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog();
    });
    $("#appearance-backup-dialog")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeDialog();
    });
  }

  applyTheme(readTheme());
  window.ExamMateAppearanceBackup = { applyTheme, exportBackup, importBackup, reset };
  document.addEventListener("DOMContentLoaded", init);
})();
