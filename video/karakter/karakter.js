// Pustaka karakter gaya B: kepala bulat, badan = jubah (bentuk lonceng lembut).
// Semua tokoh digambar dari titik tanah (0,0), menghadap kanan untuk pose samping.
let ctx; // diset oleh halaman pemakai: ctx = canvas.getContext('2d')

const SKIN = '#EFC7A5', SKIN_D = '#D9A986', INK = '#2A2233';
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
  return '#' + c.map(v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k).toString(16).padStart(2, '0')).join('');
}

// ---------- bagian tubuh ----------
function sleeve(x0, y0, x1, y1, color, skin, opts = {}) {
  ctx.lineCap = 'round'; ctx.strokeStyle = opts.sil ? opts.sil : shade(color, -.12); ctx.lineWidth = 17;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.fillStyle = opts.sil || skin; ctx.beginPath(); ctx.arc(x1, y1, 7.5, 0, 6.28); ctx.fill();
  if (opts.point && !opts.sil) { ctx.strokeStyle = skin; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + opts.point[0], y1 + opts.point[1]); ctx.stroke(); }
}
function face(hx, hy, r, o = {}) {
  if (o.sil) return;
  const look = o.look || 0, side = o.side || 0;
  ctx.fillStyle = INK;
  if (o.closed) {
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hx + r * .45, hy + 2, 5, .2, Math.PI - .2); ctx.stroke(); return;
  }
  const eyes = side ? [hx + r * .42] : [hx - 11 + look * 5, hx + 11 + look * 5];
  eyes.forEach(ex => { ctx.beginPath(); ctx.ellipse(ex, hy + 1, 4, 6, 0, 0, 6.28); ctx.fill(); });
  ctx.fillStyle = '#fff'; eyes.forEach(ex => { ctx.beginPath(); ctx.arc(ex + 1.5, hy - 2, 1.6, 0, 6.28); ctx.fill(); });
  ctx.fillStyle = 'rgba(240,120,130,.35)';
  (side ? [hx + r * .3] : [hx - 19 + look * 4, hx + 19 + look * 4]).forEach(cx => { ctx.beginPath(); ctx.ellipse(cx, hy + 11, 6, 3.5, 0, 0, 6.28); ctx.fill(); });
  const mx = side ? hx + r * .55 : hx + look * 5, m = o.mood ?? 1;
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  if (o.talk > .05) { // mulut terbuka saat bicara (0..1)
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(mx, hy + 15, 5.5, 1.5 + o.talk * 5, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#E86F7E'; ctx.beginPath(); ctx.ellipse(mx, hy + 15 + o.talk * 2.5, 3.5, o.talk * 2, 0, 0, 6.28); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(mx - 6, hy + 13); ctx.quadraticCurveTo(mx, hy + 13 + m * 6, mx + 6, hy + 13); ctx.stroke();
  }
  if (o.beard) { ctx.fillStyle = shade(o.beard, 0); ctx.beginPath(); ctx.ellipse(side ? hx + r * .35 : hx + look * 4, hy + r * .78, side ? 12 : 16, 9, 0, 0, 6.28); ctx.fill(); }
}
function head(hx, hy, r, o) {
  const sil = o.sil;
  if (o.wear === 'hijab') {
    const hj = o.hijab;
    // kerudung: lingkar luar + juntaian sampai dada
    ctx.fillStyle = sil || hj;
    ctx.beginPath(); ctx.moveTo(hx - r - 9, hy);
    ctx.quadraticCurveTo(hx - r - 14, hy + r + 20, hx - r * .3, hy + r + 34);
    ctx.quadraticCurveTo(hx + r * .4, hy + r + 40, hx + r + 12, hy + r + 22);
    ctx.quadraticCurveTo(hx + r + 14, hy + 10, hx + r + 9, hy);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(hx, hy, r + 9, 0, 6.28); ctx.fill();
    if (!sil) {
      ctx.fillStyle = shade(hj, -.12); ctx.beginPath(); ctx.ellipse(hx + (o.side ? 6 : 0), hy + 3, r * .84, r * .92, 0, 0, 6.28); ctx.fill();
      ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(hx + (o.side ? 8 : 0), hy + 4, r * .76, r * .84, 0, 0, 6.28); ctx.fill();
      // kilau kain
      ctx.strokeStyle = shade(hj, .35); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, hy, r + 4, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
    }
    face(hx + (o.side ? 8 : 0), hy + 3, r * .8, o);
    return;
  }
  ctx.fillStyle = sil || SKIN; ctx.beginPath(); ctx.arc(hx, hy, r, 0, 6.28); ctx.fill();
  if (!sil) { ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.beginPath(); ctx.arc(hx + 4, hy + 4, r - 2, 0, 6.28); ctx.fill(); ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(hx - 1, hy - 1, r - 3, 0, 6.28); ctx.fill(); }
  face(hx, hy + 2, r, o);
  const w = o.wear;
  if (w === 'kopiah') {
    ctx.fillStyle = sil || o.capColor || '#FFFFFF';
    ctx.beginPath(); ctx.moveTo(hx - r * .86, hy - r * .42); ctx.lineTo(hx + r * .86, hy - r * .42); ctx.lineTo(hx + r * .76, hy - r * .95); ctx.quadraticCurveTo(hx, hy - r * 1.18, hx - r * .76, hy - r * .95); ctx.closePath(); ctx.fill();
    if (!sil) { ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 2; ctx.stroke(); }
  } else if (w === 'sorban') {
    ctx.fillStyle = sil || '#FBF7EE';
    ctx.beginPath(); ctx.ellipse(hx, hy - r * .55, r * 1.02, r * .62, 0, Math.PI * .98, Math.PI * 2.02); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx, hy - r * .48, r * 1.06, r * .3, 0, 0, 6.28); ctx.fill();
    if (!sil) { ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(hx, hy - r * (.6 + i * .18), r * (.95 - i * .12), r * .2, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); } }
    ctx.fillStyle = sil || '#FBF7EE'; ctx.beginPath(); ctx.moveTo(hx - r * .9, hy - r * .4); ctx.quadraticCurveTo(hx - r * 1.3, hy + r * .3, hx - r * 1.05, hy + r * .9); ctx.lineTo(hx - r * .75, hy + r * .2); ctx.closePath(); ctx.fill();
  } else if (w === 'helmet') {
    ctx.fillStyle = sil || '#8E96A3';
    ctx.beginPath(); ctx.ellipse(hx, hy - r * .35, r * 1.02, r * .85, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(hx - r * 1.04, hy - r * .4, r * 2.08, 8);
    ctx.beginPath(); ctx.moveTo(hx - 4, hy - r * 1.15); ctx.lineTo(hx, hy - r * 1.5); ctx.lineTo(hx + 4, hy - r * 1.15); ctx.fill();
    if (!sil) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(hx - r * .4, hy - r * .8, r * .25, r * .12, -.5, 0, 6.28); ctx.fill(); }
  }
}

