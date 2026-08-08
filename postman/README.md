# Postman Intes SSO

Import dua file berikut:

1. `Intes-SSO.postman_collection.json`
2. `Intes-SSO.local.postman_environment.json`

Isi variable environment:

- `app_id`: ID aplikasi pada Manajemen Aplikasi Portal.
- `portal_email` dan `portal_password`: credential Portal untuk menjalankan login
  dari nol. Isi `portal_totp_code` juga bila akun memakai TOTP.
- `portal_access_token`: access token user yang sudah login ke Portal; digunakan
  untuk membuat one-time SSO token dan akan terisi otomatis oleh request login.
- `sso_internal_token`: nilai `SSO_INTERNAL_TOKEN` backend Portal; gunakan hanya
  untuk folder pengujian internal langsung.
- `target_backend_url`: Laravel `http://localhost:8000` atau Fastify
  `http://localhost:4101`.

Pastikan Postman cookie jar aktif. Jalankan folder `01 - Login SSO` secara berurutan,
lalu folder `02 - Data Portal melalui Backend Client`.

Untuk penggunaan aplikasi sebenarnya, frontend hanya memanggil endpoint
`/api/portal/*` pada backend target. Header `x-internal` dan secret internal selalu
ditambahkan oleh backend target, bukan oleh frontend.
