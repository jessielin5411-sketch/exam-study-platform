/*
 * ExamMate 每週複習計畫提醒
 * ---------------------------------------------------------------
 * 每週六 20:00 後，在首頁溫和提醒學生安排下週進度。
 * 提醒狀態只存在目前瀏覽器；同一週不會重複打擾。
 */
(function () {
  "use strict";

  const STORAGE_KEY = "examMate.weeklyPlanPrompt.v1";
  const PROFILE_KEY = "examJourney.profile.v1";
  const SNOOZE_MS = 2 * 60 * 60 * 1000;
  const state = { timer: null, activeWeekKey: "" };
  const $ = (selector) => document.querySelector(selector);

  function startOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatRocRange(start, end) {
    const startYear = start.getFullYear() - 1911;
    const endYear = end.getFullYear() - 1911;
    const first = `民國 ${startYear} 年 ${start.getMonth() + 1} 月 ${start.getDate()} 日`;
    const last = startYear === endYear
      ? `${end.getMonth() + 1} 月 ${end.getDate()} 日`
      : `民國 ${endYear} 年 ${end.getMonth() + 1} 月 ${end.getDate()} 日`;
    return `${first}－${last}`;
  }

  function reminderSaturday(now = new Date()) {
    const day = now.getDay();
    if (day === 6 && now.getHours() >= 20) return startOfDay(now);
    if (day === 0) {
      const saturday = startOfDay(now);
      saturday.setDate(saturday.getDate() - 1);
      return saturday;
    }
    return null;
  }

  function nextSaturdayAtEight(now = new Date()) {
    const next = startOfDay(now);
    const day = now.getDay();
    let days = (6 - day + 7) % 7;
    if (day === 6 && now.getHours() >= 20) days = 7;
    next.setDate(next.getDate() + days);
    next.setHours(20, 0, 1, 0);
    return next;
  }

  function readPromptState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || typeof parsed !== "object" || typeof parsed.weekKey !== "string" || typeof parsed.status !== "string") return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function savePromptState(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function hasProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      return Boolean(profile?.studentName);
    } catch (error) {
      return false;
    }
  }

  function isDashboardVisible() {
    const dashboard = $("#dashboard-view");
    return Boolean(dashboard && !dashboard.hidden);
  }

  function scheduleAt(targetTime) {
    clearTimeout(state.timer);
    const delay = Math.max(1000, Math.min(targetTime.getTime() - Date.now(), 2147483647));
    state.timer = setTimeout(() => {
      check();
      scheduleNext();
    }, delay);
  }

  function scheduleNext() {
    const now = new Date();
    const saturday = reminderSaturday(now);
    const saved = readPromptState();
    if (saturday && saved?.weekKey === dateKey(saturday) && saved.status === "snoozed" && Number(saved.snoozeUntil) > Date.now()) {
      return scheduleAt(new Date(Number(saved.snoozeUntil)));
    }
    scheduleAt(nextSaturdayAtEight(now));
  }

  function openReminder(saturday) {
    const dialog = $("#weekly-plan-reminder-dialog");
    if (!dialog || dialog.open) return;
    const nextMonday = new Date(saturday);
    const nextSunday = new Date(saturday);
    nextMonday.setDate(nextMonday.getDate() + 2);
    nextSunday.setDate(nextSunday.getDate() + 8);
    state.activeWeekKey = dateKey(saturday);
    if ($("#weekly-reminder-date-range")) $("#weekly-reminder-date-range").textContent = formatRocRange(nextMonday, nextSunday);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function check(now = new Date()) {
    if (!hasProfile() || !isDashboardVisible()) return false;
    const saturday = reminderSaturday(now);
    if (!saturday) return false;
    const weekKey = dateKey(saturday);
    const saved = readPromptState();
    if (saved?.weekKey === weekKey) {
      if (saved.status === "planned" || saved.status === "dismissed") return false;
      if (saved.status === "snoozed" && Number(saved.snoozeUntil) > now.getTime()) return false;
    }
    openReminder(saturday);
    return true;
  }

  function closeDialog() {
    const dialog = $("#weekly-plan-reminder-dialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function snooze() {
    if (state.activeWeekKey) savePromptState({
      weekKey: state.activeWeekKey,
      status: "snoozed",
      snoozeUntil: Date.now() + SNOOZE_MS
    });
    closeDialog();
    scheduleNext();
  }

  function dismiss() {
    if (state.activeWeekKey) savePromptState({ weekKey: state.activeWeekKey, status: "dismissed", snoozeUntil: 0 });
    closeDialog();
    scheduleNext();
  }

  function arrangeNextWeek() {
    if (state.activeWeekKey) savePromptState({ weekKey: state.activeWeekKey, status: "planned", snoozeUntil: 0 });
    closeDialog();
    window.ExamMateLearning?.goToView?.("plan");
    window.ExamMateStudyPlan?.setWeekOffset?.(1);
    window.setTimeout(() => $("#study-plan-week")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    scheduleNext();
  }

  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* 清除失敗時不影響其他功能 */ }
    state.activeWeekKey = "";
    scheduleNext();
  }

  function init() {
    $("#arrange-next-week-button")?.addEventListener("click", arrangeNextWeek);
    $("#snooze-weekly-plan-reminder")?.addEventListener("click", snooze);
    $("#close-weekly-plan-reminder")?.addEventListener("click", snooze);
    $("#dismiss-weekly-plan-reminder")?.addEventListener("click", dismiss);
    $("#weekly-plan-reminder-dialog")?.addEventListener("cancel", (event) => {
      event.preventDefault();
      snooze();
    });
    check();
    scheduleNext();
  }

  window.ExamMateWeeklyPlanReminder = { check, reset };
  document.addEventListener("DOMContentLoaded", init);
})();
