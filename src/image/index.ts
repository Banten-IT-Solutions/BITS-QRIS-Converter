/**
 * Image barrel — public API for image generation
 */

export { getMerchantInfo } from './merchant-info.js';
export {
  generateBrowserQr,
  makeQrBuffer,
  makeQRBuffer,
  makeQrDataUrl,
  makeQRDataURL,
  makeString,
} from './qr-renderer.js';
export { generateStruk, makeFile, makeImage } from './receipt-generator.js';
export type { ImageOptions, QrOnlyOptions, QROnlyOptions } from './types.js';
export { normalizeLegacyOptions } from './utils.js';
