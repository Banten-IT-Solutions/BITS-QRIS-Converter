/**
 * BITS-QRIS-Converter — public barrel export
 * Hybrid: Core TLV presisi + Cetak Struk siap print
 *
 * @packageDocumentation
 * @example
 * import { convertQris, parseQris, validateQris, makeFile } from 'bits-qris-converter';
 */

// Core — canonical (kebab/camelCase) + deprecated uppercase aliases for backward compat
export {
  // CRC
  calculateCrc16,
  calculateCRC16,
  toCRC16,
} from './core/crc16.js';

export {
  // Parser
  parseQris,
  parseQRIS,
  parseTlv,
  parseTLV,
} from './core/parser.js';

export {
  // Converter
  convertQris,
  convertQRIS,
  makeStringLegacy,
} from './core/converter.js';

export {
  // Validator
  validateQris,
  validateQRIS,
  isValidQris,
  isValidQRIS,
} from './core/validator.js';

export type {
  ConvertOptions,
  FeeType,
  LegacyConvertOptions,
  MerchantAccountInfo,
  MerchantInfo,
  QrisData,
  QRISData,
  TlvElement,
  TLV,
  ValidationResult,
} from './core/types.js';

export * from './core/constants.js';

// Image — canonical
export { getMerchantInfo } from './image/merchant-info.js';
export {
  generateBrowserQr,
  makeQrBuffer,
  makeQRBuffer,
  makeQrDataUrl,
  makeQRDataURL,
  makeString,
} from './image/qr-renderer.js';
export { makeFile, makeImage, generateStruk } from './image/receipt-generator.js';
export type { ImageOptions, QrOnlyOptions, QROnlyOptions } from './image/types.js';

// Shared utilities
export { formatRupiah, padLength, sanitizeFilename } from './shared/format.js';
export {
  QrisConvertError,
  QrisError,
  QrisImageError,
  QrisParseError,
  QrisValidationError,
} from './shared/errors.js';

// Legacy image utils wrapper — kept for `import { getMerchantInfo } from 'bits-qris-converter'` via utils path
export { normalizeLegacyOptions } from './image/utils.js';

// Default export — named bundle for `import pkg from 'bits-qris-converter'` compat (deprecated, prefer named imports)
import { calculateCrc16 } from './core/crc16.js';
import { convertQris, makeStringLegacy } from './core/converter.js';
import { parseQris, parseTlv } from './core/parser.js';
import { isValidQris, validateQris } from './core/validator.js';
import { getMerchantInfo } from './image/merchant-info.js';
import { makeString, makeQrBuffer, makeQrDataUrl } from './image/qr-renderer.js';
import { makeFile as makeFileReceipt } from './image/receipt-generator.js';

const BitsQris = {
  // core
  parseQris,
  parseTlv,
  parseTLV: parseTlv,
  parseQRIS: parseQris,
  convertQris,
  convertQRIS: convertQris,
  makeString,
  makeStringLegacy,
  validateQris,
  validateQRIS: validateQris,
  isValidQris,
  isValidQRIS: isValidQris,
  calculateCrc16,
  calculateCRC16: calculateCrc16,
  getMerchantInfo,
  // image
  makeFile: makeFileReceipt,
  makeQrDataUrl,
  makeQrBuffer,
} as const;

export default BitsQris;
