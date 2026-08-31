import { Hono } from 'hono';
import { convertQris, validateQris, makeQrDataUrl } from 'bits-qris-converter';

type Bindings = {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// API — server-side convert (juga bisa dipakai oleh client)
app.get('/api/convert', async (c) => {
  const qris = c.req.query('qris');
  const amount = c.req.query('amount');
  const fee = c.req.query('fee');
  const type = c.req.query('type') as 'fixed' | 'percentage' | undefined;

  if (!qris || !amount) {
    return c.json({ error: 'qris & amount required' }, 400);
  }

  const amountNum = Number(amount);
  if (Number.isNaN(amountNum) || amountNum <= 0) return c.json({ error: 'invalid amount' }, 400);

  const v = validateQris(qris);
  if (!v.valid) return c.json({ valid: false, errors: v.errors }, 400);

  const feeObj = fee && Number(fee) > 0 ? { type: type === 'percentage' ? 'percentage' : 'fixed' as const, value: Number(fee) } : undefined;

  try {
    const dynamic = convertQris(qris, { amount: amountNum, fee: feeObj });
    const qrDataUrl = await makeQrDataUrl(qris, { amount: amountNum, fee: feeObj });
    return c.json({ dynamic, qrDataUrl, valid: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});

app.get('/api/health', (c) => c.json({ ok: true, worker: 'bits-qris-converter', at: new Date().toISOString() }));

// Fallback to static assets (Vite client) — untuk Cloudflare Workers Assets
app.get('*', async (c) => {
  // @ts-ignore — ASSETS binding dari wrangler
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.notFound();
});

export default app;
