const { makeString, makeFile, convertQRIS } = require('../dist/cjs/index.js');

const QRIS_STATIC = '00020101021126670016ID.CO.QRIS.WWW0215ID20232154007120303UMI51440014ID.CO.QRIS.WWW0215ID123456780303UMI5204541153033605802ID5914TOKO BITS JAYA6007JAKARTA61051234062070703A016304ABCD';

async function main() {
  // Legacy API kompatibel qris-dinamis 1.x
  const dynamic = makeString(QRIS_STATIC, { nominal: '75000', taxtype: 'p', fee: '2' });
  console.log('Legacy makeString:', dynamic);

  // Modern API
  const dynamic2 = convertQRIS(QRIS_STATIC, { amount: 75000, fee: { type: 'percentage', value: 2 } });
  console.log('Modern convertQRIS sama?', dynamic === dynamic2);

  // Cetak file
  try {
    const path = await makeFile(QRIS_STATIC, { nominal: '75000', base64: false });
    console.log('Saved to:', path);
  } catch (e) {
    console.error(e);
  }
}

main();
