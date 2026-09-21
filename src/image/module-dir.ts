/**
 * Module-relative directory resolution for bundled assets
 * CJS build has __dirname; ESM build cannot use import.meta here because the
 * same source is also compiled to CJS (TS1470) — ESM falls back to cwd candidates.
 */

import path from 'node:path';

// ponytail: ESM module-relative assets unsupported (import.meta illegal in CJS compile);
// upgrade path: emit a tiny .mts helper per-build or drop the CJS build.
export const MODULE_DIR: string | undefined =
  typeof __dirname !== 'undefined' ? __dirname : undefined;

/**
 * Absolute path to the packaged `assets/` dir (dist/assets or repo-root assets).
 * Works from both src/image (tsx) and dist/cjs|esm/image. Undefined in ESM runtime.
 */
export const MODULE_ASSETS_DIR: string | undefined = MODULE_DIR
  ? path.join(MODULE_DIR, '..', '..', 'assets')
  : undefined;
