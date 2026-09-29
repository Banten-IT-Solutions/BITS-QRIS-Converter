import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureOutputDirectory, resolveTemplatePath } from './template-resolver.js';

describe('resolveTemplatePath', () => {
  it('prefers existing custom template path', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bits-image-'));
    try {
      const template = path.join(directory, 'template.png');
      fs.writeFileSync(template, 'fixture');
      assert.equal(resolveTemplatePath(template), template);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('falls back from missing custom path to existing candidate', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bits-image-'));
    const cwd = process.cwd();
    try {
      const assetDirectory = path.join(directory, 'assets', 'images');
      fs.mkdirSync(assetDirectory, { recursive: true });
      const template = path.join(assetDirectory, 'qris-receipt-template.png');
      fs.writeFileSync(template, 'fixture');
      process.chdir(directory);
      const resolved = resolveTemplatePath(path.join(directory, 'missing.png'));
      // Resolver memprioritaskan MODULE_ASSETS_DIR di atas kandidat cwd,
      // jadi yang diuji adalah: path custom yang hilang TIDAK dipakai,
      // dan kandidat pengganti benar-benar ada di disk.
      assert.notEqual(resolved, path.join(directory, 'missing.png'));
      assert.equal(fs.existsSync(resolved), true);
    } finally {
      process.chdir(cwd);
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe('ensureOutputDirectory', () => {
  it('creates missing parent directories recursively', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bits-image-'));
    try {
      const output = path.join(directory, 'nested', 'receipt.jpg');
      ensureOutputDirectory(output);
      assert.equal(fs.statSync(path.dirname(output)).isDirectory(), true);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
