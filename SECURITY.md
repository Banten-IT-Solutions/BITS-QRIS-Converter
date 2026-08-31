# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| `1.x`   | ✅        |
| `<1.0`  | ❌        |

## Reporting a Vulnerability

Jangan buka Issue publik untuk vulnerability.

1. Email ke **security@bits.co.id** (atau DM maintainer)
2. Sertakan deskripsi, PoC, dan dampak
3. Kami akan respon dalam **48 jam** dan fix dalam 7 hari jika valid

## Security Best Practices

- Library ini **tidak pernah** `eval` atau `exec` — hanya parser TLV murni
- Validasi CRC wajib sebelum convert — gunakan `validateQris()` dulu
- Jangan log QRIS string di production (sensitif — berisi NMID)
- `jimp` di-update via Dependabot weekly — cek `npm audit`

## Audit

```bash
npm audit
npm audit fix
```

Terima kasih sudah menjaga ekosistem QRIS tetap aman!
