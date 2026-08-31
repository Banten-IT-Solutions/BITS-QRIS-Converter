import './style.css';
import { convertQris, parseQris, validateQris } from 'bits-qris-converter/core';
import { makeQrDataUrl } from 'bits-qris-converter/image/qr-renderer';
import { registerSW } from 'virtual:pwa-register';

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
    jsQR: (data: Uint8ClampedArray, w: number, h: number) => { data: string } | null;
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
  if (!code) throw new Error('QR tidak terbaca — pastikan foto QRIS jelas');
  return code.data;
}

// --- app ---
const $ = <T extends Element>(s: string) => document.querySelector(s) as T;

function render() {
  document.querySelector('#app')!.innerHTML = `
  <div class="pwa-banner" id="pwaBanner">
    <span>📲 Install BITS QRIS — pakai offline tanpa sinyal</span>
    <div style="display:flex;gap:8px">
      <button id="pwaInstall">Install</button>
      <button id="pwaDismiss" style="background:transparent;color:#fff;border:1px solid #fff">Nanti</button>
    </div>
  </div>
  <div class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <div class="brand-mark">BITS</div>
        <div>
          <div style="font-family:var(--serif);font-size:13px;letter-spacing:-0.02em">QRIS Converter</div>
          <div class="brand-meta">Static → Dynamic • Edge • bits-qris-converter@1.0.0</div>
        </div>
      </div>
      <nav class="nav">
        <a href="https://github.com/bits-id/qris-converter" target="_blank">GitHub</a>
        <a href="https://www.npmjs.com/package/bits-qris-converter" target="_blank">NPM</a>
      </nav>
    </div>
  </div>

  <section class="hero">
    <div>
      <h1>QRIS Static<br/><i>menjadi</i> Dynamic<br/>yang presisi.</h1>
      <p>Parser TLV EMVCo, validator CRC 8 tag, dan generator QR yang benar — bukan <code>split("5802ID")</code> fragile. Dibuat untuk produksi, jalan di Workers Edge.</p>
      <div class="hero-meta">
        <span class="badge">dual ESM/CJS</span>
        <span class="badge">jimp 1.6.1 • 0 vuln</span>
        <span>edge: makeQrDataUrl (5KB) • server: makeFile (JPG struk)</span>
      </div>
    </div>
    <div class="hero-card">
      <div class="k">Contoh QRIS Statis (valid)</div>
      <div class="v" id="sampleQris">00020101021126560014ID.CO.QRIS.WWW0115ID10231625260990215ID10231625260995204581253033605802ID5919BANTEN IT SOLUTIONS6006SERANG6304DA44</div>
      <div class="sep"></div>
      <div class="k">Hasil Dynamic 25.000</div>
      <div class="v" id="sampleDynamic" style="opacity:0.7">— klik Convert —</div>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn secondary" id="copySample" style="flex:1">Copy</button>
        <button class="btn" id="useSample" style="flex:1">Pakai Contoh</button>
      </div>
    </div>
  </section>

  <main class="main">
    <section class="card">
      <div class="card-head"><h2>Input</h2><span>01 — static • 12 — dynamic</span></div>

      <div class="field">
        <label>QRIS String</label>
        <textarea id="qris" rows="4" placeholder="Tempel QRIS static di sini..."></textarea>
        <div class="hint">Atau upload foto QRIS — akan di-decode otomatis (jsQR).</div>
      </div>

      <label class="uploader" for="file">
        <strong style="font-size:13px;letter-spacing:0.04em;text-transform:uppercase">Upload foto QRIS</strong>
        <small>PNG / JPG — QR harus jelas</small>
        <input id="file" type="file" accept="image/*" hidden />
      </label>
      <div id="uploadStatus" class="hint" style="margin:8px 0 12px"></div>

      <div class="row">
        <div class="field"><label>Nominal (Rp)</label><input id="amount" type="number" placeholder="50000" value="50000" min="1" /></div>
        <div class="field"><label>Fee type</label>
          <select id="feeType"><option value="">Tanpa fee</option><option value="fixed">Tetap (Rp)</option><option value="percentage">Persen (%)</option></select>
        </div>
      </div>
      <div class="field" id="feeField" style="display:none"><label>Nilai Fee</label><input id="feeValue" type="number" placeholder="1000" /></div>

      <div class="actions">
        <button class="btn" id="convert">Convert → Dynamic</button>
        <button class="btn secondary" id="clear">Bersihkan</button>
      </div>
      <div id="error" style="margin-top:12px"></div>
    </section>

    <section class="card">
      <div class="card-head"><h2>Preview</h2><span>QR • String • Info</span></div>
      <div class="qr-wrap" id="qrWrap"><div class="qr-empty">QR akan muncul di sini<br><span style="color:var(--muted)">setelah Convert</span></div></div>
      <div style="height:12px"></div>
      <div class="meta">
        <div><b>Dynamic String</b><div class="code" id="outString">—</div><div class="actions" style="margin-top:8px"><button class="btn secondary" id="copyString">Copy string</button></div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><b>Merchant</b><div id="merchant">—</div><div id="city" style="color:var(--muted);font-size:12px">—</div></div>
          <div><b>Status</b><div id="status">—</div></div>
        </div>
        <div class="actions">
          <button class="btn secondary" id="downloadPng" disabled>Download PNG</button>
          <a class="btn" id="openApi" target="_blank" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center">Coba via API →</a>
        </div>
        <div class="hint">Di Cloudflare Workers, struk JPG (<code>makeFile</code> + Jimp) tidak dijalankan — pakai <code>makeQrDataUrl</code> (5KB) untuk Edge. Struk JPG tetap tersedia via Node/Server.</div>
      </div>
    </section>
  </main>

  <footer class="foot">
    <div>© 2026 BITS — Bina Inovasi Teknologi Solusi • MIT • <a href="https://github.com/bits-id/qris-converter">github.com/bits-id/qris-converter</a></div>
    <div>Workers • Hono 4.13 • Vite 8 • Wrangler 4.127</div>
  </footer>
  `;

  // PWA install handling
  (document.getElementById('pwaInstall') as HTMLButtonElement)?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => void }).prompt();
    // @ts-ignore
    const choice = await (deferredPrompt as unknown as { userChoice: Promise<{ outcome: string }> }).userChoice;
    if (choice.outcome === 'accepted') {
      document.getElementById('pwaBanner')?.classList.remove('show');
    }
    deferredPrompt = null;
  });
  (document.getElementById('pwaDismiss') as HTMLButtonElement)?.addEventListener('click', () => {
    document.getElementById('pwaBanner')?.classList.remove('show');
  });

  // --- wiring ---
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
  const statusMetaEl = $('#status') as HTMLDivElement;
  const qrWrap = $('#qrWrap') as HTMLDivElement;
  const copyStringBtn = $('#copyString') as HTMLButtonElement;
  const downloadBtn = $('#downloadPng') as HTMLButtonElement;
  const openApiBtn = $('#openApi') as HTMLAnchorElement;

  let lastDataUrl = '';

  feeTypeEl.addEventListener('change', () => {
    feeField.style.display = feeTypeEl.value ? 'block' : 'none';
  });

  // sample
  ($('#useSample') as HTMLButtonElement).addEventListener('click', () => {
    qrisEl.value = ($('#sampleQris') as HTMLDivElement).textContent!.trim();
    window.scrollTo({ top: 600, behavior: 'smooth' });
  });
  ($('#copySample') as HTMLButtonElement).addEventListener('click', async () => {
    await navigator.clipboard.writeText(($('#sampleQris') as HTMLDivElement).textContent!.trim());
    ($('#copySample') as HTMLButtonElement).textContent = 'Copied';
    setTimeout(() => ($('#copySample') as HTMLButtonElement).textContent = 'Copy', 1200);
  });

  fileEl.addEventListener('change', async () => {
    const f = fileEl.files?.[0];
    if (!f) return;
    statusEl.textContent = '⏳ Decoding...';
    try {
      const data = await decodeImage(f);
      qrisEl.value = data;
      statusEl.innerHTML = '<span class="ok" style="display:inline-block">✓ QR terbaca</span>';
      errorEl.innerHTML = '';
    } catch (e) {
      statusEl.innerHTML = `<span class="alert" style="display:inline-block">${(e as Error).message}</span>`;
    }
  });

  // drop
  const uploader = document.querySelector('.uploader') as HTMLElement;
  uploader.addEventListener('dragover', (e) => {
    e.preventDefault();
    (uploader as HTMLElement).style.background = '#FFF8EC';
  });
  uploader.addEventListener('dragleave', () => ((uploader as HTMLElement).style.background = '#fff'));
  uploader.addEventListener('drop', async (e) => {
    e.preventDefault();
    (uploader as HTMLElement).style.background = '#fff';
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
    qrWrap.innerHTML = '<div class="qr-empty">QR akan muncul di sini</div>';
    merchantEl.textContent = '—';
    cityEl.textContent = '—';
    statusMetaEl.textContent = '—';
    lastDataUrl = '';
    downloadBtn.disabled = true;
  });

  copyStringBtn.addEventListener('click', async () => {
    const t = outStringEl.textContent || '';
    if (!t || t === '—') return;
    await navigator.clipboard.writeText(t);
    copyStringBtn.textContent = 'Copied';
    setTimeout(() => (copyStringBtn.textContent = 'Copy string'), 1200);
  });

  downloadBtn.addEventListener('click', () => {
    if (!lastDataUrl) return;
    const a = document.createElement('a');
    a.href = lastDataUrl;
    a.download = `qris-${Date.now()}.png`;
    a.click();
  });

  ($('#convert') as HTMLButtonElement).addEventListener('click', async () => {
    errorEl.innerHTML = '';
    const qris = qrisEl.value.trim();
    const amount = Number(amountEl.value);
    if (!qris) {
      errorEl.innerHTML = '<div class="alert">QRIS string wajib diisi</div>';
      return;
    }
    if (!amount || amount <= 0) {
      errorEl.innerHTML = '<div class="alert">Nominal harus &gt; 0</div>';
      return;
    }

    const v = validateQris(qris);
    if (!v.valid) {
      errorEl.innerHTML = `<div class="alert">${v.errors.join('<br>')}</div>`;
      return;
    }

    const feeType = feeTypeEl.value as 'fixed' | 'percentage' | '';
    const feeValue = Number(feeValueEl.value);
    const fee = feeType && feeValue > 0 ? { type: feeType as 'fixed' | 'percentage', value: feeValue } : undefined;

    try {
      const dynamic = convertQris(qris, { amount, fee });
      const parsed = parseQris(dynamic);
      const validation = validateQris(dynamic);

      outStringEl.textContent = dynamic;
      (document.getElementById('sampleDynamic') as HTMLDivElement).textContent = dynamic;
      merchantEl.textContent = parsed.merchantName || '—';
      cityEl.textContent = parsed.merchantCity || '';
      statusMetaEl.innerHTML = validation.valid ? '<span class="ok" style="display:inline-block">✓ valid • CRC ok</span>' : '<span class="alert">invalid</span>';
      openApiBtn.href = `/api/convert?amount=${amount}&qris=${encodeURIComponent(qris)}${fee ? `&fee=${fee.value}&type=${fee.type}` : ''}`;

      const dataUrl = await makeQrDataUrl(qris, { amount, fee });
      lastDataUrl = dataUrl;
      qrWrap.innerHTML = `<img alt="QRIS Dynamic" src="${dataUrl}" />`;
      downloadBtn.disabled = false;
      errorEl.innerHTML = '<div class="ok">✓ Berhasil — QRIS Dynamic siap di-scan</div>';
    } catch (e) {
      errorEl.innerHTML = `<div class="alert">${(e as Error).message}</div>`;
    }
  });

  // init with sample
  (document.getElementById('sampleDynamic') as HTMLDivElement).textContent = '— klik Convert —';
}

render();
