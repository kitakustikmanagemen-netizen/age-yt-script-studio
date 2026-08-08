/**
 * AGE YT# Script & Caption Studio — config.js
 * Data 7 fitur + builder prompt.
 * Untuk tambah fitur baru: cukup tambah 1 object di array FEATURES di bawah.
 * Tidak perlu sentuh app.js atau index.html.
 */

const PLATFORMS = ["TikTok", "Instagram", "YouTube", "Facebook"];

const AUDIENCE_OPTIONS = [
  { value: "id-umum",   label: "🇮🇩 Indonesia Umum",        lang: "id", note: "Bahasa Indonesia natural, gaya santai, relevan untuk semua kalangan Indonesia." },
  { value: "id-muda",   label: "🇮🇩 Anak Muda 17–25",       lang: "id", note: "Bahasa gaul anak muda Indonesia, relatable, energik." },
  { value: "id-ibu",    label: "🇮🇩 Ibu Rumah Tangga",      lang: "id", note: "Bahasa Indonesia hangat, mudah dipahami, fokus manfaat praktis." },
  { value: "id-bisnis", label: "🇮🇩 Pebisnis / Profesional", lang: "id", note: "Bahasa Indonesia profesional namun tetap tidak kaku, fokus nilai dan hasil." },
  { value: "en-global", label: "🌍 Global (English)",        lang: "en", note: "Write in natural spoken English, suitable for international audience." },
  { value: "en-us",     label: "🇺🇸 US Audience",            lang: "en", note: "Write in American English, casual and engaging, optimized for US market trends." },
];

