/**
 * Template path resolver for receipt image generation
 * Centralizes file existence checks and path candidates
 */

import fs from 'node:fs';
import path from 'node:path';
import { MODULE_ASSETS_DIR } from './module-dir.js';

const TEMPLATE_NAME = 'images/qris-receipt-template.png';
const DEFAULT_TEMPLATE = `assets/${TEMPLATE_NAME}`;
const DIST_TEMPLATE = `dist/assets/${TEMPLATE_NAME}`;

export function resolveTemplatePath(customPath?: string): string {
  const candidates: string[] = [
    customPath,
    MODULE_ASSETS_DIR ? path.join(MODULE_ASSETS_DIR, TEMPLATE_NAME) : undefined,
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
