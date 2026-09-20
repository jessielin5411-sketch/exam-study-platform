/*
 * 所有預設考試日期都集中在這個檔案。
 * 請在此更換為學校或年度正式考試日期。
 * 日期格式使用中華民國年 YYY-MM-DD，例如民國 116 年 5 月 15 日寫成 116-05-15。
 */
const examConfig = {
  /*
   * 國中會考 AI 教練設定。
   * 題庫錯題與數位錯題本的引導診斷不需要 API；照片文字、圖形與選項辨識才使用安全後端。
   * 安全後端需接收 POST JSON，並回傳 question 物件（prompt、unit、ability、options、answer、
   * explanation、commonError）、analysis（fixedSections、subjectFields、noteToolkit、summaries），
   * 以及 similarQuestions 陣列（建議 3 題同觀念、不同情境的四選一題）。
   * 後端設定完成後，再把 customQuestionEnabled 改為 true。
   * 請勿把任何 AI API Key 寫在這個前端檔案中。
   */
  aiCoach: {
    customQuestionEnabled: true,
    endpoint: "https://exammate-ai-coach.curse-beet.workers.dev/api/analyze-question"
  },
  /*
   * Supabase 雲端同步設定。
   * publishableKey 是給瀏覽器使用的公開金鑰；真正保護資料的是 Supabase 的「每位學生只能存取自己資料」規則。
   * 千萬不要把 service_role、資料庫密碼或 Gemini API Key 放到這個前端檔案。
   */
  supabase: {
    enabled: true,
    url: "https://cmcqwiogolzffmrwczbp.supabase.co",
    publishableKey: "sb_publishable_ZNAIiOyGP3OSOnzHaYjymQ_eiH2mZxv"
  },
  defaultYear: "116",
  examYears: {
    "116": {
      preparationStart: "115-06-01",
      finalExam: {
        name: "國中教育會考",
        date: "116-05-15"
      },
      mockExams: [
        {
          name: "第一次模擬考（第 1～2 冊・南一）",
          date: "115-09-08",
          endDate: "115-09-09",
          reminder: "考試範圍：第 1～2 冊；命題版本：南一。先看見自己的起點，找出最值得加強的章節。"
        },
        {
          name: "第二次模擬考（第 1～4 冊・翰林）",
          date: "115-12-23",
          endDate: "115-12-24",
          reminder: "考試範圍：第 1～4 冊；命題版本：翰林。整理錯題類型，把還不熟的觀念補起來。"
        },
        {
          name: "第三次模擬考（第 1～5 冊・南一）",
          date: "116-02-18",
          endDate: "116-02-19",
          reminder: "考試範圍：第 1～5 冊；命題版本：南一。練習分配作答時間，穩定比衝快更重要。"
        },
        {
          name: "第四次模擬考（第 1～6 冊・康軒）",
          date: "116-04-15",
          endDate: "116-04-16",
          reminder: "考試範圍：第 1～6 冊；命題版本：康軒。進入最後整合期，相信累積並維持節奏。"
        }
      ]
    },
    "117": {
      preparationStart: "116-06-01",
      finalExam: {
        name: "國中教育會考",
        date: "117-05-20"
      },
      mockExams: [
        { name: "第一次模擬考", date: "116-09-07", reminder: "先看見自己的起點，找出最值得加強的章節。" },
        { name: "第二次模擬考", date: "116-12-15", reminder: "整理錯題類型，把還不熟的觀念補起來。" },
        { name: "第三次模擬考", date: "117-02-22", reminder: "練習分配作答時間，穩定比衝快更重要。" },
        { name: "第四次模擬考", date: "117-04-18", reminder: "進入最後整合期，相信累積並維持節奏。" }
      ]
    }
  },
  encouragements: [
    "不是等有時間才開始，而是開始後才會累積成果。",
    "今天完成一小步，會考就靠近目標一小步。",
    "時間不會停下來，但你可以決定今天怎麼使用它。",
    "不必一次做到最好，穩定前進就是很強的能力。",
    "把注意力放在今天能完成的事，進步會慢慢出現。"
  ]
};