const FEATURES = [
  {
    id: "script",
    label: "Script Generator",
    subtitle: "Skrip video lengkap dari 1 topik",
    color: "#4C6FFF",
    icon: "📝",
    extraField: null,
    buildPrompt: (ctx) => {
      const aud = AUDIENCE_OPTIONS.find(a => a.value === ctx.audience) || AUDIENCE_OPTIONS[0];
      const isEn = aud.lang === "en";
      return `You are a professional ${ctx.platform} video scriptwriter.
Topic: "${ctx.topic}"
Platform: ${ctx.platform} | Audience: ${aud.label}
${ctx.detail ? `Additional context: ${ctx.detail}` : ""}

Write ONE complete video script (opening hook, main content, closing) with rough timestamps per section (e.g. [0–3s] Hook).
Length should feel natural for ${ctx.platform} — short & punchy for TikTok/Reels, longer for YouTube.
End with a line starting "CTA:" containing a short call to action.
Do NOT wrap the script in quotes — write the content directly.

Language & tone instruction: ${aud.note}`;
    },
  },
  {
    id: "hook",
    label: "Hook Generator",
    subtitle: "3 detik pertama yang bikin orang stop scroll",
    color: "#FF5A5F",
    icon: "🎣",
    extraField: null,
    buildPrompt: (ctx) => {
      const aud = AUDIENCE_OPTIONS.find(a => a.value === ctx.audience) || AUDIENCE_OPTIONS[0];
      const isEn = aud.lang === "en";
      return `You are a ${ctx.platform} hook/opening specialist.
Topic: "${ctx.topic}"
Platform: ${ctx.platform} | Audience: ${aud.label}
${ctx.detail ? `Additional context: ${ctx.detail}` : ""}

Create 8 different hook variations (first 3 seconds of a video):
- 2x shocking question style
- 2x statistic/fact style
- 2x controversial / assumption-breaking style
- 1x personal story ("I just realized...")
- 1x direct command style

Format: numbered list, hook only (max 15 words each), no extra explanation.
Language & tone: ${aud.note}`;
    },
  },
  {
    id: "caption",
    label: "Caption + Hashtag",
    subtitle: "Caption pas platform + hashtag relevan",
    color: "#D6409F",
    icon: "💬",
    extraField: null,
    buildPrompt: (ctx) => {
      const aud = AUDIENCE_OPTIONS.find(a => a.value === ctx.audience) || AUDIENCE_OPTIONS[0];
      return `You are a ${ctx.platform} social media specialist.
Topic/content: "${ctx.topic}"
Platform: ${ctx.platform} | Audience: ${aud.label}
${ctx.detail ? `Additional context: ${ctx.detail}` : ""}

Create 3 caption variants:
1. SHORT — casual, 1–2 lines
2. MEDIUM — storytelling, 3–5 lines
3. LONG — informative / educational

Label each variant clearly.
After the 3 variants, write ONE hashtag list of 15–20 relevant hashtags (mix: large + medium + niche), separated by spaces, no explanation.

Language & tone: ${aud.note}`;
    },
  },
  {
    id: "cta",
    label: "CTA Writer",
    subtitle: "Kalimat ajakan bertindak yang natural",
    color: "#22C55E",
    icon: "📣",
    extraField: {
      id: "ctaGoal",
      label: "Tujuan CTA",
      options: ["Follow", "Like & Comment", "Beli / Checkout", "Klik Link di Bio", "Share / Repost", "Subscribe"],
    },
    buildPrompt: (ctx) => {
      const aud = AUDIENCE_OPTIONS.find(a => a.value === ctx.audience) || AUDIENCE_OPTIONS[0];
      return `You are a ${ctx.platform} copywriter specializing in CTAs.
Topic: "${ctx.topic}" | CTA goal: ${ctx.ctaGoal || "Follow"}
Platform: ${ctx.platform} | Audience: ${aud.label}
${ctx.detail ? `Additional context: ${ctx.detail}` : ""}

Write 10 CTA variations. Mix tones: casual, urgent, humorous, direct.
Max 20 words per CTA. Numbered list, no extra explanation.
Must NOT sound like a generic ad template.

Language & tone: ${aud.note}`;
    },
  },
  {
    id: "title",
    label: "Viral Title Optimizer",
    subtitle: "Varian judul untuk engagement & CTR",
    color: "#8B5CF6",
    icon: "🚀",
    extraField: null,
    buildPrompt: (ctx) => {
      const aud = AUDIENCE_OPTIONS.find(a => a.value === ctx.audience) || AUDIENCE_OPTIONS[0];
      return `You are a ${ctx.platform} viral title & SEO specialist.
Topic: "${ctx.topic}"
Platform: ${ctx.platform} | Audience: ${aud.label}
${ctx.detail ? `Additional context: ${ctx.detail}` : ""}

Write 10 title/headline variations. Mix styles:
- Number/list format
- Question format
- How-to format
- Controversial / assumption-breaking
- Before-after
- Personal story angle

Optimize for curiosity & clicks — NOT misleading clickbait (content must be able to fulfill the title's promise).
Match character length to ${ctx.platform} norms.
Format: numbered list, titles only, no explanation.

Language & tone: ${aud.note}`;
    },
  },
  {
    id: "softsell",
    label: "Soft Selling Script",
    subtitle: "Skrip promosi halus, gak berasa iklan",
    color: "#14B8A6",
    icon: "🌿",
    extraField: {
      id: "productName",
      label: "Nama produk / jasa",
      placeholder: "Contoh: Kelas online copywriting, Serum Vitamin C XYZ",
    },
    buildPrompt: (ctx) => {
      const aud = AUDIENCE_OPTIONS.find(a => a.value === ctx.audience) || AUDIENCE_OPTIONS[0];
      return `You are a ${ctx.platform} affiliate/soft-sell content creator.
Product/service: "${ctx.productName || ctx.topic}"
Content angle/topic: "${ctx.topic}"
Platform: ${ctx.platform} | Audience: ${aud.label}
${ctx.detail ? `Additional context: ${ctx.detail}` : ""}

Write a soft-selling video script:
🎬 HOOK — non-salesy, story/problem-based opening
📖 STORY/CONTENT — build naturally, mention product late, not as hard-sell
💡 RECOMMENDATION — natural product mention
🔗 CLOSING & CTA — casual encouragement (not "buy now!" style)

NEVER use excessive sales language. It must feel like a friend recommending something, not an ad.

Language & tone: ${aud.note}`;
    },
  },
  {
    id: "testimonial",
    label: "Testimonial Script",
    subtitle: "Skrip gaya testimoni / review pengguna",
    color: "#F5A623",
    icon: "⭐",
    extraField: {
      id: "productName",
      label: "Nama produk / jasa",
      placeholder: "Contoh: Skincare X, Aplikasi Y",
    },
    buildPrompt: (ctx) => {
      const aud = AUDIENCE_OPTIONS.find(a => a.value === ctx.audience) || AUDIENCE_OPTIONS[0];
      return `You are a ${ctx.platform} testimonial scriptwriter.
Product/service: "${ctx.productName || ctx.topic}"
Experience angle: "${ctx.topic}"
Platform: ${ctx.platform} | Audience: ${aud.label}
${ctx.detail ? `Additional context: ${ctx.detail}` : ""}

Write 2 testimonial script variations. Structure each:
- BEFORE — problem/condition before using the product
- DURING — experience trying it (include initial skepticism: "At first I wasn't sure...")
- AFTER — results and feelings
- RECOMMENDATION — short, natural close

Length: suitable for 30–60 seconds of speaking on ${ctx.platform}.
Must sound genuine and human, not stiff or overly polished.

Language & tone: ${aud.note}`;
    },
  },
];

// Model default — ubah di sini kalau ingin pakai model lain
// Riwayat: gemini-2.0-flash dimatikan 1 Jun 2026.
// gemini-2.5-flash masih jalan tapi Google sudah rilis lineup baru (Gemini 3.x).
// Per Agustus 2026, gemini-3.5-flash adalah model gratis yang direkomendasikan.
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

// Worker proxy default (milik pemilik proyek) — dipakai bersama semua user
// supaya user tidak perlu deploy Worker sendiri. Worker ini stateless dan
// tidak menyimpan API key siapapun, jadi aman dipakai bareng-bareng.
// User tetap bisa ganti ke Worker mereka sendiri lewat Pengaturan API Key kalau mau.
const DEFAULT_WORKER_URL = "https://age-yt-proxy.kitakustik-managemen.workers.dev/";
