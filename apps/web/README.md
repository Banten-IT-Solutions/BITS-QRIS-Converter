# 🌐 BITS Web — Hono + Vite + Cloudflare Workers

> Demo production untuk `bits-qris` — edge-native, Node 24 LTS.

## Stack Latest (2026-08-31)

- **Hono 4.13.5** — 14KB, edge-native
- **Vite 8.2.2** — bundler + HMR
- **@cloudflare/vite-plugin 1.54.2** — Vite ↔ Workers interop
- **Wrangler 4.127.1** — deploy Workers
- **TypeScript 6.0.3**, **Node 24** types (LTS)

## 🎨 Desain

- Palet `#FFFBF5` / `#0A0A0A` / `#C8C0B0`, tipografi `Instrument Serif` + `JetBrains Mono`
- Dark/light via `data-theme`, install tabs, hero terminal, toast paper

## 🚀 Dev

```bash
npm ci                         # install workspaces
npm run build                  # build core 1x (dist/cjs + esm)
npm run dev --workspace=@bits/web   # → http://localhost:5173
npm run build --workspace=@bits/web && npx vite preview --host  # preview
npm run deploy --workspace=@bits/web # → qris.bits.co.id
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
