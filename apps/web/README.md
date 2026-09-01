# 🌐 BITS Web — Hono + Vite + Cloudflare Workers

> Demo production untuk `bits-qris` — edge-native, Node 24 LTS.

## Stack Latest (2026-08-31)

- **Hono 4.13.5** — 14KB, edge-native
- **Vite 8.2.2** — bundler + HMR
- **@cloudflare/vite-plugin 1.54.2** — Vite ↔ Workers interop
- **Wrangler 4.127.1** — deploy Workers
- **TypeScript 6.0.3**, **Node 24** types (LTS)

## Desain — Classic × Terminal × Paper

- **Palet:** kertas `#FFFBF5`, tinta `#0A0A0A`, garis `#C8C0B0` abu warm, aksen navy `#0B1D3A`
- **Tipografi:** `Instrument Serif` (judul) + `JetBrains Mono` (kode) + system sans
- **Layout:** grid 12, border 1px, whitespace, dark/light toggle via `data-theme`
- **Fitur:** install tabs (`npm/pnpm/bun/yarn/npx`), hero terminal, 3-step cards, toast, adaptive QR

## 🚀 Dev — Cara Jalan

```bash
# 1. Install (Node 24 LTS)
npm ci                         # dari root — install workspaces (root + apps/web)

# 2. Build core dulu (wajib 1x)
npm run build                  # → dist/cjs + dist/esm (biar bits-qris kebaca)

# 3. Jalankan web (Vite + Workers)
npm run dev --workspace=@bits/web   # → http://localhost:5173
# atau
cd apps/web && npm run dev

# 4. Preview production
npm run build --workspace=@bits/web
npx vite preview --host --port 4173  # → http://127.0.0.1:4173

# 5. Deploy ke Cloudflare
npm run deploy --workspace=@bits/web # → wrangler deploy (qris.bits.co.id)
# atau
cd apps/web && npx wrangler deploy
```

## 🔌 API

| Endpoint                                                     | Deskripsi                                      |
| ------------------------------------------------------------ | ---------------------------------------------- |
| `GET /api/convert?qris=...&amount=50000&fee=1000&type=fixed` | Convert → `{dynamic, qrDataUrl, valid}`        |
| `GET /api/health`                                            | Health check → `{ok:true, worker:"bits-qris"}` |

> Core `convertQris` jalan di Workers (pure JS). `makeFile` (Jimp) **tidak** dipakai di edge — pakai `makeQrDataUrl` (5KB).

## ☁️ Deploy Cloudflare

| Langkah       | Perintah                                                        |
| ------------- | --------------------------------------------------------------- |
| **1. Login**  | `wrangler login`                                                |
| **2. Deploy** | `npm run deploy --workspace=@bits/web` → `qris.bits.co.id`      |
| **3. Config** | `compatibility_date = "2026-08-31"` di `wrangler.jsonc` (sudah) |

---

<div align="center">

**BITS Web** · Node 24 LTS · `qris.bits.co.id`

</div>
