import QRCode from "qrcode";
import { convertQRIS } from "../core/converter.js";
import { getMerchantInfo } from "./utils.js";
import type { ConvertOptions } from "../core/types.js";

export interface ImageOptions extends ConvertOptions {
  /** Alias for amount — for backward compat with makeFile({ nominal }) */
  nominal?: string | number;
  taxtype?: "p" | "r";
  feeLegacy?: string | number;
  /** Jika true return base64 DataURL, jika false tulis ke file (Node only) */
  base64?: boolean;
  /** Custom output path. Default: output/<MERCHANT>-<timestamp>.jpg */
  path?: string;
  /** Custom template image path */
  templatePath?: string;
  /** Margin QR di template */
  margin?: number;
  /** Scale QR */
  scale?: number;
  /** Width QR output (browser) */
  width?: number;
}

export interface QROnlyOptions extends ConvertOptions {
  nominal?: string | number;
  taxtype?: "p" | "r";
  feeLegacy?: string | number;
  margin?: number;
  width?: number;
  colorDark?: string;
  colorLight?: string;
}

/**
 * Normalisasi options — support API baru dan legacy (nominal/taxtype/fee)
 */
function normalizeOptions(opts: ImageOptions | QROnlyOptions): ConvertOptions {
  // legacy path: { nominal, taxtype, fee }
  const anyOpts = opts as any;
  if (anyOpts.nominal !== undefined && anyOpts.amount === undefined) {
    let fee: ConvertOptions["fee"] | undefined;
    const rawFee = anyOpts.fee ?? anyOpts.feeLegacy;
    if (rawFee !== undefined && String(rawFee) !== "0" && String(rawFee).trim() !== "") {
      const feeVal = Number(rawFee);
      if (!isNaN(feeVal) && feeVal > 0) {
        fee = {
          type: anyOpts.taxtype === "r" ? "fixed" : "percentage",
          value: feeVal,
        };
      }
    }
    return { amount: anyOpts.nominal, fee };
  }
  return opts as ConvertOptions;
}

/**
 * Generate QRIS Dynamic string saja (tanpa gambar)
 * Alias modern untuk makeString
 */
export function makeString(
  qris: string,
  options: ConvertOptions | { nominal: string | number; taxtype?: "p" | "r"; fee?: string | number }
): string {
  const normalized = normalizeOptions(options as any);
  return convertQRIS(qris, normalized);
}

/**
 * Generate QR Code DataURL saja (tanpa template struk) — ringan, work di Node & Browser
 */
export async function makeQRDataURL(
  qris: string,
  options: QROnlyOptions
): Promise<string> {
  const normalized = normalizeOptions(options);
  const dynamicQRIS = convertQRIS(qris, normalized);
  const dataURL = await QRCode.toDataURL(dynamicQRIS, {
    margin: options.margin ?? 2,
    width: options.width ?? 512,
    color: {
      dark: options.colorDark ?? "#000000",
      light: options.colorLight ?? "#FFFFFF",
    },
  });
  return dataURL;
}

/**
 * Generate QR Code Buffer (Node.js) — untuk di-composite ke template
 */
export async function makeQRBuffer(
  qris: string,
  options: QROnlyOptions
): Promise<Buffer> {
  const normalized = normalizeOptions(options);
  const dynamicQRIS = convertQRIS(qris, normalized);
  const buffer = await QRCode.toBuffer(dynamicQRIS, {
    margin: 2,
    scale: 10,
    width: 512,
    type: "png",
  });
  return buffer;
}

/**
 * Browser-only helper: generate QR as DataURL (simple, tanpa Jimp)
 */
async function generateBrowserQR(qris: string, options: ImageOptions): Promise<string> {
  const normalized = normalizeOptions(options);
  const dynamicQRIS = convertQRIS(qris, normalized);
  const qrDataURL = await QRCode.toDataURL(dynamicQRIS, {
    margin: 2,
    scale: 10,
    width: 512,
  });
  return qrDataURL;
}

