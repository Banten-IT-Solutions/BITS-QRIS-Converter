<div align="center">
  <h1>BITS QRIS Converter</h1>
  <p>
    <a href="https://qris.bits.co.id">
      <img src="https://img.shields.io/badge/qris.bits.co.id-Online-00C853?style=for-the-badge&logo=cloudflare&logoColor=white" alt="qris.bits.co.id Online" />
    </a>
  </p>
  <p>Hybrid terbaik — Core TLV presisi + Cetak Struk siap print. Convert QRIS Static → Dynamic dengan parser EMVCo, validator CRC, dan generator QR untuk produksi.</p>
  <br>
  <p>
    <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Hono-4.13-E36002?style=flat&logo=hono&logoColor=white" alt="Hono" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=flat&logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
    <img src="https://img.shields.io/badge/Node-22-339933?style=flat&logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/jimp-1.6-000000?style=flat" alt="jimp" />
    <img src="https://img.shields.io/badge/license-MIT-1F2937?style=flat" alt="MIT" />
    <a href="https://saweria.co/bantenitsolutions"><img src="https://img.shields.io/badge/Saweria-Donate-ffae00?style=flat&logo=heart&logoColor=white" alt="Saweria" /></a>
  </p>
</div>

---

## ✨ Features

| Feature              | Description                                                                        |
| -------------------- | ---------------------------------------------------------------------------------- |
| **Parser TLV**       | Decode QRIS ke `QrisData` — merchant, kota, MCC, currency, amount, fee (EMVCo)     |
| **Static → Dynamic** | Inject amount & fee (fixed/percentage), recalculate CRC16-CCITT `0x1021`           |
| **Validator**        | Cek prefix `000201`, length, CRC, 8 required tags + merchant 26–51                 |
| **Cetak Struk**      | Composite QR ke `qris-receipt-template.png` (1080×1920) + overlay NMID/ID/nama/NNS |
| **Browser Ready**    | `makeFile(...,{base64:true})` → DataURL, tanpa `fs`                                |
| **Dual Build**       | `dist/cjs` + `dist/esm` + `types`, tree-shakeable                                  |
| **CLI**              | `npx bits-qris` interactive atau `--convert --validate --parse`                    |
| **PWA**              | Offline-capable, `manifest` + `sw.js` (Workbox), installable                       |
| **Aset Clean**       | `kebab-case` semantik (`title-bebas-neue`, `body-roboto-large`)                    |

## 🛠️ Tech Stack

| Layer           | Technology                                                               |
| --------------- | ------------------------------------------------------------------------ |
| **Language**    | TypeScript 6.0, Node 22                                                  |
| **QR Generate** | `qrcode` 1.5.4                                                           |
| **Image**       | `jimp` 1.6.1                                                             |
| **Web Demo**    | Hono 4.13, Vite 8, `vite-plugin-pwa` 1.3, `@cloudflare/vite-plugin` 1.54 |
| **Build**       | `tsc` dual ESM/CJS, Wrangler 4.127                                       |
| **Lint/Format** | ESLint 10, Prettier 3, Husky 9, lint-staged 17, commitlint 21            |
| **Deploy**      | Cloudflare Workers (`qris.bits.co.id`), GitHub Actions, semantic-release |

## 📁 Project Structure

```text
bits-qris-converter/
├── src/
│   ├── core/               # pure, no I/O
│   │   ├── constants.ts    # TAG, REQUIRED_TAGS
│   │   ├── types.ts        # TlvElement, QrisData
│   │   ├── crc16.ts
│   │   ├── parser.ts       # parseTlv, parseQris
│   │   ├── converter.ts
│   │   ├── validator.ts
│   │   └── index.ts
│   ├── shared/
│   │   ├── errors.ts
│   │   └── format.ts
│   ├── image/
│   │   ├── types.ts
│   │   ├── merchant-info.ts
│   │   ├── qr-renderer.ts
│   │   ├── font-loader.ts  # cached Jimp
│   │   ├── template-resolver.ts
│   │   ├── receipt-generator.ts
│   │   └── index.ts
│   ├── cli/
│   │   ├── constants.ts
│   │   ├── parser.ts
│   │   ├── commands.ts
│   │   └── interactive.ts
│   ├── index.ts
│   └── cli.ts
├── assets/
│   ├── images/qris-receipt-template.png
│   └── fonts/              # kebab-case semantic
│       ├── title-bebas-neue/
│       ├── title-bebas-neue-compact/
│       ├── body-roboto-large/
│       ├── body-roboto-medium/
│       └── caption-roboto-small/
├── apps/web/               # Hono + Vite + Cloudflare demo (qris.bits.co.id)
│   ├── src/client.tsx
│   ├── src/style.css
│   ├── vite.config.ts
│   └── wrangler.jsonc
├── examples/
├── dist/                   # build (esm + cjs)
└── package.json
```

## 🚀 Quick Start

### Prerequisites

| Tool     | Version                                |
| -------- | -------------------------------------- |
| Node.js  | **22 LTS**                             |
| npm      | **11**                                 |
| Wrangler | **4.127** (hanya untuk deploy Workers) |

### Install

```bash
git clone https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter.git
cd BITS-QRIS-Converter
npm ci
npm run build
```

### Library

