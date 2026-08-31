import { parseQRIS } from "../core/parser.js";
import { calculateCRC16 } from "../core/crc16.js";

/**
 * Utility untuk extract merchant info untuk cetak struk
 * Improved & null-safe version dari Dynamic-QRIS lib/dataQris
 */
export function getMerchantInfo(qris: string) {
  const parsed = parseQRIS(qris);

  const nmid = (() => {
    const m = qris.match(/15ID(\d+?)0303/);
    if (m) return "ID" + m[1];
    const info = parsed.merchantAccountInfo[0];
    if (info?.merchantId) {
      return info.merchantId.startsWith("ID") ? info.merchantId : "ID" + info.merchantId;
    }
    return "ID-UNKNOWN";
  })();

  const id = qris.includes("A01") ? "A01" : "01";
  const merchantName = parsed.merchantName?.trim().toUpperCase() || "MERCHANT";
  const merchantCity = parsed.merchantCity || "";

  let printer = "UNKNOWN";
  const printData = qris.match(/(?<=ID|COM).+?(?=0118)/g);
  if (printData && printData.length > 0) {
    const last = printData[printData.length - 1];
    const parts = last.split(".");
    if (parts.length === 3) printer = parts[1];
    else printer = parts[2] ?? parts[1] ?? "UNKNOWN";
  }

  let nns = "UNKNOWN";
  const nnsData = qris.match(/(?<=0118).+?(?=ID)/g);
  if (nnsData && nnsData.length > 0) {
    nns = nnsData[nnsData.length - 1].substring(0, 8);
  }

  const crcIsValid = (() => {
    if (qris.length < 4) return false;
    const withoutCRC = qris.slice(0, -4);
    const declared = qris.slice(-4).toUpperCase();
    return calculateCRC16(withoutCRC) === declared;
  })();

  return {
    nmid,
    id,
    merchantName,
    merchantCity,
    printer,
    nns,
    crcIsValid,
    raw: parsed,
  };
}

export function padLength(len: number): string {
  return len.toString().padStart(2, "0");
}

export function formatRupiah(amount: number | string): string {
  const n = typeof amount === "string" ? parseInt(amount, 10) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}
