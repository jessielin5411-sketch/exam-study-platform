/* ExamMate 靜態網站快速驗證工具。 */
const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("index.html", "utf8");
const aiCoachSource = fs.readFileSync("ai-coach.js", "utf8");
const learningSource = fs.readFileSync("learning.js", "utf8");
const historicalExamSource = fs.readFileSync("historical-exam-bank.js", "utf8");
const aiCoachPromptSource = aiCoachSource.slice(
  aiCoachSource.indexOf("const SUBJECT_PROMPTS ="),
  aiCoachSource.indexOf("const UNIT_COMPARISONS =")
);
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
const scriptSources = [...html.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1]);
const missingScripts = scriptSources.filter((source) => !/^https?:\/\//.test(source) && !fs.existsSync(source.split(/[?#]/)[0]));
const historicalYears = [...new Set([...historicalExamSource.matchAll(/referenceYear:(10[89]|11[0-4])/g)].map((match) => Number(match[1])))].sort((a, b) => a - b);

const css = fs.readFileSync("style.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const desktopBottomNavigationHidden = /\.bottom-navigation\s*\{[^}]*display:\s*none\s*;[^}]*\}/s.test(css);
const mobileBottomNavigationVisible = /@media\s*\(max-width:\s*980px\)[\s\S]*?\.bottom-navigation:not\(\[hidden\]\)\s*\{[^}]*display:\s*grid\s*;[^}]*\}/s.test(css);
let cssBraceBalance = 0;
let cssMinimumBalance = 0;
for (const character of css) {
  if (character === "{") cssBraceBalance += 1;
  if (character === "}") cssBraceBalance -= 1;
  cssMinimumBalance = Math.min(cssMinimumBalance, cssBraceBalance);
}

function testStudyPlan(savedValue) {
  let ready;
  let latestSaved = null;
  const storage = savedValue === undefined ? null : JSON.stringify(savedValue);
  const sandbox = {
    console,
    localStorage: {
      getItem: (key) => key === "examMate.studyPlan.v1" ? storage : null,
      setItem: (key, value) => { if (key === "examMate.studyPlan.v1") latestSaved = JSON.parse(value); },
      removeItem: () => {}
    },
    document: {
      querySelector: () => null,
      addEventListener: (event, callback) => { if (event === "DOMContentLoaded") ready = callback; }
    }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("study-plan.js", "utf8"), sandbox);
  ready();
  sandbox.ExamMateStudyPlan.render();
  sandbox.ExamMateStudyPlan.setWeekOffset(1);
  if (savedValue === undefined) {
    sandbox.ExamMateStudyPlan.applyStrategy("balanced");
    if (!latestSaved || latestSaved.items.length !== 21) throw new Error("建議排程沒有產生預期的 21 個時段");
  }
}

testStudyPlan(undefined);
testStudyPlan({
  items: [{
    id: "plan-test", day: 2, type: "study", subject: "數學",
    title: "練習一元二次方程", startTime: "19:00", duration: 30, note: ""
  }],
  completed: {}
});

function testDigitalNotebook(savedValue) {
  let ready;
  let storage = savedValue === undefined ? null : JSON.stringify(savedValue);
  const sandbox = {
    console,
    localStorage: {
      getItem: (key) => key === "examMate.digitalWrongNotebook.v1" ? storage : null,
      setItem: (key, value) => { if (key === "examMate.digitalWrongNotebook.v1") storage = value; },
      removeItem: () => {}
    },
    document: {
      querySelector: () => null,
      addEventListener: (event, callback) => { if (event === "DOMContentLoaded") ready = callback; }
    },
    setTimeout: () => 0,
    clearTimeout: () => {}
  };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("digital-wrong-notebook.js", "utf8"), sandbox);
  ready();
  sandbox.ExamMateDigitalNotebook.render();
  if (savedValue === undefined) {
    const savedId = sandbox.ExamMateDigitalNotebook.saveFromCoach({
      coachQuestionId: "photo-test", subjectId: "math", unit: "代數", reason: "concept",
      question: "照片題目", correctAnswer: "先建立式子再檢查限制。", imageData: ""
    });
    const saved = JSON.parse(storage || "[]");
    if (!savedId || saved.length !== 1 || !saved[0].aiAnalyzed || saved[0].reason !== "觀念不清") {
      throw new Error("AI 分析結果無法選擇收藏到數位錯題本");
    }
  }
}

