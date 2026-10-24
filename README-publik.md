# Perpustakaan Ceria — Situs Publik

Situs perpustakaan untuk pengunjung: cari buku, pinjam, ngobrol dengan pustakawan digital, dan lihat info keanggotaan. Dibuat dengan HTML, CSS, dan JavaScript murni (vanilla), tanpa framework atau proses build.

Situs admin ada di file terpisah: `admin.html`. Keduanya tersambung lewat data bersama (lihat bagian Cara kerja data).

## Daftar file

```
publik.html    Halaman (HTML)
publik.css     Gaya dan animasi (CSS)
publik.js      Logika (JavaScript murni)
README-publik.md
```

Keempat file harus berada dalam **satu folder yang sama**, tanpa subfolder.

## Cara menjalankan

1. Simpan keempat file dalam satu folder, lalu buka `publik.html` di browser (klik dua kali).
2. Atau jalankan server lokal dari dalam folder, misalnya `python3 -m http.server 8000`, lalu buka `http://localhost:8000/publik.html`.

Huruf (Fredoka, Nunito, Space Mono) dimuat dari Google Fonts, jadi butuh internet. Tanpa internet, tampilan memakai huruf bawaan browser. Fitur Pindai ISBN di panel AI juga butuh internet karena memanggil Google Books.

## Halaman

| Halaman | Isi |
|---|---|
| Beranda | Pencarian cepat, statistik, buku populer, pengumuman |
| Katalog | Cari berdasarkan judul atau penulis, filter per tema |
| Pinjam Buku | Daftar pinjaman, perpanjang, kembalikan, riwayat aktivitas |
| Chat Pustakawan | Perintah seperti `pinjam Sapiens`, `cari buku sejarah`, `kembalikan Cosmos`, `jam buka` |
| Masuk dan Daftar | Buat akun anggota dan masuk. Tombolnya ada di pojok kanan atas |
| Info & Keanggotaan | Kartu anggota atas namamu (setelah masuk), jam operasional, lokasi, FAQ |
| Panel AI | Simulasi klasifikasi tema, pindai ISBN, tata letak rak, dashboard rak, skema data |

## Akun: daftar dan masuk

- **Daftar:** isi nama, email, dan kata sandi (minimal 8 karakter, diketik dua kali). Email yang sama tidak bisa didaftarkan dua kali. Setelah mendaftar kamu langsung masuk dan mendapat nomor anggota seperti `LIB-2026-00001`.
- **Masuk dan keluar:** setelah masuk, pojok kanan atas menyapa namamu dan menampilkan tombol Keluar. Halaman Masuk dan Daftar tidak bisa dibuka lagi selama kamu masih masuk.
- **Kartu anggota:** di halaman Info, kartu menampilkan nama dan nomor anggotamu. Sebelum masuk, yang tampil ajakan untuk masuk atau mendaftar.
- **Peminjaman:** meminjam, mengembalikan, dan memperpanjang buku tetap bisa dilakukan tanpa masuk. Kalau kamu sudah masuk, aktivitas di dashboard admin tercatat atas namamu. Mewajibkan login untuk meminjam belum diaktifkan.

Data akun disimpan di `localStorage` (kunci `pc-users`, sesi di `pc-session`). Kata sandi tidak disimpan polos, tetapi di-hash SHA-256 dengan salt acak. Bila browser tidak mendukung SHA-256 (misalnya halaman `http` biasa selain `localhost`), dipakai hash cadangan yang jauh lebih lemah. Akun dan sesi hanya ada di browser dan perangkat yang sama, belum bisa dilihat situs admin, dan belum ada fitur lupa kata sandi.

## Animasi

Kartu dan halaman muncul bergantian, banner beranda mengalir warnanya, bola dekoratif melayang, angka statistik menghitung naik, dan tombol ajakan chat berdenyut. Semua animasi mati otomatis bagi pengguna yang mengaktifkan pengaturan "kurangi gerakan". Gayanya ada di bagian paling bawah `publik.css`.

## Menjalankan bersama situs admin

Kedua situs tersambung lewat `localStorage`, dan penyimpanan itu hanya dibagi antar halaman yang berasal dari satu alamat (domain dan port yang sama). Karena itu **jangan membuka file dengan klik dua kali**. Jalankan dari server lokal:

1. Simpan kedelapan file (`publik.html`, `publik.css`, `publik.js`, `admin.html`, `admin.css`, `admin.js`, dan kedua README) dalam satu folder.
2. Dari folder itu, jalankan `python3 -m http.server 8000`.
3. Buka `http://localhost:8000/publik.html` dan `http://localhost:8000/admin.html` di browser yang sama.

## Cara kerja data

- Data buku dan pengumuman disimpan di `localStorage` dengan kunci `pc-shared`. Kunci yang sama dipakai situs admin.
- Buku yang ditambah, diubah, atau dihapus di admin, serta pengumuman yang diterbitkan di admin, muncul di situs ini. Peminjaman, pengembalian, dan perpanjangan di sini muncul di admin.
- Kalau kedua situs terbuka di tab berbeda, perubahan langsung terlihat tanpa memuat ulang.
- Datanya hanya ada di satu browser dan satu perangkat. Ini sambungan untuk demo, bukan database sungguhan.
- Data awal (`CATALOG` dan `ANN` di `publik.js`) dipakai hanya bila penyimpanan masih kosong.
- Riwayat aktivitas di halaman Pinjam Buku tetap di memori dan kembali kosong setelah dimuat ulang.

## Langkah pengembangan berikutnya

1. Pindahkan akun dan login ke server dengan database, supaya kata sandi dicek di server dan akun bisa dilihat admin.
2. Pasang database (misalnya Supabase atau Firebase, atau server sendiri) untuk buku, pinjaman, dan pengumuman.
3. Ganti data di dalam kode dengan pemanggilan `fetch` ke API.
4. Ganti penyimpanan bersama di browser dengan database yang dipakai kedua situs.

## Menyesuaikan

- Warna dan huruf: variabel di bagian `:root` pada `publik.css`.
- Tema rak dan warnanya: `THEME_COLORS` di `publik.js`. Kapasitas rak: `SHELF_CAP`.
- Jam buka, alamat, dan FAQ: bagian Info di `publik.html` dan `FAQS` di `publik.js`.
