/* 國中會考自主學習平台：所有畫面與資料邏輯都集中於此。 */
(function () {
  "use strict";

  const STORAGE_KEYS = {
    profile: "examJourney.profile.v1",
    events: "examJourney.events.v1",
    dailyGoal: "examJourney.dailyGoal.v1",
    learning: "examMate.learning.v1",
    wrongQuestions: "examMate.wrongQuestions.v1",
    unitReviews: "examMate.unitReviews.v1",
    studyPlan: "examMate.studyPlan.v1",
    digitalWrongNotebook: "examMate.digitalWrongNotebook.v1",
    aiCoach: "examMate.aiCoach.v1",
    weeklyPlanPrompt: "examMate.weeklyPlanPrompt.v1",
    appearance: "examMate.appearance.v1",
    backupMeta: "examMate.backupMeta.v1"
  };
  const DAY_MS = 24 * 60 * 60 * 1000;
  const state = { profile: null, events: [], editingProfile: false, toastTimer: null, reminderIndex: 0 };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const elements = {
    setupView: $("#setup-view"), dashboardView: $("#dashboard-view"), profileForm: $("#profile-form"),
    examYear: $("#exam-year"), dataAlert: $("#data-alert"), dataAlertMessage: $("#data-alert-message"),
    eventForm: $("#event-form"), eventList: $("#event-list"), dateDialog: $("#date-manager-dialog"),
    resetDialog: $("#reset-dialog"), toast: $("#toast"), examCards: $("#exam-cards")
  };

  function startOfToday(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function parseLocalDate(value) {
    if (typeof value !== "string" || !/^\d{2,4}-\d{2}-\d{2}$/.test(value)) return null;
    const [inputYear, month, day] = value.split("-").map(Number);
    // 民國年轉為瀏覽器可計算的西元年份；四位數僅供舊資料自動轉換使用。
    const year = inputYear < 1000 ? inputYear + 1911 : inputYear;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  function formatDate(value, withWeekday = true) {
    const date = typeof value === "string" ? parseLocalDate(value) : value;
    if (!date) return "日期格式錯誤";
    const rocYear = date.getFullYear() - 1911;
    const weekday = withWeekday ? ` ${new Intl.DateTimeFormat("zh-TW", { weekday: "short" }).format(date)}` : "";
    return `民國${rocYear}年${date.getMonth() + 1}月${date.getDate()}日${weekday}`;
  }

  function formatDateRange(startValue, endValue) {
    const start = parseLocalDate(startValue);
    const end = parseLocalDate(endValue);
    if (!start) return "日期格式錯誤";
    if (!end || start.getTime() === end.getTime()) return formatDate(start);
    const startWeekday = new Intl.DateTimeFormat("zh-TW", { weekday: "short" }).format(start);
    const endWeekday = new Intl.DateTimeFormat("zh-TW", { weekday: "short" }).format(end);
    const startRocYear = start.getFullYear() - 1911;
    const endRocYear = end.getFullYear() - 1911;
    const startCopy = `民國${startRocYear}年${start.getMonth() + 1}月${start.getDate()}日 ${startWeekday}`;
    const endCopy = startRocYear === endRocYear
      ? `${end.getMonth() + 1}月${end.getDate()}日 ${endWeekday}`
      : `民國${endRocYear}年${end.getMonth() + 1}月${end.getDate()}日 ${endWeekday}`;
    return `${startCopy}－${endCopy}`;
  }

  function toRocDateString(value) {
    const date = typeof value === "string" ? parseLocalDate(value) : value;
    if (!date) return "";
    const rocYear = date.getFullYear() - 1911;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${rocYear}-${month}-${day}`;
  }

  function getCalendarDays(target, from = startOfToday()) {
    const targetDay = startOfToday(target);
    return Math.max(0, Math.ceil((targetDay - from) / DAY_MS));
  }

  function getExamYearConfig() {
    const chosenYear = state.profile?.examYear || examConfig.defaultYear;
    return examConfig.examYears[chosenYear] || examConfig.examYears[examConfig.defaultYear] || null;
  }

  function safeRead(key, fallback, validator, label) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      if (!validator(parsed)) throw new Error("資料格式不符");
      return parsed;
    } catch (error) {
      showDataAlert(`${label}無法讀取，系統已暫時忽略這份資料。你可以使用重新設定功能復原。`);
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      showToast("瀏覽器無法儲存資料，請確認未停用網站儲存空間。", true);
      return false;
    }
  }

  function validProfile(profile) {
    return Boolean(profile && typeof profile === "object" &&
      typeof profile.studentName === "string" && profile.studentName.trim() &&
      typeof profile.schoolName === "string" && typeof profile.grade === "string" && profile.grade &&
      typeof profile.className === "string" && typeof profile.examYear === "string" &&
      typeof profile.targetScore === "string" && profile.targetScore.trim() &&
      Array.isArray(profile.weakSubjects) && profile.weakSubjects.every((subject) => typeof subject === "string") &&
      typeof profile.dailyStudyTime === "string" && profile.dailyStudyTime &&
      typeof profile.motto === "string" && profile.motto.trim());
  }

  function validEvents(events) {
    return Array.isArray(events) && events.every((event) => event && typeof event.id === "string" &&
      typeof event.name === "string" && parseLocalDate(event.date) && typeof event.type === "string");
  }

  function showDataAlert(message) {
    elements.dataAlertMessage.textContent = message;
    elements.dataAlert.hidden = false;
  }

  function showToast(message, isError = false) {
    clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.style.background = isError ? "#a84f59" : "#365759";
    elements.toast.classList.add("show");
    state.toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2800);
  }

  function initializeYearOptions() {
    const years = Object.keys(examConfig.examYears).sort((a, b) => Number(a) - Number(b));
    elements.examYear.innerHTML = years.map((year) => `<option value="${escapeHtml(year)}">民國 ${escapeHtml(year)} 年</option>`).join("");
    elements.examYear.value = examConfig.defaultYear;
  }

  function loadState() {
    state.profile = safeRead(STORAGE_KEYS.profile, null, validProfile, "個人資料");
    state.events = safeRead(STORAGE_KEYS.events, [], validEvents, "重要日期");
    // 將舊版西元資料自動轉成民國年，學生不必重新輸入。
    if (state.profile && /^\d{4}$/.test(state.profile.examYear)) {
      state.profile.examYear = String(Number(state.profile.examYear) - 1911);
      safeWrite(STORAGE_KEYS.profile, state.profile);
    }
    const migratedEvents = state.events.map((event) => ({ ...event, date: toRocDateString(event.date) }));
    if (migratedEvents.some((event, index) => event.date !== state.events[index].date)) {
      state.events = migratedEvents;
      safeWrite(STORAGE_KEYS.events, state.events);
    }
    if (state.profile && !examConfig.examYears[state.profile.examYear]) {
      showDataAlert("原本設定的會考年度已不在目前的日期設定中，請修改個人資料並重新選擇年度。");
      state.profile = null;
    }
  }

  function showSetup(editing = false) {
    state.editingProfile = editing;
    elements.setupView.hidden = false;
    elements.dashboardView.hidden = true;
    $("#profile-form-title").textContent = editing ? "修改你的基本資料" : "你的基本資料";
    $("#profile-submit-label").textContent = editing ? "儲存修改" : "開始我的會考準備";
    $("#cancel-profile-edit").hidden = !editing;
    if (editing && state.profile) fillProfileForm(state.profile);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showDashboard() {
    if (!state.profile) return showSetup(false);
    elements.setupView.hidden = true;
    elements.dashboardView.hidden = false;
    renderDashboard();
    window.ExamMateWeeklyPlanReminder?.check();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fillProfileForm(profile) {
    const fields = ["studentName", "schoolName", "grade", "className", "examYear", "targetScore", "dailyStudyTime", "motto"];
    fields.forEach((field) => { elements.profileForm.elements[field].value = profile[field] || ""; });
    $$('input[name="weakSubjects"]').forEach((input) => { input.checked = profile.weakSubjects.includes(input.value); });
  }

  function clearFormErrors(form, attribute) {
    form.querySelectorAll(`[${attribute}]`).forEach((node) => { node.textContent = ""; });
    form.querySelectorAll('[aria-invalid="true"]').forEach((node) => node.removeAttribute("aria-invalid"));
  }

  function setFieldError(form, fieldName, message, attribute) {
    const error = form.querySelector(`[${attribute}="${fieldName}"]`);
    const field = form.elements[fieldName];
    if (error) error.textContent = message;
    if (field) field.setAttribute("aria-invalid", "true");
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    clearFormErrors(elements.profileForm, "data-error-for");
    const data = new FormData(elements.profileForm);
    const profile = {
      studentName: String(data.get("studentName") || "").trim(),
      schoolName: String(data.get("schoolName") || "").trim(),
      grade: String(data.get("grade") || ""),
      className: String(data.get("className") || "").trim(),
      examYear: String(data.get("examYear") || ""),
      targetScore: String(data.get("targetScore") || "").trim(),
      weakSubjects: data.getAll("weakSubjects").map(String),
      dailyStudyTime: String(data.get("dailyStudyTime") || ""),
      motto: String(data.get("motto") || "").trim(),
      updatedAt: new Date().toISOString()
    };
    const required = [
      ["studentName", profile.studentName, "請輸入姓名或暱稱。"], ["grade", profile.grade, "請選擇年級。"],
      ["examYear", profile.examYear, "請選擇目標會考年度。"], ["targetScore", profile.targetScore, "請輸入目標成績。"],
      ["dailyStudyTime", profile.dailyStudyTime, "請選擇每天預計讀書時間。"], ["motto", profile.motto, "請寫下一句給自己的話。"]
    ];
    let firstInvalid = null;
    required.forEach(([name, value, message]) => {
      if (!value) { setFieldError(elements.profileForm, name, message, "data-error-for"); firstInvalid ||= elements.profileForm.elements[name]; }
    });
    if (!examConfig.examYears[profile.examYear]) {
      setFieldError(elements.profileForm, "examYear", "這個年度沒有可用的考試設定。", "data-error-for");
      firstInvalid ||= elements.profileForm.elements.examYear;
    }
    if (firstInvalid) { firstInvalid.focus(); showToast("請先完成必填欄位。", true); return; }
    if (!safeWrite(STORAGE_KEYS.profile, profile)) return;
    state.profile = profile;
    elements.dataAlert.hidden = true;
    showDashboard();
    showToast(state.editingProfile ? "個人資料已更新。" : "學習資料建立完成，開始穩穩前進！");
    state.editingProfile = false;
  }

  function renderDashboard() {
    const profile = state.profile;
    const firstChar = Array.from(profile.studentName)[0] || "同";
    $("#student-chip-name").textContent = profile.studentName;
    $("#student-avatar").textContent = firstChar;
    $("#welcome-title").textContent = `嗨，${profile.studentName}！距離會考又更近了一天。`;
    $("#target-score-display").textContent = profile.targetScore;
    $("#motto-display").textContent = profile.motto;
    $("#today-label").textContent = new Intl.DateTimeFormat("zh-TW", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
    renderDailyGoal();
    updateAllCountdowns();
  }

  function getAllEvents() {
    const config = getExamYearConfig();
    const builtIn = config ? config.mockExams.map((exam, index) => ({
      id: `mock-${index + 1}`, name: exam.name, date: exam.date, endDate: exam.endDate || exam.date,
      type: "模擬考", note: exam.reminder, builtIn: true, order: index
    })) : [];
    return [...builtIn, ...state.events.map((event) => ({ ...event, builtIn: false }))]
      .filter((event) => parseLocalDate(event.date))
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
  }

  function updateAllCountdowns() {
    updateFinalCountdown();
    renderExamCards();
    updateNextExam();
    updateTimeAwareness();
  }

  function updateFinalCountdown() {
    const config = getExamYearConfig();
    if (!config || !parseLocalDate(config.finalExam.date)) {
      showDataAlert("會考日期設定有誤，請檢查 config.js 的日期格式。");
      return;
    }
    const target = parseLocalDate(config.finalExam.date);
    const targetEnd = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 8, 20, 0);
    const now = new Date();
    const remaining = Math.max(0, targetEnd - now);
    const days = Math.floor(remaining / DAY_MS);
    const hours = Math.floor((remaining % DAY_MS) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    updateNumber("#countdown-days", String(days).padStart(3, "0"));
    updateNumber("#countdown-hours", String(hours).padStart(2, "0"));
    updateNumber("#countdown-minutes", String(minutes).padStart(2, "0"));
    updateNumber("#countdown-seconds", String(seconds).padStart(2, "0"));
    $("#final-exam-heading").textContent = remaining > 0 ? config.finalExam.name : `${config.finalExam.name}已到期`;
    $("#final-exam-date").textContent = `正式日期：${formatDate(config.finalExam.date)}`;

    const start = parseLocalDate(config.preparationStart) || startOfToday(now);
    const total = Math.max(1, target - start);
    const elapsed = Math.max(0, Math.min(total, startOfToday(now) - start));
    const percent = Math.round((elapsed / total) * 100);
    $("#progress-percent").textContent = `${percent}%`;
    $("#progress-bar").style.width = `${percent}%`;
    $("#progress-bar").parentElement.setAttribute("aria-valuenow", String(percent));
    $("#elapsed-days").textContent = `已走過 ${Math.floor(elapsed / DAY_MS)} 天準備時間`;
    $("#remaining-summary").textContent = remaining > 0 ? `剩下 ${days} 天，照自己的節奏前進` : "這個重要日子已經到來";
  }

  function updateNumber(selector, value) {
    const node = $(selector);
    if (node.textContent === value) return;
    node.textContent = value;
    node.classList.remove("tick");
    void node.offsetWidth;
    node.classList.add("tick");
  }

  function renderExamCards() {
    const today = startOfToday();
    const events = getAllEvents();
    elements.examCards.innerHTML = events.map((event, index) => {
      const date = parseLocalDate(event.date);
      const endDate = parseLocalDate(event.endDate) || date;
      const ended = endDate < today;
      const days = getCalendarDays(date, today);
      return `<article class="exam-card ${event.builtIn ? "" : "custom"} ${ended ? "ended" : ""}">
        <div class="card-topline"><span class="${ended ? "ended-badge" : "exam-type"}">${ended ? "已結束" : escapeHtml(event.type)}</span><span class="exam-index">${String(index + 1).padStart(2, "0")}</span></div>
        <h3>${escapeHtml(event.name)}</h3><p class="exam-date">${escapeHtml(formatDateRange(event.date, event.endDate))}</p>
        <div class="card-count">${ended ? "<strong>已結束</strong>" : `<strong>${days}</strong><span>天後</span>`}</div>
        <p class="card-reminder">${escapeHtml(event.note || (ended ? "保留這筆紀錄，看看自己已走過的路。" : "提早安排複習範圍，留一點彈性給自己。"))}</p>
      </article>`;
    }).join("");
    if (!events.length) elements.examCards.innerHTML = '<div class="event-list-empty">目前沒有可顯示的考試日期，請檢查設定檔或新增重要日期。</div>';
  }

  function updateNextExam() {
    const today = startOfToday();
    const upcoming = getAllEvents().find((event) => (parseLocalDate(event.endDate) || parseLocalDate(event.date)) >= today);
    if (!upcoming) {
      $("#next-exam-title").textContent = "目前沒有即將到來的考試";
      $("#next-exam-note").textContent = "新增重要日期，讓準備更有方向。";
      $("#next-exam-days").textContent = "—";
      return;
    }
    $("#next-exam-title").textContent = `${upcoming.name} · ${formatDateRange(upcoming.date, upcoming.endDate)}`;
    $("#next-exam-note").textContent = upcoming.note || "把範圍拆小，今天先完成一個部分。";
    $("#next-exam-days").textContent = getCalendarDays(parseLocalDate(upcoming.date), today);
  }

  function updateTimeAwareness() {
    const now = new Date();
    const weekday = now.getDay();
    const daysToSunday = weekday === 0 ? 0 : 7 - weekday;
    const monthLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    $("#week-days-left").textContent = `${daysToSunday} 天`;
    $("#month-days-left").textContent = `${monthLastDay - now.getDate()} 天`;
    const dayOfYear = Math.floor((startOfToday(now) - new Date(now.getFullYear(), 0, 1)) / DAY_MS);
    state.reminderIndex = dayOfYear % examConfig.encouragements.length;
    $("#rotating-reminder").textContent = examConfig.encouragements[state.reminderIndex];
  }

  function renderDailyGoal() {
    const todayKey = toRocDateString(new Date());
    const goal = safeRead(STORAGE_KEYS.dailyGoal, null, (value) => !value || (typeof value === "object" && typeof value.date === "string" && typeof value.text === "string"), "今日小目標");
    if (goal && goal.date !== toRocDateString(goal.date)) {
      goal.date = toRocDateString(goal.date);
      safeWrite(STORAGE_KEYS.dailyGoal, goal);
    }
    const input = $("#daily-goal-input");
    const status = $("#daily-goal-status");
    if (goal && goal.date === todayKey) {
      input.value = goal.text;
      status.textContent = "今天的目標已存好；完成後，也別忘了肯定自己的投入。";
      status.classList.add("completed");
    } else {
      input.value = "";
      status.textContent = "完成一件小事，就值得替自己記上一筆。";
      status.classList.remove("completed");
    }
  }

  function handleDailyGoalSubmit(event) {
    event.preventDefault();
    const input = $("#daily-goal-input");
    const text = input.value.trim();
    if (!text) { input.focus(); showToast("請先寫下今天想完成的小目標。", true); return; }
    if (safeWrite(STORAGE_KEYS.dailyGoal, { date: toRocDateString(new Date()), text })) {
      renderDailyGoal(); showToast("今日小目標已儲存。你已經跨出第一步！");
    }
  }

  function openDateManager() {
    resetEventForm();
    renderEventList();
    if (typeof elements.dateDialog.showModal === "function") elements.dateDialog.showModal();
    else elements.dateDialog.setAttribute("open", "");
  }

  function handleEventSubmit(event) {
    event.preventDefault();
    clearFormErrors(elements.eventForm, "data-event-error-for");
    const data = new FormData(elements.eventForm);
    const item = {
      id: String(data.get("eventId") || createId()), name: String(data.get("eventName") || "").trim(),
      date: String(data.get("eventDate") || ""), type: String(data.get("eventType") || ""),
      note: String(data.get("eventNote") || "").trim(), updatedAt: new Date().toISOString()
    };
    let firstInvalid = null;
    [["eventName", item.name, "請輸入考試名稱。"], ["eventDate", item.date, "請選擇日期。"], ["eventType", item.type, "請選擇類型。"]].forEach(([name, value, message]) => {
      if (!value) { setFieldError(elements.eventForm, name, message, "data-event-error-for"); firstInvalid ||= elements.eventForm.elements[name]; }
    });
    if (item.date && !/^\d{2,3}-\d{2}-\d{2}$/.test(item.date)) {
      setFieldError(elements.eventForm, "eventDate", "請使用民國年格式，例如 116-09-01。", "data-event-error-for");
      firstInvalid ||= elements.eventForm.elements.eventDate;
    } else if (item.date && !parseLocalDate(item.date)) {
      setFieldError(elements.eventForm, "eventDate", "日期不存在，請重新輸入。", "data-event-error-for");
      firstInvalid ||= elements.eventForm.elements.eventDate;
    }
    if (firstInvalid) { firstInvalid.focus(); return; }
    const existingIndex = state.events.findIndex((saved) => saved.id === item.id);
    if (existingIndex >= 0) state.events[existingIndex] = item; else state.events.push(item);
    if (!safeWrite(STORAGE_KEYS.events, state.events)) return;
    const isPast = parseLocalDate(item.date) < startOfToday();
    resetEventForm(); renderEventList(); updateAllCountdowns();
    showToast(isPast ? "日期已儲存，並標示為已結束。" : (existingIndex >= 0 ? "重要日期已更新。" : "重要日期已新增。"));
  }

  function renderEventList() {
    const sorted = [...state.events].sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
    $("#event-count").textContent = `${sorted.length} 筆`;
    if (!sorted.length) {
      elements.eventList.innerHTML = '<div class="event-list-empty">還沒有自訂日期。<br>新增段考、複習考或報名截止日吧。</div>';
      return;
    }
    elements.eventList.innerHTML = sorted.map((event) => {
      const date = parseLocalDate(event.date);
      const ended = date < startOfToday();
      return `<div class="event-row">
        <div class="event-date-block"><small>${date.getMonth() + 1} 月</small><strong>${date.getDate()}</strong></div>
        <div class="event-info"><strong>${escapeHtml(event.name)}</strong><span>${escapeHtml(event.type)}${ended ? " · 已結束" : ""}${event.note ? ` · ${escapeHtml(event.note)}` : ""}</span></div>
        <div class="event-actions"><button type="button" data-edit-event="${escapeHtml(event.id)}">修改</button><button class="delete-event" type="button" data-delete-event="${escapeHtml(event.id)}">刪除</button></div>
      </div>`;
    }).join("");
  }

  function startEventEdit(id) {
    const item = state.events.find((event) => event.id === id);
    if (!item) return;
    elements.eventForm.elements.eventId.value = item.id;
    elements.eventForm.elements.eventName.value = item.name;
    elements.eventForm.elements.eventDate.value = item.date;
    elements.eventForm.elements.eventType.value = item.type;
    elements.eventForm.elements.eventNote.value = item.note || "";
    $("#event-form-title").textContent = "修改重要日期";
    $("#event-submit-label").textContent = "儲存修改";
    $("#cancel-event-edit").hidden = false;
    elements.eventForm.elements.eventName.focus();
  }

  function deleteEvent(id) {
    const item = state.events.find((event) => event.id === id);
    if (!item || !window.confirm(`確定要刪除「${item.name}」嗎？`)) return;
    state.events = state.events.filter((event) => event.id !== id);
    if (!safeWrite(STORAGE_KEYS.events, state.events)) return;
    resetEventForm(); renderEventList(); updateAllCountdowns(); showToast("重要日期已刪除。");
  }

  function resetEventForm() {
    elements.eventForm.reset();
    elements.eventForm.elements.eventId.value = "";
    $("#event-form-title").textContent = "新增重要日期";
    $("#event-submit-label").textContent = "新增日期";
    $("#cancel-event-edit").hidden = true;
    clearFormErrors(elements.eventForm, "data-event-error-for");
  }

  function resetAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      showToast("瀏覽器拒絕清除資料，請檢查網站儲存空間設定。", true);
      return;
    }
    state.profile = null; state.events = [];
    window.ExamMateStudyPlan?.reset();
    window.ExamMateDigitalNotebook?.reset();
    window.ExamMateWeeklyPlanReminder?.reset();
    window.ExamMateAppearanceBackup?.reset();
    elements.resetDialog.close();
    elements.dataAlert.hidden = true;
    elements.profileForm.reset();
    initializeYearOptions();
    showSetup(false);
    showToast("資料已清除，可以重新開始設定。");
  }

  function createId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function bindEvents() {
    elements.profileForm.addEventListener("submit", handleProfileSubmit);
    $("#daily-goal-form").addEventListener("submit", handleDailyGoalSubmit);
    elements.eventForm.addEventListener("submit", handleEventSubmit);
    $("#edit-profile-button").addEventListener("click", () => showSetup(true));
    $("#cancel-profile-edit").addEventListener("click", showDashboard);
    [$("#open-date-manager"), $("#open-date-manager-top")].forEach((button) => button.addEventListener("click", openDateManager));
    $("#cancel-event-edit").addEventListener("click", resetEventForm);
    [$("#reset-profile-button"), $("#alert-reset-button")].forEach((button) => button.addEventListener("click", () => elements.resetDialog.showModal()));
    $("#confirm-reset-button").addEventListener("click", resetAllData);
    $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => $("#" + button.dataset.closeDialog).close()));
    elements.eventList.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-event]");
      const deleteButton = event.target.closest("[data-delete-event]");
      if (editButton) startEventEdit(editButton.dataset.editEvent);
      if (deleteButton) deleteEvent(deleteButton.dataset.deleteEvent);
    });
    [elements.dateDialog, elements.resetDialog].forEach((dialog) => dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    }));
  }

  function init() {
    if (typeof examConfig === "undefined" || !examConfig.examYears) {
      showDataAlert("考試設定檔無法讀取，請確認 config.js 已正確載入。");
      return;
    }
    initializeYearOptions();
    bindEvents();
    loadState();
    if (state.profile) showDashboard(); else showSetup(false);
    window.setInterval(() => { if (state.profile && !elements.dashboardView.hidden) updateFinalCountdown(); }, 1000);
    window.setInterval(() => { if (state.profile && !elements.dashboardView.hidden) { updateNextExam(); updateTimeAwareness(); } }, 60000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