testDigitalNotebook(undefined);
testDigitalNotebook([{
  id: "digital-test",
  subjectId: "math",
  unit: "代數",
  source: "模擬考",
  reason: "觀念不清",
  question: "一元二次方程題型",
  myAnswer: "略",
  correctAnswer: "先整理為標準式再判斷。",
  reflection: "先確認係數。",
  status: "reviewing",
  createdAt: "2026-07-20T10:00:00.000Z",
  updatedAt: "2026-07-21T10:00:00.000Z",
  nextReviewDate: "2026-07-24",
  reviewCount: 1,
  imageData: ""
}]);

function testWeeklyReminder() {
  let ready;
  const values = new Map([["examJourney.profile.v1", JSON.stringify({ studentName: "測試同學" })]]);
  const dialog = {
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; },
    addEventListener() {}
  };
  const dashboard = { hidden: false };
  const dateRange = { textContent: "" };
  const button = { addEventListener() {} };
  const sandbox = {
    console,
    localStorage: {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key)
    },
    document: {
      querySelector: (selector) => ({
        "#weekly-plan-reminder-dialog": dialog,
        "#dashboard-view": dashboard,
        "#weekly-reminder-date-range": dateRange,
        "#arrange-next-week-button": button,
        "#snooze-weekly-plan-reminder": button,
        "#close-weekly-plan-reminder": button,
        "#dismiss-weekly-plan-reminder": button
      })[selector] || null,
      addEventListener: (event, callback) => { if (event === "DOMContentLoaded") ready = callback; }
    },
    setTimeout: () => 1,
    clearTimeout: () => {},
    Date
  };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("weekly-plan-reminder.js", "utf8"), sandbox);
  ready();
  const shown = sandbox.ExamMateWeeklyPlanReminder.check(new Date(2026, 6, 25, 20, 1));
  if (!shown || !dialog.open || !dateRange.textContent.includes("民國")) throw new Error("週六 20:00 提醒情境驗證失敗");
}

testWeeklyReminder();

function testAppearanceBackup() {
  let ready;
  const values = new Map([["examMate.appearance.v1", JSON.stringify("colorful")]]);
  const documentElement = { dataset: {} };
  const sandbox = {
    console,
    localStorage: {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key)
    },
    document: {
      documentElement,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: (event, callback) => { if (event === "DOMContentLoaded") ready = callback; }
    },
    setTimeout: () => 1,
    clearTimeout: () => {},
    Date
  };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("appearance-backup.js", "utf8"), sandbox);
  ready();
  if (documentElement.dataset.theme !== "colorful") throw new Error("繽紛版載入驗證失敗");
  sandbox.ExamMateAppearanceBackup.applyTheme("clean", true);
  if (documentElement.dataset.theme !== "clean" || JSON.parse(values.get("examMate.appearance.v1")) !== "clean") {
    throw new Error("清爽版切換驗證失敗");
  }
}

testAppearanceBackup();

