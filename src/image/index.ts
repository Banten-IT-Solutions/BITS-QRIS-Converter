/**
 * Image barrel — public API for image generation
 */

export { getMerchantInfo } from './merchant-info.js';
export { generateBrowserQr, makeQrBuffer, makeQrDataUrl, makeString } from './qr-renderer.js';
export { makeFile } from './receipt-generator.js';
export type { ImageOptions, QrOnlyOptions } from './types.js';
export { normalizeLegacyOptions } from './utils.js';
