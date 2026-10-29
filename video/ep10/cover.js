// Render cover: node epNN/cover.js out.png → out.png (9:16 Reels) + out-3x4.png (grid IG/TikTok) + out-4x5.png (feed IG)
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'render.html') + '#render'); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => drawCover());
  const out = process.argv[2], base = out.replace(/\.png$/, '');
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  await p.screenshot({ path: base + '-3x4.png', clip: { x: 0, y: 240, width: 1080, height: 1440 } });
  await p.screenshot({ path: base + '-4x5.png', clip: { x: 0, y: 285, width: 1080, height: 1350 } });
  await b.close(); })();
