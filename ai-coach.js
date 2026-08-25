/*
 * ExamMate 國中會考 AI 教練（第一版）
 * ------------------------------------------------------------------
 * 1. 支援題庫錯題、數位錯題本，以及安全後端開啟後的拍照詢問。
 * 2. AI 科目老師先完成：考點 → 錯因 → 解題 → 陷阱；AI 筆記老師再整理重點。
 * 3. 分析學生自行拍攝的任意題目時，必須由安全後端呼叫 AI；
 *    請勿把 API Key 寫在這個前端檔案或 config.js。
 */
(function () {
  "use strict";

  const COACH_KEY = "examMate.aiCoach.v1";
  const WRONG_KEY = "examMate.wrongQuestions.v1";
  const DIGITAL_KEY = "examMate.digitalWrongNotebook.v1";
  const AI_PRACTICE_KEY = "examMate.aiPracticeQuestions.v1";
  const SUBJECTS = window.examMateQuestionBank || {};
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const REASONS = [
    { id: "reading", label: "漏看題目限制", detail: "關鍵字、轉折、時間或條件沒有全部核對" },
    { id: "concept", label: "核心觀念不清", detail: "知道題目在問什麼，但不確定該用哪個觀念" },
    { id: "confusion", label: "兩個觀念混淆", detail: "選項看起來都很像，分不出差異" },
    { id: "process", label: "解題步驟中斷", detail: "知道方法，但漏了一步、算錯或沒有驗算" },
    { id: "guess", label: "當時主要靠猜", detail: "沒有找到足夠證據就先選了答案" }
  ];

  const SUBJECT_METHODS = {
    chinese: {
      clue: "先圈出題幹的限制詞，再回到文本找直接證據；不要只憑一句話的熟悉感。",
      note: "國文會考重點不是背得多，而是能用上下文、語氣與篇章線索支持判斷。",
      extension: "換一個相近詞語或文本情境，說出『為什麼適合、為什麼其他選項不適合』。"
    },
    english: {
      clue: "先找主詞、時間、轉折與代名詞，再看前後句的語意是否能完整接起來。",
      note: "英文會考常把答案藏在語境與篇章關係中，不能只翻譯空格附近的一個單字。",
      extension: "把關鍵句換一個主詞、時間或連接詞，再判斷句型與意思會如何改變。"
    },
    math: {
      clue: "先把已知、未知與限制條件分開寫，再決定關係式；算完要帶回題意檢查單位與合理性。",
      note: "數學會考重視把情境轉成數學關係，以及解答是否符合原題限制。",
      extension: "把題目中的一個數字或條件改掉，重新列式，確認自己掌握的是方法而不是答案。"
    },
    science: {
      clue: "先辨認控制變因、操作變因與觀察結果，再用科學概念解釋資料，不要只背結論。",
      note: "自然會考常用實驗、圖表與生活現象，評量能否以證據連結科學概念。",
      extension: "想一想：如果只改變其中一個條件，預測結果會怎麼變？理由是什麼？"
    },
    social: {
      clue: "先確認時間、地點、資料來源與制度條件，再區分題目明說的事實和可合理推論的結論。",
      note: "社會會考重視時空脈絡、資料判讀與多面向比較，不是只記住單一名詞。",
      extension: "換一個時代、地區或利害關係人，判斷同一制度或事件可能出現什麼不同影響。"
    }
  };

  // 固定九段輸出格式，以及五科各自的專屬分析 Prompt。
  const COACH_FIXED_HEADINGS = [
    "① 本題考什麼？",
    "② 我為什麼會錯？",
    "③ 正確觀念",
    "④ 解題思考流程",
    "⑤ 命題老師真正想考的是？",
    "⑥ 一句記住它",
    "⑦ 易混淆比較",
    "⑧ 會考重點整理",
    "⑨ AI再提醒一次"
  ];

  const SUBJECT_PROMPTS = {
    chinese: {
      fields: ["修辭", "詞語", "成語", "文言文", "閱讀理解", "作者觀點", "命題技巧"],
      summaries: ["會考常考", "容易混淆", "閱讀技巧"]
    },
    english: {
      fields: ["文法", "時態", "單字", "片語", "閱讀"],
      summaries: ["會考文法", "易混淆", "重要單字"]
    },
    math: {
      fields: ["考點", "建立式子", "解題策略", "常犯錯誤", "類似題"],
      summaries: ["公式", "秒殺技巧", "易錯觀念"]
    },
    social: {
      fields: ["歷史背景", "時間軸", "事件比較", "容易混淆", "會考常考"],
      summaries: ["時間軸", "比較表", "一句口訣"]
    },
    science: {
      fields: ["原理", "現象", "生活應用", "實驗", "易錯觀念"],
      summaries: ["公式", "重點", "會考必考"]
    }
  };

  const UNIT_COMPARISONS = [
    { match: /字音|字形/, title: "讀音、字形與詞義要分開核對", left: "只看單字", right: "放回完整詞語與句意判斷" },
    { match: /成語|詞語/, title: "意思相近，不代表使用情境相同", left: "字面看起來接近", right: "核對感情色彩、對象與前後語境" },
    { match: /修辭/, title: "名稱與表達效果是兩層判斷", left: "只辨認修辭名稱", right: "再說明它強調了什麼內容或情感" },
    { match: /閱讀|文意|白話|文言|綜合/, title: "文本證據和個人想像要分開", left: "生活中可能如此", right: "文中有線索支持才可推論" },
    { match: /文法|grammar/i, title: "形式正確還不夠，整句語意也要合理", left: "只套單一文法規則", right: "同時核對主詞、時間與前後邏輯" },
    { match: /英文.*閱讀|短文|長文|克漏|reading/i, title: "細節題和推論題使用的證據不同", left: "細節：文中可直接找到", right: "推論：多個線索合起來仍不能超出文本" },
    { match: /聽力/, title: "聽到的第一個詞不一定是答案", left: "只記單一人名或時間", right: "整合人物、目的、轉折與最後決定" },
    { match: /代數|方程|函數/, title: "式子成立和答案符合題意是兩次檢查", left: "完成計算就停止", right: "代回原式並核對範圍、單位與限制" },
    { match: /幾何|圖形/, title: "圖看起來像，不代表題目已經給定", left: "依圖形外觀猜性質", right: "只使用題幹、標記與定理能支持的條件" },
    { match: /統計|機率|資料/, title: "資料的數值和資料能支持的結論不同", left: "看到變化就說有因果", right: "先描述資料，再判斷是否足以推論原因" },
    { match: /實驗|探究|理化|化學|物理/, title: "觀察結果和原因解釋要分開", left: "結果：實際量到或看到什麼", right: "解釋：用概念說明為何出現結果" },
    { match: /生物|生命/, title: "構造、功能與層次不可混在一起", left: "記住名詞卻不知道作用", right: "連結構造特徵、功能與所在層次" },
    { match: /歷史/, title: "先後關係不一定等於因果關係", left: "兩件事接連發生", right: "還要有史料或脈絡支持因果" },
    { match: /地理/, title: "位置分布和形成原因是不同問題", left: "地圖顯示在哪裡", right: "再用自然或人文條件解釋為何如此" },
    { match: /公民|法律|經濟/, title: "權利、責任與制度目的要一起看", left: "只從單一個人方便判斷", right: "兼顧規則、程序與不同人的權益" }
  ];

  const state = {
    source: "wrong",
    session: null,
    records: [],
    dataDamaged: false,
    photoImage: "",
    photoBusy: false,
    photoStatus: "",
    photoStatusError: false,
    photoDraft: { subjectId: "chinese", unit: "", questionText: "", studentThinking: "" },
    toastTimer: null
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function findQuestion(subjectId, questionId) {
    const bankQuestion = SUBJECTS[subjectId]?.questions?.find((question) => question.id === questionId);
    if (bankQuestion) return bankQuestion;
    try {
      const personalized = JSON.parse(localStorage.getItem(AI_PRACTICE_KEY) || "[]");
      return Array.isArray(personalized)
        ? personalized.find((question) => question.subjectId === subjectId && question.id === questionId) || null
        : null;
    } catch (error) {
      return null;
    }
  }

  function readDigitalQuestions() {
    try {
      const value = JSON.parse(localStorage.getItem(DIGITAL_KEY) || "[]");
      return Array.isArray(value) ? value.filter((item) => item && SUBJECTS[item.subjectId] && typeof item.question === "string") : [];
    } catch (error) {
      return [];
    }
  }

  function findDigitalQuestion(digitalId) {
    return readDigitalQuestions().find((item) => item.id === digitalId) || null;
  }

  function normalizeDigitalQuestion(item) {
    if (!item) return null;
    const thinking = item.myAnswer ? `學生原本的想法：${item.myAnswer}` : "學生尚未記錄原本的作答想法。";
    return {
      id: `digital:${item.id}`,
      digitalId: item.id,
      unit: item.unit || "其他單元",
      ability: `辨認${item.unit || "本單元"}的核心考點，並修正${item.reason || "原本的錯誤判斷"}`,
      difficulty: 4,
      prompt: item.question,
      context: item.source ? `題目來源：${item.source}` : "",
      options: [],
      answer: null,
      correctAnswerText: item.correctAnswer || "尚未補上正確答案或觀念",
      explanation: item.correctAnswer ? `正確答案／觀念：${item.correctAnswer}${item.reflection ? `。下次提醒：${item.reflection}` : ""}` : "這題尚未補上正確答案或觀念，建議先請老師確認後再完成筆記。",
      commonError: `${item.reason || "錯誤原因待確認"}。${thinking}`,
      imageData: item.imageData || "",
      openResponse: true
    };
  }

  function getSessionQuestion(session = state.session) {
    if (!session) return null;
    if (session.question) return session.question;
    if (session.source === "digital") return normalizeDigitalQuestion(findDigitalQuestion(session.digitalId));
    return findQuestion(session.subjectId, session.questionId);
  }

  function readWrongQuestions() {
    try {
      const value = JSON.parse(localStorage.getItem(WRONG_KEY) || "[]");
      return Array.isArray(value) ? value.filter((item) => item && findQuestion(item.subjectId, item.questionId)) : [];
    } catch (error) {
      return [];
    }
  }

  function validRecord(item) {
    return Boolean(item && typeof item.id === "string" && typeof item.subjectId === "string" &&
      typeof item.questionId === "string" && typeof item.reason === "string" && typeof item.createdAt === "string" &&
      ["wrong", "sample", "digital", "photo"].includes(item.source || "wrong"));
  }

  function loadRecords() {
    state.dataDamaged = false;
    try {
      const raw = localStorage.getItem(COACH_KEY);
      if (!raw) {
        state.records = [];
        return;
      }
      const value = JSON.parse(raw);
      if (!Array.isArray(value) || !value.every(validRecord)) throw new Error("invalid coach data");
      state.records = value.filter((item) => item.source === "photo" ||
        (item.source === "digital" ? Boolean(findDigitalQuestion(item.digitalId)) : Boolean(findQuestion(item.subjectId, item.questionId))));
    } catch (error) {
      state.records = [];
      state.dataDamaged = true;
    }
  }

  function saveRecords() {
    try {
      localStorage.setItem(COACH_KEY, JSON.stringify(state.records.slice(0, 200)));
      return true;
    } catch (error) {
      notify("瀏覽器無法儲存 AI 教練紀錄，請確認沒有使用無痕模式。", true);
      return false;
    }
  }

  function notify(message, isError = false) {
    const toast = $("#toast");
    if (!toast) return;
    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.style.background = isError ? "#a84f59" : "#365759";
    toast.classList.add("show");
    state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function getWrongCandidates() {
    return readWrongQuestions().map((item) => ({
      source: "wrong",
      item,
      subject: SUBJECTS[item.subjectId],
      question: findQuestion(item.subjectId, item.questionId)
    }));
  }

  function getDigitalCandidates() {
    return readDigitalQuestions().map((item) => ({
      source: "digital",
      item,
      subject: SUBJECTS[item.subjectId],
      question: normalizeDigitalQuestion(item)
    }));
  }

  function getSampleCandidates() {
    const result = [];
    Object.values(SUBJECTS).forEach((subject) => {
      const pool = subject.questions.filter((question) => Number(question.difficulty || 0) >= 4);
      const selected = (pool.length ? pool : subject.questions).slice(0, 3);
      selected.forEach((question) => result.push({ source: "sample", item: null, subject, question }));
    });
    return result;
  }

  function currentCandidates() {
    if (state.source === "wrong") return getWrongCandidates();
    if (state.source === "digital") return getDigitalCandidates();
    if (state.source === "sample") return getSampleCandidates();
    return [];
  }

  function renderStats() {
    const sessions = state.records.length;
    const mastered = state.records.filter((record) => record.retryCorrect).length;
    const counts = new Map();
    state.records.forEach((record) => {
      const question = record.source === "digital"
        ? normalizeDigitalQuestion(findDigitalQuestion(record.digitalId))
        : findQuestion(record.subjectId, record.questionId);
      const subject = SUBJECTS[record.subjectId];
      if (!question || !subject || record.retryCorrect) return;
      const label = `${subject.name}・${question.unit}`;
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    const focus = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "尚未分析";
    $("#coach-session-count").textContent = String(sessions);
    $("#coach-mastered-count").textContent = String(mastered);
    $("#coach-focus-label").textContent = focus;
  }

  function renderPhotoForm() {
    const configured = Boolean(typeof examConfig !== "undefined" && examConfig.aiCoach?.customQuestionEnabled && examConfig.aiCoach?.endpoint);
    const draft = state.photoDraft;
    const subjectOptions = [["chinese", "國文"], ["english", "英文"], ["math", "數學"], ["science", "自然"], ["social", "社會"]]
      .map(([id, name]) => `<option value="${id}" ${draft.subjectId === id ? "selected" : ""}>${name}</option>`).join("");
    return `<form id="coach-photo-form" class="coach-photo-form" novalidate>
      <div class="coach-photo-heading"><span class="coach-teacher-avatar" aria-hidden="true">拍</span><div><h3>拍下不會的題目</h3><p>照片要清楚包含題幹、圖表與選項；先選科目並寫下自己卡住的地方，分析會更準確。</p></div></div>
      <label class="coach-photo-zone" for="coach-photo-file">
        ${state.photoImage ? `<img src="${state.photoImage}" alt="準備詢問的題目照片">` : `<span aria-hidden="true">▣</span><strong>拍照或選擇題目圖片</strong><small>支援手機相機與電腦圖片</small>`}
      </label>
      <input id="coach-photo-file" class="sr-only" type="file" accept="image/*" capture="environment">
      ${state.photoImage ? `<button class="text-button" type="button" data-coach-remove-photo>移除照片</button>` : ""}
      <div class="coach-photo-fields">
        <label><span>科目</span><select name="subjectId" required>${subjectOptions}</select></label>
        <label><span>單元或範圍</span><input name="unit" maxlength="40" value="${escapeHtml(draft.unit)}" placeholder="例如：一元二次方程式" required></label>
        <label class="is-wide"><span>題幹文字 <small>建議填寫</small></span><textarea name="questionText" rows="3" maxlength="1200" placeholder="可貼上或輸入題目文字；有圖片辨識後端時可只拍照。">${escapeHtml(draft.questionText)}</textarea></label>
        <label class="is-wide"><span>我卡住的地方</span><textarea name="studentThinking" rows="2" maxlength="500" placeholder="例如：我不知道要先設哪一個未知數。">${escapeHtml(draft.studentThinking)}</textarea></label>
      </div>
      <div class="coach-photo-privacy"><span aria-hidden="true">盾</span><p>請不要拍到姓名、准考證或其他個人資料。${configured ? "照片會送到已設定的安全後端分析。" : "目前尚未連接照片辨識後端；題庫與數位錯題仍可直接使用。"}</p></div>
      <p class="coach-photo-status ${state.photoStatusError ? "is-error" : ""}" role="status">${escapeHtml(state.photoStatus)}</p>
      <button class="button button-primary button-full" type="submit" ${state.photoBusy ? "disabled" : ""}>${state.photoBusy ? "AI 正在讀題…" : configured ? "請 AI 科目老師分析" : "檢查照片詢問設定"}</button>
    </form>`;
  }

  function renderQuestionList() {
    const host = $("#coach-question-list");
    $$('[data-coach-source]').forEach((button) => {
      const active = button.dataset.coachSource === state.source;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (state.source === "photo") {
      $("#coach-question-count").textContent = "拍照詢問";
      host.innerHTML = renderPhotoForm();
      return;
    }

    const candidates = currentCandidates();
    $("#coach-question-count").textContent = `${candidates.length} 題`;

    if (!candidates.length) {
      const digital = state.source === "digital";
      host.innerHTML = `<div class="coach-library-empty"><span aria-hidden="true">${digital ? "簿" : "✓"}</span><strong>${digital ? "數位錯題本目前是空的" : "目前沒有題庫錯題"}</strong><p>${digital ? "先到錯題本拍照或手動記下一題，再交給兩位 AI 老師。" : "可以先做五科練習，或查看示範題熟悉教練流程。"}</p><button class="button button-secondary button-small" type="button" ${digital ? `data-app-view="wrong" data-open-digital-after-view` : `data-coach-source="sample"`}>${digital ? "前往數位錯題本" : "查看示範題"}</button></div>`;
      return;
    }

    host.innerHTML = candidates.map(({ subject, question, item }) => {
      const digital = question.digitalId;
      const selected = state.session?.subjectId === subject.id && (digital ? state.session?.digitalId === digital : state.session?.questionId === question.id);
      return `<button class="coach-question-item ${selected ? "is-selected" : ""}" type="button" ${digital ? `data-coach-digital-question="${escapeHtml(digital)}"` : `data-coach-question="${escapeHtml(question.id)}" data-coach-subject="${escapeHtml(subject.id)}"`}>
        <span class="coach-question-glyph" data-subject-theme="${escapeHtml(subject.theme)}" aria-hidden="true">${escapeHtml(subject.glyph)}</span>
        <span><small>${escapeHtml(subject.name)}・${escapeHtml(question.unit)}</small><strong>${escapeHtml(question.prompt)}</strong><em>${digital ? `${item.imageData ? "含題目照片・" : ""}${item.reason || "待分析"}` : item ? `答錯 ${item.wrongCount || 1} 次` : `難度 ${question.difficulty || 3}／5`}</em></span>
      </button>`;
    }).join("");
  }

  function renderVisual(visual) {
    if (!visual || typeof visual !== "object") return "";
    const title = visual.title ? `<figcaption>${escapeHtml(visual.title)}</figcaption>` : "";
    if (visual.type === "table") {
      const columns = Array.isArray(visual.columns) ? visual.columns : [];
      const rows = Array.isArray(visual.rows) ? visual.rows : [];
      return `<figure class="question-visual question-table-visual">${title}<div class="question-table-scroll"><table><thead><tr>${columns.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, index) => `<${index ? "td" : "th"}>${escapeHtml(cell)}</${index ? "td" : "th"}>`).join("")}</tr>`).join("")}</tbody></table></div></figure>`;
    }
    if (visual.type === "bar") {
      const items = Array.isArray(visual.items) ? visual.items : [];
      const max = Math.max(1, ...items.map((item) => Number(item.value) || 0));
      return `<figure class="question-visual question-bar-visual">${title}<div class="question-bars">${items.map((item) => `<div class="question-bar-row"><span>${escapeHtml(item.label)}</span><div class="question-bar-track"><i style="width:${Math.max(4, (Number(item.value) || 0) / max * 100)}%"></i></div><strong>${escapeHtml(item.display ?? item.value)}</strong></div>`).join("")}</div></figure>`;
    }
    if (visual.type === "timeline") {
      return `<figure class="question-visual question-timeline-visual">${title}<ol>${(visual.items || []).map((item) => `<li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.detail)}</span></li>`).join("")}</ol></figure>`;
    }
    if (visual.type === "flow") {
      return `<figure class="question-visual question-flow-visual">${title}<div>${(visual.steps || []).map((step, index, list) => `<span>${escapeHtml(step)}</span>${index < list.length - 1 ? "<b>→</b>" : ""}`).join("")}</div></figure>`;
    }
    if (visual.type === "cards") {
      return `<figure class="question-visual question-card-visual">${title}<div>${(visual.items || []).map((item) => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong>${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}</article>`).join("")}</div></figure>`;
    }
    return "";
  }

  function renderQuestionStem(question) {
    const listening = question.audioSrc
      ? `<section class="listening-player coach-listening"><audio class="listening-audio" controls preload="metadata"><source src="${escapeHtml(question.audioSrc)}" type="audio/wav">目前瀏覽器無法播放此音檔。</audio><details><summary>需要時查看逐字稿</summary><p>${escapeHtml(question.transcript || question.audioText || "")}</p></details></section>`
      : question.audioText
        ? `<details class="coach-context"><summary>聽力逐字稿</summary><p>${escapeHtml(question.transcript || question.audioText)}</p></details>`
        : question.context ? `<div class="coach-context">${escapeHtml(question.context)}</div>` : "";
    const image = question.imageData ? `<figure class="coach-question-photo"><img src="${question.imageData}" alt="${escapeHtml(question.unit || "錯題")}題目照片"></figure>` : "";
    return `${listening}${image}${renderVisual(question.visual)}<h3 class="coach-question-prompt">${escapeHtml(question.prompt)}</h3>`;
  }

  function getComparison(question) {
    const haystack = `${question.unit || ""} ${question.ability || ""}`;
    return UNIT_COMPARISONS.find((item) => item.match.test(haystack)) || {
      title: "題目證據與直覺猜測要分開",
      left: "我覺得這個選項很熟悉",
      right: "我能指出題幹中的線索支持它"
    };
  }

  function getAvoidance(reasonId) {
    const map = {
      reading: "下次作答前，先圈出『最、不是、可能、主要、根據』等限制詞，選完再逐項核對。",
      concept: "先用一句自己的話說出要用的觀念，再開始看選項或列式；說不出來就先回單元整理。",
      confusion: "把兩個容易混淆的概念各寫一個判斷標準，不只背名稱，還要能說出差異。",
      process: "固定保留最後一步：代回題意、檢查單位、核對前後文或排除不合理選項。",
      guess: "猜題前至少找出一個支持線索與一個排除線索，讓每次選擇都有可以回頭檢查的依據。"
    };
    return map[reasonId] || map.reading;
  }

  function getReasonLabel(reasonId) {
    return REASONS.find((reason) => reason.id === reasonId)?.label || "尚未選擇";
  }

  function getEnglishKeywords(question) {
    const text = `${question.context || ""} ${question.prompt || ""} ${(question.options || []).join(" ")}`;
    const words = text.match(/[A-Za-z][A-Za-z'-]*/g) || [];
    return [...new Set(words.map((word) => word.toLowerCase()))].slice(0, 8).join("、") || "題幹中的時間、轉折與核心動詞";
  }

  function getMathFormula(question) {
    const unit = `${question.unit || ""} ${question.ability || ""}`;
    if (/機率/.test(unit)) return "機率＝符合條件的結果數 ÷ 所有可能結果數。";
    if (/統計|平均/.test(unit)) return "平均數＝資料總和 ÷ 資料個數；圖表題還要核對刻度與單位。";
    if (/幾何|面積|圓|三角/.test(unit)) return "先標示已知長度與角度，再選用面積、比例、相似或畢氏定理。";
    if (/函數/.test(unit)) return "先確認自變數與應變數，再用式子、表格或圖形核對對應關係。";
    return "設未知數後依題意列等式；等式兩邊做相同運算，最後代回原題。";
  }

  function getScienceFormula(question) {
    const unit = `${question.unit || ""} ${question.ability || ""}`;
    if (/速度|速率/.test(unit)) return "速率＝路程 ÷ 時間，並注意單位換算。";
    if (/密度/.test(unit)) return "密度＝質量 ÷ 體積。";
    if (/電|功率/.test(unit)) return "依題意辨認電壓、電流、電阻或功率，再選用相符關係式。";
    return "若本題沒有計算公式，就記成「條件 → 原理 → 可觀察現象」。";
  }

  function getSubjectFieldContent(subjectId, field, question, method, comparison) {
    const unit = question.unit || "本單元";
    const ability = question.ability || `${unit}的核心判斷`;
    const commonError = question.commonError || "只憑熟悉感作答，沒有用題目證據核對。";
    const englishWords = subjectId === "english" ? getEnglishKeywords(question) : "";
    const content = {
      chinese: {
        修辭: /修辭/.test(`${unit} ${ability}`) ? `先辨認句式，再說明修辭如何強調語意或情感；本題核心是「${ability}」。` : "本題不是以修辭名稱為主；若選項出現修辭，仍要同時核對句式與表達效果。",
        詞語: `詞語要放回上下文判斷語意、感情色彩與使用對象，不能只看單字表面。`,
        成語: /成語/.test(`${unit} ${ability}`) ? "核對完整意思、褒貶色彩、適用對象及前後語境。" : "若選項出現成語，先排除與語境、對象或感情色彩不合者。",
        文言文: /文言/.test(`${unit} ${ability}`) ? "先確認重要實詞，再整理人物、行動、原因與結果，不要逐字硬翻。" : "本題不是文言文主題；遇到古文時仍應以句內語境決定詞義。",
        閱讀理解: `回到文本或題幹找證據，區分「文中明說」與「根據線索合理推論」。`,
        作者觀點: `先找轉折、結論與反覆出現的概念；作者觀點必須能由全文支持。`,
        命題技巧: `命題者會用「${commonError}」設計干擾選項，測試學生能否回到文本核對。`
      },
      english: {
        文法: `先確認句子結構與詞性，再判斷選項是否同時符合語意；本題能力是「${ability}」。`,
        時態: /時態|時間|動詞/.test(`${unit} ${ability}`) ? "圈出時間線索，確認事件時間與主詞，再決定動詞形式。" : "本題時態不是唯一考點，但仍要先確認時間線索是否限制答案。",
        單字: `重要字詞：${englishWords}。先用上下文猜義，再核對詞性與搭配。`,
        片語: "片語要整組理解，並留意介系詞、動詞搭配和在句中的功能。",
        閱讀: "先看題目問細節、主旨或推論，再回原文定位；but、however、because、therefore 後常是關鍵。"
      },
      math: {
        考點: ability,
        建立式子: `把已知、未知與限制分開；設未知數後，用題意中的相等、倍數、比例或變化關係建立式子。`,
        解題策略: `${method.clue} 若有多種方法，優先選步驟少且容易驗算的方式。`,
        常犯錯誤: commonError,
        類似題: `把原題的一個數字或條件改變，重新列式；若方法仍能使用，才是真的理解。`
      },
      social: {
        歷史背景: /歷史/.test(`${unit} ${ability}`) ? "先確認事件發生的時代、地區、人物與當時制度，不用現代觀念直接套用。" : "本題若涉及制度或區域，先補出它所在的時空背景，再判斷資料。",
        時間軸: "依「背景 → 事件 → 影響」排序；沒有資料支持的年代或先後關係不要自行補入。",
        事件比較: "用相同欄位比較目的、作法、對象、結果與影響，避免只比較名稱。",
        容易混淆: `${comparison.left}；正確作法是${comparison.right}。`,
        會考常考: `常以圖表、史料、地圖或生活制度包裝「${ability}」，需要跨資料判讀。`
      },
      science: {
        原理: `先說明「${ability}」背後的科學關係，再用它解釋題目資料。`,
        現象: "把實際看到或量到的結果先描述清楚，不要把原因直接當成觀察結果。",
        生活應用: `找出生活情境中的條件與${unit}概念如何對應，不能只靠日常經驗猜測。`,
        實驗: "依序確認研究問題、操作變因、控制變因、應變變因與資料是否支持結論。",
        易錯觀念: commonError
      }
    };
    return content[subjectId]?.[field] || `${ability}：依題目證據完成判斷。`;
  }

  function getSubjectSummaryContent(subjectId, label, question, method, comparison) {
    const ability = question.ability || question.unit;
    const content = {
      chinese: {
        會考常考: `語境選詞、篇章統整、合理推論，以及修辭或語文知識在文本中的作用。`,
        容易混淆: `${comparison.left}／${comparison.right}。`,
        閱讀技巧: "先讀題目要求，再定位段落證據；轉折後、結論句與反覆概念要特別標記。"
      },
      english: {
        會考文法: "主詞動詞一致、時態、代名詞、連接詞與句子前後邏輯要一起判斷。",
        易混淆: `${comparison.left}／${comparison.right}。`,
        重要單字: getEnglishKeywords(question)
      },
      math: {
        公式: getMathFormula(question),
        秒殺技巧: "先看題目要什麼、估答案範圍，再決定列式；選項差距大時可用估算快速排除。",
        易錯觀念: question.commonError || "計算正確仍要代回題意，檢查範圍、單位與合理性。"
      },
      social: {
        時間軸: "背景 → 事件 → 改變 → 影響。只放題目資料能支持的先後關係。",
        比較表: `${comparison.left}｜${comparison.right}。比較時固定使用相同欄位。`,
        一句口訣: "先定時空，再讀資料；事實、推論分開查。"
      },
      science: {
        公式: getScienceFormula(question),
        重點: `${ability}；用資料或實驗現象支持解釋，不只背結論。`,
        會考必考: "變因控制、圖表判讀、證據與結論，以及科學概念的生活應用。"
      }
    };
    return content[subjectId]?.[label] || method.note;
  }

  function buildSubjectReport(subject, question, method, comparison) {
    const prompt = SUBJECT_PROMPTS[subject.id] || SUBJECT_PROMPTS.science;
    const aiFields = question.aiAnalysis?.subjectFields || {};
    return `<section class="coach-subject-report" data-coach-subject-report="${escapeHtml(subject.id)}">
      <div class="coach-subject-report-heading"><p class="section-label">${escapeHtml(subject.name.toUpperCase())} SUBJECT TEACHER</p><h2>${escapeHtml(subject.name)}科解題分析</h2><p>科目老師依${escapeHtml(subject.name)}科會考命題特性補充，不套用其他科目的解題方式。</p></div>
      <div class="coach-subject-field-grid">${prompt.fields.map((field) => `<article><h3>■ ${escapeHtml(field)}</h3><p>${escapeHtml(aiFields[field] || getSubjectFieldContent(subject.id, field, question, method, comparison))}</p></article>`).join("")}</div>
    </section>`;
  }

  function buildNoteTeacherReport(subject, question, method, comparison) {
    const prompt = SUBJECT_PROMPTS[subject.id] || SUBJECT_PROMPTS.science;
    const aiToolkit = question.aiAnalysis?.noteToolkit || {};
    const aiSummaries = question.aiAnalysis?.summaries || {};
    const toolkit = [
      ["整理知識", `${question.unit}：${question.ability || "把題目條件和核心觀念連起來"}`],
      ["會考重點", method.note],
      ["比較表", `${comparison.left}｜${comparison.right}`],
      ["一句口訣", "先找限制，再用證據；完成判斷，回題檢查。"],
      ["時間軸", subject.id === "social" ? "背景 → 事件 → 改變 → 影響" : "讀題 → 找考點 → 選方法 → 驗證"],
      ["常考整理", `${question.ability || question.unit}常搭配情境、圖表或易混淆選項出題。`]
    ];
    return `<section class="coach-note-teacher-report" aria-label="AI 筆記老師整理">
      <div class="coach-subject-report-heading"><p class="section-label">AI NOTE TEACHER</p><h2>這題的複習筆記</h2><p>把剛才的解題過程整理成之後能快速複習的內容。</p></div>
      <div class="coach-note-toolkit">${toolkit.map(([label, content]) => `<article><h3>${escapeHtml(label)}</h3><p>${escapeHtml(aiToolkit[label] || content)}</p></article>`).join("")}</div>
      <div class="coach-subject-summary">${prompt.summaries.map((label) => `<article><h3>【${escapeHtml(label)}】</h3><p>${escapeHtml(aiSummaries[label] || getSubjectSummaryContent(subject.id, label, question, method, comparison))}</p></article>`).join("")}</div>
    </section>`;
  }

  function buildFixedReport(subject, question) {
    const method = SUBJECT_METHODS[subject.id] || SUBJECT_METHODS.chinese;
    const comparison = getComparison(question);
    const reason = getReasonLabel(state.session.reason);
    const commonError = question.commonError || "只憑熟悉感作答，沒有回到題幹找證據。";
    const defaultSections = [
      question.ability || `${question.unit}的核心觀念與判斷能力`,
      `你選擇的主要錯因是「${reason}」。這題最可能卡在：${commonError}`,
      question.explanation,
      `第一步圈出題目限制；第二步確認要使用的觀念；第三步用${subject.name}科證據排除選項；第四步回到題意驗證。${method.clue}`,
      `命題者不是只問你記不記得答案，而是要確認你能否完成「${question.ability || question.unit}」，並避開依熟悉感設計的干擾選項。`,
      `先找證據，再做判斷；選完一定回題目核對。`,
      `${comparison.title}：${comparison.left}；應改為${comparison.right}。`,
      `${method.note} 本題必須掌握：${question.ability || question.unit}。`,
      `${getAvoidance(state.session.reason)} 做對一題不只是記住答案，而是記住這次用對的方法。`
    ];
    const aiFixed = question.aiAnalysis?.fixedSections || {};
    const sections = COACH_FIXED_HEADINGS.map((heading, index) => aiFixed[heading] || aiFixed[String(index + 1)] || defaultSections[index]);
    return `<section class="coach-fixed-report is-subject-teacher-report" aria-label="AI 科目老師分析">
      <div class="coach-fixed-report-heading coach-report-teacher-heading"><span class="coach-teacher-avatar" aria-hidden="true">解</span><div><p class="section-label">AI SUBJECT TEACHER</p><h2>AI 科目老師的診斷</h2><p>先完成命題分析、錯因定位、解題教學與陷阱提醒。</p></div></div>
      <div class="coach-report-section-list">${COACH_FIXED_HEADINGS.slice(0, 5).map((heading, index) => `<article><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(sections[index])}</p></article>`).join("")}</div>
      ${buildSubjectReport(subject, question, method, comparison)}
    </section>
    <div class="coach-teacher-handoff"><span aria-hidden="true">解</span><b>科目老師完成診斷</b><i aria-hidden="true">→</i><span aria-hidden="true">記</span><b>筆記老師接手整理</b></div>
    <section class="coach-fixed-report is-note-teacher-report" aria-label="AI 筆記老師分析">
      <div class="coach-fixed-report-heading coach-report-teacher-heading"><span class="coach-teacher-avatar" aria-hidden="true">記</span><div><p class="section-label">AI NOTE TEACHER</p><h2>AI 筆記老師的整理</h2><p>留下口訣、比較、時間軸與會考常考內容。</p></div></div>
      <div class="coach-report-section-list coach-note-fixed-list">${COACH_FIXED_HEADINGS.slice(5).map((heading, index) => `<article><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(sections[index + 5])}</p></article>`).join("")}</div>
      ${buildNoteTeacherReport(subject, question, method, comparison)}
    </section>`;
  }

  function buildCoachPrompt(subjectId) {
    const subject = SUBJECTS[subjectId];
    const prompt = SUBJECT_PROMPTS[subjectId];
    if (!subject || !prompt) return "";
    return `你是國中教育會考${subject.name}科教練。不要先公布答案。完成引導與重新作答後，固定依序回答：${COACH_FIXED_HEADINGS.join("、")}。另外分析：${prompt.fields.map((field) => `■ ${field}`).join("、")}。最後整理：${prompt.summaries.map((label) => `【${label}】`).join("、")}。內容使用國中生能理解的繁體中文，簡潔、有證據，且每次都說明下次如何避免再犯。`;
  }

  function sessionHeader(step, subject, question) {
    const labels = ["看考點", "找錯因", "拿提示", "再答一次", "收進筆記"];
    const noteTeacher = step === 5;
    return `<div class="coach-session-header">
      <div><p class="section-label">${escapeHtml(subject.name)}・${escapeHtml(question.unit)}</p><h2>${labels[step - 1]}</h2><span class="coach-active-teacher ${noteTeacher ? "is-note" : ""}">${noteTeacher ? "記　AI 筆記老師" : "解　AI 科目老師"}</span></div>
      <span>第 ${step}／5 步</span>
    </div><div class="coach-stepper" aria-label="陪練進度">${labels.map((label, index) => `<i class="${index + 1 <= step ? "is-complete" : ""}"><b>${index + 1}</b><small>${label}</small></i>`).join("")}</div>`;
  }

  function renderStageOne(subject, question) {
    return `${sessionHeader(1, subject, question)}
      <div class="coach-bubble coach-bubble-primary"><span class="coach-avatar" aria-hidden="true">解</span><div><strong>科目老師先做命題分析：這題真正考的是</strong><p>${escapeHtml(question.ability || `${question.unit}的核心觀念與判斷能力`)}</p></div></div>
      <article class="coach-question-review">${renderQuestionStem(question)}<p class="coach-gentle-hint">先回想你剛才依據什麼線索作答，不需要急著證明自己對或錯。</p></article>
      <div class="coach-stage-actions"><button class="button button-primary" type="button" data-coach-next="reason">我看懂考點了，找找錯因</button></div>`;
  }

  function renderStageTwo(subject, question) {
    const selectedIndex = state.session.selectedIndex;
    return `${sessionHeader(2, subject, question)}
      <div class="coach-bubble"><span class="coach-avatar" aria-hidden="true">解</span><div><strong>科目老師想先找出：你真正卡在哪裡？</strong><p>${Number.isInteger(selectedIndex) ? `你剛才選了 ${String.fromCharCode(65 + selectedIndex)}，先不用判斷對錯，想一想當時的理由。` : "沒有標準答案，選最接近自己當時想法的一項。"}</p></div></div>
      <div class="coach-reason-grid">${REASONS.map((reason) => `<button type="button" data-coach-reason="${reason.id}"><span>${escapeHtml(reason.label)}</span><small>${escapeHtml(reason.detail)}</small></button>`).join("")}</div>
      <button class="text-button" type="button" data-coach-back="1">← 回到考點</button>`;
  }

  function renderStageThree(subject, question) {
    const comparison = getComparison(question);
    const method = SUBJECT_METHODS[subject.id] || SUBJECT_METHODS.chinese;
    return `${sessionHeader(3, subject, question)}
      <div class="coach-bubble coach-bubble-primary"><span class="coach-avatar" aria-hidden="true">解</span><div><strong>你選的錯因：${escapeHtml(getReasonLabel(state.session.reason))}</strong><p>${escapeHtml(question.commonError || "這類題目常在關鍵限制、觀念連結或選項比較時失去判斷依據。")}</p></div></div>
      <div class="coach-guidance-grid">
        <article><span aria-hidden="true">線</span><div><h3>這次先抓這個線索</h3><p>${escapeHtml(method.clue)}</p></div></article>
        <article><span aria-hidden="true">盾</span><div><h3>下次如何避免</h3><p>${escapeHtml(getAvoidance(state.session.reason))}</p></div></article>
      </div>
      <article class="coach-comparison-card"><p class="section-label">EASILY CONFUSED</p><h3>${escapeHtml(comparison.title)}</h3><div><span>${escapeHtml(comparison.left)}</span><b>要改成</b><span>${escapeHtml(comparison.right)}</span></div></article>
      <div class="coach-stage-actions"><button class="button button-secondary" type="button" data-coach-back="2">回頭修改錯因</button><button class="button button-primary" type="button" data-coach-next="retry">帶著提示，重新答一次</button></div>`;
  }

  function renderStageFour(subject, question) {
    const selected = state.session.retryIndex;
    if (question.openResponse) {
      const understanding = state.session.understanding;
      return `${sessionHeader(4, subject, question)}
        <div class="coach-bubble"><span class="coach-avatar" aria-hidden="true">解</span><div><strong>科目老師示範解題後，請先做一次自我檢查。</strong><p>不要只說「看懂了」，試著在心裡說出題目條件、使用觀念與下一步。</p></div></div>
        <article class="coach-question-review">${renderQuestionStem(question)}
          <div class="coach-open-solution"><span>正確答案／觀念</span><p>${escapeHtml(question.correctAnswerText || question.explanation)}</p></div>
          <div class="coach-understanding-grid">
            <button class="${understanding === "ready" ? "is-selected" : ""}" type="button" data-coach-understanding="ready"><strong>我能說出解法</strong><small>我知道考點、步驟與下次怎麼檢查</small></button>
            <button class="${understanding === "more" ? "is-selected" : ""}" type="button" data-coach-understanding="more"><strong>我還需要再複習</strong><small>先把這題收進重點筆記，之後再回來</small></button>
          </div>
        </article>
        <div class="coach-stage-actions"><button class="button button-secondary" type="button" data-coach-back="3">再看一次提示</button><button class="button button-primary" type="button" data-coach-submit-retry ${understanding ? "" : "disabled"}>交給 AI 筆記老師整理</button></div>`;
    }
    return `${sessionHeader(4, subject, question)}
      <div class="coach-bubble"><span class="coach-avatar" aria-hidden="true">解</span><div><strong>現在重新判斷一次。</strong><p>不要只找看起來最熟悉的選項；要能指出題幹中的證據。</p></div></div>
      <article class="coach-question-review">${renderQuestionStem(question)}<div class="coach-option-list">${question.options.map((option, index) => `<button class="${selected === index ? "is-selected" : ""}" type="button" data-coach-retry-index="${index}" aria-pressed="${selected === index}"><span>${String.fromCharCode(65 + index)}</span><strong>${escapeHtml(option)}</strong></button>`).join("")}</div></article>
      <div class="coach-stage-actions"><button class="button button-secondary" type="button" data-coach-back="3">再看一次提示</button><button class="button button-primary" type="button" data-coach-submit-retry ${Number.isInteger(selected) ? "" : "disabled"}>確認我的新判斷</button></div>`;
  }

  function renderStageFive(subject, question) {
    const correct = state.session.retryCorrect;
    const answerLetter = Number.isInteger(question.answer) ? String.fromCharCode(65 + question.answer) : "";
    const answerText = question.openResponse ? question.correctAnswerText : `${answerLetter}．${question.options[question.answer]}`;
    return `${sessionHeader(5, subject, question)}
      <div class="coach-result-banner ${correct ? "is-success" : "is-review"}"><span aria-hidden="true">記</span><div><p class="section-label">AI NOTE TEACHER</p><h2>${correct ? "科目老師教完了，現在把方法留下來。" : "先整理目前學會的部分，下次再接著練。"}</h2><p>${correct ? "筆記老師會把這題整理成考點、比較、口訣與會考重點。" : "還不熟也沒關係；知道自己卡在哪裡，就是下一次複習的起點。"}</p></div></div>
      <article class="coach-final-explanation">
        <div class="coach-answer-key"><span>完整解析</span><strong>${escapeHtml(answerText)}</strong></div>
        <p>${escapeHtml(question.explanation)}</p>
      </article>
      ${buildFixedReport(subject, question)}
      ${renderLearningActions(subject, question)}
      <div class="coach-stage-actions coach-finish-actions">
        ${correct && state.session.source === "wrong" ? `<button class="button button-secondary" type="button" data-coach-mastered>標記這題已掌握</button>` : `<button class="button button-secondary" type="button" data-app-view="wrong">回錯題本複習</button>`}
        <button class="button button-primary" type="button" data-coach-another>再陪我看一題</button>
      </div>`;
  }

  // 分析完成後才詢問學生是否收藏，避免每張照片都自動堆進錯題本。
  function renderLearningActions(subject, question) {
    const session = state.session;
    const canSave = session.source === "photo";
    const alreadySaved = ["wrong", "digital"].includes(session.source) || Boolean(session.savedDigitalId);
    const saveTitle = session.source === "wrong" ? "已在題庫錯題本" : alreadySaved ? "已在數位錯題本" : canSave ? "存入數位錯題本" : "示範題不需收藏";
    const saveDescription = session.source === "wrong" ? "原題會繼續保留，直到你標記已掌握。" : alreadySaved ? "之後可以依複習日期再次練習。" : canSave ? "保留照片、AI 重點與下次提醒。" : "可以建立相似題，將觀念帶回五科練習。";
    const similarCount = Array.isArray(question.similarQuestions) ? question.similarQuestions.length : 0;
    return `<section class="coach-learning-actions" aria-label="分析完成後的學習選擇">
      <div class="coach-learning-actions-heading"><p class="section-label">YOU DECIDE THE NEXT STEP</p><h2>這次分析，要怎麼繼續使用？</h2><p>收藏與相似題都由你決定；未收藏的拍照題不會自動出現在錯題本。</p></div>
      <div class="coach-learning-action-grid">
        <article class="${alreadySaved ? "is-complete" : ""}"><span aria-hidden="true">簿</span><div><h3>${saveTitle}</h3><p>${saveDescription}</p></div>${canSave ? `<button class="button button-secondary button-small" type="button" data-coach-save-wrong ${alreadySaved ? "disabled" : ""}>${alreadySaved ? "已收藏" : "選擇收藏"}</button>` : `<b>${alreadySaved ? "已收藏" : "不用收藏"}</b>`}</article>
        <article class="${session.similarAdded ? "is-complete" : ""}"><span aria-hidden="true">練</span><div><h3>加入 ${escapeHtml(subject.name)} AI 加強題本</h3><p>${similarCount ? `AI 已設計 ${similarCount} 題同觀念題。` : "若 AI 未附題目，會先安排同單元題庫練習。"}</p></div><button class="button button-primary button-small" type="button" data-coach-build-similar ${session.similarAdded ? "disabled" : ""}>${session.similarAdded ? `已加入 ${session.similarAdded} 題` : "建立相似題練習"}</button></article>
      </div>
      ${session.learningActionStatus ? `<p class="coach-learning-action-status" role="status">${escapeHtml(session.learningActionStatus)}</p>` : ""}
    </section>`;
  }

  function renderSession() {
    const panel = $("#coach-session-panel");
    const session = state.session;
    if (!session) return;
    const subject = SUBJECTS[session.subjectId];
    const question = getSessionQuestion(session);
    if (!subject || !question) {
      state.session = null;
      render();
      return;
    }
    if (session.stage === 1) panel.innerHTML = renderStageOne(subject, question);
    if (session.stage === 2) panel.innerHTML = renderStageTwo(subject, question);
    if (session.stage === 3) panel.innerHTML = renderStageThree(subject, question);
    if (session.stage === 4) panel.innerHTML = renderStageFour(subject, question);
    if (session.stage === 5) panel.innerHTML = renderStageFive(subject, question);
  }

  function startSession(subjectId, questionId, selectedIndex) {
    const question = findQuestion(subjectId, questionId);
    if (!question) return;
    const wrong = readWrongQuestions().find((item) => item.subjectId === subjectId && item.questionId === questionId);
    state.session = {
      source: wrong ? "wrong" : "sample",
      subjectId,
      questionId,
      selectedIndex: Number.isInteger(selectedIndex) ? selectedIndex : Number.isInteger(wrong?.selectedIndex) ? wrong.selectedIndex : null,
      reason: null,
      retryIndex: null,
      retryCorrect: null,
      stage: 1,
      recorded: false
    };
    renderQuestionList();
    renderSession();
    $("#coach-session-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startDigitalSession(digitalId) {
    const item = findDigitalQuestion(digitalId);
    const question = normalizeDigitalQuestion(item);
    if (!item || !question) return;
    state.source = "digital";
    state.session = {
      source: "digital",
      subjectId: item.subjectId,
      questionId: question.id,
      digitalId: item.id,
      selectedIndex: null,
      reason: null,
      retryIndex: null,
      understanding: null,
      retryCorrect: null,
      stage: 1,
      recorded: false
    };
    renderQuestionList();
    renderSession();
    $("#coach-session-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startPhotoSession(subjectId, response, formValues) {
    const sourceQuestion = response?.question || response || {};
    const options = Array.isArray(sourceQuestion.options) ? sourceQuestion.options.map(String) : [];
    const answer = Number.isInteger(sourceQuestion.answer) ? sourceQuestion.answer : null;
    const question = {
      id: `photo:${Date.now()}`,
      unit: sourceQuestion.unit || formValues.unit,
      ability: sourceQuestion.ability || `${formValues.unit}的命題考點與解題能力`,
      difficulty: Number(sourceQuestion.difficulty) || 4,
      prompt: sourceQuestion.prompt || formValues.questionText || "照片中的題目",
      context: sourceQuestion.context || "學生拍照詢問",
      options,
      answer,
      correctAnswerText: sourceQuestion.correctAnswerText || sourceQuestion.correctAnswer || "請依 AI 科目老師的解析重新說明觀念",
      explanation: sourceQuestion.explanation || "AI 已完成題目辨識；請依考點、題目條件與解題步驟重新核對。",
      commonError: sourceQuestion.commonError || formValues.studentThinking || "需要先確認題目限制與使用的核心觀念。",
      imageData: state.photoImage,
      similarQuestions: Array.isArray(response?.similarQuestions) ? response.similarQuestions : Array.isArray(sourceQuestion.similarQuestions) ? sourceQuestion.similarQuestions : [],
      aiAnalysis: response?.analysis || sourceQuestion.analysis || null,
      openResponse: options.length < 2 || !Number.isInteger(answer)
    };
    state.session = {
      source: "photo",
      subjectId,
      questionId: question.id,
      question,
      selectedIndex: null,
      reason: null,
      retryIndex: null,
      understanding: null,
      retryCorrect: null,
      stage: 1,
      recorded: false,
      savedDigitalId: "",
      similarAdded: 0,
      learningActionStatus: ""
    };
    state.photoBusy = false;
    state.photoStatus = "";
    renderQuestionList();
    renderSession();
    $("#coach-session-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function completeSession() {
    const session = state.session;
    const question = getSessionQuestion(session);
    if (!question) return;
    session.retryCorrect = question.openResponse ? session.understanding === "ready" : session.retryIndex === question.answer;
    session.stage = 5;
    if (!session.recorded) {
      state.records.unshift({
        id: `coach-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        subjectId: session.subjectId,
        questionId: session.questionId,
        digitalId: session.digitalId || "",
        source: session.source,
        reason: session.reason,
        firstAnswer: Number.isInteger(session.selectedIndex) ? session.selectedIndex : null,
        retryAnswer: session.retryIndex,
        retryCorrect: session.retryCorrect,
        createdAt: new Date().toISOString()
      });
      session.recorded = true;
      saveRecords();
    }
    renderStats();
    renderSession();
  }

  function markMastered() {
    const session = state.session;
    const remaining = readWrongQuestions().filter((item) => !(item.subjectId === session.subjectId && item.questionId === session.questionId));
    try {
      localStorage.setItem(WRONG_KEY, JSON.stringify(remaining));
      window.ExamMateLearning?.renderWrongQuestions();
      state.session.source = "sample";
      const button = $("[data-coach-mastered]");
      if (button) {
        button.textContent = "已標記為掌握";
        button.disabled = true;
      }
      renderQuestionList();
      notify("已標記為掌握，這次找到的方法會留在教練紀錄中。");
    } catch (error) {
      notify("目前無法更新錯題狀態，請稍後再試。", true);
    }
  }

  function saveCurrentToNotebook() {
    const session = state.session;
    const question = getSessionQuestion(session);
    const subject = SUBJECTS[session?.subjectId];
    if (!session || !question || !subject || session.source !== "photo") return;
    const itemId = window.ExamMateDigitalNotebook?.saveFromCoach?.({
      coachQuestionId: question.id,
      subjectId: subject.id,
      unit: question.unit,
      source: "拍照 AI 分析",
      reason: session.reason,
      question: question.prompt,
      myAnswer: state.photoDraft.studentThinking || question.commonError || "",
      correctAnswer: question.correctAnswerText || question.explanation,
      explanation: question.explanation,
      reflection: getAvoidance(session.reason),
      imageData: question.imageData || ""
    });
    if (!itemId) {
      session.learningActionStatus = "目前無法收藏這題，請確認瀏覽器儲存空間後再試。";
      return renderSession();
    }
    session.savedDigitalId = itemId;
    session.learningActionStatus = "已收藏到 AI 數位錯題本，系統會安排 3 天後再複習。";
    renderQuestionList();
    renderSession();
  }

  function buildSimilarPractice() {
    const session = state.session;
    const question = getSessionQuestion(session);
    const subject = SUBJECTS[session?.subjectId];
    if (!session || !question || !subject || session.similarAdded) return;
    let candidates = Array.isArray(question.similarQuestions) ? question.similarQuestions : [];
    if (!candidates.length) {
      candidates = subject.questions
        .filter((item) => item.id !== question.id && (item.unit === question.unit || item.unitId === question.unitId))
        .slice(0, 3);
    }
    if (!candidates.length) {
      candidates = subject.questions.filter((item) => item.id !== question.id && Number(item.difficulty || 0) >= 3).slice(0, 3);
    }
    const added = window.ExamMateLearning?.addSimilarQuestions?.({
      subjectId: subject.id,
      unit: question.unit,
      sourceQuestionId: question.id,
      questions: candidates
    }) || 0;
    session.similarAdded = added;
    session.learningActionStatus = added
      ? `已加入 ${subject.name}的 AI 加強題本，共 ${added} 題；回到五科學習即可開始。`
      : "目前沒有可加入的相似題；待 AI 後端回傳題目後即可建立。";
    renderSession();
  }

  function chooseAnother() {
    state.session = null;
    renderQuestionList();
    $("#coach-session-panel").innerHTML = `<div class="coach-empty-state"><span class="coach-avatar" aria-hidden="true">解</span><p class="section-label">READY FOR THE NEXT ONE</p><h2>很好，再選一題繼續練習。</h2><p>科目老師會先陪你解題，筆記老師再把重點留下來。</p></div>`;
    $("#coach-question-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function render() {
    loadRecords();
    $("#coach-data-alert").hidden = !state.dataDamaged;
    renderStats();
    renderQuestionList();
    const config = typeof examConfig !== "undefined" ? examConfig.aiCoach : null;
    if (config?.customQuestionEnabled && config.endpoint) {
      $("#coach-custom-status").textContent = "安全後端已連線；可以拍照詢問，照片不會直接帶著 API Key 從瀏覽器送出。";
    }
    if (state.session) renderSession();
  }

  function open(subjectId, questionId, selectedIndex) {
    state.source = "wrong";
    window.ExamMateLearning?.goToView("coach");
    startSession(subjectId, questionId, selectedIndex);
  }

  function openDigital(digitalId) {
    const item = findDigitalQuestion(digitalId);
    if (!item) return notify("找不到這筆數位錯題，請重新整理錯題本。", true);
    state.source = "digital";
    window.ExamMateLearning?.goToView("coach");
    startDigitalSession(digitalId);
  }

  function openPhoto() {
    state.source = "photo";
    state.session = null;
    window.ExamMateLearning?.goToView("coach");
    renderQuestionList();
    $("#coach-question-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updatePhotoDraft(form = $("#coach-photo-form")) {
    if (!form || typeof FormData !== "function") return;
    const values = new FormData(form);
    state.photoDraft = {
      subjectId: String(values.get("subjectId") || "chinese"),
      unit: String(values.get("unit") || "").trim(),
      questionText: String(values.get("questionText") || "").trim(),
      studentThinking: String(values.get("studentThinking") || "").trim()
    };
  }

  function setPhotoStatus(message, isError = false) {
    state.photoStatus = message;
    state.photoStatusError = isError;
    const status = $(".coach-photo-status");
    if (status) {
      status.textContent = message;
      status.classList.toggle("is-error", isError);
    }
  }

  function compressPhoto(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) return reject(new Error("請選擇圖片檔案。"));
      if (file.size > 12 * 1024 * 1024) return reject(new Error("圖片超過 12MB，請先裁切或改用較小的照片。"));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("無法讀取這張圖片。"));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("圖片格式無法使用。"));
        image.onload = () => {
          const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.76));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoFile(file) {
    try {
      updatePhotoDraft();
      setPhotoStatus("正在整理照片…");
      state.photoImage = await compressPhoto(file);
      state.photoStatus = "照片已準備好；請確認科目與單元。";
      state.photoStatusError = false;
      renderQuestionList();
    } catch (error) {
      setPhotoStatus(error.message || "這張照片無法使用。", true);
    }
  }

  async function submitPhotoQuestion(event) {
    event.preventDefault();
    const form = event.target;
    updatePhotoDraft(form);
    const values = state.photoDraft;
    if (!values.unit) return setPhotoStatus("請先選擇科目並填寫單元或範圍。", true);
    if (!state.photoImage && !values.questionText) return setPhotoStatus("請拍下題目，或貼上題幹文字。", true);
    const config = typeof examConfig !== "undefined" ? examConfig.aiCoach : null;
    if (!config?.customQuestionEnabled || !config.endpoint) {
      return setPhotoStatus("拍照入口已可使用，但目前尚未連接安全 AI 後端，因此不會假裝看懂照片。請先使用題庫錯題或數位錯題本；完成後端設定即可啟用辨識。", true);
    }
    state.photoBusy = true;
    const submit = form.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = true;
      submit.textContent = "AI 正在讀題…";
    }
    setPhotoStatus("AI 科目老師正在辨認題幹、圖表與選項…");
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "exam-coach-photo-question",
          subjectId: values.subjectId,
          unit: values.unit,
          questionText: values.questionText,
          studentThinking: values.studentThinking,
          imageData: state.photoImage,
          prompt: `${buildCoachPrompt(values.subjectId)} 請回傳 JSON：question 為辨識後題目；analysis 包含 fixedSections、subjectFields、noteToolkit、summaries；similarQuestions 為三題同考點、不同情境的四選一原創題。每題包含 id、unit、ability、difficulty、prompt、options、answer（0 到 3）、explanation、commonError。`
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `照片分析服務暫時無法使用（${response.status}）。`);
      if (!payload || typeof payload !== "object") throw new Error("照片分析結果格式不正確。");
      startPhotoSession(values.subjectId, payload, values);
    } catch (error) {
      state.photoBusy = false;
      if (submit) {
        submit.disabled = false;
        submit.textContent = "請 AI 科目老師分析";
      }
      setPhotoStatus(error.message || "照片分析失敗，請稍後再試。", true);
    }
  }

  function handleClick(event) {
    const source = event.target.closest("[data-coach-source]");
    if (source) {
      state.source = source.dataset.coachSource;
      state.session = null;
      renderQuestionList();
      return;
    }
    const questionButton = event.target.closest("[data-coach-question]");
    if (questionButton) return startSession(questionButton.dataset.coachSubject, questionButton.dataset.coachQuestion, null);
    const digitalQuestion = event.target.closest("[data-coach-digital-question]");
    if (digitalQuestion) return startDigitalSession(digitalQuestion.dataset.coachDigitalQuestion);
    if (event.target.closest("[data-coach-remove-photo]")) {
      updatePhotoDraft();
      state.photoImage = "";
      state.photoStatus = "照片已移除。";
      state.photoStatusError = false;
      return renderQuestionList();
    }

    if (event.target.closest('[data-coach-next="reason"]')) {
      state.session.stage = 2;
      return renderSession();
    }
    const reason = event.target.closest("[data-coach-reason]");
    if (reason) {
      state.session.reason = reason.dataset.coachReason;
      state.session.stage = 3;
      return renderSession();
    }
    if (event.target.closest('[data-coach-next="retry"]')) {
      state.session.stage = 4;
      return renderSession();
    }
    const back = event.target.closest("[data-coach-back]");
    if (back) {
      state.session.stage = Number(back.dataset.coachBack);
      return renderSession();
    }
    const retry = event.target.closest("[data-coach-retry-index]");
    if (retry) {
      state.session.retryIndex = Number(retry.dataset.coachRetryIndex);
      return renderSession();
    }
    const understanding = event.target.closest("[data-coach-understanding]");
    if (understanding) {
      state.session.understanding = understanding.dataset.coachUnderstanding;
      return renderSession();
    }
    if (event.target.closest("[data-coach-submit-retry]")) return completeSession();
    if (event.target.closest("[data-coach-save-wrong]")) return saveCurrentToNotebook();
    if (event.target.closest("[data-coach-build-similar]")) return buildSimilarPractice();
    if (event.target.closest("[data-coach-mastered]")) return markMastered();
    if (event.target.closest("[data-coach-another]")) return chooseAnother();
    if (event.target.closest("#reset-coach-data")) {
      if (!window.confirm("要重新建立 AI 教練紀錄嗎？其他學習資料不會被刪除。")) return;
      localStorage.removeItem(COACH_KEY);
      state.records = [];
      state.dataDamaged = false;
      render();
      notify("AI 教練紀錄已重新建立。");
    }
  }

  function init() {
    document.addEventListener("click", handleClick);
    document.addEventListener("change", (event) => {
      if (event.target.matches?.("#coach-photo-file")) {
        const file = event.target.files?.[0];
        if (file) handlePhotoFile(file);
      }
    });
    document.addEventListener("submit", (event) => {
      if (event.target.matches?.("#coach-photo-form")) submitPhotoQuestion(event);
    });
  }

  window.ExamMateAICoach = { render, open, openDigital, openPhoto, getPrompt: buildCoachPrompt };
  document.addEventListener("DOMContentLoaded", init);
})();
