# QA Report — e-SIH Operation

| Field | Value |
|---|---|
| Target URL | `http://localhost:4100` (backend API `:4101`) |
| Mode | Full |
| Timestamp | 2026-08-08 |
| Branch / Commit | main @ `cbea424` |
| Browser | Playwright Chromium, desktop 1280x800 + mobile 375x812 |
| Evidence | `screenshots/01..09-*.png`, `screenshots/qa-evidence.json` |

## Health Score

| Category | Score | Evidence |
|---|---|---|
| Console | 9/10 | 1 pesan 401 benign (lihat ISSUE-001) |
| Links | 10/10 | 7/7 target navigasi render benar (sidebar + submenu master) |
| Visual | 10/10 | Tidak ada overflow horizontal (cek 11 halaman sebelumnya), semua screenshot bersih |
| Functional | 10/10 | Login, tambah aktivitas end-to-end, modal status, modal logout, sidebar mobile |
| UX | 9/10 | Animasi sidebar/page/modal aktif; ISSUE-002 minor |
| Performance | 9/10 | Halaman selesai muat < 6s di ukuran data saat ini; belum diukur secara formal |
| Accessibility | 8/10 | Button-icon tanpa label teks (Edit, tutup modal) tidak punya aria-label (ISSUE-003) |

**Health Score: 9.3 / 10**

## Ringkasan

QA penuh dijalankan sebagai role **ADMIN** (Kurniawan P.) dengan browser nyata:

- Login page: 2 tombol (Admin, User) — load bersih, tanpa error
- Dashboard executive: render benar (executive header + program cards)
- Navigasi 7 target: Weekly, Monthly, All Activities, Program Kerja, Item Program, Users — semua render benar
- **Form end-to-end**: tambah aktivitas via modal (pilih program induk → sub-item → uraian → tanggal → submit) → aktivitas muncul di daftar → data test dibersihkan (DB kembali 100 record)
- Modal status "Update Status Aktivitas" terbuka dan render benar
- Modal logout "Konfirmasi Keluar Sesi" muncul dari footer sidebar
- Sidebar mobile: `translate -100% → 0 → -100%` (animasi slide bekerja), overlay opacity 1 saat terbuka

## Issues

### ISSUE-001 — 401 di konsol saat halaman login (Severity: Low, Category: Console)
- **URL**: `http://localhost:4100/`
- **Expected**: tanpa error konsol; **Actual**: `Failed to load resource: 401 (Unauthorized)` — `GET /api/auth/me` dijalankan layout untuk cek sesi sebelum login.
- **Reproduction**: buka halaman login tanpa sesi → buka DevTools → konsol.
- **Note**: bukan bug fungsional (perilaku memang *unauthorized* sebelum login), hanya noise di konsol. Fix opsional: hindari log 401 dengan `catch` di sisi client sudah ada; noise berasal dari browser network log, bukan error aplikasi.
- **Evidence**: `qa-evidence.json` → `failedRequests`.

### ISSUE-002 — Tombol aksi tabel desktop bertuliskan "Update" tanpa kata "Status" (Severity: Low, Category: UX)
- **URL**: `/dashboard/weekly` (tampilan desktop, kolom aksi)
- **Expected**: label jelas "Update Status"; **Actual**: tombol tertulis "Update" (ikon RefreshCw), label lengkap hanya di `title` tooltip.
- **Reproduction**: buka Weekly di desktop → kolom kanan tabel.
- **Note**: membingungkan sedikit bagi pengguna baru; versi mobile sudah memakai "Status".

### ISSUE-003 — Tombol ikon tanpa aria-label (Severity: Low, Category: Accessibility)
- **URL**: halaman Weekly, Users, dan modal-modal
- **Expected**: tombol ikon (Edit `Pencil`, tutup modal `X`) punya `aria-label`; **Actual**: label hanya via `title` tooltip.
- **Reproduction**: inspect button `<Pencil size={15}/>` di tabel Weekly desktop.
- **Note**: screen reader membacakan tombol tanpa nama; tooltip `title` tidak cukup untuk aksesibilitas.

## Covered vs Skipped

- **Covered**: login, 7 halaman utama, form tambah aktivitas (full flow), modal status, modal logout, sidebar mobile (buka/tutup), console/HTTP errors.
- **Skipped**: edit & update status actual (perubahan data riil) — sengaja dihindari agar data produksi tidak berubah; export CSV/Excel tidak diverifikasi isi file; pengecekan visual screenshot manual oleh manusia (screenshot tersedia di `screenshots/`).
