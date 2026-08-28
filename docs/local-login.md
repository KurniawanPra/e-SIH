# Diagnosis login lokal dan hydration

## Atribut bis_* pada hydration warning

Pada pemeriksaan 28 Agustus 2026, `bis_skin_checked`, `bis_register`, dan `__processed_*` tidak ditemukan di sumber aplikasi maupun HTML respons `http://localhost:8098/`. Atribut pada laporan browser ditambahkan setelah respons diterima, sangat mungkin oleh ekstensi browser yang memodifikasi DOM.

Nonaktifkan ekstensi yang memodifikasi halaman untuk localhost, lalu lakukan hard reload. Uji juga pada profil browser bersih atau jendela privat dengan ekstensi dinonaktifkan. Tidak perlu menambahkan `suppressHydrationWarning` secara global atau menghapus atribut browser melalui script aplikasi.

React mengharuskan markup server dan render awal client cocok. Menyembunyikan warning hanya berlaku satu tingkat dan dapat menyamarkan masalah lain: [dokumentasi React hydration](https://react.dev/reference/react-dom/client/hydrateRoot).

## Alur login

1. Buka satu hostname secara konsisten, misalnya `http://localhost:8098`. Jangan berganti ke `127.0.0.1` setelah cookie dibuat.
2. Login melalui Portal; URL lokal harus diizinkan sebagai tujuan aplikasi oleh konfigurasi Portal. Query `redirect` tidak dapat menggantikan izin callback di Portal.
3. Callback menukar token sekali, lalu membaca `/api/auth/me` untuk membuktikan cookie tersimpan dan identitas sama. Token langsung dihapus dari URL tanpa menghapus seluruh sessionStorage.
4. Kegagalan cookie/akses/backend ditampilkan pada callback atau halaman verifikasi sesi. Hanya sesi yang benar-benar tidak ada/kedaluwarsa yang kembali ke halaman login.

Penyimpanan `localStorage` dan `sessionStorage` tidak wajib untuk login. Profil/token lama dibersihkan bila diizinkan browser; autentikasi menggunakan cookie HttpOnly.

## Konfigurasi yang diperiksa

- `/ready` backend lokal mengembalikan 200 pada saat pemeriksaan; database sudah memiliki tabel yang dibutuhkan.
- Frontend `/api/config` dan backend `.env` memakai App ID yang sama.
- Frontend memakai proxy API same-origin. `INTERNAL_BACKEND_URL` harus menunjuk backend yang berjalan.
- Untuk HTTP development, jangan memaksa cookie Secure melalui konfigurasi HTTPS produksi. Untuk produksi HTTPS tetap gunakan Secure.
- `COOKIE_NAME` harus unik bila beberapa aplikasi lokal menggunakan hostname yang sama; cookie dibedakan oleh host/path, bukan port.
- Browser bisa menolak cookie; JavaScript tidak dapat membaca header Set-Cookie. Pemeriksaan `/api/auth/me` adalah verifikasi server, bukan pembacaan cookie oleh JavaScript. [Dokumentasi cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).

Restart backend setelah mengubah environment; restart/rebuild frontend bila URL rewrite berubah. Token SSO sekali pakai yang sudah ditukar tidak boleh digunakan ulang: mulai login baru melalui Portal.

## Cookie terlalu besar setelah verifikasi Portal

Bug penyimpanan sesi berhasil direproduksi: seluruh objek employee Portal masuk ke cookie terenkripsi, sementara grade/unit/penempatan juga diduplikasi. Foto, hierarki unit, atau metadata besar bisa melampaui batas cookie browser (umumnya 4 KB). Server dapat menjawab login sukses, tetapi browser menolak cookie. Pada tes regresi, header cookie lama berukuran sekitar 46 KB. Browser juga mereproduksi pesan "Sesi login tidak terbaca" menggunakan fixture foto besar.

Perbaikan:

- Cookie menyimpan identitas ringkas sekali: ID Portal/employee, email, nama, NRK, jabatan, grade, unit/path, dan nama penempatan. Foto, hierarchy, riwayat, serta field Portal lain tidak disalin ke cookie.
- Role, status akses, dan programIds dihitung dari database setiap request, melalui `request.authUser`; tidak ditulis kembali ke cookie. Penugasan 500 program diuji tanpa memperbesar cookie.
- Header cookie final diperiksa setelah enkripsi dan encoding. Jika identitas wajib masih melampaui 4 KB, backend menjawab `502 SESSION_TOO_LARGE`, menghapus cookie sesi, dan tidak mengirim sukses palsu. Log hanya mencatat ukuran, bukan token/profil/isi cookie.
- Nama cookie bawaan menjadi `esih_session`, bukan `target_session`. `COOKIE_NAME` eksplisit tetap dihormati. Sesi valid lama dengan nama/key yang sama dikompakkan pada request berikutnya; pergantian nama cookie memerlukan login ulang. Cookie tetap HttpOnly dan SameSite=Lax; Secure mengikuti konfigurasi HTTPS.
- Cookie baru berlaku paling lama `COOKIE_MAX_AGE_SECONDS` sejak login; membaca dashboard tidak memperpanjang masa berlakunya.

Jalankan ulang backend (dan frontend bila kode client berubah), lalu mulai login baru dari `http://localhost:8098`. Jika `.env` masih menetapkan `COOKIE_NAME=target_session`, ganti ke `COOKIE_NAME=esih_session` atau nama unik deployment tersebut. Jangan memakai kembali URL token callback yang sudah dikonsumsi. Perubahan ini tidak memerlukan migrasi database.

## Batas pengujian

23 tes otomatis lulus, termasuk sesi 401/403/503, profil besar, pengaman ukuran cookie, 500 penugasan program, perubahan role, migrasi cookie lama, logout, cookie hilang, identitas cookie berbeda, dan storage diblokir. Build backend dan frontend berhasil; frontend masih memiliki warning lint sebelumnya (dependency hook, font, dan img), tanpa build error. Setelah perbaikan, fixture foto besar yang sama menghasilkan cookie sekitar 552 byte melalui proxy Next.js dan berhasil masuk dashboard USER di browser. Membuka ulang halaman awal mempertahankan sesi. Login ADMIN juga menampilkan dashboard dan menu admin.

Pemeriksaan proses lokal yang sedang berjalan (port 3015 dan proxy 8098) masih menunjukkan nama cookie `target_session`, sedangkan source/default baru menggunakan `esih_session`. Dengan `.env` lokal tanpa `COOKIE_NAME` eksplisit, ini menunjukkan proses lama belum memuat perubahan; restart diperlukan. Cookie HTTP lokal yang diperiksa tidak memakai Secure dan memakai HttpOnly; readiness database mengembalikan 200. Pengujian ini hanya meminta penghapusan cookie pada HTTP client kosong, tanpa mengakses atau menghapus sesi browser pengguna.

Alur cookie diuji dengan Portal tiruan dan database terpisah, bukan akun Portal produksi. Login development tanpa Portal tidak ditambahkan pada UI. Jika tujuan sebenarnya adalah menyediakan akun uji lokal, konfigurasinya perlu dipisahkan secara eksplisit dari akses produksi.
