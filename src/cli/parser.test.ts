import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseBatchArgs, parseBatchLines, parseConvertArgs } from './parser.js';

describe('parseBatchLines', () => {
  it('should skip blank lines and # comments', () => {
    const content = '# comment\nQRIS_ONE\n\n  \nQRIS_TWO\n#QRIS_THREE\n';
    assert.deepEqual(parseBatchLines(content), ['QRIS_ONE', 'QRIS_TWO']);
  });

  it('should trim whitespace around lines', () => {
    assert.deepEqual(parseBatchLines('  QRIS_ONE  \n'), ['QRIS_ONE']);
  });
});

describe('parseBatchArgs', () => {
  it('should parse batch args', () => {
    const parsed = parseBatchArgs(['--batch', 'list.txt', '--amount', '10000']);
    assert.deepEqual(parsed, { file: 'list.txt', amount: 10000, fee: undefined, image: false });
  });

  it('should require --amount', () => {
    assert.throws(() => parseBatchArgs(['--batch', 'list.txt']), /Missing required --amount/);
  });

  it('should reject missing --batch value', () => {
    assert.throws(() => parseBatchArgs(['--batch']), /Missing value for --batch/);
  });
});

describe('parseConvertArgs', () => {
  it('should reject flag-like value for --image', () => {
    assert.throws(
      () => parseConvertArgs(['--convert', 'QRIS', '1000', '--image', '--base64']),
      /Missing value for --image/,
    );
  });

  it('should reject --fee without value', () => {
    assert.throws(
      () => parseConvertArgs(['--convert', 'QRIS', '1000', '--fee']),
      /Missing value for --fee/,
    );
  });
});
