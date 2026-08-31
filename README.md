# BITS-QRIS-Converter

**Hybrid terbaik: Core TLV proper dari `verssache/qris-dinamis` + Fitur Cetak Gambar Struk dari `Dynamic-QRIS`**

Convert QRIS Static → Dynamic dengan validasi CRC, parser EMVCo, dan cetak struk JPG siap print — 1 library untuk Node.js & Browser.

[![npm version](https://img.shields.io/npm/v/bits-qris-converter.svg)](https://www.npmjs.com/package/bits-qris-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

---

## Kenapa BITS-QRIS-Converter?

Dari 5 repo yang dianalisis, BITS menggabungkan kelebihan dan membuang kekurangan:

| Masalah Repo Lama | Solusi BITS |
|---|---|
| `split("5802ID")` fragile — gagal kalau country != ID | ✅ Parser TLV rekursif proper sesuai EMVCo |
| `jimp@0.16.1` vulnerable & `slice(-3)` bug | ✅ `jimp@1.6.0` + CRC fix + null-safe |
| Tidak ada validator | ✅ `validateQRIS()` cek 8 required tags + CRC |
| Cuma QR string, tidak ada gambar struk (verssache) | ✅ `makeFile()` dengan `template.png` + fonts + base64 |
| Cuma library, tidak ada CLI | ✅ CLI interactive + flags `--convert --image --base64` |
| Hanya CommonJS / hanya ESM | ✅ Dual **ESM + CJS** (`import` & `require` both work) |

---

## Instalasi

```bash
npm i bits-qris-converter
# atau
yarn add bits-qris-converter
pnpm add bits-qris-converter
```

Publish ke NPM:

```bash
npm run build
npm publish --access public
```

---

## Usage

### 1. Convert Static → Dynamic (Modern API)

```typescript
import { convertQRIS, parseQRIS, validateQRIS } from 'bits-qris-converter';

const staticQRIS = '00020101021126670016ID.CO.BANK...5802ID5914TOKO BITS6007Jakarta61051234062070703A016304...';

// Validate dulu (recommended)
const { valid, errors } = validateQRIS(staticQRIS);
if (!valid) console.log(errors);

// Parse info merchant
const info = parseQRIS(staticQRIS);
console.log(info.merchantName); // "TOKO BITS"
console.log(info.merchantCity); // "Jakarta"

// Convert dengan nominal + fee opsional
const dynamic = convertQRIS(staticQRIS, {
  amount: 50000,
  fee: { type: 'fixed', value: 1000 } // atau { type: 'percentage', value: 2.5 }
});
console.log(dynamic); // QRIS string siap scan, CRC sudah recalculated
```

### 2. Legacy API (kompatibel qris-dinamis 1.x)

```typescript
import { makeString, makeFile } from 'bits-qris-converter';

// makeString legacy
const dynamic = makeString(staticQRIS, { nominal: '50000', taxtype: 'r', fee: '1000' });

// makeString modern alias
import { convertQRIS } from 'bits-qris-converter';
```

### 3. Cetak Gambar Struk ⭐ Fitur Baru

```typescript
import { makeFile, makeQRDataURL, getMerchantInfo } from 'bits-qris-converter';

// Opsi 1: Simpan ke file JPG dengan template struk
const path = await makeFile(staticQRIS, {
  amount: 75000,
  fee: { type: 'percentage', value: 2 },
  path: 'output/struk-bits.jpg' // optional, default: output/<MERCHANT>-<timestamp>.jpg
});
console.log('Saved to', path); // output/struk-bits.jpg

// Opsi 2: Return base64 untuk web / API response
const base64 = await makeFile(staticQRIS, {
  amount: 75000,
  base64: true
});
// <img src={base64} />

// Opsi 3: QR DataURL ringan tanpa template (tanpa Jimp)
const qrOnly = await makeQRDataURL(staticQRIS, { amount: 50000 });
console.log(qrOnly); // data:image/png;base64,...

// Custom template
await makeFile(staticQRIS, {
  amount: 50000,
  templatePath: 'assets/custom-template.png'
});

// Info merchant untuk overlay
const merchant = getMerchantInfo(staticQRIS);
console.log(merchant.nmid, merchant.merchantName, merchant.nns);
```

**Hasil `makeFile` di Node.js:** composite QR 512x512 di `assets/template.png` (1080x1920) + overlay `NMID`, `ID`, `Merchant Name`, `NNS` dengan font `BebasNeue/Roboto`. Di Browser otomatis fallback ke `QR DataURL` (tanpa template karena butuh fs).

### 4. Browser

```typescript
import { convertQRIS, validateQRIS } from 'bits-qris-converter';

// Convert tetap work 100% di browser
const dynamic = convertQRIS(qris, { amount: 100000 });

// Gambar: wajib pakai base64
import { makeFile } from 'bits-qris-converter';
const dataURL = await makeFile(qris, { amount: 100000, base64: true });
document.querySelector('img').src = dataURL;
```

### 5. CLI

```bash
# Interactive
npx bits-qris
# atau
npx bits-qris-converter

# One-liner
npx bits-qris --convert "000201010211..." 50000 --fee 1000 --type fixed --image output/struk.jpg
npx bits-qris --convert "000201010211..." 50000 --base64
npx bits-qris --validate "000201010211..."
npx bits-qris --parse "000201010211..."
```

---

## API Reference

### Core

| Function | Params | Return | Deskripsi |
|---|---|---|---|
| `parseTLV(data)` | `string` | `TLV[]` | Low-level TLV parser EMVCo |
| `parseQRIS(qris)` | `string` | `QRISData` | Parse struktur merchant, amount, dll |
| `validateQRIS(qris)` | `string` | `{valid, errors}` | Validasi 8 required tags + CRC + merchant 26-51 |
| `isValidQRIS(qris)` | `string` | `boolean` | Shortcut validate |
| `calculateCRC16(str)` | `string` | `string` | CRC16-CCITT `0x1021` |
| `convertQRIS(qris, opts)` | `string, {amount, fee?}` | `string` | Static → Dynamic (TLV proper, CRC recalc) |
| `makeString(qris, opts)` | `string, opts` | `string` | Alias legacy + modern |
| `getMerchantInfo(qris)` | `string` | `{nmid, merchantName, nns, printer, ...}` | Info untuk struk |

### Image

| Function | Params | Return | Deskripsi |
|---|---|---|---|
| `makeFile(qris, opts)` | `string, ImageOptions` | `Promise<string>` | Cetak struk JPG / base64. **Fitur utama BITS** |
| `makeImage` | same | same | Alias `makeFile` |
| `generateStruk` | same | same | Alias `makeFile` |
| `makeQRDataURL(qris, opts)` | `string, opts` | `Promise<string>` | QR DataURL ringan tanpa template |
| `makeQRBuffer(qris, opts)` | `string, opts` | `Promise<Buffer>` | QR Buffer untuk Node |
| `formatRupiah(amount)` | `number|string` | `string` | `Rp 50.000` |

**ImageOptions:**
```typescript
{
  amount: number | string;            // wajib (atau nominal untuk legacy)
  nominal?: string | number;          // alias legacy
  fee?: { type: 'fixed'|'percentage', value: number };
  taxtype?: 'p'|'r';                  // legacy
  feeLegacy?: string | number;
  base64?: boolean;                   // default false
  path?: string;                      // custom output path
  templatePath?: string;              // custom template PNG
}
```

---

## Contoh Lengkap

Lihat `examples/`:

```typescript
// examples/basic.mjs
import { convertQRIS, makeFile, parseQRIS } from 'bits-qris-converter';

const QRIS_STATIC = '00020101021126670016ID.CO.QRIS.WWW0215ID20232154007120303UMI51440014ID.CO.QRIS.WWW0215ID1234567890123456780303UMI5204541153033605802ID5914TOKO BITS JAYA6007JAKARTA61051234062070703A016304...';

const dynamic = convertQRIS(QRIS_STATIC, { amount: 25000 });
console.log(parseQRIS(dynamic));

const file = await makeFile(QRIS_STATIC, { amount: 25000, base64: false });
console.log('Struk:', file);
```

---

## Struktur Project

```
bits-qris-converter/
├── src/
│   ├── core/               # TLV proper (port verssache, improved)
│   │   ├── parser.ts       # parseTLV, parseQRIS
│   │   ├── converter.ts    # convertQRIS (TLV, bukan split)
│   │   ├── validator.ts    # validateQRIS
│   │   ├── crc16.ts        # CRC16-CCITT
│   │   └── types.ts
│   ├── image/
│   │   ├── generator.ts    # makeFile, makeQRDataURL (Jimp + qrcode)
│   │   └── utils.ts        # getMerchantInfo
│   ├── index.ts            # Main export (dual ESM/CJS)
│   └── cli.ts              # CLI interactive + flags
├── assets/
│   ├── template.png        # Template struk 1080x1920
│   └── font/               # BebasNeue, Roboto
├── examples/
├── dist/                   # Build output (esm + cjs)
└── package.json
```

---

## Publish ke NPM

```bash
# 1. Login
npm login

# 2. Update version
npm version patch # atau minor/major

# 3. Build & publish
npm run build
npm publish --access public

# Cek
npm view bits-qris-converter version
```

**package.json sudah config:**
- `main: dist/cjs/index.js` (CJS)
- `module: dist/esm/index.js` (ESM)
- `exports` dual
- `bin: bits-qris`
- `files: dist + assets`

Test sebelum publish:

```bash
npm pack --dry-run
npm run build && node -e "import('bits-qris-converter').then(m=>console.log(Object.keys(m)))"
```

---

## Perbandingan dengan Repo Asal

| Fitur | verssache | Dynamic-QRIS | **BITS (ini)** |
|---|---|---|---|
| TLV Parser proper | ✅ | ❌ split | **✅** |
| Validator CRC | ✅ | partial | **✅** |
| TypeScript | ✅ | ❌ | **✅** |
| Cetak Struk JPG | ❌ | ✅ | **✅** |
| Dual ESM/CJS | ❌ | partial | **✅** |
| CLI | ✅ simple | ❌ | **✅ full** |
| Browser base64 | ✅ | ✅ | **✅** |
| jimp 1.6.0 | - | ✅ | **✅** |

---

## License

MIT © BITS — Based on MIT from `verssache/qris-dinamis` & `agungjsp/Dynamic-QRIS` & `razisek/Qris-Dinamis`

---

## Contributing

PR welcome! Untuk template struk custom, taruh PNG 1080x1920 di `assets/template.png` dan font `.fnt` di `assets/font/`.

