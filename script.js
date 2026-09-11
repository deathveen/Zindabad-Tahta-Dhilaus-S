/**
 * ==========================================================
 * ZINDA
 * Kitab mengorbit sosoknya. Ketuk kitab: satu lembar, isinya
 * tentang apa. Ketuk sosoknya: nama panjangnya. Selesai.
 * Data ada di data.js (BOOKS_DATA, PROFILE_DATA).
 * ==========================================================
 */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- State ---------- */
let nodes = [];
let activeCategory = "all";
let focus = { x: 0, y: 0 };
let seeded = false;
let lastFocused = null;
let sheetOpen = false;   // keadaan sebenarnya, bukan ditebak dari el.sheet.hidden
let hideTimer = null;    // jadwal penyembunyian; harus bisa dibatalkan
let hovered = null;   // kitab yang sedang disentuh: auranya sedikit menyala

const el = {
  stage:  document.getElementById("stage"),
  books:  document.getElementById("books"),
  figure: document.getElementById("figure"),
  fx:     document.getElementById("fx"),
  dock:   document.getElementById("dock"),
  sheet:  document.getElementById("sheet"),
  scrim:  document.getElementById("scrim"),
  body:   document.getElementById("sheetBody"),
  close:  document.getElementById("sheetClose")
};

const ctx = el.fx.getContext("2d");

/* warna aura: cahaya hangat, arah grading emas — bukan emas sebagai teks */
const AURA = "200, 162, 74";

/* ==========================================================
   TATA LETAK — satu titik pusat, kitab melingkarinya
   ========================================================== */
function stageSize() {
  return { w: el.stage.clientWidth, h: el.stage.clientHeight };
}

function isNarrow() {
  return window.innerWidth <= 900;
}

// setengah ukuran punggung kitab, dipakai untuk menaruh titik pusatnya
let spineHalf = { w: 13, h: 48 };
function measureSpine() {
  spineHalf = isNarrow() ? { w: 11, h: 38 } : { w: 13, h: 48 };
}

function computeTargets() {
  const { w, h } = stageSize();
  if (!w || !h) return;               // panggung belum punya ukuran

  focus.x = w / 2;
  focus.y = h / 2;

  const visible = nodes.filter(n => n.visible);
  if (!visible.length) return;

  // batas elips: sisakan margin supaya kitab tidak terpotong tepi layar,
  // dan jangan terlalu memanjang di layar lebar
  const maxRy = Math.max(84, h / 2 - spineHalf.h - 16);
  const maxRx = Math.max(96, Math.min(w / 2 - spineHalf.w - 16, maxRy * 1.7));

  // jarak aman: punggung kitab berhenti di luar kotak sosoknya
  const figW = el.figure.offsetWidth || 220;
  const figH = el.figure.offsetHeight || 290;
  const clearX = Math.min(figW * 0.56 + spineHalf.w + 26, maxRx * 0.86);
  const clearY = Math.min(figH * 0.56 + spineHalf.h + 8, maxRy * 0.88);

  const at = (t, lo, hi) => lo + (hi - lo) * t;
  const start = -Math.PI / 2;

  if (visible.length > 12) {
    /* Banyak kitab: sebar rata menurut panjang busur, lalu selang-seling
       tiga kedalaman. Tetangga selalu beda lajur, jadi di layar pendek pun
       punggung kitab tidak saling tindih. */
    const lanes = [1, 0.56, 0.14];
    const angles = arcAngles(visible.length, (clearX + maxRx) / 2, (clearY + maxRy) / 2);
    const drifts = [0.00038, -0.00030, 0.00044];

    visible.forEach((n, k) => {
      const lane = k % lanes.length;
      n.angle = start + angles[k];
      n.rx = at(lanes[lane], clearX, maxRx);
      n.ry = at(lanes[lane], clearY, maxRy);
      n.drift = drifts[lane];
    });
  } else {
    // satu fan ilmu: satu cincin penuh, lebih lega
    const t = visible.length > 6 ? 0.9 : 0.55;
    const angles = arcAngles(visible.length, at(t, clearX, maxRx), at(t, clearY, maxRy));
    visible.forEach((n, k) => {
      n.angle = start + angles[k];
      n.rx = at(t, clearX, maxRx);
      n.ry = at(t, clearY, maxRy);
      n.drift = 0.00044;
    });
  }

  visible.forEach(place);

  /* Ukuran panggung baru bisa dipercaya setelah tata letak pertama berhasil.
     Di situ juga kitab ditaruh: mulai dari pusat, lalu mengembang keluar. */
  if (!seeded) {
    seeded = true;
    nodes.forEach(n => {
      n.x = REDUCED ? n.tx : focus.x;
      n.y = REDUCED ? n.ty : focus.y;
    });
  }
}

