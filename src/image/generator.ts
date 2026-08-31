/**
 * @deprecated Legacy entry point — kept for backward compatibility with v1 imports
 * Use `bits-qris/image` or `bits-qris` directly
 * @example import { makeFile } from 'bits-qris/image/receipt-generator.js'
 */

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
