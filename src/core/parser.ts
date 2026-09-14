/**
 * TLV & QRIS parsing
 * Single Responsibility: parse raw string → structured data
 */

import { QrisParseError } from '../shared/errors.js';
import { NESTED_TAGS, TAG_NAMES } from './constants.js';
import type { MerchantAccountInfo, QrisData, TlvElement } from './types.js';

export type { TlvElement, QrisData } from './types.js';

/**
 * Parse raw TLV string into array of TlvElement
 * Robust EMVCo parser — tidak pakai split fragile
 */
export function parseTlv(data: string): TlvElement[] {
  const elements: TlvElement[] = [];
  let position = 0;

  while (position < data.length) {
    if (position + 4 > data.length) {
      throw new QrisParseError(`Invalid TLV: truncated header at position ${position}`);
    }

    const tag = data.substring(position, position + 2);
    const lengthStr = data.substring(position + 2, position + 4);

    if (!/^\d{2}$/.test(lengthStr)) {
      throw new QrisParseError(
        `Invalid TLV: non-numeric length "${lengthStr}" at position ${position} (tag ${tag})`,
      );
    }

    const length = Number.parseInt(lengthStr, 10);

    if (position + 4 + length > data.length) {
      throw new QrisParseError(`Invalid TLV: truncated value at position ${position} (tag ${tag})`);
    }

    const value = data.substring(position + 4, position + 4 + length);
    const name = TAG_NAMES[tag] ?? `Unknown (${tag})`;

    const element: TlvElement = { tag, name, length, value };

    if (NESTED_TAGS.has(tag)) {
      element.children = parseTlv(value);
    }

    elements.push(element);
    position += 4 + length;
  }

  return elements;
}

/**
 * Parse QRIS string into structured QrisData
 */
export function parseQris(qrisString: string): QrisData {
  const raw = parseTlv(qrisString);
  const findTag = (tag: string): TlvElement | undefined => raw.find((el) => el.tag === tag);

  const methodValue = findTag('01')?.value;
  const method: QrisData['method'] = methodValue === '12' ? 'dynamic' : 'static';

  const tipIndicatorValue = findTag('55')?.value;
  let tipIndicator: QrisData['tipIndicator'];

  if (tipIndicatorValue === '01') tipIndicator = 'prompt';
  else if (tipIndicatorValue === '02') tipIndicator = 'fixed';
  else if (tipIndicatorValue === '03') tipIndicator = 'percentage';

  const merchantAccountInfo: MerchantAccountInfo[] = raw
    .filter((element) => {
      const tagNum = Number.parseInt(element.tag, 10);
      return tagNum >= 26 && tagNum <= 51 && Boolean(element.children);
    })
    .map((element) => {
      const children = element.children ?? [];
      const findChild = (childTag: string): TlvElement | undefined =>
        children.find((child) => child.tag === childTag);

      return {
        tag: element.tag,
        globallyUniqueId: findChild('00')?.value ?? '',
        merchantId: findChild('01')?.value ?? findChild('02')?.value,
        merchantCriteria: findChild('03')?.value,
        fields: children,
      };
    });

  return {
    version: findTag('00')?.value ?? '01',
    method,
    merchantAccountInfo,
    merchantCategoryCode: findTag('52')?.value ?? '',
    currency: findTag('53')?.value ?? '360',
    amount: findTag('54')?.value,
    tipIndicator,
    tipFixed: findTag('56')?.value,
    tipPercentage: findTag('57')?.value,
    countryCode: findTag('58')?.value ?? 'ID',
    merchantName: findTag('59')?.value ?? '',
    merchantCity: findTag('60')?.value ?? '',
    postalCode: findTag('61')?.value ?? '',
    additionalData: findTag('62')?.children,
    crc: findTag('63')?.value ?? '',
    raw,
  };
}
