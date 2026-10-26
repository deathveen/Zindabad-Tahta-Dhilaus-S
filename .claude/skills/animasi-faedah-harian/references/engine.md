# Mesin animasi: rujukan cepat

Halaman episode memuat skrip dengan urutan berikut:
1. `karakter/karakter.js`
2. `branding/brand.js`
3. `vo_env.js`
4. blok konstanta (`W, H, SS, VO_END, DURATION, ctx, NT`)
5. `engine/lib.js`
6. blok naskah dan adegan, diakhiri `exportEpisode()`

Koordinat logis kanvas 720×1280, dirender 1,5× ke 1080×1920. Semua fungsi menggambar ke `ctx`
global. Waktu `T` dalam detik VO.

## Isi tetap dari `draw(T)` (tidak perlu ditulis ulang)

- **Kamera:** melayang pelan, dengan zoom 1,03.
- **Transisi:** zoom-blur 0,35 detik di setiap batas `SCENES`.
- **Caption:** muncul per kata dengan efek pegas; `*kata*` menjadi kata berwarna amber.
- **Watermark:** `faedahharian.official` di pojok kiri atas, sampai VO selesai.
- **Lain-lain:** fade masuk dan keluar, vinyet, serta `drawOverlay(T)` bila didefinisikan.

## Karakter

### `drawDafa(x, groundY, skala, o)`: tokoh utama (kaos toska, sarung, kopiah hitam)

| Opsi | Arti |
|---|---|
| `t` | waktu, untuk kedipan mata |
| `mood` | -1 sedih … 1 senang |
| `look` | -1 … 1, arah lirikan |
| `sad` | 0..1, alis sedih |
| `squash` | efek mengempis/memanjang saat melompat atau kaget |
| `tint` | 0..1, menggelapkan (malam/murung) |
| `leaf` | 0..1, tunas di kepala (tanda "pelajaran") |
| `talk` | 0..1, mulut terbuka |
| `arms` | `rest`, `fold` (bersedekap), `point`, `wave`, `chest` (tangan di dada), `lift` + `up` 0..1 + `target: 'cheer'` (tangan terangkat) atau `'hold'` (memegang di depan dada) |

Skala sekitar 0,92–0,95 dengan tanah di y ≈ 880.

### `drawRifda(x, groundY, skala, o)`: narator

| Opsi | Arti |
|---|---|
| `arms` | `fold`, `point`, `wave`, `chest` |
| `talk` | isi dengan `talkVO(T)` agar mulut mengikuti VO |
| `look`, `mood` | sama seperti Dafa |
| `label` | 0..1, kapsul nama رِفْدَة di bawah kaki |

`rifdaCorner(T, mulai, selesai, arms)` menampilkan Rifda masuk di pojok kiri bawah (x=92,
tanah 905, skala 0,82), dengan label sesaat lalu keluar. Pas untuk kartu dalil.

Untuk menghadap ke kiri, cerminkan:
`ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); drawRifda(0, 0, s, {...}); ctx.restore();`

### `figure(x, groundY, skala, o)`: tokoh umum gaya B (dari karakter.js)

| Opsi | Nilai |
|---|---|
| `pose` | `stand`, `ruku`, `sujud`, `duduk` (pose samping menghadap kanan) |
| `robe` | warna jubah |
| `wear` | `kopiah` (+ `capColor`), `sorban`, `helmet`, `hijab` (+ `hijab` warna) |
| `costume` | `rumah` (kaos + sarung), `zirah`, `pasar` |
| `arms` | semua pilihan di atas, plus `spear` dan `basket` |
| lainnya | `beard`, `mood`, `look`, `talk` |
| `sil` + `rim: 1` | siluet berwarna dengan cahaya tepi; **wajib untuk sahabat atau orang saleh terdahulu** |

Pose shalat:
- `figure(..., { pose: 'sujud', robe: '#5FA8A0', wear: 'kopiah', capColor: '#2B2B33', costume: 'rumah' })`.
- Untuk duduk tasyahud dengan tasbih, lihat `S_istighfar` di ep02.

