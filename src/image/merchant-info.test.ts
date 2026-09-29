import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getMerchantInfo } from './merchant-info.js';
import { calculateCrc16 } from '../core/crc16.js';

const payload =
  '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5914TOKO BITS JAYA6007JAKARTA6105123456304';
const validQris = `${payload}${calculateCrc16(payload)}`;

describe('getMerchantInfo', () => {
  it('extracts merchant details and validates CRC', () => {
    assert.deepEqual(getMerchantInfo(validQris), {
      nmid: 'ID1023162526099',
      id: '01',
      merchantName: 'TOKO BITS JAYA',
      merchantCity: 'JAKARTA',
      printer: 'UNKNOWN',
      nns: 'UNKNOWN',
      crcIsValid: true,
    });
  });

  it('provides defaults for empty input and marks CRC invalid', () => {
    const info = getMerchantInfo('');
    assert.equal(info.merchantName, 'MERCHANT');
    assert.equal(info.merchantCity, '');
    assert.equal(info.nmid, 'ID-UNKNOWN');
    assert.equal(info.printer, 'UNKNOWN');
    assert.equal(info.nns, 'UNKNOWN');
    assert.equal(info.crcIsValid, false);
  });

  it('marks modified payload CRC invalid while retaining parsed merchant fields', () => {
    const info = getMerchantInfo(`${validQris.slice(0, -1)}0`);
    assert.equal(info.merchantName, 'TOKO BITS JAYA');
    assert.equal(info.crcIsValid, false);
  });
});
