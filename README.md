# AGE YT#1 Master - Studio Pro v2.5

Tool all-in-one untuk YouTuber: riset topik, skrip & 6-tier wajah karakter, storyboard scene AI, thumbnail studio (A/B test + canvas editor + AI fusion), SEO metadata, dan ekspor blueprint ZIP.

Tool ini **100% gratis dijalankan** — setiap pengguna memasukkan API Key AI miliknya sendiri (model *Bring Your Own Key / BYOK*), sehingga pemilik/developer tool tidak menanggung biaya API sama sekali.

## Cara Install & Jalankan di Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

## Cara Build untuk Produksi

```bash
npm run build
```

Hasilnya ada di folder `dist/` — folder statis murni, tidak butuh server tambahan.

## Cara Deploy ke Cloudflare Pages

1. Push project ini ke repository GitHub/GitLab (lihat bagian **Setup Git** di bawah).
2. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Pilih repository ini, lalu isi:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Klik **Save and Deploy**. Cloudflare akan otomatis build & deploy ulang setiap kali kamu push ke branch utama.

## Setup Git (jika belum)

```bash
git init
git add .
git commit -m "Initial commit - AGE YT#1 Master Studio Pro v2.5"
git branch -M main
git remote add origin <URL_REPOSITORY_KAMU>
git push -u origin main
```

## Cara Mendapatkan API Key Gratis

Buka tool ini, klik badge **"API Key"** di sidebar kiri untuk membuka panel Pengaturan API Key. Kamu bisa menambahkan satu atau lebih key dari provider berikut:

| Provider | Fitur yang didukung | Link daftar gratis |
|---|---|---|
| **Google Gemini** (utama, wajib untuk fitur lengkap) | Teks, gambar (dengan referensi wajah), TTS, riset real-time (Google Search) | https://aistudio.google.com/apikey |
| **OpenRouter** (fallback opsional) | Teks saja — dipakai otomatis kalau semua key Gemini habis kuota | https://openrouter.ai/keys |
| **Pexels** (fallback opsional) | Gambar stok ASLI (bukan AI) untuk scene TANPA referensi wajah — dicoba sebelum Pollinations.ai | https://www.pexels.com/api/ |
| **Groq** (fallback opsional) | Teks saja, sangat cepat — dipakai otomatis kalau semua key Gemini habis kuota | https://console.groq.com/keys |

Semua key hanya tersimpan di **localStorage browser pengguna masing-masing** — tidak pernah dikirim atau disimpan di server manapun.

> Catatan: generate gambar TANPA referensi wajah tetap bisa berjalan lewat fallback gratis **Pollinations.ai** (tanpa API key sama sekali) kalau semua key Gemini habis. Generate gambar DENGAN referensi wajah (fitur utama tool ini) tetap membutuhkan key Gemini yang aktif, karena provider lain tidak mendukung image-to-image dengan referensi wajah.

## Penting: Google Sering Mengganti Nama Model AI

Google rutin mempensiunkan model *preview* Gemini dan menggantinya dengan versi stabil (GA) — biasanya beberapa bulan setelah rilis. Kalau suatu saat fitur generate teks/gambar/suara di tool ini tiba-tiba error terus (terutama error `404 Not Found` di halaman [Gemini API Usage](https://aistudio.google.com/usage)), itu tandanya nama model yang dipakai di kode sudah dipensiunkan Google.

Nama model dipakai di 3 tempat dalam `src/App.tsx` (cari dengan Ctrl+F):
- `generateContent` untuk teks (saat ini: `gemini-3.5-flash`)
- `generateContent` untuk gambar (saat ini: `gemini-3.1-flash-image`)
- `generateContent` untuk TTS/suara (saat ini: `gemini-2.5-flash-preview-tts`)

Cek nama model terbaru & jadwal pensiun di halaman resmi: https://ai.google.dev/gemini-api/docs/deprecations

## Catatan Tentang Google Sign-In (GSI)

Tool ini punya fitur opsional Google Sign-In yang memakai `client_id` bawaan. Kalau kamu deploy ke domain Cloudflare Pages milikmu sendiri dan ingin fitur ini berfungsi penuh, tambahkan domain barumu sebagai **Authorized JavaScript origin** di [Google Cloud Console](https://console.cloud.google.com/apis/credentials) untuk client ID tersebut. Kalau tidak dikonfigurasi, fitur ini akan gagal secara diam-diam (sudah ditangani lewat try/catch) dan tidak mengganggu fitur inti tool.

## Struktur Project

```
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx      # Entry point React
    ├── App.tsx       # Seluruh logika & UI tool (single-file, sudah diverifikasi lengkap)
    └── index.css     # Tailwind directives
```
