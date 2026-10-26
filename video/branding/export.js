// Ekspor semua aset logo ke PNG transparan: node export.js out_dir
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const NAMES = ['profil-B', 'logo-B', 'logo-A', 'logo-A-wordmark', 'logo-C', 'watermark'];
(async () => {
  const out = process.argv[2] || 'logo'; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  for (const n of NAMES) {
    await p.goto('file://' + path.resolve(__dirname, 'export.html') + '#' + n); await p.reload();
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
    await (await p.$('canvas')).screenshot({ path: `${out}/${n}.png`, omitBackground: true });
  }
  await b.close(); console.log('ok', NAMES.length);
})();
