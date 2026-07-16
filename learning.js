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
  const DAILY_SUBJECTS = ["chinese", "english", "math"];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  // 五科內容資料：更換題目時只需修改這一區，不需要重做畫面。
  const SUBJECTS = {
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

  const state = {
    currentView: "dashboard",
    currentSubjectId: "chinese",
    progress: { date: todayKey(), completedSubjects: [] },
    wrongQuestions: [],
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

  function loadLearningState() {
    state.progress = readJson(LEARNING_KEY, { date: todayKey(), completedSubjects: [] }, validProgress);
    if (state.progress.date !== todayKey()) {
      state.progress = { date: todayKey(), completedSubjects: [] };
      writeJson(LEARNING_KEY, state.progress);
    }
    state.progress.completedSubjects = state.progress.completedSubjects.filter((id) => DAILY_SUBJECTS.includes(id));
    state.wrongQuestions = readJson(WRONG_KEY, [], validWrongQuestions);
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
    toast.style.background = isError ? "#b93649" : "#0b1738";
    toast.classList.add("show");
    state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
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
    ["dashboard-view", "subjects-view", "subject-view", "practice-view", "wrong-view"].forEach((id) => {
      const view = $("#" + id);
      if (view) view.hidden = true;
    });
    $("#setup-view").hidden = true;

    if (viewName === "dashboard") $("#dashboard-view").hidden = false;
    if (viewName === "subjects") {
      $("#subjects-view").hidden = false;
      renderLearningOverview();
    }
    if (viewName === "subject") {
      $("#subject-view").hidden = false;
      renderSubjectPage(state.currentSubjectId);
    }
    if (viewName === "practice") $("#practice-view").hidden = false;
    if (viewName === "wrong") {
      $("#wrong-view").hidden = false;
      renderWrongQuestions();
    }

    state.currentView = viewName;
    setActiveNavigation(viewName === "subject" || viewName === "practice" ? "subjects" : viewName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderLearningOverview() {
    loadLearningState();
    const completedCount = state.progress.completedSubjects.length;
    $("#daily-completed-count").textContent = String(completedCount);
    $("#daily-progress-bar").style.width = `${Math.round(completedCount / 3 * 100)}%`;
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
      const daily = DAILY_SUBJECTS.includes(subject.id);
      return `<button class="subject-card" type="button" data-subject-theme="${subject.theme}" data-open-subject="${subject.id}">
        <span class="subject-glyph" aria-hidden="true">${subject.glyph}</span>
        <h3>${subject.name}</h3>
        <p>${subject.description}<br>${subject.units.length} 個示範單元・${daily ? "每日任務" : "自由練習"}</p>
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
    const isDaily = DAILY_SUBJECTS.includes(subjectId);
    const completed = state.progress.completedSubjects.includes(subjectId);
    $("#subject-page-content").innerHTML = `
      <section class="subject-hero" data-subject-theme="${subject.theme}">
        <span class="subject-glyph" aria-hidden="true">${subject.glyph}</span>
        <div><p class="section-label">${isDaily ? "DAILY SUBJECT" : "FREE PRACTICE"}</p><h1 id="subject-page-title">${subject.name}</h1><p>${subject.description}，每次只專注一小步。</p></div>
        <div class="subject-summary"><span>今日狀態</span><strong>${completed ? "已完成" : isDaily ? "待完成" : "自由練習"}</strong></div>
      </section>
      <article class="subject-task-card" data-subject-theme="${subject.theme}">
        <span class="subject-glyph" aria-hidden="true">${completed ? "✓" : subject.glyph}</span>
        <div><h2>${isDaily ? `${subject.name}今日任務` : `${subject.name}綜合練習`}</h2><p>${subject.questions.length} 題示範題・答題後立即解析${isDaily ? "・完成後更新首頁紀錄" : ""}</p></div>
        <div><span class="time-chip">◷ 約 ${isDaily ? 10 : 5} 分鐘</span><button class="button button-primary" type="button" data-start-mixed="${subjectId}">${completed ? "再練一次" : "開始練習"}</button></div>
      </article>
      <section class="component-section" aria-labelledby="unit-list-title">
        <div class="section-heading compact-heading"><div><p class="section-label">UNIT LIST</p><h2 id="unit-list-title">單元列表</h2></div><p class="section-support">點選單元進行 1 題快速練習</p></div>
        <div class="unit-list">
          ${subject.units.map((unit, index) => `<button class="unit-card" type="button" data-start-unit="${index}" data-subject-theme="${subject.theme}"><span class="unit-number">${String(index + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(unit)}</strong><small>1 題・立即解析</small></span></button>`).join("")}
        </div>
      </section>`;
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
      <div class="practice-card-head"><span class="status-badge">單選題</span><span class="practice-hint">選好答案後再確認</span></div>
      ${question.context ? `<div class="question-context">${escapeHtml(question.context)}</div>` : ""}
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
    dialog.classList.toggle("is-wrong", !isCorrect);
    $("#answer-dialog-icon").textContent = isCorrect ? "✓" : "!";
    $("#answer-dialog-label").textContent = isCorrect ? "立即解析・答對" : "立即解析・再看一次";
    $("#answer-dialog-title").textContent = isCorrect ? "答對了！" : "這題先收進錯題本";
    $("#answer-dialog-answer").textContent = `正確答案：${String.fromCharCode(65 + question.answer)}．${question.options[question.answer]}`;
    $("#answer-dialog-explanation").textContent = question.explanation;
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
    const subject = SUBJECTS[practice.subjectId];
    if (practice.dailyMode && DAILY_SUBJECTS.includes(practice.subjectId)) markDailyComplete(practice.subjectId);
    $("#practice-progress-bar").style.width = "100%";
    $("#practice-progress-bar").parentElement.setAttribute("aria-valuenow", "100");
    $("#practice-step-label").textContent = "練習完成";
    $("#practice-card-host").innerHTML = `<article class="practice-card completion-panel" data-subject-theme="${subject.theme}">
      <div class="completion-mark" aria-hidden="true">✓</div>
      <p class="section-label">MISSION COMPLETE</p>
      <h1>${subject.name}${practice.dailyMode ? "今日任務" : "練習"}完成！</h1>
      <p>${practice.dailyMode ? "今天的進度已經記下來，穩定完成比一次做很多更重要。" : "你完成了一次快速練習，答錯的題目也已經收進錯題本。"}</p>
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
    return SUBJECTS[subjectId]?.questions.find((question) => question.id === questionId) || null;
  }

  function renderWrongQuestions() {
    loadLearningState();
    $("#wrong-count-badge").textContent = `${state.wrongQuestions.length} 題`;
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
        <p><strong>觀念提醒：</strong>${escapeHtml(question.explanation)}</p>
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
    const source = state.practice?.sourceView === "wrong" ? "wrong" : "subject";
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
      return startPractice(subjectId, SUBJECTS[subjectId].questions, DAILY_SUBJECTS.includes(subjectId), "subject");
    }

    const unit = event.target.closest("[data-start-unit]");
    if (unit) {
      const subject = SUBJECTS[state.currentSubjectId];
      const question = subject.questions[Number(unit.dataset.startUnit)];
      return startPractice(subject.id, [question], false, "subject");
    }

    const option = event.target.closest("[data-answer-index]");
    if (option) return selectAnswer(Number(option.dataset.answerIndex));
    if (event.target.closest("#submit-answer-button")) return submitAnswer();

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

  document.addEventListener("DOMContentLoaded", initLearning);
})();
