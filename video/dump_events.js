const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve(process.argv[2]) + '#render');
  const ev = await p.evaluate(() => ({ events: sfxEvents(), music: MUSIC, duration: DURATION }));
  fs.writeFileSync(process.argv[3], JSON.stringify(ev)); await b.close(); console.log(ev.events.length, JSON.stringify(ev.music)); })();
