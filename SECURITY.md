# 🛡️ Security Policy

## 📦 Supported Versions

| Version | Status    | Catatan              |
| ------- | --------- | -------------------- |
| `1.x`   | ✅ Active | Patch & security fix |
| `<1.0`  | ❌ EOL    | Upgrade ke `1.x`     |

## 🚨 Reporting

> **Jangan buka Issue publik** untuk vulnerability — pakai channel private.

| Langkah       | Aksi                                                           |
| ------------- | -------------------------------------------------------------- |
| **1. Kontak** | Email ke **security@bits.co.id** (atau DM maintainer)          |
| **2. Detail** | Sertakan deskripsi, PoC, dan dampak                            |
| **3. Respon** | Kami respon dalam **48 jam** & fix dalam **7 hari** jika valid |

## 🔒 Best Practices

| Praktik           | Detail                                                            |
| ----------------- | ----------------------------------------------------------------- |
| **No eval**       | Library **tidak pernah** `eval` / `exec` — hanya parser TLV murni |
| **Validasi dulu** | CRC wajib sebelum convert — pakai `validateQris()`                |
| **Jangan log**    | Jangan log QRIS string di production (sensitif — berisi NMID)     |
| **Update rutin**  | `jimp` di-update via Dependabot weekly — cek `npm audit`          |

## 🔍 Audit

```bash
npm audit              # cek
npm audit fix          # fix auto
```

---

<div align="center">

Terima kasih sudah menjaga ekosistem QRIS tetap aman! 🇮🇩

</div>