// ---------- tokoh ----------
// o: pose stand|ruku|sujud|duduk, robe, wear, arms rest|fold|point|wave, costume rumah|zirah|pasar, sil (warna siluet)
function figure(x, y, s, o) {
  if (o.sil && o.rim && !o._off) {
    const off = document.createElement('canvas'); off.width = 700; off.height = 700;
    const prev = ctx; ctx = off.getContext('2d');
    figure(350, 600, s, { ...o, _off: 1 });
    ctx.globalCompositeOperation = 'source-atop';
    const g = ctx.createLinearGradient(350, 0, 350 + 90 * s, 0); g.addColorStop(0, 'rgba(255,200,110,0)'); g.addColorStop(.7, 'rgba(255,200,110,0)'); g.addColorStop(1, 'rgba(255,205,120,.85)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 700, 700);
    ctx = prev; ctx.drawImage(off, x - 350, y - 600); return;
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const robe = o.robe, sil = o.sil, fill = c => sil || c, r = 32;
  ctx.fillStyle = 'rgba(60,40,30,.16)'; ctx.beginPath(); ctx.ellipse(o.pose === 'sujud' ? -10 : o.pose === 'ruku' ? 20 : 0, 3, o.pose === 'sujud' ? 82 : 52, 8, 0, 0, 6.28); ctx.fill();
  const bodyFill = (path, grad = true) => {
    path();
    if (sil) { ctx.fillStyle = sil; ctx.fill(); }
    else {
      const g = ctx.createLinearGradient(-50, -100, 50, 0); g.addColorStop(0, shade(robe, .18)); g.addColorStop(1, shade(robe, -.1));
      ctx.fillStyle = grad ? g : robe; ctx.fill();
    }
  };
  const decorate = (path, top, bottom) => {
    if (sil || !o.costume) return;
    ctx.save(); path(); ctx.clip();
    if (o.costume === 'rumah') {
      // sarung kotak-kotak di bagian bawah
      ctx.fillStyle = '#7A2E3A'; ctx.fillRect(-120, bottom, 240, 200);
      ctx.strokeStyle = 'rgba(255,220,180,.35)'; ctx.lineWidth = 3;
      for (let i = -120; i < 120; i += 14) { ctx.beginPath(); ctx.moveTo(i, bottom); ctx.lineTo(i, 10); ctx.stroke(); }
      for (let j = bottom; j < 10; j += 12) { ctx.beginPath(); ctx.moveTo(-120, j); ctx.lineTo(120, j); ctx.stroke(); }
    } else if (o.costume === 'zirah') {
      ctx.strokeStyle = '#7F8794'; ctx.fillStyle = '#A5ADB9'; ctx.fillRect(-120, top, 240, bottom - top);
      ctx.lineWidth = 1.6;
      for (let j = top + 4; j < bottom; j += 7) for (let i = -120; i < 120; i += 8) { ctx.beginPath(); ctx.arc(i + (j % 14 ? 4 : 0), j, 3.6, 0, Math.PI); ctx.stroke(); }
      ctx.fillStyle = '#6B4A2F'; ctx.fillRect(-120, bottom - 4, 240, 9);
      ctx.fillStyle = '#D8B25A'; ctx.fillRect(-6, bottom - 5, 12, 11);
    } else if (o.costume === 'pasar') {
      ctx.fillStyle = '#F3E6CC'; ctx.beginPath(); ctx.roundRect(-20, top + 12, 40, bottom - top + 60, 10); ctx.fill();
      ctx.strokeStyle = '#C9A877'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, top + 40); ctx.lineTo(14, top + 40); ctx.stroke();
    }
    ctx.restore();
  };
  if (o.pose === 'stand') {
    [-14, 14].forEach(fx => { ctx.fillStyle = fill('#4A3428'); ctx.beginPath(); ctx.ellipse(fx, -2, 12, 6, 0, 0, 6.28); ctx.fill(); });
    const body = () => { ctx.beginPath(); ctx.moveTo(-30, -92); ctx.quadraticCurveTo(-36, -48, -42, -5); ctx.quadraticCurveTo(0, 5, 42, -5); ctx.quadraticCurveTo(36, -48, 30, -92); ctx.quadraticCurveTo(0, -106, -30, -92); ctx.closePath(); };
    bodyFill(body); decorate(body, -100, -46);
    if (!sil) { ctx.strokeStyle = shade(robe, -.18); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-38, -16); ctx.quadraticCurveTo(0, -8, 38, -16); ctx.stroke(); }
    if (o.costume === 'zirah') { // perisai di lengan kiri
      ctx.fillStyle = fill('#7A5232'); ctx.beginPath(); ctx.arc(-46, -54, 27, 0, 6.28); ctx.fill();
      if (!sil) { ctx.strokeStyle = '#B9C0C9'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#B9C0C9'; ctx.beginPath(); ctx.arc(-46, -54, 6, 0, 6.28); ctx.fill(); }
    }
    const arms = o.arms || 'rest';
    if (arms === 'rest') { sleeve(-28, -86, -38, -44, robe, SKIN, { sil }); if (o.costume !== 'zirah') sleeve(28, -86, 38, -44, robe, SKIN, { sil }); }
    if (arms === 'fold') { sleeve(-28, -86, -6, -62, robe, SKIN, { sil }); sleeve(28, -86, 6, -64, robe, SKIN, { sil }); }
    if (arms === 'point') { sleeve(-28, -86, -38, -44, robe, SKIN, { sil }); sleeve(28, -86, 66, -118, robe, SKIN, { sil, point: [9, -9] }); }
    if (arms === 'wave') { sleeve(-28, -86, -38, -44, robe, SKIN, { sil }); sleeve(28, -86, 50, -142, robe, SKIN, { sil }); if (!sil) { ctx.strokeStyle = INK; ctx.globalAlpha = .4; ctx.lineWidth = 2.5; [[64, -150], [68, -138]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a - 6, b, 8, -.7, .7); ctx.stroke(); }); ctx.globalAlpha = 1; } }
    if (arms === 'chest') { sleeve(-28, -86, -38, -44, robe, SKIN, { sil }); sleeve(28, -86, 2, -66, robe, SKIN, { sil }); }
    if (arms === 'lift') { // o.up 0..1: dari tangan turun ke sorak (o.target 'cheer') atau memegang di depan dada ('hold')
      const tg = o.target === 'hold' ? [16, -66] : [54, -138], u = o.up ?? 1;
      [-1, 1].forEach(sd => sleeve(sd * 28, -86, sd * (38 + (tg[0] - 38) * u), -44 + (tg[1] + 44) * u, robe, SKIN, { sil }));
    }
    if (arms === 'spear') { sleeve(28, -86, 40, -50, robe, SKIN, { sil }); ctx.strokeStyle = fill('#6B4A2F'); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(42, 4); ctx.lineTo(42, -190); ctx.stroke(); ctx.fillStyle = fill('#B9C0C9'); ctx.beginPath(); ctx.moveTo(35, -186); ctx.lineTo(42, -214); ctx.lineTo(49, -186); ctx.fill(); ctx.fillStyle = fill(SKIN); ctx.beginPath(); ctx.arc(41, -52, 8, 0, 6.28); ctx.fill(); }
    if (arms === 'basket') {
      sleeve(-28, -86, -38, -44, robe, SKIN, { sil }); sleeve(28, -86, 46, -56, robe, SKIN, { sil });
      ctx.fillStyle = fill('#B07A45'); ctx.beginPath(); ctx.moveTo(30, -60); ctx.lineTo(84, -60); ctx.lineTo(76, -30); ctx.lineTo(38, -30); ctx.closePath(); ctx.fill();
      if (!sil) { ['#E2563F', '#F2B134', '#7CB342', '#E2563F'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(40 + i * 12, -64, 8, 0, 6.28); ctx.fill(); }); ctx.strokeStyle = '#8A5A2E'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(34 + i * 2, -50 + i * 8); ctx.lineTo(80 - i * 2, -50 + i * 8); ctx.stroke(); } }
      ctx.fillStyle = fill(SKIN); ctx.beginPath(); ctx.arc(46, -56, 7.5, 0, 6.28); ctx.fill();
    }
    head(0, -130, r, { ...o, look: o.look ?? 0 });
  } else if (o.pose === 'ruku') {
    [[-8, 0], [12, 0]].forEach(([fx]) => { ctx.fillStyle = fill('#4A3428'); ctx.beginPath(); ctx.ellipse(fx + 6, -2, 12, 6, 0, 0, 6.28); ctx.fill(); });
    const body = () => {
      ctx.beginPath(); ctx.moveTo(-26, -74); ctx.quadraticCurveTo(-30, -36, -32, -5); ctx.quadraticCurveTo(0, 5, 32, -5); ctx.quadraticCurveTo(26, -36, 24, -56);
      ctx.quadraticCurveTo(48, -52, 70, -58); ctx.quadraticCurveTo(84, -76, 66, -94); ctx.quadraticCurveTo(10, -104, -16, -96); ctx.quadraticCurveTo(-32, -90, -26, -74); ctx.closePath();
    };
    bodyFill(body); decorate(body, -110, -40);
    sleeve(54, -74, 22, -36, robe, SKIN, { sil });
    ctx.save(); ctx.translate(98, -76); ctx.rotate(.45); head(0, 0, r, { ...o, side: 1 }); ctx.restore();
  } else if (o.pose === 'sujud') {
    ctx.fillStyle = fill('#4A3428'); ctx.beginPath(); ctx.ellipse(-78, -5, 7, 8, 0, 0, 6.28); ctx.fill();
    const body = () => {
      ctx.beginPath(); ctx.moveTo(-76, -2); ctx.quadraticCurveTo(-82, -62, -46, -70); ctx.quadraticCurveTo(-8, -76, 22, -48);
      ctx.quadraticCurveTo(38, -26, 34, -2); ctx.quadraticCurveTo(-20, 6, -76, -2); ctx.closePath();
    };
    bodyFill(body); decorate(body, -90, -30);
    if (!sil) { ctx.strokeStyle = shade(robe, -.16); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-40, -6); ctx.quadraticCurveTo(-50, -30, -36, -48); ctx.stroke(); }
    // kepala menempel di lantai; dahi ke bawah
    ctx.save(); ctx.translate(58, -29); ctx.rotate(1.25); head(0, 0, 28, { ...o, side: 1, closed: true }); ctx.restore();
    sleeve(14, -42, 28, -7, robe, SKIN, { sil });
    ctx.fillStyle = fill(SKIN); ctx.beginPath(); ctx.ellipse(32, -5, 10, 5, 0, 0, 6.28); ctx.fill();
  } else if (o.pose === 'duduk') {
    ctx.fillStyle = fill('#4A3428'); ctx.beginPath(); ctx.ellipse(-48, -4, 8, 6, 0, 0, 6.28); ctx.fill();
    const body = () => {
      ctx.beginPath(); ctx.moveTo(-44, -2); ctx.quadraticCurveTo(-48, -52, -26, -88); ctx.quadraticCurveTo(0, -100, 26, -88);
      ctx.quadraticCurveTo(34, -52, 56, -24); ctx.quadraticCurveTo(64, -4, 50, -2); ctx.quadraticCurveTo(0, 6, -44, -2); ctx.closePath();
    };
    bodyFill(body); decorate(body, -100, -40);
    if (!sil) { ctx.strokeStyle = shade(robe, -.16); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -34); ctx.quadraticCurveTo(26, -38, 54, -20); ctx.stroke(); }
    sleeve(22, -82, 36, -36, robe, SKIN, { sil });
    head(4, -122, r, { ...o, look: .6 });
  }
  ctx.restore();
}

