// Render cover Reels: node ep02/cover.js out.png
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'render.html') + '#render'); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => drawCover()); await (await p.$('canvas')).screenshot({ path: process.argv[2] }); await b.close(); })();
