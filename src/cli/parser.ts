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

export function parseConvertArgs(args: string[]): ConvertCliArgs | null {
  if (args[0] !== '--convert' || !args[1] || !args[2]) return null;

  const qris = args[1];
  const amount = Number(args[2]);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${args[2]}`);
  }

  let fee: ConvertCliArgs['fee'];
  const feeIndex = args.indexOf('--fee');
  const typeIndex = args.indexOf('--type');

  if (feeIndex !== -1 && args[feeIndex + 1]) {
    const feeValue = Number(args[feeIndex + 1]);
    if (Number.isNaN(feeValue) || feeValue < 0)
      throw new Error(`Invalid fee: ${args[feeIndex + 1]}`);
    const typeRaw = typeIndex !== -1 ? args[typeIndex + 1] : 'fixed';
    fee = {
      type: typeRaw === 'percentage' ? 'percentage' : 'fixed',
      value: feeValue,
    };
  }

  const imageIndex = args.indexOf('--image');
  const imagePath = imageIndex !== -1 ? args[imageIndex + 1] : undefined;
  const base64 = args.includes('--base64');

  return { qris, amount, fee, imagePath, base64 };
}
