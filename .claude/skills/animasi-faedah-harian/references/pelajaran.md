# Pelajaran dari episode sebelumnya

Kesalahan yang benar-benar pernah terjadi selama membangun seri ini. Cek daftar ini sebelum
render penuh.

## Isi dan komunikasi

- **Audio dikira musik.** Analisis ketukan dan volume menyimpulkan "musik instrumental", padahal
  isinya VO tentang tahajud, istighfar, dan takwa. Akibatnya, dua video dibuat dengan isi yang
  salah. Selalu transkripsi dulu (`scripts/transcribe.py`). Kalau masih ragu, tanyakan.
- **Jangan menebak isi atau tujuan.** Pemilik akun ingin hasil yang bisa dinilai, tetapi titik
  persetujuan storyboard tetap penting. Satu pertanyaan singkat lebih murah daripada satu
  render ulang.
- **VO campur bahasa.** Whisper dengan `language='id'` tetap menuliskan bagian berbahasa Inggris
  dalam bahasa Inggris. Terjemahkan di caption. Bagian yang transkripsinya kacau dirapikan
  sesuai makna, lalu sebutkan detiknya saat menyerahkan hasil.

## Kode

- **Bentrok nama.** Variabel lokal `const sprout = ...` di dalam adegan menimpa fungsi `sprout()`
  dari brand.js, sehingga muncul `TypeError: sprout is not a function`. Beri nama lain, misalnya
  `sproutK`. Hal yang sama berlaku untuk `B` (palet brand), `pill`, `head`, `figure`, `shade`,
  dan `sunrise`.
- **Jangan mendeklarasikan ulang `ctx`.** Ia sudah `let` di karakter.js; halaman cukup
  `ctx = cv.getContext('2d')`.
- **Parameter default `{}`** membuat penghitung kurung kurawal salah kira saat mengekstrak
  fungsi. Mulailah dari kurung tutup parameter (lihat cara pembuatan engine/lib.js).
- **`riser`** harus mengarah ke hantaman berikutnya; durasi negatif membuat `audio.py` gagal.
  Di ep03 riser sempat berbunyi 43 detik (dari 0:48 sampai `end_hit` di 1:31) dan terdengar
  "aneh" di tengah video. Sekarang riser hanya menuju `end_hit`/`door_open`/`unlock` yang
  jaraknya ≤ 3 detik, selain itu 1,5 detik.
- **Perintah dengan `pkill -f "render.js"`** ikut mematikan shell yang menjalankannya, karena
  baris perintahnya mengandung teks yang sama. Untuk menghentikan render, cari PID-nya dulu.
- **Render penuh** dijalankan dengan `run_in_background`. Jangan menunggu dengan loop `sleep`.

## Tata letak

- **Label nama Rifda** (kapsul di bawah kaki) pernah menabrak caption di y≈1010. Letakkan tanah
  Rifda di sudut pada y≈905 (sudah diatur `rifdaCorner`).
- **Benda yang tembus kartu.** Jam dinding pernah terlihat tembus di belakang kartu hadis.
  Pakai latar kartu yang pekat, atau sembunyikan benda di belakangnya selama kartu tampil.
- **Spasi caption hilang.** Efek membesar pada kata yang disorot menelan spasi ("biasaaja").
  Efek membesar sudah dikecilkan dan spasi caption diperlebar 1,25×. Jangan dinaikkan lagi.
- **Dinding gelap di latar gelap** tidak terlihat. Naikkan kontras dan beri garis terang di tepi atas.
- **Caption terlalu panjang** (3 baris atau lebih) menutupi tokoh. Pecah menjadi beberapa caption.
- **Area aman 9:16:** atas sekitar 120 px (watermark dan HUD), bawah sekitar 250 px (UI Reels).
  Caption berada di y≈1010 dari 1280 (logis).

## Audio

- Musik dari luar dan VO tidak di-commit ke repo; hanya tertanam di MP4.
- Kerasnya -14 LUFS dengan puncak di bawah -1,5 dBTP (sudah diatur `finalize.sh`).
- **Kresek di VO WhatsApp.** Vonya kadang terlalu dekat dengan mic sehingga awal kata meletup dan
  pecah (sampel melewati 1,0 setelah decode Opus). Filter `adeclip` ffmpeg tidak cukup.
  `scripts/declip.py` (dipanggil `prep_vo.sh`) mendeteksi gugus clipping dan menggantinya
  dengan versi low-pass yang diredam memakai transisi halus. Cek daftar "diperbaiki" yang
  dicetaknya, lalu dengarkan bagian itu.
- **VO kalah oleh musik/SFX (ep03).** VO yang sudah dijernihkan lebih pelan, sehingga musik
  3–6 dB lebih keras dari VO. `audio.py` kini menyetel VO ke -18 dBFS saat bicara, musik ±14 dB
  dan SFX ±8 dB di bawahnya. Cek dengan `STEMS=folder python3 audio.py ...` (menyimpan trek
  VO, musik, SFX terpisah). Hindari `impact` di luar adegan benda pecah: ada bunyi denting kaca.
- **Hook dengan `hook_boom` bikin video terlalu pelan (ep05: -15,6 LUFS).** Puncak boom
  menahan `loudnorm`. Sekarang `finalize.sh` mengukur ulang dan mengoreksi otomatis
  (naikkan + limiter) bila meleset lebih dari 0,4 dB.
- **Transkripsi VO 1,25× dengan potongan pendek kacau (ep05).** Default `transcribe.py` kini
  5–10 detik; caption dipecah di titik jeda dari `jeda.py`.
- **Emoji tidak tampil** di Chromium headless (font tidak ada). Jangan pakai emoji di kanvas.
- **Label menempel di judul** (ep05: RIBA/AKAD HARAM di bawah "BUKA USAHA"). Beri jarak ±90 px
  di bawah baris judul terakhir.
- **Pemilik akun lebih suka langsung dianimasikan**; storyboard disertakan saat menyerahkan hasil.
- **Cover bagus di Reels tapi jelek di feed (ep03–ep05).** Judul ditaruh di atas (y ±200) dan
  Rifda di bawah, padahal grid IG/TikTok memotong ke 3:4/1:1 di tengah: judul dan logo
  terpotong. Pemilik akun mau cover tetap 9:16 tapi enak saat dipotong **4:5**: isi penting di
  zona 4:5 (y 205–1075) dan isi bingkainya penuh, pakai `coverJudul`/`coverLogo`.
