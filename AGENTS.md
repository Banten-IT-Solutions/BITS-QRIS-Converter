# 🤖 AGENTS.md — BITS QRIS Converter

> **Untuk AI Agents (Muse, Cursor, Copilot, Codex, dll)** — baca ini dulu sebelum edit apapun. Repo ini `Node 24 LTS`, `classic × paper + terminal` (Opsi B: light `#FFFFFF` / dark `#06080C`), dan semua logic ada di **satu file** `apps/web/src/client.tsx`.

---

## ⚡ TL;DR untuk AI — 30 detik

1. **Install & Build:** `npm ci` → `npm run build` (wajib 1x, hasilkan `dist/cjs` + `dist/esm`)
2. **Dev Web:** `npm run dev --workspace=@bits/web` → `http://localhost:5173` (Vite + Workers)
3. **Edit UI:** cuma di `apps/web/src/client.tsx` (HTML string) + `apps/web/src/style.css` (tokens)
4. **Jangan:** `npm install` (pakai `npm ci`), `navigator.clipboard` tanpa fallback, `background #FFF` hardcode, `feat` untuk docs
5. **Test:** `npm run build` + `npx tsc --noEmit` + `npx eslint src --ext .ts --max-warnings 0` harus 0

---

## 📦 Project Snapshot

| Item        | Detail                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| **Package** | `bits-qris` — `https://www.npmjs.com/package/bits-qris`                  |
| **Repo**    | `Banten-IT-Solutions/BITS-QRIS-Converter`                                |
| **Demo**    | `https://qris.bits.co.id` — Cloudflare Workers + Hono + Vite             |
| **Node**    | `>=24.0.0` LTS — `@types/node ^24.9.0`                                   |
| **Version** | Single source `package.json` → `vite.config.ts` `define __APP_VERSION__` |

## 🧭 Repo Map — Mana yang Di-edit?

```
bits-qris/
├── src/core/         → PURE, no I/O. Jangan pakai fs/fetch di sini.
├── src/image/        → Jimp + QR. Berat, jangan import di Workers client.
├── src/cli/          → CLI only. Jangan import di web.
├── apps/web/
│   ├── src/client.tsx  ← 90% UI ada di sini (innerHTML string). Edit di sini!
│   ├── src/style.css   ← Tokens & components (terminal/paper, dark/light)
│   ├── src/index.ts    ← Hono API: /api/convert, /api/health
│   ├── index.html      ← Early theme script (anti-FOUC) + fonts
│   └── vite.config.ts  ← define __APP_VERSION__, PWA, cloudflare plugin
└── package.json      ← workspaces: apps/*
```

> **Aturan emas:** Web `client.tsx` adalah **vanilla TS + innerHTML**, bukan React. Semua `addEventListener` setelah `render()`.

## 🛠️ Stack yang Dipakai Agent

| Layer    | Pakai ini                               | Jangan pakai ini  |
| -------- | --------------------------------------- | ----------------- |
| Language | `TypeScript 6.0`, `Node 24`             | `any`, `eval`     |
| QR       | `qrcode` 1.5.4                          | `qrcode-terminal` |
| Image    | `jimp` 1.6.1                            | `sharp` di web    |
| Web      | `Hono 4.13`, `Vite 8`, `Wrangler 4.127` | `Next.js`         |
| Lint     | `ESLint 10`, `Prettier 3`, `Husky 9`    | `jshint`          |

## 🎨 Design Tokens — Jangan Ubah Sembarangan

| Token         | Light               | Dark          | Pakai untuk                             |
| ------------- | ------------------- | ------------- | --------------------------------------- |
| `bg`          | `#FFFBF5`           | `#0A0C10`     | Body                                    |
| `card`        | `#FFFFFF`           | `#161A22`     | Cards, buttons (semua `bg var(--card)`) |
| `line-strong` | `#C8C0B0` warm gray | `#2F3542`     | Border tegas                            |
| `terminal-bg` | `#FFFFFF` paper     | `#06080C` ink | Terminal window                         |
| `muted`       | `#6B6B6b`           | `#9AA0A8`     | Hint, label                             |

- **Font:** `Instrument Serif` (h1) + `JetBrains Mono` (terminal/mono) + `system sans`
- **Buttons:** Semua `bg var(--card)`, beda cuma `border` (`line-strong` vs `line`) — **jangan beda background**
- **Toast:** `bg var(--card)` + `mono` + emoji (`✨📋📦⚡🔗📥⚠️`) — **bukan hijau**
- **Toggle:** `data-theme` + `localStorage bits-theme` + early script di `index.html`

## 🚀 Commands — Copy-Paste Ready untuk Agent

