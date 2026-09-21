/**
 * CLI command handlers — each command is a pure async function
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { parseQris, convertQris, validateQris } from '../core/index.js';
import { makeFile } from '../image/index.js';
import { ensureOutputDirectory } from '../image/template-resolver.js';
import type { BatchCliArgs, ConvertCliArgs } from './parser.js';
import { parseBatchLines } from './parser.js';

export async function handleValidate(qris: string): Promise<void> {
  const result = validateQris(qris);
  console.log(JSON.stringify(result, null, 2));
}

export async function handleParse(qris: string): Promise<void> {
  const data = parseQris(qris);
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Render receipt once; reuse the base64 JPEG for both stdout preview and file write
 */
async function renderReceiptOnce(
  qris: string,
  options: { amount: number; fee?: ConvertCliArgs['fee'] },
): Promise<string> {
  const dataUrl = await makeFile(qris, { ...options, base64: true });
  return dataUrl;
}

function writeBase64Image(dataUrl: string, filePath: string): void {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  ensureOutputDirectory(filePath);
  writeFileSync(filePath, Buffer.from(base64, 'base64'));
}

export async function handleConvert(args: ConvertCliArgs): Promise<void> {
  const validation = validateQris(args.qris);
  if (!validation.valid) {
    console.error('[✗] Invalid QRIS:');
    for (const error of validation.errors) console.error(`    - ${error}`);
    process.exit(1);
  }

  const result = convertQris(args.qris, { amount: args.amount, fee: args.fee });
  console.log(result);

  if (args.imagePath === undefined && !args.base64) return;

  const dataUrl = await renderReceiptOnce(args.qris, { amount: args.amount, fee: args.fee });

  if (args.imagePath !== undefined) {
    writeBase64Image(dataUrl, args.imagePath);
    console.log(`[image] Saved to: ${args.imagePath}`);
  }

  if (args.base64) {
    console.log(`[base64] ${dataUrl.substring(0, 80)}...`);
  }
}

interface BatchResult {
  input: string;
  dynamic?: string;
  image?: string;
  valid: boolean;
  error?: string;
}

export async function handleBatch(args: BatchCliArgs): Promise<void> {
  const content = readFileSync(args.file, 'utf8');
  const lines = parseBatchLines(content);
  let failed = 0;

  for (const [index, line] of lines.entries()) {
    const result: BatchResult = { input: line, valid: false };

    try {
      const validation = validateQris(line);
      if (!validation.valid) {
        result.error = validation.errors.join('; ');
      } else {
        result.dynamic = convertQris(line, { amount: args.amount, fee: args.fee });
        result.valid = true;

        if (args.image) {
          const imagePath = `output/batch-${index + 1}.jpg`;
          const dataUrl = await renderReceiptOnce(line, { amount: args.amount, fee: args.fee });
          writeBase64Image(dataUrl, imagePath);
          result.image = imagePath;
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    if (!result.valid) failed += 1;
    console.log(JSON.stringify(result));
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}
