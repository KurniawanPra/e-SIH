# Rilis perbaikan pelaporan e-SIH

## Batas verifikasi

Pengujian menggunakan PostgreSQL dalam memori (PGlite) dan Portal tiruan. Migrasi dan data produksi **belum dijalankan/diubah**. Build Docker dan integrasi Portal produksi masih harus diuji di staging. Kelulusan pengujian ini bukan jaminan bahwa semua kondisi produksi sudah tercakup.

## 1. Sebelum migrasi

1. Backup PostgreSQL dan uji pemulihannya ke database staging terpisah.
2. Cocokkan target host, nama database dan schema; jangan menampilkan kredensial di log. `DATABASE_URL` mengambil prioritas atas `DB_*`.
3. Gunakan Node.js 22+; jalankan `npm ci` dan `npm run generate` di `be`.
   Pada Windows, hentikan proses backend yang menggunakan Prisma terlebih dahulu agar DLL engine tidak terkunci (EPERM).
4. Tinjau `prisma/migrations/20260828000000_complete_reporting_schema/migration.sql`. Migrasi menambah tabel override pengguna, bagian, audit aktivitas dan kolom bagian highlight; menghapus FK author highlight ke tabel User lama karena author sekarang identitas Portal. Tabel User/UserProgram dan data lama tetap dipertahankan.
5. Jalankan `npm run migrate:status` dan periksa riwayat `_prisma_migrations` di salinan staging.

## 2. Database baru / riwayat migrasi normal

Dari direktori `be`:

```powershell
npm run migrate
npm run migrate:status
npm run build
npm start
```

Migrasi perbaikan dibungkus transaksi. Jika gagal, cari penyebab sebelum mencoba lagi. Jangan menjalankan reset, `db push --accept-data-loss`, `migrate:fresh`, atau menandai migrasi applied untuk melewati kegagalan.

## 3. Database lama yang dibuat lewat db push

`migrate deploy` dapat menolak database berisi tabel yang belum memiliki riwayat migrasi (P3005). Ini perlu **baseline yang diverifikasi**.

- Bandingkan salinan skema aktual dengan `20260810010000_init_full_schema/migration.sql`.
- DBA harus memastikan seluruh objek dan constraint migrasi awal sudah setara, atau menyusun rekonsiliasi tanpa menghapus data. Jangan menandai baseline jika ada objek yang belum pernah dibuat.
- Hanya setelah pemeriksaan itu, gunakan `node scripts/prisma.cjs migrate resolve --applied 20260810010000_init_full_schema` pada database yang diperiksa, lalu `npm run migrate`.
- Jika database lama memiliki skema berbeda, hentikan proses dan rekonsiliasi perbedaannya di staging dahulu. Mengabaikan error dengan `|| true` dapat menghidupkan aplikasi dengan tabel yang masih hilang.

Panduan resmi: [Prisma baselining](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining).

## 4. Environment dan container

- Set `NODE_ENV=production`, HTTPS, `TARGET_FRONTEND_ORIGIN` tepat, `ALLOWED_ORIGINS` seperlunya, dan secret sesi acak 32 byte. Jangan mengaktifkan `ALLOW_INSECURE_HTTP` pada layanan publik.
- `SSO_INTERNAL_TOKEN` harus berasal dari administrator Portal, tidak boleh memakai contoh yang pernah masuk repositori. Rotasi jika contoh lama ternyata digunakan sebagai secret nyata.
- App ID Portal, backend dan frontend harus sama; `PORTAL_API_URL` adalah alamat API, sedangkan `NEXT_PUBLIC_PORTAL_LOGIN_URL` alamat login browser.
- Set DB host yang bisa diakses dari container, bukan localhost container. Compose tidak menyediakan PostgreSQL.
- Compose menggunakan `http://e-sih-be:3000` sebagai tujuan rewrite frontend saat build. Untuk nama service lain gunakan `--build-arg INTERNAL_BACKEND_URL=...` dan rebuild frontend; environment runtime saja tidak mengubah manifest rewrite Next.js.
- Simpan environment di server, bukan image/Git. Docker menjalankan migrasi sebelum backend start, tanpa seed otomatis. Jalankan migrasi staging terlebih dahulu sebelum `docker compose up -d --build`.
- Gunakan `COOKIE_NAME` unik bila beberapa aplikasi memakai hostname sama. Sesi bearer lama perlu login ulang.

## 5. Pemeriksaan setelah rilis

1. `/health` dan `/ready` backend harus HTTP 200. `/ready` gagal bila tabel override, audit, bagian atau kolom highlight belum siap.
2. Login Portal sebagai admin dan user; pastikan logout dan sesi kedaluwarsa bekerja. Pastikan `/api/auth/demo-login` HTTP 404 pada produksi.
3. Bandingkan hitungan dashboard dengan laporan pada tahun yang sama. Periksa Closed, On Progress, Open, Cancelled, grafik bulan, kartu program, dan PIC kedua.
4. Activities harus default bulan ini. Uji Semua, M1–M5, bulan lain, input manual, lintas tahun, serta Februari/M5. Semua menggunakan tanggal mulai dan batas inklusif.
5. Klik judul/deskripsi laporan panjang; semua isi tersedia di modal, dapat digulir di ponsel, ditutup dengan tombol/Escape.
6. Admin menetapkan program nyata ke user. Refresh/login ulang user dan pastikan penugasan sesuai. Mutasi role/penugasan langsung ke API sebagai user harus ditolak.
7. Buat, ubah status, dan ekspor laporan staging; perubahan tersimpan, audit muncul, counter ikut berubah. Bila database tidak tersedia, UI menampilkan kegagalan dan tidak mengaku berhasil menyimpan.
8. Periksa monitoring error/latensi, strategi backup rutin dan kapasitas pool database dengan volume realistis. Pengujian beban, pengujian lintas unit, serta pemulihan bencana belum dilakukan dalam perbaikan ini.

## Rollback

Simpan image/tag sebelumnya dan backup sebelum migrasi. Migrasi ini mempertahankan tabel/data lama, tetapi kode lama dapat mengandalkan FK author yang telah dilepas. Jangan otomatis menambah ulang FK atau menghapus tabel baru saat rollback. Hentikan mutasi, evaluasi data yang sudah masuk, lalu gunakan prosedur pemulihan backup yang telah diuji jika perlu.
