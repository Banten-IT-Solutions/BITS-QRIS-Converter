/**
 * QRIS validator
 * Checks: prefix, length, CRC, required tags, merchant info
 */

import { calculateCrc16 } from './crc16.js';
import { REQUIRED_TAGS } from './constants.js';
import { parseTlv } from './parser.js';
import type { ValidationResult } from './types.js';

const MIN_QRIS_LENGTH = 20;
const PAYLOAD_PREFIX = '000201';
const CRC_LENGTH = 4;

/**
 * Validate QRIS string structure
 */
export function validateQris(qrisString: string): ValidationResult {
  const errors: string[] = [];

  if (!qrisString || qrisString.trim().length === 0) {
    return { valid: false, errors: ['QRIS string is empty'] };
  }

  const normalized = qrisString.trim();

  if (!normalized.startsWith(PAYLOAD_PREFIX)) {
    errors.push(`QRIS must start with Payload Format Indicator "${PAYLOAD_PREFIX}"`);
  }

  if (normalized.length < MIN_QRIS_LENGTH) {
    errors.push('QRIS string is too short');
    return { valid: false, errors };
  }

  const dataWithoutCrc = normalized.slice(0, -CRC_LENGTH);
  const declaredCrc = normalized.slice(-CRC_LENGTH);
  const calculatedCrc = calculateCrc16(dataWithoutCrc);

  if (declaredCrc.toUpperCase() !== calculatedCrc) {
    errors.push(`CRC mismatch: expected ${calculatedCrc}, got ${declaredCrc.toUpperCase()}`);
  }

  const elements = parseTlv(normalized);

  if (elements.length === 0) {
    errors.push('Failed to parse any TLV elements');
    return { valid: false, errors };
  }

  const presentTags = new Set(elements.map((el) => el.tag));

  for (const required of REQUIRED_TAGS) {
    if (!presentTags.has(required.tag)) {
      errors.push(`Missing required tag ${required.tag} (${required.name})`);
    }
  }

  const method = elements.find((el) => el.tag === '01');
  if (method && method.value !== '11' && method.value !== '12') {
    errors.push(`Invalid Point of Initiation Method: "${method.value}" (must be "11" or "12")`);
  }

  const hasMerchantInfo = elements.some((element) => {
    const tagNumber = Number.parseInt(element.tag, 10);
    return tagNumber >= 26 && tagNumber <= 51;
  });

  if (!hasMerchantInfo) {
    errors.push('No Merchant Account Information found (tags 26-51)');
  }

  return { valid: errors.length === 0, errors };
}

/** @deprecated Use validateQris */
export const validateQRIS = validateQris;

/**
 * Boolean shortcut for validation
 */
export function isValidQris(qrisString: string): boolean {
  return validateQris(qrisString).valid;
}

/** @deprecated Use isValidQris */
export const isValidQRIS = isValidQris;
