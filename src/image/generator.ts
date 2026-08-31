/**
 * @deprecated Legacy entry point — kept for backward compatibility with v1 imports
 * Use `bits-qris-converter/image` or `bits-qris-converter` directly
 * @example import { makeFile } from 'bits-qris-converter/image/receipt-generator.js'
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
