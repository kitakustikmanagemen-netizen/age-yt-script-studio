/**
 * AGE YT# Script & Caption Studio — app.js
 * Vanilla JS, tanpa framework, supaya ringan di HP/laptop spek rendah.
 */

const LS_KEYS      = "age_yt_gemini_keys";      // [{label, key}]
const LS_ACTIVE_IDX = "age_yt_active_key_index";
const LS_WORKER    = "age_yt_worker_url";
const LS_LAST_PLAT = "age_yt_last_platform";
const LS_LAST_AUD  = "age_yt_last_audience";
const LS_LAST_YT_FMT = "age_yt_last_ytformat";

let state = {
  activeFeature : FEATURES[0].id,
  isGenerating  : false,
  retryCount    : 0,
};

// ─── API KEY helpers ──────────────────────────────────────────────────────────

function getKeys() {
  try { return JSON.parse(localStorage.getItem(LS_KEYS)) || []; }
  catch { return []; }
}
function saveKeys(keys) { localStorage.setItem(LS_KEYS, JSON.stringify(keys)); }

function getActiveIdx() {
  const i = parseInt(localStorage.getItem(LS_ACTIVE_IDX), 10);
  return Number.isNaN(i) ? 0 : i;
}
function getActiveKey() { return getKeys()[getActiveIdx()]?.key || null; }
function getWorkerUrl() { return localStorage.getItem(LS_WORKER) || DEFAULT_WORKER_URL; }
function saveWorkerUrl(u) { localStorage.setItem(LS_WORKER, u.trim()); }

function rotateKey() {
  const keys = getKeys();
  if (keys.length <= 1) return false;
  localStorage.setItem(LS_ACTIVE_IDX, (getActiveIdx() + 1) % keys.length);
  return true;
}

// ─── Nav sidebar ─────────────────────────────────────────────────────────────

function renderNav() {
  const nav = document.getElementById("feature-nav");
  nav.innerHTML = "";
  FEATURES.forEach(f => {
    const btn = document.createElement("button");
    btn.className = "nav-item" + (f.id === state.activeFeature ? " active" : "");
    btn.style.setProperty("--accent", f.color);
    btn.dataset.feature = f.id;
    btn.innerHTML = `
      <span class="nav-icon">${f.icon}</span>
      <span class="nav-text">
        <span class="nav-label">${f.label}</span>
        <span class="nav-subtitle">${f.subtitle}</span>
      </span>`;
    btn.addEventListener("click", () => switchFeature(f.id));
    nav.appendChild(btn);
  });
}

