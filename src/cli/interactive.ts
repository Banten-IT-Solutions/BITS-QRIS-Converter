/**
 * CLI interactive prompts — handles readline then delegates to core + image
 */

import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';
import { convertQris, parseQris, validateQris } from '../core/index.js';
import { makeFile, makeQrDataUrl } from '../image/index.js';

export async function runInteractive(): Promise<void> {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => readline.question(question, (answer) => resolve(answer.trim())));

  try {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║   BITS QRIS Static → Dynamic Converter       ║');
    console.log('║   Hybrid: verssache core + Cetak Struk       ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    const qris = await ask('[?] Input QRIS string: ');
    const validation = validateQris(qris);

    if (!validation.valid) {
      console.log('\n[✗] Invalid QRIS:');
      for (const error of validation.errors) console.log(`    - ${error}`);
      readline.close();
      process.exit(1);
    }

    const parsed = parseQris(qris);
    console.log('\n[✓] QRIS Parsed:');
    console.log(`    Merchant : ${parsed.merchantName}`);
    console.log(`    City     : ${parsed.merchantCity}`);
    console.log(`    Method   : ${parsed.method}`);
    console.log(`    Currency : ${parsed.currency === '360' ? 'IDR' : parsed.currency}`);
    if (parsed.merchantAccountInfo.length > 0) {
      console.log(`    Provider : ${parsed.merchantAccountInfo[0].globallyUniqueId}`);
    }
    if (parsed.method === 'dynamic') {
      console.log(`    Amount   : ${parsed.amount ?? '-'}`);
      console.log('\n[!] This QRIS is already dynamic. Re-converting will update amount.');
    }

    const amountString = await ask('\n[?] Input nominal (Rupiah): ');
    const amount = Number.parseInt(amountString, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      console.log('[✗] Invalid amount.');
      readline.close();
      process.exit(1);
    }

    const useFeeAnswer = await ask('[?] Add service fee? (y/n): ');
    let fee: { type: 'fixed' | 'percentage'; value: number } | undefined;

    if (useFeeAnswer.toLowerCase() === 'y') {
      const feeType = await ask('[?] Fixed or Percentage? (f/p): ');
      if (feeType.toLowerCase() === 'f') {
        const feeValue = await ask('[?] Fee amount (Rupiah): ');
        fee = { type: 'fixed', value: Number.parseFloat(feeValue) };
      } else {
        const feeValue = await ask('[?] Fee percentage: ');
        fee = { type: 'percentage', value: Number.parseFloat(feeValue) };
      }
    }

    const result = convertQris(qris, { amount, fee });
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║   Result Dynamic QRIS                        ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log(`\n${result}\n`);

    const wantImage = await ask('[?] Cetak gambar struk? (y/n): ');
    if (wantImage.toLowerCase() !== 'y') {
      readline.close();
      return;
    }

    const asBase64 = await ask('[?] Output base64? (y/n): ');
    if (asBase64.toLowerCase() === 'y') {
      const base64 = await makeFile(qris, { amount, fee, base64: true });
      console.log('\n[✓] Base64 (first 100 chars):');
      console.log(`${(base64 as string).substring(0, 100)}...`);
      const save = await ask('[?] Save base64 to file? (y/n): ');
      if (save.toLowerCase() === 'y') {
        const filePath = `output/qris-${Date.now()}.txt`;
        writeFileSync(filePath, base64 as string);
        console.log(`[✓] Saved to ${filePath}`);
      }
    } else {
      const outputPath = await makeFile(qris, { amount, fee });
      console.log(`\n[✓] Struk saved to: ${outputPath}`);
      const qrUrl = await makeQrDataUrl(qris, { amount, fee });
      console.log(`[✓] QR DataURL ready (length: ${qrUrl.length})`);
    }

    readline.close();
  } catch (error) {
    readline.close();
    throw error;
  }
}

/** @deprecated Use runInteractive */
export const runInteractiveSafe = runInteractive;
