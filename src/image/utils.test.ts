import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLegacyOptions } from './utils.js';

describe('normalizeLegacyOptions', () => {
  it('maps legacy nominal and fixed fee to modern options', () => {
    assert.deepEqual(normalizeLegacyOptions({ nominal: 1250, taxtype: 'r', fee: 25 } as never), {
      amount: 1250,
      fee: { type: 'fixed', value: 25 },
    });
  });

  it('maps legacy percentage fee and legacy fee alias', () => {
    assert.deepEqual(normalizeLegacyOptions({ nominal: '1000', feeLegacy: '2.5' } as never), {
      amount: '1000',
      fee: { type: 'percentage', value: 2.5 },
    });
  });

  it('omits absent, zero, blank, negative, and non-numeric legacy fees', () => {
    for (const fee of [undefined, 0, '  ', -1, 'invalid']) {
      const result = normalizeLegacyOptions({ nominal: 100, fee } as never);
      assert.deepEqual(result, { amount: 100, fee: undefined });
    }
  });

  it('preserves modern options unchanged', () => {
    const options = { amount: 100, fee: { type: 'fixed' as const, value: 3 } };
    assert.equal(normalizeLegacyOptions(options), options);
  });
});
