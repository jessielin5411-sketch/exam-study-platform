/*
 * ExamMate 複習計畫系統
 * ---------------------------------------------------------------
 * 學生可以把日常作息與讀書內容排進一週，並在當天勾選完成。
 * 所有資料只儲存在目前瀏覽器的 localStorage。
 */
(function () {
  "use strict";

  const STORAGE_KEY = "examMate.studyPlan.v1";
  const PROFILE_KEY = "examJourney.profile.v1";
  const DAY_NAMES = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
  const SUBJECTS = ["國文", "英文", "數學", "自然", "社會"];
  const SUBJECT_FOCUS = {
    國文: "閱讀理解＋文言文重點",
    英文: "文法觀念＋閱讀練習",
    數學: "核心題型演練",
    自然: "觀念圖表＋題組練習",
    社會: "時序地圖＋資料判讀"
  };
  const PLAN_ADVICE = [
    "先排固定作息，再把精神最好的時段留給最需要加強的科目。",
    "每次只設定一個明確成果，例如「讀完兩頁重點，再完成 8 題」。",
    "同一科連續讀太久容易疲乏，兩個專注時段可安排不同科目。",
    "錯題不是額外負擔；每天用 10 分鐘訂正，最能看見真正的進步。",
    "每週保留一個彈性時段，臨時沒完成的內容可以移過去，不必硬撐。",
    "考前整合要練習題組與時間分配，不需要每天把五科全部塞滿。",
    "若今天精神較差，把任務縮小一半也可以，重點是維持學習連續性。"
  ];
  const PRINT_SLOTS = [
    { label: "08:00–10:00", start: 8 * 60, end: 10 * 60 },
    { label: "10:00–12:00", start: 10 * 60, end: 12 * 60 },
    { label: "12:00–16:00", start: 12 * 60, end: 16 * 60 },
    { label: "16:00–18:00", start: 16 * 60, end: 18 * 60 },
    { label: "18:00–20:00", start: 18 * 60, end: 20 * 60 },
    { label: "20:00–22:00", start: 20 * 60, end: 22 * 60 },
    { label: "22:00–23:30", start: 22 * 60, end: 24 * 60 }
  ];
  const state = { data: { items: [], completed: {} }, editingId: null, damaged: false, adviceIndex: 0, weekOffset: 0 };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(typeof document.querySelectorAll === "function" ? document.querySelectorAll(selector) : []);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
  }

  function isValidPlan(data) {
    return Boolean(data && typeof data === "object" && Array.isArray(data.items) &&
      data.items.every((item) => item && typeof item.id === "string" &&
        Number.isInteger(item.day) && item.day >= 0 && item.day <= 6 &&
        ["study", "routine"].includes(item.type) && typeof item.subject === "string" &&
        typeof item.title === "string" && item.title.trim() &&
        /^\d{2}:\d{2}$/.test(item.startTime) && Number.isInteger(item.duration) &&
        item.duration >= 5 && item.duration <= 240 && typeof item.note === "string") &&
      data.completed && typeof data.completed === "object" && !Array.isArray(data.completed) &&
      Object.values(data.completed).every((ids) => Array.isArray(ids) && ids.every((id) => typeof id === "string")));
  }

  function loadPlan() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!isValidPlan(parsed)) throw new Error("資料格式不符");
      state.data = parsed;
      state.damaged = false;
    } catch (error) {
      state.data = { items: [], completed: {} };
      state.damaged = true;
    }
  }

  function savePlan() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
      state.damaged = false;
      return true;
    } catch (error) {
      setFeedback("瀏覽器目前無法儲存，請確認沒有停用網站儲存空間。", true);
      return false;
    }
  }

  function mondayIndex(date = new Date()) {
    return (date.getDay() + 6) % 7;
  }

  function startOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dateForWeekDay(day, weekOffset = 0) {
    const date = startOfDay();
    date.setDate(date.getDate() - mondayIndex() + day + weekOffset * 7);
    return date;
  }

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatShortDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function formatRocDate(date, includeWeekday = false) {
    const weekday = includeWeekday ? `（${DAY_NAMES[mondayIndex(date)].replace("星期", "週")}）` : "";
    return `民國 ${date.getFullYear() - 1911} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日${weekday}`;
  }

  function parseRocDate(value) {
    if (typeof value !== "string" || !/^\d{2,3}-\d{2}-\d{2}$/.test(value)) return null;
    const [rocYear, month, day] = value.split("-").map(Number);
    const date = new Date(rocYear + 1911, month - 1, day);
    return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }

  function getProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      return profile && typeof profile === "object" ? profile : null;
    } catch (error) {
      return null;
    }
  }

  function normalizedWeakSubjects(profile) {
    const weak = Array.isArray(profile?.weakSubjects) ? profile.weakSubjects : [];
    return [...new Set(weak.map((subject) => subject === "英語" ? "英文" : subject).filter((subject) => SUBJECTS.includes(subject)))];
  }

  function completionIds(day, weekOffset = 0) {
    return state.data.completed[dateKey(dateForWeekDay(day, weekOffset))] || [];
  }

  function isCompleted(item, weekOffset = 0) {
    return completionIds(item.day, weekOffset).includes(item.id);
  }

  function sortedItems(day) {
    return state.data.items.filter((item) => item.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime) || a.title.localeCompare(b.title));
  }

  function endTime(startTime, duration) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const total = hours * 60 + minutes + duration;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function setFeedback(message, isError = false) {
    const feedback = $("#plan-form-feedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
  }

  function itemCard(item, compact = false, weekOffset = 0) {
    const completed = isCompleted(item, weekOffset);
    const typeLabel = item.type === "routine" ? "日常作息" : item.subject;
    return `<article class="plan-item ${item.type === "routine" ? "is-routine" : "is-study"} ${completed ? "is-completed" : ""}" draggable="${compact ? "false" : "true"}" data-plan-item="${escapeHtml(item.id)}">
      <button class="plan-check" type="button" data-toggle-plan-complete="${escapeHtml(item.id)}" aria-label="${completed ? "取消完成" : "標記完成"}" aria-pressed="${completed}">${completed ? "✓" : ""}</button>
      <div class="plan-item-main">
        <div class="plan-item-meta"><span>${escapeHtml(item.startTime)}–${escapeHtml(endTime(item.startTime, item.duration))}</span><b>${escapeHtml(typeLabel)}</b></div>
        <h3>${escapeHtml(item.title)}</h3>
        ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
      </div>
      ${compact ? "" : `<div class="plan-item-actions"><button type="button" data-edit-plan="${escapeHtml(item.id)}">修改</button><button type="button" data-delete-plan="${escapeHtml(item.id)}">刪除</button></div>`}
    </article>`;
  }

  function renderHomePlan() {
    const list = $("#home-plan-list");
    if (!list) return;
    const today = mondayIndex();
    const items = sortedItems(today);
    const completed = items.filter((item) => isCompleted(item, 0)).length;
    const minutes = items.reduce((total, item) => total + item.duration, 0);
    $("#home-plan-progress-copy").textContent = `${completed}／${items.length}`;
    const percent = items.length ? Math.round(completed / items.length * 100) : 0;
    $("#home-plan-progress-bar").style.width = `${percent}%`;
    $("#home-plan-progress-bar").parentElement.setAttribute("aria-valuenow", String(percent));
    $("#home-plan-summary").textContent = items.length
      ? `今天安排 ${items.length} 個時段，共約 ${minutes} 分鐘；完成多少都值得記錄。`
      : "今天還沒有安排，從一個 20 分鐘的小任務開始就很好。";
    list.innerHTML = items.length
      ? items.map((item) => itemCard(item, true, 0)).join("")
      : `<div class="home-plan-empty"><span aria-hidden="true">☕</span><div><strong>今天先留一點空白</strong><p>前往複習計畫，安排一個真正做得到的小時段。</p></div></div>`;
  }

  function renderWeek() {
    const board = $("#study-plan-week");
    if (!board) return;
    const today = mondayIndex();
    board.innerHTML = DAY_NAMES.map((name, day) => {
      const items = sortedItems(day);
      const done = items.filter((item) => isCompleted(item, state.weekOffset)).length;
      return `<section class="plan-day ${state.weekOffset === 0 && day === today ? "is-today" : ""}" data-plan-day="${day}">
        <header><div><span>${escapeHtml(name)}</span><strong>${escapeHtml(formatShortDate(dateForWeekDay(day, state.weekOffset)))}</strong></div><small>${done}／${items.length} 完成</small></header>
        <div class="plan-day-items">${items.length ? items.map((item) => itemCard(item, false, state.weekOffset)).join("") : `<div class="plan-day-empty">把作息或複習卡片放到這一天</div>`}</div>
      </section>`;
    }).join("");
    const monday = dateForWeekDay(0, state.weekOffset);
    const sunday = dateForWeekDay(6, state.weekOffset);
    if ($("#plan-week-label")) $("#plan-week-label").textContent = `${state.weekOffset === 0 ? "本週" : "下週"}｜${formatRocDate(monday)}－${sunday.getMonth() + 1} 月 ${sunday.getDate()} 日`;
    $$("[data-plan-week]").forEach((button) => {
      const active = Number(button.dataset.planWeek) === state.weekOffset;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderStats() {
    const todayItems = sortedItems(mondayIndex());
    const completed = todayItems.filter((item) => isCompleted(item, 0)).length;
    if ($("#plan-total-count")) $("#plan-total-count").textContent = String(state.data.items.length);
    if ($("#plan-today-count")) $("#plan-today-count").textContent = `${completed}／${todayItems.length}`;
    if ($("#plan-data-alert")) $("#plan-data-alert").hidden = !state.damaged;
  }

  function renderPersonalTip() {
    const tip = $("#personal-plan-tip");
    if (!tip) return;
    const profile = getProfile();
    const weak = normalizedWeakSubjects(profile);
    if (!profile) {
      tip.textContent = "先選一個節奏套用，再依照自己的放學、補習與休息時間微調。";
      return;
    }
    const weakCopy = weak.length ? `優先安排${weak.join("、")}` : "讓五科平均輪替";
    tip.textContent = `依照你設定的每日 ${profile.dailyStudyTime || "讀書時間"}，建議先${weakCopy}，並保留休息與彈性。`;
  }

  function itemMinute(item) {
    const [hours, minutes] = item.startTime.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function itemsForPrintSlot(day, slot) {
    return sortedItems(day).filter((item) => {
      const minutes = itemMinute(item);
      return minutes >= slot.start && minutes < slot.end;
    });
  }

  function getExamCountdowns() {
    const profile = getProfile();
    const configSource = typeof examConfig !== "undefined" ? examConfig : null;
    const year = profile?.examYear || configSource?.defaultYear;
    const config = configSource?.examYears?.[year] || configSource?.examYears?.[configSource?.defaultYear];
    if (!config) return [];
    const today = startOfDay();
    const exams = [config.finalExam, ...(config.mockExams || [])]
      .map((exam) => ({ ...exam, parsedDate: parseRocDate(exam.date) }))
      .filter((exam) => exam.parsedDate && exam.parsedDate >= today)
      .sort((a, b) => a.parsedDate - b.parsedDate);
    return exams.slice(0, 2).map((exam) => ({
      name: exam.name,
      days: Math.max(0, Math.ceil((exam.parsedDate - today) / 86400000))
    }));
  }

  function renderPrintSheet() {
    const monday = dateForWeekDay(0, state.weekOffset);
    const sunday = dateForWeekDay(6, state.weekOffset);
    const profile = getProfile();
    if ($("#print-student-name")) $("#print-student-name").textContent = profile?.studentName ? `${profile.studentName}的複習計畫` : "ExamMate 學習者";
    if ($("#print-week-range")) $("#print-week-range").textContent = `${formatRocDate(monday)}－${formatRocDate(sunday)}`;
    if ($("#print-created-date")) $("#print-created-date").textContent = formatRocDate(new Date());
    if ($("#print-plan-motto")) $("#print-plan-motto").textContent = profile?.motto || "穩定完成每一小步，就是最可靠的進步。";

    const countdowns = getExamCountdowns();
    if ($("#print-plan-countdowns")) {
      $("#print-plan-countdowns").innerHTML = countdowns.length
        ? countdowns.map((exam) => `<span><b>${escapeHtml(exam.name)}</b>倒數 <strong>${exam.days}</strong> 天</span>`).join("")
        : `<span>把注意力放在本週能完成的事，一步一步累積。</span>`;
    }
    if ($("#print-plan-head")) {
      $("#print-plan-head").innerHTML = `<tr><th>日期</th>${PRINT_SLOTS.map((slot) => `<th>${escapeHtml(slot.label)}</th>`).join("")}</tr>`;
    }
    if ($("#print-plan-body")) {
      $("#print-plan-body").innerHTML = DAY_NAMES.map((name, day) => `<tr>
        <th><strong>${escapeHtml(formatShortDate(dateForWeekDay(day)))}</strong><span>${escapeHtml(name.replace("星期", "週"))}</span></th>
        ${PRINT_SLOTS.map((slot) => {
          const items = itemsForPrintSlot(day, slot);
          return `<td>${items.map((item) => `<div class="print-plan-item ${item.type === "routine" ? "is-routine" : ""}"><b>${escapeHtml(item.startTime)} ${escapeHtml(item.title)}</b><small>${escapeHtml(item.type === "routine" ? "日常作息" : item.subject)}・${item.duration} 分</small></div>`).join("")}</td>`;
        }).join("")}
      </tr>`).join("");
    }
  }

  function render() {
    renderHomePlan();
    renderWeek();
    renderStats();
    renderPersonalTip();
    renderPrintSheet();
  }

  function subjectSequence(profile) {
    const weak = normalizedWeakSubjects(profile);
    return [...weak, ...SUBJECTS.filter((subject) => !weak.includes(subject)), ...weak];
  }

  function generatedItem(day, subject, startTime, duration, suffix, note) {
    return {
      id: `plan-auto-${Date.now()}-${day}-${startTime.replace(":", "")}-${Math.random().toString(36).slice(2, 6)}`,
      day,
      type: "study",
      subject,
      title: suffix === "錯題收尾" ? `${subject}錯題收尾` : `${subject}｜${SUBJECT_FOCUS[subject]}`,
      startTime,
      duration,
      note
    };
  }

  function createStrategyItems(strategy) {
    const profile = getProfile();
    const sequence = subjectSequence(profile);
    const items = [];
    DAY_NAMES.forEach((_, day) => {
      const first = sequence[day % sequence.length];
      const second = sequence[(day + 2) % sequence.length];
      if (strategy === "gentle") {
        items.push(generatedItem(day, first, day >= 5 ? "09:30" : "19:00", 20, "重點", "先看重點，再完成 5～8 題。"));
        items.push(generatedItem(day, first, day >= 5 ? "10:00" : "19:25", 10, "錯題收尾", "只整理今天最值得記住的一題。"));
      } else if (strategy === "sprint") {
        items.push(generatedItem(day, first, day >= 5 ? "09:00" : "18:50", day >= 5 ? 60 : 45, "重點", "以題組演練檢查觀念與作答速度。"));
        items.push(generatedItem(day, second, day >= 5 ? "10:20" : "19:45", day >= 5 ? 45 : 30, "重點", "換一科整合，避免單科疲乏。"));
        items.push(generatedItem(day, first, day >= 5 ? "11:15" : "20:20", day >= 5 ? 20 : 15, "錯題收尾", "訂正、寫下錯因，安排下次再練。"));
      } else {
        items.push(generatedItem(day, first, day >= 5 ? "09:30" : "19:00", day >= 5 ? 45 : 30, "重點", "講義重點 10 分鐘＋題目練習。"));
        items.push(generatedItem(day, second, day >= 5 ? "10:25" : "19:40", day >= 5 ? 30 : 20, "重點", "換科複習，完成一個明確小目標。"));
        items.push(generatedItem(day, first, day >= 5 ? "11:05" : "20:05", day >= 5 ? 15 : 10, "錯題收尾", "只記錄最重要的錯因與正確觀念。"));
      }
    });
    return items;
  }

  function strategyName(strategy) {
    return ({ gentle: "小步陪讀", balanced: "五科平衡", sprint: "考前整合" })[strategy] || "五科平衡";
  }

  function applyStrategy(strategy) {
    const currentStudyCount = state.data.items.filter((item) => item.type === "study").length;
    if (currentStudyCount && !window.confirm(`套用「${strategyName(strategy)}」會替換目前的讀書複習卡片，但會保留日常作息。要繼續嗎？`)) return;
    const removedIds = new Set(state.data.items.filter((item) => item.type === "study").map((item) => item.id));
    state.data.items = [
      ...state.data.items.filter((item) => item.type === "routine"),
      ...createStrategyItems(strategy)
    ];
    Object.keys(state.data.completed).forEach((key) => {
      state.data.completed[key] = state.data.completed[key].filter((id) => !removedIds.has(id));
    });
    if (!savePlan()) return;
    resetForm();
    setFeedback(`已套用「${strategyName(strategy)}」，你仍可拖曳或修改每一張卡片。`);
    render();
    $("#study-plan-week")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function recommendedStrategy() {
    const studyTime = getProfile()?.dailyStudyTime || "";
    if (studyTime.includes("30")) return "gentle";
    if (studyTime.includes("2 小時") || studyTime.includes("3 小時")) return "sprint";
    return "balanced";
  }

  function rotateAdvice() {
    state.adviceIndex = (state.adviceIndex + 1) % PLAN_ADVICE.length;
    if ($("#rotating-plan-advice")) $("#rotating-plan-advice").textContent = PLAN_ADVICE[state.adviceIndex];
  }

  function printPlan() {
    renderPrintSheet();
    window.print();
  }

  function setWeekOffset(value) {
    state.weekOffset = Number(value) === 1 ? 1 : 0;
    if (!state.editingId && $("#plan-submit-label")) $("#plan-submit-label").textContent = `加入${state.weekOffset === 1 ? "下週" : "本週"}計畫`;
    renderWeek();
    renderPrintSheet();
  }

  function resetForm() {
    state.editingId = null;
    const form = $("#study-plan-form");
    if (!form) return;
    form.reset();
    $("#plan-day").value = String(mondayIndex());
    $("#plan-start-time").value = "19:00";
    $("#plan-duration").value = "30";
    $("#plan-item-id").value = "";
    $("#plan-form-title").textContent = "新增每日作息或複習內容";
    $("#plan-submit-label").textContent = `加入${state.weekOffset === 1 ? "下週" : "本週"}計畫`;
    $("#cancel-plan-edit").hidden = true;
    $("#plan-title-error").textContent = "";
    setFeedback("");
    updateSubjectField();
  }

  function updateSubjectField() {
    const routine = $("#plan-type")?.value === "routine";
    if ($("#plan-subject-field")) $("#plan-subject-field").hidden = routine;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    $("#plan-title-error").textContent = title ? "" : "請輸入這個時段要做的事。";
    if (!title) {
      $("#plan-title").focus();
      setFeedback("先寫下要做的內容，再加入計畫。", true);
      return;
    }
    const type = String(formData.get("type") || "study");
    const item = {
      id: state.editingId || `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      day: Number(formData.get("day")),
      type,
      subject: type === "study" ? String(formData.get("subject") || "其他") : "",
      title,
      startTime: String(formData.get("startTime") || "19:00"),
      duration: Number(formData.get("duration") || 30),
      note: String(formData.get("note") || "").trim()
    };
    if (state.editingId) {
      const index = state.data.items.findIndex((entry) => entry.id === state.editingId);
      if (index >= 0) state.data.items[index] = item;
    } else {
      state.data.items.push(item);
    }
    if (!savePlan()) return;
    const message = state.editingId ? "已更新這個時段。" : "已加入本週計畫。";
    resetForm();
    setFeedback(message);
    render();
  }

  function editItem(id) {
    const item = state.data.items.find((entry) => entry.id === id);
    if (!item) return;
    state.editingId = id;
    $("#plan-item-id").value = id;
    $("#plan-day").value = String(item.day);
    $("#plan-type").value = item.type;
    $("#plan-subject").value = item.subject || "國文";
    $("#plan-start-time").value = item.startTime;
    $("#plan-title").value = item.title;
    $("#plan-duration").value = String(item.duration);
    $("#plan-note").value = item.note;
    $("#plan-form-title").textContent = "修改這個時段";
    $("#plan-submit-label").textContent = "儲存修改";
    $("#cancel-plan-edit").hidden = false;
    updateSubjectField();
    $("#study-plan-form").scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function deleteItem(id) {
    const item = state.data.items.find((entry) => entry.id === id);
    if (!item || !window.confirm(`要刪除「${item.title}」嗎？`)) return;
    state.data.items = state.data.items.filter((entry) => entry.id !== id);
    Object.keys(state.data.completed).forEach((key) => {
      state.data.completed[key] = state.data.completed[key].filter((itemId) => itemId !== id);
    });
    savePlan();
    if (state.editingId === id) resetForm();
    render();
  }

  function toggleComplete(id, weekOffset = 0) {
    const item = state.data.items.find((entry) => entry.id === id);
    if (!item) return;
    const key = dateKey(dateForWeekDay(item.day, weekOffset));
    const ids = new Set(state.data.completed[key] || []);
    if (ids.has(id)) ids.delete(id); else ids.add(id);
    state.data.completed[key] = [...ids];
    savePlan();
    render();
  }

  function handleClick(event) {
    const toggle = event.target.closest("[data-toggle-plan-complete]");
    if (toggle) {
      const weekOffset = toggle.closest("#home-plan-list") ? 0 : state.weekOffset;
      return toggleComplete(toggle.dataset.togglePlanComplete, weekOffset);
    }
    const edit = event.target.closest("[data-edit-plan]");
    if (edit) return editItem(edit.dataset.editPlan);
    const remove = event.target.closest("[data-delete-plan]");
    if (remove) return deleteItem(remove.dataset.deletePlan);
  }

  function bindDragAndDrop() {
    const board = $("#study-plan-week");
    if (!board) return;
    board.addEventListener("dragstart", (event) => {
      const item = event.target.closest("[data-plan-item]");
      if (!item) return;
      event.dataTransfer.setData("text/plain", item.dataset.planItem);
      event.dataTransfer.effectAllowed = "move";
      item.classList.add("is-dragging");
    });
    board.addEventListener("dragend", (event) => {
      event.target.closest("[data-plan-item]")?.classList.remove("is-dragging");
      board.querySelectorAll(".is-drop-target").forEach((day) => day.classList.remove("is-drop-target"));
    });
    board.addEventListener("dragover", (event) => {
      const day = event.target.closest("[data-plan-day]");
      if (!day) return;
      event.preventDefault();
      board.querySelectorAll(".is-drop-target").forEach((entry) => entry.classList.remove("is-drop-target"));
      day.classList.add("is-drop-target");
    });
    board.addEventListener("drop", (event) => {
      const day = event.target.closest("[data-plan-day]");
      if (!day) return;
      event.preventDefault();
      const id = event.dataTransfer.getData("text/plain");
      const item = state.data.items.find((entry) => entry.id === id);
      if (!item) return;
      item.day = Number(day.dataset.planDay);
      savePlan();
      setFeedback(`已移到${DAY_NAMES[item.day]}。`);
      render();
    });
  }

  function resetDamagedPlan() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* 繼續以空白資料運作 */ }
    state.data = { items: [], completed: {} };
    state.damaged = false;
    resetForm();
    render();
  }

  function init() {
    loadPlan();
    $("#study-plan-form")?.addEventListener("submit", handleSubmit);
    $("#plan-type")?.addEventListener("change", updateSubjectField);
    $("#cancel-plan-edit")?.addEventListener("click", resetForm);
    $("#reset-plan-data")?.addEventListener("click", resetDamagedPlan);
    $("#study-plan-week")?.addEventListener("click", handleClick);
    $("#home-plan-list")?.addEventListener("click", handleClick);
    $$("[data-apply-strategy]").forEach((button) => {
      button.addEventListener("click", () => applyStrategy(button.dataset.applyStrategy));
    });
    $("#auto-plan-button")?.addEventListener("click", () => applyStrategy(recommendedStrategy()));
    $("#next-plan-advice")?.addEventListener("click", rotateAdvice);
    $$("[data-plan-week]").forEach((button) => button.addEventListener("click", () => setWeekOffset(button.dataset.planWeek)));
    $("#print-study-plan")?.addEventListener("click", printPlan);
    $$("[data-print-plan]").forEach((button) => button.addEventListener("click", printPlan));
    bindDragAndDrop();
    resetForm();
    render();
  }

  window.ExamMateStudyPlan = { render, reset: resetDamagedPlan, applyStrategy, printPlan, setWeekOffset };
  document.addEventListener("DOMContentLoaded", init);
})();
