# 🤝 Contributing to BITS QRIS Converter

> Terima kasih sudah mau berkontribusi! Dibuat di Banten, untuk Indonesia 🇮🇩

## 📋 Prasyarat

| Kebutuhan           | Versi                   | Catatan                                                   |
| ------------------- | ----------------------- | --------------------------------------------------------- |
| **Node.js**         | `>=24` LTS              | Disarankan `24.x` terbaru — cek `node -v`                 |
| **Package Manager** | `npm 10+`               | Wajib `npm ci` (jangan `npm install` biar lock konsisten) |
| **OS**              | macOS / Linux / Windows | Tested di Ubuntu + Cloudflare Workers                     |

## 🚀 Alur Kerja

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

### 3️⃣ Code — Standard

`kebab-case` file, `PascalCase` type, `camelCase` function — `npm run lint` & `npx tsc --noEmit` harus **0**.

### 4️⃣ Commit — Conventional Commits

```bash
git commit -m "feat: tambah validasi QRIS v2"
# type: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
```

> Di-enforce oleh `commitlint` + `husky` — lihat log jika ditolak.

### 5️⃣ Push & PR

Push ke fork → buka PR → template otomatis terisi di `.github/pull_request_template.md` — isi checklist **Production Ready**.

## 🪝 Pre-commit

`husky` + `lint-staged` (`eslint --fix`, `prettier`) & `commitlint` — jika gagal, fix lalu `git add` lagi.

## 🧪 Testing

```bash
npm run build && npm run lint && npx tsc --noEmit
node ./dist/cjs/cli.js --help
```

## 📦 Publish

```bash
npm version patch|minor|major
git push --follow-tags
# atau push tag v1.0.1 → GitHub Actions Release otomatis publish ke NPM (semantic-release)
```

## ❓ Butuh Bantuan?

Buka **Issue** dengan template di `.github/ISSUE_TEMPLATE/` — bug_report / feature_request sudah siap.

---

<div align="center">

**BITS QRIS Converter** · Node 24 LTS · Dibuat di Banten 🇮🇩

</div>
