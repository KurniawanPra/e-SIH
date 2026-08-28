# e-SIH

Aplikasi tujuan SSO dengan frontend Next.js 15 dan backend Fastify 5.

## Integrasi SSO Otomatis (`Intes.cmd --integrate`)

Untuk mengonfigurasi App ID, URL Portal, dan environment secara otomatis:

```powershell
.\Intes.cmd --integrate e-SIH --app-id=<app-id-portal>
```

Atau dari dalam folder aplikasi ini:

```powershell
..\..\Intes.cmd --integrate --app-id=<app-id-portal>
```

## Backend

```powershell
cd be
npm ci
npm run dev
```

## Frontend

```powershell
cd fe
npm ci
npm run dev
```

Isi App ID yang sama pada environment backend dan frontend, lalu daftarkan base URL frontend pada Manajemen Aplikasi Portal.

Data user dan employee berasal dari Portal dan hanya disimpan di session; backend tidak membuat tabel `users`.

## Persiapan rilis

Gunakan Node.js 22+ (Docker: 24). Baca [panduan migrasi dan produksi](docs/production.md) sebelum memperbarui database lama. Jalankan npm run generate dan npm run migrate dari direktori be setelah memeriksa riwayat migrasi. Backend tidak menjalankan seed/reset otomatis.

Pengujian: npm test dan npm run build dari be; npm run lint dan npm run build dari fe. Pengujian backend memakai database PostgreSQL dalam memori dan Portal tiruan, tanpa menyentuh database .env.

Activities memakai tanggal mulai dengan rentang inklusif: M1 1-7, M2 8-14, M3 15-21, M4 22-28, M5 29-akhir bulan. Semua = bulan terpilih. Klik judul laporan untuk detail lengkap.
