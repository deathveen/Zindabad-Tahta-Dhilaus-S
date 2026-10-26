// Render beberapa frame ke PNG untuk dicek: node preview.js out_dir t1 t2 ...
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => console.log('console', m.text()));
  await p.goto('file://' + path.resolve(process.env.RENDER_HTML || path.join(__dirname, 'render.html')) + '#render'); await p.evaluate(() => document.fonts.ready);
  for (const t of ts) { await p.evaluate(t => draw(+t), t); await (await p.$('canvas')).screenshot({ path: `${out}/t${t}.png` }); }
  await b.close();
})();
