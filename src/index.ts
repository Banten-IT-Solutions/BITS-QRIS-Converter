/**
 * BITS-QRIS-Converter
 * Hybrid terbaik: Core TLV proper dari verssache + Cetak Struk Jimp dari Dynamic-QRIS
 * 
 * @packageDocumentation
 */

// Core — parse, validate, convert (TLV proper)
export { parseQRIS, parseTLV } from "./core/parser.js";
export { convertQRIS, makeStringLegacy } from "./core/converter.js";
export { validateQRIS, isValidQRIS } from "./core/validator.js";
export { calculateCRC16, toCRC16 } from "./core/crc16.js";
export type {
  TLV,
  QRISData,
  MerchantAccountInfo,
  ConvertOptions,
  LegacyConvertOptions,
  ValidationResult,
  MerchantInfo,
} from "./core/types.js";

// Image — cetak struk & QR generation
export {
  makeFile,
  makeImage,
  generateStruk,
  makeString,
  makeQRDataURL,
  makeQRBuffer,
} from "./image/generator.js";
export { getMerchantInfo, formatRupiah } from "./image/utils.js";
export type { ImageOptions } from "./image/generator.js";

// Re-export untuk kompatibilitas legacy `qris-dinamis` 1.x
// Usage: import { makeString, makeFile } from "bits-qris-converter"
//        makeString(qris, { nominal: "50000" })
//        makeFile(qris, { nominal: "50000", base64: true })

// Default export bundling semua
import { parseQRIS, parseTLV } from "./core/parser.js";
import { convertQRIS, makeStringLegacy } from "./core/converter.js";
import { validateQRIS, isValidQRIS } from "./core/validator.js";
import { calculateCRC16 } from "./core/crc16.js";
import { getMerchantInfo } from "./image/utils.js";
import { makeFile, makeString, makeQRDataURL, makeQRBuffer } from "./image/generator.js";

const BITS_QRIS = {
  // core
  parseQRIS,
  parseTLV,
  convertQRIS,
  makeString,
  makeStringLegacy,
  validateQRIS,
  isValidQRIS,
  calculateCRC16,
  getMerchantInfo,
  // image
  makeFile,
  makeQRDataURL,
  makeQRBuffer,
};

export default BITS_QRIS;
