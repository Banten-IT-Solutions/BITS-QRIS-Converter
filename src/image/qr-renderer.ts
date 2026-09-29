/**
 * QR rendering utilities
 * Pure functions for QR DataURL / Buffer generation
 */

import QRCode from 'qrcode';
import { convertQris } from '../core/converter.js';
import type { ConvertOptions } from '../core/types.js';
import type { ImageOptions, QrOnlyOptions } from './types.js';

/**
 * Generate QRIS dynamic string
 */
export function makeString(qris: string, options: ConvertOptions): string {
  return convertQris(qris, options);
}

/**
 * Render an already-converted (dynamic) QRIS string as DataURL — skip re-conversion
 */
export function renderQrDataUrl(
  dynamicQris: string,
  options: Pick<QrOnlyOptions, 'margin' | 'width' | 'colorDark' | 'colorLight'> = {},
): Promise<string> {
  return QRCode.toDataURL(dynamicQris, {
    margin: options.margin ?? 2,
    width: options.width ?? 512,
    color: {
      dark: options.colorDark ?? '#000000',
      light: options.colorLight ?? '#FFFFFF',
    },
  });
}

/**
 * Generate QR code as DataURL (lightweight, no template, works in Node & Browser)
 */
export async function makeQrDataUrl(qris: string, options: QrOnlyOptions): Promise<string> {
  return renderQrDataUrl(convertQris(qris, options), options);
}

/**
 * Generate QR code as Buffer (Node.js)
 */
export async function makeQrBuffer(qris: string, options: QrOnlyOptions): Promise<Buffer> {
  const dynamicQris = convertQris(qris, options);

  return QRCode.toBuffer(dynamicQris, {
    margin: options.margin ?? 2,
    width: options.width ?? 512,
    color: {
      dark: options.colorDark ?? '#000000',
      light: options.colorLight ?? '#FFFFFF',
    },
    type: 'png',
  });
}

/**
 * Render payload as SVG string — pure, Workers-safe (no fs)
 */
export function makeQrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, { type: 'svg', margin: 1, width: 512 });
}

/**
 * Browser-only helper — QR DataURL without Jimp
 */
export async function generateBrowserQr(qris: string, options: ImageOptions): Promise<string> {
  const dynamicQris = convertQris(qris, options);

  return QRCode.toDataURL(dynamicQris, {
    margin: options.margin ?? 2,
    scale: options.scale ?? 10,
    width: options.width ?? 512,
  });
}
