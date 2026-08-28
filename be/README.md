# Backend Fastify 5

Backend ini menukar token SSO Portal dengan sesi lokal terenkripsi yang hanya disimpan
dalam cookie `HttpOnly`. Data user dan employee berasal dari respons Portal, tidak
disalin ke tabel `users`, dan access token tidak pernah dikirim ke JavaScript frontend.
Cookie `esih_session` menyimpan identitas ringkas: ID, email, nama, NRK, jabatan,
grade, unit/path, dan nama penempatan. Foto, hierarki, serta metadata Portal lain
tidak dimasukkan ke cookie agar tidak melampaui batas browser. Role/program terbaru
dibaca dari database per request, bukan disimpan ulang dalam cookie. Detail diagnosis
dan pengujian tersedia di [panduan login lokal](../docs/local-login.md).

Isi `SSO_INTERNAL_TOKEN` dengan nilai yang sama pada backend Portal untuk mengaktifkan
endpoint `/api/portal/employees`, `/grades`, `/organization-units`, dan `/placements`.
Header rahasia `x-internal` hanya dipasang oleh backend Fastify.

Runtime memerlukan Node.js 22+. Jalankan migrasi sebelum server menerima trafik.

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

Endpoint:

- `POST /api/auth/login`
- `GET /api/auth/csrf`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /`
- `GET /health`

Jika aplikasi membutuhkan role/permission lokal, simpan hanya aturan otorisasinya dengan
referensi `sub` (Portal user ID) atau `employeeId`; jangan menduplikasi profil user Portal.

Buat nilai `SESSION_SECRET_HEX` production dengan:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`trustProxy` sengaja nonaktif. Jika aplikasi berada di belakang reverse proxy dan kode bisnis
memakai IP/protokol request, isi dengan daftar proxy tepercaya, jangan boolean `true`.

Lihat [panduan produksi](../docs/production.md). npm run migrate menerapkan migrasi versi; npm run migrate:status memeriksa riwayat. GET /ready memeriksa database dan tabel pelaporan. Override role/program disimpan di ref_UserOverride. Mutasi master hanya untuk ADMIN, perubahan laporan user dibatasi kepemilikan. Pembacaan data tim tetap tersedia bagi sesi terautentikasi.
