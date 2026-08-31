import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseTlv, parseQris } from './parser.js';

const SAMPLE_QRIS =
  '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5914TOKO BITS JAYA6007JAKARTA6105123456304';

describe('parseTlv', () => {
  it('should parse TLV elements', () => {
    const elements = parseTlv(SAMPLE_QRIS);
    assert.ok(elements.length > 0);
    assert.equal(elements[0].tag, '00');
    assert.equal(elements[0].value, '01');
  });

  it('should handle empty string', () => {
    const elements = parseTlv('');
    assert.equal(elements.length, 0);
  });

  it('should parse nested tags 26-51', () => {
    const elements = parseTlv(SAMPLE_QRIS);
    const tag26 = elements.find((e) => e.tag === '26');
    assert.ok(tag26);
    assert.ok(tag26.children);
    assert.ok(tag26.children.length > 0);
  });
});

describe('parseQris', () => {
  it('should parse QRIS to structured data', () => {
    const data = parseQris(SAMPLE_QRIS);
    assert.equal(data.merchantName, 'TOKO BITS JAYA');
    assert.equal(data.merchantCity, 'JAKARTA');
    assert.equal(data.countryCode, 'ID');
    assert.equal(data.currency, '360');
  });

  it('should detect static method', () => {
    const data = parseQris(SAMPLE_QRIS);
    assert.equal(data.method, 'static');
  });
});
