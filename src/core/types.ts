/**
 * Core type definitions for BITS-QRIS-Converter
 * Mengikuti standard: PascalCase untuk interface/type, JSDoc untuk dokumentasi
 */

/** Single TLV (Tag-Length-Value) element */
export interface TlvElement {
  tag: string;
  name: string;
  length: number;
  value: string;
  children?: TlvElement[];
}

/** @deprecated Use TlvElement — kept for backward compatibility */
export type TLV = TlvElement;

/** Parsed QRIS data — human-friendly */
export interface QrisData {
  version: string;
  method: 'static' | 'dynamic';
  merchantAccountInfo: MerchantAccountInfo[];
  merchantCategoryCode: string;
  currency: string;
  amount?: string;
  tipIndicator?: 'prompt' | 'fixed' | 'percentage';
  tipFixed?: string;
  tipPercentage?: string;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  postalCode: string;
  additionalData?: TlvElement[];
  crc: string;
  raw: TlvElement[];
}

/** @deprecated Use QrisData */
export type QRISData = QrisData;

export interface MerchantAccountInfo {
  tag: string;
  globallyUniqueId: string;
  merchantId?: string;
  merchantCriteria?: string;
  fields: TlvElement[];
}

export type FeeType = 'fixed' | 'percentage';

export interface ConvertOptions {
  amount: number | string;
  fee?: {
    type: FeeType;
    value: number | string;
  };
}

/** Legacy options — qris-dinamis 1.x compatibility */
export interface LegacyConvertOptions {
  nominal: string | number;
  taxtype?: 'p' | 'r';
  fee?: string | number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface MerchantInfo {
  nmid: string;
  merchantName: string;
  merchantCity: string;
  id: string;
  printer: string;
  nns: string;
  crcIsValid: boolean;
}
