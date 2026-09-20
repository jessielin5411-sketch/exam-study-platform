/*
 * ExamMate AI 教練安全後端（Cloudflare Worker）
 * ------------------------------------------------------------------
 * - API Key 只從 Worker Secret 讀取，永遠不回傳給瀏覽器。
 * - 接收 ExamMate 的題目照片與學生卡點，呼叫 Google Gemini API。
 * - 使用 Structured Outputs 固定回傳格式，再轉成前端既有資料結構。
 */

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const SUBJECT_NAMES = {
  chinese: "國文",
  english: "英文",
  math: "數學",
  science: "自然",
  social: "社會"
};

const SUBJECT_GUIDES = {
  chinese: "另外分析修辭、詞語、成語、文言文、閱讀理解、作者觀點與命題技巧；整理會考常考、容易混淆、閱讀技巧。",
  english: "另外分析文法、時態、單字、片語、閱讀；整理會考文法、易混淆、重要單字。",
  math: "另外分析考點、建立式子、解題策略、常犯錯誤、類似題；整理公式、秒殺技巧、易錯觀念。",
  science: "另外分析原理、現象、生活應用、實驗、易錯觀念；整理公式、重點、會考必考。",
  social: "另外分析歷史背景、時間軸、事件比較、容易混淆、會考常考；整理時間軸、比較表、一句口訣。"
};

const FIXED_HEADINGS = [
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

// Gemini 雖支援 Structured Output，但很深、很大的 Schema 會在部分請求被 API 拒絕。
// 拍照題先以 JSON 回傳，再由下方程式做嚴謹的防呆與正規化，可靠度較高。
const MAX_IMAGE_DATA_LENGTH = 5_100_000;
const RETRYABLE_GEMINI_STATUS = new Set([500, 502, 503, 504]);

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = allowedOrigins(env);
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] || "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(request, env)
    }
  });
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  return allowedOrigins(env).includes(origin);
}

async function enforceAiRateLimit(request, env) {
  // 本機開發或尚未建立 binding 時略過；正式部署則由 Cloudflare 邊緣限流。
  if (!env.AI_RATE_LIMITER?.limit) return null;
  const ipAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const { success } = await env.AI_RATE_LIMITER.limit({ key: `ai:${ipAddress}` });
  if (success) return null;
  return jsonResponse(request, env, {
    error: "AI 教練目前收到較多請求，請等待一分鐘後再試。"
  }, 429);
}

function validateImageData(value) {
  if (!value) return "";
  if (typeof value !== "string" || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) {
    throw new Error("圖片格式不支援，請使用 JPG、PNG 或 WebP。 ");
  }
  if (value.length > MAX_IMAGE_DATA_LENGTH) throw new Error("圖片過大，請裁切成單一題目後再上傳。 ");
  return value;
}

function validatePayload(body) {
  if (!body || body.type !== "exam-coach-photo-question") throw new Error("請求格式不正確。 ");
  if (!SUBJECT_NAMES[body.subjectId]) throw new Error("請先選擇正確科目。 ");
  const unit = String(body.unit || "").trim().slice(0, 80);
  const questionText = String(body.questionText || "").trim().slice(0, 3000);
  const studentThinking = String(body.studentThinking || "").trim().slice(0, 1000);
  const requestMode = body.requestMode === "similar-practice" ? "similar-practice" : "analysis";
  const imageMode = body.imageMode === "chart" ? "chart" : "text";
  const imageData = validateImageData(body.imageData);
  if (!unit) throw new Error("請填寫單元或範圍。 ");
  if (!imageData && !questionText) throw new Error("請提供題目照片或題幹文字。 ");
  return { subjectId: body.subjectId, unit, questionText, studentThinking, requestMode, imageMode, imageData };
}

function recordToMap(items) {
  if (items && !Array.isArray(items) && typeof items === "object") {
    return Object.fromEntries(Object.entries(items).map(([label, content]) => [String(label), String(content || "")]));
  }
  return Object.fromEntries((Array.isArray(items) ? items : []).map((item) => [String(item.label || ""), String(item.content || "")]));
}

function normalizeQuestion(question = {}) {
  const options = Array.isArray(question.options) ? question.options.map(String).filter(Boolean).slice(0, 4) : [];
  const answer = Number.isInteger(question.answer) && question.answer >= 0 && question.answer <= 3 ? question.answer : null;
  return {
    id: String(question.id || "ai-photo-question"),
    unit: String(question.unit || ""),
    ability: String(question.ability || ""),
    difficulty: Math.max(1, Math.min(5, Number(question.difficulty) || 3)),
    prompt: String(question.prompt || ""),
    context: String(question.context || ""),
    options,
    answer,
    correctAnswerText: String(question.correctAnswerText || question.correctAnswer || ""),
    explanation: String(question.explanation || ""),
    commonError: String(question.commonError || "")
  };
}

