# Panduan Cara Pasang & Deploy Web App e-SIH di Google Apps Script (GAS)

Aplikasi **e-SIH** (Highlight Report & Weekly Activity Tracking) ini dibangun menggunakan Google Apps Script (GAS) dan terintegrasi langsung dengan Google Sheets sebagai database.

---

## 🚀 Langkah 1: Buat Google Sheet & Buka Script Editor

1. Buka [Google Sheets](https://sheets.google.com) dan buat **Spreadsheet Baru**.
2. Beri nama Spreadsheet, misalnya: `Database e-SIH 2026`.
3. Pada menu atas, klik **Ekstensi** > **Apps Script** (`Extensions` > `Apps Script`).

---

## 📂 Langkah 2: Salin File Proyek ke Script Editor

Buat file-file berikut di dalam Script Editor dengan nama yang **persis sama** (hapus ekstensi saat membuat file HTML di GAS Editor):

1. **`Code.gs`** (File Script/GS):
   * Salin seluruh isi file [`Code.gs`](file:///d:/SMKAW02PDN/Laporan%20PKL/Project/e-SIH/Code.gs).
2. **`Index.html`** (File HTML):
   * Klik tombol `+` > `HTML`, beri nama `Index`.
   * Salin seluruh isi file [`Index.html`](file:///d:/SMKAW02PDN/Laporan%20PKL/Project/e-SIH/Index.html).
3. **`Styles.html`** (File HTML):
   * Klik tombol `+` > `HTML`, beri nama `Styles`.
   * Salin seluruh isi file [`Styles.html`](file:///d:/SMKAW02PDN/Laporan%20PKL/Project/e-SIH/Styles.html).
4. **`JavaScript.html`** (File HTML):
   * Klik tombol `+` > `HTML`, beri nama `JavaScript`.
   * Salin seluruh isi file [`JavaScript.html`](file:///d:/SMKAW02PDN/Laporan%20PKL/Project/e-SIH/JavaScript.html).
5. **`DashboardView.html`** (File HTML):
   * Klik tombol `+` > `HTML`, beri nama `DashboardView`.
   * Salin seluruh isi file [`DashboardView.html`](file:///d:/SMKAW02PDN/Laporan%20PKL/Project/e-SIH/DashboardView.html).
6. **`ActivitiesView.html`** (File HTML):
   * Klik tombol `+` > `HTML`, beri nama `ActivitiesView`.
   * Salin seluruh isi file [`ActivitiesView.html`](file:///d:/SMKAW02PDN/Laporan%20PKL/Project/e-SIH/ActivitiesView.html).

---

## 🛠️ Langkah 3: Inisialisasi Database Google Sheets

1. Di Script Editor, pilih fungsi **`initDatabase`** di dropdown menu atas.
2. Klik tombol **Run** (Jalankan).
3. Berikan izin akses (*Review Permissions*) saat pertama kali muncul popup autentikasi Google.
4. Fungsi ini akan **otomatis membuat 3 sheet** lengkap dengan header & data sampel sesuai gambar referensi:
   * `Users` (Mendaftarkan email & role Pimpinan / Bawahan)
   * `Master_Program` (Kategori Program Kerja A, B, C)
   * `Weekly_Activities` (Data Laporan Aktivitas)

---

## 🌐 Langkah 4: Deploy Web App

1. Di pojok kanan atas Apps Script Editor, klik **Deploy** > **New deployment** (Penerapan Baru).
2. Klik ikon gerigi ⚙️ di sebelah *Select type*, pilih **Web app**.
3. Isi konfigurasi:
   * **Description**: `e-SIH Web App v1.0`
   * **Execute as**: `User accessing the web app` (atau `Me` jika menggunakan akun layanan)
   * **Who has access**: `Anyone within [Domain Anda]` ATAU `Anyone with Google Account`
4. Klik **Deploy** dan salin **Web App URL**.
5. Buka Web App URL tersebut di browser untuk mulai menggunakan e-SIH!

---

## 🔐 Cara Kerja Hak Akses (2 Role)

* **Pimpinan Sub Bag**:
  * Didaftarkan di sheet `Users` dengan Role `Pimpinan` (atau email yang mengandung kata `pimpinan`/`admin`).
  * Memiliki akses penuh ke **Executive Dashboard**, statistik KPI (*Open, Closed, Closure Rate %*), *Overall Program Performance*, serta dapat memfilter dan mengedit seluruh tugas staf bawahan.
* **Bawahan / Staff**:
  * Didaftarkan di sheet `Users` dengan Role `Bawahan`.
  * Saat membuka Web App, sistem secara otomatis mengenali email Google user dan **hanya menampilkan laporan milik staf bersangkutan**.
