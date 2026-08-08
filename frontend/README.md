# Frontend Next.js 14

Frontend ini hanya menerima login melalui callback SSO Portal dan tidak menyimpan token sesi di `localStorage` atau `sessionStorage`.

Setelah session aktif, gunakan helper berikut untuk data direktori yang diproksikan
oleh backend target:

- `getPortalEmployees()`
- `getPortalGrades()`
- `getPortalOrganizationUnits()`
- `getPortalPlacements()`

Frontend tidak mengirim `x-internal`; header dan `SSO_INTERNAL_TOKEN` hanya dikelola
oleh backend target.

Portal boleh mendaftarkan base URL frontend, misalnya `http://localhost:4100`. Jika Portal
mengarahkannya ke `/?token=...`, landing page meneruskan token ke `/sso-callback`.
URL callback langsung juga tetap didukung.

Next.js 14 tersedia untuk kompatibilitas. Build production menggunakan static export,
sehingga server Next.js tidak dijalankan pada production.

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Pilih backend melalui `NEXT_PUBLIC_BACKEND_DRIVER=fastify` atau `laravel`.

Branding halaman login langsung dapat disesuaikan tanpa mengubah komponen:

```env
NEXT_PUBLIC_APP_NAME=Arsip Digital
NEXT_PUBLIC_APP_DESCRIPTION=Pengelolaan dokumen kerja perusahaan.
NEXT_PUBLIC_APP_LOGO_URL=/app-logo.svg
NEXT_PUBLIC_PORTAL_NAME=InTes / Portal SSO
NEXT_PUBLIC_PORTAL_ACCOUNT_NAME=Portal INL
NEXT_PUBLIC_PORTAL_LOGIN_URL=http://127.0.0.1:3002/login
```

Simpan logo di `public/` lalu arahkan `NEXT_PUBLIC_APP_LOGO_URL` ke path publiknya.
Jika gambar tidak dapat dimuat, tampilan otomatis menggunakan inisial nama aplikasi.
Saat aplikasi dibuka tanpa session, halaman root dan dashboard menampilkan tombol
**Login with Portal**; redirect ke Portal hanya dilakukan setelah user menekan tombol.

Build dan preview hasil static:

```powershell
npm run build
npm run start
```

Deploy isi folder `out/` ke static hosting atau web server perusahaan.
