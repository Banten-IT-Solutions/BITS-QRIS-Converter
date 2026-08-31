/**
 * Shared formatting utilities — pure, cached, no side effects
 */

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

/**
 * Pad number to 2 digits with leading zero (for TLV length field)
 */
export function padLength(length: number): string {
  return length.toString().padStart(2, '0');
}

/**
 * Format amount to Indonesian Rupiah
 * @example formatRupiah(50000) => "Rp 50.000"
 */
export function formatRupiah(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? Number.parseInt(amount, 10) : amount;

  if (Number.isNaN(numericAmount)) {
    throw new Error(`Invalid amount for formatRupiah: ${amount}`);
  }

  return rupiahFormatter.format(numericAmount);
}

/**
 * Sanitize merchant name for safe filename
 */
export function sanitizeFilename(name: string, maxLength = 30): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, maxLength) || 'QRIS';
}
