/**
 * CRC16-CCITT calculation for QRIS/EMVCo (poly 0x1021, init 0xFFFF)
 * Pure function — no side effects, fully testable
 */

import { CRC_INIT, CRC_POLYNOMIAL } from './constants.js';

/**
 * Calculate CRC16-CCITT checksum
 * @param data - Input string (without CRC tag value)
 * @returns 4-char uppercase hex, zero-padded
 */
export function calculateCrc16(data: string): string {
  let crc = CRC_INIT;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ CRC_POLYNOMIAL) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

/** @deprecated Use calculateCrc16 */
export const calculateCRC16 = calculateCrc16;

/** @deprecated Use calculateCrc16 */
export const toCRC16 = calculateCrc16;
