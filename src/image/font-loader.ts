/**
 * Font loader for Jimp receipt rendering
 * Handles custom .fnt fonts with caching and graceful fallback
 */

import fs from 'node:fs';
import path from 'node:path';
import { MODULE_ASSETS_DIR } from './module-dir.js';

type LoadFontFunction = (path: string) => Promise<unknown>;

// Cache Jimp + loadFont singletons
let jimpCache: unknown = null;
let loadFontCache: LoadFontFunction | null = null;

// Cache parsed fonts keyed by resolved path — avoid re-reading disk per receipt
const fontCache = new Map<string, Promise<unknown>>();

function loadFontCached(fontPath: string): Promise<unknown> {
  let cached = fontCache.get(fontPath);
  if (!cached) {
    cached = getLoadFont().then((loadFont) => loadFont(fontPath));
    fontCache.set(fontPath, cached);
    cached.catch(() => fontCache.delete(fontPath));
  }
  return cached;
}

async function getJimp(): Promise<unknown> {
  if (jimpCache) return jimpCache;
  const jimpModule = await import('jimp');
  const mod = jimpModule as Record<string, unknown>;
  jimpCache = (mod['Jimp'] as unknown) ?? (mod['default'] as unknown) ?? mod;
  loadFontCache =
    (mod['loadFont'] as LoadFontFunction) ??
    ((mod['Jimp'] as Record<string, unknown>)?.['loadFont'] as LoadFontFunction);
  return jimpCache;
}

async function getLoadFont(): Promise<LoadFontFunction> {
  if (loadFontCache) return loadFontCache;
  await getJimp();
  if (!loadFontCache) {
    const jimpModule = await import('jimp');
    loadFontCache = (jimpModule as Record<string, unknown>)['loadFont'] as LoadFontFunction;
  }
  if (!loadFontCache) throw new Error('loadFont not available in jimp');
  return loadFontCache;
}

function findExistingPath(candidates: string[]): string | undefined {
  return candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
}

export interface LoadedFonts {
  title: unknown | null;
  mid: unknown | null;
  small: unknown | null;
}

/**
 * Load fonts for receipt rendering based on merchant name length
 * Returns null fonts if custom fonts not found — caller should handle fallback (QR-only)
 */
export async function loadReceiptFonts(merchantName: string): Promise<LoadedFonts> {
  const isLongName = merchantName.length > 18;
  const isVeryLong = merchantName.length > 28;

  const titleFontPath = isLongName
    ? 'assets/fonts/title-bebas-neue-compact/title-bebas-neue-compact.fnt'
    : 'assets/fonts/title-bebas-neue/title-bebas-neue.fnt';

  const midFontPath = isVeryLong
    ? 'assets/fonts/body-roboto-medium/body-roboto-medium.fnt'
    : 'assets/fonts/body-roboto-large/body-roboto-large.fnt';

  const smallFontPath = 'assets/fonts/caption-roboto-small/caption-roboto-small.fnt';

  const candidatesFor = (relativePath: string): string[] =>
    [
      MODULE_ASSETS_DIR
        ? path.join(MODULE_ASSETS_DIR, relativePath.slice('assets/'.length))
        : undefined,
      relativePath,
      `dist/${relativePath}`,
    ].filter((candidate): candidate is string => Boolean(candidate));

  const titleCandidates = candidatesFor(titleFontPath);
  const midCandidates = candidatesFor(midFontPath);
  const smallCandidates = candidatesFor(smallFontPath);

  const titlePath = findExistingPath(titleCandidates);
  const midPath = findExistingPath(midCandidates);
  const smallPath = findExistingPath(smallCandidates);

  if (!titlePath || !midPath || !smallPath) {
    return { title: null, mid: null, small: null };
  }

  try {
    const [title, mid, small] = await Promise.all([
      loadFontCached(titlePath),
      loadFontCached(midPath),
      loadFontCached(smallPath),
    ]);
    return { title, mid, small };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[BITS-QRIS] Failed to load fonts: ${message.slice(0, 120)}`);
    return { title: null, mid: null, small: null };
  }
}

export async function getJimpInstance(): Promise<unknown> {
  return getJimp();
}
