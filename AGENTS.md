# 🤖 AGENTS.md — BITS QRIS Converter

> Panduan untuk AI agents (Muse, Cursor, Copilot, dll) yang bekerja di repo ini — biar konsisten dengan `classic × terminal × paper` & Node 24 LTS.

## 📦 Project Overview

| Item        | Detail                                                                |
| ----------- | --------------------------------------------------------------------- |
| **Nama**    | `bits-qris` — QRIS Static → Dynamic converter + cetak struk           |
| **Repo**    | `Banten-IT-Solutions/BITS-QRIS-Converter`                             |
| **Package** | `bits-qris` di NPM — `https://www.npmjs.com/package/bits-qris`        |
| **Demo**    | `https://qris.bits.co.id` — Cloudflare Workers + Hono + Vite          |
| **Node**    | `>=24.0.0` (LTS) — `@types/node ^24.9.0`                              |
| **Theme**   | Light paper `#FFFFFF` / Dark ink `#06080C` — adaptif via `data-theme` |

## 🧭 Repo Structure

```
bits-qris/
├── src/
│   ├── core/               # pure, no I/O — parser, converter, validator, crc16
│   ├── shared/             # errors, format
│   ├── image/              # jimp, qr-renderer, receipt-generator, merchant-info
│   ├── cli/                # interactive, commands, parser
│   ├── index.ts            # public barrel (ESM+CJS)
│   └── cli.ts              # bin wrapper
├── assets/
│   ├── images/qris-receipt-template.png (1080×1920)
│   └── fonts/              # kebab-case: title-bebas-neue, body-roboto-*, caption-*
├── apps/web/               # Hono + Vite + Cloudflare Workers — qris.bits.co.id
│   ├── src/client.tsx      # vanilla TS, innerHTML render, semua logic di sini
│   ├── src/style.css       # design tokens + terminal/paper components
│   ├── src/index.ts        # Hono app — /api/convert, /api/health
│   ├── vite.config.ts      # define __APP_VERSION__ from root package.json
│   └── wrangler.jsonc      # assets + custom domain
├── examples/               # basic.mjs, legacy.cjs
├── dist/                   # build output (cjs + esm + assets)
└── package.json            # workspaces: apps/*
```

## 🛠️ Tech Stack

| Layer        | Stack                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------- |
| **Language** | TypeScript 6.0, Node 24 LTS                                                              |
| **QR**       | `qrcode` 1.5.4                                                                           |
| **Image**    | `jimp` 1.6.1                                                                             |
| **Web**      | Hono 4.13, Vite 8, `@cloudflare/vite-plugin` 1.54, `vite-plugin-pwa` 1.3, Wrangler 4.127 |
| **Build**    | `tsc` dual ESM/CJS, `wrangler deploy`                                                    |
| **Lint**     | ESLint 10, Prettier 3, Husky 9, commitlint 21                                            |

## 🎨 Design System — Classic × Terminal × Paper (Opsi B)

| Token             | Light               | Dark          |
| ----------------- | ------------------- | ------------- |
| `bg`              | `#FFFBF5`           | `#0A0C10`     |
| `card`            | `#FFFFFF`           | `#161A22`     |
| `line-strong`     | `#C8C0B0` warm gray | `#2F3542`     |
| `terminal-bg`     | `#FFFFFF` paper     | `#06080C` ink |
| `terminal-border` | `#C8C0B0`           | `#232833`     |

- **Font:** `Instrument Serif` (judul) + `JetBrains Mono` (terminal/kode) + system sans
- **Layout:** grid 12, border 1px, whitespace, paper cards + terminal windows
- **Toggle:** `data-theme` (`light`/`dark`) + `localStorage bits-theme` + `prefers-color-scheme` + early script di `index.html` anti-FOUC
- **Components:** `TerminalWindow`, `PaperCard`, `StepCard` (equal-height flex), `Chip`, `CodeBlock`, `Toast` (paper, mono), `PWA banner` (bottom sheet)

## 🚀 How to Run

