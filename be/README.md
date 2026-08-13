# Backend Fastify 4

Backend ini menukar token SSO Portal dengan sesi lokal terenkripsi yang hanya disimpan
dalam cookie `HttpOnly`. Data user dan employee berasal dari respons Portal, tidak
disalin ke tabel `users`, dan access token tidak pernah dikirim ke JavaScript frontend.
Session mempertahankan objek `employee`, grade, unit beserta hierarkinya,
penempatan area, dan atasan langsung jika tersedia dari Portal.

Isi `SSO_INTERNAL_TOKEN` dengan nilai yang sama pada backend Portal untuk mengaktifkan
endpoint `/api/portal/employees`, `/grades`, `/organization-units`, dan `/placements`.
Header rahasia `x-internal` hanya dipasang oleh backend Fastify.

Fastify 4 tersedia untuk kompatibilitas sistem lama. Untuk proyek baru, gunakan versi
Fastify yang masih mendapat pembaruan keamanan.

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
