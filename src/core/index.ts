/**
 * Core barrel export — QRIS parsing, conversion, validation, CRC
 * Re-exports canonical names + deprecated aliases for backward compat
 */

export { calculateCrc16, calculateCRC16, toCRC16 } from './crc16.js';
export { convertQris, convertQRIS, makeStringLegacy } from './converter.js';
export { parseQris, parseQRIS, parseTlv, parseTLV } from './parser.js';
export { isValidQris, isValidQRIS, validateQris, validateQRIS } from './validator.js';
export type {
  ConvertOptions,
  LegacyConvertOptions,
  MerchantAccountInfo,
  MerchantInfo,
  QrisData,
  QRISData,
  TlvElement,
  TLV,
  ValidationResult,
} from './types.js';
export * from './constants.js';
