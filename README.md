<div align="center">

  <h1>⚡ BITS QRIS Converter</h1>
  <p>
    <a href="https://qris.bits.co.id">
      <img src="https://img.shields.io/badge/qris.bits.co.id-Online-00C853?style=for-the-badge&logo=cloudflare&logoColor=white" alt="qris.bits.co.id Online" />
    </a>
  </p>
  <p>
    <a href="https://www.npmjs.com/package/bits-qris"><img src="https://img.shields.io/npm/v/bits-qris?logo=npm&logoColor=white&label=npm&color=CB3837" alt="npm version" /></a>
    <a href="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter/actions/workflows/ci.yml"><img src="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
    <a href="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter/actions/workflows/deploy-cloudflare.yml"><img src="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter/actions/workflows/deploy-cloudflare.yml/badge.svg" alt="Deploy" /></a>
    <a href="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter/actions/workflows/uptime.yml"><img src="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter/actions/workflows/uptime.yml/badge.svg" alt="Uptime" /></a>
  </p>
  <p>Hybrid terbaik — Core TLV presisi + Cetak Struk siap print. Convert QRIS Static → Dynamic dengan parser EMVCo, validator CRC, dan generator QR untuk produksi.</p>
  <br>
  <p>
    <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Hono-4.13-E36002?style=flat&logo=hono&logoColor=white" alt="Hono" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=flat&logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
    <img src="https://img.shields.io/badge/Node-24-339933?style=flat&logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/jimp-1.6-000000?style=flat" alt="jimp" />
    <img src="https://img.shields.io/badge/license-MIT-1F2937?style=flat" alt="MIT" />
    <a href="https://saweria.co/bantenitsolutions"><img src="https://img.shields.io/badge/Saweria-Donate-ffae00?style=flat&logo=heart&logoColor=white" alt="Saweria" /></a>
  </p>
</div>

---

## 🧭 Daftar Isi

