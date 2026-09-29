import jsQR from 'jsqr';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DECODE_DIM = 2048;

export async function decodeImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error('File terlalu besar — maksimal 10MB');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('image load failed'));
    });
    const scale = Math.min(1, MAX_DECODE_DIM / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * scale));
    c.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const code = jsQR(data.data, data.width, data.height, { inversionAttempts: 'dontInvert' });
    if (!code) throw new Error('QR tidak terbaca — pastikan foto QRIS cukup jelas dan tidak buram');
    return code.data;
  } finally {
    URL.revokeObjectURL(url);
  }
}
