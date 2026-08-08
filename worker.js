/**
 * AGE YT# — Cloudflare Worker Proxy
 *
 * Worker ini tugasnya HANYA meneruskan request dari browser user ke Gemini API.
 * API key TIDAK di-hardcode di sini — dikirim oleh browser tiap request,
 * lalu langsung diteruskan ke Google, hasilnya dikirim balik ke browser.
 *
 * (Opsional) Batasi origin yang boleh akses worker ini:
 * Ganti ALLOWED_ORIGIN dari "*" ke domain Pages kamu,
 * contoh: "https://scriptstudio.andriage.my.id"
 */

const ALLOWED_ORIGIN = "*";

function cors() {
  return {
    "Access-Control-Allow-Origin" : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}

export default {
  async fetch(request) {

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed. Gunakan POST." }, 405);
    }

    // Parse body
    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Body tidak valid (harus JSON)." }, 400); }

    const { apiKey, prompt, model } = body;

    if (!apiKey) return json({ error: "apiKey wajib diisi." }, 400);
    if (!prompt) return json({ error: "prompt wajib diisi." }, 400);

    const modelName = model || "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

    // Forward ke Gemini
    try {
      const gemRes = await fetch(url, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          contents          : [{ parts: [{ text: prompt }] }],
          generationConfig  : { temperature: 0.85, maxOutputTokens: 2048 },
        }),
      });

      const data = await gemRes.json();

      if (!gemRes.ok) {
        const msg = data?.error?.message || "Request ke Gemini API gagal.";
        return json({ error: msg }, gemRes.status);
      }

      const text = data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        .join("") || "";

      if (!text) {
        return json({ error: "Gemini tidak mengembalikan teks (mungkin diblok safety filter)." }, 502);
      }

      return json({ text });

    } catch (err) {
      return json({ error: `Gagal menghubungi Gemini API: ${err.message}` }, 502);
    }
  },
};
