---
name: animasi-faedah-harian
description: Membuat video animasi Reels/TikTok vertikal (1080×1920) untuk akun Instagram Faedah Harian (@faedahharian.official) dari VO dan naskah. Mencakup transkripsi VO, verifikasi dalil, storyboard, animasi karakter gaya B (Dafa, Rifda si narator berkerudung pink), caption sinkron dengan suara, musik instrumental + SFX, kartu follow, dan cover Reels. Gunakan skill ini setiap kali pengguna mengirim VO/rekaman suara/audio Reels untuk dijadikan video, minta "buat animasi", "bikin reels", "video faedah harian", episode baru, atau revisi episode yang sudah ada di folder video/, meskipun tidak menyebut nama skill ini.
---

# Animasi Faedah Harian

Skill ini mengubah **VO** (biasanya suara Vonya) menjadi video animasi siap unggah untuk akun
**Faedah Harian · Ilmu Islam Sehari-hari**. Semua keputusan gaya, karakter, adab, dan branding
sudah tercatat di `video/SOP.md`. Baca SOP itu sekali di awal sesi, karena itu yang membuat
video konsisten sebagai satu seri.

**Rujukan baku: `video/ep05/` ("Jembatan Kewajiban")**, episode yang dinilai pemilik akun paling
bagus. Tiru polanya: VO 1,25× tanpa jeda panjang, **hook yang nendang** (boom, getar, kilat, cap,
"KOK BISA?"), satu perumpamaan utama, contoh nyata dengan dalil, penutup dengan ajakan komentar,
dan kartu follow saat Vonya mengajak follow. `new_episode.py` sudah membuat kerangka berpola ep05.
Episode lama (`ep02`–`ep04`) jangan diubah; ep02 masih memakai salinan mesin lamanya sendiri.

## Bahan yang dibutuhkan

- **File VO** (mp3/m4a/wav/WhatsApp, apa pun).
- **Teks naskah** bila ada. Kalau tidak ada, transkripsi sendiri (Tahap 1).
- **Musik** opsional. Tanpa file musik, pakai musik instrumental buatan `audio.py` (`pad`).

## Alur kerja

Kerjakan berurutan. Titik persetujuan ada di Tahap 3 (storyboard) dan Tahap 7 (hasil render).
Pemilik akun biasanya meminta **langsung dianimasikan** ("gas", "lalu animasikan"): kalau begitu,
lewati penantian di Tahap 3 dan sertakan storyboard sebagai tabel alur saat menyerahkan hasil.
Tetap berhenti dan bertanya bila ada keraguan dalil (Tahap 2).

### Tahap 0: Jernihkan, percepat VO 1,25×, dan potong jeda sunyi

Pemilik akun ingin suara Vonya **dijernihkan** dan tempo VO **1,25×** untuk semua episode (sejak ep05; ep03–ep04 masih 1,2×).
Lakukan ini paling awal, sebelum transkripsi, lalu pakai file hasilnya (bukan VO asli) di semua tahap berikutnya:

```bash
.claude/skills/animasi-faedah-harian/scripts/prep_vo.sh vo_asli.ogg vo.wav   # default 1.25
```

Penjernih: perbaiki bagian yang pecah atau "kresek" karena clipping (`declip.py`), buang dengung rendah, kurangi desis, redam
"s" tajam, perjelas suara, ratakan volume, dan heningkan jeda. `atempo` hanya mengubah
kecepatan, nada suara Vonya tetap (SOP Bagian 4, Tahap 2). `--mentah` sebagai argumen keempat
melewati penjernih. Terakhir, jeda sunyi lebih dari 0,45 detik dipendekkan menjadi 0,28 detik
(`potong_jeda.py`, dengan crossfade) supaya tempo rapat; napas pendek antarkata tidak disentuh.
`--utuh` melewati pemotongan jeda. Simpan
`vo.wav` di scratchpad, jangan di repo. Kalau pemilik akun minta kecepatan lain, isi argumen
ketiga (misalnya `1.0` untuk tempo asli).

### Tahap 1: Dengarkan VO (lewat transkripsi)

Claude tidak bisa mendengar audio. **Jangan pernah menyimpulkan isi audio dari analisis
ketukan atau volume saja.** Pernah terjadi: sebuah VO dikira musik instrumental, lalu
animasinya tidak nyambung sama sekali dengan isinya. Selalu transkripsi dulu:

```bash
python3 -I .claude/skills/animasi-faedah-harian/scripts/transcribe.py vo.wav transkrip.json
python3 -I .claude/skills/animasi-faedah-harian/scripts/jeda.py vo.wav     # titik jeda untuk caption
```

