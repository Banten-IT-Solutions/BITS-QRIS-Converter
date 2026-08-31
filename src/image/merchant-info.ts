/**
 * Merchant info extractor for receipt printing
 * Improved & null-safe — replaces fragile regex-only approach
 */

import { calculateCrc16 } from '../core/crc16.js';
import { parseQris } from '../core/parser.js';
import type { MerchantInfo } from '../core/types.js';

export function getMerchantInfo(qris: string): MerchantInfo {
  const parsed = parseQris(qris);

  const nmid = extractNmid(qris, parsed);
  const id = qris.includes('A01') ? 'A01' : '01';
  const merchantName = parsed.merchantName?.trim().toUpperCase() || 'MERCHANT';
  const merchantCity = parsed.merchantCity || '';
  const printer = extractPrinter(qris);
  const nns = extractNns(qris);
  const crcIsValid = validateCrc(qris);

  return {
    nmid,
    id,
    merchantName,
    merchantCity,
    printer,
    nns,
    crcIsValid,
  };
}

function extractNmid(qris: string, parsed: ReturnType<typeof parseQris>): string {
  const match = qris.match(/15ID(\d+?)0303/);
  if (match) return `ID${match[1]}`;

  const firstMerchant = parsed.merchantAccountInfo[0];
  if (firstMerchant?.merchantId) {
    return firstMerchant.merchantId.startsWith('ID')
      ? firstMerchant.merchantId
      : `ID${firstMerchant.merchantId}`;
  }

  return 'ID-UNKNOWN';
}

function extractPrinter(qris: string): string {
  const printData = qris.match(/(?<=ID|COM).+?(?=0118)/g);
  if (!printData || printData.length === 0) return 'UNKNOWN';

  const last = printData[printData.length - 1];
  const parts = last.split('.');
  if (parts.length === 3) return parts[1];
  return parts[2] ?? parts[1] ?? 'UNKNOWN';
}

function extractNns(qris: string): string {
  const nnsData = qris.match(/(?<=0118).+?(?=ID)/g);
  if (!nnsData || nnsData.length === 0) return 'UNKNOWN';
  return nnsData[nnsData.length - 1].substring(0, 8);
}

function validateCrc(qris: string): boolean {
  if (qris.length < 4) return false;
  const withoutCrc = qris.slice(0, -4);
  const declared = qris.slice(-4).toUpperCase();
  return calculateCrc16(withoutCrc) === declared;
}