// Lazy dynamic import for Jimp — supaya browser bundle tidak include Jimp yang berat
let JimpCache: any = null;
let loadFontCache: any = null;
async function getJimp() {
  if (JimpCache) return JimpCache;
  try {
    const mod = await import("jimp");
    JimpCache = (mod as any).Jimp ?? (mod as any).default ?? mod;
    loadFontCache = (mod as any).loadFont ?? (mod as any).Jimp?.loadFont;
    return JimpCache;
  } catch (e) {
    throw new Error("Jimp is required for makeFile/makeImage with template. Install with: npm i jimp");
  }
}
async function getLoadFont() {
  if (loadFontCache) return loadFontCache;
  await getJimp();
  if (!loadFontCache) {
    const mod = await import("jimp");
    loadFontCache = (mod as any).loadFont;
  }
  return loadFontCache;
}

/**
 * ★ FITUR CETAK GAMBAR STRUK ★
 * Generate image JPG struk QRIS dengan template + overlay QR + merchant info.
 * - Di Node.js: bisa tulis ke file atau return base64
 * - Di Browser: otomatis return DataURL (QR only tanpa template, karena template butuh fs)
 */
export async function makeFile(
  qris: string,
  options: ImageOptions = {} as ImageOptions
): Promise<string> {
  const isBrowser = typeof window !== "undefined";

  // Normalisasi legacy -> modern
  const normalized = normalizeOptions(options);
  // Pastikan amount terisi dari normalized
  const effectiveOptions: ImageOptions = {
    ...options,
    amount: normalized.amount,
    fee: normalized.fee,
  };

  if (isBrowser && !effectiveOptions.base64) {
    throw new Error(
      "File writing is not supported in browser environment. Use { base64: true } instead."
    );
  }

  if (isBrowser) {
    return generateBrowserQR(qris, effectiveOptions);
  }

  // Node.js path — full template compositing
  const qrisModified = convertQRIS(qris, normalized);
  const info = getMerchantInfo(qris);
  const text = info.merchantName;

  const Jimp = await getJimp();

  // Generate QR buffer then read with Jimp
  const qrBuffer = await QRCode.toBuffer(qrisModified, {
    margin: 2,
    scale: 10,
    type: "png",
  });
  const qrImage = await Jimp.read(qrBuffer);

  // Resolve template path — default assets/template.png relative to project root or dist
  const pathMod = await import("path");
  const fsMod = await import("fs");

  const candidates = [
    effectiveOptions.templatePath,
    "assets/template.png",
    "dist/assets/template.png",
    pathMod.join(process.cwd(), "assets/template.png"),
    pathMod.join(process.cwd(), "dist/assets/template.png"),
  ].filter(Boolean) as string[];

  let templatePath = candidates[0];
  for (const p of candidates) {
    try {
      if (fsMod.existsSync(p)) {
        templatePath = p;
        break;
      }
    } catch {}
  }

  let templateImage: any;
  try {
    templateImage = await Jimp.read(templatePath);
  } catch (e) {
    // Fallback: generate plain white canvas 1080x1920 if template not found
    console.warn(`[BITS-QRIS] Template not found at ${templatePath}, using plain canvas`);
    templateImage = new Jimp({ width: 1080, height: 1920, color: 0xffffffff });
  }

  const w = templateImage.bitmap.width;
  const h = templateImage.bitmap.height;

  // Load fonts — try custom, fallback to skip text if not found
  let fontTitle: any, fontMid: any, fontSmall: any;
  const loadFont = await getLoadFont();
  try {
    const isLongName = text.length > 18;
    const isVeryLong = text.length > 28;
    const titleFontPath = isLongName
      ? "assets/font/BebasNeueSedang/BebasNeue-Regular.ttf.fnt"
      : "assets/font/BebasNeue/BebasNeue-Regular.ttf.fnt";
    const midFontPath = isVeryLong
      ? "assets/font/RobotoSedang/Roboto-Regular.ttf.fnt"
      : "assets/font/RobotoBesar/Roboto-Regular.ttf.fnt";

    // Try custom fonts first
    const candidatesTitle = [titleFontPath, "dist/" + titleFontPath, "dist/assets/" + titleFontPath.replace("assets/","")];
    const candidatesMid = [midFontPath, "dist/" + midFontPath, "dist/assets/" + midFontPath.replace("assets/","")];
    const candidatesSmall = ["assets/font/RobotoKecil/Roboto-Regular.ttf.fnt", "dist/assets/font/RobotoKecil/Roboto-Regular.ttf.fnt"];
    const findExisting = (arr: string[]) => arr.find(p=>{try{return fsMod.existsSync(p)}catch{return false}});
    const titlePath = findExisting(candidatesTitle);
    const midPath = findExisting(candidatesMid);
    const smallPath = findExisting(candidatesSmall);
    if (titlePath && midPath && smallPath && loadFont) {
      fontTitle = await loadFont(titlePath);
      fontMid = await loadFont(midPath);
      fontSmall = await loadFont(smallPath);
    } else {
      throw new Error("Custom fonts not found");
    }
  } catch (fontError: any) {
    console.warn("[BITS-QRIS] Fonts not available, generating QR-only image:", fontError?.message?.slice(0,120));
    fontTitle = null;
    fontMid = null;
    fontSmall = null;
  }

  // Composite QR onto template — posisi disesuaikan dari original Dynamic-QRIS (proporsional)
  const qrX = Math.floor(w / 4 - 30);
  const qrY = Math.floor(h / 4 + 68);

  // Resize QR to fit ~ 560x560 if template is 1080 wide
  const targetQRSize = Math.floor(w * 0.52);
  if (qrImage.bitmap.width !== targetQRSize) {
    qrImage.resize({ w: targetQRSize, h: targetQRSize });
  }

  templateImage.composite(qrImage, qrX, qrY);

  // Overlay text if fonts loaded
  if (fontTitle) {
    const isVeryLong = text.length > 28;
    templateImage.print({
      font: fontTitle,
      x: Math.floor(w / 5 - 30),
      y: Math.floor(h / 5 + 68 + (isVeryLong ? -180 : -210)),
      text: text,
    });
  }
  if (fontMid) {
    const isVeryLong = text.length > 28;
    templateImage.print({
      font: fontMid,
      x: Math.floor(w / 5 - 30),
      y: Math.floor(h / 5 + 68 + (isVeryLong ? 20 : -45)),
      text: `NMID : ${info.nmid}`,
    });
    templateImage.print({
      font: fontMid,
      x: Math.floor(w / 5 - 30),
      y: Math.floor(h / 5 + 68 + (isVeryLong ? 110 : 90)),
      text: info.id,
    });
  }
  if (fontSmall) {
    templateImage.print({
      font: fontSmall,
      x: Math.floor(w / 20),
      y: Math.floor(h - 120),
      text: `Dicetak oleh: ${info.nns} | ${info.merchantCity}`,
    });
  }

  // Output
  let outputPath = effectiveOptions.path;
  if (!outputPath) {
    const safeName = text.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30) || "QRIS";
    outputPath = `output/${safeName}-${Date.now()}.jpg`;
  }

  if (effectiveOptions.base64) {
    const base64 = await templateImage.getBase64("image/jpeg");
    return base64 as string;
  } else {
    // Ensure output directory exists
    const dir = pathMod.dirname(outputPath);
    if (dir && dir !== "." && !fsMod.existsSync(dir)) {
      fsMod.mkdirSync(dir, { recursive: true });
    }
    await templateImage.write(outputPath as any);
    return outputPath;
  }
}

/** Alias for makeFile — consistent naming */
export const makeImage = makeFile;
export const generateStruk = makeFile;