## Teks

| Fungsi | Kegunaan |
|---|---|
| `headline(kecil, [baris besar...], T, mulai, selesai(0 = terus), { y, size, bigColor, smallColor })` | judul berjenjang. Di latar terang pakai `bigColor: B.daunGelap, smallColor: '#7A6A5C'` |
| `footnote(teks atau [baris], T, mulai, selesai, y=1188)` | sumber kecil di bawah |
| `dalilCard(T, mulai, 'HEADER', [baris Arab], [baris terjemahan], 'sumber', { y, h, arabSize, bg })` | kartu ayat/hadis. Font Arab FreeSerif. `bg` gelap pekat (misalnya `'rgba(16,20,52,.94)'`) bila di belakangnya ada benda lain |

## Latar dan efek

| Fungsi | Kegunaan |
|---|---|
| `sky([[0, warna], [1, warna]])` | latar gradien |
| `twinkle(T, alpha)` | bintang berkelip |
| `hills([{ y, a, f, p, c }...], T)` | bukit berlapis |
| `grass(T, y, warna)` | rumput |
| `particles(T, warna, n, seed, naik)` | partikel melayang |
| `rays(cx, cy, r0, r1, n, alpha, '255,236,180', rotasi)` | sinar cahaya |
| `drawStar(x, y, r, rot, alpha, glow, warna)` | bintang |
| `sajadah(x, y, lebar)` | sajadah |
| `cardBg(T)` | latar kartu ungu |
| Dari brand.js | `sprout(x, y, s, warnaBatang, warnaDaun)`, `sunrise(x, y, r, warna)`, `iconA/iconB(x, y, R)`, `pill(label, warna, ikon, x, y, s)` |

Utilitas lain:
- **Waktu:** `prog(T, a, b)` (0..1), `easeOut`, `easeIn`, `easeInOut`, `backOut` (melenting).
- **Angka dan warna:** `lerp`, `clamp`, `mix(warnaA, warnaB, k)`, `mixRgb`, `rng(seed)`.

## Adegan dan susunan

```js
function S_contoh(T) { sky(...); /* gambar dengan waktu T */ }
const SCENES = [[0, S_hook], [5.24, S_contoh], ..., [VO_END, S_outro]];
function drawOverlay(T) { /* opsional: HUD di atas semua adegan, misalnya gembok progres */ }
```

Setiap fungsi adegan bisa dipanggil sedikit sebelum atau sesudah rentangnya (selama transisi),
jadi gunakan `prog()` yang otomatis ter-clamp. `S_outro` (kartu follow bersama Rifda) sudah
tersedia; biarkan menjadi adegan terakhir di `VO_END`.

## Tipe SFX (`sfxEvents()` → `audio.py`)

| Kelompok | Tipe |
|---|---|
| Teks dan transisi | `title`, `whoosh`, `whoosh_soft`, `riser` (otomatis naik sampai `end_hit`/`door_open` berikutnya) |
| Benda | `place` (`k` = 1..5 nada naik), `set_down`, `step`, `fall`, `fall_short`, `impact`, `clank`, `bar` (`i`) |
| Cahaya dan ajaib | `star` (`i`), `rise` (`i`), `return` (`i`), `sprout`, `leaf_fly`, `leaf_on`, `balance`, `end_hit`, `door_open` |
| Suasana | `sting` (sumbang/sedih), `eyes`, `alert`, `alarm`, `smudge` (noda gelap), `unlock` (gembok terbuka) |

Contoh: `add(t, 'unlock')` atau `add(t, 'place', { k: 3 })`. Denting otomatis memakai
pentatonik A minor saat musiknya `pad`.

## Audio

`audio.py events.json pad mix.wav vo.mp3` akan:
- membersihkan VO secara ringan (highpass, denoise, de-esser, kompresi; nada tidak diubah),
- membuat musik instrumental Am–F–C–G yang mengecil saat VO berbicara,
- menambahkan SFX dengan sedikit gema.

`finalize.sh` lalu menyetel kerasnya ke -14 LUFS.
