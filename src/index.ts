/**
 * BITS-QRIS-Converter — public barrel export
 * Hybrid: Core TLV presisi + Cetak Struk siap print
 *
 * @packageDocumentation
 * @example
 * import { convertQris, parseQris, validateQris, makeFile } from 'bits-qris';
 */

export { calculateCrc16 } from './core/crc16.js';

export { parseQris, parseTlv } from './core/parser.js';

export { convertQris } from './core/converter.js';

export { validateQris, isValidQris } from './core/validator.js';

export type {
  ConvertOptions,
  FeeType,
  MerchantAccountInfo,
  MerchantInfo,
  QrisData,
  TlvElement,
  ValidationResult,
} from './core/types.js';

export * from './core/constants.js';

export { getMerchantInfo } from './image/merchant-info.js';
export { generateBrowserQr, makeQrBuffer, makeQrDataUrl, makeString } from './image/qr-renderer.js';
export { makeFile } from './image/receipt-generator.js';
export type { ImageOptions, QrOnlyOptions } from './image/types.js';

export { padLength, sanitizeFilename } from './shared/format.js';
export {
  QrisConvertError,
  QrisError,
  QrisImageError,
  QrisParseError,
  QrisValidationError,
} from './shared/errors.js';

export { normalizeLegacyOptions } from './image/utils.js';

// Default export — named bundle for `import pkg from 'bits-qris'` compat
import { calculateCrc16 } from './core/crc16.js';
import { convertQris } from './core/converter.js';
import { parseQris, parseTlv } from './core/parser.js';
import { isValidQris, validateQris } from './core/validator.js';
import { getMerchantInfo } from './image/merchant-info.js';
import { makeString, makeQrBuffer, makeQrDataUrl } from './image/qr-renderer.js';
import { makeFile as makeFileReceipt } from './image/receipt-generator.js';

const BitsQris = {
  parseQris,
  parseTlv,
  convertQris,
  makeString,
  validateQris,
  isValidQris,
  calculateCrc16,
  getMerchantInfo,
  makeFile: makeFileReceipt,
  makeQrDataUrl,
  makeQrBuffer,
} as const;

export default BitsQris;
