/*
 * ExamMate 數位錯題本
 * ------------------------------------------------------------------
 * 與題庫自動錯題分開，讓學生記錄課本、講義、考卷與模擬考錯題。
 * 第一階段使用 localStorage；照片會先在瀏覽器縮小，避免占用過多空間。
 */
(function () {
  "use strict";

  const STORAGE_KEY = "examMate.digitalWrongNotebook.v1";
  const SUBJECTS = {
    chinese: { name: "國文", glyph: "文", theme: "chinese" },
    english: { name: "英文", glyph: "A", theme: "english" },
    math: { name: "數學", glyph: "∑", theme: "math" },
    science: { name: "自然", glyph: "科", theme: "science" },
    social: { name: "社會", glyph: "地", theme: "social" }
  };
  const FALLBACK_UNITS = {
    chinese: ["字音", "字形", "成語", "國學常識", "修辭", "文意理解", "閱讀理解", "文言文", "白話文", "綜合測驗"],
    english: ["文法", "短文閱讀", "長文閱讀", "聽力"],
    math: ["數與量", "代數", "函數", "幾何", "統計與機率", "資料判讀"],
    science: ["生物", "理化", "地球科學", "科學探究", "圖表與實驗判讀"],
    social: ["歷史", "地理", "公民", "跨科資料判讀"]
  };
  const STATUS_LABELS = { new: "還不熟", reviewing: "複習中", mastered: "已掌握" };
  const REASON_TIPS = {
    觀念不清: "先回到單元重點，用自己的話重新說明觀念，再做 3 題同類題。",
    題意判讀: "練習圈出關鍵條件，先說出題目在問什麼，再開始作答。",
    計算失誤: "把計算步驟分行寫清楚，完成後用估算或代回檢查。",
    粗心漏看: "固定在題目中的否定詞、單位與範圍下方畫線。",
    時間不足: "使用限時小題組，練習先易後難與停損判斷。",
    猜題: "把不確定的兩個選項逐一找證據排除，不只記住答案。",
    其他: "重新寫下錯因，找出下次遇到同類題時可以執行的一個動作。"
  };
  const COACH_REASON_LABELS = {
    reading: "題意判讀",
    concept: "觀念不清",
    confusion: "觀念不清",
    process: "計算失誤",
    guess: "猜題"
  };
  const state = {
    items: [],
    editingId: null,
    imageData: "",
    damaged: false,
    activeTab: "bank",
    toastTimer: null
  };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(typeof document.querySelectorAll === "function" ? document.querySelectorAll(selector) : []);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(days, from = new Date()) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    date.setDate(date.getDate() + Number(days || 0));
    return todayKey(date);
  }

  function parseDateKey(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }

  function formatRocDate(value) {
    const date = typeof value === "string" ? parseDateKey(value) : value;
    if (!date || Number.isNaN(date.getTime())) return "尚未安排";
    return `民國 ${date.getFullYear() - 1911} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  }

  function validItem(item) {
    return Boolean(item && typeof item.id === "string" && SUBJECTS[item.subjectId] &&
      typeof item.unit === "string" && item.unit.trim() &&
      typeof item.source === "string" && typeof item.reason === "string" &&
      typeof item.question === "string" && item.question.trim() &&
      typeof item.myAnswer === "string" && typeof item.correctAnswer === "string" && item.correctAnswer.trim() &&
      typeof item.reflection === "string" && Object.prototype.hasOwnProperty.call(STATUS_LABELS, item.status) &&
      typeof item.createdAt === "string" && !Number.isNaN(Date.parse(item.createdAt)) &&
      typeof item.updatedAt === "string" && !Number.isNaN(Date.parse(item.updatedAt)) &&
      (item.nextReviewDate === "" || Boolean(parseDateKey(item.nextReviewDate))) &&
      Number.isInteger(item.reviewCount) && item.reviewCount >= 0 &&
      typeof item.imageData === "string" && (!item.imageData || /^data:image\//.test(item.imageData)));
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state.items = [];
        state.damaged = false;
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every(validItem)) throw new Error("資料格式不符");
      state.items = parsed;
      state.damaged = false;
    } catch (error) {
      state.items = [];
      state.damaged = true;
    }
  }

  function saveData(errorMessage = "瀏覽器目前無法儲存錯題，請先移除圖片或清理已不需要的錯題。") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      state.damaged = false;
      return true;
    } catch (error) {
      setFeedback(errorMessage, true);
      showToast(errorMessage, true);
      return false;
    }
  }

  function showToast(message, isError = false) {
    const toast = $("#toast");
    if (!toast) return;
    clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.style.background = isError ? "#a84f59" : "#20556a";
    toast.classList.add("show");
    state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function setFeedback(message, isError = false) {
    const feedback = $("#digital-form-feedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
  }

  function bankUnits(subjectId) {
    const subject = window.examMateQuestionBank?.[subjectId];
    if (!subject || !Array.isArray(subject.units)) return FALLBACK_UNITS[subjectId];
    const names = subject.units.map((unit) => typeof unit === "string" ? unit : unit?.name).filter(Boolean);
    return names.length ? [...new Set(names)] : FALLBACK_UNITS[subjectId];
  }

  function updateUnitOptions(selectedUnit = "") {
    const select = $("#digital-unit");
    const subjectId = $("#digital-subject")?.value || "chinese";
    if (!select) return;
    const units = [...bankUnits(subjectId)];
    if (selectedUnit && !units.includes(selectedUnit)) units.push(selectedUnit);
    if (!units.includes("其他單元")) units.push("其他單元");
    select.innerHTML = units.map((unit) => `<option value="${escapeHtml(unit)}">${escapeHtml(unit)}</option>`).join("");
    if (selectedUnit) select.value = selectedUnit;
  }

  function setImageData(dataUrl) {
    state.imageData = dataUrl || "";
    const input = $("#digital-image-data");
    const preview = $("#digital-image-preview");
    const placeholder = $("#digital-image-placeholder");
    const removeButton = $("#remove-digital-image");
    if (input) input.value = state.imageData;
    if (preview) {
      preview.hidden = !state.imageData;
      preview.src = state.imageData || "";
    }
    if (placeholder) placeholder.hidden = Boolean(state.imageData);
    if (removeButton) removeButton.hidden = !state.imageData;
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) return reject(new Error("請選擇圖片檔案。"));
      if (file.size > 12 * 1024 * 1024) return reject(new Error("圖片超過 12MB，請先裁切或選擇較小的照片。"));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("無法讀取這張圖片。"));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("圖片格式無法使用。"));
        image.onload = () => {
          const render = (maxDimension, quality) => {
            const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL("image/jpeg", quality);
          };
          let result = render(1100, 0.72);
          if (result.length > 450000) result = render(760, 0.56);
          resolve(result);
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleImageFile(file) {
    try {
      setFeedback("正在整理圖片…");
      const dataUrl = await compressImage(file);
      setImageData(dataUrl);
      setFeedback("圖片已加入；請繼續完成科目、單元與錯因。");
    } catch (error) {
      setFeedback(error.message || "圖片無法使用。", true);
    }
  }

  function showEntryForm(item = null) {
    const section = $("#digital-entry-section");
    const form = $("#digital-wrong-form");
    if (!section || !form) return;
    section.hidden = false;
    state.editingId = item?.id || null;
    form.reset();
    $("#digital-wrong-id").value = state.editingId || "";
    $("#digital-entry-title").textContent = item ? "修改這筆錯題紀錄" : "記下這一題為什麼會錯";
    $("#digital-submit-label").textContent = item ? "儲存修改" : "存入數位錯題本";
    $("#digital-question-error").textContent = "";
    $("#digital-answer-error").textContent = "";
    if (item) {
      $("#digital-subject").value = item.subjectId;
      updateUnitOptions(item.unit);
      $("#digital-source").value = item.source;
      $("#digital-reason").value = item.reason;
      $("#digital-question").value = item.question;
      $("#digital-my-answer").value = item.myAnswer;
      $("#digital-correct-answer").value = item.correctAnswer;
      $("#digital-reflection").value = item.reflection;
      $("#digital-status").value = item.status;
      setImageData(item.imageData);
    } else {
      $("#digital-subject").value = "chinese";
      updateUnitOptions();
      $("#digital-review-interval").value = "3";
      $("#digital-status").value = "new";
      setImageData("");
    }
    setFeedback("");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeEntryForm() {
    state.editingId = null;
    setImageData("");
    if ($("#digital-entry-section")) $("#digital-entry-section").hidden = true;
    setFeedback("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const question = String(formData.get("question") || "").trim();
    const correctAnswer = String(formData.get("correctAnswer") || "").trim();
    $("#digital-question-error").textContent = question ? "" : "請寫下題目重點，方便之後辨認。";
    $("#digital-answer-error").textContent = correctAnswer ? "" : "請寫下正確答案或正確觀念。";
    if (!question || !correctAnswer) {
      (question ? $("#digital-correct-answer") : $("#digital-question"))?.focus();
      setFeedback("請先完成兩個必要欄位。", true);
      return;
    }
    const existing = state.items.find((item) => item.id === state.editingId);
    const now = new Date().toISOString();
    const status = String(formData.get("status") || "new");
    const item = {
      id: existing?.id || `digital-wrong-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      subjectId: String(formData.get("subjectId") || "chinese"),
      unit: String(formData.get("unit") || "其他單元"),
      source: String(formData.get("source") || "").trim(),
      reason: String(formData.get("reason") || "其他"),
      question,
      myAnswer: String(formData.get("myAnswer") || "").trim(),
      correctAnswer,
      reflection: String(formData.get("reflection") || "").trim(),
      status,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      nextReviewDate: status === "mastered" ? "" : addDays(Number(formData.get("reviewInterval") || 3)),
      reviewCount: existing?.reviewCount || 0,
      imageData: state.imageData
    };
    if (!validItem(item)) {
      setFeedback("這筆資料還有格式問題，請重新檢查科目與單元。", true);
      return;
    }
    const previousItems = [...state.items];
    if (existing) state.items = state.items.map((entry) => entry.id === existing.id ? item : entry);
    else state.items.unshift(item);
    if (!saveData()) {
      state.items = previousItems;
      return;
    }
    closeEntryForm();
    render();
    showToast(existing ? "錯題紀錄已更新。" : "已存入數位錯題本，系統開始更新弱點分析。");
  }

  function isDue(item) {
    return item.status !== "mastered" && Boolean(item.nextReviewDate) && item.nextReviewDate <= todayKey();
  }

  function activeItems() {
    return state.items.filter((item) => item.status !== "mastered");
  }

  function scoreItem(item) {
    return 1 + (item.status === "new" ? 0.5 : 0) + (isDue(item) ? 1 : 0) + (item.reason === "觀念不清" ? 0.5 : 0);
  }

  function groupScores(items, keyGetter) {
    const groups = new Map();
    items.forEach((item) => {
      const key = keyGetter(item);
      const current = groups.get(key) || { key, count: 0, score: 0, reasons: {} };
      current.count += 1;
      current.score += scoreItem(item);
      current.reasons[item.reason] = (current.reasons[item.reason] || 0) + 1;
      groups.set(key, current);
    });
    return [...groups.values()].sort((a, b) => b.score - a.score || b.count - a.count || a.key.localeCompare(b.key, "zh-Hant"));
  }

  function strongestReason(group) {
    return Object.entries(group.reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || "其他";
  }

  function renderBars(hostSelector, groups, labelGetter) {
    const host = $(hostSelector);
    if (!host) return;
    if (!groups.length) {
      host.innerHTML = `<div class="analysis-empty">記錄錯題後，這裡會自動出現分析。</div>`;
      return;
    }
    const max = Math.max(...groups.map((group) => group.count), 1);
    host.innerHTML = groups.map((group) => `<div class="analysis-bar-row">
      <div><span>${escapeHtml(labelGetter(group))}</span><strong>${group.count} 題</strong></div>
      <div class="analysis-bar-track"><span style="width:${Math.round(group.count / max * 100)}%"></span></div>
    </div>`).join("");
  }

  function renderAnalysis() {
    const active = activeItems();
    const due = active.filter(isDue);
    const mastered = state.items.filter((item) => item.status === "mastered");
    if ($("#digital-total-count")) $("#digital-total-count").textContent = String(state.items.length);
    if ($("#digital-due-count")) $("#digital-due-count").textContent = String(due.length);
    if ($("#digital-active-count")) $("#digital-active-count").textContent = String(active.length);
    if ($("#digital-mastered-count")) $("#digital-mastered-count").textContent = String(mastered.length);

    const subjectGroups = groupScores(active, (item) => item.subjectId);
    renderBars("#digital-subject-analysis", subjectGroups, (group) => SUBJECTS[group.key]?.name || group.key);
    const reasonGroups = groupScores(active, (item) => item.reason);
    renderBars("#digital-reason-analysis", reasonGroups, (group) => group.key);

    const units = groupScores(active, (item) => `${item.subjectId}|||${item.unit}`).slice(0, 3);
    const host = $("#digital-unit-priority");
    if (host) {
      host.innerHTML = units.length ? units.map((group, index) => {
        const [subjectId, unit] = group.key.split("|||");
        const reason = strongestReason(group);
        return `<article>
          <span class="priority-rank">${index + 1}</span>
          <div><strong>${escapeHtml(SUBJECTS[subjectId].name)}・${escapeHtml(unit)}</strong><p>${escapeHtml(REASON_TIPS[reason])}</p></div>
          <small>${group.count} 題</small>
        </article>`;
      }).join("") : `<div class="analysis-empty">尚無需要排序的單元。</div>`;
    }

    const summary = $("#digital-analysis-summary");
    if (!summary) return;
    if (!state.items.length) {
      summary.textContent = "先記下第一題，系統就能開始整理需要加強的科目與單元。";
    } else if (!active.length) {
      summary.textContent = `目前 ${state.items.length} 題都已掌握；之後可偶爾抽查，確認觀念仍然穩定。`;
    } else {
      const [subjectId, unit] = units[0]?.key.split("|||") || [subjectGroups[0]?.key, ""];
      summary.textContent = `目前最值得優先處理的是${SUBJECTS[subjectId]?.name || ""}${unit ? `「${unit}」` : ""}；先複習到期錯題，再補做 3～5 題同類題。`;
    }
  }

  function filteredItems() {
    const subject = $("#digital-filter-subject")?.value || "all";
    const status = $("#digital-filter-status")?.value || "active";
    const reason = $("#digital-filter-reason")?.value || "all";
    const search = ($("#digital-filter-search")?.value || "").trim().toLocaleLowerCase("zh-Hant");
    return state.items.filter((item) => {
      if (subject !== "all" && item.subjectId !== subject) return false;
      if (status === "active" && item.status === "mastered") return false;
      if (status === "due" && !isDue(item)) return false;
      if (status === "mastered" && item.status !== "mastered") return false;
      if (reason !== "all" && item.reason !== reason) return false;
      if (search) {
        const haystack = `${item.question} ${item.source} ${item.unit} ${item.correctAnswer} ${item.reflection}`.toLocaleLowerCase("zh-Hant");
        if (!haystack.includes(search)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (isDue(a) !== isDue(b)) return isDue(a) ? -1 : 1;
      if (a.status !== b.status) return a.status === "mastered" ? 1 : -1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }

  function renderLibrary() {
    const host = $("#digital-wrong-list");
    if (!host) return;
    const items = filteredItems();
    if ($("#digital-filter-summary")) $("#digital-filter-summary").textContent = `目前顯示 ${items.length}／${state.items.length} 題`;
    if (!items.length) {
      host.innerHTML = `<div class="empty-state"><span class="empty-state-icon" aria-hidden="true">簿</span><h2>這個分類目前沒有錯題</h2><p>可以調整篩選條件，或加入課本、講義與考卷上的第一題錯題。</p><button class="button button-primary" type="button" data-open-digital-entry>新增錯題</button></div>`;
      return;
    }
    host.innerHTML = items.map((item) => {
      const subject = SUBJECTS[item.subjectId];
      const due = isDue(item);
      return `<article class="digital-wrong-card ${item.status === "mastered" ? "is-mastered" : ""}" data-subject-theme="${subject.theme}" data-digital-card="${escapeHtml(item.id)}">
        <div class="digital-card-top">
          <div class="subject-identity"><span class="subject-glyph" aria-hidden="true">${subject.glyph}</span><div><strong>${subject.name}・${escapeHtml(item.unit)}</strong><small>${escapeHtml(item.source || "自主記錄")}・${formatRocDate(new Date(item.createdAt))}</small></div></div>
          <div class="digital-card-badges"><span class="status-badge ${due ? "is-due" : ""}">${due ? "今天要複習" : STATUS_LABELS[item.status]}</span><span class="status-badge">${escapeHtml(item.reason)}</span></div>
        </div>
        <div class="digital-card-content">
          ${item.imageData ? `<button class="digital-question-image" type="button" data-toggle-digital-image="${escapeHtml(item.id)}" aria-label="放大或縮小錯題圖片"><img src="${item.imageData}" alt="${escapeHtml(subject.name)}錯題圖片"></button>` : ""}
          <div class="digital-card-copy">
            <h3>${escapeHtml(item.question)}</h3>
            ${item.myAnswer ? `<p class="digital-my-answer"><strong>我的答案：</strong>${escapeHtml(item.myAnswer)}</p>` : ""}
            <p class="digital-correct-answer"><strong>正確觀念：</strong>${escapeHtml(item.correctAnswer)}</p>
            ${item.reflection ? `<p class="digital-reflection"><strong>下次提醒：</strong>${escapeHtml(item.reflection)}</p>` : ""}
            <div class="digital-review-meta"><span>已複習 ${item.reviewCount} 次</span><span>${item.status === "mastered" ? "已完成這一輪" : `下次：${formatRocDate(item.nextReviewDate)}`}</span></div>
          </div>
        </div>
        <div class="digital-card-actions">
          <button class="button button-coach button-small" type="button" data-coach-digital="${escapeHtml(item.id)}"><span aria-hidden="true">問</span>交給 AI 教練</button>
          <button class="text-button" type="button" data-edit-digital="${escapeHtml(item.id)}">修改</button>
          <button class="text-button text-button-danger" type="button" data-delete-digital="${escapeHtml(item.id)}">刪除</button>
          ${item.status === "mastered"
            ? `<button class="button button-secondary button-small" type="button" data-reopen-digital="${escapeHtml(item.id)}">重新加入複習</button>`
            : `<button class="button button-secondary button-small" type="button" data-reviewed-digital="${escapeHtml(item.id)}">今天已複習</button><button class="button button-primary button-small" type="button" data-master-digital="${escapeHtml(item.id)}">標記已掌握</button>`}
        </div>
      </article>`;
    }).join("");
  }

  function updateBadge() {
    const badge = $("#wrong-count-badge");
    if (!badge || state.activeTab !== "digital") return;
    badge.textContent = `${activeItems().length} 題待加強`;
  }

  function render() {
    loadData();
    if ($("#digital-wrong-alert")) $("#digital-wrong-alert").hidden = !state.damaged;
    renderAnalysis();
    renderLibrary();
    updateBadge();
  }

  function switchTab(tabName) {
    state.activeTab = tabName === "digital" ? "digital" : "bank";
    const digital = state.activeTab === "digital";
    $("#bank-wrong-panel").hidden = digital;
    $("#digital-wrong-panel").hidden = !digital;
    $("#bank-wrong-tab").classList.toggle("is-active", !digital);
    $("#digital-wrong-tab").classList.toggle("is-active", digital);
    $("#bank-wrong-tab").setAttribute("aria-selected", String(!digital));
    $("#digital-wrong-tab").setAttribute("aria-selected", String(digital));
    if (digital) render();
    else window.ExamMateLearning?.renderWrongQuestions?.();
  }

  function findItem(id) {
    return state.items.find((item) => item.id === id);
  }

  function deleteItem(id) {
    const item = findItem(id);
    if (!item || !window.confirm(`要刪除「${item.question.slice(0, 24)}${item.question.length > 24 ? "…" : ""}」嗎？`)) return;
    state.items = state.items.filter((entry) => entry.id !== id);
    if (!saveData()) return;
    render();
    showToast("這筆錯題紀錄已刪除。");
  }

  function reviewItem(id) {
    const item = findItem(id);
    if (!item) return;
    item.reviewCount += 1;
    item.status = "reviewing";
    item.updatedAt = new Date().toISOString();
    item.nextReviewDate = addDays(item.reviewCount >= 3 ? 7 : 3);
    if (!saveData()) return;
    render();
    showToast("已記錄今天的複習，下次複習日期也排好了。");
  }

  function masterItem(id) {
    const item = findItem(id);
    if (!item) return;
    item.status = "mastered";
    item.reviewCount += 1;
    item.updatedAt = new Date().toISOString();
    item.nextReviewDate = "";
    if (!saveData()) return;
    render();
    showToast("已標記為掌握，紀錄會保留在錯題本中。");
  }

  function reopenItem(id) {
    const item = findItem(id);
    if (!item) return;
    item.status = "reviewing";
    item.updatedAt = new Date().toISOString();
    item.nextReviewDate = addDays(3);
    if (!saveData()) return;
    render();
    showToast("已重新加入複習清單。");
  }

  // AI 教練完成分析後，學生可以自行決定是否把結果收藏成錯題。
  // 這裡只接收整理後的資料，不會直接把照片送往任何 AI 服務。
  function saveFromCoach(payload) {
    if (!payload || !SUBJECTS[payload.subjectId]) return null;
    const question = String(payload.question || "").trim();
    const correctAnswer = String(payload.correctAnswer || payload.explanation || "").trim();
    if (!question || !correctAnswer) return null;
    loadData();
    const coachQuestionId = String(payload.coachQuestionId || "");
    const existing = coachQuestionId ? state.items.find((item) => item.coachQuestionId === coachQuestionId) : null;
    if (existing) return existing.id;
    const now = new Date().toISOString();
    const item = {
      id: `digital-wrong-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      subjectId: payload.subjectId,
      unit: String(payload.unit || "其他單元").trim() || "其他單元",
      source: String(payload.source || "AI 錯題分析").trim() || "AI 錯題分析",
      reason: COACH_REASON_LABELS[payload.reason] || String(payload.reasonLabel || "觀念不清"),
      question,
      myAnswer: String(payload.myAnswer || ""),
      correctAnswer,
      reflection: String(payload.reflection || "先找限制，再用證據；完成判斷後回題檢查。"),
      status: "reviewing",
      createdAt: now,
      updatedAt: now,
      nextReviewDate: addDays(3),
      reviewCount: 0,
      imageData: /^data:image\//.test(String(payload.imageData || "")) ? String(payload.imageData) : "",
      coachQuestionId,
      aiAnalyzed: true
    };
    state.items.unshift(item);
    if (!saveData("瀏覽器空間不足，這題尚未存入錯題本；請先備份並移除不需要的圖片。")) {
      state.items.shift();
      return null;
    }
    render();
    showToast("AI 分析已存入數位錯題本，3 天後會提醒複習。");
    return item.id;
  }

  function handleLibraryClick(event) {
    if (event.target.closest("[data-open-coach-photo]")) return window.ExamMateAICoach?.openPhoto?.();
    if (event.target.closest("[data-open-digital-entry]")) return showEntryForm();
    const coach = event.target.closest("[data-coach-digital]");
    if (coach) return window.ExamMateAICoach?.openDigital?.(coach.dataset.coachDigital);
    const edit = event.target.closest("[data-edit-digital]");
    if (edit) return showEntryForm(findItem(edit.dataset.editDigital));
    const remove = event.target.closest("[data-delete-digital]");
    if (remove) return deleteItem(remove.dataset.deleteDigital);
    const reviewed = event.target.closest("[data-reviewed-digital]");
    if (reviewed) return reviewItem(reviewed.dataset.reviewedDigital);
    const master = event.target.closest("[data-master-digital]");
    if (master) return masterItem(master.dataset.masterDigital);
    const reopen = event.target.closest("[data-reopen-digital]");
    if (reopen) return reopenItem(reopen.dataset.reopenDigital);
    const image = event.target.closest("[data-toggle-digital-image]");
    if (image) image.closest(".digital-wrong-card")?.classList.toggle("is-image-expanded");
  }

  function resetDamagedData() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* 仍可用空白資料繼續 */ }
    state.items = [];
    state.damaged = false;
    closeEntryForm();
    render();
  }

  function bindEvents() {
    $$("[data-wrong-tab]").forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.wrongTab)));
    $("[data-open-coach-photo]")?.addEventListener("click", () => window.ExamMateAICoach?.openPhoto?.());
    $("#open-digital-entry")?.addEventListener("click", () => showEntryForm());
    $("#close-digital-entry")?.addEventListener("click", closeEntryForm);
    $("#cancel-digital-edit")?.addEventListener("click", closeEntryForm);
    $("#digital-wrong-form")?.addEventListener("submit", handleSubmit);
    $("#digital-subject")?.addEventListener("change", () => updateUnitOptions());
    $("#digital-image-file")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (file) handleImageFile(file);
      event.target.value = "";
    });
    $("#digital-paste-zone")?.addEventListener("click", () => $("#digital-image-file")?.click());
    $("#digital-paste-zone")?.addEventListener("paste", (event) => {
      const file = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith("image/"))?.getAsFile();
      if (!file) return setFeedback("剪貼簿中沒有圖片；也可以按「拍照／選圖」。", true);
      event.preventDefault();
      handleImageFile(file);
    });
    $("#remove-digital-image")?.addEventListener("click", () => setImageData(""));
    $("#reset-digital-wrong")?.addEventListener("click", resetDamagedData);
    $("#digital-wrong-list")?.addEventListener("click", handleLibraryClick);
    ["#digital-filter-subject", "#digital-filter-status", "#digital-filter-reason"].forEach((selector) => {
      $(selector)?.addEventListener("change", renderLibrary);
    });
    $("#digital-filter-search")?.addEventListener("input", renderLibrary);
  }

  function init() {
    loadData();
    updateUnitOptions();
    bindEvents();
    render();
  }

  window.ExamMateDigitalNotebook = {
    render,
    switchTab,
    reset: resetDamagedData,
    getItem: (id) => findItem(id),
    getItems: () => [...state.items],
    saveFromCoach
  };
  document.addEventListener("DOMContentLoaded", init);
})();
