// Elemen brand Faedah Harian: warna, tunas, matahari pagi, logo A/B, wordmark, label pilar.
// Butuh ../karakter/karakter.js (fungsi head, shade) dan variabel global ctx.
const B = {
  daun: '#4E8B5F', daunGelap: '#234536', krem: '#FBF5EA', fajar: '#F2B544',
  pink: '#F29BB8', ungu: '#B9A6E0', tinta: '#2A2233', abu: '#7A6A5C',
};
const HANDLE = '@faedahharian.official';

// ---------- elemen brand ----------
function sprout(x, y, s, color = B.daun, leafColor) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-2, -22, 0, -38); ctx.stroke();
  ctx.fillStyle = leafColor || color;
  ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(-34, -40, -36, -64); ctx.quadraticCurveTo(-8, -64, 0, -30); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -38); ctx.quadraticCurveTo(30, -50, 40, -78); ctx.quadraticCurveTo(8, -82, 0, -38); ctx.fill();
  ctx.restore();
}
function sunrise(x, y, r, color = B.fajar) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = r * .09; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const a = Math.PI + (i + .5) * Math.PI / 7; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 1.22, y + Math.sin(a) * r * 1.22); ctx.lineTo(x + Math.cos(a) * r * 1.45, y + Math.sin(a) * r * 1.45); ctx.stroke(); }
  ctx.restore();
}
// Logo A: tunas tumbuh di depan matahari pagi
function iconA(x, y, R, bg = B.krem) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 6.28); ctx.fillStyle = bg; ctx.fill(); ctx.clip();
  sunrise(x, y + R * .28, R * .42);
  ctx.fillStyle = B.daun; ctx.fillRect(x - R, y + R * .28, R * 2, R);
  ctx.fillStyle = shade(B.daun, -.2); ctx.beginPath(); ctx.ellipse(x, y + R * .28, R * .5, R * .07, 0, 0, 6.28); ctx.fill();
  sprout(x, y + R * .28, R / 70, B.daunGelap, '#7BC46F');
  ctx.restore();
}
// Logo B: kepala Rifda dengan daun di kerudung
function iconB(x, y, R, bg = B.daun) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 6.28); ctx.fillStyle = bg; ctx.fill(); ctx.clip();
  ctx.fillStyle = shade(bg, .12); ctx.beginPath(); ctx.arc(x, y + R * 1.25, R * 1.05, 0, 6.28); ctx.fill();
  const s = R / 82;
  ctx.translate(x, y + R * .2); ctx.scale(s, s);
  ctx.fillStyle = B.ungu; ctx.beginPath(); ctx.ellipse(0, 78, 62, 40, 0, Math.PI, 0); ctx.fill();
  head(0, 0, 34, { wear: 'hijab', hijab: B.pink, mood: 1 });
  sprout(10, -40, .55, '#2F6B4F', '#8BD17C');
  ctx.restore();
}
function wordmark(x, y, size, opts = {}) {
  ctx.save(); ctx.textAlign = opts.align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `900 ${size}px Inter`; ctx.fillStyle = opts.c1 || B.daunGelap; ctx.letterSpacing = `${-size * .02}px`;
  ctx.fillText('faedah', x, y);
  ctx.font = `600 ${size}px Inter`; ctx.fillStyle = opts.c2 || B.daun;
  ctx.fillText('harian', x, y + size * .95);
  ctx.restore();
}
function pillIcon(kind, x, y, s, color = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'kunci') { ctx.beginPath(); ctx.arc(-6, 0, 7, 0, 6.28); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(13, 0); ctx.moveTo(9, 0); ctx.lineTo(9, 5); ctx.moveTo(13, 0); ctx.lineTo(13, 5); ctx.stroke(); }
  if (kind === 'timbangan') { ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.moveTo(-7, 10); ctx.lineTo(7, 10); ctx.moveTo(-12, -6); ctx.lineTo(12, -6); ctx.stroke(); [-12, 12].forEach(px => { ctx.beginPath(); ctx.arc(px, 0, 5, 0, Math.PI); ctx.stroke(); }); }
  if (kind === 'hati') { ctx.beginPath(); ctx.moveTo(0, 9); ctx.bezierCurveTo(-16, -2, -8, -14, 0, -6); ctx.bezierCurveTo(8, -14, 16, -2, 0, 9); ctx.fill(); }
  if (kind === 'buku') { ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(-8, -10, -14, -7); ctx.lineTo(-14, 8); ctx.quadraticCurveTo(-8, 5, 0, 9); ctx.quadraticCurveTo(8, 5, 14, 8); ctx.lineTo(14, -7); ctx.quadraticCurveTo(8, -10, 0, -6); ctx.lineTo(0, 9); ctx.stroke(); }
  if (kind === 'otak') {
    [-1, 1].forEach(d => { ctx.beginPath(); ctx.ellipse(d * 5, 0, 7.5, 9, 0, 0, 6.28); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 9); ctx.moveTo(-9, -1); ctx.quadraticCurveTo(-6, 2, -3, -1); ctx.moveTo(3, 2); ctx.quadraticCurveTo(6, -1, 9, 2); ctx.stroke();
  }
  if (kind === 'keluarga') { ctx.beginPath(); ctx.arc(-6, -6, 5, 0, 6.28); ctx.arc(8, -1, 3.5, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(-6, 8, 7, 6, 0, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.ellipse(8, 9, 5, 4.5, 0, Math.PI, 0); ctx.fill(); }
  ctx.restore();
}
function pill(label, color, icon, x, y, s = 1) {
  ctx.save(); ctx.font = `800 ${16 * s}px Inter`; ctx.letterSpacing = `${2 * s}px`;
  const w = ctx.measureText(label).width + 62 * s;
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, 38 * s, 19 * s); ctx.fill();
  pillIcon(icon, x + 22 * s, y + 19 * s, s * .85);
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 42 * s, y + 20 * s);
  ctx.restore(); return w;
}