- Unduhan model Whisper medium sekitar 1,9 GB, sekali saja, dari GitHub (tembus jaringan cloud).
- Transkripsi berjalan sekitar 3 menit untuk VO 90 detik.
- Potongan default 5–10 detik: pada VO 1,25× potongan pendek (2–5 detik) hasilnya kacau, potongan
  panjang jauh lebih akurat (ep05). Untuk bagian yang masih kacau, transkripsi ulang potongan itu
  saja (`ffmpeg -ss A -t D` lalu `transcribe.py ... --min 4 --max 11`).
- Pecah caption di titik jeda dari `jeda.py`; caption 2 baris maksimal.
- VO bisa campur bahasa Inggris. Bagian berbahasa Inggris diterjemahkan di caption.
- Bagian yang transkripsinya kacau: rapikan sesuai makna dan **sebutkan detiknya ke pemilik
  akun** saat menyerahkan hasil.

### Tahap 2: Pahami isi dan cek dalil

- Petakan struktur VO: pembuka, poin-poin, dalil, penutup.
- Setiap ayat atau hadis yang disebut: teks Arab dan terjemahan diambil dari sumber
  terverifikasi (terjemahan Kemenag untuk ayat; untuk hadis cantumkan perawi, nomor, dan status).
  Kalau ragu, tanya.
- Klaim yang tidak berdalil (misalnya angka amalan): **sampaikan ke pemilik akun**. Pemilik akun
  pernah memutuskan amalan pribadi tetap ditampilkan apa adanya tanpa kartu koreksi. Ikuti
  keputusannya, tapi jangan pernah melabelinya sebagai hadis.
- Aturan adab (SOP Bagian 3): Nabi dan malaikat tidak digambar; sahabat atau orang saleh
  terdahulu digambar sebagai siluet; Allah tidak divisualkan (cukup cahaya, teks, atau sudut pandang).

### Tahap 3: Storyboard (persetujuan #1)

Usulkan **satu perumpamaan visual utama** yang mengikat seluruh video (contoh: 3 gembok di
satu pintu; toples bintang dan satu batu). Lalu buat tabel adegan:
`waktu VO | isi VO | visual | kapan Rifda muncul`, beserta catatan dalil dari Tahap 2.
Tunggu persetujuan.

Pedoman:
- Rifda muncul di pembuka, saat dalil diperkenalkan (pose `chest`), saat ada penjelasan, dan
  di kartu follow. Ia tidak muncul di tengah adegan kisah.
- Palet warna mengikuti isi (malam = biru tua, bersih/ampunan = toska ke terang, takwa = krem
  dan cahaya). Pilar konten tidak punya warna tetap.
- Label pilar hanya dipasang kalau pemilik akun memintanya.

### Tahap 4: Kerangka episode

```bash
python3 -I .claude/skills/animasi-faedah-harian/scripts/new_episode.py video ep06 vo.wav \
  --judul "Judul Pendek" --kecil "Kaidah Ushul Fiqih #4" --transkrip transkrip.json
```

Skrip ini membuat `video/ep06/`:
- `render.html`: kerangka pola ep05 (hook, kaidah, kartu follow), caption mentah dari transkrip,
  `VO_END` otomatis di kalimat ajakan follow, `HOOK_END`/`HOOK_HITS` awal yang harus dicek.
- `vo_env.js`: amplop suara untuk gerak mulut Rifda.
- `cover.js`

VO **tidak** disalin ke repo.

### Tahap 5: Tulis adegan

Di `video/epNN/render.html`:

1. **Rapikan `CAPTIONS`**: maksimal sekitar 2 baris per caption (pecah frasa panjang), kata
   kunci ditulis `*seperti ini*`, waktu mengikuti transkrip.
2. **Tulis fungsi adegan** `S_nama(T)` dan susun `SCENES = [[detikMulai, fungsi], ...]`.
   Batas adegan diletakkan di jeda kalimat VO; transisi zoom-blur terjadi otomatis.
3. **Pakai bagian siap pakai** dari mesin (`video/engine/lib.js`): Dafa, Rifda, `dalilCard`,
   `rays`, `sajadah`, `rifdaCorner`, `headline`, `S_outro`, dan lainnya. Daftar lengkap dan
   contohnya ada di `references/engine.md`. HUD yang menetap di atas semua adegan masuk ke
   `drawOverlay(T)`.
