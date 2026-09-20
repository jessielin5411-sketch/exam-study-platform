/*
 * ExamMate 帳號登入與雲端同步
 * ------------------------------------------------------------------
 * 資料先留在 localStorage，學生主動登入後才同步到自己的 Supabase 帳號。
 * 此檔案只使用 publishable key；所有資料表都由 Row Level Security 限制為本人可讀寫。
 */
(function () {
  "use strict";

  const CONFIG = window.examConfig?.supabase;
  const SNAPSHOT_KEY = "examMate.cloudSnapshot.v1";
  const SYNC_KEYS = [
    "examJourney.profile.v1",
    "examJourney.events.v1",
    "examJourney.dailyGoal.v1",
    "examMate.learning.v1",
    "examMate.wrongQuestions.v1",
    "examMate.unitReviews.v1",
    "examMate.studyPlan.v1",
    "examMate.digitalWrongNotebook.v1",
    "examMate.aiCoach.v1",
    "examMate.aiPracticeQuestions.v1",
    "examMate.weeklyPlanPrompt.v1",
    "examMate.appearance.v1"
  ];
  const state = { client: null, session: null, remoteSnapshot: null, syncing: false, syncTimer: null, initializedUserId: null };
  const $ = (selector) => document.querySelector(selector);

  function isConfigured() {
    return Boolean(CONFIG?.enabled && CONFIG.url && CONFIG.publishableKey && window.supabase?.createClient);
  }

  function showToast(message, isError = false) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = isError ? "#a84f59" : "#365759";
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function setFeedback(selector, message, isError = false) {
    const node = $(selector);
    if (!node) return;
    node.textContent = message;
    node.classList.toggle("is-error", isError);
  }

  function hasLocalStudyData() {
    try {
      const profile = JSON.parse(localStorage.getItem("examJourney.profile.v1") || "null");
      return Boolean(profile?.studentName);
    } catch (error) {
      return false;
    }
  }

  function collectLocalData() {
    const data = {};
    SYNC_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw === null) return;
      try {
        data[key] = JSON.parse(raw);
      } catch (error) {
        /* 本機已損壞的資料不會覆寫雲端資料。 */
      }
    });
    return data;
  }

  function localSnapshot() {
    return { version: 1, updatedAt: new Date().toISOString(), data: collectLocalData() };
  }

  function readableSize(value) {
    const bytes = new Blob([JSON.stringify(value)]).size;
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function dailyMinutes(value) {
    const match = String(value || "").match(/[\d.]+/);
    if (!match) return 30;
    const number = Number(match[0]);
    return String(value).includes("小時") ? Math.round(number * 60) : Math.round(number);
  }

  async function syncProfile(userId) {
    const profile = collectLocalData()["examJourney.profile.v1"];
    if (!profile?.studentName) return;
    const { error } = await state.client.from("profiles").upsert({
      id: userId,
      display_name: profile.studentName,
      school_name: profile.schoolName || "",
      grade: profile.grade || "",
      class_name: profile.className || "",
      target_exam_year: Number(profile.examYear) || null,
      target_score: profile.targetScore || "",
      weak_subjects: Array.isArray(profile.weakSubjects) ? profile.weakSubjects : [],
      daily_study_minutes: Math.max(1, Math.min(1440, dailyMinutes(profile.dailyStudyTime))),
      motivation: profile.motto || ""
    });
    if (error) throw error;
  }

  async function getRemoteSnapshot(userId) {
    const { data, error } = await state.client
      .from("user_snapshots")
      .select("payload, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data?.payload?.version === 1 && data.payload.data ? { ...data.payload, updatedAt: data.updated_at || data.payload.updatedAt } : null;
  }

  function renderAccount() {
    const guest = $("#account-guest-panel");
    const member = $("#account-member-panel");
    const label = $("#account-button-label");
    if (!guest || !member || !label) return;
    const signedIn = Boolean(state.session?.user);
    guest.hidden = signedIn;
    member.hidden = !signedIn;
    label.textContent = signedIn ? "已登入" : "登入同步";
    if (signedIn) $("#account-email-display").textContent = state.session.user.email || "已登入帳號";
  }

  function closeDialog() {
    const dialog = $("#account-dialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function openDialog() {
    const dialog = $("#account-dialog");
    if (!dialog) return;
    renderAccount();
    setFeedback("#magic-link-feedback", "");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function setSyncStatus(message, mode = "normal") {
    const node = $("#cloud-sync-status");
    if (!node) return;
    node.textContent = message;
    node.dataset.mode = mode;
  }

  function toggleConflictActions(show) {
    const panel = $("#cloud-conflict-actions");
    if (panel) panel.hidden = !show;
  }

  function applyRemoteSnapshot(snapshot) {
    const data = snapshot?.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("雲端資料格式不正確");
    SYNC_KEYS.forEach((key) => localStorage.removeItem(key));
    Object.entries(data).forEach(([key, value]) => {
      if (SYNC_KEYS.includes(key)) localStorage.setItem(key, JSON.stringify(value));
    });
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ downloadedAt: new Date().toISOString(), sourceUpdatedAt: snapshot.updatedAt || null }));
  }

  async function uploadSnapshot(showResult = true) {
    if (!state.session?.user || state.syncing) return;
    state.syncing = true;
    toggleConflictActions(false);
    setSyncStatus("正在安全同步這台裝置的學習資料…", "loading");
    try {
      const snapshot = localSnapshot();
      if (new Blob([JSON.stringify(snapshot)]).size > 8 * 1024 * 1024) {
        throw new Error("這台裝置的資料超過 8MB，請先下載備份檔並清理不需要的照片後再同步。");
      }
      await syncProfile(state.session.user.id);
      const { error } = await state.client.from("user_snapshots").upsert({
        user_id: state.session.user.id,
        payload: snapshot,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      state.remoteSnapshot = snapshot;
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ uploadedAt: new Date().toISOString() }));
      setSyncStatus(`已同步完成（${readableSize(snapshot)}）。`, "success");
      setFeedback("#account-member-feedback", "資料已同步；換裝置時登入同一個 Email 即可接續。", false);
      if (showResult) showToast("學習資料已同步到你的帳號。");
    } catch (error) {
      const message = error?.message || "同步失敗，請稍後再試。";
      setSyncStatus("同步失敗，雲端資料沒有被覆寫。", "error");
      setFeedback("#account-member-feedback", message, true);
      if (showResult) showToast(message, true);
    } finally {
      state.syncing = false;
    }
  }

  async function downloadSnapshot() {
    if (!state.remoteSnapshot) return;
    try {
      applyRemoteSnapshot(state.remoteSnapshot);
      setSyncStatus("雲端資料已下載到這台裝置，正在重新整理…", "success");
      setFeedback("#account-member-feedback", "雲端資料已取回，正在重新整理畫面。", false);
      window.setTimeout(() => window.location.reload(), 650);
    } catch (error) {
      setFeedback("#account-member-feedback", "下載失敗：雲端資料格式無法辨識，這台裝置的資料沒有被修改。", true);
    }
  }

  async function chooseInitialSync(user) {
    try {
      const remote = await getRemoteSnapshot(user.id);
      state.remoteSnapshot = remote;
      const localExists = hasLocalStudyData();
      if (!remote) {
        if (localExists) {
          setSyncStatus("這是首次同步，正在建立你的雲端學習資料…", "loading");
          await uploadSnapshot(false);
        } else {
          setSyncStatus("登入完成。完成首頁資料設定後，按「立即同步」即可保存。", "normal");
        }
        return;
      }
      if (!localExists) {
        setSyncStatus("找到你的雲端資料，正在下載到這台裝置…", "loading");
        await downloadSnapshot();
        return;
      }
      setSyncStatus("雲端與這台裝置都已有資料，請選擇本次要保留的版本。", "warning");
      toggleConflictActions(true);
    } catch (error) {
      setSyncStatus("目前無法讀取雲端資料；這台裝置的資料仍安全保留。", "error");
      setFeedback("#account-member-feedback", error?.message || "請檢查網路後再試。", true);
    }
  }

  function redirectUrl() {
    if (!window.location.origin || window.location.origin === "null") return "http://localhost:3000/";
    return `${window.location.origin}${window.location.pathname}`;
  }

  async function sendMagicLink(event) {
    event.preventDefault();
    const email = String($("#magic-link-email")?.value || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFeedback("#magic-link-feedback", "請輸入正確的 Email。", true);
      return;
    }
    if (window.location.origin === "null") {
      setFeedback("#magic-link-feedback", "請改用 http://localhost:3000 或 GitHub Pages 開啟網站，才能完成 Email 登入。", true);
      return;
    }
    const button = $("#send-magic-link");
    if (button) button.disabled = true;
    setFeedback("#magic-link-feedback", "正在寄送登入連結…");
    try {
      const { error } = await state.client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectUrl() } });
      if (error) throw error;
      setFeedback("#magic-link-feedback", "登入連結已寄出。請到信箱開啟連結，再回到這個網站。", false);
    } catch (error) {
      setFeedback("#magic-link-feedback", error?.message || "目前無法寄送登入連結，請稍後再試。", true);
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function signOut() {
    const { error } = await state.client.auth.signOut();
    if (error) {
      setFeedback("#account-member-feedback", "登出失敗，請稍後再試。", true);
      return;
    }
    state.session = null;
    state.remoteSnapshot = null;
    renderAccount();
    closeDialog();
    showToast("已登出。這台裝置的本機資料仍會保留。");
  }

  function scheduleSync() {
    if (!state.session?.user || state.syncing) return;
    window.clearTimeout(state.syncTimer);
    state.syncTimer = window.setTimeout(() => uploadSnapshot(false), 1400);
  }

  async function handleAuthSession(session) {
    state.session = session || null;
    renderAccount();
    if (!state.session?.user) {
      state.initializedUserId = null;
      return;
    }
    if (state.initializedUserId === state.session.user.id) return;
    state.initializedUserId = state.session.user.id;
    await chooseInitialSync(state.session.user);
  }

  function bindEvents() {
    $("#open-account-dialog")?.addEventListener("click", openDialog);
    $("#close-account-dialog")?.addEventListener("click", closeDialog);
    $("#magic-link-form")?.addEventListener("submit", sendMagicLink);
    $("#sync-now-button")?.addEventListener("click", () => uploadSnapshot(true));
    $("#upload-local-snapshot")?.addEventListener("click", () => uploadSnapshot(true));
    $("#download-cloud-snapshot")?.addEventListener("click", downloadSnapshot);
    $("#sign-out-button")?.addEventListener("click", signOut);
    $("#account-dialog")?.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(); });
    document.addEventListener("submit", scheduleSync, true);
    document.addEventListener("change", scheduleSync, true);
    document.addEventListener("exammate:local-data-changed", scheduleSync);
    document.addEventListener("click", (event) => {
      if (event.target.closest("button")) scheduleSync();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") uploadSnapshot(false);
    });
  }

  async function init() {
    if (!isConfigured()) {
      const button = $("#open-account-dialog");
      if (button) { button.disabled = true; button.title = "雲端同步設定尚未完成"; }
      return;
    }
    state.client = window.supabase.createClient(CONFIG.url, CONFIG.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    bindEvents();
    const { data } = await state.client.auth.getSession();
    await handleAuthSession(data.session);
    state.client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => handleAuthSession(session), 0);
    });
    window.ExamMateCloud = { syncNow: () => uploadSnapshot(true), open: openDialog, getSession: () => state.session };
  }

  document.addEventListener("DOMContentLoaded", init);
})();
