# ExamMate AI 教練後端

這個資料夾是 Cloudflare Worker，負責安全呼叫 Google Gemini API。GitHub Pages 只呼叫 Worker 網址，`GEMINI_API_KEY` 不會出現在前端或 GitHub。

## 第一次設定

1. 安裝 Node.js 20 以上版本。
2. 在本資料夾執行 `npm install`。
3. 執行 `npx wrangler login`，登入 Cloudflare。
4. 執行 `npm run secret`，依提示貼入 Gemini API Key。
5. 執行 `npm run deploy -- --keep-vars`，保留控制台中既有的 Secret 與變數。
6. 記下部署後的 Worker 網址，例如 `https://exammate-ai-coach.<帳號>.workers.dev`。
7. 在網站 `config.js` 將 `customQuestionEnabled` 改為 `true`，並把 `endpoint` 設為 `<Worker網址>/api/analyze-question`。

## 本機測試

1. 將 `.dev.vars.example` 複製為 `.dev.vars`。
2. 只在 `.dev.vars` 填入 Gemini API Key；不要修改範例檔。
3. 執行 `npm run dev`。
4. 以 HTTP 本機伺服器開啟前端，不要用 `file://` 測試跨網域請求。

## 安全提醒

- `.dev.vars`、`.env`、`node_modules` 與 `.wrangler` 已由根目錄 `.gitignore` 排除。
- Worker 目前限制來源、檔案大小與輸出長度，並以 Cloudflare Rate Limiting API 限制每個來源 IP 每分鐘最多 10 次 AI 分析，適合第一階段測試。
- 正式大量開放學生使用前，建議再加入 Cloudflare Turnstile 或登入機制；若全班共用同一校園網路，也應依實際人數調整限流策略。