function testAICoach() {
  let ready;
  let clickHandler;
  const values = new Map();
  function element() {
    return {
      hidden: false, textContent: "", innerHTML: "", disabled: false,
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {}, scrollIntoView() {}
    };
  }
  const elements = {
    "#coach-data-alert": element(),
    "#coach-session-count": element(),
    "#coach-mastered-count": element(),
    "#coach-focus-label": element(),
    "#coach-question-count": element(),
    "#coach-question-list": element(),
    "#coach-session-panel": element(),
    "#coach-custom-status": element(),
    "#toast": element()
  };
  const sandbox = {
    console,
    localStorage: {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key)
    },
    document: {
      querySelector: (selector) => elements[selector] || null,
      querySelectorAll: () => [],
      addEventListener: (event, callback) => {
        if (event === "DOMContentLoaded") ready = callback;
        if (event === "click") clickHandler = callback;
      }
    },
    setTimeout: () => 1,
    clearTimeout: () => {},
    confirm: () => true,
    ExamMateLearning: { goToView() {}, renderWrongQuestions() {}, addSimilarQuestions: () => 3 },
    ExamMateDigitalNotebook: { saveFromCoach: () => "saved-digital-test" },
    examConfig: { aiCoach: { customQuestionEnabled: false, endpoint: "" } },
    examMateQuestionBank: {
      chinese: {
        id: "chinese", name: "國文", glyph: "文", theme: "chinese",
        questions: [
          { id: "coach-test", unit: "閱讀理解", ability: "找出文本證據", difficulty: 4, prompt: "測試題", options: ["甲", "乙", "丙", "丁"], answer: 1, explanation: "測試解析", commonError: "只憑印象作答" },
          { id: "coach-similar", unit: "閱讀理解", ability: "轉移文本證據", difficulty: 4, prompt: "相似測試題", options: ["甲", "乙", "丙", "丁"], answer: 2, explanation: "相似題解析", commonError: "沒有核對文本" }
        ]
      },
      english: { id: "english", name: "英文", glyph: "En", theme: "english", questions: [] },
      math: { id: "math", name: "數學", glyph: "數", theme: "math", questions: [] },
      science: { id: "science", name: "自然", glyph: "理", theme: "science", questions: [] },
      social: { id: "social", name: "社會", glyph: "社", theme: "social", questions: [] }
    }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("ai-coach.js", "utf8"), sandbox);
  ready();
  if (!sandbox.ExamMateAICoach || typeof sandbox.ExamMateAICoach.render !== "function" || typeof sandbox.ExamMateAICoach.open !== "function" || typeof sandbox.ExamMateAICoach.openDigital !== "function" || typeof sandbox.ExamMateAICoach.openPhoto !== "function" || typeof sandbox.ExamMateAICoach.getPrompt !== "function") {
    throw new Error("AI 教練初始化失敗");
  }
  sandbox.ExamMateAICoach.render();
  values.set("examMate.wrongQuestions.v1", JSON.stringify([{ subjectId: "chinese", questionId: "coach-test", selectedIndex: 0, wrongCount: 1 }]));
  sandbox.ExamMateAICoach.open("chinese", "coach-test", 0);
  if (!elements["#coach-session-panel"].innerHTML.includes("第 1／5 步") || elements["#coach-session-panel"].innerHTML.includes("完整解析")) {
    throw new Error("AI 教練第一步不符合先診斷、後解析原則");
  }
  function click(selector, dataset = {}) {
    clickHandler({ target: { closest: (query) => query === selector ? { dataset } : null } });
  }
  click('[data-coach-next="reason"]');
  click("[data-coach-reason]", { coachReason: "reading" });
  click('[data-coach-next="retry"]');
  click("[data-coach-retry-index]", { coachRetryIndex: "1" });
  if (elements["#coach-session-panel"].innerHTML.includes("完整解析")) throw new Error("AI 教練重答前提早顯示答案");
  click("[data-coach-submit-retry]");
  if (!elements["#coach-session-panel"].innerHTML.includes("第 5／5 步") || !elements["#coach-session-panel"].innerHTML.includes("完整解析")) {
    throw new Error("AI 教練完成重答後沒有產生解析與筆記");
  }
  const finalReport = elements["#coach-session-panel"].innerHTML;
  const fixedHeadings = ["① 本題考什麼？", "② 我為什麼會錯？", "③ 正確觀念", "④ 解題思考流程", "⑤ 命題老師真正想考的是？", "⑥ 一句記住它", "⑦ 易混淆比較", "⑧ 會考重點整理", "⑨ AI再提醒一次"];
  const chineseFields = ["■ 修辭", "■ 詞語", "■ 成語", "■ 文言文", "■ 閱讀理解", "■ 作者觀點", "■ 命題技巧", "【會考常考】", "【容易混淆】", "【閱讀技巧】"];
  if (!fixedHeadings.every((heading) => finalReport.includes(heading))) throw new Error("AI 教練固定九段診斷不完整");
  if (!chineseFields.every((heading) => finalReport.includes(heading))) throw new Error("AI 教練國文科專屬分析不完整");
  if (!finalReport.includes("建立 AI 相似題") || !finalReport.includes("已在題庫錯題本")) throw new Error("AI 分析完成後缺少收藏與相似題操作");
  click("[data-coach-build-similar]");
  if (!elements["#coach-session-panel"].innerHTML.includes("已加入 3 題")) throw new Error("AI 相似題沒有加入五科加強題本");
  const promptChecks = {
    chinese: ["■ 修辭", "■ 文言文", "【會考常考】", "【閱讀技巧】"],
    english: ["■ 文法", "■ 時態", "【會考文法】", "【重要單字】"],
    math: ["■ 建立式子", "■ 解題策略", "【公式】", "【秒殺技巧】"],
    social: ["■ 歷史背景", "■ 時間軸", "【比較表】", "【一句口訣】"],
    science: ["■ 原理", "■ 實驗", "【重點】", "【會考必考】"]
  };
  Object.entries(promptChecks).forEach(([subjectId, markers]) => {
    const prompt = sandbox.ExamMateAICoach.getPrompt(subjectId);
    if (!fixedHeadings.every((heading) => prompt.includes(heading)) || !markers.every((marker) => prompt.includes(marker))) {
      throw new Error(`AI 教練 ${subjectId} 科 Prompt 不完整`);
    }
  });
  values.set("examMate.digitalWrongNotebook.v1", JSON.stringify([{
    id: "digital-test", subjectId: "chinese", unit: "成語", source: "講義", reason: "觀念不清",
    question: "數位錯題測試", myAnswer: "依字面猜測", correctAnswer: "要回到語境判斷",
    reflection: "核對使用對象", imageData: "data:image/jpeg;base64,AAAA"
  }]));
  sandbox.ExamMateAICoach.openDigital("digital-test");
  if (!elements["#coach-session-panel"].innerHTML.includes("AI 科目老師") || !elements["#coach-session-panel"].innerHTML.includes("題目照片")) {
    throw new Error("數位錯題沒有正確送入 AI 科目老師");
  }
  click('[data-coach-next="reason"]');
  click("[data-coach-reason]", { coachReason: "concept" });
  click('[data-coach-next="retry"]');
  if (!elements["#coach-session-panel"].innerHTML.includes("正確答案／觀念") || !elements["#coach-session-panel"].innerHTML.includes("我能說出解法")) {
    throw new Error("數位錯題沒有使用開放式理解檢查");
  }
  click("[data-coach-understanding]", { coachUnderstanding: "ready" });
  click("[data-coach-submit-retry]");
  if (!elements["#coach-session-panel"].innerHTML.includes("AI 科目老師的診斷") ||
      !elements["#coach-session-panel"].innerHTML.includes("AI 筆記老師的整理") ||
      !["整理知識", "會考重點", "比較表", "一句口訣", "時間軸", "常考整理"].every((text) => elements["#coach-session-panel"].innerHTML.includes(text))) {
    throw new Error("雙 AI 老師的分工報告不完整");
  }
  sandbox.ExamMateAICoach.openPhoto();
  if (!elements["#coach-question-list"].innerHTML.includes("coach-photo-form") || !elements["#coach-question-list"].innerHTML.includes("照片辨識後端")) {
    throw new Error("拍照詢問題目來源沒有正確顯示");
  }
  const saved = JSON.parse(values.get("examMate.aiCoach.v1") || "[]");
  if (saved.length !== 2 || !saved.every((record) => record.retryCorrect === true) || saved[0].source !== "digital") throw new Error("AI 教練陪練紀錄沒有正確儲存");
}

