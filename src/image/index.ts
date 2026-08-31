/**
 * Image barrel — public API for image generation
 */

// Canonical new modules
export { getMerchantInfo } from './merchant-info.js';
export {
  makeQrDataUrl,
  makeQRDataURL,
  makeQrBuffer,
  makeQRBuffer as makeQRBufferAlias,
  makeString,
} from './qr-renderer.js';
export { makeFile, makeImage, generateStruk } from './receipt-generator.js';

// Types
export type { ImageOptions, QrOnlyOptions, QROnlyOptions } from './types.js';

// Backward compat — keep old paths working
export { normalizeLegacyOptions, formatRupiah, padLength, sanitizeFilename } from './utils.js';
export * from './types.js';
