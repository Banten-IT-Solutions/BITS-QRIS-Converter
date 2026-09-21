/**
 * CLI constants
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

function readPackageVersion(): string {
  // dist/cjs/cli → ../../../package.json; src/cli (tsx) → ../../package.json
  const candidates = [
    path.join(__dirname, '..', '..', '..', 'package.json'),
    path.join(__dirname, '..', '..', 'package.json'),
  ];
  for (const pkgPath of candidates) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string };
      if (pkg.version) return pkg.version;
    } catch {
      // try next candidate
    }
  }
  return '0.0.0';
}

// Read from package.json at runtime — never hardcode
export const CLI_VERSION = readPackageVersion();
export const CLI_NAME = 'bits-qris';

export const HELP_TEXT = `
BITS-QRIS-Converter v${CLI_VERSION} — QRIS Static → Dynamic + Cetak Struk

Usage:
  ${CLI_NAME}                          Interactive mode
  ${CLI_NAME} --help                   Show help
  ${CLI_NAME} --validate <QRIS>        Validate QRIS
  ${CLI_NAME} --parse <QRIS>           Parse QRIS
  ${CLI_NAME} --convert <QRIS> <AMOUNT> [--fee <VALUE> --type <fixed|percentage>] [--image <path>] [--base64]
  ${CLI_NAME} --batch <file> --amount <AMOUNT> [--fee <VALUE> --type <fixed|percentage>] [--image]
  npx bits-qris --convert ...

Examples:
  ${CLI_NAME} --convert "000201010211..." 50000
  ${CLI_NAME} --convert "000201010211..." 50000 --fee 1000 --type fixed --image output/struk.jpg
  ${CLI_NAME} --convert "000201010211..." 50000 --fee 2.5 --type percentage --base64
  ${CLI_NAME} --batch list.txt --amount 10000
  ${CLI_NAME} --batch list.txt --amount 10000 --image

API (programmatic):
  import { convertQris, makeFile, parseQris, validateQris } from "bits-qris";
`.trim();
