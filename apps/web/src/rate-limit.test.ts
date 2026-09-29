import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, getRateLimitKey } from './rate-limit.js';

describe('createRateLimiter', () => {
  it('allows 30 requests and rejects request 31', () => {
    const limiter = createRateLimiter();
    for (let i = 0; i < 30; i += 1) {
      const result = limiter.check('client', 1_000);
      assert.equal(result.allowed, true);
      assert.equal(result.remaining, 29 - i);
    }
    const rejected = limiter.check('client', 1_000);
    assert.equal(rejected.allowed, false);
    assert.ok(rejected.retryAfterSec > 0);
  });

  it('resets only once window has elapsed', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 1 });
    assert.equal(limiter.check('client', 5_000).allowed, true);
    assert.equal(limiter.check('client', 5_000).allowed, false);
    assert.equal(limiter.check('client', 64_999).allowed, false);
    assert.equal(limiter.check('client', 65_000).allowed, true);
  });

  it('prioritizes CF-Connecting-IP over spoofable X-Forwarded-For', () => {
    const trustedIp = getRateLimitKey(
      new Headers({ 'cf-connecting-ip': ' 192.0.2.1 ', 'x-forwarded-for': '198.51.100.2' }),
    );
    assert.equal(trustedIp, '192.0.2.1');
    assert.equal(
      trustedIp,
      getRateLimitKey(
        new Headers({ 'cf-connecting-ip': '192.0.2.1', 'x-forwarded-for': '203.0.113.9' }),
      ),
    );
  });

  it('uses first X-Forwarded-For value only when CF-Connecting-IP is absent', () => {
    assert.equal(
      getRateLimitKey(new Headers({ 'x-forwarded-for': '198.51.100.1, 198.51.100.2' })),
      '198.51.100.1',
    );
    assert.equal(getRateLimitKey(new Headers()), 'unknown');
  });

  it('keeps map within capacity and evicts oldest key', () => {
    const limiter = createRateLimiter({ maxEntries: 2, maxRequests: 1 });
    limiter.check('first', 0);
    limiter.check('second', 0);
    limiter.check('third', 0);
    assert.equal(limiter.size, 2);
    assert.equal(limiter.check('first', 0).allowed, true);
  });
});
