/**
 * @deprecated — legacy entry point for backward compatibility
 * Use imports from './qr-renderer.js' and './receipt-generator.js' instead
 * This file re-exports to keep `bits-qris-converter/dist/.../generator.js` working
 */

export {
  makeString,
  makeQrDataUrl,
  makeQRDataURL,
  makeQrBuffer,
  makeQRBuffer as makeQRBufferAlias,
  generateBrowserQr,
} from './qr-renderer.js';
export { makeFile, makeImage, generateStruk } from './receipt-generator.js';
export type { ImageOptions, QrOnlyOptions, QROnlyOptions } from './types.js';
