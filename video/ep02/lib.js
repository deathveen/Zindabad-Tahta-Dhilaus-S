// Utilitas animasi bersama (diambil dari ep01/render.html).
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
