// Mesin animasi Faedah Harian: utilitas gambar, caption, judul, transisi, narator, kartu dalil, kartu penutup.
// Dipakai bersama karakter/karakter.js dan branding/brand.js. Halaman episode mendefinisikan:
//   W, H, SS, VO_END, DURATION, NT (let), ctx, VO_ENV (vo_env.js), CAPTIONS, SCENES, sfxEvents(), dan adegan S_*.
//   Opsional: drawOverlay(T) (HUD di atas adegan), drawCover().
const AMBER = '#FFC24B', CREAM = '#FFF4E0', STONE = '#6B6F78';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeInOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeIn = k => k * k * k;
const backOut = k => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(c1, c2, k) { const a = hex(c1), b = hex(c2); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`; }
function mixRgb(c1, c2, k) { const a = hex(c1), b = hex(c2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join(''); }

function starPath(x, y, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .48 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}
function drawStar(x, y, r, rot, alpha = 1, glow = 1, color = AMBER) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  if (glow > 0) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
    g.addColorStop(0, `rgba(255,200,90,${.45 * glow})`); g.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
  }
  starPath(x, y, r, rot); ctx.fillStyle = color; ctx.fill();
  starPath(x - r * .12, y - r * .15, r * .45, rot); ctx.fillStyle = 'rgba(255,255,230,.55)'; ctx.fill();
  ctx.restore();
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function hills(layers, t, par = 0) {
  layers.forEach((L, li) => {
    ctx.beginPath(); ctx.moveTo(-20, H);
    for (let x = -20; x <= W + 20; x += 10) {
      const xx = x + par * (li + 1) * 8;
      ctx.lineTo(x, L.y + Math.sin(xx * L.f + L.p) * L.a + Math.sin(xx * L.f * 2.7 + L.p * 2) * L.a * .35);
    }
    ctx.lineTo(W + 20, H); ctx.closePath(); ctx.fillStyle = L.c; ctx.fill();
  });
}
function sky(stops) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function twinkle(t, a) {
  if (a <= 0) return;
  skyStars.forEach(s => {
    ctx.globalAlpha = a * (.45 + .55 * Math.sin(t * 2 + s.p) ** 2);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 6.28); ctx.fill();
  });
  ctx.globalAlpha = 1;
}
function grass(t, y, color, n = 60, seed = 3) {
  const r = rng(seed); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = r() * W, h = 10 + r() * 18, sw = Math.sin(t * 1.6 + x * .02) * 4;
    ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.quadraticCurveTo(x + sw * .5, y - h * .5, x + sw, y - h); ctx.stroke();
  }
}
function particles(t, color, n = 30, seed = 9, rise = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, sp = 8 + r() * 18, ph = r() * 100;
    const y = (H - ((t * sp * rise + ph * 13) % (H + 40))), x = x0 + Math.sin(t * .7 + ph) * 18;
    ctx.globalAlpha = .25 + .35 * Math.sin(t + ph) ** 2;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 1.2 + r() * 1.8, 0, 6.28); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function setFont(px, weight = 800) { ctx.font = `${weight} ${px}px Inter, sans-serif`; }
function wrapTokens(text, maxW) {
  // *kata* = disorot; satu kata bisa berisi beberapa potongan (mis. "*Lumi*.")
  let on = false; const sp = ctx.measureText(' ').width;
  const words = text.split(' ').map(raw => {
    const runs = [{ txt: '', hl: on }];
    for (const ch of raw) { if (ch === '*') { on = !on; runs.push({ txt: '', hl: on }); } else runs[runs.length - 1].txt += ch; }
    const rs = runs.filter(r => r.txt); rs.forEach(r => r.w = ctx.measureText(r.txt).width);
    return { runs: rs, w: rs.reduce((a, r) => a + r.w, 0) };
  });
  const lines = [[]]; let lw = 0;
  words.forEach(w => { if (lw + w.w > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.w + sp; });
  return { lines, sp };
}
function caption(t) {
  const c = CAPTIONS.find(([a, b]) => t >= a && t < b); if (!c) return;
  const [a, b, text] = c, kin = easeOut(prog(t, a, a + .35)), kout = prog(t, b - .25, b);
  const alpha = kin * (1 - kout);
  setFont(34, 800);
  const { lines, sp: sp0 } = wrapTokens(text, 590), sp = sp0 * 1.25, lh = 46, y0 = 1010 - (lines.length - 1) * lh / 2 + (1 - kin) * 14;
  ctx.save(); ctx.globalAlpha = alpha; ctx.textBaseline = 'middle';
  // tiap kata muncul bertahap
  let wi = 0; const total = lines.flat().length, reveal = prog(t, a, a + Math.min(1.0, (b - a) * .38)) * (1 + 1 / total);
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, w) => s + w.w, 0) + sp * (ln.length - 1); let x = W / 2 - tw / 2;
    ln.forEach(w => {
      const wk = clamp(reveal * total - wi); wi++;
      const hl = w.runs.some(r => r.hl), sc = lerp(.55, 1, easeOut(wk)) * (hl ? 1 + .035 * Math.sin(Math.PI * clamp((t - a - .9) / .35)) : 1);
      ctx.save(); ctx.translate(x + w.w / 2, y0 + li * lh + (1 - easeOut(wk)) * 16 - kout * 10); ctx.scale(sc, sc);
      ctx.globalAlpha = alpha * easeOut(wk);
      ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 2;
      let rx = -w.w / 2; w.runs.forEach(r => { ctx.fillStyle = r.hl ? AMBER : '#FFFFFF'; ctx.fillText(r.txt, rx, 0); rx += r.w; });
      ctx.restore();
      x += w.w + sp;
    });
  });
  ctx.restore();
}
function headline(small, big, t, a, b, opts = {}) {
  const kin = easeOut(prog(t, a, a + .6)), kout = b ? prog(t, b - .4, b) : 0, alpha = kin * (1 - kout);
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const y = (opts.y || 150) + (1 - kin) * 18;
  setFont(16, 700); ctx.fillStyle = opts.smallColor || 'rgba(255,244,224,.85)';
  ctx.letterSpacing = `${lerp(14, 4, kin).toFixed(1)}px`; ctx.fillText(small, W / 2, y); ctx.letterSpacing = '0px';
  setFont(opts.size || 50, 900); ctx.fillStyle = opts.bigColor || AMBER;
  ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 18;
  const lines = Array.isArray(big) ? big : [big], sz = opts.size || 50;
  lines.forEach((l, i) => {
    const li = backOut(prog(t, a + .12 + i * .13, a + .72 + i * .13));
    ctx.save(); ctx.globalAlpha = alpha * clamp(li * 1.4); ctx.translate(W / 2, y + 58 + i * sz * 1.08 + (1 - li) * 40); ctx.scale(lerp(.85, 1, li), lerp(.85, 1, li));
    ctx.fillText(l, 0, 0); ctx.restore();
  });
  ctx.restore();
}
function footnote(text, t, a, b, y = 1188) {
  const al = easeOut(prog(t, a, a + .6)) * (1 - prog(t, b - .3, b)); if (al <= 0) return;
  ctx.save(); ctx.globalAlpha = al * .6; setFont(14, 500); ctx.fillStyle = CREAM; ctx.textAlign = 'center';
  (Array.isArray(text) ? text : [text]).forEach((l, i) => ctx.fillText(l, W / 2, y + i * 20)); ctx.restore();
}
function renderTo(buf, fn, t) {
  const prev = ctx; ctx = buf.getContext('2d');
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.clearRect(0, 0, W, H); fn(t);
  ctx = prev; return buf;
}
function blit(buf, scale, blur, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; if (blur > .2) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.translate(W / 2, H / 2); ctx.scale(scale, scale); ctx.drawImage(buf, -W / 2, -H / 2, W, H); ctx.restore();
}
function drawRifda(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  figure(0, 0, 1, { pose: 'stand', robe: B.ungu, wear: 'hijab', hijab: B.pink, arms: o.arms || 'fold', mood: o.mood ?? 1, look: o.look || 0, talk: o.talk || 0 });
  if (o.label) {
    ctx.globalAlpha = o.label; ctx.fillStyle = B.pink; ctx.beginPath(); ctx.roundRect(-46, 14, 92, 30, 15); ctx.fill();
    ctx.font = '700 21px FreeSerif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('رِفْدَة', 0, 35); ctx.globalAlpha = 1;
  }
  ctx.restore();
}
function drawDafa(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y);
  const sq = o.squash || 0; ctx.scale(s * (1 + sq * .12), s * (1 - sq * .14));
  if (o.tint) ctx.filter = `brightness(${(1 - .4 * o.tint).toFixed(3)}) saturate(${(1 - .5 * o.tint).toFixed(3)})`;
  const blink = (o.t % 3.4) < .12;
  figure(0, 0, 1, { pose: 'stand', robe: '#5FA8A0', wear: 'kopiah', capColor: '#2B2B33', costume: 'rumah',
    arms: o.arms || 'rest', up: o.up, target: o.target, mood: o.mood ?? 1, look: o.look || 0, talk: o.talk || 0 });
  if (blink) { ctx.fillStyle = SKIN; [-11, 11].forEach(dx => { ctx.fillRect(dx + (o.look || 0) * 5 - 6, -137, 12, 14); }); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; [-11, 11].forEach(dx => { ctx.beginPath(); ctx.moveTo(dx + (o.look || 0) * 5 - 5, -128); ctx.lineTo(dx + (o.look || 0) * 5 + 5, -128); ctx.stroke(); }); }
  if (o.sad) { ctx.strokeStyle = INK; ctx.lineWidth = 2.5; [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(d * 18 + (o.look || 0) * 5, -142 - 3 * o.sad); ctx.lineTo(d * 6 + (o.look || 0) * 5, -139 + 3 * o.sad); ctx.stroke(); }); }
  ctx.filter = 'none';
  if (o.leaf) sprout(4, -166, .3 * o.leaf, '#2F6B4F', '#8BD17C');
  ctx.restore();
}
function watermark(alpha = .55) {
  ctx.save(); ctx.globalAlpha = alpha; sprout(30, 64, .26, '#fff', '#fff');
  ctx.font = '800 15px Inter'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 6;
  ctx.fillText('faedahharian.official', 44, 60); ctx.restore();
}
function cardBg(t) {
  sky([[0, '#1A1230'], [1, '#2D1E4F']]);
  const g = ctx.createRadialGradient(W / 2, 560, 50, W / 2, 560, 560);
  g.addColorStop(0, 'rgba(255,194,75,.10)'); g.addColorStop(1, 'rgba(255,194,75,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  particles(t, 'rgba(255,230,190,1)', 18, 21, .5);
}

const skyStars = (() => { const r = rng(42), o = []; for (let i = 0; i < 140; i++) o.push({ x: r() * W, y: r() * 780, s: .6 + r() * 1.6, p: r() * 6.28 }); return o; })();
const voAt = T => VO_ENV[Math.max(0, Math.min(VO_ENV.length - 1, Math.round(T * 30)))] || 0;
const talkVO = T => clamp((voAt(T) - .15) * 1.6) * (.6 + .4 * Math.abs(Math.sin(T * 23)));

// ---------- elemen umum ----------
function rays(cx, cy, r0, r1, n, a, color = '255,236,180', rot = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = a;
  for (let i = 0; i < n; i++) {
    const ang = i / n * Math.PI * 2, w = .07;
    const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * r1, Math.sin(ang) * r1);
    g.addColorStop(0, `rgba(${color},.55)`); g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(Math.cos(ang - w) * r0, Math.sin(ang - w) * r0); ctx.lineTo(Math.cos(ang - w) * r1, Math.sin(ang - w) * r1);
    ctx.lineTo(Math.cos(ang + w) * r1, Math.sin(ang + w) * r1); ctx.lineTo(Math.cos(ang + w) * r0, Math.sin(ang + w) * r0); ctx.fill();
  }
  ctx.restore();
}
function dalilCard(T, a, header, arab, terj, src, opts = {}) {
  const k = easeOut(prog(T, a, a + .7)), y0 = opts.y || 230, h = opts.h || 400;
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k * (opts.alpha ?? 1); ctx.translate(0, (1 - k) * 24); ctx.textAlign = 'center';
  ctx.fillStyle = opts.bg || 'rgba(255,248,230,.10)'; roundRect(54, y0, W - 108, h, 30); ctx.fill();
  ctx.strokeStyle = 'rgba(242,181,68,.55)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.font = '700 15px Inter'; ctx.letterSpacing = '4px'; ctx.fillStyle = 'rgba(255,244,224,.85)'; ctx.fillText(header, W / 2, y0 + 44); ctx.letterSpacing = '0px';
  ctx.font = `700 ${opts.arabSize || 48}px FreeSerif`; ctx.fillStyle = AMBER; ctx.shadowColor = 'rgba(255,190,80,.45)'; ctx.shadowBlur = 16;
  arab.forEach((l, i) => ctx.fillText(l, W / 2, y0 + 118 + i * (opts.arabSize || 48) * 1.35));
  ctx.shadowBlur = 0; ctx.font = 'italic 500 22px Inter'; ctx.fillStyle = CREAM;
  const ty = y0 + 118 + arab.length * (opts.arabSize || 48) * 1.35 + 14;
  terj.forEach((l, i) => ctx.fillText(l, W / 2, ty + i * 31));
  ctx.font = '600 14px Inter'; ctx.fillStyle = 'rgba(255,244,224,.6)'; ctx.fillText(src, W / 2, y0 + h - 22);
  ctx.restore();
}
function sajadah(x, y, w) { ctx.fillStyle = '#2F6B5B'; roundRect(x - w / 2, y - 5, w, 13, 4); ctx.fill(); ctx.fillStyle = '#D8B25A'; ctx.fillRect(x - w / 2 + 7, y - 2, w - 14, 2); ctx.fillRect(x - w / 2 + 7, y + 4, w - 14, 1.5); }
function rifdaCorner(T, a, b, arms = 'chest') {
  const rin = easeOut(prog(T, a, a + .7)), rout = easeIn(prog(T, b - .5, b));
  if (rin <= 0 || rout >= 1) return;
  drawRifda(lerp(-120, 92, rin) - rout * 220, 905, .82, { arms, talk: talkVO(T), look: .5, label: prog(T, a + .4, a + .8) * (1 - prog(T, a + 2.6, a + 3)) });
}
function S_outro(T) {
  const t0 = VO_END;
  ctx.fillStyle = B.daunGelap; ctx.fillRect(0, 0, W, H);
  const gy = 900, rise = easeOut(prog(T, t0 + .1, t0 + 1.3));
  const g = ctx.createRadialGradient(W / 2, gy, 30, W / 2, gy, 520); g.addColorStop(0, 'rgba(242,181,68,.35)'); g.addColorStop(1, 'rgba(242,181,68,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  sunrise(W / 2, gy + (1 - rise) * 60, 170, 'rgba(242,181,68,.30)');
  particles(T, 'rgba(255,240,200,1)', 26, 41, .6);
  ctx.fillStyle = shade(B.daunGelap, .12); ctx.fillRect(0, gy, W, H);
  [[90, .8], [640, .7], [170, .5], [560, .45]].forEach(([x, sc]) => sprout(x, gy + 4, sc * backOut(prog(T, t0 + .5, t0 + 1.3)), '#8BD17C', '#8BD17C'));
  const ik = backOut(prog(T, t0 + .2, t0 + .9));
  ctx.save(); ctx.translate(W / 2, 250); ctx.scale(ik, ik); iconB(0, 0, 88); ctx.restore();
  headline('FOLLOW', [HANDLE], T, t0 + .4, 0, { y: 410, size: 40 });
  const rk = easeOut(prog(T, t0 + .5, t0 + 1.3));
  drawRifda(W / 2, gy + 6 + (1 - rk) * 80, 1.45, { arms: 'wave', mood: 1 });
  ctx.save(); ctx.globalAlpha = prog(T, t0 + 1, t0 + 1.6); ctx.textAlign = 'center';
  ctx.font = '600 26px Inter'; ctx.fillStyle = '#F6EBD5'; ctx.fillText('teman belajar & pengingat harianmu', W / 2, gy + 70);
  const bp = 1 + .05 * Math.sin(T * 6) * prog(T, t0 + 1.6, t0 + 2.2);
  ctx.translate(W / 2, gy + 150); ctx.scale(bp, bp);
  ctx.fillStyle = B.fajar; ctx.beginPath(); ctx.roundRect(-120, -32, 240, 64, 32); ctx.fill();
  ctx.font = '800 28px Inter'; ctx.fillStyle = B.daunGelap; ctx.fillText('+ Follow', 0, 10);
  ctx.restore();
}
// ---------- komponen ep05 (rujukan baku); episode boleh menimpa dengan fungsi bernama sama ----------
function hexA(c, a) { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; }
// stempel miring yang menghantam (k 0..1 = progres masuk)
function stempel(x, y, k, lab, col, size = 40, rot = -.18) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = 1 + 1.4 * (1 - easeOut(clamp(k))); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 3);
  ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(lab).width + 40;
  ctx.fillStyle = 'rgba(255,253,247,.94)'; roundRect(-w / 2, -size * .85, w, size * 1.7, 12); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke(); ctx.textAlign = 'center'; ctx.fillStyle = col; ctx.fillText(lab, 0, size * .36); ctx.restore();
}
// kapsul label yang meloncat
function pil(x, y, k, lab, bg, fg = '#fff', size = 20) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const s = backOut(clamp(k)); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 2);
  ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(lab).width + 36;
  ctx.fillStyle = bg; roundRect(-w / 2, -size * .95, w, size * 1.9, size * .95); ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = fg; ctx.fillText(lab, 0, size * .36); ctx.restore();
}
// Rifda masuk dari kiri ke x (tanah 905), bicara mengikuti VO, keluar di b
function rifdaAt(T, x, a, b, arms, s = .82) {
  const rin = easeOut(prog(T, a, a + .7)), rout = easeIn(prog(T, b - .5, b));
  if (rin <= 0 || rout >= 1) return;
  drawRifda(lerp(x - 240, x, rin) - 260 * rout, 905, s, { arms, talk: talkVO(T), look: .5, label: prog(T, a + .4, a + .8) * (1 - prog(T, a + 2.6, a + 3)) });
}
// kitab (default Bulughul Maram): tertutup → terbuka di halaman bab ['BAB WUDHU', 'بَابُ الْوُضُوءِ']
function kitab(x, y, s, openK, bab = ['', ''], judul = ['بُلُوغُ الْمَرَامِ', 'BULUGHUL MARAM']) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 70, 220, 18, 0, 0, 6.28); ctx.fill();
  if (openK < .5) {
    const sc = 1 - openK * 2;
    ctx.fillStyle = '#6B2E2A'; roundRect(-120, -150, 240, 220, 10); ctx.fill();
    ctx.save(); ctx.scale(Math.max(.05, sc), 1); ctx.fillStyle = '#8C3B2E'; roundRect(-120, -160, 240, 220, 10); ctx.fill();
    ctx.strokeStyle = '#D8B25A'; ctx.lineWidth = 3; roundRect(-100, -140, 200, 180, 6); ctx.stroke();
    ctx.font = '700 34px FreeSerif'; ctx.textAlign = 'center'; ctx.fillStyle = '#F2D58A'; ctx.fillText(judul[0], 0, -50);
    ctx.font = '800 14px Inter'; ctx.fillText(judul[1], 0, -10); ctx.restore();
  } else {
    ctx.fillStyle = '#8C3B2E'; roundRect(-230, -150, 460, 220, 10); ctx.fill();
    ctx.fillStyle = '#FBF5EA'; roundRect(-220, -142, 216, 204, 6); ctx.fill(); roundRect(4, -142, 216, 204, 6); ctx.fill();
    ctx.fillStyle = 'rgba(42,34,51,.18)'; for (let i = 0; i < 6; i++) { ctx.fillRect(-200, -100 + i * 24, 176, 6); ctx.fillRect(24, -100 + i * 24, i === 5 ? 90 : 176, 6); }
    ctx.font = '800 15px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = '#8C3B2E'; ctx.fillText(bab[0], -112, -118); ctx.font = '700 18px FreeSerif'; ctx.fillText(bab[1], 112, -116);
  }
  ctx.restore();
}
// kartu follow saat Vonya masih mengajak follow: S_outro + Rifda yang mulutnya bergerak
function S_follow(T) {
  S_outro(T);
  const rk = easeOut(prog(T, VO_END + .5, VO_END + 1.3));
  drawRifda(W / 2, 906 + (1 - rk) * 80, 1.45, { arms: 'wave', mood: 1, talk: talkVO(T) });
}
// ---------- cover yang aman untuk feed ----------
// Grid IG/TikTok memotong cover 9:16 ke tengah (3:4 = y 160..1120, 1:1 = y 280..1000 logis).
// Semua isi penting ditaruh di zona 1:1 (y 290..990); di luar zona itu hanya latar.
const COVER_AMAN = { atas: 290, bawah: 990 };
// judul cover rata tengah: kapsul seri, baris judul besar (ukuran otomatis), subjudul; mengembalikan y bawahnya
function coverJudul(seri, baris, sub, o = {}) {
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  let y = o.y || 318;
  if (seri) { ctx.font = '900 22px Inter'; const w = ctx.measureText(seri).width + 40; ctx.fillStyle = o.seriBg || B.daun; roundRect(W / 2 - w / 2, y - 22, w, 40, 20); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(seri, W / 2, y + 6); y += 30; }
  let size = o.size || 104; ctx.font = `900 ${size}px Inter`;
  const maxW = Math.max(...baris.map(l => ctx.measureText(l).width)); if (maxW > 650) size = Math.floor(size * 650 / maxW);
  ctx.font = `900 ${size}px Inter`; ctx.lineJoin = 'round';
  baris.forEach((l, i) => {
    y += size * (i ? 1.0 : 1.02);
    ctx.lineWidth = size * .16; ctx.strokeStyle = o.garis || 'rgba(20,24,40,.85)'; ctx.strokeText(l, W / 2, y);
    ctx.fillStyle = (o.warna || [AMBER])[i % (o.warna || [AMBER]).length]; ctx.fillText(l, W / 2, y);
  });
  if (sub) { y += 52; ctx.font = '800 32px Inter'; ctx.lineWidth = 7; ctx.strokeStyle = o.garis || 'rgba(20,24,40,.85)'; ctx.strokeText(sub, W / 2, y); ctx.fillStyle = '#fff'; ctx.fillText(sub, W / 2, y); }
  ctx.restore(); return y;
}
// logo kecil "faedah harian" di pojok kanan bawah zona aman
function coverLogo(y = 968) {
  ctx.save(); ctx.font = '800 20px Inter'; const w = ctx.measureText('faedah harian').width + 70;
  ctx.fillStyle = 'rgba(20,24,40,.7)'; roundRect(W - 36 - w, y - 26, w, 48, 24); ctx.fill();
  iconB(W - 36 - w + 26, y - 2, 18); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText('faedah harian', W - 36 - w + 52, y + 5); ctx.restore();
}
function sceneFor(T) { let f = SCENES[0][1]; SCENES.forEach(([a, fn]) => { if (T >= a) f = fn; }); return f; }

// ---------- susunan adegan & frame ----------
// SCENES = [[detikMulai, fungsiAdegan], ...] urut naik; transisi zoom-blur otomatis di tiap batas.
// Opsional: HOOK_HITS = [detik, ...] → layar bergetar + zoom + kilat putih (pasangkan dengan SFX 'hook_boom'/'pop');
//           HOOK_END = detik akhir hook → audio.py menaikkan energi VO dan menahan musik sampai detik ini.
function hookPunch(T) {
  if (typeof HOOK_HITS === 'undefined') return 0;
  return HOOK_HITS.reduce((m, h) => Math.max(m, T >= h ? Math.exp(-(T - h) / .14) : 0), 0);
}
const CUT_D = .35;
const bufs = [0, 1].map(() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; return c; });
function draw(T) {
  NT = T;
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2 + Math.sin(T * .31) * 4, H / 2 + Math.cos(T * .23) * 4); ctx.rotate(Math.sin(T * .17) * .004);
  const hp = hookPunch(T);
  if (hp > .01) ctx.translate(Math.sin(T * 97) * 9 * hp, Math.cos(T * 83) * 9 * hp);
  const z = 1.03 + .008 * Math.sin(T * .5) + .07 * hp; ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  const cut = SCENES.slice(1).find(([c]) => Math.abs(T - c) < CUT_D);
  if (cut) {
    const i = SCENES.findIndex(([c]) => c === cut[0]), A = SCENES[i - 1][1], Bf = SCENES[i][1];
    const k = easeInOut((T - (cut[0] - CUT_D)) / (2 * CUT_D));
    blit(renderTo(bufs[0], A, T), 1 + .12 * k, 14 * k, 1);
    blit(renderTo(bufs[1], Bf, T), 1.12 - .12 * k, 14 * (1 - k), k);
  } else blit(renderTo(bufs[0], sceneFor(T), T), 1, 0, 1);
  ctx.restore();
  if (hp > .01) { ctx.fillStyle = `rgba(255,250,235,${(.45 * hp).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
  if (typeof drawOverlay === 'function') drawOverlay(T);
  caption(T);
  if (T < VO_END - .3) watermark(.55 * prog(T, .8, 1.6));
  const fade = Math.max(1 - prog(T, 0, .4), prog(T, DURATION - 1.2, DURATION));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.3)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function exportEpisode() {
  window.draw = draw; window.DURATION = DURATION; window.sfxEvents = sfxEvents;
  window.MUSIC = { vo_end: VO_END };
  if (typeof HOOK_END !== 'undefined') window.MUSIC.hook_end = HOOK_END;
  if (typeof drawCover === 'function') window.drawCover = drawCover;
  if (!/render/.test(location.hash)) {
    const start = performance.now();
    (function loop() { draw(((performance.now() - start) / 1000) % DURATION); requestAnimationFrame(loop); })();
  }
}