```typescript
import { convertQris, parseQris, validateQris } from 'bits-qris-converter';

const staticQris =
  '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG6304DA44';

const { valid, errors } = validateQris(staticQris);
const info = parseQris(staticQris); // BANTEN IT SOLUTIONS / SERANG

const dynamic = convertQris(staticQris, {
  amount: 50_000,
  fee: { type: 'fixed', value: 1000 },
});
```

```typescript
// Legacy (qris-dinamis 1.x)
import { makeString, makeFile } from 'bits-qris-converter';
const dynamic = makeString(staticQris, { nominal: '50000', taxtype: 'r', fee: '1000' });
```

### Cetak Struk

```typescript
import { makeFile, makeQrDataUrl, getMerchantInfo } from 'bits-qris-converter';

// Node — JPG struk
const path = await makeFile(staticQris, { amount: 75_000, path: 'output/struk.jpg' });

// Browser — DataURL
const base64 = await makeFile(staticQris, { amount: 75_000, base64: true });
const qrDataUrl = await makeQrDataUrl(staticQris, { amount: 50_000 });

// Custom template
await makeFile(staticQris, { amount: 50_000, templatePath: 'assets/images/custom.png' });
```

### CLI

```bash
npx bits-qris                                  # interactive
npx bits-qris --validate "000201010211..."
npx bits-qris --parse "000201010211..."
npx bits-qris --convert "000201010211..." 50000
npx bits-qris --convert "000201010211..." 50000 --fee 1000 --type fixed --image output/struk.jpg
npx bits-qris --convert "000201010211..." 50000 --base64
```

Tambahkan ke `package.json`:

```json
{
  "scripts": {
    "qris": "bits-qris",
    "qris:convert": "bits-qris --convert"
  }
}
```

```bash
npm run qris:convert -- "000201010211..." 50000
```

### Web Demo (Hono + Cloudflare)

```bash
npm ci
npm run build --workspace=@bits/web
npm run dev --workspace=@bits/web   # http://localhost:5173
npm run deploy --workspace=@bits/web # → https://qris.bits.co.id
```

## 📚 API Reference

### Core

| Fungsi                    | Params                   | Return            | Deskripsi              |
| ------------------------- | ------------------------ | ----------------- | ---------------------- |
| `parseTlv(data)`          | `string`                 | `TlvElement[]`    | Low-level TLV EMVCo    |
| `parseQris(qris)`         | `string`                 | `QrisData`        | Parse struktur lengkap |
| `validateQris(qris)`      | `string`                 | `{valid, errors}` | Validasi 8 tags + CRC  |
| `isValidQris(qris)`       | `string`                 | `boolean`         | Shortcut               |
| `calculateCrc16(str)`     | `string`                 | `string`          | CRC16-CCITT `0x1021`   |
| `convertQris(qris, opts)` | `string, ConvertOptions` | `string`          | Static → Dynamic       |
| `makeString(qris, opts)`  | `string, opts`           | `string`          | Alias legacy+modern    |
| `getMerchantInfo(qris)`   | `string`                 | `MerchantInfo`    | NMID, printer, NNS     |

### Image

| Fungsi                      | Params           | Return                    |
| --------------------------- | ---------------- | ------------------------- |
| `makeFile(qris, opts)`      | `ImageOptions`   | `Promise<string>`         |
| `makeQrDataUrl(qris, opts)` | `QrOnlyOptions`  | `Promise<string>` DataURL |
| `makeQrBuffer(qris, opts)`  | `QrOnlyOptions`  | `Promise<Buffer>`         |
| `formatRupiah(v)`           | `number\|string` | `string`                  |

## 🧪 Testing & Publish

```bash
npm run build        # clean + build:esm + build:cjs + copy:assets
npx tsc --noEmit
npx eslint src --ext .ts
npm pack --dry-run   # 230 files, 952KB
npm publish --access public
```

Release otomatis via **semantic-release** — push `feat:`/`fix:` ke `main` → versi + `CHANGELOG.md` + GitHub Release + NPM publish.

## 🤝 Contributing

PR sangat diterima!

1. Fork → `git checkout -b feat/keren`
2. `npm ci && npm run build`
3. `npm run lint && npx tsc --noEmit`
4. Commit `feat: ...` (commitlint) → Push → PR

Lihat `CONTRIBUTING.md` & `SECURITY.md`.

## 💝 Dukung BITS

Jika library ini membantu bisnismu, traktir kopi via **Saweria** — 100% untuk open-source 🇮🇩

<p align="center">
  <a href="https://saweria.co/bantenitsolutions"><img src="https://img.shields.io/badge/Saweria.co-bantenitsolutions-ffae00?style=for-the-badge&logo=heart&logoColor=white" alt="Saweria" /></a>
</p>

## 📄 License

MIT © 2026 Banten IT Solutions (BITS) — https://bits.co.id<br/>
Original inspirations (MIT): `verssache/qris-dinamis`, `agungjsp/Dynamic-QRIS`, `razisek/Qris-Dinamis` — terima kasih!

Lihat [`LICENSE`](./LICENSE).

<p align="center">
  Dibuat dengan ❤️ untuk ekosistem QRIS Indonesia —<br/>
  <strong>BITS: Bikin QRIS Jadi Dinamis, Clean & Siap Produksi.</strong><br/>
  <a href="https://bits.co.id">bits.co.id</a> • <a href="https://qris.bits.co.id">qris.bits.co.id</a>
</p>
