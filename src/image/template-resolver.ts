/**
 * Template path resolver for receipt image generation
 * Centralizes file existence checks and path candidates
 */

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_TEMPLATE = 'assets/images/qris-receipt-template.png';
const DIST_TEMPLATE = 'dist/assets/images/qris-receipt-template.png';

export function resolveTemplatePath(customPath?: string): string {
  const candidates: string[] = [
    customPath,
    DEFAULT_TEMPLATE,
    DIST_TEMPLATE,
    path.join(process.cwd(), DEFAULT_TEMPLATE),
    path.join(process.cwd(), DIST_TEMPLATE),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // ignore
    }
  }

  return candidates[0] ?? DEFAULT_TEMPLATE;
}

export function ensureOutputDirectory(filePath: string): void {
  const directory = path.dirname(filePath);
  if (directory && directory !== '.' && !fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