function place(n) {
  n.tx = focus.x + Math.cos(n.angle) * n.rx;
  n.ty = focus.y + Math.sin(n.angle) * n.ry;
}

/**
 * Sudut yang jaraknya rata di sepanjang keliling elips — bukan rata
 * menurut sudut. Di elips lonjong, sudut yang sama besar menghasilkan
 * jarak yang jauh berbeda antara sisi panjang dan ujungnya.
 */
function arcAngles(count, rx, ry) {
  const steps = 720;
  const cum = [0];
  let total = 0;

  for (let i = 1; i <= steps; i++) {
    const a0 = ((i - 1) / steps) * Math.PI * 2;
    const a1 = (i / steps) * Math.PI * 2;
    total += Math.hypot(rx * (Math.cos(a1) - Math.cos(a0)),
                        ry * (Math.sin(a1) - Math.sin(a0)));
    cum.push(total);
  }

  const out = [];
  for (let k = 0; k < count; k++) {
    const target = (total * (k + 0.5)) / count;
    let lo = 0, hi = steps;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < target) lo = mid + 1; else hi = mid;
    }
    out.push((lo / steps) * Math.PI * 2);
  }
  return out;
}

/* ==========================================================
   BANGUN PUNGGUNG KITAB
   ========================================================== */
function buildBooks() {
  const frag = document.createDocumentFragment();

  nodes = BOOKS_DATA.map(book => {
    const node = document.createElement("button");
    node.className = "spine";
    node.dataset.id = book.id;
    node.setAttribute("aria-label", book.title);
    node.innerHTML = `<span class="spine-label">${esc(book.shortTitle || book.title)}</span>`;
    frag.appendChild(node);

    return {
      book, node,
      x: 0, y: 0, tx: 0, ty: 0,
      angle: 0, rx: 200, ry: 200, drift: 0.0004,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0006 + Math.random() * 0.0004,
      visible: true,
      alpha: 0
    };
  });

  el.books.appendChild(frag);
  measureSpine();
  computeTargets();
}

/* ==========================================================
   FILTER
   ========================================================== */
function setCategory(cat) {
  if (cat === activeCategory) return;
  activeCategory = cat;

  document.querySelectorAll(".chip").forEach(c => {
    const on = c.dataset.category === cat;
    c.classList.toggle("is-active", on);
    c.setAttribute("aria-pressed", String(on));
    if (on) c.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", inline: "center", block: "nearest" });
  });

  nodes.forEach(n => {
    n.visible = cat === "all" || n.book.category === cat;
    n.node.classList.toggle("is-dimmed", !n.visible);
    n.node.tabIndex = n.visible ? 0 : -1;
  });

  computeTargets();
}

/* ==========================================================
   LOOP — hanyut pelan, plus satu benang cahaya per kitab
   ========================================================== */
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { w, h } = stageSize();
  el.fx.width = w * dpr;
  el.fx.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function frame(t) {
  const { w, h } = stageSize();
  ctx.clearRect(0, 0, w, h);

  for (const n of nodes) {
    if (!REDUCED && n.visible) {
      n.angle += n.drift;
      place(n);
    }

    const bob = REDUCED ? 0 : Math.sin(t * n.speed + n.phase) * 5;

    n.x += (n.tx - n.x) * 0.055;
    n.y += (n.ty + bob - n.y) * 0.055;

    const targetAlpha = n.visible ? 1 : 0.1;
    n.alpha += (targetAlpha - n.alpha) * 0.09;

    n.node.style.transform =
      `translate3d(${n.x - spineHalf.w}px, ${n.y - spineHalf.h}px, 0)`;
    n.node.style.opacity = n.alpha.toFixed(3);

    if (n.alpha > 0.25) drawAura(n, t);
  }

  requestAnimationFrame(frame);
}

/**
 * Satu benang setipis rambut dari punggung kitab ke arah sosoknya:
 * gelap di sisi kitab, menyala di ujung yang masuk ke dia. Benangnya
 * berhenti sebelum menyentuh badan, dan satu butir cahaya merayap masuk.
 */