4. **Hook wajib "nendang"** (VO pembuka Vonya cenderung lemas). Di 2–12 detik pertama:
   - definisikan `HOOK_HITS = [detik, ...]` (layar bergetar + zoom + kilat) dan `HOOK_END`
     (audio.py menaikkan energi VO pembuka dan menahan musik sampai hook selesai, lalu "drop");
   - pasang SFX `hook_boom` di kata pertama dan di klaim kejutan, `pop` untuk kartu/teks yang
     meloncat, `ding` atau `scratch` di pertanyaan ("Kok bisa?"), `riser` menjelang hantaman;
   - visual hook: judul besar menghantam di detik pertama, kontras tinggi. Contoh: `video/ep05/`.
5. **Isi `sfxEvents()`** di momen penting saja. Jangan memberi SFX di setiap gerakan.
6. **Buat `drawCover()`** yang khusus untuk episode ini: judul besar, subjudul, perumpamaan
   utama, dan Rifda.

Struktur adegan ep05 yang terbukti bagus (sesuaikan dengan isi VO):

| Bagian | Isi | Komponen |
|---|---|---|
| Hook (0–±12 dtk) | judul menghantam, contoh berlabel "?", cap kejutan, "KOK BISA?" | `HOOK_HITS`, `hook_boom`, `pop`, `riser`, `ding`, `stempel`, `pil` |
| Kaidah/dalil | headline + `dalilCard` teks Arab terverifikasi | `rifdaAt(..., 'chest')` |
| Perumpamaan | satu benda yang mengikat seluruh video (ep05: jembatan) | gambar sendiri, `stempel` "IKUT WAJIB" |
| Contoh nyata | kitab terbuka → dalil → ilustrasi proses | `kitab`, `dalilCard`, `pil`, `stempel` |
| Contoh kedua | situasi sehari-hari, dicoret/dicap | `stempel`, Dafa |
| Penutup | perumpamaan diulang + ajakan komentar | `rifdaAt(..., 'point')` |
| Follow | dari `VO_END` | `S_follow` (Rifda ikut bicara) |

Sebelum menulis, baca `references/pelajaran.md`. Isinya kesalahan yang sudah pernah terjadi
(bentrok nama variabel, label yang menabrak caption, dan sebagainya).

### Tahap 6: Cek frame

```bash
cd video && RENDER_HTML=epNN/render.html node preview.js /tmp/cek 1.5 8 20 ...
```

Ambil satu atau dua frame per adegan, plus di tengah transisi. Gabungkan jadi satu lembar
(`ffmpeg ... hstack`) lalu lihat. Periksa:
- teks tidak keluar layar dan tidak bertumpuk,
- caption tidak tertutup Rifda atau labelnya,
- konten penting berada di area aman 9:16 (atas sekitar 120 px, bawah sekitar 250 px),
- teks Arab terbaca dan harakatnya benar.

Perbaiki dulu sebelum render penuh.

### Tahap 7: Render final (persetujuan #2)

```bash
.claude/skills/animasi-faedah-harian/scripts/finalize.sh "$PWD/video" epNN vo.mp3 \
  "$PWD/video/epNN/<judul>.mp4" [musik.mp3|pad]
```

- Render 4 proses paralel memakan sekitar 2–4 menit. Jalankan sebagai proses latar belakang
  (`run_in_background`).
- Hasilnya: MP4 (-14 LUFS, dikoreksi otomatis walau ada boom hook), `cover.png`, dan contact sheet.
  Lihat contact sheet-nya dulu.
- Kirim juga potongan audio hook (13 detik pertama) supaya pemilik akun bisa menilai hook cepat.
- Kirim MP4, cover, dan audio hook ke pemilik akun lewat `SendUserFile`.
- Serahkan dengan **tabel alur** (waktu, isi VO, visual), catatan caption yang tidak yakin
  (sebutkan detiknya), dan catatan dalil.
- Tunggu penilaian dan kerjakan revisinya.

### Tahap 8: Simpan

- Commit dan push ke branch kerja.
- Setelah pemilik akun bilang **fix**, masukkan ke `main` lewat pull request lalu merge
  (pemilik akun ingin semuanya ada di `main`).
- File VO dan musik dari luar tidak di-commit.

## Rujukan

- `video/SOP.md`: semua keputusan gaya, karakter, adab, palet, branding, dan checklist QC.
- `references/engine.md`: API mesin, karakter, pose, tipe SFX, dan pola adegan.
- `references/pelajaran.md`: kesalahan yang pernah terjadi dan cara menghindarinya.
- `video/ep05/render.html`: **rujukan baku** (paling bagus menurut pemilik akun).
- `video/ep02/`–`ep04/`: episode lama yang sudah disetujui; jangan diubah.
