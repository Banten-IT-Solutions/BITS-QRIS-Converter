# 🤝 Contributing to BITS QRIS Converter

> Terima kasih sudah mau berkontribusi! Dibuat di Banten, untuk Indonesia 🇮🇩

## 📋 Prasyarat

| Kebutuhan           | Versi                   | Catatan                                                   |
| ------------------- | ----------------------- | --------------------------------------------------------- |
| **Node.js**         | `>=24` LTS              | Disarankan `24.x` terbaru — cek `node -v`                 |
| **Package Manager** | `npm 10+`               | Wajib `npm ci` (jangan `npm install` biar lock konsisten) |
| **OS**              | macOS / Linux / Windows | Tested di Ubuntu + Cloudflare Workers                     |

## 🚀 Alur Kerja — 5 Langkah

### 1️⃣ Fork & Clone

```bash
git clone https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter.git
cd BITS-QRIS-Converter
npm ci
```

### 2️⃣ Buat Branch

```bash
git checkout -b feat/keren
# contoh: feat/validasi-v2, fix/crc-edge, docs/landing-update
```

### 3️⃣ Code — Ikuti Standard

| Aturan       | Contoh                                               |
| ------------ | ---------------------------------------------------- |
| **File**     | `kebab-case` → `qr-renderer.ts`                      |
| **Type**     | `PascalCase` → `QrisData`                            |
| **Function** | `camelCase` → `convertQris`                          |
| **Check**    | `npm run lint` & `npx tsc --noEmit` harus **0**      |
| **Build**    | `npm run build` harus lolos + `makeFile` manual test |

### 4️⃣ Commit — Conventional Commits

```bash
git commit -m "feat: tambah validasi QRIS v2"
# type: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
```

> Di-enforce oleh `commitlint` + `husky` — lihat log jika ditolak.

### 5️⃣ Push & PR

Push ke fork → buka PR → template otomatis terisi di `.github/pull_request_template.md` — isi checklist **Production Ready**.

## 🪝 Pre-commit Hook — Otomatis

| Hook                    | Aksi                                                        |
| ----------------------- | ----------------------------------------------------------- |
| **Husky + lint-staged** | `eslint --fix` + `prettier --write` pada `src/**/*.{ts,js}` |
| **commitlint**          | Cek format commit harus Conventional                        |

Jika hook gagal → fix → `git add` lagi. Bypass darurat (jangan sering):

```bash
git commit --no-verify -m "chore: wip"
```

## 🧪 Testing — Checklist

```bash
npm run build              # dual ESM/CJS + copy assets
npm run lint               # tsc --noEmit
npx eslint src --ext .ts --max-warnings 0
npx tsc --noEmit           # 0 error
# manual
node --input-type=module -e "import('./dist/esm/index.js').then(m=>m.convertQris)"
node ./dist/cjs/cli.js --help
# web
npm run build --workspace=@bits/web && npx vite preview --host
```

## 📦 Publish — Hanya Maintainer

```bash
npm version patch|minor|major
git push --follow-tags
# atau push tag v1.0.1 → GitHub Actions Release otomatis publish ke NPM (semantic-release)
```

## ❓ Butuh Bantuan?

Buka **Issue** dengan template di `.github/ISSUE_TEMPLATE/` — bug_report / feature_request sudah siap.

---

<div align="center">

**BITS QRIS Converter** · `classic × terminal × paper` · Node 24 LTS · Dibuat di Banten 🇮🇩

</div>