function normalizeResult(result, input) {
  const source = result && typeof result === "object" ? result : {};
  const question = normalizeQuestion(source.question || source);
  return {
    question: {
      ...question,
      unit: question.unit || input.unit,
      ability: question.ability || `${input.unit}的命題考點與解題能力`,
      prompt: question.prompt || input.questionText || "照片中的題目",
      context: question.context || "學生拍照詢問",
      explanation: question.explanation || "請依題目條件與 AI 的解題步驟重新核對。",
      commonError: question.commonError || input.studentThinking || "需要先確認題目限制與使用的核心觀念。"
    },
    analysis: {
      fixedSections: recordToMap(source.analysis?.fixedSections),
      subjectFields: recordToMap(source.analysis?.subjectFields),
      noteToolkit: recordToMap(source.analysis?.noteToolkit),
      summaries: recordToMap(source.analysis?.summaries)
    },
    similarQuestions: Array.isArray(source.similarQuestions) ? source.similarQuestions.map(normalizeQuestion).filter((item) => item.prompt) : []
  };
}

function extractOutputText(response) {
  return (response?.candidates?.[0]?.content?.parts || [])
    .map((part) => typeof part.text === "string" ? part.text : "")
    .join("")
    .trim();
}

function parseJsonOutput(outputText) {
  const cleanText = String(outputText || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    return JSON.parse(cleanText);
  } catch {
    const first = cleanText.indexOf("{");
    const last = cleanText.lastIndexOf("}");
    if (first < 0 || last <= first) throw new Error("not json");
    return JSON.parse(cleanText.slice(first, last + 1));
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function toGeminiImagePart(imageData) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(imageData || "");
  if (!match) return null;
  return {
    inlineData: {
      mimeType: match[1],
      data: match[2]
    }
  };
}

function buildSystemPrompt(subjectId, input) {
  const chartInstruction = input.imageMode === "chart"
    ? "這是一題含圖表、座標圖、地圖或表格的題目。先辨識題目問什麼，再清楚讀出標題、圖例、座標軸、單位、資料趨勢與關鍵數值；任何看不清的文字都標示為「圖片文字不清」，不可自行補造。"
    : "若照片中包含示意圖或表格，請把圖中可辨識的條件與題幹一起判讀；看不清的內容不可猜造。";
  const similarInstruction = input.requestMode === "similar-practice"
    ? "這次只要依學生已完成的錯題考點，設計原創同觀念加強題；不需要重述九段解析。"
    : "分析內容依固定九段標題排列：" + FIXED_HEADINGS.join("、") + "。";
  return `你是具有二十年以上經驗的國中教育會考${SUBJECT_NAMES[subjectId]}科命題老師、學習診斷專家與自主學習教練。
請辨識學生提供的紙本題目，使用繁體中文回答。先分析題目考點與學生可能的錯誤原因，再教解題方法、命題陷阱與下次避免方式。
語言必須讓國中生理解，簡潔、有根據、不製造焦慮。${similarInstruction}
${SUBJECT_GUIDES[subjectId]}
${chartInstruction}
不要辨識或輸出姓名、准考證等個人資訊。`;
}

function buildResponseInstruction(input) {
  if (input.requestMode === "similar-practice") {
    return `只回傳 JSON，不要 Markdown。格式：{"similarQuestions":[...] }。請依已知核心觀念設計 3 題原創四選一題；每題要有 id、unit、ability、difficulty（1-5）、prompt、context、options（4 個）、answer（0-3）、explanation、commonError。情境或數字必須與原題不同。`;
  }
  return `只回傳 JSON，不要 Markdown。格式：
{"question":{"id":"","unit":"","ability":"","difficulty":3,"prompt":"","context":"","options":[],"answer":0,"correctAnswerText":"","explanation":"","commonError":""},"analysis":{"fixedSections":[{"label":"① 本題考什麼？","content":""}],"subjectFields":[{"label":"科目分析欄位","content":""}],"noteToolkit":[{"label":"整理知識","content":""}],"summaries":[{"label":"會考常考","content":""}]}}
question 的 options 與 answer 僅在題目和選項都清楚時才填；看不清時 options 請留空、answer 請用 null，並在解析說明需要補拍的位置。fixedSections 必須有全部 9 段；subjectFields 依該科需求填 5-8 項；noteToolkit 填「整理知識、會考重點、比較表、一句口訣、時間軸、常考整理」；summaries 填 3 項該科重點。每段 2-4 句，內容精準即可。`;
}

async function analyzeQuestion(request, env) {
  if (!env.GEMINI_API_KEY) return jsonResponse(request, env, { error: "後端尚未設定 GEMINI_API_KEY。" }, 503);
  let rawBody;
  try {
    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 6_000_000) throw new Error("上傳內容過大。 ");
    rawBody = await request.json();
  } catch (error) {
    return jsonResponse(request, env, { error: error.message || "無法讀取請求內容。" }, 400);
  }

  let input;
  try {
    input = validatePayload(rawBody);
  } catch (error) {
    return jsonResponse(request, env, { error: error.message }, 400);
  }

  const userParts = [{
    text: `科目：${SUBJECT_NAMES[input.subjectId]}\n單元：${input.unit}\n題目類型：${input.imageMode === "chart" ? "含圖表／座標圖／地圖／表格" : "一般文字或圖片題"}\n題幹文字：${input.questionText || "請由照片辨識"}\n學生卡住的地方：${input.studentThinking || "尚未說明"}\n\n${buildResponseInstruction(input)}`
  }];
  const imagePart = toGeminiImagePart(input.imageData);
  if (imagePart) userParts.push(imagePart);

  const model = String(env.GEMINI_MODEL || "gemini-3.5-flash").trim();
  const requestId = crypto.randomUUID();
  const requestGemini = () => fetch(`${GEMINI_API_BASE_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": env.GEMINI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(input.subjectId, input) }]
        },
        contents: [{ role: "user", parts: userParts }],
        generationConfig: {
          responseMimeType: "application/json",
          // 拍照分析不一次預先出相似題，讓照片辨識有足夠回覆空間且降低失敗率。
          maxOutputTokens: input.requestMode === "similar-practice" ? 3600 : 7200,
          temperature: 0.25
        }
      })
    });

  let geminiResponse;
  try {
    geminiResponse = await requestGemini();
    // 短暫的服務端錯誤自動重試一次；學生不需要手動重新上傳照片。
    if (RETRYABLE_GEMINI_STATUS.has(geminiResponse.status)) {
      await sleep(700);
      geminiResponse = await requestGemini();
    }
  } catch (error) {
    console.error(JSON.stringify({ requestId, event: "gemini_network_error", message: error.message }));
    return jsonResponse(request, env, { error: "目前無法連線 AI 服務，請稍後再試。", requestId }, 502);
  }

  const responseBody = await geminiResponse.json().catch(() => ({}));
  if (!geminiResponse.ok) {
    const providerMessage = String(responseBody?.error?.message || "");
    const providerStatus = String(responseBody?.error?.status || "");
    const invalidKey = [401, 403].includes(geminiResponse.status)
      || /API[_ ]?KEY|API key not valid/i.test(`${providerStatus} ${providerMessage}`);
    const message = geminiResponse.status === 429
      ? "AI 使用量目前已達限制，請稍後再試。"
      : invalidKey
        ? "Gemini API Key 無效，請由管理者重新設定。"
        : geminiResponse.status === 404
          ? "目前設定的 Gemini 模型無法使用，請由管理者檢查模型名稱。"
          : geminiResponse.status === 400
            ? "AI 目前無法讀取這張圖片的資料格式。請改拍單一題目、確認文字與圖表清楚後再試。"
            : "AI 服務目前較忙，已自動重試一次仍未完成。請稍後再試。";
    console.error(JSON.stringify({
      requestId,
      event: "gemini_provider_error",
      status: geminiResponse.status,
      providerStatus: providerStatus || responseBody?.error?.code || "unknown",
      providerMessage: providerMessage.slice(0, 500),
      model
    }));
    return jsonResponse(request, env, { error: message, requestId }, geminiResponse.status === 429 ? 429 : 502);
  }

  try {
    const outputText = extractOutputText(responseBody);
    if (!outputText) throw new Error("empty output");
    return jsonResponse(request, env, normalizeResult(parseJsonOutput(outputText), input));
  } catch (error) {
    console.error(JSON.stringify({ requestId, event: "gemini_invalid_json", message: error.message, model }));
    return jsonResponse(request, env, { error: "AI 已讀到題目，但回覆格式不完整。請再試一次；若是圖表題，建議只拍一題並把圖表拍滿畫面。", requestId }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin(request, env)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(request, env, { ok: true, service: "ExamMate AI Coach", provider: "Gemini", model: env.GEMINI_MODEL || "gemini-3.5-flash" });
    }
    if (request.method !== "POST" || url.pathname !== "/api/analyze-question") {
      return jsonResponse(request, env, { error: "找不到這個後端路徑。" }, 404);
    }
    if (!isAllowedOrigin(request, env)) return jsonResponse(request, env, { error: "此網站來源未被允許。" }, 403);
    const rateLimitResponse = await enforceAiRateLimit(request, env);
    if (rateLimitResponse) return rateLimitResponse;
    return analyzeQuestion(request, env);
  }
};
