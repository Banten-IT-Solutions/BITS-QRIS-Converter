import { calculateCRC16 } from "./crc16.js";
import { parseTLV } from "./parser.js";
import type { ConvertOptions, TLV } from "./types.js";

/**
 * Rebuild a QRIS string from TLV elements (without CRC).
 */
function buildTLVString(elements: TLV[]): string {
  return elements
    .map((el) => {
      const value = el.children ? buildTLVString(el.children) : el.value;
      const length = value.length.toString().padStart(2, "0");
      return `${el.tag}${length}${value}`;
    })
    .join("");
}

/**
 * Create a TLV element.
 */
function makeTLV(tag: string, value: string, name = ""): TLV {
  return { tag, name, length: value.length, value };
}

/**
 * Convert a static QRIS string to dynamic by injecting amount and optional fee.
 * Proper TLV-based — bukan split("5802ID") fragile.
 *
 * Steps:
 * 1. Parse TLV structure
 * 2. Change Point of Initiation Method from "11" (static) to "12" (dynamic)
 * 3. Insert/replace Transaction Amount (tag 54)
 * 4. Optionally insert Tip Indicator (tag 55) and fee value (tag 56/57)
 * 5. Recalculate CRC16 checksum (tag 63)
 */
export function convertQRIS(
  qrisString: string,
  options: ConvertOptions
): string {
  if (!qrisString) throw new Error('Parameter "qris" is required.');
  if (options.amount === undefined || options.amount === null || String(options.amount).trim() === "") {
    throw new Error('Parameter "amount" / "nominal" is required.');
  }

  const amountNum = Number(options.amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Invalid amount: must be positive number. Got: ' + options.amount);
  }

  const elements = parseTLV(qrisString);

  if (elements.length === 0) {
    throw new Error("Invalid QRIS: failed to parse TLV structure");
  }

  // Build the new TLV array preserving order, injecting/replacing as needed
  const result: TLV[] = [];
  let amountInserted = false;

  // Tags to skip (we'll re-insert them with correct values)
  const managedTags = new Set(["54", "55", "56", "57", "63"]);

  for (const el of elements) {
    if (managedTags.has(el.tag)) continue;

    if (el.tag === "01") {
      // Change static → dynamic (11 → 12). If already 12, keep 12.
      result.push(makeTLV("01", "12", "Point of Initiation Method"));
      continue;
    }

    // Insert amount + fee before tag 58 (Country Code) — sesuai spec EMVCo urutan tag harus numeric
    if (el.tag === "58" && !amountInserted) {
      const amountStr = String(Math.trunc(amountNum)); // QRIS amount tanpa decimal, tanpa leading zero
      result.push(makeTLV("54", amountStr, "Transaction Amount"));

      if (options.fee && Number(options.fee.value) > 0) {
        const feeVal = String(options.fee.value);
        if (options.fee.type === "fixed") {
          result.push(makeTLV("55", "02", "Tip or Convenience Indicator"));
          result.push(
            makeTLV("56", feeVal, "Value of Convenience Fee (Fixed)")
          );
        } else {
          result.push(makeTLV("55", "03", "Tip or Convenience Indicator"));
          result.push(
            makeTLV("57", feeVal, "Value of Convenience Fee (%)")
          );
        }
      }

      amountInserted = true;
    }

    result.push(el);
  }

  // Fallback: if tag 58 tidak ditemukan (QRIS malformed), append sebelum CRC
  if (!amountInserted) {
    const amountStr = String(Math.trunc(amountNum));
    result.push(makeTLV("54", amountStr, "Transaction Amount"));
    if (options.fee && Number(options.fee.value) > 0) {
      const feeVal = String(options.fee.value);
      if (options.fee.type === "fixed") {
        result.push(makeTLV("55", "02", "Tip or Convenience Indicator"));
        result.push(makeTLV("56", feeVal, "Value of Convenience Fee (Fixed)"));
      } else {
        result.push(makeTLV("55", "03", "Tip or Convenience Indicator"));
        result.push(makeTLV("57", feeVal, "Value of Convenience Fee (%)"));
      }
    }
  }

  // Sort check: pastikan tag 54,55,56,57 berada sebelum 58 dan setelah 53
  // Karena kita sudah insert sebelum 58, urutan sudah benar ( ...53,54,55,56/57,58... )

  // Build string without CRC, then append CRC
  const withoutCRC = buildTLVString(result);
  const crcInput = withoutCRC + "6304";
  const crc = calculateCRC16(crcInput);

  return crcInput + crc;
}

/**
 * Legacy wrapper: makeString(qris, { nominal, taxtype, fee })
 * Untuk kompatibilitas dengan API qris-dinamis 1.x / Dynamic-QRIS
 */
export function makeStringLegacy(
  qris: string,
  opts: { nominal: string | number; taxtype?: "p" | "r"; fee?: string | number }
): string {
  const amount = opts.nominal;
  let fee: ConvertOptions["fee"] | undefined = undefined;
  if (opts.fee && String(opts.fee) !== "0" && String(opts.fee).trim() !== "") {
    const feeVal = Number(opts.fee);
    if (!isNaN(feeVal) && feeVal > 0) {
      fee = {
        type: opts.taxtype === "r" ? "fixed" : "percentage",
        value: feeVal,
      };
    }
  }
  return convertQRIS(qris, { amount, fee });
}
