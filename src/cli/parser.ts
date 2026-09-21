/**
 * CLI argument parser — pure function, no side effects
 */

export interface ConvertCliArgs {
  qris: string;
  amount: number;
  fee?: { type: 'fixed' | 'percentage'; value: number };
  imagePath?: string;
  base64: boolean;
}

export interface BatchCliArgs {
  file: string;
  amount: number;
  fee?: { type: 'fixed' | 'percentage'; value: number };
  image: boolean;
}

/**
 * Read the value after a flag. Returns undefined if flag absent.
 * Throws if flag present but value missing or looks like another flag.
 */
function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function parseFeeAndType(args: string[]): ConvertCliArgs['fee'] {
  const feeRaw = readFlagValue(args, '--fee');
  if (feeRaw === undefined) return undefined;

  const feeValue = Number(feeRaw);
  if (!Number.isFinite(feeValue) || feeValue < 0) throw new Error(`Invalid fee: ${feeRaw}`);

  const typeRaw = readFlagValue(args, '--type') ?? 'fixed';
  if (typeRaw !== 'fixed' && typeRaw !== 'percentage') {
    throw new Error(`Invalid type: ${typeRaw} (must be fixed|percentage)`);
  }

  return { type: typeRaw, value: feeValue };
}

function parseAmount(raw: string): number {
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${raw}`);
  }
  return amount;
}

export function parseConvertArgs(args: string[]): ConvertCliArgs | null {
  if (args[0] !== '--convert' || !args[1] || !args[2]) return null;

  const qris = args[1];
  const amount = parseAmount(args[2]);
  const fee = parseFeeAndType(args);
  const imagePath = readFlagValue(args, '--image');
  const base64 = args.includes('--base64');

  return { qris, amount, fee, imagePath, base64 };
}

export function parseBatchArgs(args: string[]): BatchCliArgs | null {
  if (args[0] !== '--batch') return null;

  const file = readFlagValue(args, '--batch');
  if (!file) throw new Error('Missing value for --batch');

  const amountRaw = readFlagValue(args, '--amount');
  if (amountRaw === undefined) throw new Error('Missing required --amount for --batch');

  const amount = parseAmount(amountRaw);
  const fee = parseFeeAndType(args);
  const image = args.includes('--image');

  return { file, amount, fee, image };
}

/**
 * Split batch file content into QRIS lines — skip blank lines and # comments
 */
export function parseBatchLines(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}
