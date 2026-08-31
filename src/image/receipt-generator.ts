/**
 * Receipt image generator — composes QR onto template with merchant overlay
 * Main entry: makeFile (also aliased as makeImage / generateStruk)
 */

import QRCode from 'qrcode';
import { QrisImageError } from '../shared/errors.js';
import { sanitizeFilename } from '../shared/format.js';
import { convertQris } from '../core/converter.js';
import { getMerchantInfo } from './merchant-info.js';
import { loadReceiptFonts, getJimpInstance } from './font-loader.js';
import { ensureOutputDirectory, resolveTemplatePath } from './template-resolver.js';
import { generateBrowserQr } from './qr-renderer.js';
import { normalizeLegacyOptions } from './utils.js';
import type { ImageOptions } from './types.js';

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Generate receipt JPG from QRIS — with template + merchant overlay (Node) or QR DataURL (Browser)
 */
export async function makeFile(
  qris: string,
  options: ImageOptions = {} as ImageOptions,
): Promise<string> {
  const normalized = normalizeLegacyOptions(options);
  const effectiveOptions: ImageOptions = {
    ...options,
    amount: normalized.amount,
    fee: normalized.fee,
  };

  if (isBrowserEnvironment()) {
    if (!effectiveOptions.base64) {
      throw new QrisImageError(
        'File writing is not supported in browser environment. Use { base64: true } instead.',
      );
    }
    return generateBrowserQr(qris, effectiveOptions);
  }

  return generateNodeReceipt(qris, normalized, effectiveOptions);
}

async function generateNodeReceipt(
  qris: string,
  normalized: ReturnType<typeof normalizeLegacyOptions>,
  effectiveOptions: ImageOptions,
): Promise<string> {
  const qrisDynamic = convertQris(qris, normalized);
  const merchantInfo = getMerchantInfo(qris);
  const merchantName = merchantInfo.merchantName;

  const Jimp = (await getJimpInstance()) as {
    read: (input: Buffer | string) => Promise<{
      bitmap: { width: number; height: number };
      resize: (opts: { w: number; h: number }) => void;
      composite: (img: unknown, x: number, y: number) => unknown;
      print: (opts: unknown) => unknown;
      getBase64: (mime: string) => Promise<string>;
      write: (path: string) => Promise<void>;
    }>;
  };

  const qrBuffer = await QRCode.toBuffer(qrisDynamic, { margin: 2, scale: 10, type: 'png' });
  const qrImage = await Jimp.read(qrBuffer as unknown as string);

  const templatePath = resolveTemplatePath(effectiveOptions.templatePath);
  let templateImage: Awaited<ReturnType<typeof Jimp.read>>;

  try {
    templateImage = await Jimp.read(templatePath);
  } catch {
    console.warn(`[BITS-QRIS] Template not found at ${templatePath}, using plain canvas`);
    const JimpCtor = Jimp as unknown as new (opts: {
      width: number;
      height: number;
      color: number;
    }) => typeof templateImage;
    templateImage = new (
      JimpCtor as unknown as new (opts: {
        width: number;
        height: number;
        color: number;
      }) => typeof templateImage
    )({
      width: 1080,
      height: 1920,
      color: 0xffffffff,
    });
  }

  const canvasWidth = templateImage.bitmap.width;
  const canvasHeight = templateImage.bitmap.height;

  const fonts = await loadReceiptFonts(merchantName);

  const qrX = Math.floor(canvasWidth / 4 - 30);
  const qrY = Math.floor(canvasHeight / 4 + 68);
  const targetQrSize = Math.floor(canvasWidth * 0.52);

  if (qrImage.bitmap.width !== targetQrSize) {
    qrImage.resize({ w: targetQrSize, h: targetQrSize });
  }

  templateImage.composite(qrImage as unknown as never, qrX, qrY);

  if (fonts.title) {
    const isVeryLong = merchantName.length > 28;
    templateImage.print({
      font: fonts.title as never,
      x: Math.floor(canvasWidth / 5 - 30),
      y: Math.floor(canvasHeight / 5 + 68 + (isVeryLong ? -180 : -210)),
      text: merchantName,
    } as never);
  }

  if (fonts.mid) {
    const isVeryLong = merchantName.length > 28;
    templateImage.print({
      font: fonts.mid as never,
      x: Math.floor(canvasWidth / 5 - 30),
      y: Math.floor(canvasHeight / 5 + 68 + (isVeryLong ? 20 : -45)),
      text: `NMID : ${merchantInfo.nmid}`,
    } as never);
    templateImage.print({
      font: fonts.mid as never,
      x: Math.floor(canvasWidth / 5 - 30),
      y: Math.floor(canvasHeight / 5 + 68 + (isVeryLong ? 110 : 90)),
      text: merchantInfo.id,
    } as never);
  }

  if (fonts.small) {
    templateImage.print({
      font: fonts.small as never,
      x: Math.floor(canvasWidth / 20),
      y: Math.floor(canvasHeight - 120),
      text: `Dicetak oleh: ${merchantInfo.nns} | ${merchantInfo.merchantCity}`,
    } as never);
  }

  const outputPath =
    effectiveOptions.path ?? `output/${sanitizeFilename(merchantName)}-${Date.now()}.jpg`;

  if (effectiveOptions.base64) {
    return templateImage.getBase64('image/jpeg');
  }

  ensureOutputDirectory(outputPath);
  await templateImage.write(outputPath as unknown as string);
  return outputPath;
}

/** Aliases — keep backward compatibility */
export const makeImage = makeFile;
export const generateStruk = makeFile;
