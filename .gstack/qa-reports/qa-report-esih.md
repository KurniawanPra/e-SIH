# QA Report — e-SIH Operation

| Field | Value |
|---|---|
| Target URL | `http://localhost:4100` (backend API `:4101`) |
| Mode | Full |
| Timestamp | 2026-08-08 (fix verification: re-run QA after fixes) |
| Branch / Commit | main @ `cbea424` + fix commit |
| Browser | Playwright Chromium, desktop 1280x800 + mobile 375x812 |
| Evidence | `screenshots/01..09-*.png`, `screenshots/qa-evidence.json` |

## Health Score

| Category | Score | Evidence |
|---|---|---|
| Console | 10/10 | 0 console errors, 0 failed requests (fix ISSUE-001) |
| Links | 10/10 | 7/7 target navigasi render benar (sidebar + submenu master) |
| Visual | 10/10 | Tidak ada overflow horizontal, semua screenshot bersih |
| Functional | 10/10 | Login, tambah aktivitas end-to-end, modal status, modal logout, sidebar mobile |
| UX | 10/10 | Label tombol "Update Status" (fix ISSUE-002); animasi aktif |
| Performance | 9/10 | Halaman selesai muat < 6s di ukuran data saat ini; belum diukur secara formal |
| Accessibility | 10/10 | Tombol ikon ber-aria-label (fix ISSUE-003): Edit, Aktif/Nonaktifkan, Tutup Modal, Kelola Sub-Program, Tutup Sidebar |

**Health Score: 9.9 / 10**

## Ringkasan

QA penuh dijalankan sebagai role **ADMIN** (Kurniawan P.) dengan browser nyata:

- Login page: 2 tombol (Admin, User) — load bersih, **tanpa error konsol** (fix ISSUE-001)
- Dashboard executive: render benar (executive header + program cards)
- Navigasi 7 target: Weekly, Monthly, All Activities, Program Kerja, Item Program, Users — semua render benar
- **Form end-to-end**: tambah aktivitas via modal (pilih program induk → sub-item → uraian → tanggal → submit) → aktivitas muncul di daftar → data test dibersihkan (DB kembali 100 record)
- Modal status "Update Status Aktivitas" terbuka dari tombol "Update Status" (fix ISSUE-002)
- Modal logout "Konfirmasi Keluar Sesi" muncul dari footer sidebar
- Sidebar mobile: `translate -100% → 0 → -100%` (animasi slide bekerja, toggle button ditemukan)
- Aksesibilitas: 18+ aria-label terpasang di halaman Weekly, 38 di Items, dst. (fix ISSUE-003)

## Fixed Issues (dari QA sebelumnya)

### ISSUE-001 — FIXED: 401 di konsol saat halaman login (Console)
- **Fix**: `hasSessionCookie()` di `lib/api.ts` — cek cookie `target_session` sebelum memanggil `/api/auth/me`; dipakai di login page, dashboard layout, dashboard, dan weekly.
- **Verifikasi**: `CONSOLE ERRORS unique: 0` dan `FAILED REQUESTS: none` saat QA ulang; login page render tanpa error.

### ISSUE-002 — FIXED: Tombol aksi tabel desktop "Update" tanpa kata "Status" (UX)
- **Fix**: `weekly/page.tsx` — label tombol diubah dari `Update` menjadi `Update Status`.
- **Verifikasi**: `status modal opened=true` — modal "Update Status Aktivitas" terbuka lewat tombol tersebut.

### ISSUE-003 — FIXED: Tombol ikon tanpa aria-label (Accessibility)
- **Fix**: 21+ tombol diberi `aria-label` di Weekly, Monthly, Items, Program Kerja, Parent PK, Sub PK, Programs (link), Sidebar:
  - Edit: `Edit Aktivitas` / `Edit Item` / `Edit Program`
  - Toggle aktif: `Aktif/Nonaktifkan Item` / `Aktif/Nonaktifkan Program`
  - Tutup modal: `Tutup Modal`; tutup sidebar: `Tutup Sidebar`; link: `Kelola Sub-Program`
- **Verifikasi**: `tsc --noEmit` lolos; DOM ter-render memuat semua label yang diharapkan (cek Playwright per halaman).

## Covered vs Skipped

- **Covered**: login, 7 halaman utama, form tambah aktivitas (full flow), modal status, modal logout, sidebar mobile (buka/tutup), console/HTTP errors, aria-label rendering.
- **Skipped**: edit & update status actual (perubahan data riil) — sengaja dihindari agar data produksi tidak berubah; export CSV/Excel tidak diverifikasi isi file; pengecekan visual screenshot manual oleh manusia (screenshot tersedia di `screenshots/`).
