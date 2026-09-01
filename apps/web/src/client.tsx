import './style.css';
import { convertQris, parseQris, validateQris } from 'bits-qris/core';
import { makeQrDataUrl } from 'bits-qris/image/qr-renderer';
import { registerSW } from 'virtual:pwa-register';

// version dinamis — single source of truth dari root package.json via Vite define
declare const __APP_VERSION__: string;
const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.1';

// PWA — autoUpdate + offline
registerSW({ immediate: true });

let deferredPrompt: Event | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('pwaBanner')?.classList.add('show');
});
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  document.getElementById('pwaBanner')?.classList.remove('show');
});

// --- helpers: decode QR image via jsQR (loaded via CDN) ---
declare global {
  interface Window {
    jsQR: (data: Uint8ClampedArray, w: number, h: number, opts?: unknown) => { data: string } | null;
  }
}

function loadJsQR(): Promise<void> {
  if (window.jsQR) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('jsQR load failed'));
    document.head.appendChild(s);
  });
}

async function decodeImage(file: File): Promise<string> {
  await loadJsQR();
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('image load failed'));
  });
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const code = window.jsQR(data.data, data.width, data.height, { inversionAttempts: 'dontInvert' });
  URL.revokeObjectURL(url);
  if (!code) throw new Error('QR tidak terbaca — pastikan foto QRIS cukup jelas dan tidak buram');
  return code.data;
}

// --- theme ---
function getInitialTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('bits-theme') as 'light' | 'dark' | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(t: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme = t;
  localStorage.setItem('bits-theme', t);
  const meta = document.getElementById('themeColor') as HTMLMetaElement | null;
  if (meta) meta.content = t === 'dark' ? '#0A0C10' : '#FFFBF5';
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', t === 'dark' ? 'Light mode' : 'Dark mode');
    btn.innerHTML =
      t === 'dark'
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
}

// --- app ---
const $ = <T extends Element>(s: string) => document.querySelector(s) as T;

