# Verifikasi perbaikan laporan — 28 Agustus 2026

## Akar masalah

- Migrasi awal tidak memuat `ref_UserOverride`, `ref_Bagian`, `ActivityAuditLog`, dan `Highlight.bagian`; FK highlight masih mengacu ke User lokal, sementara identitas sudah berasal dari Portal.
- Dashboard menggunakan satu `Promise.all`: kegagalan highlight/direktori membuang hasil endpoint lain yang sebenarnya berhasil.
- Kartu program admin tidak menerima daftar aktivitas personal dan tidak mengambil aktivitas nested, sehingga badge status selalu nol.
- Rentang tanggal yang selalu terisi mengalahkan filter minggu; pengelompokan minggu dan rentang juga memakai tanggal berbeda.
- Penugasan program menggunakan ID hardcoded yang tidak selalu sama dengan master database.

## Bukti lokal

- 16 pengujian otomatis lulus melalui `cd be; npm test`: migrasi SQL awal + perbaikan (perbaikan diterapkan dua kali), penugasan admin, identitas Portal, hitungan dashboard, validasi tanggal/status, otorisasi, audit update/delete/restore, akun nonaktif, penanganan skema hilang, PIC kedua, serta batas minggu/tahun kabisat.
- Backend TypeScript berhasil dibangun.
- Skema Prisma lolos `validate`. Percobaan generate ulang terakhir terhalang DLL engine Windows yang sedang dipakai proses lain (EPERM); client yang sudah ada digunakan untuk pengujian. Hentikan backend lokal sebelum `npm run generate` saat pemasangan ulang.
- Frontend Next.js berhasil build produksi beserta pemeriksaan tipe. Masih ada delapan peringatan lint terkait dependensi hook, font dan gambar; tidak ada error lint.
- `npm audit --omit=dev` pada backend dan frontend: 0 kerentanan yang dilaporkan saat pemeriksaan. Ini bukan audit keamanan menyeluruh.
- ExcelJS berhasil menulis workbook dan membacanya kembali setelah pembaruan dependency.
- Server standalone hasil build berhasil membaca App ID yang berbeda dari environment runtime melalui `/api/config`; nilai tidak lagi terkunci ke konfigurasi saat build.
- Browser menggunakan frontend port 18098 dan backend/Portal/database uji terpisah. Dashboard admin dan user menampilkan 6 aktivitas: 3 Closed, 2 On Progress, 1 Open, closure 50%; kartu program 5 aktivitas dengan progress 60%; highlight user 1 Closed.
- Filter preset menyesuaikan tanggal dan baris; M4 memuat tanggal 22 dan 28, M5 memuat tanggal 29. Input manual tanggal awal 22 menghasilkan 3 laporan tersisa (22, 28, 29); perubahan input akhir juga memperbarui data. Preset dilepas ketika tanggal diedit.
- Modal admin/user menampilkan judul lengkap, deskripsi panjang hingga penanda terakhir, PIC, program, tanggal, tindak lanjut dan kendala. Tampilan ponsel 390×844 diperiksa; modal dapat digulir dan memiliki tombol tutup.
- Graph kode diperbarui. Parser SQL opsional graphify belum tersedia; SQL diperiksa melalui eksekusi pengujian database.

## Belum diverifikasi

Database produksi, riwayat migrasi aktual, build container Docker, Portal SSO asli, pengujian beban dan pemulihan backup. Lakukan langkah pada [panduan produksi](production.md) sebelum rilis. Data aplikasi asli tidak diubah selama pengujian ini.

File SSO/login juga menerima perubahan dari proses/editor lain selama pekerjaan berlangsung; perubahan tersebut dipertahankan. Hasil build hanya berlaku untuk snapshot sumber yang diperiksa, sehingga jalankan ulang verifikasi jika ada edit berikutnya.
