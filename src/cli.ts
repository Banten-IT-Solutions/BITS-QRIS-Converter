#!/usr/bin/env node
import { createInterface } from "readline";
import { parseQRIS, convertQRIS, validateQRIS } from "./core/index.js";
import { makeFile, makeQRDataURL } from "./image/generator.js";
import { writeFileSync } from "fs";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

function printHelp() {
  console.log(`
BITS-QRIS-Converter v1.0.0 — QRIS Static → Dynamic + Cetak Struk

Usage:
  bits-qris                          Interactive mode
  bits-qris --help                   Show help
  bits-qris --validate <QRIS>        Validate QRIS
  bits-qris --parse <QRIS>           Parse QRIS
  bits-qris --convert <QRIS> <AMOUNT> [--fee <VALUE> --type <fixed|percentage>] [--image <path>] [--base64]
  npx bits-qris-converter --convert ...

Examples:
  bits-qris --convert "000201010211..." 50000
  bits-qris --convert "000201010211..." 50000 --fee 1000 --type fixed --image output/struk.jpg
  bits-qris --convert "000201010211..." 50000 --fee 2.5 --type percentage --base64

API (programmatic):
  import { convertQRIS, makeFile, parseQRIS, validateQRIS } from "bits-qris-converter";
`);
}

async function interactive() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   BITS QRIS Static → Dynamic Converter       ║");
  console.log("║   Hybrid: verssache core + Cetak Struk       ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const qris = await ask("[?] Input QRIS string: ");

  const validation = validateQRIS(qris);
  if (!validation.valid) {
    console.log("\n[✗] Invalid QRIS:");
    validation.errors.forEach((e) => console.log(`    - ${e}`));
    rl.close();
    process.exit(1);
  }

  const parsed = parseQRIS(qris);

  console.log("\n[✓] QRIS Parsed:");
  console.log(`    Merchant : ${parsed.merchantName}`);
  console.log(`    City     : ${parsed.merchantCity}`);
  console.log(`    Method   : ${parsed.method}`);
  console.log(`    Currency : ${parsed.currency === "360" ? "IDR" : parsed.currency}`);
  if (parsed.merchantAccountInfo.length > 0) {
    console.log(`    Provider : ${parsed.merchantAccountInfo[0].globallyUniqueId}`);
  }

  if (parsed.method === "dynamic") {
    console.log(`    Amount   : ${parsed.amount ?? "-"}`);
    console.log("\n[!] This QRIS is already dynamic. Re-converting will update amount.");
  }

  const amountStr = await ask("\n[?] Input nominal (Rupiah): ");
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) {
    console.log("[✗] Invalid amount.");
    rl.close();
    process.exit(1);
  }

  const useFee = await ask("[?] Add service fee? (y/n): ");
  let fee: { type: "fixed" | "percentage"; value: number } | undefined;
  if (useFee.toLowerCase() === "y") {
    const feeType = await ask("[?] Fixed or Percentage? (f/p): ");
    if (feeType.toLowerCase() === "f") {
      const feeVal = await ask("[?] Fee amount (Rupiah): ");
      fee = { type: "fixed", value: parseFloat(feeVal) };
    } else {
      const feeVal = await ask("[?] Fee percentage: ");
      fee = { type: "percentage", value: parseFloat(feeVal) };
    }
  }

  const result = convertQRIS(qris, { amount, fee });

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   Result Dynamic QRIS                        ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`\n${result}\n`);

  const wantImage = await ask("[?] Cetak gambar struk? (y/n): ");
  if (wantImage.toLowerCase() === "y") {
    const asBase64 = await ask("[?] Output base64? (y/n): ");
    if (asBase64.toLowerCase() === "y") {
      const base64 = await makeFile(qris, { amount, fee, base64: true });
      console.log("\n[✓] Base64 (first 100 chars):");
      console.log((base64 as string).substring(0, 100) + "...");
      const save = await ask("[?] Save base64 to file? (y/n): ");
      if (save.toLowerCase() === "y") {
        const p = `output/qris-${Date.now()}.txt`;
        writeFileSync(p, base64 as string);
        console.log(`[✓] Saved to ${p}`);
      }
    } else {
      const outPath = await makeFile(qris, { amount, fee });
      console.log(`\n[✓] Struk saved to: ${outPath}`);
      const qrURL = await makeQRDataURL(qris, { amount, fee });
      console.log(`[✓] QR DataURL ready (length: ${qrURL.length})`);
    }
  }

  rl.close();
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    rl.close();
    return;
  }

  if (args[0] === "--validate" && args[1]) {
    const res = validateQRIS(args[1]);
    console.log(JSON.stringify(res, null, 2));
    rl.close();
    return;
  }

  if (args[0] === "--parse" && args[1]) {
    const data = parseQRIS(args[1]);
    console.log(JSON.stringify(data, null, 2));
    rl.close();
    return;
  }

  if (args[0] === "--convert" && args[1] && args[2]) {
    const qris = args[1];
    const amount = Number(args[2]);
    let fee: { type: "fixed" | "percentage"; value: number } | undefined;
    const feeIdx = args.indexOf("--fee");
    const typeIdx = args.indexOf("--type");
    if (feeIdx !== -1 && args[feeIdx + 1]) {
      const feeVal = Number(args[feeIdx + 1]);
      const type = typeIdx !== -1 ? args[typeIdx + 1] : "fixed";
      fee = { type: type === "percentage" ? "percentage" : "fixed", value: feeVal };
    }
    const result = convertQRIS(qris, { amount, fee });
    console.log(result);

    const imageIdx = args.indexOf("--image");
    if (imageIdx !== -1) {
      const imgPath = args[imageIdx + 1] || undefined;
      const out = await makeFile(qris, { amount, fee, path: imgPath });
      console.log(`[image] Saved to: ${out}`);
    }
    if (args.includes("--base64")) {
      const b64 = await makeFile(qris, { amount, fee, base64: true });
      console.log(`[base64] ${String(b64).substring(0, 80)}...`);
    }
    rl.close();
    return;
  }

  // default interactive
  await interactive();
}

main().catch((e) => {
  console.error(e);
  rl.close();
  process.exit(1);
});