function switchFeature(id) {
  state.activeFeature = id;
  document.querySelectorAll(".nav-item").forEach(el =>
    el.classList.toggle("active", el.dataset.feature === id));
  renderForm();
  document.getElementById("output-panel").classList.add("hidden");
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function renderForm() {
  const f    = FEATURES.find(f => f.id === state.activeFeature);
  const root = document.getElementById("form-root");
  document.documentElement.style.setProperty("--accent", f.color);
  document.getElementById("form-title").textContent    = f.label;
  document.getElementById("form-subtitle").textContent = f.subtitle;

  // extra field (select dropdown or text input)
  let extraHtml = "";
  if (f.extraField) {
    const ef = f.extraField;
    extraHtml = ef.options
      ? `<label class="field-label" for="extra-field">${ef.label}</label>
         <select id="extra-field" class="field-input">
           ${ef.options.map(o => `<option value="${o}">${o}</option>`).join("")}
         </select>`
      : `<label class="field-label" for="extra-field">${ef.label}</label>
         <input id="extra-field" class="field-input" type="text" placeholder="${ef.placeholder || ""}" />`;
  }

  // platform options
  const lastPlat = localStorage.getItem(LS_LAST_PLAT) || PLATFORMS[0];
  const platOpts = PLATFORMS.map(p =>
    `<option value="${p}" ${p === lastPlat ? "selected" : ""}>${p}</option>`).join("");

  // audience options (chip buttons)
  const lastAud = localStorage.getItem(LS_LAST_AUD) || AUDIENCE_OPTIONS[0].value;
  const lastYtFmt = localStorage.getItem(LS_LAST_YT_FMT) || "shorts";
  const audChips = AUDIENCE_OPTIONS.map(a => `
    <button type="button"
      class="aud-chip${a.value === lastAud ? " selected" : ""}"
      data-aud="${a.value}"
      style="--chip-color:${a.value.startsWith("en") ? "#14B8A6" : "#4C6FFF"}">
      ${a.label}
    </button>`).join("");

  root.innerHTML = `
    <label class="field-label" for="topic-input">Topik / ide konten <span class="req">*</span></label>
    <textarea id="topic-input" class="field-input" rows="3"
      placeholder="Contoh: tips hemat belanja bulanan untuk anak kos"></textarea>

    <label class="field-label" for="platform-select">Platform</label>
    <select id="platform-select" class="field-input">${platOpts}</select>

    <div id="yt-format-row" class="${lastPlat === "YouTube" ? "" : "hidden"}">
      <label class="field-label">Format YouTube</label>
      <div class="aud-chips" id="yt-format-chips">
        <button type="button" class="aud-chip${lastYtFmt === "long" ? "" : " selected"}" data-ytfmt="shorts" style="--chip-color:#FF4444">▶ Shorts (&lt;60 detik)</button>
        <button type="button" class="aud-chip${lastYtFmt === "long" ? " selected" : ""}" data-ytfmt="long" style="--chip-color:#FF4444">🎬 Video Panjang</button>
      </div>
    </div>

    <label class="field-label">Target Penonton</label>
    <div class="aud-chips" id="aud-chips">${audChips}</div>

    ${extraHtml}

    <label class="field-label" for="detail-input">
      Detail tambahan <span class="optional">(opsional)</span>
    </label>
    <textarea id="detail-input" class="field-input" rows="2"
      placeholder="Tone yang diinginkan, info produk, dll."></textarea>

    <p id="form-error" class="form-error hidden"></p>

    <button id="generate-btn" class="btn-generate">
      <span id="generate-btn-text">✨ Generate</span>
    </button>`;

  // audience chip click (scoped to #aud-chips only — yt-format-chips shares the same CSS class)
  const audChipsRoot = document.getElementById("aud-chips");
  audChipsRoot.querySelectorAll(".aud-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      audChipsRoot.querySelectorAll(".aud-chip").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      localStorage.setItem(LS_LAST_AUD, btn.dataset.aud);
    });
  });

  // yt format chip click
  const ytFmtRow = document.getElementById("yt-format-row");
  ytFmtRow.querySelectorAll(".aud-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      ytFmtRow.querySelectorAll(".aud-chip").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      localStorage.setItem(LS_LAST_YT_FMT, btn.dataset.ytfmt);
    });
  });

  // remember last platform + toggle YouTube format row
  document.getElementById("platform-select").addEventListener("change", e => {
    localStorage.setItem(LS_LAST_PLAT, e.target.value);
    ytFmtRow.classList.toggle("hidden", e.target.value !== "YouTube");
  });

  document.getElementById("generate-btn").addEventListener("click", handleGenerate);
}

// ─── Generate ─────────────────────────────────────────────────────────────────

