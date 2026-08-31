/**
 * Image-related type definitions
 */

import type { ConvertOptions } from '../core/types.js';

export interface ImageOptions extends ConvertOptions {
  /** Legacy alias for amount */
  nominal?: string | number;
  taxtype?: 'p' | 'r';
  feeLegacy?: string | number;
  /** Return base64 DataURL instead of file path (required in browser) */
  base64?: boolean;
  /** Custom output path. Default: output/<MERCHANT>-<timestamp>.jpg */
  path?: string;
  /** Custom template image path */
  templatePath?: string;
  /** QR margin */
  margin?: number;
  /** QR scale */
  scale?: number;
  /** QR width for browser */
  width?: number;
}

export interface QrOnlyOptions extends ConvertOptions {
  nominal?: string | number;
  taxtype?: 'p' | 'r';
  feeLegacy?: string | number;
  margin?: number;
  width?: number;
  colorDark?: string;
  colorLight?: string;
}

/** @deprecated Use QrOnlyOptions */
export type QROnlyOptions = QrOnlyOptions;