testAICoach();

const result = {
  htmlIdCount: ids.length,
  duplicateIds,
  missingScripts,
  planViewCount: (html.match(/id="plan-view"/g) || []).length,
  planNavigationCount: (html.match(/data-app-view="plan"/g) || []).length,
  strategyCount: (html.match(/data-apply-strategy=/g) || []).length,
  printSheetCount: (html.match(/id="plan-print-sheet"/g) || []).length,
  wrongCenterPanelCount: (html.match(/class="wrong-center-panel/g) || []).length,
  digitalNotebookScriptCount: (html.match(/src="digital-wrong-notebook\.js(?:\?[^\"]*)?"/g) || []).length,
  weeklyReminderScriptCount: (html.match(/src="weekly-plan-reminder\.js"/g) || []).length,
  appearanceBackupScriptCount: (html.match(/src="appearance-backup\.js(?:\?[^\"]*)?"/g) || []).length,
  wrongIntegrationViewCount: (html.match(/id="wrong-view"/g) || []).length,
  legacyWrongLibraryViewCount: (html.match(/id="wrong-library-view"/g) || []).length,
  wrongIntegrationNavigationCount: (html.match(/data-app-view="wrong"/g) || []).length,
  retiredCoachNavigationCount: (html.match(/data-app-view="coach"/g) || []).length,
  aiCoachSourceCount: (html.match(/data-coach-source="(wrong|digital|photo)"/g) || []).length,
  aiTeacherCardCount: (html.match(/class="coach-teacher-card/g) || []).length,
  aiWrongFlowCount: (html.match(/class="ai-wrong-flow"/g) || []).length,
  aiPracticeCardCount: (fs.readFileSync("learning.js", "utf8").match(/class="subject-task-card subject-ai-card/g) || []).length,
  historicalExamScriptCount: (html.match(/src="historical-exam-bank\.js(?:\?[^\"]*)?"/g) || []).length,
  historicalExamQuestionCount: (historicalExamSource.match(/referenceYear:/g) || []).length,
  historicalYears,
  historicalPracticeActionCount: (learningSource.match(/data-start-historical/g) || []).length,
  retiredUnitReviewActionCount: (learningSource.match(/data-open-unit-review/g) || []).length,
  aiGeneratedSimilarRequestCount: (aiCoachSource.match(/requestAiSimilarPractice/g) || []).length,
  aiCoachScriptCount: (html.match(/src="ai-coach\.js(?:\?[^\"]*)?"/g) || []).length,
  aiNotePrintActionCount: (aiCoachSource.match(/data-coach-print-note/g) || []).length,
  aiCoachStepCount: (aiCoachSource.match(/function renderStage(One|Two|Three|Four|Five)\(/g) || []).length,
  aiCoachFixedHeadingCount: (aiCoachSource.match(/[①②③④⑤⑥⑦⑧⑨] /g) || []).length,
  aiCoachSubjectPromptCount: (aiCoachPromptSource.match(/^    (chinese|english|math|social|science): \{$/gm) || []).length,
  themeChoiceCount: (html.match(/data-theme-choice=/g) || []).length,
  planWeekSwitchCount: (html.match(/data-plan-week=/g) || []).length,
  cssBraceBalance,
  cssNeverNegative: cssMinimumBalance >= 0,
  desktopBottomNavigationHidden,
  mobileBottomNavigationVisible,
  studyPlanInitialization: "ok",
  digitalNotebookInitialization: "ok",
  weeklyReminderScenario: "ok",
  appearanceSwitching: "ok",
  aiCoachInitialization: "ok"
};

console.log(JSON.stringify(result, null, 2));
if (duplicateIds.length || missingScripts.length || result.planViewCount !== 1 ||
  result.strategyCount !== 3 || result.printSheetCount !== 1 ||
  result.wrongCenterPanelCount !== 2 || result.digitalNotebookScriptCount !== 1 ||
  result.weeklyReminderScriptCount !== 1 || result.planWeekSwitchCount !== 2 ||
  result.appearanceBackupScriptCount !== 1 || result.themeChoiceCount !== 2 ||
  result.wrongIntegrationViewCount !== 1 || result.legacyWrongLibraryViewCount !== 1 ||
  result.wrongIntegrationNavigationCount < 6 || result.retiredCoachNavigationCount !== 0 ||
  result.aiCoachSourceCount !== 3 || result.aiTeacherCardCount !== 2 ||
  result.aiWrongFlowCount !== 1 || result.aiPracticeCardCount !== 1 ||
  result.historicalExamScriptCount !== 1 || result.historicalExamQuestionCount < 35 ||
  result.historicalYears.join(",") !== "108,109,110,111,112,113,114" ||
  result.historicalPracticeActionCount !== 2 || result.retiredUnitReviewActionCount !== 0 ||
  result.aiGeneratedSimilarRequestCount < 2 ||
  result.aiCoachScriptCount !== 1 || result.aiNotePrintActionCount < 2 || result.aiCoachStepCount !== 5 ||
  result.aiCoachFixedHeadingCount !== 9 || result.aiCoachSubjectPromptCount < 5 ||
  cssBraceBalance !== 0 || !result.cssNeverNegative ||
  !result.desktopBottomNavigationHidden || !result.mobileBottomNavigationVisible) {
  process.exitCode = 1;
}
