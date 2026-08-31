/**
 * Legacy compatibility helper — normalize qris-dinamis 1.x options
 * @deprecated Use ConvertOptions directly; this shim will be removed in v2
 */

import type { ConvertOptions } from '../core/types.js';
import type { ImageOptions, QrOnlyOptions } from './types.js';

/**
 * Normalize legacy (nominal/taxtype/fee) and modern (amount/fee) options
 */
export function normalizeLegacyOptions(options: ImageOptions | QrOnlyOptions): ConvertOptions {
  const anyOptions = options as ImageOptions & Record<string, unknown>;

  if (anyOptions.nominal !== undefined && anyOptions.amount === undefined) {
    let fee: ConvertOptions['fee'] | undefined;
    const rawFee = (anyOptions.fee ?? anyOptions.feeLegacy) as string | number | undefined;

    if (rawFee !== undefined && String(rawFee) !== '0' && String(rawFee).trim() !== '') {
      const feeValue = Number(rawFee);
      if (!Number.isNaN(feeValue) && feeValue > 0) {
        fee = {
          type: anyOptions.taxtype === 'r' ? 'fixed' : 'percentage',
          value: feeValue,
        };
      }
    }

    return { amount: anyOptions.nominal, fee };
  }

  return options as ConvertOptions;
}
