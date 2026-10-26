// Render lembar desain ke PNG: node shot.js sheet.html out.png
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 3200 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(process.argv[2])); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await (await p.$('canvas')).screenshot({ path: process.argv[3] }); await b.close(); })();
