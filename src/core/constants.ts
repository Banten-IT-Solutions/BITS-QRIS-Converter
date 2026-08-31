/**
 * QRIS / EMVCo constants
 * Centralized to avoid magic strings throughout codebase
 */

// TLV Tag IDs
export const TAG = {
  PAYLOAD_FORMAT_INDICATOR: '00',
  POINT_OF_INITIATION: '01',
  MERCHANT_CATEGORY_CODE: '52',
  TRANSACTION_CURRENCY: '53',
  TRANSACTION_AMOUNT: '54',
  TIP_INDICATOR: '55',
  FEE_FIXED: '56',
  FEE_PERCENTAGE: '57',
  COUNTRY_CODE: '58',
  MERCHANT_NAME: '59',
  MERCHANT_CITY: '60',
  POSTAL_CODE: '61',
  ADDITIONAL_DATA: '62',
  CRC: '63',
} as const;

// Point of Initiation values
export const POINT_OF_INITIATION = {
  STATIC: '11',
  DYNAMIC: '12',
} as const;

// Tip indicator values
export const TIP_INDICATOR = {
  PROMPT: '01',
  FIXED: '02',
  PERCENTAGE: '03',
} as const;

// CRC
export const CRC_TAG = '63';
export const CRC_PLACEHOLDER = '6304';
export const CRC_POLYNOMIAL = 0x1021;
export const CRC_INIT = 0xffff;

// Merchant Account Info tag range (26-51)
export const MERCHANT_INFO_TAG_START = 26;
export const MERCHANT_INFO_TAG_END = 51;
export const MERCHANT_INFO_TAGS: readonly string[] = Object.freeze(
  Array.from({ length: MERCHANT_INFO_TAG_END - MERCHANT_INFO_TAG_START + 1 }, (_, i) =>
    String(MERCHANT_INFO_TAG_START + i).padStart(2, '0'),
  ),
);

// Required tags for validation
export const REQUIRED_TAGS = [
  { tag: TAG.PAYLOAD_FORMAT_INDICATOR, name: 'Payload Format Indicator' },
  { tag: TAG.POINT_OF_INITIATION, name: 'Point of Initiation Method' },
  { tag: TAG.MERCHANT_CATEGORY_CODE, name: 'Merchant Category Code' },
  { tag: TAG.TRANSACTION_CURRENCY, name: 'Transaction Currency' },
  { tag: TAG.COUNTRY_CODE, name: 'Country Code' },
  { tag: TAG.MERCHANT_NAME, name: 'Merchant Name' },
  { tag: TAG.MERCHANT_CITY, name: 'Merchant City' },
  { tag: TAG.CRC, name: 'CRC' },
] as const;

// Payload format
export const PAYLOAD_FORMAT_INDICATOR_VALUE = '01';
export const PAYLOAD_PREFIX = '000201';

// Human-readable tag names (EMVCo spec)
export const TAG_NAMES: Readonly<Record<string, string>> = Object.freeze({
  '00': 'Payload Format Indicator',
  '01': 'Point of Initiation Method',
  '02': 'Visa',
  '03': 'Mastercard',
  '04': 'Mastercard',
  '15': 'Visa',
  '26': 'Merchant Account Information',
  '27': 'Merchant Account Information',
  '28': 'Merchant Account Information',
  '29': 'Merchant Account Information',
  '30': 'Merchant Account Information',
  '31': 'Merchant Account Information',
  '32': 'Merchant Account Information',
  '33': 'Merchant Account Information',
  '34': 'Merchant Account Information',
  '35': 'Merchant Account Information',
  '36': 'Merchant Account Information',
  '37': 'Merchant Account Information',
  '38': 'Merchant Account Information',
  '39': 'Merchant Account Information',
  '40': 'Merchant Account Information',
  '41': 'Merchant Account Information',
  '42': 'Merchant Account Information',
  '43': 'Merchant Account Information',
  '44': 'Merchant Account Information',
  '45': 'Merchant Account Information',
  '46': 'Merchant Account Information',
  '47': 'Merchant Account Information',
  '48': 'Merchant Account Information',
  '49': 'Merchant Account Information',
  '50': 'Merchant Account Information',
  '51': 'Merchant Account Information',
  '52': 'Merchant Category Code',
  '53': 'Transaction Currency',
  '54': 'Transaction Amount',
  '55': 'Tip or Convenience Indicator',
  '56': 'Value of Convenience Fee (Fixed)',
  '57': 'Value of Convenience Fee (%)',
  '58': 'Country Code',
  '59': 'Merchant Name',
  '60': 'Merchant City',
  '61': 'Postal Code',
  '62': 'Additional Data Field',
  '63': 'CRC',
});

// Tags that contain nested TLV children
export const NESTED_TAGS: ReadonlySet<string> = Object.freeze(
  new Set<string>([...MERCHANT_INFO_TAGS, TAG.ADDITIONAL_DATA]),
);
