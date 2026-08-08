# AGE YT# — Script & Caption Studio (Tools 01/05)

Generator skrip, hook, caption, hashtag, CTA, judul viral, soft selling,
dan testimoni — untuk TikTok, Instagram, YouTube, dan Facebook.
100% gratis. Ringan di HP & laptop spek rendah.

---

## Struktur File

```
age-yt-script-studio/
├── index.html          ← halaman utama
├── css/
│   └── style.css       ← tema "Mixer Panel"
├── js/
│   ├── config.js       ← data 7 fitur + prompt builder
│   └── app.js          ← logic UI, generate, multi API key
└── worker/
    └── worker.js       ← Cloudflare Worker proxy ke Gemini API
```

---

## LANGKAH 1 — Deploy Worker Proxy (Cloudflare Workers)

Worker ini tugasnya meneruskan request browser ke Gemini API.
API key user tidak disimpan di server — dikirim per-request langsung ke Google.

### 1.1 Buat akun Cloudflare
- Buka https://dash.cloudflare.com
- Daftar gratis (tidak perlu kartu kredit)

### 1.2 Buat Worker baru
1. Di dashboard Cloudflare, klik **Workers & Pages** di menu kiri
2. Klik tombol **Create** → pilih **Create Worker**
3. Beri nama worker, contoh: `age-yt-proxy`
4. Klik **Deploy** (biarkan isinya dulu, kita ganti di langkah berikut)

### 1.3 Masukkan kode worker
1. Setelah deploy, klik **Edit code**
2. Hapus seluruh isi editor yang ada (Ctrl+A lalu Delete)
3. Buka file `worker/worker.js` dari project ini
4. Copy semua isinya, paste ke editor Cloudflare
5. Klik **Deploy** di pojok kanan atas

### 1.4 Catat URL Worker
Setelah deploy, URL worker akan terlihat di bagian atas, formatnya:
```
https://age-yt-proxy.NAMA-AKUN-KAMU.workers.dev
```
**Simpan URL ini** — nanti dimasukkan ke pengaturan aplikasi.

Gratis: Cloudflare Workers Free = 100.000 request/hari, lebih dari cukup.

---

## LANGKAH 2 — Deploy Frontend (Cloudflare Pages)

### Opsi A — Via GitHub (Direkomendasikan)
Auto-deploy setiap kamu update kode.

1. Buka https://github.com → Login atau daftar gratis
2. Klik **"+"** → **New repository**
3. Nama repo: `age-yt-script-studio` → pilih **Public** → **Create**
4. Upload semua file project ini ke repo tersebut
   (index.html, folder css/, js/, worker/, README.md)
5. Di Cloudflare dashboard → **Workers & Pages** → **Create**
6. Pilih tab **Pages** → klik **Connect to Git**
7. Hubungkan akun GitHub → pilih repo `age-yt-script-studio`
8. Build settings:
   - Framework preset : **None**
   - Build command    : (kosongkan)
   - Build output dir : `/` (root)
9. Klik **Save and Deploy**
10. Tunggu 1–2 menit → kamu dapat URL seperti:
    `https://age-yt-script-studio.pages.dev`

### Opsi B — Upload Langsung (Tanpa GitHub)
1. Cloudflare dashboard → **Workers & Pages** → **Create**
2. Tab **Pages** → **Upload assets**
3. Drag & drop seluruh ISI folder project (bukan file zip-nya)
4. Klik Deploy

### Custom Domain (Opsional)
Jika punya domain sendiri (seperti scriptstudio.andriage.my.id):
1. Di halaman Pages project → tab **Custom domains**
2. Klik **Set up a custom domain**
3. Masukkan subdomain kamu → ikuti instruksi DNS

---

## LANGKAH 3 — Dapatkan Gemini API Key (Gratis)

1. Buka https://aistudio.google.com/app/apikey
2. Login dengan akun Google
3. Klik **Create API key**
4. Pilih project Google (atau buat baru)
5. Copy API key yang muncul (format: `AIza...`)

Batas gratis Gemini 2.0 Flash:
- 15 request/menit
- 1.500 request/hari
- Gratis, tidak perlu kartu kredit

---

## LANGKAH 4 — Setup Aplikasi (Untuk User)

1. Buka URL Pages hasil deploy
2. Modal "Pengaturan API Key" akan muncul otomatis
3. Isi **URL Worker Proxy** → URL dari Langkah 1.4
   Contoh: `https://age-yt-proxy.namamu.workers.dev`
4. Klik **Simpan**
5. Isi **API Key Gemini** → key dari Langkah 3
6. Isi label opsional (misal: "Key Utama")
7. Klik **+ Tambah**
   - Bisa tambah lebih dari 1 key sebagai cadangan
   - Jika key utama kena limit, otomatis pindah ke key berikutnya
8. Klik **Selesai**

---

## Cara Pakai

1. Pilih salah satu dari 7 mode di sidebar kiri
2. Pilih platform (TikTok / Instagram / YouTube / Facebook)
3. Pilih target penonton:
   - Indonesia Umum, Anak Muda 17-25, Ibu Rumah Tangga, Pebisnis
   - Global (English), US Audience
4. Isi topik → klik **Generate**
5. Hasil muncul di panel kanan
6. Klik **Copy** untuk salin
7. Klik **Kirim ke MPT** untuk meneruskan ke AGE YT#5 (AI Video Generator)

---

## Tips & Catatan Teknis

- **Tanpa framework** — HTML/CSS/Vanilla JS murni, ringan di device low-spec
- **Tanpa font eksternal** — pakai system font, tidak ada request jaringan tambahan
- **API key aman** — disimpan di localStorage browser user, tidak pernah ke server
  pihak ketiga selain Worker proxy milik kamu sendiri
- **Tambah fitur baru** — cukup tambah 1 object di array `FEATURES` di `js/config.js`
- **Ganti model AI** — ubah `DEFAULT_GEMINI_MODEL` di `js/config.js`
- **Batasi akses Worker** — ganti `ALLOWED_ORIGIN` di `worker/worker.js`
  dari `"*"` ke domain Pages kamu untuk keamanan lebih

---

## Roadmap AGE YT#

| # | Tools | Status |
|---|-------|--------|
| 01 | Script & Caption Studio (ini) | ✅ Selesai |
| 02 | Content Strategy & Calendar | 🔜 Berikutnya |
| 03 | AI Image & Visual Maker | 🔜 |
| 04 | Affiliate & Product Kit | 🔜 |
| 05 | AI Video Generator (MPT) | 🔜 |

Output tools ini (via tombol "Kirim ke MPT") dirancang untuk langsung dipakai
sebagai input di AGE YT#5 AI Video Generator — tidak perlu copy-paste manual.
