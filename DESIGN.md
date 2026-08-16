# DESIGN.md - e-SIH Operation

> **Peringatan jujur (R-37):** dokumen ini disusun oleh AI agent atas pilihan user ("Agent yang membuat DESIGN.md"). Arah gaya yang dihasilkan agent cenderung rasa default AI, yang berisiko monoton. Dokumen ini adalah **titik awal, bukan keputusan final**: tinjau dan ubah sesuai identitas sebenarnya Sub Bagian Sistem & IT PT Industri Nabati Lestari.

## Produk

e-SIH (System Highlight Report & Activity Tracking) adalah aplikasi internal enterprise untuk pelaporan dan monitoring aktivitas kerja Sub Bagian Sistem & IT. Masuk melalui Portal SSO perusahaan. Pengguna: staf IT (mengisi laporan aktivitas) dan kepala unit/manajemen (memantau realisasi program kerja).

## Prinsip

1. **Data-dense tapi terbaca**: dashboard memuat banyak angka; kepadatan boleh tinggi, keterbacaan tidak boleh dikorbankan (minimal 12px untuk konten sekunder, 14px untuk konten utama).
2. **Tenang dan tepercaya**: tidak ada efek dekoratif yang bersaing dengan data. Efek hanya untuk menandai hierarki.
3. **Fungsional dulu**: setiap elemen interaktif punya perilaku nyata; setiap angka punya sumber (data API, bukan klaim).
4. **Konsisten**: satu bahasa visual di semua halaman; variasi hanya untuk hierarki, bukan demi variasi.

## Dial (Liveliness Toolkit)

- **ENERGY 1** (kalem): intro tidak berteriak; fokus pada keterbacaan dan kepercayaan.
- **RHYTHM 2** (konsisten dengan beberapa jeda): grid seragam sebagai tulang punggung; satu/tiga momen variasi (mis. kartu KPI vs daftar vs chart).
- **MOTION 1** (hover states only): tanpa scroll-reveal, tanpa marquee berjalan, tanpa animasi masuk berlapis. Transisi hanya untuk umpan balik interaksi.

## Palet

- **Core 1 - Hijau brand (existing)**: `#006837` (primary, aksi, angka kunci) dengan deret turunan (50-900) yang sudah ada di `globals.css`.
- **Core 2 - Neutral slate**: `#0f172a` s/d `#f1f5f9` (teks, background, border).
- **Accent 1 - Amber**: `#f59e0b` hanya untuk status "On Progress" / perhatian.
- **Warna status semantik** (tidak dihitung sebagai palette): emerald `#16a34a` (Closed/sukses), red `#dc2626` (Open/error/gagal).
- **Terlarang**: warna dekoratif lain (sky/purple/rose/indigo) untuk elemen non-semantik; gradien dekoratif; glow.

## Tipografi

- **Inter** (sudah dipakai), bobot: 400 (body), 500/600 (label & nilai sekunder), 700 (judul). **Tidak ada font-black** untuk konten; `font-black` hanya untuk angka KPI besar (dipilih dengan sengaja, maksimal 2 per layar).
- Tidak ada label uppercase + tracking lebar, kecuali header kolom tabel data.
- Tidak ada monospace kecuali untuk nilai teknis nyata (kode program, App ID).

## Komponen

- **Kartu**: background putih, border `slate-200`, radius `rounded-xl` (0.75rem) seragam, shadow `shadow-sm` maksimal. **Bukan** neumorphism (tanpa inset/double shadow, tanpa gradient).
- **Tombol**: primary = hijau brand solid; sekunder = outline slate; danger = red solid hanya untuk aksi destruktif. Radius `rounded-lg` (0.5rem), bukan pill.
- **Badge**: hanya untuk status fungsional (ADMIN/USER, status aktivitas, persentase progres). Radius `rounded-md`, tanpa glow, tanpa border ganda.
- **Input/select**: border slate, focus ring hijau 2px, tanpa inset shadow.
- **Sidebar aktif**: background hijau 50 + teks hijau 800 + border kiri 3px hijau (bukan glow ring).
- **Progress bar**: satu warna per segmen semantik, `rounded-full` hanya untuk track.

## Spacing & Layout

- Grid konsisten: gap 4-6, padding kartu 5-6, page padding 4-6.
- Satu focal point per layar: pada dashboard admin, fokus utama = angka realisasi + chart tren; elemen lain mendefer.

## Yang Tidak Dipakai (penghapusan)

- Neumorphism (`neu-*`), marquee berjalan, edge-blur, dot-grid pattern, glow chart, animasi stagger, badge dekoratif, palette 6 warna, teks 10px/11px di bawah standar keterbacaan.

## Motif Identitas (proposal awal, perlu review user)

Bar footer status berhenti berjalan dan menjadi bar statis ramping dengan hijau brand sebagai aksen kiri; nama "e-SIH Operation" + tahun berjalan sebagai tanda tangan konsisten di semua halaman.