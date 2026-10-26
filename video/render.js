// Render render.html menjadi video: node render.js out.mp4 [workers]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const FPS = 30;
async function chunk(browser, f0, f1, file) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(process.env.RENDER_HTML || path.join(__dirname, 'render.html')) + '#render'); await p.evaluate(() => document.fonts.ready);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', file]);
  const done = new Promise(r => ff.on('close', r));
  const canvas = await p.$('canvas');
  for (let f = f0; f < f1; f++) {
    await p.evaluate(t => draw(t), f / FPS);
    const buf = await canvas.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await done; await p.close();
}
(async () => {
  const out = path.resolve(process.argv[2] || 'out.mp4'), N = +(process.argv[3] || 4);
  const browser = await chromium.launch();
  const page = await browser.newPage(); await page.goto('file://' + path.resolve(process.env.RENDER_HTML || path.join(__dirname, 'render.html')) + '#render');
  const total = Math.round(await page.evaluate(() => DURATION) * FPS); await page.close();
  const per = Math.ceil(total / N), files = [];
  await Promise.all([...Array(N)].map((_, i) => { const f = `${out}.part${i}.mp4`; files.push(f); return chunk(browser, i * per, Math.min(total, (i + 1) * per), f); }));
  await browser.close();
  fs.writeFileSync(out + '.txt', files.map(f => `file '${f}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', out + '.txt', '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
  files.forEach(f => fs.unlinkSync(f)); fs.unlinkSync(out + '.txt');
  console.log('frames', total, '->', out);
})();
