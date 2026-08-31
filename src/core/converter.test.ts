import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { convertQris } from './converter.js';
import { validateQris } from './validator.js';
import { calculateCrc16 } from './crc16.js';

const SAMPLE_QRIS =
  '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5914TOKO BITS JAYA6007JAKARTA6105123456304';
const VALID_QRIS = `${SAMPLE_QRIS}${calculateCrc16(SAMPLE_QRIS)}`;

describe('convertQris', () => {
  it('should convert static to dynamic', () => {
    const dynamic = convertQris(VALID_QRIS, { amount: 50000 });
    assert.ok(dynamic.includes('540550000'));
    const validation = validateQris(dynamic);
    assert.equal(validation.valid, true);
  });

  it('should handle fee fixed', () => {
    const dynamic = convertQris(VALID_QRIS, { amount: 50000, fee: { type: 'fixed', value: 1000 } });
    assert.ok(dynamic.includes('56041000'), `Expected 56041000 in ${dynamic}`);
    assert.ok(dynamic.includes('550202'), `Expected tip fixed 550202 in ${dynamic}`);
  });

  it('should handle fee percentage', () => {
    const dynamic = convertQris(VALID_QRIS, {
      amount: 100000,
      fee: { type: 'percentage', value: 2.5 },
    });
    assert.ok(dynamic.includes('57032.5'), `Expected 57032.5 in ${dynamic}`);
    assert.ok(dynamic.includes('550203'), `Expected tip percentage 550203 in ${dynamic}`);
  });

  it('should throw for invalid amount', () => {
    assert.throws(() => convertQris(VALID_QRIS, { amount: 0 }), /Invalid amount/);
    assert.throws(() => convertQris(VALID_QRIS, { amount: -100 }), /Invalid amount/);
  });

  it('should throw for empty qris', () => {
    assert.throws(() => convertQris('', { amount: 50000 }), /qris.*required/i);
  });
});
