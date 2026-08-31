# Changelog

Semua perubahan penting akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.1.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/) + [Conventional Commits](https://www.conventionalcommits.org/).

> **Catatan:** Mulai `v1.0.0`, changelog di-generate otomatis oleh **semantic-release** dari commit `feat`/`fix`/`perf`/etc. File ini hanya sebagai mirror — sumber kebenaran ada di [GitHub Releases](../../releases).

## [1.0.0] - 2026-08-31

### ✨ Features

- **Core TLV presisi** — parser rekursif EMVCo, `convertQris` inject `54`/`55`/`56`/`57` + recalc CRC16
- **Validator** — `validateQris` cek 8 required tags + CRC + merchant 26–51
- **Cetak Struk** — `makeFile` (`jimp@1.6.1`) composite QR ke `assets/images/qris-receipt-template.png` (1080×1920) + fonts semantic
- **Dual ESM/CJS** — `dist/esm` + `dist/cjs` + `types`, tree-shakeable
- **CLI** — `npx bits-qris` interactive + `--validate`/`--parse`/`--convert`/`--image`/`--base64`
- **Aset Clean** — `assets/fonts/kebab-case` (`title-bebas-neue`, `body-roboto-*`, `caption-roboto-small`)
- **DX Profesional** — ESLint 10 + Prettier 3 + Husky + lint-staged + commitlint + CI + Dependabot

### 🔧 Chores

- Setup CI (Node 18/20/22), Dependabot weekly, Husky pre-commit, semantic-release

### 📚 Docs

- README total rewrite (hero, quick start, cetak struk, CLI, API, arsitektur)
- LICENSE MIT 2026 BITS

[1.0.0]: https://github.com/bits-id/qris-converter/releases/tag/v1.0.0
