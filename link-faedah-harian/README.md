# Halaman Link Faedah Harian (pengganti Lynk/Linktree)

Satu halaman `index.html` berisi profil, tautan, katalog buku (pesan via WhatsApp
atau marketplace), dan donasi (QRIS + rekening + Saweria/Trakteer).

## Mengisi data

Buka `index.html`, ubah objek `DATA` di bagian `<script>` saja:
nama, bio, nomor WhatsApp, tautan sosial, daftar buku, rekening, peruntukan donasi.
Bagian yang dikosongkan otomatis disembunyikan.

File pendamping (taruh di folder ini):
- `qris.png` — gambar QRIS donasi
- sampul buku, mis. `sampul-1.jpg`, lalu isi `gambar: "sampul-1.jpg"`

## Online-kan gratis

- **GitHub Pages**: Settings → Pages → pilih branch & folder.
- **Vercel / Netlify / Cloudflare Pages**: unggah folder ini, dapat alamat `*.vercel.app` dsb.
- Domain sendiri (opsional): mis. `faedahharian.my.id`, lalu sambungkan ke hosting di atas.

## Catatan

- Pembayaran di halaman ini **manual** (transfer/QRIS lalu konfirmasi WhatsApp).
  Checkout otomatis seperti Lynk butuh payment gateway (Midtrans/Xendit/Tripay)
  plus server dan verifikasi usaha.
- Donasi: pakai rekening terpisah, tulis peruntukannya, dan isi `laporan`
  (Google Sheet) agar amanah dan transparan.
