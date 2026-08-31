import { convertQRIS, parseQRIS, validateQRIS, makeFile, makeQRDataURL, getMerchantInfo } from '../dist/esm/index.js';

// Ganti dengan QRIS static asli kamu (contoh dummy, CRC akan fail tapi tetap demonstra converter)
const QRIS_STATIC = '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG61051234563047918';

async function main() {
  console.log('=== BITS QRIS Converter Example ===\n');

  // 1. Validate
  const validation = validateQRIS(QRIS_STATIC);
  console.log('Valid?', validation.valid);
  if (!validation.valid) console.log('Errors:', validation.errors);

  // 2. Parse
  const parsed = parseQRIS(QRIS_STATIC);
  console.log('\nParsed:', {
    merchantName: parsed.merchantName,
    merchantCity: parsed.merchantCity,
    method: parsed.method,
    amount: parsed.amount,
  });

  // 3. Convert
  const dynamic = convertQRIS(QRIS_STATIC, {
    amount: 50000,
    fee: { type: 'percentage', value: 2 },
  });
  console.log('\nDynamic QRIS:\n', dynamic);

  // 4. Merchant info untuk struk
  const info = getMerchantInfo(QRIS_STATIC);
  console.log('\nMerchant Info:', info);

  // 5. QR DataURL ringan (tanpa Jimp)
  const qrDataURL = await makeQRDataURL(QRIS_STATIC, { amount: 50000 });
  console.log('\nQR DataURL length:', qrDataURL.length);
  console.log(qrDataURL.substring(0, 80) + '...');

  // 6. Cetak struk JPG (butuh Jimp + template)
  try {
    const file = await makeFile(QRIS_STATIC, { amount: 50000, base64: false });
    console.log('\n✓ Struk saved to:', file);

    const base64 = await makeFile(QRIS_STATIC, { amount: 50000, base64: true });
    console.log('✓ Base64 length:', base64.length);
  } catch (e) {
    console.warn('makeFile failed (maybe template missing):', e.message);
  }
}

main().catch(console.error);
