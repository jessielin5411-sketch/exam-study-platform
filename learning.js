/*
 * ExamMate 五科共同學習原型
 * ---------------------------------------------------------------
 * 五科資料放在 SUBJECTS，畫面與操作則只寫一套。
 * 第一版只使用 localStorage，紀錄今日完成科目與錯題。
 */
(function () {
  "use strict";

  const PROFILE_KEY = "examJourney.profile.v1";
  const LEARNING_KEY = "examMate.learning.v1";
  const WRONG_KEY = "examMate.wrongQuestions.v1";
  const REVIEW_KEY = "examMate.unitReviews.v1";
  const AI_PRACTICE_KEY = "examMate.aiPracticeQuestions.v1";
  const DAILY_SUBJECTS = ["chinese", "english", "math", "science", "social"];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  // 舊版小型題庫作為備援；正式內容集中在 question-bank.js。
  const LEGACY_SUBJECTS = {
    chinese: {
      id: "chinese", name: "國文", glyph: "文", theme: "chinese",
      description: "閱讀、語文與文字理解",
      units: ["閱讀理解", "詞語成語", "字音字形"],
      questions: [
        {
          id: "ch-reading-01", unit: "閱讀理解",
          context: "放學後，小安沒有立刻打開遊戲，而是先完成明天要交的報告。他說：『先把重要的事做好，休息時才更安心。』",
          prompt: "這段文字最主要想表達什麼？",
          options: ["休息比學習更重要", "應先完成重要的事情", "玩遊戲可以提升效率", "報告應該等到明天再做"],
          answer: 1,
          explanation: "小安先完成報告再休息，重點是把重要且有期限的事情先處理好。"
        },
        {
          id: "ch-idiom-01", unit: "詞語成語",
          prompt: "小晴準備充分，面對上台報告顯得十分＿＿＿。空格中最適合填入哪一個成語？",
          options: ["手忙腳亂", "胸有成竹", "一知半解", "望梅止渴"],
          answer: 1,
          explanation: "「胸有成竹」比喻做事前已有完整的計畫與把握，符合「準備充分」的情境。"
        },
        {
          id: "ch-sound-01", unit: "字音字形",
          prompt: "下列哪一個詞語中的「省」讀音與其他三者不同？",
          options: ["反省", "省思", "省悟", "省分"],
          answer: 3,
          explanation: "「反省、省思、省悟」的「省」讀作ㄒㄧㄥˇ；「省分」的「省」讀作ㄕㄥˇ。"
        }
      ]
    },
    english: {
      id: "english", name: "英文", glyph: "A", theme: "english",
      description: "單字、文法與閱讀理解",
      units: ["核心單字", "基礎文法", "短文閱讀"],
      questions: [
        {
          id: "en-vocab-01", unit: "核心單字",
          prompt: "Amy was tired, so she decided to take a short ____ before studying.",
          options: ["rest", "race", "rule", "road"],
          answer: 0,
          explanation: "take a rest 是「休息一下」；句意為 Amy 累了，所以讀書前決定短暫休息。"
        },
        {
          id: "en-grammar-01", unit: "基礎文法",
          prompt: "Kevin ____ basketball every Saturday.",
          options: ["play", "plays", "played", "playing"],
          answer: 1,
          explanation: "every Saturday 表示規律習慣，使用現在簡單式；主詞 Kevin 為第三人稱單數，所以用 plays。"
        },
        {
          id: "en-reading-01", unit: "短文閱讀",
          context: "The library closes at 6 p.m. on weekdays, but it stays open until 8 p.m. on Friday.",
          prompt: "When does the library close on Friday?",
          options: ["At 5 p.m.", "At 6 p.m.", "At 7 p.m.", "At 8 p.m."],
          answer: 3,
          explanation: "文章明確說明 Friday 會開放到 8 p.m.，所以答案是 At 8 p.m.。"
        }
      ]
    },
    math: {
      id: "math", name: "數學", glyph: "∑", theme: "math",
      description: "計算、推理與生活應用",
      units: ["數與量", "代數", "幾何"],
      questions: [
        {
          id: "ma-number-01", unit: "數與量",
          prompt: "某班有 30 位學生，其中 18 位完成今日任務。完成率是多少？",
          options: ["40%", "50%", "60%", "80%"],
          answer: 2,
          explanation: "完成率＝18 ÷ 30＝0.6＝60%。"
        },
        {
          id: "ma-algebra-01", unit: "代數",
          prompt: "若 3x＋5＝20，則 x 的值是多少？",
          options: ["3", "5", "8", "15"],
          answer: 1,
          explanation: "等式兩邊先減 5，得 3x＝15；再除以 3，得到 x＝5。"
        },
        {
          id: "ma-geometry-01", unit: "幾何",
          prompt: "一個長方形的長為 8 公分、寬為 5 公分，它的面積是多少平方公分？",
          options: ["13", "26", "40", "80"],
          answer: 2,
          explanation: "長方形面積＝長×寬＝8×5＝40 平方公分。"
        }
      ]
    },
    science: {
      id: "science", name: "自然", glyph: "科", theme: "science",
      description: "生物、理化與科學探究",
      units: ["生物", "理化", "地球科學"],
      questions: [
        {
          id: "sc-bio-01", unit: "生物",
          prompt: "植物進行光合作用時，主要吸收哪一種氣體？",
          options: ["氧氣", "二氧化碳", "氮氣", "氫氣"],
          answer: 1,
          explanation: "植物利用光能，將二氧化碳和水轉換成養分，並釋放氧氣。"
        },
        {
          id: "sc-physics-01", unit: "理化",
          prompt: "聲音無法在哪一種環境中傳播？",
          options: ["空氣", "水中", "鋼鐵", "真空"],
          answer: 3,
          explanation: "聲音需要介質傳播；真空中沒有可傳遞振動的粒子。"
        },
        {
          id: "sc-earth-01", unit: "地球科學",
          prompt: "造成白天與黑夜交替的主要原因是什麼？",
          options: ["地球自轉", "地球公轉", "月球公轉", "太陽自轉"],
          answer: 0,
          explanation: "地球約每 24 小時自轉一周，使不同地區輪流面向或背向太陽。"
        }
      ]
    },
    social: {
      id: "social", name: "社會", glyph: "地", theme: "social",
      description: "歷史、地理與公民素養",
      units: ["歷史", "地理", "公民"],
      questions: [
        {
          id: "so-history-01", unit: "歷史",
          prompt: "研究歷史事件時，為了降低單一資料造成的偏誤，最適合採取哪一種方法？",
          options: ["只看一篇文章", "比較多種史料", "只記住事件年份", "依照個人想像判斷"],
          answer: 1,
          explanation: "比較不同來源、不同立場的史料，有助於交叉檢證並形成較完整的理解。"
        },
        {
          id: "so-geo-01", unit: "地理",
          prompt: "地圖比例尺為 1：100,000，圖上 1 公分代表實際距離多少公里？",
          options: ["0.1 公里", "1 公里", "10 公里", "100 公里"],
          answer: 1,
          explanation: "100,000 公分＝1,000 公尺＝1 公里，因此圖上 1 公分代表實際 1 公里。"
        },
        {
          id: "so-civics-01", unit: "公民",
          prompt: "班級討論共同規範時，哪一種做法最符合民主精神？",
          options: ["由一人直接決定", "多數人不必聽少數意見", "充分討論後共同決定", "有意見的人退出討論"],
          answer: 2,
          explanation: "民主不只看表決結果，也重視資訊、討論、表達與尊重不同意見的過程。"
        }
      ]
    }
  };

  const SUBJECTS = window.examMateQuestionBank || LEGACY_SUBJECTS;
  const UNIT_REVIEWS = window.examMateUnitReviews || {};

  const state = {
    currentView: "dashboard",
    currentSubjectId: "chinese",
    currentUnitId: null,
    progress: { date: todayKey(), completedSubjects: [] },
    reviewedUnits: [],
    wrongQuestions: [],
    aiPracticeQuestions: [],
    practice: null,
    toastTimer: null
  };

  function todayKey() {
    const now = new Date();
    return `${now.getFullYear() - 1911}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function readJson(key, fallback, validator) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return validator(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      notify("瀏覽器無法儲存學習紀錄，請確認未使用無痕模式。", true);
      return false;
    }
  }

  function hasProfile() {
    return Boolean(readJson(PROFILE_KEY, null, (value) => value && typeof value.studentName === "string"));
  }

  function validProgress(value) {
    return Boolean(value && typeof value.date === "string" && Array.isArray(value.completedSubjects));
  }

  function validWrongQuestions(value) {
    return Array.isArray(value) && value.every((item) => item && typeof item.questionId === "string" && SUBJECTS[item.subjectId]);
  }

  function validReviewedUnits(value) {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
  }

  function validAiPracticeQuestion(item) {
    return Boolean(item && DAILY_SUBJECTS.includes(item.subjectId) && typeof item.id === "string" &&
      typeof item.unit === "string" && typeof item.prompt === "string" && item.prompt.trim() &&
      Array.isArray(item.options) && item.options.length === 4 && item.options.every((option) => typeof option === "string") &&
      Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 4 &&
      typeof item.explanation === "string" && item.explanation.trim() && typeof item.createdAt === "string");
  }

  function loadLearningState() {
    state.progress = readJson(LEARNING_KEY, { date: todayKey(), completedSubjects: [] }, validProgress);
    if (state.progress.date !== todayKey()) {
      state.progress = { date: todayKey(), completedSubjects: [] };
      writeJson(LEARNING_KEY, state.progress);
    }
    state.progress.completedSubjects = state.progress.completedSubjects.filter((id) => DAILY_SUBJECTS.includes(id));
    state.reviewedUnits = readJson(REVIEW_KEY, [], validReviewedUnits).filter((unitId) => Boolean(UNIT_REVIEWS[unitId]));
    state.wrongQuestions = readJson(WRONG_KEY, [], validWrongQuestions);
    state.aiPracticeQuestions = readJson(AI_PRACTICE_KEY, [], (value) => Array.isArray(value) && value.every(validAiPracticeQuestion));
    const existingWrongQuestions = state.wrongQuestions.filter((item) => findQuestion(item.subjectId, item.questionId));
    if (existingWrongQuestions.length !== state.wrongQuestions.length) {
      state.wrongQuestions = existingWrongQuestions;
      writeJson(WRONG_KEY, state.wrongQuestions);
    }
  }

  function enableLearningApp() {
    const ready = hasProfile();
    document.body.classList.toggle("learning-ready", ready);
    $("#bottom-navigation").hidden = !ready;
    if (ready) loadLearningState();
  }

  function notify(message, isError) {
    const toast = $("#toast");
    if (!toast) return;
    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.style.background = isError ? "#a84f59" : "#365759";
    toast.classList.add("show");
    state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  // 將題目的表格、長條圖、流程與時間軸轉成可閱讀的 HTML。
  // 圖像資料都放在題庫中，未來新增題目時不必修改畫面程式。
  function renderQuestionVisual(visual) {
    if (!visual || typeof visual !== "object") return "";
    const title = visual.title ? `<figcaption>${escapeHtml(visual.title)}</figcaption>` : "";

    if (visual.type === "table") {
      const columns = Array.isArray(visual.columns) ? visual.columns : [];
      const rows = Array.isArray(visual.rows) ? visual.rows : [];
      return `<figure class="question-visual question-table-visual">${title}<div class="question-table-scroll"><table><thead><tr>${columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, index) => `<${index === 0 ? "th scope=\"row\"" : "td"}>${escapeHtml(cell)}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("")}</tbody></table></div></figure>`;
    }

    if (visual.type === "bar") {
      const items = Array.isArray(visual.items) ? visual.items : [];
      const max = Math.max(1, ...items.map((item) => Number(item.value) || 0));
      return `<figure class="question-visual question-bar-visual">${title}<div class="question-bars">${items.map((item) => `<div class="question-bar-row"><span>${escapeHtml(item.label)}</span><div class="question-bar-track"><i style="width:${Math.max(4, (Number(item.value) || 0) / max * 100)}%"></i></div><strong>${escapeHtml(item.display ?? item.value)}</strong></div>`).join("")}</div></figure>`;
    }

    if (visual.type === "timeline") {
      const items = Array.isArray(visual.items) ? visual.items : [];
      return `<figure class="question-visual question-timeline-visual">${title}<ol>${items.map((item) => `<li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.detail)}</span></li>`).join("")}</ol></figure>`;
    }

    if (visual.type === "flow") {
      const steps = Array.isArray(visual.steps) ? visual.steps : [];
      return `<figure class="question-visual question-flow-visual">${title}<div>${steps.map((step, index) => `<span>${escapeHtml(step)}</span>${index < steps.length - 1 ? `<b aria-hidden="true">→</b>` : ""}`).join("")}</div></figure>`;
    }

    if (visual.type === "cards") {
      const items = Array.isArray(visual.items) ? visual.items : [];
      return `<figure class="question-visual question-card-visual">${title}<div>${items.map((item) => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong>${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}</article>`).join("")}</div></figure>`;
    }

    return "";
  }

  function setActiveNavigation(viewName) {
    $$('[data-app-view]').forEach((button) => {
      const active = button.dataset.appView === viewName;
      button.classList.toggle("is-active", active);
      if (button.classList.contains("nav-item") || button.classList.contains("bottom-nav-item")) {
        button.setAttribute("aria-current", active ? "page" : "false");
      }
    });
  }

  function goToView(viewName) {
    if (!hasProfile()) return;
    // 「AI 教練」已併入錯題整合中心；保留 coach 別名，讓既有錯題按鈕仍可正常帶學生進入同一頁。
    // 單元重點講義先保留資料，這一版不在學生流程中呈現；舊按鈕若仍存在，安全帶回科目頁。
    const targetView = viewName === "coach" ? "wrong" : viewName === "unit-review" ? "subject" : viewName;
    ["dashboard-view", "plan-view", "subjects-view", "subject-view", "unit-review-view", "practice-view", "wrong-view", "wrong-library-view"].forEach((id) => {
      const view = $("#" + id);
      if (view) view.hidden = true;
    });
    $("#setup-view").hidden = true;

    if (targetView === "dashboard") {
      $("#dashboard-view").hidden = false;
      window.ExamMateWeeklyPlanReminder?.check();
    }
    if (targetView === "plan") {
      $("#plan-view").hidden = false;
      window.ExamMateStudyPlan?.render();
    }
    if (targetView === "subjects") {
      $("#subjects-view").hidden = false;
      renderLearningOverview();
    }
    if (targetView === "subject") {
      $("#subject-view").hidden = false;
      renderSubjectPage(state.currentSubjectId);
    }
    if (targetView === "practice") $("#practice-view").hidden = false;
    if (targetView === "wrong") {
      $("#wrong-view").hidden = false;
      renderWrongQuestions();
      window.ExamMateDigitalNotebook?.render();
      window.ExamMateAICoach?.render();
    }

    state.currentView = targetView;
    setActiveNavigation(targetView === "subject" || targetView === "practice" ? "subjects" : targetView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderLearningOverview() {
    loadLearningState();
    const completedCount = state.progress.completedSubjects.length;
    $("#daily-completed-count").textContent = String(completedCount);
    $("#daily-progress-bar").style.width = `${Math.round(completedCount / DAILY_SUBJECTS.length * 100)}%`;
    $("#daily-progress-bar").parentElement.setAttribute("aria-valuenow", String(completedCount));

    $("#daily-task-grid").innerHTML = DAILY_SUBJECTS.map((id) => {
      const subject = SUBJECTS[id];
      const completed = state.progress.completedSubjects.includes(id);
      return `<article class="task-card ${completed ? "is-completed" : ""}" data-subject-theme="${subject.theme}">
        <div class="task-card-head">
          <div class="subject-identity"><span class="subject-glyph" aria-hidden="true">${subject.glyph}</span><strong>${subject.name}</strong></div>
          <span class="task-status">${completed ? "今日完成" : "未開始"}</span>
        </div>
        <h3>${completed ? "今天已完成，做得很好！" : `${subject.name} 10 分鐘`}</h3>
        <p>${completed ? "明天會自動產生新的今日任務。" : `完成 3 題${subject.description}練習，作答後立即看解析。`}</p>
        <div class="progress-bar" role="progressbar" aria-label="${subject.name}今日任務進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${completed ? 100 : 0}"><span style="width:${completed ? 100 : 0}%"></span></div>
        <button class="button ${completed ? "button-secondary" : "button-primary"}" type="button" data-open-subject="${id}">${completed ? "再次練習" : "開始任務"}</button>
      </article>`;
    }).join("");

    $("#subject-card-grid").innerHTML = Object.values(SUBJECTS).map((subject) => {
      return `<button class="subject-card" type="button" data-subject-theme="${subject.theme}" data-open-subject="${subject.id}">
        <span class="subject-glyph" aria-hidden="true">${subject.glyph}</span>
        <h3>${subject.name}</h3>
        <p>${subject.description}<br>${subject.units.length} 個單元・${subject.questions.length} 題原創題庫</p>
        <span class="subject-card-arrow" aria-hidden="true">→</span>
      </button>`;
    }).join("");
  }

  function openSubject(subjectId) {
    if (!SUBJECTS[subjectId]) return;
    state.currentSubjectId = subjectId;
    goToView("subject");
  }

  function renderSubjectPage(subjectId) {
    const subject = SUBJECTS[subjectId];
    const aiQuestions = state.aiPracticeQuestions.filter((question) => question.subjectId === subjectId);
    const isDaily = true;
    const completed = state.progress.completedSubjects.includes(subjectId);
    $("#subject-page-content").innerHTML = `
      <section class="subject-hero" data-subject-theme="${subject.theme}">
        <span class="subject-glyph" aria-hidden="true">${subject.glyph}</span>
        <div><p class="section-label">DAILY SUBJECT</p><h1 id="subject-page-title">${subject.name}</h1><p>${subject.description}，用實戰題找出弱點，再讓 AI 帶你練到懂。</p></div>
        <div class="subject-summary"><span>今日狀態</span><strong>${completed ? "已完成" : "待完成"}</strong></div>
      </section>
      <div class="subject-action-grid">
        <article class="subject-task-card" data-subject-theme="${subject.theme}">
          <span class="subject-glyph" aria-hidden="true">${completed ? "✓" : subject.glyph}</span>
          <div><h2>${subject.name}今日任務</h2><p>每日精選 3 題・完成後更新今日紀錄</p></div>
          <div><span class="time-chip">◷ 約 10 分鐘</span><button class="button button-primary" type="button" data-start-mixed="${subjectId}">${completed ? "再練一次" : "開始練習"}</button></div>
        </article>
        <article class="subject-task-card subject-ai-card ${aiQuestions.length ? "has-questions" : ""}" data-subject-theme="${subject.theme}">
          <span class="subject-glyph" aria-hidden="true">AI</span>
          <div><h2>AI 同觀念加強題本</h2><p>${aiQuestions.length ? `依你的錯題建立 ${aiQuestions.length} 題個人化練習；答錯後可持續增加新題。` : "先從錯題整合建立同觀念題，之後會在這裡持續練習。"}</p></div>
          <div><span class="time-chip">${aiQuestions.length ? `目前 ${aiQuestions.length} 題` : "先建立錯題"}</span><button class="button ${aiQuestions.length ? "button-primary" : "button-secondary"}" type="button" data-start-ai-practice="${subjectId}" ${aiQuestions.length ? "" : "disabled"}>${aiQuestions.length ? "開始 AI 加強" : "等待加入"}</button></div>
        </article>
        <article class="subject-task-card subject-bank-card" data-subject-theme="${subject.theme}">
          <span class="subject-glyph" aria-hidden="true">題</span>
          <div><h2>108～114 會考實戰</h2><p>依民國 108～114 年命題趨勢隨機抽題；每次題組不同，著重圖表、情境與推論。</p></div>
          <div><span class="time-chip">◷ 10 題・約 25 分鐘</span><button class="button button-secondary" type="button" data-start-historical="${subjectId}">隨機開始</button></div>
        </article>
      </div>
      <section class="component-section" aria-labelledby="unit-list-title">
        <div class="section-heading compact-heading"><div><p class="section-label">UNIT PRACTICE</p><h2 id="unit-list-title">單元練習</h2></div><p class="section-support">選一個想加強的單元，直接開始作答</p></div>
        <div class="unit-review-list">
          ${subject.units.map((unit, index) => {
            const unitQuestions = subject.questions.filter((question) => question.unitId === unit.id || question.unit === unit.name);
            return `<details class="unit-review-card" data-subject-theme="${subject.theme}" ${index === 0 ? "open" : ""}>
              <summary><span class="unit-number">${String(index + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(unit.name || unit)}</strong><small>${unitQuestions.length} 題・以作答與立即解析進行加強</small></span><span class="review-toggle" aria-hidden="true">＋</span></summary>
              <div class="unit-review-content"><p class="review-label">直接練習</p><p>答錯後可立即進入錯題整合，請 AI 科目老師協助你找出錯因並建立同觀念題。</p><div class="unit-card-actions"><button class="button button-primary button-small" type="button" data-start-unit="${escapeHtml(unit.id || String(index))}">開始 ${unitQuestions.length} 題練習</button></div></div>
            </details>`;
          }).join("")}
        </div>
      </section>`;
  }

  function openUnitReview(unitId) {
    const subject = SUBJECTS[state.currentSubjectId];
    const unit = subject?.units.find((item) => item.id === unitId);
    if (!unit || !UNIT_REVIEWS[unitId]) return;
    state.currentUnitId = unitId;
    goToView("unit-review");
  }

  function renderReviewList(items, ordered = false) {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${(items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
  }

  function renderSubjectHandbook(handbook, subject) {
    if (!handbook) return "";
    const comparison = handbook.comparison || {};
    const worked = handbook.workedExample || {};
    const isEnglish = subject?.id === "english";
    return `<section class="handbook-deep-dive">
      <div class="handbook-heading"><div><p class="section-label">${isEnglish ? "ENGLISH CAP HANDBOOK" : "CHINESE CAP HANDBOOK"}</p><h2>${isEnglish ? "英文會考講義" : "國文會考講義"}</h2></div><span>理解型整理・不是死背清單</span></div>
      <div class="handbook-focus-grid">${(handbook.focus || []).map((item, index) => `<article><b>${index + 1}</b><p>${escapeHtml(item)}</p></article>`).join("")}</div>
      ${comparison.rows?.length ? `<figure class="handbook-comparison"><figcaption>${escapeHtml(comparison.title || "必會比較表")}</figcaption><div class="question-table-scroll"><table><thead><tr>${(comparison.columns || []).map((item) => `<th>${escapeHtml(item)}</th>`).join("")}</tr></thead><tbody>${comparison.rows.map((row) => `<tr>${row.map((cell, index) => `<${index === 0 ? "th scope=\"row\"" : "td"}>${escapeHtml(cell)}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("")}</tbody></table></div></figure>` : ""}
      <article class="handbook-worked-example"><div class="handbook-example-title"><span aria-hidden="true">例</span><div><p class="section-label">WORKED EXAMPLE</p><h3>會考例題拆解</h3></div></div><p class="handbook-example-prompt">${escapeHtml(worked.prompt || "")}</p>${renderReviewList(worked.steps || [], true)}<div class="handbook-answer"><strong>答案</strong><span>${escapeHtml(worked.answer || "")}</span></div></article>
      <aside class="handbook-memory-tip"><strong>${isEnglish ? "老師的解題提醒" : "老師的記憶提示"}</strong><p>${escapeHtml(handbook.memoryTip || "")}</p></aside>
    </section>`;
  }

  function renderUnitReviewPage(subjectId, unitId) {
    const subject = SUBJECTS[subjectId];
    const unit = subject?.units.find((item) => item.id === unitId);
    const review = UNIT_REVIEWS[unitId];
    if (!subject || !unit || !review) return goToView("subject");
    const unitQuestions = subject.questions.filter((question) => question.unitId === unitId || question.unit === unit.name);
    const reviewed = state.reviewedUnits.includes(unitId);
    $("#unit-review-content").innerHTML = `
      <section class="review-lesson-hero" data-subject-theme="${subject.theme}">
        <div><p class="section-label">CAP UNIT REVIEW・${escapeHtml(subject.name)}</p><h1 id="unit-review-title">${escapeHtml(unit.name)}會考整理</h1><p>${escapeHtml(review.summary)}</p></div>
        <div class="review-duration"><span aria-hidden="true">◎</span><strong>約 5 分鐘</strong><small>${reviewed ? "已閱讀，可再次複習" : "先理解，再測驗"}</small></div>
      </section>
      <nav class="review-learning-path" aria-label="單元學習流程" data-subject-theme="${subject.theme}">
        <span class="is-current"><b>1</b>重點整理</span><i aria-hidden="true">→</i><span><b>2</b>解題策略</span><i aria-hidden="true">→</i><span><b>3</b>${unitQuestions.length} 題測驗</span>
      </nav>
      ${renderSubjectHandbook(review.handbook, subject)}
      <div class="review-content-grid" data-subject-theme="${subject.theme}">
        <article class="review-knowledge-card review-card-wide"><div class="review-card-icon" aria-hidden="true">核</div><div><p class="section-label">MUST KNOW</p><h2>核心必會觀念</h2>${renderReviewList(review.mustKnow)}</div></article>
        <article class="review-knowledge-card"><div class="review-card-icon" aria-hidden="true">考</div><div><p class="section-label">HOW IT APPEARS</p><h2>會考怎麼考</h2>${renderReviewList(review.examPatterns)}</div></article>
        <article class="review-knowledge-card"><div class="review-card-icon" aria-hidden="true">解</div><div><p class="section-label">SOLVE IT</p><h2>穩定解題步驟</h2>${renderReviewList(review.strategy, true)}</div></article>
        <article class="review-knowledge-card review-trap-card"><div class="review-card-icon" aria-hidden="true">!</div><div><p class="section-label">COMMON TRAPS</p><h2>會考常見陷阱</h2>${renderReviewList(review.traps)}</div></article>
        <article class="review-example-card review-card-wide">
          <div><p class="section-label">QUICK CHECK</p><h2>30 秒觀念檢核</h2><p>${escapeHtml(review.example?.question || "請用自己的話說出本單元最重要的觀念。")}</p></div>
          <details><summary>看答案與提醒</summary><p>${escapeHtml(review.example?.answer || "能說出觀念與理由，才是真正理解。")}</p></details>
        </article>
      </div>
      <section class="review-ready-panel" data-subject-theme="${subject.theme}">
        <div><span class="review-ready-mark" aria-hidden="true">✓</span><div><h2>整理完成，現在用題目確認理解</h2><p>測驗後會立即解析；答錯的題目會自動加入錯題本。</p></div></div>
        <button class="button button-primary" type="button" data-start-reviewed-unit="${escapeHtml(unitId)}">我讀完了，開始 ${unitQuestions.length} 題測驗</button>
      </section>`;
  }

  function markUnitReviewed(unitId) {
    if (!state.reviewedUnits.includes(unitId)) {
      state.reviewedUnits.push(unitId);
      writeJson(REVIEW_KEY, state.reviewedUnits);
    }
  }

  // 同一天、同一科會得到固定的三題；優先安排難度 3、4、5 各一題。
  function getDailyQuestions(subject) {
    if (subject.questions.length <= 3) return [...subject.questions];
    const seedText = `${todayKey()}-${subject.id}`;
    const seed = Array.from(seedText).reduce((total, char) => total + char.charCodeAt(0), 0);
    const picked = [];
    [3, 4, 5].forEach((difficulty, index) => {
      const capCandidates = subject.questions.filter((question) => question.level === "cap" && Number(question.difficulty) === difficulty && !picked.includes(question));
      const otherCapCandidates = subject.questions
        .filter((question) => question.level === "cap" && !picked.includes(question))
        .sort((a, b) => Math.abs(Number(a.difficulty) - difficulty) - Math.abs(Number(b.difficulty) - difficulty));
      const candidates = capCandidates.length ? capCandidates : otherCapCandidates.length
        ? otherCapCandidates
        : subject.questions.filter((question) => Number(question.difficulty) === difficulty && !picked.includes(question));
      if (candidates.length) picked.push(candidates[(seed + index * 7) % candidates.length]);
    });
    const fallback = subject.questions.filter((question) => !picked.includes(question) && Number(question.difficulty) >= 3);
    while (picked.length < 3 && fallback.length) picked.push(fallback[(seed + picked.length * 11) % fallback.length]);
    return picked.slice(0, 3);
  }

  function getRandomQuestions(subject, count, examMode = false) {
    const capPool = subject.questions.filter((question) => question.level === "cap");
    const pool = examMode && capPool.length >= count ? capPool : examMode
      ? subject.questions.filter((question) => Number(question.difficulty) >= 4)
      : subject.questions;
    const questions = [...(pool.length >= count ? pool : subject.questions)];
    for (let index = questions.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [questions[index], questions[randomIndex]] = [questions[randomIndex], questions[index]];
    }
    return questions.slice(0, Math.min(count, questions.length));
  }

  // 108～114 年題組使用年度標記；題目採原創情境，對應該年度會考命題能力，不重製官方試卷文字。
  function getHistoricalQuestions(subject, count) {
    const yearTagged = getShuffledQuestions(subject.questions.filter((question) => Number(question.referenceYear) >= 108 && Number(question.referenceYear) <= 114), count);
    if (yearTagged.length >= count) return yearTagged;
    // 每次都先保留各年度命題趨勢題，再補入同樣採會考素養取向的原創題，維持 10 題完整練習。
    const reinforcement = getShuffledQuestions(subject.questions.filter((question) => question.level === "cap" && !yearTagged.includes(question)), count - yearTagged.length);
    return [...yearTagged, ...reinforcement];
  }

  function getShuffledQuestions(source, count) {
    const questions = [...source];
    for (let index = questions.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [questions[index], questions[randomIndex]] = [questions[randomIndex], questions[index]];
    }
    return questions.slice(0, Math.min(count, questions.length));
  }

  function normalizeAiQuestion(subjectId, question, sourceQuestionId, index) {
    if (!question || !Array.isArray(question.options) || question.options.length !== 4) return null;
    const answer = Number(question.answer);
    if (!Number.isInteger(answer) || answer < 0 || answer > 3 || !String(question.prompt || "").trim()) return null;
    const now = new Date().toISOString();
    return {
      id: `ai-${subjectId}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      subjectId,
      unit: String(question.unit || "AI 同觀念加強").trim(),
      unitId: String(question.unitId || ""),
      ability: String(question.ability || "把同一觀念運用在不同情境"),
      difficulty: Math.min(5, Math.max(1, Number(question.difficulty) || 4)),
      level: "ai-personalized",
      prompt: String(question.prompt).trim(),
      context: String(question.context || ""),
      options: question.options.map((option) => String(option)),
      answer,
      explanation: String(question.explanation || "請回到題目條件，逐一核對使用的觀念與選項。"),
      commonError: String(question.commonError || "只記住原題答案，沒有把觀念轉移到新情境。"),
      sourceQuestionId: String(sourceQuestionId || ""),
      createdAt: now,
      aiGenerated: true
    };
  }

  // AI 教練只把結構完整的四選一題放進個人題本，避免損壞五科練習流程。
  function addSimilarQuestions(payload) {
    if (!payload || !SUBJECTS[payload.subjectId] || !Array.isArray(payload.questions)) return 0;
    loadLearningState();
    const normalized = payload.questions
      .slice(0, 5)
      .map((question, index) => normalizeAiQuestion(payload.subjectId, question, payload.sourceQuestionId, index))
      .filter(Boolean);
    if (!normalized.length) return 0;
    state.aiPracticeQuestions = [...normalized, ...state.aiPracticeQuestions].slice(0, 100);
    if (!writeJson(AI_PRACTICE_KEY, state.aiPracticeQuestions)) return 0;
    notify(`已加入 ${SUBJECTS[payload.subjectId].name} AI 加強題本，共 ${normalized.length} 題。`);
    return normalized.length;
  }

  function startPractice(subjectId, questions, dailyMode, sourceView) {
    const subject = SUBJECTS[subjectId];
    if (!subject || !questions.length) return;
    state.currentSubjectId = subjectId;
    state.practice = {
      subjectId,
      questions,
      index: 0,
      selectedIndex: null,
      answerLocked: false,
      correctCount: 0,
      wrongCount: 0,
      dailyMode: Boolean(dailyMode),
      sourceView: sourceView || "subject"
    };
    $("#practice-view").dataset.subjectTheme = subject.theme;
    goToView("practice");
    renderPracticeQuestion();
  }

  function renderPracticeQuestion() {
    const practice = state.practice;
    if (!practice) return;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    const subject = SUBJECTS[practice.subjectId];
    const question = practice.questions[practice.index];
    const total = practice.questions.length;
    const progressPercent = Math.round(practice.index / total * 100);

    $("#practice-title").textContent = `${subject.name}・${question.unit}`;
    $("#practice-step-label").textContent = `第 ${practice.index + 1}／${total} 題`;
    $("#practice-subject-pill").textContent = subject.name;
    $("#practice-progress-bar").style.width = `${progressPercent}%`;
    $("#practice-progress-bar").parentElement.setAttribute("aria-valuenow", String(progressPercent));

    $("#practice-card-host").innerHTML = `<article class="practice-card" data-subject-theme="${subject.theme}">
      <div class="practice-card-head"><div class="question-badges"><span class="status-badge">${question.referenceYear ? `民國 ${question.referenceYear} 年命題趨勢題` : question.level === "cap" ? "會考素養題" : question.level === "ai-personalized" ? "AI 同觀念題" : "單選題"}</span><span class="status-badge difficulty-badge">難度 ${question.difficulty || 2}／5</span>${question.visual ? `<span class="status-badge visual-badge">圖表題</span>` : ""}</div><span class="practice-hint">選好答案後再確認</span></div>
      ${question.ability ? `<p class="ability-label">能力：${escapeHtml(question.ability)}</p>` : ""}
      ${question.audioText ? `<section class="listening-player" aria-label="英文聽力播放器">
        <div class="listening-player-copy"><span class="listening-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span><div><strong>先聽再作答</strong><small>可重播，建議先不要看逐字稿</small></div></div>
        ${question.audioSrc ? `<audio class="listening-audio" controls preload="metadata" aria-label="播放英文聽力內容"><source src="${escapeHtml(question.audioSrc)}" type="audio/wav">目前瀏覽器無法播放此音檔。</audio>` : `<button class="button button-primary button-small" type="button" data-play-listening>▶ 播放聽力</button>`}
        <details class="listening-transcript"><summary>聽不清楚？顯示逐字稿</summary><p>${escapeHtml(question.transcript || question.audioText)}</p></details>
      </section>` : question.context ? `<div class="question-context">${escapeHtml(question.context)}</div>` : ""}
      ${renderQuestionVisual(question.visual)}
      <h1>${escapeHtml(question.prompt)}</h1>
      <div class="option-list" role="group" aria-label="答案選項">
        ${question.options.map((option, index) => `<button class="option-button" type="button" data-answer-index="${index}" aria-pressed="false"><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option)}</span></button>`).join("")}
      </div>
      <div class="practice-submit-row"><span class="practice-hint">作答後會立即顯示答案與觀念。</span><button id="submit-answer-button" class="button button-primary" type="button" disabled>確認答案</button></div>
    </article>`;
  }

  function selectAnswer(index) {
    if (!state.practice) return;
    state.practice.selectedIndex = index;
    $$("[data-answer-index]").forEach((button) => {
      const selected = Number(button.dataset.answerIndex) === index;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    $("#submit-answer-button").disabled = false;
  }

  function submitAnswer() {
    const practice = state.practice;
    if (!practice || practice.selectedIndex === null || practice.answerLocked) return;
    practice.answerLocked = true;
    const subject = SUBJECTS[practice.subjectId];
    const question = practice.questions[practice.index];
    const isCorrect = practice.selectedIndex === question.answer;
    if (isCorrect) practice.correctCount += 1;
    else {
      practice.wrongCount += 1;
      addWrongQuestion(practice.subjectId, question, practice.selectedIndex);
    }

    const dialog = $("#answer-dialog");
    const coachButton = $("#answer-coach-button");
    const revealButton = $("#answer-reveal-button");
    dialog.classList.toggle("is-wrong", !isCorrect);
    $("#answer-dialog-icon").textContent = isCorrect ? "✓" : "!";
    $("#answer-dialog-label").textContent = isCorrect ? "立即解析・答對" : "AI 教練・先找考點";
    $("#answer-dialog-title").textContent = isCorrect ? "答對了！" : "這題先別急著看答案";
    $("#answer-dialog-answer").textContent = isCorrect
      ? `正確答案：${String.fromCharCode(65 + question.answer)}．${question.options[question.answer]}`
      : `這題真正考的是：${question.ability || `${question.unit}的核心觀念`}`;
    $("#answer-dialog-explanation").textContent = isCorrect
      ? question.explanation
      : "先回想自己剛才依據哪一個線索判斷。你可以請 AI 教練一步一步陪你找錯因，再重答一次。";
    $("#answer-dialog-error").textContent = isCorrect || !question.commonError ? "" : `可能卡住的地方：${question.commonError}`;
    coachButton.hidden = isCorrect;
    revealButton.hidden = isCorrect;
    coachButton.dataset.coachSubject = subject.id;
    coachButton.dataset.coachQuestion = question.id;
    coachButton.dataset.coachAnswer = String(practice.selectedIndex);
    revealButton.dataset.revealSubject = subject.id;
    revealButton.dataset.revealQuestion = question.id;
    $("#answer-next-button").textContent = practice.index === practice.questions.length - 1 ? "查看完成結果" : "下一題";
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }

  function addWrongQuestion(subjectId, question, selectedIndex) {
    const existing = state.wrongQuestions.find((item) => item.questionId === question.id);
    if (existing) {
      existing.wrongCount += 1;
      existing.lastWrongAt = new Date().toISOString();
      existing.selectedIndex = selectedIndex;
    } else {
      state.wrongQuestions.unshift({
        questionId: question.id,
        subjectId,
        selectedIndex,
        wrongCount: 1,
        lastWrongAt: new Date().toISOString()
      });
    }
    writeJson(WRONG_KEY, state.wrongQuestions);
  }

  function nextQuestion() {
    const dialog = $("#answer-dialog");
    if (dialog.open) dialog.close();
    const practice = state.practice;
    if (!practice) return;
    practice.index += 1;
    practice.selectedIndex = null;
    practice.answerLocked = false;
    if (practice.index >= practice.questions.length) finishPractice();
    else renderPracticeQuestion();
  }

  function finishPractice() {
    const practice = state.practice;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    const subject = SUBJECTS[practice.subjectId];
    const scoreRate = practice.questions.length ? practice.correctCount / practice.questions.length : 0;
    const reviewFeedback = scoreRate >= 0.8
      ? "這個單元已掌握得很穩，之後可從錯題本做間隔複習。"
      : scoreRate >= 0.6
        ? "已經掌握大部分觀念，建議再看一次常見陷阱後重答錯題。"
        : "先別急著刷更多題，從錯題整合建立 AI 同觀念題，再把觀念練穩更有效。";
    if (practice.dailyMode && DAILY_SUBJECTS.includes(practice.subjectId)) markDailyComplete(practice.subjectId);
    $("#practice-progress-bar").style.width = "100%";
    $("#practice-progress-bar").parentElement.setAttribute("aria-valuenow", "100");
    $("#practice-step-label").textContent = "練習完成";
    $("#practice-card-host").innerHTML = `<article class="practice-card completion-panel" data-subject-theme="${subject.theme}">
      <div class="completion-mark" aria-hidden="true">✓</div>
      <p class="section-label">MISSION COMPLETE</p>
      <h1>${subject.name}${practice.dailyMode ? "今日任務" : "練習"}完成！</h1>
      <p>${practice.dailyMode ? "今天的進度已經記下來，穩定完成比一次做很多更重要。" : practice.sourceView === "unit-review" ? reviewFeedback : "你完成了一次實戰練習；答錯題目已收進錯題整合，可再建立 AI 同觀念題。"}</p>
      <div class="completion-stats">
        <div class="completion-stat"><strong>${practice.questions.length}</strong><span>完成題數</span></div>
        <div class="completion-stat"><strong>${practice.correctCount}</strong><span>答對題數</span></div>
        <div class="completion-stat"><strong>${practice.wrongCount}</strong><span>加入錯題</span></div>
      </div>
      <div class="completion-actions">
        <button class="button button-secondary" type="button" data-completion-view="subjects">返回五科學習</button>
        <button class="button button-primary" type="button" data-completion-view="dashboard">完成今天，返回首頁</button>
      </div>
    </article>`;
    if (practice.dailyMode) notify(`${subject.name}今日任務完成！`);
  }

  function markDailyComplete(subjectId) {
    if (state.progress.date !== todayKey()) state.progress = { date: todayKey(), completedSubjects: [] };
    if (!state.progress.completedSubjects.includes(subjectId)) state.progress.completedSubjects.push(subjectId);
    writeJson(LEARNING_KEY, state.progress);
  }

  function findQuestion(subjectId, questionId) {
    return SUBJECTS[subjectId]?.questions.find((question) => question.id === questionId) ||
      state.aiPracticeQuestions.find((question) => question.subjectId === subjectId && question.id === questionId) || null;
  }

  function renderWrongQuestions() {
    loadLearningState();
    $("#wrong-count-badge").textContent = `${state.wrongQuestions.length} 題`;
    if ($("#wrong-bank-summary")) $("#wrong-bank-summary").textContent = `${state.wrongQuestions.length} 題由系統自動整理`;
    const host = $("#wrong-question-list");
    if (!state.wrongQuestions.length) {
      host.innerHTML = `<div class="empty-state"><span class="empty-state-icon" aria-hidden="true">✓</span><h2>目前沒有待複習的錯題</h2><p>開始五科練習後，答錯的題目會自動出現在這裡，不需要自己整理。</p><button class="button button-primary" type="button" data-app-view="subjects">前往五科學習</button></div>`;
      return;
    }
    host.innerHTML = state.wrongQuestions.map((item) => {
      const subject = SUBJECTS[item.subjectId];
      const question = findQuestion(item.subjectId, item.questionId);
      if (!question) return "";
      return `<article class="wrong-question-card" data-subject-theme="${subject.theme}">
        <div class="wrong-card-head"><div class="subject-identity"><span class="subject-glyph" aria-hidden="true">${subject.glyph}</span><strong>${subject.name}・${escapeHtml(question.unit)}</strong></div><span class="status-badge">答錯 ${item.wrongCount} 次</span></div>
        <h3>${escapeHtml(question.prompt)}</h3>
        ${question.ability ? `<p class="wrong-ability"><strong>能力：</strong>${escapeHtml(question.ability)}</p>` : ""}
        <p><strong>觀念提醒：</strong>${escapeHtml(question.explanation)}</p>
        ${question.commonError ? `<p class="wrong-common-error"><strong>常見錯誤：</strong>${escapeHtml(question.commonError)}</p>` : ""}
        <div class="wrong-card-actions"><button class="button button-secondary button-small" type="button" data-mastered-question="${question.id}" data-mastered-subject="${subject.id}">標記已掌握</button><button class="button button-primary button-small" type="button" data-retry-question="${question.id}" data-retry-subject="${subject.id}">再答一次</button></div>
      </article>`;
    }).join("");
  }

  function markQuestionMastered(subjectId, questionId) {
    state.wrongQuestions = state.wrongQuestions.filter((item) => !(item.subjectId === subjectId && item.questionId === questionId));
    writeJson(WRONG_KEY, state.wrongQuestions);
    renderWrongQuestions();
    notify("已標記為掌握，繼續保持！");
  }

  function requestLeavePractice() {
    if (!state.practice) return goToView("subjects");
    const dialog = $("#leave-practice-dialog");
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }

  function confirmLeavePractice() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    const source = state.practice?.sourceView === "wrong" ? "wrong" : state.practice?.sourceView === "unit-review" ? "unit-review" : "subject";
    state.practice = null;
    $("#leave-practice-dialog").close();
    goToView(source);
  }

  function handleClick(event) {
    const nav = event.target.closest("[data-app-view]");
    if (nav) {
      event.preventDefault();
      goToView(nav.dataset.appView);
      return;
    }
    const open = event.target.closest("[data-open-subject]");
    if (open) return openSubject(open.dataset.openSubject);

    const mixed = event.target.closest("[data-start-mixed]");
    if (mixed) {
      const subjectId = mixed.dataset.startMixed;
      return startPractice(subjectId, getDailyQuestions(SUBJECTS[subjectId]), true, "subject");
    }

    const unit = event.target.closest("[data-start-unit]");
    if (unit) {
      const subject = SUBJECTS[state.currentSubjectId];
      const unitQuestions = subject.questions.filter((question, index) => question.unitId === unit.dataset.startUnit || String(index) === unit.dataset.startUnit);
      return startPractice(subject.id, unitQuestions, false, "subject");
    }

    const reviewedUnit = event.target.closest("[data-start-reviewed-unit]");
    if (reviewedUnit) {
      const unitId = reviewedUnit.dataset.startReviewedUnit;
      const subject = SUBJECTS[state.currentSubjectId];
      const unitInfo = subject.units.find((item) => item.id === unitId);
      const unitQuestions = subject.questions.filter((question) => question.unitId === unitId || question.unit === unitInfo?.name);
      markUnitReviewed(unitId);
      return startPractice(subject.id, unitQuestions, false, "unit-review");
    }

    const bankPractice = event.target.closest("[data-start-bank]");
    if (bankPractice) {
      const subjectId = bankPractice.dataset.startBank;
      return startPractice(subjectId, getRandomQuestions(SUBJECTS[subjectId], 10, true), false, "subject");
    }

    const historicalPractice = event.target.closest("[data-start-historical]");
    if (historicalPractice) {
      const subjectId = historicalPractice.dataset.startHistorical;
      return startPractice(subjectId, getHistoricalQuestions(SUBJECTS[subjectId], 10), false, "historical");
    }

    const aiPractice = event.target.closest("[data-start-ai-practice]");
    if (aiPractice) {
      loadLearningState();
      const subjectId = aiPractice.dataset.startAiPractice;
      const questions = state.aiPracticeQuestions.filter((question) => question.subjectId === subjectId);
      return startPractice(subjectId, questions, false, "ai-practice");
    }

    const option = event.target.closest("[data-answer-index]");
    if (option) return selectAnswer(Number(option.dataset.answerIndex));
    if (event.target.closest("[data-play-listening]")) {
      const question = state.practice?.questions[state.practice.index];
      if (!question?.audioText) return;
      if (!("speechSynthesis" in window)) {
        notify("目前瀏覽器無法播放語音，請展開逐字稿完成練習。");
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(question.audioText);
      utterance.lang = "en-US";
      utterance.rate = 0.86;
      window.speechSynthesis.speak(utterance);
      return;
    }
    if (event.target.closest("#submit-answer-button")) return submitAnswer();

    const coachButton = event.target.closest("#answer-coach-button");
    if (coachButton) {
      const dialog = $("#answer-dialog");
      if (dialog.open) dialog.close();
      window.ExamMateAICoach?.open(
        coachButton.dataset.coachSubject,
        coachButton.dataset.coachQuestion,
        Number(coachButton.dataset.coachAnswer)
      );
      return;
    }

    const revealButton = event.target.closest("#answer-reveal-button");
    if (revealButton) {
      const question = findQuestion(revealButton.dataset.revealSubject, revealButton.dataset.revealQuestion);
      if (!question) return;
      $("#answer-dialog-label").textContent = "立即解析・完整觀念";
      $("#answer-dialog-title").textContent = "把這個判斷點記起來";
      $("#answer-dialog-answer").textContent = `正確答案：${String.fromCharCode(65 + question.answer)}．${question.options[question.answer]}`;
      $("#answer-dialog-explanation").textContent = question.explanation;
      $("#answer-dialog-error").textContent = question.commonError ? `下次留意：${question.commonError}` : "";
      revealButton.hidden = true;
      return;
    }

    const mastered = event.target.closest("[data-mastered-question]");
    if (mastered) return markQuestionMastered(mastered.dataset.masteredSubject, mastered.dataset.masteredQuestion);

    const retry = event.target.closest("[data-retry-question]");
    if (retry) {
      const question = findQuestion(retry.dataset.retrySubject, retry.dataset.retryQuestion);
      return startPractice(retry.dataset.retrySubject, [question], false, "wrong");
    }

    const completion = event.target.closest("[data-completion-view]");
    if (completion) {
      state.practice = null;
      return goToView(completion.dataset.completionView);
    }
  }

  function bindLearningEvents() {
    document.addEventListener("click", handleClick);
    $("#answer-next-button").addEventListener("click", nextQuestion);
    $("#answer-dialog").addEventListener("cancel", (event) => event.preventDefault());
    $("#leave-practice-button").addEventListener("click", requestLeavePractice);
    $("#keep-practicing-button").addEventListener("click", () => $("#leave-practice-dialog").close());
    $("#confirm-leave-practice-button").addEventListener("click", confirmLeavePractice);
    $("#profile-form").addEventListener("submit", () => window.setTimeout(enableLearningApp, 0));
    $("#confirm-reset-button").addEventListener("click", () => {
      document.body.classList.remove("learning-ready");
      $("#bottom-navigation").hidden = true;
    });
    $("#edit-profile-button").addEventListener("click", () => { $("#bottom-navigation").hidden = true; });
    $("#cancel-profile-edit").addEventListener("click", enableLearningApp);
  }

  function initLearning() {
    bindLearningEvents();
    enableLearningApp();
  }

  window.ExamMateLearning = { renderWrongQuestions, goToView, addSimilarQuestions };
  document.addEventListener("DOMContentLoaded", initLearning);
})();