async function handleGenerate(isRetry) {
  if (state.isGenerating) return;
  if (!isRetry) state.retryCount = 0;

  const f       = FEATURES.find(f => f.id === state.activeFeature);
  const topic   = document.getElementById("topic-input").value.trim();
  const plat    = document.getElementById("platform-select").value;
  const detail  = document.getElementById("detail-input").value.trim();
  const audEl   = document.querySelector("#aud-chips .aud-chip.selected");
  const audience = audEl ? audEl.dataset.aud : AUDIENCE_OPTIONS[0].value;
  const ytFmtEl  = document.querySelector("#yt-format-chips .aud-chip.selected");
  const ytFormat = ytFmtEl ? ytFmtEl.dataset.ytfmt : "shorts";
  const extraEl  = document.getElementById("extra-field");
  const errorEl  = document.getElementById("form-error");

  errorEl.classList.add("hidden");

  if (!topic) {
    showError("Topik tidak boleh kosong. Isi dulu ya sebelum generate.");
    return;
  }

  const apiKey   = getActiveKey();
  const workerUrl = getWorkerUrl();

  if (!apiKey) {
    showError('Belum ada API key Gemini. Klik "🔑 Pengaturan API Key" di atas untuk menambahkan.');
    return;
  }
  if (!workerUrl) {
    showError('URL Worker proxy belum diisi. Klik "🔑 Pengaturan API Key" dan isi URL Worker.');
    return;
  }

  const platformLabel = plat === "YouTube"
    ? (ytFormat === "long" ? "YouTube (video panjang / long-form)" : "YouTube Shorts (vertikal, di bawah 60 detik)")
    : plat;

  const ctx = { topic, platform: platformLabel, detail, audience };
  if (extraEl && f.extraField) ctx[f.extraField.id] = extraEl.value.trim();

  const prompt = f.buildPrompt(ctx);
  setGenerating(true);

  try {
    const text = await callWorker(workerUrl, apiKey, prompt);
    showOutput(f, text, audience);
  } catch (err) {
    handleError(err);
  } finally {
    setGenerating(false);
  }
}

function setGenerating(on) {
  state.isGenerating = on;
  const btn  = document.getElementById("generate-btn");
  const txt  = document.getElementById("generate-btn-text");
  if (!btn) return;
  btn.disabled  = on;
  txt.textContent = on ? "⏳ Membuat konten..." : "✨ Generate";
}

async function callWorker(workerUrl, apiKey, prompt) {
  const res = await fetch(workerUrl, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({ apiKey, model: DEFAULT_GEMINI_MODEL, prompt }),
  });

  if (!res.ok) {
    const body  = await res.json().catch(() => ({}));
    const err   = new Error(body.error || `Request gagal (status ${res.status})`);
    err.status  = res.status;
    throw err;
  }

  const data = await res.json();
  if (!data.text) throw new Error("Respons dari API kosong atau tidak sesuai format.");
  return data.text;
}

function handleError(err) {
  const isLimit  = err.status === 401 || err.status === 403 || err.status === 429;
  const maxTries = getKeys().length;

  if (isLimit && state.retryCount < maxTries - 1 && rotateKey()) {
    state.retryCount++;
    showError("API key sebelumnya bermasalah. Otomatis mencoba key berikutnya…");
    setTimeout(() => handleGenerate(true), 800);
    return;
  }

  showError(isLimit
    ? "Semua API key kena limit atau kuota habis. Tunggu 1 menit, atau cek kuota di Google AI Studio → API Keys."
    : `Terjadi kesalahan: ${err.message}`);
}

function showError(msg) {
  const el = document.getElementById("form-error");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
}

// ─── Output ──────────────────────────────────────────────────────────────────

let lastOutput = { feature: null, text: "", audience: "" };

function showOutput(feature, text, audience) {
  lastOutput = { feature, text, audience };

  const panel = document.getElementById("output-panel");
  panel.classList.remove("hidden");
  panel.style.setProperty("--accent", feature.color);

  document.getElementById("output-title").textContent = `Hasil: ${feature.label}`;

  // audience badge
  const audObj = AUDIENCE_OPTIONS.find(a => a.value === audience);
  const meta   = document.getElementById("output-meta");
  meta.innerHTML = audObj
    ? `<span class="aud-badge">${audObj.label}</span>`
    : "";

  const outEl = document.getElementById("output-text");
  outEl.textContent = text;
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function copyOutput() {
  if (!lastOutput.text) return;
  navigator.clipboard.writeText(lastOutput.text).then(() => flash("copy-btn", "✅ Tersalin!"));
}

// Kirim ke AGE YT#5 (MPT) — format JSON standar antar-tool AGE YT
function sendToMPT() {
  if (!lastOutput.text) return;
  const payload = {
    source       : "AGE YT# Script & Caption Studio",
    feature      : lastOutput.feature?.id,
    featureLabel : lastOutput.feature?.label,
    audience     : lastOutput.audience,
    generatedAt  : new Date().toISOString(),
    content      : lastOutput.text,
  };
  navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    .then(() => flash("send-mpt-btn", "✅ Siap ditempel di MPT!"));
}

function flash(id, tempText) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = tempText;
  setTimeout(() => btn.textContent = orig, 1800);
}

