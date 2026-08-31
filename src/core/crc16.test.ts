import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCrc16 } from './crc16.js';

describe('calculateCrc16', () => {
  it('should calculate CRC for known QRIS payload', () => {
    const payload =
      '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5914TOKO BITS JAYA6007JAKARTA6105123456304';
    const crc = calculateCrc16(payload);
    assert.equal(crc.length, 4);
    assert.match(crc, /^[0-9A-F]{4}$/);
  });

  it('should calculate CRC for simple string', () => {
    const crc = calculateCrc16('000201010211');
    assert.equal(crc.length, 4);
  });

  it('should be deterministic', () => {
    const data = '00020101021226560014ID.CO.QRIS.WWW0115ID1023162526099';
    assert.equal(calculateCrc16(data), calculateCrc16(data));
  });

  it('should handle empty string', () => {
    const crc = calculateCrc16('');
    assert.equal(crc, 'FFFF');
  });
});
