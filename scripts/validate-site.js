/* ExamMate 靜態網站快速驗證工具。 */
const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("index.html", "utf8");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
const scriptSources = [...html.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1]);
const missingScripts = scriptSources.filter((source) => !fs.existsSync(source));

const css = fs.readFileSync("style.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
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
  const storage = savedValue === undefined ? null : JSON.stringify(savedValue);
  const sandbox = {
    console,
    localStorage: {
      getItem: (key) => key === "examMate.digitalWrongNotebook.v1" ? storage : null,
      setItem: () => {},
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

const result = {
  htmlIdCount: ids.length,
  duplicateIds,
  missingScripts,
  planViewCount: (html.match(/id="plan-view"/g) || []).length,
  planNavigationCount: (html.match(/data-app-view="plan"/g) || []).length,
  strategyCount: (html.match(/data-apply-strategy=/g) || []).length,
  printSheetCount: (html.match(/id="plan-print-sheet"/g) || []).length,
  wrongCenterPanelCount: (html.match(/class="wrong-center-panel/g) || []).length,
  digitalNotebookScriptCount: (html.match(/src="digital-wrong-notebook\.js"/g) || []).length,
  weeklyReminderScriptCount: (html.match(/src="weekly-plan-reminder\.js"/g) || []).length,
  appearanceBackupScriptCount: (html.match(/src="appearance-backup\.js"/g) || []).length,
  themeChoiceCount: (html.match(/data-theme-choice=/g) || []).length,
  planWeekSwitchCount: (html.match(/data-plan-week=/g) || []).length,
  cssBraceBalance,
  cssNeverNegative: cssMinimumBalance >= 0,
  studyPlanInitialization: "ok",
  digitalNotebookInitialization: "ok",
  weeklyReminderScenario: "ok",
  appearanceSwitching: "ok"
};

console.log(JSON.stringify(result, null, 2));
if (duplicateIds.length || missingScripts.length || result.planViewCount !== 1 ||
  result.strategyCount !== 3 || result.printSheetCount !== 1 ||
  result.wrongCenterPanelCount !== 2 || result.digitalNotebookScriptCount !== 1 ||
  result.weeklyReminderScriptCount !== 1 || result.planWeekSwitchCount !== 2 ||
  result.appearanceBackupScriptCount !== 1 || result.themeChoiceCount !== 2 ||
  cssBraceBalance !== 0 || !result.cssNeverNegative) {
  process.exitCode = 1;
}