```bash
# 1. Install
npm ci

# 2. Build core (wajib 1x)
npm run build                    # → dist/cjs + dist/esm

# 3. Dev web
npm run dev --workspace=@bits/web  # → http://localhost:5173
# atau
cd apps/web && npm run dev

# 4. Preview production
npm run build --workspace=@bits/web && npx vite preview --host --port 4173

# 5. Deploy
npm run deploy --workspace=@bits/web  # → qris.bits.co.id
```

## 🔌 API — Cloudflare Workers (Hono)

| Endpoint                                                     | Params                          | Return                          |
| ------------------------------------------------------------ | ------------------------------- | ------------------------------- |
| `GET /api/convert?qris=...&amount=50000&fee=1000&type=fixed` | `qris`, `amount`, `fee`, `type` | `{dynamic, qrDataUrl, valid}`   |
| `GET /api/health`                                            | —                               | `{ok:true, worker:"bits-qris"}` |

> `convertQris` pure JS jalan di Workers. `makeFile` (Jimp) **tidak** di edge — pakai `makeQrDataUrl` (5KB).

## 📝 Conventions — Wajib Ikut

| Aturan       | Detail                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **File**     | `kebab-case` → `qr-renderer.ts`                                                                                       |
| **Type**     | `PascalCase` → `QrisData`                                                                                             |
| **Function** | `camelCase` → `convertQris`                                                                                           |
| **Commit**   | Conventional Commits — `feat:`, `fix:`, `docs:`, `chore:` — di-enforce `commitlint`                                   |
| **Release**  | `semantic-release` — `feat`→minor, `fix`/`perf`→patch, `docs`/`chore`→**no release** (sudah di-fix `.releaserc.json`) |
| **Lint**     | `npm run lint` (`tsc --noEmit`) + `npx eslint src --ext .ts --max-warnings 0` harus 0                                 |

## ⚠️ Gotchas — Jangan Kena Lagi

- **PWA banner:** `position:fixed bottom` — bukan di atas navbar, pakai `role=dialog`
- **Select arrow:** `appearance:none !important` + `::-ms-expand{display:none}` + `background-image` custom — biar tidak dobel di dark
- **QR empty bg:** `qr-wrap` pakai `var(--card-soft)` / `#0F1217` — jangan `#FFF` hardcode di dark
- **Toast:** `bg var(--card)` + `mono` + emoji (`✨📋📦⚡🔗📥⚠️`) — bukan hijau success
- **Buttons:** semua `bg var(--card)` — beda cuma `border` (`line-strong` vs `line`) — jangan beda background
- **Copy:** pakai helper `copyText()` dengan `execCommand` fallback — jangan `navigator.clipboard` mentah (gagal di http)
- **Version:** `__APP_VERSION__` via `vite.config.ts` `define` dari root `package.json` — single source of truth
- **Field error:** `field-error` class → `border var(--accent-2)` + `bg #FFF2EF` — tanpa `div.alert` teks

## 🧪 Testing & CI

| Job       | Command                                                                       |
| --------- | ----------------------------------------------------------------------------- |
| **Lint**  | `npm run lint:eslint -- --max-warnings 0` + `npm run format` + `npm run lint` |
| **Build** | `npm run build` → cek `dist/cjs/index.js`, `dist/esm/index.js`, `dist/assets` |
| **Test**  | `npm test` + `node --test` + `node ./dist/cjs/cli.js --help`                  |
| **CI**    | `.github/workflows/ci.yml` — Node 24 only                                     |

## 📚 Docs to Keep Sync

- `README.md` — Features, Instalasi (5 tabs), Quick Start, Architecture ringkas, Node 24 badge
- `apps/web/README.md` — Stack Latest, Design, Dev 4-step, API table, Deploy table
- `CONTRIBUTING.md` — Prasyarat Node 24, 5-step workflow, Pre-commit, Testing 2-line
- `SECURITY.md` — Supported Versions, Reporting table, Best Practices table
- `.github/pull_request_template.md` — iconic checklist Production Ready

---

<div align="center">

**BITS QRIS Converter** · Node 24 LTS · Dibuat di Banten 🇮🇩 · `qris.bits.co.id`

</div>