function drawAura(n, t) {
  const dx = focus.x - n.x;
  const dy = focus.y - n.y;
  const dist = Math.hypot(dx, dy) || 1;

  const inner = Math.min(dist * 0.46, 132);
  const ex = focus.x - (dx / dist) * inner;
  const ey = focus.y - (dy / dist) * inner;

  const lit = n === hovered ? 2.4 : 1;
  const a = 0.13 * n.alpha * lit;

  const grad = ctx.createLinearGradient(n.x, n.y, ex, ey);
  grad.addColorStop(0, `rgba(${AURA}, 0)`);
  grad.addColorStop(1, `rgba(${AURA}, ${a.toFixed(3)})`);

  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(n.x, n.y);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  if (REDUCED) return;

  // butir cahaya: kitab -> sosoknya, sekali lewat tiap belasan detik
  const p = (t * 0.00013 + n.phase * 0.159) % 1;
  const px = n.x + (ex - n.x) * p;
  const py = n.y + (ey - n.y) * p;

  ctx.fillStyle = `rgba(${AURA}, ${(0.34 * n.alpha * lit * p).toFixed(3)})`;
  ctx.beginPath();
  ctx.arc(px, py, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

/* ==========================================================
   LEMBAR
   ========================================================== */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* kitab: judulnya, lalu tentang apa. Tidak ada baris data lain. */
function openBook(id, trigger) {
  const book = BOOKS_DATA.find(b => b.id === id);
  if (!book) return;

  el.sheet.classList.remove("is-name");
  el.body.innerHTML = `
    <h2 class="sheet-title" id="sheetTitle">${esc(book.title)}</h2>
    <p class="sheet-desc">${esc(book.desc)}</p>
  `;
  showSheet(trigger);
}

/* sosoknya: nama panjang saja. */
function openName() {
  el.sheet.classList.add("is-name");
  el.body.innerHTML = `
    <p class="sheet-name" id="sheetTitle">${esc(PROFILE_DATA.fullName || PROFILE_DATA.name)}</p>
  `;
  showSheet(el.figure);
}

function showSheet(trigger) {
  /* Penutupan sebelumnya menyembunyikan lembar 220ms setelah diminta. Kalau
     lembar dibuka lagi di dalam jendela itu, jadwal lama harus dibatalkan -
     kalau tidak, dia menyembunyikan lembar yang baru saja dibuka. */
  clearTimeout(hideTimer);
  sheetOpen = true;
  lastFocused = trigger || document.activeElement;
  el.sheet.hidden = false;
  el.scrim.hidden = false;
  void el.sheet.offsetWidth;   // paksa reflow: transisinya tidak menunggu frame
  el.sheet.classList.add("is-open");
  el.scrim.classList.add("is-open");
  el.close.focus();
}

function closeSheet() {
  if (!sheetOpen) return;
  sheetOpen = false;   // langsung, tidak menunggu animasinya selesai
  el.sheet.classList.remove("is-open");
  el.scrim.classList.remove("is-open");
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { el.sheet.hidden = true; el.scrim.hidden = true; }, 220);
  if (lastFocused && lastFocused.isConnected) lastFocused.focus();
}

/* lembar cuma punya satu tombol, jadi fokus dikunci di situ */
function trapTab(e) {
  if (e.key !== "Tab" || !sheetOpen) return;
  e.preventDefault();
  el.close.focus();
}

/* ==========================================================
   EVENT
   ========================================================== */
function setupEvents() {
  el.books.addEventListener("click", e => {
    const spine = e.target.closest(".spine");
    if (!spine) return;
    openBook(spine.dataset.id, spine);
  });

  // kitab yang disentuh: auranya ikut menyala
  el.books.addEventListener("pointerover", e => {
    const spine = e.target.closest(".spine");
    hovered = spine ? nodes.find(n => n.node === spine) : null;
  });
  el.books.addEventListener("pointerout", e => {
    if (e.target.closest(".spine")) hovered = null;
  });

  el.figure.addEventListener("click", openName);

  el.dock.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    // ketuk fan yang sedang aktif untuk kembali melihat semuanya
    setCategory(chip.classList.contains("is-active") ? "all" : chip.dataset.category);
  });

  el.close.addEventListener("click", closeSheet);
  el.scrim.addEventListener("click", closeSheet);

  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && sheetOpen) closeSheet();
    trapTab(e);
  });

  const img = document.getElementById("figureImg");
  const markLoaded = () => img.classList.add("is-loaded");
  /* .figure-img mulai dari opacity:0 dan hanya .is-loaded yang menampilkannya.
     Kalau gambarnya gagal dimuat, "load" tidak pernah berbunyi - tanpa cabang
     "error" di bawah, pusat halaman jadi kosong selamanya. img.complete di
     sini sengaja tidak lagi memeriksa naturalWidth: gambar yang sudah gagal
     pun harus ditampilkan, supaya alt-nya terlihat, bukan lubang kosong. */
  if (img.complete) markLoaded();
  img.addEventListener("load", markLoaded);
  img.addEventListener("error", markLoaded);

  // ResizeObserver menangkap perubahan ukuran panggung, bukan cuma window
  let rt;
  const relayout = () => {
    clearTimeout(rt);
    rt = setTimeout(() => { resizeCanvas(); measureSpine(); computeTargets(); }, 120);
  };
  window.addEventListener("resize", relayout);
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(el.stage);
}

/* ==========================================================
   BOOT
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  buildBooks();
  resizeCanvas();
  setupEvents();
  // tidak ada chip "Semua": awalnya semua kitab tampil, tidak ada chip yang aktif
  document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", "false"));
  requestAnimationFrame(frame);
});