| Menu                                   | Deskripsi                              |
| -------------------------------------- | -------------------------------------- |
| [✨ Features](#-features)              | Fitur utama — parser, converter, struk |
| [📦 Instalasi](#-instalasi)            | Cara pasang — npm/pnpm/bun/yarn        |
| [⚡ Quick Start](#-quick-start)        | Mulai cepat — modern & legacy API      |
| [🖨️ Cetak Struk](#️-cetak-struk)        | Generate struk JPG + QR                |
| [🌐 Web Demo](https://qris.bits.co.id) | Demo — dark/light, install tabs        |
| [💻 CLI](#-cli)                        | `npx bits-qris` interactive            |
| [📚 API Reference](#-api-reference)    | Core, Image, Shared                    |

---

## ✨ Features — Hybrid Terbaik

| Icon | Feature | Description |
| -------------------- | ---------------------------------------------------------------------------------- |
| 🔍 **Parser TLV** | Decode QRIS → `QrisData` — merchant, kota, MCC, currency, amount, fee (EMVCo) |
| 🔄 **Static → Dynamic** | Inject `amount` & `fee` (fixed/percentage), recalculate **CRC16-CCITT** `0x1021` |
| ✅ **Validator** | Cek `000201`, length, CRC, 8 required tags + merchant `26–51` |
| 🖨️ **Cetak Struk** | Composite QR → `qris-receipt-template.png` (1080×1920) + overlay `NMID/ID/nama/NNS` |
| 🌐 **Browser Ready** | `makeFile(...,{base64:true})` → DataURL, tanpa `fs` |
| 📦 **Dual Build** | `dist/cjs` + `dist/esm` + `types` — tree-shakeable |
| 💻 **CLI** | `npx bits-qris` interactive atau `--convert --validate --parse` |
| 📱 **PWA** | Offline-capable, `manifest` + `sw.js` (Workbox), installable — dark/light |
| 🗂️ **Aset Clean** | `kebab-case` semantik (`title-bebas-neue`, `body-roboto-large`) |

## 🛠️ Tech Stack

| Layer           | Technology                                                               |
| --------------- | ------------------------------------------------------------------------ |
| **Language**    | TypeScript 6.0, Node 24 LTS                                              |
| **QR Generate** | `qrcode` 1.5.4                                                           |
| **Image**       | `jimp` 1.6.1                                                             |
| **Web Demo**    | Hono 4.13, Vite 8, `vite-plugin-pwa` 1.3, `@cloudflare/vite-plugin` 1.54 |
| **Build**       | `tsc` dual ESM/CJS, Wrangler 4.127                                       |
| **Lint/Format** | ESLint 10, Prettier 3, Husky 9, lint-staged 17, commitlint 21            |
| **Deploy**      | Cloudflare Workers (`qris.bits.co.id`), GitHub Actions, semantic-release |

## 📁 Project Structure

```text
bits-qris/
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

## 📦 Instalasi — Satu Baris

| Manager           | Perintah                                           |
| ----------------- | -------------------------------------------------- |
| **npm**           | `npm i bits-qris`                                  |
| **pnpm**          | `pnpm add bits-qris`                               |
| **bun**           | `bun add bits-qris`                                |
| **yarn**          | `yarn add bits-qris`                               |
| **tanpa install** | `npx bits-qris convert "000201..." --amount 50000` |

```bash
# cek instalasi
node -e "import('bits-qris').then(m=>console.log(Object.keys(m).slice(0,5)))"
```

> **Requirements:** Node.js `>=24` (LTS) · ESM + CJS + Types · `qrcode` 1.5 + `jimp` 1.6

---

## ⚡ Quick Start

### Modern API (Direkomendasikan)

```typescript
import { convertQris, parseQris, validateQris } from 'bits-qris';

const staticQris =
  '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG6304DA44';

// 1. Validasi dulu (opsional tapi disarankan)
const { valid, errors } = validateQris(staticQris);
if (!valid) console.error(errors);

// 2. Parse info merchant
const info = parseQris(staticQris);
console.log(info.merchantName); // BANTEN IT SOLUTIONS
console.log(info.merchantCity); // SERANG
console.log(info.method); // static

// 3. Convert → Dynamic
const dynamic = convertQris(staticQris, {
  amount: 50_000,
  fee: { type: 'fixed', value: 1000 }, // atau { type: 'percentage', value: 2.5 }
});
console.log(dynamic); // ...540550000...6304ABCD (CRC baru)
```

### Legacy API (Kompatibel `qris-dinamis 1.x`)

```typescript
import { makeString, makeFile } from 'bits-qris';

// Tetap jalan
const dynamic = makeString(staticQris, { nominal: '50000', taxtype: 'r', fee: '1000' });
const file = await makeFile(staticQris, { nominal: '50000', base64: false });
```

---

## 🖨️ Cetak Struk

```typescript
import { makeFile, makeQrDataUrl, getMerchantInfo } from 'bits-qris';

// 1. Simpan JPG struk (Node.js)
const path = await makeFile(staticQris, {
  amount: 75_000,
  fee: { type: 'percentage', value: 2 },
  path: 'output/struk-75000.jpg', // default: output/<MERCHANT>-<timestamp>.jpg
});
console.log(path); // output/struk-75000.jpg

// 2. Base64 untuk API / <img src>
const base64 = await makeFile(staticQris, { amount: 75_000, base64: true });
// <img src={base64} />  // data:image/jpeg;base64,...

// 3. QR ringan tanpa template (tanpa Jimp, 5KB)
const qrDataUrl = await makeQrDataUrl(staticQris, { amount: 50_000 });
console.log(qrDataUrl.slice(0, 30)); // data:image/png;base64,iVBORw...

// 4. Info merchant untuk overlay kustom
const merchant = getMerchantInfo(staticQris);
console.log(merchant.nmid); // ID1023162526099
console.log(merchant.merchantName); // BANTEN IT SOLUTIONS
console.log(merchant.nns); // 8-char NNS

// 5. Template kustom
await makeFile(staticQris, {
  amount: 50_000,
  templatePath: 'assets/images/custom-template.png', // 1080x1920 PNG
});
```

> Di **Browser** `makeFile` otomatis fallback ke `QR DataURL` (template butuh `fs`). Selalu pakai `{ base64: true }`.

---

## 🌐 Browser

```typescript
import { convertQris, validateQris } from 'bits-qris';

const dynamic = convertQris(qris, { amount: 100_000 });
console.log(validateQris(dynamic).valid); // true

import { makeFile } from 'bits-qris';
const dataUrl = await makeFile(qris, { amount: 100_000, base64: true });
document.querySelector<HTMLImageElement>('#qr')!.src = dataUrl;
```

---

## 💻 CLI

```bash
# Interactive wizard (parse → amount → fee → struk)
npx bits-qris
# atau
npx bits-qris

# One-liner
npx bits-qris --validate "000201010211..."
# {"valid":true,"errors":[]}

npx bits-qris --parse "000201010211..."
# {"merchantName":"BANTEN IT SOLUTIONS", "merchantCity":"SERANG", ...}

npx bits-qris --convert "000201010211..." 50000
# 000201010212...540550000...6304ABCD

npx bits-qris --convert "000201010211..." 50000 --fee 1000 --type fixed --image output/struk.jpg
# 000201010212... + [image] Saved to: output/struk.jpg

npx bits-qris --convert "000201010211..." 50000 --base64
# [base64] data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...

npx bits-qris --help
```

### 📦 Tambahkan ke `package.json` (biar `npm run` lebih singkat)

Copy ini ke `package.json` project kamu (Next.js / SvelteKit / Express):

```json
{
  "scripts": {
    "qris": "bits-qris",
    "qris:help": "bits-qris --help",
    "qris:validate": "bits-qris --validate",
    "qris:parse": "bits-qris --parse",
    "qris:convert": "bits-qris --convert",
    "qris:interactive": "bits-qris",
    "qris:demo": "bits-qris --convert \"00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG6304DA44\" 25000 --image output/demo.jpg"
  }
}
```

Pakai dengan `--` double-dash agar argumen diteruskan:

```bash
npm run qris:interactive
npm run qris:validate -- "000201010211..."
npm run qris:parse -- "000201010211..."
npm run qris:convert -- "000201010211..." 50000
npm run qris:convert -- "000201010211..." 50000 --fee 1000 --type fixed
npm run qris:convert -- "000201010211..." 50000 --fee 2.5 --type percentage --image output/struk.jpg --base64
npm run qris:demo
```

> Tips: Untuk QRIS panjang, simpan di `.env` → `QRIS_STATIC="000201..."` lalu `npm run qris:convert -- "$QRIS_STATIC" 50000`

---

## 📚 API Reference

### Core

| Fungsi                    | Params                   | Return            | Deskripsi                      |
| ------------------------- | ------------------------ | ----------------- | ------------------------------ |
| `parseTlv(data)`          | `string`                 | `TlvElement[]`    | Low-level TLV EMVCo            |
| `parseQris(qris)`         | `string`                 | `QrisData`        | Parse struktur lengkap         |
| `validateQris(qris)`      | `string`                 | `{valid, errors}` | Validasi 8 required tags + CRC |
| `isValidQris(qris)`       | `string`                 | `boolean`         | Shortcut                       |
| `calculateCrc16(str)`     | `string`                 | `string`          | CRC16-CCITT `0x1021`           |
| `convertQris(qris, opts)` | `string, ConvertOptions` | `string`          | **Static → Dynamic**           |
| `makeString(qris, opts)`  | `string, opts`           | `string`          | Alias legacy+modern            |
| `getMerchantInfo(qris)`   | `string`                 | `MerchantInfo`    | NMID, printer, NNS             |

**Deprecated uppercase alias tetap ada** untuk kompatibilitas: `parseQRIS`, `convertQRIS`, `validateQRIS`, `calculateCRC16`.

```typescript
type ConvertOptions = {
  amount: number | string;
  fee?: { type: 'fixed' | 'percentage'; value: number | string };
};

type QrisData = {
  version: string;
  method: 'static' | 'dynamic';
  merchantAccountInfo: MerchantAccountInfo[];
  merchantCategoryCode: string;
  currency: string; // 360 = IDR
  amount?: string;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  crc: string;
  raw: TlvElement[];
};
```

### Image

| Fungsi                        | Params           | Return                               |
| ----------------------------- | ---------------- | ------------------------------------ |
| `makeFile(qris, opts)`        | `ImageOptions`   | `Promise<string>` — path atau base64 |
| `makeImage` / `generateStruk` | —                | alias `makeFile`                     |
| `makeQrDataUrl(qris, opts)`   | `QrOnlyOptions`  | `Promise<string>` DataURL            |
| `makeQrBuffer(qris, opts)`    | `QrOnlyOptions`  | `Promise<Buffer>`                    |
| `formatRupiah(v)`             | `number\|string` | `string` `Rp 50.000`                 |

```typescript
type ImageOptions = ConvertOptions & {
  nominal?: string | number; // legacy alias
  taxtype?: 'p' | 'r';
  base64?: boolean; // default false
  path?: string;
  templatePath?: string; // default assets/images/qris-receipt-template.png
};
```

### Shared

```typescript
import {
  QrisError,
  QrisParseError,
  QrisConvertError,
  QrisImageError,
  formatRupiah,
  padLength,
  sanitizeFilename,
} from 'bits-qris';
```

---

## 🧩 Examples

```bash
# lihat folder examples/
node examples/basic.mjs      # ESM modern
node examples/legacy.cjs     # CJS legacy
```

```typescript
// examples/basic.mjs
import { convertQris, makeFile, parseQris } from 'bits-qris';

const QRIS =
  '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG6304DA44';

const dynamic = convertQris(QRIS, { amount: 25_000 });
console.log(parseQris(dynamic).amount); // 25000

const file = await makeFile(QRIS, { amount: 25_000 });
console.log('Struk:', file); // output/BANTEN_IT_SOLUTIONS-...jpg
```

---

## 🏗️ Arsitektur — Ringkas

```text
Static QRIS → parseTlv → validateQris → convertQris (inject 54/55/56/57, recalc CRC) → Dynamic String → makeFile (Jimp) / DataURL
```

---

## 🛡️ Keamanan & Validasi — Terpercaya

| Item            | Detail                                                             |
| --------------- | ------------------------------------------------------------------ |
| **CRC16-CCITT** | `0x1021` init `0xFFFF` — sesuai EMVCo                              |
| **Validasi**    | 8 required tags + merchant `26–51` + CRC mismatch                  |
| **Aman**        | `jimp@1.6.1` (0 vuln) — bukan `0.16.1` vulnerable                  |
| **No eval**     | Tidak pernah `eval` / `split("5802ID")` fragile — parser TLV murni |

---

## 🧪 Testing & Publish

```bash
npm run build        # clean + build:esm + build:cjs + copy:assets
npx tsc --noEmit
npx eslint src --ext .ts
npm pack --dry-run   # 230 files, 952KB
npm publish --access public
```

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

MIT License. See `LICENSE`.

---

<div align="center">
  <strong>BITS QRIS Converter</strong> · Dibuat dengan ❤️ oleh <a href="https://banten-it-solutions.github.io"><strong>Banten IT Solutions</strong></a>
</div>
