// Ekspor latar halaman link-in-bio: node web-bg.js out_dir
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const V = { 'hp-terang': [1080, 2340], 'hp-gelap': [1080, 2340], 'desktop-terang': [2560, 1440] };
(async () => {
  const out = process.argv[2] || 'web-bg'; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const [n, [w, h]] of Object.entries(V)) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => console.error('PAGEERR', e.message));
    await p.goto('file://' + path.resolve(__dirname, 'web-bg.html') + '#' + n);
    await (await p.$('canvas')).screenshot({ path: `${out}/latar-${n}.png` }); await p.close();
  }
  await b.close(); console.log('ok');
})();
