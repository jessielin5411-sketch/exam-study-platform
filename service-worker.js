/* ExamMate 離線殼層：個人資料與 AI 回覆不會寫入快取。 */
const CACHE_NAME = "exammate-shell-v20260920-photo-ai";
const CORE_ASSETS = [
  "./", "index.html", "style.css", "config.js", "script.js", "question-bank.js",
  "exam-question-bank.js", "historical-exam-bank.js", "chinese-expansion-bank.js",
  "english-expansion-bank.js", "english-question-bank-100.js", "unit-review-bank.js",
  "chinese-handbook.js", "english-handbook.js", "study-plan.js", "digital-wrong-notebook.js",
  "learning.js", "ai-coach.js", "weekly-plan-reminder.js", "appearance-backup.js",
  "supabase-sync.js", "pwa.js", "manifest.webmanifest", "assets/exammate-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return response;
  })));
});