function render() {
  const initialTheme = (() => {
    try {
      return getInitialTheme();
    } catch {
      return 'light' as const;
    }
  })();

  document.querySelector('#app')!.innerHTML = `
  <div class="pwa-banner" id="pwaBanner">
    <span>Pasang BITS QRIS — akses offline kapan saja</span>
    <div style="display:flex;gap:8px">
      <button id="pwaInstall">Pasang</button>
      <button id="pwaDismiss" style="background:transparent;color:inherit;border:1px solid currentColor">Nanti</button>
    </div>
  </div>

  <div class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" width="22" height="22" style="display:block"><rect width="32" height="32" rx="4" fill="currentColor"/><rect x="4" y="4" width="8" height="8" rx="1" fill="#FFFBF5"/><rect x="6" y="6" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="20" y="4" width="8" height="8" rx="1" fill="#FFFBF5"/><rect x="22" y="6" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="4" y="20" width="8" height="8" rx="1" fill="#FFFBF5"/><rect x="6" y="22" width="4" height="4" rx="0.5" fill="currentColor"/><rect x="14" y="4" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="17" y="4" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="14" y="7" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="17" y="7" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="14" y="10" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="17" y="10" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="14" y="13" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="17" y="13" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="20" y="13" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="23" y="13" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="26" y="13" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="14" y="16" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="17" y="16" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="20" y="16" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="23" y="16" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="26" y="16" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="14" y="19" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="17" y="19" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="20" y="19" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="23" y="19" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="14" y="22" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="17" y="22" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="20" y="22" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="23" y="22" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="14" y="25" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="17" y="25" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="20" y="25" width="2" height="2" rx="0.3" fill="#FFFBF5"/><rect x="23" y="25" width="2" height="2" rx="0.3" fill="#FFFBF5"/></svg></div>
        <div>
          <div style="font-family:var(--serif);font-size:13px;letter-spacing:-0.02em">BITS QRIS Converter</div>
          <div class="brand-meta">Ubah QRIS <span style="color:var(--accent-2)">Static</span> → <span style="color:var(--accent)">Dynamic</span> — gratis, instan, akurat</div>
        </div>
      </div>
      <nav class="nav" aria-label="Primary">
        <a href="#converter" class="nav-link nav-link--ghost">Converter</a>
        <a href="#playground" class="nav-link nav-link--ghost">API</a>
        <a href="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter" target="_blank" rel="noopener" class="nav-link nav-link--ghost">GitHub</a>
        <a href="https://www.npmjs.com/package/bits-qris" target="_blank" rel="noopener" class="nav-link nav-link--ghost">NPM v${APP_VERSION}</a>
        <button id="themeToggle" class="theme-toggle" aria-label="Toggle theme" title="Toggle theme"></button>
      </nav>
    </div>
  </div>

  <section class="hero">
    <div class="hero-copy">
      <h1>Ubah QRIS Static<br/><i>jadi</i> Dynamic<br/>gratis, instan.</h1>
      <p>Butuh QRIS Dynamic untuk transaksi? Cukup tempel string QRIS Static atau upload foto — tentukan nominal, biaya, klik konversi. Hasil akurat siap pakai dalam hitungan detik. Gratis, tanpa install, tanpa ribet.</p>
      <div class="hero-meta">
        <span class="chip dot">Gratis</span>
        <span class="chip">Akurat</span>
        <span class="chip">Offline</span>
        <span class="chip">Open Source</span>
      </div>
      <div class="hero-cta">
        <a href="#converter" class="btn" style="text-decoration:none">Konversi QRIS →</a>
        <a href="#playground" class="btn secondary" style="text-decoration:none">Dokumentasi API</a>
      </div>
    </div>

    <div class="terminal terminal--hero" role="region" aria-label="Terminal demo">
      <div class="terminal-bar">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="traffic" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="terminal-title"><b>bits-qris</b> — zsh — 80×24</span>
        </div>
        <div class="terminal-actions">
          <button id="termCopy" aria-label="Copy terminal content">Copy</button>
          <button id="termReplay" aria-label="Replay typing">Replay</button>
        </div>
      </div>
      <div class="terminal-body" id="termBody" aria-live="polite">
        <div class="terminal-line"><span class="terminal-prompt">$</span><span class="terminal-cmd" id="termCmd"></span><span class="terminal-cursor" id="termCursor"></span></div>
        <div id="termOut" style="display:none">
          <div class="terminal-output">
            <div><span class="terminal-success">✓</span> parsing TLV — tag 00…63</div>
            <div><span class="terminal-success">✓</span> CRC valid — merchant: <b style="color:var(--terminal-fg)">BANTEN IT SOLUTIONS</b> • SERANG</div>
            <div><span class="terminal-success">✓</span> injected amount → <span style="color:var(--terminal-amber)">Rp 25.000</span> <span class="terminal-dim">(tag 54)</span></div>
            <div><span class="terminal-success">✓</span> re-CRC: <span class="terminal-dim" id="termCrc">6304 —</span></div>
          </div>
          <div class="terminal-line"><span class="terminal-dim">› dynamic:</span></div>
          <div style="font-size:11px; word-break:break-all; color:var(--terminal-muted); background:var(--terminal-bg-soft); border:1px solid var(--terminal-border); padding:8px; margin-top:4px" id="termDynamic">00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG6304----</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px;padding-top:8px;border-top:1px dashed var(--terminal-border);font-size:11.5px">
            <span style="color:var(--terminal-green)">● VALID — CRC cocok</span>
            <span style="color:var(--terminal-muted)">•</span>
            <span style="color:var(--terminal-fg)">QR PNG • String EMVCo</span>
          </div>
        </div>
      </div>
      <div style="padding:10px 12px; border-top:1px solid var(--terminal-border); display:flex; gap:8px; flex-wrap:wrap; background:var(--terminal-bg-soft)">
        <span class="chip" style="background:var(--terminal-bg-soft);color:var(--terminal-muted);border-color:var(--terminal-border);font-size:10px">EMVCo TLV</span>
        <span class="chip" style="background:var(--terminal-bg-soft);color:var(--terminal-muted);border-color:var(--terminal-border);font-size:10px">CRC-16 Validated</span>
        <span class="chip" style="background:var(--terminal-bg-soft);color:var(--terminal-muted);border-color:var(--terminal-border);font-size:10px">Offline Decode</span>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="section" aria-labelledby="howTitle">
    <div class="section-head">
      <div>
        <div class="eyebrow" style="display:flex;align-items:center;gap:8px;white-space:nowrap;font-family:var(--mono)"><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span><span aria-hidden="true" style="color:var(--terminal-green)">┌─</span><span style="border:1px solid var(--terminal-border);background:var(--terminal-bg);color:var(--terminal-fg);padding:2px 8px;display:inline-flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:var(--terminal-green);box-shadow:0 0 6px color-mix(in srgb, var(--terminal-green) 60%, transparent)"></span>CARA KERJA</span><span aria-hidden="true" style="color:var(--terminal-green)">─┐</span><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span></div>
        <h2 id="howTitle">Dari QRIS Static ke Dynamic dalam 3 Langkah</h2>
      </div>
      <span class="ascii-label">Gratis • Cepat • Akurat</span>
    </div>
    <div class="how-grid">
      <article class="step-card">
        <div class="step-head"><span class="step-num">01 — INPUT</span><span class="step-icon" aria-hidden="true">⎘</span></div>
        <h3>Input QRIS Static</h3>
        <p>Tempel kode QRIS atau unggah fotonya. Sistem akan membaca otomatis — cukup drag &amp; drop.</p>
        <div class="terminal" style="font-size:11px"><div class="terminal-bar" style="padding:6px 8px"><span class="terminal-title" style="font-size:10px">input.txt</span></div><div class="terminal-body" style="padding:8px; font-size:11px"><span class="terminal-dim">0002010102112656...6304DA44</span></div></div>
      </article>
      <article class="step-card">
        <div class="step-head"><span class="step-num">02 — NOMINAL</span><span class="step-icon" aria-hidden="true">◎</span></div>
        <h3>Atur Nominal</h3>
        <p>Masukkan jumlah yang harus dibayar. Tambah biaya admin jika perlu — nominal tetap atau persentase.</p>
        <div class="terminal" style="font-size:11px"><div class="terminal-bar" style="padding:6px 8px"><span class="terminal-title" style="font-size:10px">amount • fee</span></div><div class="terminal-body" style="padding:8px; font-size:11px"><span style="color:var(--terminal-fg)">50.000</span> <span style="color:var(--terminal-muted)">•</span> <span style="color:var(--terminal-muted)">Biaya 2%</span> <span style="color:var(--terminal-muted)">•</span> <span style="color:var(--terminal-muted)">Admin 1.000</span></div></div>
      </article>
      <article class="step-card">
        <div class="step-head"><span class="step-num">03 — KONVERSI</span><span class="step-icon" aria-hidden="true">✓</span></div>
        <h3>Konversi Instan</h3>
        <p>Klik Konversi — sistem memproses otomatis. Hasil QR Dynamic + kode siap pakai, langsung download.</p>
        <div class="terminal" style="font-size:11px"><div class="terminal-bar" style="padding:6px 8px"><span class="terminal-title" style="font-size:10px">output • PNG</span></div><div class="terminal-body" style="padding:8px; font-size:11px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:space-between"><span><span style="color:var(--terminal-green)">✓</span> Valid — Siap Pakai</span><span><span style="color:var(--terminal-green)">✓</span> <span class="terminal-dim">QR Siap Cetak • PNG</span></span></div></div>
      </article>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="section" aria-labelledby="featTitle">
    <div class="section-head" style="align-items:end">
      <span class="ascii-label" style="align-self:center">Akurat • Cepat • Aman</span>
      <div style="display:grid;gap:8px;justify-items:end;text-align:right;min-width:0">
        <div class="eyebrow" style="display:flex;align-items:center;gap:8px;white-space:nowrap;font-family:var(--mono);width:100%;justify-content:end"><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span><span aria-hidden="true" style="color:var(--terminal-green)">┌─</span><span style="border:1px solid var(--terminal-border);background:var(--terminal-bg);color:var(--terminal-fg);padding:2px 8px;display:inline-flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:var(--terminal-green);box-shadow:0 0 6px color-mix(in srgb, var(--terminal-green) 60%, transparent)"></span>KEUNGGULAN</span><span aria-hidden="true" style="color:var(--terminal-green)">─┐</span><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span></div>
        <h2 id="featTitle" style="margin:0">Kenapa Memilih BITS QRIS?</h2>
      </div>
    </div>
    <div class="features-grid">
      <article class="feature">
        <div class="feature-icon" aria-hidden="true">◉</div>
        <h3>Akurat & Terverifikasi</h3>
        <p>Setiap QRIS dicek byte-per-byte. Validasi CRC otomatis, hasil 100% sesuai standar EMVCo.</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:8px;border-top:1px dashed var(--line);font-family:var(--mono);font-size:10px;color:var(--muted)"><span>EMVCo</span><span>•</span><span>CRC-16</span><span>•</span><span>Akurat</span></div>
      </article>
      <article class="feature">
        <div class="feature-icon" aria-hidden="true">⬔</div>
        <h3>All-in-One</h3>
        <p>Satu paket untuk semua: konversi di browser, cetak struk di server, jalan di CLI.</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:8px;border-top:1px dashed var(--line);font-family:var(--mono);font-size:10px;color:var(--muted)"><span>Core</span><span>•</span><span>Image</span><span>•</span><span>CLI</span></div>
      </article>
      <article class="feature">
        <div class="feature-icon" aria-hidden="true">▣</div>
        <h3>Siap untuk Developer</h3>
        <p>API sederhana, curl satu baris, copy-paste langsung jadi. Docs jelas, tanpa ribet.</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:8px;border-top:1px dashed var(--line);font-family:var(--mono);font-size:10px;color:var(--muted)"><span>GET /api/convert</span><span>•</span><span>curl</span><span>•</span><span>Copy 1 klik</span></div>
      </article>
      <article class="feature">
        <div class="feature-icon" aria-hidden="true">✦</div>
        <h3>Gratis & Offline</h3>
        <p>Bisa dipakai tanpa internet. Gratis selamanya, tanpa iklan, tanpa tracking.</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:8px;border-top:1px dashed var(--line);font-family:var(--mono);font-size:10px;color:var(--muted)"><span>PWA</span><span>•</span><span>Offline</span><span>•</span><span>Gratis</span></div>
      </article>
    </div>
  </section>

  <!-- CONVERTER APP -->
  <section class="section" id="converter" style="padding-bottom:0;border-bottom:none">
    <div class="section-head" style="flex-direction:column;align-items:center;text-align:center;gap:10px">
      <div class="eyebrow" style="display:flex;align-items:center;gap:8px;white-space:nowrap;font-family:var(--mono);width:100%;max-width:520px;justify-content:center"><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span><span aria-hidden="true" style="color:var(--terminal-green)">┌─</span><span style="border:1px solid var(--terminal-border);background:var(--terminal-bg);color:var(--terminal-fg);padding:2px 8px;display:inline-flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:var(--terminal-green);box-shadow:0 0 6px color-mix(in srgb, var(--terminal-green) 60%, transparent)"></span>CONVERTER</span><span aria-hidden="true" style="color:var(--terminal-green)">─┐</span><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span></div>
      <h2 style="margin:0">Konversi QRIS Sekarang — Gratis & Instan</h2>
      <span class="ascii-label">Input → Output</span>
    </div>
  </section>
  <main class="main" style="padding-top:0">
    <section class="card" aria-labelledby="inputTitle">
      <div class="card-head"><h2 id="inputTitle">Input QRIS</h2><span>STATIS → DINAMIS</span></div>

      <div class="paper" style="padding:12px;margin-bottom:12px">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Contoh Kode Valid</div>
        <div class="mono" style="font-size:11px; word-break:break-all; line-height:1.5" id="sampleQris">00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG6304DA44</div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn secondary" id="copySample" style="flex:1">Salin</button>
          <button class="btn" id="useSample" style="flex:1">Gunakan Contoh</button>
        </div>
      </div>

      <div class="field">
        <textarea id="qris" rows="3" placeholder="Tempel kode QRIS (contoh: 0002010102...)" aria-label="Kode QRIS Static" style="min-height:72px"></textarea>
      </div>

      <label class="uploader" for="file">
        <strong style="font-size:12px;letter-spacing:0.04em;text-transform:uppercase">Seret Foto ke Sini</strong>
        <small>PNG • JPG</small>
        <input id="file" type="file" accept="image/*" hidden />
      </label>
      <div id="uploadStatus" class="hint" style="margin:8px 0 12px"></div>

      <div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap">
        <div class="field" style="flex:1;min-width:120px;margin-bottom:0"><label for="amount">Nominal Pembayaran</label><input id="amount" type="number" placeholder="50000" value="50000" min="1" style="min-height:40px;padding:8px 10px" /></div>
        <div class="field" style="flex:1;min-width:120px;margin-bottom:0"><label for="feeType">Biaya Admin (opsional)</label>
          <select id="feeType" style="min-height:40px;padding:8px 10px"><option value="">Tanpa biaya</option><option value="fixed">Fixed Rp</option><option value="percentage">Persen %</option></select>
        </div>
        <div class="field" id="feeField" style="display:none;flex:1;min-width:120px;margin-bottom:0"><label for="feeValue">Nilai Biaya</label><input id="feeValue" type="number" placeholder="1000" style="min-height:40px;padding:8px 10px" /></div>
      </div>

      <div class="actions" style="gap:8px;margin-top:12px">
        <button class="btn" id="convert" style="min-height:40px;padding:8px 12px;flex:1;white-space:nowrap">Konversi</button>
        <button class="btn secondary" id="clear" style="min-height:40px;padding:8px 12px;flex:1;white-space:nowrap">Reset</button>
      </div>
      <div id="error" style="margin-top:12px"></div>
    </section>

    <section class="card" aria-labelledby="resultTitle">
      <div class="card-head"><h2 id="resultTitle">Hasil Konversi</h2><span>QR • String • Informasi</span></div>
      <div class="qr-wrap" id="qrWrap"><div class="qr-empty"><strong style="color:var(--fg);font-family:var(--serif);font-size:14px;font-weight:400">QR Belum Tersedia</strong><br><span style="color:var(--muted)">Hasil konversi akan muncul di sini</span></div></div>
      <div style="text-align:center;margin:10px 0 8px">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);margin-bottom:2px">Merchant</div>
        <div id="merchant" style="font-family:var(--serif);font-size:15px;line-height:1.2">—</div>
        <div id="city" style="color:var(--muted);font-size:12px;margin-top:2px">—</div>
        <div id="statusBadge" style="display:none;margin-top:8px;align-items:center;justify-content:center;gap:4px;background:var(--terminal-green);color:#fff;font-family:var(--mono);font-size:10px;letter-spacing:0.06em;text-transform:uppercase;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,0.12);width:fit-content;margin-left:auto;margin-right:auto">✓ Valid</div>
      </div>
      <div class="meta" style="gap:6px">
        <div style="display:none"><div class="code" id="outString">—</div></div>
        <div class="actions" style="gap:8px;margin-top:6px">
          <button class="btn secondary" id="downloadPng" disabled style="min-height:40px;padding:8px 10px;flex:1;white-space:nowrap">Unduh QR (PNG)</button>
          <button class="btn secondary" id="copyString" style="min-height:40px;padding:8px 10px;flex:1;white-space:nowrap">Salin Kode</button>
          <a class="btn secondary" id="openApi" target="_blank" rel="noopener" style="min-height:40px;padding:8px 10px;flex:1;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;white-space:nowrap">Coba via API →</a>
        </div>
      </div>
    </section>
  </main>

  <!-- PLAYGROUND -->
  <section class="section" id="playground" aria-labelledby="playTitle">
    <div class="section-head" style="flex-direction:column;align-items:center;text-align:center;gap:10px">
      <div class="eyebrow" style="display:flex;align-items:center;gap:8px;white-space:nowrap;font-family:var(--mono);width:100%;max-width:520px;justify-content:center"><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span><span aria-hidden="true" style="color:var(--terminal-green)">┌─</span><span style="border:1px solid var(--terminal-border);background:var(--terminal-bg);color:var(--terminal-fg);padding:2px 8px;display:inline-flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:var(--terminal-green);box-shadow:0 0 6px color-mix(in srgb, var(--terminal-green) 60%, transparent)"></span>API & CLI</span><span aria-hidden="true" style="color:var(--terminal-green)">─┐</span><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span></div>
      <h2 id="playTitle" style="margin:0">Integrasi untuk Developer</h2>
      <span class="ascii-label">GET /api/convert • npm • npx</span>
    </div>
    <div class="playground-grid" style="align-items:stretch">
      <div class="terminal" role="region" aria-label="API playground terminal" style="display:flex;flex-direction:column;height:100%">
        <div class="terminal-bar">
          <span class="terminal-title"><b>curl</b> — https://qris.bits.co.id</span>
          <div class="terminal-actions"><button id="copyCurl">Copy</button></div>
        </div>
        <div class="terminal-body" style="padding:0;flex:1;display:flex;flex-direction:column">
          <div class="code-block" style="flex:1;border:none;margin:0;border-radius:0;padding:14px">
            <div style="color:var(--terminal-muted);font-size:11px"># GET — server-side convert (Hono + Cloudflare Workers)</div>
            <div style="color:var(--terminal-fg);margin-top:4px;word-break:break-all">curl -s "https://qris.bits.co.id/api/convert?amount=50000&amp;qris=000201010211..." | jq</div>
            <div style="margin-top:12px;color:var(--terminal-muted);font-size:11px"># → response</div>
            <div style="color:var(--terminal-green);margin-top:4px">{</div>
            <div style="color:var(--terminal-green)">&nbsp;&nbsp;"valid": true,</div>
            <div style="color:var(--terminal-fg);opacity:0.9">&nbsp;&nbsp;"dynamic": "000201010212...6304ABCD",</div>
            <div style="color:var(--terminal-fg);opacity:0.9">&nbsp;&nbsp;"qrDataUrl": "data:image/png;base64,iVBORw..."</div>
            <div style="color:var(--terminal-green)">}</div>
          </div>
        </div>
        <div style="padding:10px 12px;background:var(--terminal-bg-soft);border-top:1px solid var(--terminal-border);display:flex;gap:8px;flex-wrap:wrap">
          <a href="/api/health" target="_blank" rel="noopener" class="chip" style="background:var(--terminal-bg-soft);color:var(--terminal-muted);border-color:var(--terminal-border);text-decoration:none;font-size:10px">Status API • 200 OK</a>
          <span class="chip" style="background:var(--terminal-bg-soft);color:var(--terminal-muted);border-color:var(--terminal-border);font-size:10px">Edge • Global</span>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;height:100%">
        <div class="terminal" style="flex:1;display:flex;flex-direction:column">
          <div class="terminal-bar">
            <span class="terminal-title"><b>npm</b> — bits-qris</span>
            <div class="terminal-actions"><button data-copy="npm">Copy</button></div>
          </div>
          <div class="terminal-body" style="padding:0;flex:1;display:flex;flex-direction:column">
            <div style="padding:10px 12px 0;color:var(--terminal-muted);font-size:11px;line-height:1.5">Gunakan sebagai library. ESM + CJS + types.</div>
            <div class="code-block" style="flex:1;border:none;margin:0;border-radius:0;padding:10px 12px">
              <div id="codeNpm"><span style="color:var(--terminal-muted)"># install</span><br/>npm i bits-qris<br/><br/><span style="color:var(--terminal-muted)">// convert</span><br/><span style="color:#ff7ab2">import</span> { convertQris } <span style="color:#ff7ab2">from</span> <span style="color:var(--terminal-green)">'bits-qris/core'</span><br/>convertQris(qris, { amount: <span style="color:var(--terminal-amber)">50000</span> })</div>
            </div>
          </div>
        </div>
        <div class="terminal" style="flex:1;display:flex;flex-direction:column">
          <div class="terminal-bar">
            <span class="terminal-title"><b>npx</b> — bits-qris</span>
            <div class="terminal-actions"><button data-copy="npx">Copy</button></div>
          </div>
          <div class="terminal-body" style="padding:0;flex:1;display:flex;flex-direction:column">
            <div style="padding:10px 12px 0;color:var(--terminal-muted);font-size:11px;line-height:1.5">Tanpa install. Untuk kasir, otomasi, atau iseng di terminal.</div>
            <div class="code-block" style="flex:1;border:none;margin:0;border-radius:0;padding:10px 12px">
              <div id="codeNpx">npx bits-qris convert "000201..." --amount 50000<br/>npx bits-qris validate "000201..."<br/>npx bits-qris image --amount 25000 --out qris.png</div>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a href="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter" target="_blank" rel="noopener" class="btn secondary" style="flex:1;text-decoration:none;min-height:40px">Docs di GitHub →</a>
          <a href="https://www.npmjs.com/package/bits-qris" target="_blank" rel="noopener" class="btn" style="flex:1;text-decoration:none;min-height:40px">Buka NPM →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- STATS / OPEN SOURCE -->
  <section class="section" aria-labelledby="statsTitle">
    <div class="section-head" style="flex-direction:column;align-items:center;text-align:center;gap:10px">
      <div class="eyebrow" style="display:flex;align-items:center;gap:8px;white-space:nowrap;font-family:var(--mono);width:100%;max-width:520px;justify-content:center"><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span><span aria-hidden="true" style="color:var(--terminal-green)">┌─</span><span style="border:1px solid var(--terminal-border);background:var(--terminal-bg);color:var(--terminal-fg);padding:2px 8px;display:inline-flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:var(--terminal-green);box-shadow:0 0 6px color-mix(in srgb, var(--terminal-green) 60%, transparent)"></span>OPEN SOURCE</span><span aria-hidden="true" style="color:var(--terminal-green)">─┐</span><span aria-hidden="true" style="flex:1;height:1px;background:repeating-linear-gradient(to right, var(--terminal-border) 0 6px, transparent 6px 10px);min-width:24px;opacity:0.8"></span></div>
      <h2 id="statsTitle" style="margin:0">Dibuat untuk UMKM & Developer Indonesia</h2>
      <span class="ascii-label">★ STAR • FORK • CONTRIBUTE</span>
    </div>
    <div class="stats-grid">
      <div style="display:grid; gap:12px">
        <div class="stat-row">
          <div class="stat"><span class="stat-icon">⬡</span><div><b>Versi Terkini</b><strong>v${APP_VERSION} • Stabil</strong></div></div>
          <div class="stat"><span class="stat-icon">⚖</span><div><b>Bebas Pakai</b><strong>Gratis Selamanya</strong></div></div>
          <div class="stat"><span class="stat-icon">◐</span><div><b>Tanpa Internet</b><strong>Offline • PWA</strong></div></div>
        </div>
        <div class="stat-row">
          <div class="stat"><span class="stat-icon">▦</span><div><b>Instan & Andal</b><strong>Edge • Global</strong></div></div>
          <div class="stat"><span class="stat-icon">⬢</span><div><b>Library Lengkap</b><strong>NPM • ESM • CJS</strong></div></div>
          <div class="stat"><span class="stat-icon">♡</span><div><b>Gotong Royong</b><strong>Komunitas • Saweria</strong></div></div>
        </div>
        <div class="paper">
          <div style="font-family:var(--mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted)">Dari Banten untuk Indonesia</div>
          <p style="margin:8px 0 0; line-height:1.65; color:var(--muted); font-size:13px">Dibuat karena kebutuhan nyata: banyak UMKM cuma punya QRIS Static. Sekarang <b style="color:var(--fg)">konversi jadi Dynamic bisa di mana saja</b> — browser, server, bahkan terminal. Cepat, akurat, tanpa biaya dan tanpa iklan.</p>
          <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap">
            <span class="chip" style="font-size:10px">UMKM</span><span class="chip" style="font-size:10px">Warung</span><span class="chip" style="font-size:10px">Developer</span><span class="chip" style="font-size:10px">Kasir</span>
          </div>
        </div>
      </div>

      <div class="paper">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted)">◆ Dukung Kami</div>
        <h3 style="margin:8px 0 0;font-family:var(--serif);font-weight:400;font-size:19px;letter-spacing:-0.02em;line-height:1.1">Biar tetap gratis<br/>untuk semua.</h3>
        <p style="margin:8px 0 0;line-height:1.65;color:var(--muted);font-size:13px">Kode terbuka, bebas pakai. Punya ide? Buka issue. Ingin bantu? Kirim PR. Atau cukup beri bintang dan traktir kopi — sangat berarti.</p>
        <div class="cta-actions" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <a href="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter" target="_blank" rel="noopener" class="btn" style="flex:1;text-decoration:none;min-height:40px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Star di GitHub</a>
          <a href="https://saweria.co/bantenitsolutions" target="_blank" rel="noopener" class="btn secondary" style="flex:1;text-decoration:none;min-height:40px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> Traktir Kopi</a>
        </div>
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);margin-top:8px">github.com/Banten-IT-Solutions/BITS-QRIS-Converter</div>
      </div>
    </div>
  </section>

  <footer class="foot">
    <div>© 2026 BITS QRIS Converter — Banten IT Solutions • <a href="https://github.com/Banten-IT-Solutions/BITS-QRIS-Converter">GitHub</a> • <a href="https://www.npmjs.com/package/bits-qris">NPM</a></div>
    <div>Gratis • Aman • Open Source • Privasi Terjaga</div>
  </footer>

  <div id="toastContainer" aria-live="polite" aria-atomic="true"></div>
  `;

  // theme init
  try {
    applyTheme(initialTheme);
  } catch {}
  // listen system changes if no explicit save
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('bits-theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  } catch {}

  (document.getElementById('themeToggle') as HTMLButtonElement)?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
    const foot = document.getElementById('footTheme');
    if (foot) foot.textContent = document.documentElement.getAttribute('data-theme') + ' mode';
  });
  const footTheme = document.getElementById('footTheme');
  if (footTheme) footTheme.textContent = initialTheme + ' mode';

  // --- toast ---
  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.setAttribute('role', type === 'error' ? 'alert' : 'status');
    t.textContent = msg;
    c.appendChild(t);
    const remove = () => {
      t.style.animation = 'toastOut 0.2s ease-in forwards';
      setTimeout(() => t.remove(), 200);
    };
    setTimeout(remove, 2800);
    t.addEventListener('click', remove);
  }

  // PWA install handling
  (document.getElementById('pwaInstall') as HTMLButtonElement)?.addEventListener(
    'click',
    async () => {
      if (!deferredPrompt) return;
      (deferredPrompt as unknown as { prompt: () => void }).prompt();
      // @ts-ignore
      const choice = await (
        deferredPrompt as unknown as { userChoice: Promise<{ outcome: string }> }
      ).userChoice;
      if (choice.outcome === 'accepted') {
        document.getElementById('pwaBanner')?.classList.remove('show');
      }
      deferredPrompt = null;
    },
  );
  (document.getElementById('pwaDismiss') as HTMLButtonElement)?.addEventListener('click', () => {
    document.getElementById('pwaBanner')?.classList.remove('show');
  });

  // --- terminal typing ---
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const termCmd = document.getElementById('termCmd') as HTMLSpanElement;
  const termOut = document.getElementById('termOut') as HTMLDivElement;
  const termCursor = document.getElementById('termCursor') as HTMLSpanElement;
  const termDynamic = document.getElementById('termDynamic') as HTMLDivElement;
  const termCrc = document.getElementById('termCrc') as HTMLSpanElement;

  const sample = '00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG6304DA44';
  let dynamicSample = sample;
  try {
    dynamicSample = convertQris(sample, { amount: 25000 });
    termDynamic.textContent = dynamicSample;
    termCrc.textContent = dynamicSample.slice(-4) + ' — CRC ok';
  } catch {}

  const fullCmd = 'bits-qris convert --amount 25000 --qris 000201010211...';
  let typingTimer: number | null = null;
  let outTimer: number | null = null;

  function startTyping() {
    if (!termCmd || !termOut) return;
    if (prefersReduced) {
      termCmd.textContent = fullCmd;
      termOut.style.display = 'block';
      if (termCursor) termCursor.style.display = 'none';
      return;
    }
    termCmd.textContent = '';
    termOut.style.display = 'none';
    if (termCursor) termCursor.style.display = 'inline-block';
    let i = 0;
    if (typingTimer) window.clearInterval(typingTimer);
    if (outTimer) window.clearTimeout(outTimer);
    typingTimer = window.setInterval(() => {
      i++;
      termCmd.textContent = fullCmd.slice(0, i);
      if (i >= fullCmd.length) {
        if (typingTimer) window.clearInterval(typingTimer);
        outTimer = window.setTimeout(() => {
          termOut.style.display = 'block';
          termOut.animate?.(
            [
              { opacity: 0, transform: 'translateY(4px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 260, easing: 'ease-out' },
          );
        }, 420);
      }
    }, 28);
  }
  startTyping();
  document.getElementById('termReplay')?.addEventListener('click', startTyping);
  document.getElementById('termCopy')?.addEventListener('click', async () => {
    const txt = `${fullCmd}\n✓ ${termDynamic.textContent || dynamicSample}`;
    await navigator.clipboard.writeText(txt);
    const btn = document.getElementById('termCopy') as HTMLButtonElement;
    const old = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => (btn.textContent = old), 1200);
  });

  // playground copy — semua pakai helper copyText + toast biar konsisten & simetris
  const copyMap: Record<string, string> = {
    npm: `npm i bits-qris\nimport { convertQris } from 'bits-qris/core'\nconvertQris(qris, { amount: 50000 })`,
    npx: `npx bits-qris convert "000201..." --amount 50000\nnpx bits-qris validate "000201..."\nnpx bits-qris image --amount 25000 --out qris.png`,
  };
  document.querySelectorAll<HTMLButtonElement>('.terminal-actions button[data-copy]').forEach((b) => {
    b.addEventListener('click', async () => {
      const k = b.dataset.copy!;
      const ok = await copyText(copyMap[k] || '');
      const old = b.textContent;
      b.textContent = ok ? 'Copied' : 'Gagal';
      if (ok) showToast(k === 'npm' ? 'Perintah npm tersalin' : 'Perintah npx tersalin', 'success');
      setTimeout(() => (b.textContent = old!), 1200);
    });
  });
  document.getElementById('copyCurl')?.addEventListener('click', async () => {
    const ok = await copyText(`curl -s "https://qris.bits.co.id/api/convert?amount=50000&qris=000201010211..." | jq`);
    const b = document.getElementById('copyCurl') as HTMLButtonElement;
    const old = b.textContent;
    b.textContent = ok ? 'Copied' : 'Gagal';
    if (ok) showToast('Perintah curl tersalin', 'success');
    setTimeout(() => (b.textContent = old!), 1200);
  });

  // --- wiring converter (same as before) ---
  const qrisEl = $('#qris') as HTMLTextAreaElement;
  const amountEl = $('#amount') as HTMLInputElement;
  const feeTypeEl = $('#feeType') as HTMLSelectElement;
  const feeValueEl = $('#feeValue') as HTMLInputElement;
  const feeField = $('#feeField') as HTMLDivElement;
  const fileEl = $('#file') as HTMLInputElement;
  const statusEl = $('#uploadStatus') as HTMLDivElement;
  const errorEl = $('#error') as HTMLDivElement;
  const outStringEl = $('#outString') as HTMLDivElement;
  const merchantEl = $('#merchant') as HTMLDivElement;
  const cityEl = $('#city') as HTMLDivElement;
  const qrWrap = $('#qrWrap') as HTMLDivElement;
  const copyStringBtn = $('#copyString') as HTMLButtonElement;
  const downloadBtn = $('#downloadPng') as HTMLButtonElement;
  const openApiBtn = $('#openApi') as HTMLAnchorElement;

  let lastDataUrl = '';

  feeTypeEl.addEventListener('change', () => {
    feeField.style.display = feeTypeEl.value ? 'grid' : 'none';
  });

  // sample
  ($('#useSample') as HTMLButtonElement).addEventListener('click', () => {
    qrisEl.value = ($('#sampleQris') as HTMLDivElement).textContent!.trim();
    document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    qrisEl.focus();
  });
  ($('#copySample') as HTMLButtonElement).addEventListener('click', async () => {
    const txt = ($('#sampleQris') as HTMLDivElement).textContent!.trim();
    const ok = await copyText(txt);
    if (ok) {
      ($('#copySample') as HTMLButtonElement).textContent = 'Tersalin';
      showToast('Contoh kode tersalin', 'success');
      setTimeout(() => (($('#copySample') as HTMLButtonElement).textContent = 'Salin'), 1200);
    } else {
      showToast('Gagal menyalin', 'error');
    }
  });

  fileEl.addEventListener('change', async () => {
    const f = fileEl.files?.[0];
    if (!f) return;
    statusEl.textContent = '⏳ Mendecode QR...';
    try {
      const data = await decodeImage(f);
      qrisEl.value = data;
      statusEl.innerHTML =
        '<span class="ok" style="display:inline-block">✓ QR berhasil dibaca</span>';
      errorEl.innerHTML = '';
    } catch (e) {
      statusEl.innerHTML = `<span class="alert" style="display:inline-block">${(e as Error).message}</span>`;
    }
  });

  // drop
  const uploader = document.querySelector('.uploader') as HTMLElement;
  uploader.addEventListener('dragover', (e) => {
    e.preventDefault();
    (uploader as HTMLElement).style.background = 'var(--bg-soft)';
  });
  uploader.addEventListener(
    'dragleave',
    () => ((uploader as HTMLElement).style.background = 'var(--card)'),
  );
  uploader.addEventListener('drop', async (e) => {
    e.preventDefault();
    (uploader as HTMLElement).style.background = 'var(--card)';
    const f = (e as DragEvent).dataTransfer?.files[0];
    if (f) {
      fileEl.files = (e as DragEvent).dataTransfer!.files;
      fileEl.dispatchEvent(new Event('change'));
    }
  });

  ($('#clear') as HTMLButtonElement).addEventListener('click', () => {
    qrisEl.value = '';
    amountEl.value = '50000';
    feeTypeEl.value = '';
    feeValueEl.value = '';
    feeField.style.display = 'none';
    errorEl.innerHTML = '';
    outStringEl.textContent = '—';
    qrWrap.innerHTML = '<div class="qr-empty"><strong style="color:var(--fg);font-family:var(--serif);font-size:14px;font-weight:400">QR Belum Tersedia</strong><br><span style="color:var(--muted)">Hasil konversi akan muncul di sini</span></div>';
    merchantEl.textContent = '—';
    cityEl.textContent = '—';
    const sbClear = document.getElementById('statusBadge') as HTMLDivElement | null;
    if (sbClear) sbClear.style.display = 'none';
    lastDataUrl = '';
    downloadBtn.disabled = true;
    statusEl.textContent = '';
  });

  async function copyText(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error('no clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      ta.remove();
      return ok;
    }
  }
  copyStringBtn.addEventListener('click', async () => {
    const t = (outStringEl.textContent || '').trim();
    if (!t || t === '—') {
      showToast('Belum ada kode untuk disalin', 'error');
      return;
    }
    const ok = await copyText(t);
    if (ok) {
      copyStringBtn.textContent = 'Tersalin';
      showToast('Kode QRIS tersalin', 'success');
      setTimeout(() => (copyStringBtn.textContent = 'Salin Kode'), 1200);
    } else {
      showToast('Gagal menyalin — coba manual', 'error');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!lastDataUrl) return;
    const a = document.createElement('a');
    a.href = lastDataUrl;
    a.download = `qris-${Date.now()}.png`;
    a.click();
  });

  // hapus style error saat user mulai mengetik
  qrisEl.addEventListener('input', () => qrisEl.classList.remove('field-error'));
  amountEl.addEventListener('input', () => amountEl.classList.remove('field-error'));

  ($('#convert') as HTMLButtonElement).addEventListener('click', async () => {
    errorEl.innerHTML = '';
    qrisEl.classList.remove('field-error');
    amountEl.classList.remove('field-error');
    const qris = qrisEl.value.trim();
    const amount = Number(amountEl.value);
    if (!qris) {
      qrisEl.classList.add('field-error');
      qrisEl.focus();
      return;
    }
    if (!amount || amount <= 0) {
      errorEl.innerHTML = '<div class="alert">Nominal harus lebih dari 0</div>';
      return;
    }

    const v = validateQris(qris);
    if (!v.valid) {
      errorEl.innerHTML = `<div class="alert">${v.errors.join('<br>')}</div>`;
      return;
    }

    const feeType = feeTypeEl.value as 'fixed' | 'percentage' | '';
    const feeValue = Number(feeValueEl.value);
    const fee =
      feeType && feeValue > 0
        ? { type: feeType as 'fixed' | 'percentage', value: feeValue }
        : undefined;

    try {
      const dynamic = convertQris(qris, { amount, fee });
      const parsed = parseQris(dynamic);
      const validation = validateQris(dynamic);

      outStringEl.textContent = dynamic;
      termDynamic.textContent = dynamic;
      if (termCrc) termCrc.textContent = dynamic.slice(-4) + ' — CRC ok';
      merchantEl.textContent = parsed.merchantName || '—';
      cityEl.textContent = parsed.merchantCity || '';
      openApiBtn.href = `/api/convert?amount=${amount}&qris=${encodeURIComponent(qris)}${fee ? `&fee=${fee.value}&type=${fee.type}` : ''}`;

      const dataUrl = await makeQrDataUrl(qris, { amount, fee });
      lastDataUrl = dataUrl;
      qrWrap.innerHTML = `<img alt="QRIS Dynamic" src="${dataUrl}" />`;
      const sb = document.getElementById('statusBadge') as HTMLDivElement | null;
      if (sb) {
        sb.textContent = validation.valid ? '✓ Valid' : '✗ Invalid';
        sb.style.background = validation.valid ? 'var(--terminal-green)' : 'var(--accent-2)';
        sb.style.display = 'inline-flex';
      }
      downloadBtn.disabled = false;
      errorEl.innerHTML = '';
      showToast('✓ Berhasil — QRIS Dynamic siap digunakan', 'success');
      // also auto show terminal output if not yet
      if (termOut) termOut.style.display = 'block';
    } catch (e) {
      errorEl.innerHTML = `<div class="alert">${(e as Error).message}</div>`;
    }
  });
}

render();
