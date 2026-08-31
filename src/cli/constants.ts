/**
 * CLI constants
 */

export const CLI_VERSION = '1.0.0';
export const CLI_NAME = 'bits-qris';

export const HELP_TEXT = `
BITS-QRIS-Converter v${CLI_VERSION} — QRIS Static → Dynamic + Cetak Struk

Usage:
  ${CLI_NAME}                          Interactive mode
  ${CLI_NAME} --help                   Show help
  ${CLI_NAME} --validate <QRIS>        Validate QRIS
  ${CLI_NAME} --parse <QRIS>           Parse QRIS
  ${CLI_NAME} --convert <QRIS> <AMOUNT> [--fee <VALUE> --type <fixed|percentage>] [--image <path>] [--base64]
  npx bits-qris --convert ...

Examples:
  ${CLI_NAME} --convert "000201010211..." 50000
  ${CLI_NAME} --convert "000201010211..." 50000 --fee 1000 --type fixed --image output/struk.jpg
  ${CLI_NAME} --convert "000201010211..." 50000 --fee 2.5 --type percentage --base64

API (programmatic):
  import { convertQris, makeFile, parseQris, validateQris } from "bits-qris";
`.trim();
