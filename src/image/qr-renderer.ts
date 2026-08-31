/**
 * QR rendering utilities
 * Pure functions for QR DataURL / Buffer generation
 */

import QRCode from 'qrcode';
import { convertQris } from '../core/converter.js';
import type { ConvertOptions } from '../core/types.js';
import { normalizeLegacyOptions } from './utils.js';
import type { ImageOptions, QrOnlyOptions } from './types.js';

/**
 * Generate QRIS dynamic string (alias for convertQris with legacy support)
 */
export function makeString(
  qris: string,
  options:
    ConvertOptions | { nominal: string | number; taxtype?: 'p' | 'r'; fee?: string | number },
): string {
  const normalized = normalizeLegacyOptions(options as ImageOptions | QrOnlyOptions);
  return convertQris(qris, normalized);
}

/**
 * Generate QR code as DataURL (lightweight, no template, works in Node & Browser)
 */
export async function makeQrDataUrl(qris: string, options: QrOnlyOptions): Promise<string> {
  const normalized = normalizeLegacyOptions(options);
  const dynamicQris = convertQris(qris, normalized);

  return QRCode.toDataURL(dynamicQris, {
    margin: options.margin ?? 2,
    width: options.width ?? 512,
    color: {
      dark: options.colorDark ?? '#000000',
      light: options.colorLight ?? '#FFFFFF',
    },
  });
}

/** @deprecated Use makeQrDataUrl */
export const makeQRDataURL = makeQrDataUrl;

/**
 * Generate QR code as Buffer (Node.js)
 */
export async function makeQrBuffer(qris: string, options: QrOnlyOptions): Promise<Buffer> {
  const normalized = normalizeLegacyOptions(options);
  const dynamicQris = convertQris(qris, normalized);

  return QRCode.toBuffer(dynamicQris, {
    margin: 2,
    scale: 10,
    width: 512,
    type: 'png',
  });
}

/** @deprecated Use makeQrBuffer */
export const makeQRBuffer = makeQrBuffer;

/**
 * Browser-only helper — QR DataURL without Jimp
 */
export async function generateBrowserQr(qris: string, options: ImageOptions): Promise<string> {
  const normalized = normalizeLegacyOptions(options);
  const dynamicQris = convertQris(qris, normalized);

  return QRCode.toDataURL(dynamicQris, {
    margin: 2,
    scale: 10,
    width: 512,
  });
}
