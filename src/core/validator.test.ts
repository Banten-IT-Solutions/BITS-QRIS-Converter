import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateQris } from './validator.js';
import { calculateCrc16 } from './crc16.js';

const SAMPLE_QRIS =
  '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5914TOKO BITS JAYA6007JAKARTA6105123456304';
const VALID_QRIS = `${SAMPLE_QRIS}${calculateCrc16(SAMPLE_QRIS)}`;

describe('validateQris', () => {
  it('should validate correct QRIS', () => {
    const result = validateQris(VALID_QRIS);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid CRC', () => {
    const invalid = `${SAMPLE_QRIS}FFFF`;
    const result = validateQris(invalid);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('CRC')));
  });

  it('should detect empty string', () => {
    const result = validateQris('');
    assert.equal(result.valid, false);
  });

  it('should detect wrong prefix', () => {
    const result = validateQris('999201010211...');
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('Payload Format')));
  });
});
