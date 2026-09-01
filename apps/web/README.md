# BITS Web — Hono + Vite + Cloudflare Workers

Demo production untuk `bits-qris` — **modern, edge-native, bukan AI Slop**.

## Stack Latest (2026-08-31)

- **Hono 4.13.5** — 14KB, edge-native
- **Vite 8.2.2** — bundler + HMR
- **@cloudflare/vite-plugin 1.54.2** — Vite ↔ Workers interop
- **Wrangler 4.127.1** — deploy Workers
- **TypeScript 6.0.3**, **Node 24** types (LTS)

## Desain — Classic × Terminal × Paper

- **Tema:** `classic` editorial + `terminal` mono + `paper` texture — Opsi B: light paper `#FFFFFF` / dark ink `#06080C` adaptif
- **Palet:** kertas `#FFFBF5`, tinta `#0A0A0A`, garis `#C8C0B0` abu warm (tidak hitam pekat), aksen navy `#0B1D3A`
- **Tipografi:** `Instrument Serif` (judul) + `JetBrains Mono` (terminal/QRIS) + system sans — bukan Inter generik
- **Layout:** grid 12, border 1px, whitespace, paper cards + terminal windows, dark/light toggle via `data-theme`
- **Prinsip:** editorial Swiss, high-contrast, handcrafted — terasa dibuat manusia, bukan `prompt: modern dashboard`
- **Fitur:** install tabs (`npm/pnpm/bun/yarn/npx`), hero terminal typing, 3-step equal-height cards, toast paper, adaptive QR bg

## Dev

```bash
# dari root
npm install                 # install workspaces (root + apps/web)
npm run dev --workspace=@bits/web   # vite + wrangler dev (http://localhost:5173)
# atau
cd apps/web && npm run dev

# build
npm run build --workspace=@bits/web  # → dist/client + dist/bits_qris_web

# deploy ke Cloudflare
npm run deploy --workspace=@bits/web # → wrangler deploy
# atau
cd apps/web && npx wrangler deploy
```

## API

- `GET /api/convert?qris=...&amount=50000&fee=1000&type=fixed` → `{dynamic, qrDataUrl}`
- `GET /api/health` → `{ok:true}`

Core `convertQris` jalan di Workers (pure JS). `makeFile` (Jimp) **tidak** dipakai di edge — pakai `makeQrDataUrl` (5KB).

## Deploy Cloudflare

1. `wrangler login`
2. `npm run deploy --workspace=@bits/web`
3. Set `compatibility_date = "2026-08-31"` di `wrangler.jsonc` (sudah)
