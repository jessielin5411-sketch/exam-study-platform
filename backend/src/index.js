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

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    question: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        unit: { type: "string" },
        ability: { type: "string" },
        difficulty: { type: "integer", minimum: 1, maximum: 5 },
        prompt: { type: "string" },
        context: { type: "string" },
        options: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
        answer: { type: "integer", minimum: 0, maximum: 3 },
        correctAnswerText: { type: "string" },
        explanation: { type: "string" },
        commonError: { type: "string" }
      },
      required: ["id", "unit", "ability", "difficulty", "prompt", "context", "options", "answer", "correctAnswerText", "explanation", "commonError"]
    },
    analysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        fixedSections: { type: "array", minItems: 9, maxItems: 9, items: { $ref: "#/$defs/noteItem" } },
        subjectFields: { type: "array", minItems: 5, maxItems: 8, items: { $ref: "#/$defs/noteItem" } },
        noteToolkit: { type: "array", minItems: 6, maxItems: 6, items: { $ref: "#/$defs/noteItem" } },
        summaries: { type: "array", minItems: 3, maxItems: 3, items: { $ref: "#/$defs/noteItem" } }
      },
      required: ["fixedSections", "subjectFields", "noteToolkit", "summaries"]
    },
    similarQuestions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { $ref: "#/$defs/practiceQuestion" }
    }
  },
  required: ["question", "analysis", "similarQuestions"],
  $defs: {
    noteItem: {
      type: "object",
      additionalProperties: false,
      properties: {
        label: { type: "string" },
        content: { type: "string" }
      },
      required: ["label", "content"]
    },
    practiceQuestion: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        unit: { type: "string" },
        ability: { type: "string" },
        difficulty: { type: "integer", minimum: 1, maximum: 5 },
        prompt: { type: "string" },
        context: { type: "string" },
        options: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
        answer: { type: "integer", minimum: 0, maximum: 3 },
        explanation: { type: "string" },
        commonError: { type: "string" }
      },
      required: ["id", "unit", "ability", "difficulty", "prompt", "context", "options", "answer", "explanation", "commonError"]
    }
  }
};

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
  if (value.length > 5_500_000) throw new Error("圖片過大，請裁切後再上傳。 ");
  return value;
}

function validatePayload(body) {
  if (!body || body.type !== "exam-coach-photo-question") throw new Error("請求格式不正確。 ");
  if (!SUBJECT_NAMES[body.subjectId]) throw new Error("請先選擇正確科目。 ");
  const unit = String(body.unit || "").trim().slice(0, 80);
  const questionText = String(body.questionText || "").trim().slice(0, 3000);
  const studentThinking = String(body.studentThinking || "").trim().slice(0, 1000);
  const imageData = validateImageData(body.imageData);
  if (!unit) throw new Error("請填寫單元或範圍。 ");
  if (!imageData && !questionText) throw new Error("請提供題目照片或題幹文字。 ");
  return { subjectId: body.subjectId, unit, questionText, studentThinking, imageData };
}

function recordToMap(items) {
  return Object.fromEntries((Array.isArray(items) ? items : []).map((item) => [String(item.label || ""), String(item.content || "")]));
}

function normalizeResult(result) {
  return {
    question: result.question,
    analysis: {
      fixedSections: recordToMap(result.analysis?.fixedSections),
      subjectFields: recordToMap(result.analysis?.subjectFields),
      noteToolkit: recordToMap(result.analysis?.noteToolkit),
      summaries: recordToMap(result.analysis?.summaries)
    },
    similarQuestions: result.similarQuestions
  };
}

function extractOutputText(response) {
  return (response?.candidates?.[0]?.content?.parts || [])
    .map((part) => typeof part.text === "string" ? part.text : "")
    .join("")
    .trim();
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

function buildSystemPrompt(subjectId) {
  return `你是具有二十年以上經驗的國中教育會考${SUBJECT_NAMES[subjectId]}科命題老師、學習診斷專家與自主學習教練。
請辨識學生提供的紙本題目，使用繁體中文回答。先分析題目考點與學生可能的錯誤原因，再教解題方法、命題陷阱與下次避免方式。
語言必須讓國中生理解，簡潔、有根據、不製造焦慮。分析內容依固定九段標題排列：${FIXED_HEADINGS.join("、")}。
${SUBJECT_GUIDES[subjectId]}
請另外設計三題同一核心觀念、但情境與數字不同的原創四選一題；不得只替換人名或照抄原題。答案索引使用 0、1、2、3。
若照片文字不清楚，不可猜造看不見的內容；應根據題幹文字與可辨識部分完成最保守的分析。不要辨識或輸出姓名、准考證等個人資訊。`;
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
    text: `科目：${SUBJECT_NAMES[input.subjectId]}\n單元：${input.unit}\n題幹文字：${input.questionText || "請由照片辨識"}\n學生卡住的地方：${input.studentThinking || "尚未說明"}`
  }];
  const imagePart = toGeminiImagePart(input.imageData);
  if (imagePart) userParts.push(imagePart);

  const model = String(env.GEMINI_MODEL || "gemini-3.5-flash").trim();
  let geminiResponse;
  try {
    geminiResponse = await fetch(`${GEMINI_API_BASE_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": env.GEMINI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(input.subjectId) }]
        },
        contents: [{ role: "user", parts: userParts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: RESPONSE_SCHEMA,
          // 圖片題需要額外的辨識與推理空間，避免固定 JSON 在結尾被截斷。
          maxOutputTokens: 12000,
          temperature: 0.25
        }
      })
    });
  } catch (error) {
    return jsonResponse(request, env, { error: "目前無法連線 AI 服務，請稍後再試。" }, 502);
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
        : "AI 分析暫時無法完成，請稍後再試。";
    console.error("Gemini error", geminiResponse.status, providerStatus || responseBody?.error?.code || "unknown");
    return jsonResponse(request, env, { error: message }, geminiResponse.status === 429 ? 429 : 502);
  }

  try {
    const outputText = extractOutputText(responseBody);
    if (!outputText) throw new Error("empty output");
    return jsonResponse(request, env, normalizeResult(JSON.parse(outputText)));
  } catch (error) {
    console.error("Invalid structured output", error.message);
    return jsonResponse(request, env, { error: "AI 已回覆，但資料格式不完整，請再試一次。" }, 502);
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
