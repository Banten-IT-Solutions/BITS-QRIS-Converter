/**
 * CLI command handlers — each command is a pure async function
 */

import { parseQris, convertQris, validateQris } from '../core/index.js';
import { makeFile } from '../image/index.js';
import type { ConvertCliArgs } from './parser.js';

export async function handleValidate(qris: string): Promise<void> {
  const result = validateQris(qris);
  console.log(JSON.stringify(result, null, 2));
}

export async function handleParse(qris: string): Promise<void> {
  const data = parseQris(qris);
  console.log(JSON.stringify(data, null, 2));
}

export async function handleConvert(args: ConvertCliArgs): Promise<void> {
  const result = convertQris(args.qris, { amount: args.amount, fee: args.fee });
  console.log(result);

  if (args.imagePath !== undefined) {
    const output = await makeFile(args.qris, {
      amount: args.amount,
      fee: args.fee,
      path: args.imagePath,
    });
    console.log(`[image] Saved to: ${output}`);
  }

  if (args.base64) {
    const base64 = await makeFile(args.qris, { amount: args.amount, fee: args.fee, base64: true });
    console.log(`[base64] ${String(base64).substring(0, 80)}...`);
  }
}
