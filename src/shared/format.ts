/**
 * Shared formatting utilities — pure, no side effects
 */

import { QrisParseError } from './errors.js';

/**
 * Pad number to 2 digits with leading zero (for TLV length field)
 */
export function padLength(length: number): string {
  if (length > 99) {
    throw new QrisParseError(`TLV length ${length} exceeds max 99`);
  }
  return length.toString().padStart(2, '0');
}

/**
 * Sanitize merchant name for safe filename
 */
export function sanitizeFilename(name: string, maxLength = 30): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, maxLength) || 'QRIS';
}