```bash
# Setup (agent pertama kali)
npm ci
npm run build                    # wajib, cek dist/cjs + dist/esm

# Dev & Preview
npm run dev --workspace=@bits/web          # dev
npm run build --workspace=@bits/web && npx vite preview --host --port 4173  # preview

# Deploy (jangan deploy tanpa konfirmasi user)
npm run deploy --workspace=@bits/web

# Quality Gate (wajib 0 sebelum commit)
npm run lint:eslint -- --max-warnings 0
npm run lint          # tsc --noEmit
npm run format        # prettier --check
npm test              # node --test
```

## 🔌 API Contract — Jangan Ubah Tanpa Sync Web

| Endpoint       | Method | Params                                                 | Return                          |
| -------------- | ------ | ------------------------------------------------------ | ------------------------------- |
| `/api/convert` | GET    | `qris`, `amount`, `fee`, `type` (`fixed`/`percentage`) | `{dynamic, qrDataUrl, valid}`   |
| `/api/health`  | GET    | —                                                      | `{ok:true, worker:"bits-qris"}` |

> `convertQris` & `makeQrDataUrl` adalah **pure JS** — aman di Workers. `makeFile` (Jimp) jangan dipanggil di edge.

## 📝 Conventions — Auto-Fail jika Dilanggar

| Aturan       | Benar                                                         | Salah                |
| ------------ | ------------------------------------------------------------- | -------------------- |
| **File**     | `kebab-case` → `qr-renderer.ts`                               | `QrRenderer.ts`      |
| **Type**     | `PascalCase` → `QrisData`                                     | `qrisData`           |
| **Function** | `camelCase` → `convertQris`                                   | `ConvertQris`        |
| **Commit**   | `feat:`, `fix:`, `docs:`, `chore:`                            | `Update`, `fix bug`  |
| **Release**  | `docs`/`chore` → **no release** (sudah fix `.releaserc.json`) | `docs` trigger patch |
| **Lint**     | `npm run lint:eslint -- --max-warnings 0` harus 0             | `max-warnings 10`    |

## ⚠️ Gotchas — Agent Sering Kena

| Masalah                       | Solusi                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| **PWA banner dobel**          | `position:fixed bottom:16px` + `role=dialog` — bukan di atas navbar                             |
| **Select arrow dobel**        | `appearance:none !important` + `::-ms-expand{display:none}` + custom `background-image`         |
| **QR empty bg putih di dark** | `qr-wrap` pakai `var(--card-soft)` / `#0F1217` — jangan `#FFF` hardcode                         |
| **Copy gagal di http**        | Pakai helper `copyText()` dengan `execCommand` fallback — jangan `navigator.clipboard` langsung |
| **Version tidak sinkron**     | `__APP_VERSION__` via `vite.config.ts` `define` — jangan hardcode `1.1.1`                       |
| **Field error**               | Class `field-error` → `border var(--accent-2)` + `bg #FFF2EF` — tanpa `div.alert`               |
| **Button bg beda**            | Semua `bg var(--card)` — beda cuma `border` — jangan kasih `bg navy` di primary                 |
| **Toast hijau**               | `bg var(--card)` + `mono` — jangan `bg #EFF8F5` hijau                                           |

## ✅ Checklist Sebelum Push — Agent Wajib Jalankan

```bash
npm run lint:eslint -- --max-warnings 0  # 0 warning
npm run lint                             # tsc 0 error
npm run build                            # dist/cjs + dist/esm ada
npm run build --workspace=@bits/web      # vite build ok
# jika ubah web:
npx tsc --noEmit -p apps/web/tsconfig.json  # optional
```

## 🧠 Agent Workflow — Contoh

**User:** "Ganti hero jadi lebih compact"

1. Baca `apps/web/src/client.tsx` (render string) + `style.css` (hero, terminal)
2. Edit `client.tsx` — ubah `hero-copy h1` + `hero-meta chips`
3. Edit `style.css` — sesuaikan `.hero`, `.chip`
4. Jalankan `npm run build --workspace=@bits/web` → cek `dist/client/assets/*.js` tidak error
5. Tanya user: "Mau commit sebagai `feat(web): compact hero`?"

---

## 📚 Docs to Keep Sync (jangan lupa update)

- `README.md` — Features, Instalasi (5 tabs), Quick Start, Architecture 1-line, Node 24 badge
- `apps/web/README.md` — Stack, Design, Dev 5-step, API table
- `CONTRIBUTING.md` — Prasyarat Node 24, 5-step workflow
- `SECURITY.md` — Supported Versions, Reporting table
- `.github/pull_request_template.md` — iconic checklist Production Ready

---

<div align="center">

**BITS QRIS Converter** · Node 24 LTS · Dibuat di Banten 🇮🇩 · `qris.bits.co.id` · Untuk AI Agents — baca Gotchas dulu!

</div>
