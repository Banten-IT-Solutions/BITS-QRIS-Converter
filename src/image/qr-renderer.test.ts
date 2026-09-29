import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateBrowserQr,
  makeQrBuffer,
  makeQrDataUrl,
  makeQrSvg,
  makeString,
} from './qr-renderer.js';
import { calculateCrc16 } from '../core/crc16.js';

const QRIS_SAMPLE =
  '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5914TOKO BITS JAYA6007JAKARTA6105123456304';
// Payload di atas adalah prefix tanpa tag 63 berisi CRC — sematkan dulu,
// kalau tidak parser akan gagal dengan "truncated value (tag 63)".
const QRIS_PAYLOAD = `${QRIS_SAMPLE}${calculateCrc16(QRIS_SAMPLE)}`;

describe('QR rendering', () => {
  it('renders valid SVG and rejects empty payload', async () => {
    const svg = await makeQrSvg('deterministic payload');
    assert.match(svg, /^<svg/);
    assert.ok(svg.length > 100);
    await assert.rejects(makeQrSvg(''), /No input text/);
  });

  it('renders PNG buffer and data URLs from valid QRIS', async () => {
    const options = { amount: 1000 };
    const buffer = await makeQrBuffer(QRIS_PAYLOAD, options);
    assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    const dataUrl = await makeQrDataUrl(QRIS_PAYLOAD, options);
    assert.match(dataUrl, /^data:image\/png;base64,/);
  });

  it('supports browser rendering and modern conversion', async () => {
    const browserDataUrl = await generateBrowserQr(QRIS_PAYLOAD, { amount: 1000 });
    assert.match(browserDataUrl, /^data:image\/png;base64,/);
    const dynamic = makeString(QRIS_PAYLOAD, { amount: 1000 });
    assert.notEqual(dynamic, QRIS_PAYLOAD);
    assert.match(dynamic, /010212/);
  });

  it('rejects legacy option shapes', () => {
    assert.throws(() => makeString(QRIS_PAYLOAD, { nominal: 1000 } as never));
    assert.throws(() => makeString(QRIS_PAYLOAD, { amount: 1000, taxtype: 'r' } as never));
  });

  it('rejects invalid QRIS input', async () => {
    await assert.rejects(makeQrDataUrl('not qris', { amount: 1000 }));
    await assert.rejects(makeQrBuffer('not qris', { amount: 1000 }));
  });
});