// ─── Modal API Key ────────────────────────────────────────────────────────────

function renderKeySettings() {
  const keys      = getKeys();
  const activeIdx = getActiveIdx();
  const list      = document.getElementById("key-list");

  list.innerHTML = keys.length
    ? ""
    : `<p class="key-empty">Belum ada API key. Tambahkan minimal 1 di bawah.</p>`;

  keys.forEach((k, i) => {
    const row = document.createElement("div");
    row.className = "key-row" + (i === activeIdx ? " active" : "");
    row.innerHTML = `
      <span class="key-radio">${i === activeIdx ? "●" : "○"}</span>
      <span class="key-label">${k.label || `Key ${i + 1}`}</span>
      <span class="key-masked">${maskKey(k.key)}</span>
      <button class="key-remove" data-idx="${i}" title="Hapus">✕</button>`;
    row.querySelector(".key-label").addEventListener("click", () => {
      localStorage.setItem(LS_ACTIVE_IDX, i);
      renderKeySettings();
    });
    row.querySelector(".key-remove").addEventListener("click", e => {
      e.stopPropagation();
      const nk = keys.filter((_, idx) => idx !== i);
      saveKeys(nk);
      if (activeIdx >= nk.length) localStorage.setItem(LS_ACTIVE_IDX, 0);
      renderKeySettings();
    });
    list.appendChild(row);
  });

  document.getElementById("worker-url-input").value = localStorage.getItem(LS_WORKER) || "";
}

function maskKey(k) {
  if (!k || k.length < 8) return "••••••";
  return k.slice(0, 4) + "••••••••" + k.slice(-4);
}

function addKey() {
  const inp   = document.getElementById("new-key-input");
  const label = document.getElementById("new-key-label");
  const val   = inp.value.trim();
  if (!val) return;
  const keys  = getKeys();
  keys.push({ key: val, label: label.value.trim() || `Key ${keys.length + 1}` });
  saveKeys(keys);
  inp.value   = "";
  label.value = "";
  renderKeySettings();
}

function openModal()  { document.getElementById("key-modal").classList.remove("hidden"); renderKeySettings(); }
function closeModal() { document.getElementById("key-modal").classList.add("hidden"); }

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = `toast ${type}`;
  setTimeout(() => t.className = "toast hidden", 3000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  renderNav();
  renderForm();

  document.getElementById("copy-btn").addEventListener("click", copyOutput);
  document.getElementById("send-mpt-btn").addEventListener("click", sendToMPT);
  document.getElementById("open-settings-btn").addEventListener("click", openModal);
  document.getElementById("close-settings-btn").addEventListener("click", closeModal);
  document.getElementById("add-key-btn").addEventListener("click", addKey);
  document.getElementById("save-worker-url-btn").addEventListener("click", () => {
    saveWorkerUrl(document.getElementById("worker-url-input").value);
    flash("save-worker-url-btn", "✅ Tersimpan");
  });

  // tutup modal kalau klik di luar
  document.getElementById("key-modal").addEventListener("click", e => {
    if (e.target === document.getElementById("key-modal")) closeModal();
  });

  // buka modal otomatis kalau belum setup
  if (!getKeys().length) openModal();
}

document.addEventListener("DOMContentLoaded", init);
