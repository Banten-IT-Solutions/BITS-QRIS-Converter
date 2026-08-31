/**
 * Image utils — backward compatibility wrapper
 * @deprecated Import from './merchant-info.js' or './qr-renderer.js' or '../shared/format.js' instead
 */

import type { ConvertOptions } from '../core/types.js';
import type { ImageOptions, QrOnlyOptions } from './types.js';

// Re-export merchant info
export { getMerchantInfo } from './merchant-info.js';

// Re-export formatting
export { formatRupiah, padLength, sanitizeFilename } from '../shared/format.js';

/**
 * Normalize legacy (nominal/taxtype/fee) and modern (amount/fee) options
 * Keeps backward compatibility with qris-dinamis 1.x
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
