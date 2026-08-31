/**
 * QRIS Static → Dynamic converter
 * TLV-based, CRC recalculation — tidak pakai split fragile
 */

import { QrisConvertError, QrisParseError } from '../shared/errors.js';
import { padLength } from '../shared/format.js';
import { calculateCrc16 } from './crc16.js';
import { CRC_PLACEHOLDER, POINT_OF_INITIATION, TAG, TIP_INDICATOR } from './constants.js';
import { parseTlv } from './parser.js';
import type { ConvertOptions, TlvElement } from './types.js';

const MANAGED_TAGS = new Set<string>([
  TAG.TRANSACTION_AMOUNT,
  TAG.TIP_INDICATOR,
  TAG.FEE_FIXED,
  TAG.FEE_PERCENTAGE,
  TAG.CRC,
]);

function buildTlvString(elements: TlvElement[]): string {
  return elements
    .map((element) => {
      const value = element.children ? buildTlvString(element.children) : element.value;
      return `${element.tag}${padLength(value.length)}${value}`;
    })
    .join('');
}

function createTlv(tag: string, value: string, name = ''): TlvElement {
  return { tag, name, length: value.length, value };
}

function validateAmount(amount: ConvertOptions['amount']): number {
  if (amount === undefined || amount === null || String(amount).trim() === '') {
    throw new QrisConvertError('Parameter "amount" / "nominal" is required.');
  }

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    throw new QrisConvertError(`Invalid amount: must be positive number. Got: ${amount}`);
  }

  return numericAmount;
}

/**
 * Convert static QRIS → dynamic by injecting amount & optional fee
 */
export function convertQris(qrisString: string, options: ConvertOptions): string {
  if (!qrisString) {
    throw new QrisConvertError('Parameter "qris" is required.');
  }

  const amountNumber = validateAmount(options.amount);
  const elements = parseTlv(qrisString);

  if (elements.length === 0) {
    throw new QrisParseError('Invalid QRIS: failed to parse TLV structure');
  }

  const result: TlvElement[] = [];
  let amountInserted = false;

  for (const element of elements) {
    if (MANAGED_TAGS.has(element.tag)) continue;

    if (element.tag === TAG.POINT_OF_INITIATION) {
      result.push(
        createTlv(
          TAG.POINT_OF_INITIATION,
          POINT_OF_INITIATION.DYNAMIC,
          'Point of Initiation Method',
        ),
      );
      continue;
    }

    if (element.tag === TAG.COUNTRY_CODE && !amountInserted) {
      insertAmountAndFee(result, amountNumber, options.fee);
      amountInserted = true;
    }

    result.push(element);
  }

  if (!amountInserted) {
    insertAmountAndFee(result, amountNumber, options.fee);
  }

  const withoutCrc = buildTlvString(result);
  const crcInput = `${withoutCrc}${CRC_PLACEHOLDER}`;
  const crc = calculateCrc16(crcInput);

  return `${crcInput}${crc}`;
}

/** @deprecated Use convertQris */
export const convertQRIS = convertQris;

function insertAmountAndFee(
  target: TlvElement[],
  amountNumber: number,
  fee: ConvertOptions['fee'],
): void {
  const amountString = String(Math.trunc(amountNumber));
  target.push(createTlv(TAG.TRANSACTION_AMOUNT, amountString, 'Transaction Amount'));

  if (!fee || Number(fee.value) <= 0) return;

  const feeValue = String(fee.value);

  if (fee.type === 'fixed') {
    target.push(createTlv(TAG.TIP_INDICATOR, TIP_INDICATOR.FIXED, 'Tip or Convenience Indicator'));
    target.push(createTlv(TAG.FEE_FIXED, feeValue, 'Value of Convenience Fee (Fixed)'));
  } else {
    target.push(
      createTlv(TAG.TIP_INDICATOR, TIP_INDICATOR.PERCENTAGE, 'Tip or Convenience Indicator'),
    );
    target.push(createTlv(TAG.FEE_PERCENTAGE, feeValue, 'Value of Convenience Fee (%)'));
  }
}

/**
 * Legacy wrapper — qris-dinamis 1.x compatibility: makeString(qris,{nominal,taxtype,fee})
 */
export function makeStringLegacy(
  qris: string,
  options: { nominal: string | number; taxtype?: 'p' | 'r'; fee?: string | number },
): string {
  const amount = options.nominal;
  let fee: ConvertOptions['fee'] | undefined;

  if (options.fee && String(options.fee) !== '0' && String(options.fee).trim() !== '') {
    const feeNumber = Number(options.fee);
    if (!Number.isNaN(feeNumber) && feeNumber > 0) {
      fee = {
        type: options.taxtype === 'r' ? 'fixed' : 'percentage',
        value: feeNumber,
      };
    }
  }

  return convertQris(qris, { amount, fee });
}
