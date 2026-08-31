/** A single TLV (Tag-Length-Value) element from a QRIS payload */
export interface TLV {
  tag: string;
  name: string;
  length: number;
  value: string;
  children?: TLV[];
}

/** Parsed QRIS data in a human-friendly structure */
export interface QRISData {
  version: string;
  method: "static" | "dynamic";
  merchantAccountInfo: MerchantAccountInfo[];
  merchantCategoryCode: string;
  currency: string;
  amount?: string;
  tipIndicator?: "prompt" | "fixed" | "percentage";
  tipFixed?: string;
  tipPercentage?: string;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  postalCode: string;
  additionalData?: TLV[];
  crc: string;
  raw: TLV[];
}

export interface MerchantAccountInfo {
  tag: string;
  globallyUniqueId: string;
  merchantId?: string;
  merchantCriteria?: string;
  fields: TLV[];
}

export interface ConvertOptions {
  amount: number | string;
  fee?: {
    type: "fixed" | "percentage";
    value: number | string;
  };
}

/** Legacy options for backward compatibility with qris-dinamis 1.x */
export interface LegacyConvertOptions {
  nominal: string | number;
  taxtype?: "p" | "r";
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
