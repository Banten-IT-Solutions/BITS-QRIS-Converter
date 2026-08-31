#!/usr/bin/env node
/**
 * CLI entry point — thin wrapper, delegates to ./cli/* modules
 * Keeps bin `bits-qris` working while core logic lives in src/cli/
 */

import { handleParse, handleValidate, handleConvert } from './cli/commands.js';
import { HELP_TEXT } from './cli/constants.js';
import { runInteractive } from './cli/interactive.js';
import { parseConvertArgs } from './cli/parser.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(HELP_TEXT);
    return;
  }

  if (args[0] === '--validate' && args[1]) {
    await handleValidate(args[1]);
    return;
  }

  if (args[0] === '--parse' && args[1]) {
    await handleParse(args[1]);
    return;
  }

  if (args[0] === '--convert') {
    const parsed = parseConvertArgs(args);
    if (!parsed) {
      console.error(
        '[✗] Usage: bits-qris --convert <QRIS> <AMOUNT> [--fee <VALUE> --type <fixed|percentage>] [--image <path>] [--base64]',
      );
      process.exit(1);
    }
    await handleConvert(parsed);
    return;
  }

  // Default: interactive mode
  await runInteractive();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
