import { Hono } from 'hono';
import { convertQris, validateQris } from 'bits-qris/core';
import { renderQrDataUrl } from 'bits-qris/image/qr-renderer';

type Bindings = {
  ASSETS: { fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> };
};

const app = new Hono<{ Bindings: Bindings }>();

// API — server-side convert (juga bisa dipakai oleh client)
app.get('/api/convert', async (c) => {
  const qris = c.req.query('qris');
  const amount = c.req.query('amount');
  const fee = c.req.query('fee');
  const type = c.req.query('type') as 'fixed' | 'percentage' | undefined;

  if (!qris || !amount) {
    return c.json({ error: 'Parameter qris dan amount wajib diisi' }, 400);
  }

  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0 || !Number.isInteger(amountNum))
    return c.json({ error: 'Nominal tidak valid — harus angka bulat lebih dari 0' }, 400);

  const v = validateQris(qris);
  if (!v.valid) return c.json({ valid: false, errors: v.errors }, 400);

  const feeNum = Number(fee);
  const feeObj: { type: 'fixed' | 'percentage'; value: number } | undefined =
    fee && Number.isFinite(feeNum) && feeNum > 0
      ? { type: type === 'percentage' ? 'percentage' : 'fixed', value: feeNum }
      : undefined;

  try {
    const dynamic = convertQris(qris, { amount: amountNum, fee: feeObj });
    const qrDataUrl = await renderQrDataUrl(dynamic);
    return c.json({ dynamic, qrDataUrl, valid: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});

app.get('/api/health', (c) =>
  c.json({ ok: true, worker: 'bits-qris', status: 'healthy', at: new Date().toISOString() }),
);

// Fallback to static assets (Vite client) — untuk Cloudflare Workers Assets
app.get('*', async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.notFound();
});

export default app;
