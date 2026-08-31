const { makeString, makeFile, convertQRIS } = require('../dist/cjs/index.js');

const QRIS_STATIC = '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG61051234563047918';

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
