# Contributing to BITS-QRIS-Converter

Terima kasih sudah mau berkontribusi! 🎉

## 📋 Prasyarat

- Node.js `>=24` (LTS, disarankan `24.x` terbaru)
- `npm ci` untuk install (jangan `npm install` biar lock konsisten)

## 🚀 Alur Kerja

1. Fork & clone

   ```bash
   git clone https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter.git
   cd qris-converter
   npm ci
   ```

2. Buat branch

   ```bash
   git checkout -b feat/keren
   ```

3. Code — ikuti standard:
   - `kebab-case` file, `PascalCase` type, `camelCase` function
   - `npm run lint` & `npx tsc --noEmit` harus 0
   - `npm run build` harus lolos, `makeFile` manual test

4. Commit — Conventional Commits (di-enforce `commitlint`)

   ```bash
   git commit -m "feat: tambah validasi QRIS v2"
   # type: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
   ```

5. Push & PR — template sudah ada di `.github/pull_request_template.md`

## 🪝 Pre-commit Hook

Husky + lint-staged jalan otomatis saat `git commit`:

- `eslint --fix` + `prettier --write` pada `src/**/*.{ts,js}`
- `commitlint` cek format commit

Jika hook gagal, fix dan `git add` lagi.

Bypass darurat (jangan sering):

```bash
git commit --no-verify -m "chore: wip"
```

## 🧪 Testing

```bash
npm run build
npm run lint
npx eslint src --ext .ts --max-warnings 0
npx tsc --noEmit
# manual
node --input-type=module -e "import('./dist/esm/index.js').then(m=>m.convertQris)"
node ./dist/cjs/cli.js --help
```

## 📦 Publish

Hanya maintainer:

```bash
npm version patch|minor|major
git push --follow-tags
# atau push tag v1.0.1 → GitHub Actions Release otomatis publish ke NPM
```

## ❓ Butuh Bantuan?

Buka Issue dengan template yang ada di `.github/ISSUE_TEMPLATE/`.
