import "dotenv/config"
import { PrismaClient } from '@prisma/client'

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return
  const client = process.env.DB_CLIENT || "postgresql"
  const user = process.env.DB_USERNAME || process.env.DB_USER
  const password = process.env.DB_PASSWORD || process.env.DB_PASS
  const host = process.env.DB_HOST || "127.0.0.1"
  const port = process.env.DB_PORT || "5432"
  const db = process.env.DB_DATABASE || process.env.DB_NAME
  const schema = process.env.DB_SCHEMA || "public"
  if (user && password && host && db) {
    const auth = encodeURIComponent(user) + ":" + encodeURIComponent(password)
    const hostPort = port ? `${host}:${port}` : host
    process.env.DATABASE_URL = `${client}://${auth}@${hostPort}/${db}?schema=${encodeURIComponent(schema)}`
  }
}
ensureDatabaseUrl()

const prisma = new PrismaClient()

interface SeedUser {
  nama: string
  email: string
  jabatan: string
  unit: string
  group: 'A' | 'B' | 'C'
}

// Data user sesuai Portal SSO: unit Sistem & IT beserta turunannya (IT + MR & HSSE).
const staff: SeedUser[] = [
  { nama: 'Oka Aritonang', email: 'oka@inl.co.id', jabatan: 'Kepala Sub Bagian Sistem dan IT', unit: 'Sistem & IT', group: 'B' },
  { nama: 'RINKO', email: 'rinko@inl.co.id', jabatan: 'IT Spesialist', unit: 'IT', group: 'A' },
  { nama: 'Tomy Inri Akbar Lingga', email: 'tomy.troller@gmail.com', jabatan: 'Asisten IT', unit: 'IT', group: 'A' },
  { nama: 'Developer 1', email: 'dev1@inl.co.id', jabatan: 'IT Dev', unit: 'IT', group: 'A' },
  { nama: 'Salman Jaya Sempurna', email: 'salman@inl.co.id', jabatan: 'Admin Network & Data Center', unit: 'IT', group: 'A' },
  { nama: 'AUNDRY HERMAWAN', email: 'aundry@inl.co.id', jabatan: 'Admin Network & Data Center', unit: 'IT', group: 'A' },
  { nama: 'Herbina Silaban', email: 'herbina@inl.co.id', jabatan: 'Asisten MR & HSSE', unit: 'MR & HSSE', group: 'B' },
  { nama: 'Fitri Febriadi Turnip', email: 'fitri@inl.co.id', jabatan: 'Asisten MR & HSSE', unit: 'MR & HSSE', group: 'C' },
  { nama: 'Muhammad Agung Prayoga', email: 'agung@inl.co.id', jabatan: 'Admin HSSE', unit: 'MR & HSSE', group: 'C' },
  { nama: 'Gilang Syafrizal Piliang', email: 'gilang@inl.co.id', jabatan: 'Admin HSSE', unit: 'MR & HSSE', group: 'C' },
  { nama: 'Hendry Suhery Lubis', email: 'hendry@inl.co.id', jabatan: 'Danton', unit: 'MR & HSSE', group: 'C' },
]

const parentPrograms = [
  {
    id: 'PK-A',
    kode: 'A',
    namaProgram: 'ENABLING DIGITAL AND RELIABLE OPERATION',
    deskripsi: 'Program Kerja Pengembangan IT, Digitalisasi, Infrastruktur Jaringan & Pembayaran IT',
    tahun: 2026,
  },
  {
    id: 'PK-B',
    kode: 'B',
    namaProgram: 'DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS',
    deskripsi: 'Program Kerja Audit Internal/Eksternal, Sertifikasi ISO/RSPO/Halal, Inspeksi Supplier & Lisensi',
    tahun: 2026,
  },
  {
    id: 'PK-C',
    kode: 'C',
    namaProgram: 'HEALTH, SAFETY AND ENVIRONMENT (HSE)',
    deskripsi: 'Program Kerja Penanggulangan Darurat, Training HSE, Risk Management, Inspeksi & Laporan HSE',
    tahun: 2026,
  },
]

const childPrograms = [
  // 2026
  { id: 'PROG-A1-2026', programKerjaId: 'PK-A', kode: 'A.1', namaItem: 'IT Development', status: 'On Progress', progress: 85, tahun: 2026, keterangan: 'Pengembangan aplikasi SmartWB, SAP, e-SIH, dan integrasi sistem RFID & AI CCTV' },
  { id: 'PROG-A2-2026', programKerjaId: 'PK-A', kode: 'A.2', namaItem: 'IT Network & Infrastructure', status: 'On Progress', progress: 78, tahun: 2026, keterangan: 'Pemeliharaan perangkat jaringan, router, switch pabrik, dan koneksi ISP' },
  { id: 'PROG-A3-2026', programKerjaId: 'PK-A', kode: 'A.3', namaItem: 'IT Administration, Tagihan & Pembayaran IT', status: 'On Progress', progress: 90, tahun: 2026, keterangan: 'Pengelolaan administrasi lisensi, invoice vendor IT, serta pelatihan staff' },
  { id: 'PROG-B1-2026', programKerjaId: 'PK-B', kode: 'B.1', namaItem: 'Audit Internal, Audit Eksternal & Management Review', status: 'On Progress', progress: 72, tahun: 2026, keterangan: 'Pelaksanaan audit tata kelola berkala dan kaji ulang manajemen' },
  { id: 'PROG-B2-2026', programKerjaId: 'PK-B', kode: 'B.2', namaItem: 'Inspeksi & Monitoring Supplier (Vendor), Update Lisensi & HPS', status: 'On Progress', progress: 65, tahun: 2026, keterangan: 'Evaluasi kinerja vendor dan pembaruan lisensi operasional' },
  { id: 'PROG-B3-2026', programKerjaId: 'PK-B', kode: 'B.3', namaItem: 'Sertifikat Eksternal (ISO 9001, RSPO, Halal, Kosher, CPPOB, SNI)', status: 'On Progress', progress: 88, tahun: 2026, keterangan: 'Pemeliharaan & perpanjangan 12 sertifikasi resmi eksternal' },
  { id: 'PROG-C1-2026', programKerjaId: 'PK-C', kode: 'C.1', namaItem: 'Emergency Preparedness & HSE Training', status: 'On Progress', progress: 80, tahun: 2026, keterangan: 'Kesiapsiagaan tanggap darurat dan pelatihan K3 berkala' },
  { id: 'PROG-C2-2026', programKerjaId: 'PK-C', kode: 'C.2', namaItem: 'Risk Management, Regulation & HSE Inspection', status: 'On Progress', progress: 75, tahun: 2026, keterangan: 'Manajemen risiko lingkungan kerja, kepatuhan regulasi & inspeksi rutin' },
  { id: 'PROG-C3-2026', programKerjaId: 'PK-C', kode: 'C.3', namaItem: 'HSE Report, HSE Meeting & Health Living Moment', status: 'On Progress', progress: 82, tahun: 2026, keterangan: 'Pelaporan K3 bulanan, rapat evaluasi HSE & gerakan hidup sehat' },

  // 2025
  { id: 'PROG-A1-2025', programKerjaId: 'PK-A', kode: 'A.1', namaItem: 'Legacy System Migration & SAP Rollout', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Migrasi database ERP lama ke SAP S/4HANA (2025)' },
  { id: 'PROG-A2-2025', programKerjaId: 'PK-A', kode: 'A.2', namaItem: 'Fiber Optic Backbone Installation', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Pemasangan kabel fiber optik area pabrik Sei Mangkei (2025)' },
  { id: 'PROG-A3-2025', programKerjaId: 'PK-A', kode: 'A.3', namaItem: 'IT Infrastructure Renewal 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Pembaruan perangkat lunak & hardware server (2025)' },
  { id: 'PROG-B1-2025', programKerjaId: 'PK-B', kode: 'B.1', namaItem: 'Audit ISO 27001 Readiness', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Persiapan awal audit Sistem Manajemen Keamanan Informasi (2025)' },
  { id: 'PROG-B2-2025', programKerjaId: 'PK-B', kode: 'B.2', namaItem: 'Vendor Audit & Assessment 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Penilaian kepatuhan vendor IT & pabrik (2025)' },
  { id: 'PROG-B3-2025', programKerjaId: 'PK-B', kode: 'B.3', namaItem: 'Halal & ISO Renewal 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Perpanjangan lisensi Halal & ISO 9001 (2025)' },
  { id: 'PROG-C1-2025', programKerjaId: 'PK-C', kode: 'C.1', namaItem: 'Annual Fire Drill 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Pelatihan kebakaran & evakuasi karyawan (2025)' },
  { id: 'PROG-C2-2025', programKerjaId: 'PK-C', kode: 'C.2', namaItem: 'Safety Risk Mapping 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Pemetaan potensi risiko K3 di pabrik (2025)' },
  { id: 'PROG-C3-2025', programKerjaId: 'PK-C', kode: 'C.3', namaItem: 'HSE Monthly Review 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Kaji ulang bulanan implementasi K3 (2025)' },
]

const taskPool: Record<'A' | 'B' | 'C', { itemName: string; task: string; action: string }[]> = {
  A: [
    { itemName: 'IT Development', task: 'Pengembangan & pemeliharaan fitur e-SIH', action: 'Integrasi SSO, dashboard eksekutif, dan sinkronisasi data master' },
    { itemName: 'IT Network & Infrastructure', task: 'Monitoring jaringan dan failover ISP', action: 'Pengecekan router, switch core, dan koneksi antar site' },
    { itemName: 'IT Administration, Tagihan & Pembayaran IT', task: 'Pengelolaan lisensi dan tagihan vendor IT', action: 'Verifikasi invoice, pembaruan lisensi, dan administrasi aset IT' },
  ],
  B: [
    { itemName: 'Audit Internal, Audit Eksternal & Management Review', task: 'Pelaksanaan audit internal kepatuhan', action: 'Pemeriksaan dokumen SOP dan penyusunan laporan temuan' },
    { itemName: 'Inspeksi & Monitoring Supplier (Vendor), Update Lisensi & HPS', task: 'Inspeksi dan evaluasi kinerja vendor', action: 'Verifikasi sertifikat, penilaian SLA, dan pembaruan lisensi' },
    { itemName: 'Sertifikat Eksternal (ISO 9001, RSPO, Halal, Kosher, CPPOB, SNI)', task: 'Perpanjangan sertifikasi eksternal', action: 'Koordinasi auditor dan pengajuan dokumen perpanjangan' },
  ],
  C: [
    { itemName: 'Emergency Preparedness & HSE Training', task: 'Simulasi tanggap darurat dan drill K3', action: 'Pelaksanaan drill, pengecekan APAR, dan evaluasi evakuasi' },
    { itemName: 'Risk Management, Regulation & HSE Inspection', task: 'Inspeksi rutin keselamatan kerja', action: 'Inspeksi APD, rambu K3, dan identifikasi potensi bahaya' },
    { itemName: 'HSE Report, HSE Meeting & Health Living Moment', task: 'Penyusunan laporan HSE bulanan', action: 'Rekap insiden, safety briefing, dan rapat evaluasi HSE' },
  ],
}

const highlightSamples = [
  // Januari
  { bulan: 1, item: 'Kick-off Digitalisasi SmartWB & Evaluasi Sistem ERP', description: 'Penyusunan blueprint arsitektur sistem SmartWB dan evaluasi kebutuhan lisensi pengguna.', actionToBeTaken: 'Finalisasi kebutuhan server dan pembagian task developer IT.', namePic: 'RINKO / Fitri Febriadi Turnip', targetDate: '2026-01-25', status: 'Closed', closedDate: '2026-01-24', remarks: 'Penyusunan blueprint selesai dan disetujui Kabag.', bagian: 'IT' },
  { bulan: 1, item: 'Audit Internal Kepatuhan ISO 9001:2015 Periode Q1', description: 'Pemeriksaan dokumen SOP operational pabrik Sei Mangkei.', actionToBeTaken: 'Penyusunan laporan temuan audit dan distribusi rekomendasi perbaikan.', namePic: 'Herbina Silaban', targetDate: '2026-01-30', status: 'Closed', closedDate: '2026-01-29', remarks: 'Temuan audit telah diselesaikan oleh masing-masing unit.', bagian: 'SISTEM' },
  // Februari
  { bulan: 2, item: 'Upgrade Bandwidth Failover ISP Pabrik', description: 'Peningkatan kapasitas bandwidth jaringan backup ISP dari 50Mbps ke 100Mbps.', actionToBeTaken: 'Instalasi router mikrotik baru dan pengujian failover otomatis.', namePic: 'Tomy Inri Akbar Lingga / Salman Jaya Sempurna', targetDate: '2026-02-20', status: 'Closed', closedDate: '2026-02-18', remarks: 'Koneksi failover berjalan stabil tanpa lag.', bagian: 'IT' },
  { bulan: 2, item: 'Persiapan Audit Sertifikasi Halal BPJPH', description: 'Verifikasi dokumen bahan baku dan sistem jaminan produk halal (SJPH).', actionToBeTaken: 'Pendampingan auditor eksternal selama inspeksi pabrik.', namePic: 'Herbina Silaban', targetDate: '2026-02-28', status: 'Closed', closedDate: '2026-02-27', remarks: 'Sertifikat Halal diterbitkan resmi.', bagian: 'SISTEM' },
  // Maret
  { bulan: 3, item: 'Pengembangan Modul AI CCTV Vehicle Counting', description: 'Pelatihan model AI untuk mendeteksi jenis kendaraan tangki CPO.', actionToBeTaken: 'Integrasi modul AI dengan antrean timbangan digital.', namePic: 'RINKO / Salman Jaya Sempurna', targetDate: '2026-03-25', status: 'Closed', closedDate: '2026-03-24', remarks: 'Akurasi deteksi AI mencapai 96.5%.', bagian: 'IT' },
  // April
  { bulan: 4, item: 'Pelatihan Tanggap Darurat & Drill Damkar Pabrik', description: 'Simulasi penanganan keadaan darurat kebakaran untuk seluruh karyawan refinery.', actionToBeTaken: 'Pengujian fungsi hydrant dan APAR di titik vital operasional.', namePic: 'Fitri Febriadi Turnip', targetDate: '2026-04-18', status: 'Closed', closedDate: '2026-04-18', remarks: 'Seluruh karyawan lulus pengujian simulasi.', bagian: 'HSSE' },
  // Mei
  { bulan: 5, item: 'Renewal Lisensi Software & Database Security Patch', description: 'Pembaruan lisensi antivirus enterprise dan patching kerentanan database SQL.', actionToBeTaken: 'Penerapan patch keamanan pada server staging dan produksi.', namePic: 'Salman Jaya Sempurna / Tomy Inri Akbar Lingga', targetDate: '2026-05-15', status: 'Closed', closedDate: '2026-05-14', remarks: 'Patching sukses tanpa downtime.', bagian: 'IT' },
  // Juni
  { bulan: 6, item: 'Audit Kesiapsiagaan Sistem Keamanan Informasi (ISO 27001)', description: 'Review kebijakan privasi data dan hak akses akun karyawan.', actionToBeTaken: 'Pemberlakuan Multi-Factor Authentication (MFA) pada portal internal.', namePic: 'RINKO / AUNDRY HERMAWAN', targetDate: '2026-06-28', status: 'Closed', closedDate: '2026-06-25', remarks: 'MFA telah aktif untuk seluruh pengguna admin.', bagian: 'IT' },
  // Juli
  { bulan: 7, item: 'Inspeksi & Evaluasi Kinerja Vendor IT Hardware', description: 'Penilaian SLA perbaikan perangkat komputer dan jaringan dari vendor mitra.', actionToBeTaken: 'Penyusunan skor vendor dan rekomendasi kontrak perpanjangan.', namePic: 'Herbina Silaban / Tomy Inri Akbar Lingga', targetDate: '2026-07-22', status: 'Closed', closedDate: '2026-07-21', remarks: 'Evaluasi vendor selesai tepat waktu.', bagian: 'IT' },
  // Agustus (Highlight Report INLHO/REP-F/-021)
  { bulan: 8, item: 'Rencana Pindah ke KPBN', description: 'Sudah konfirmasi ke bagian Asset KPBN rencana Kamis mau bertemu dengan Pak Erwin Kasubag Optimalisasi Asset Jam 10 di KPBN Medan.\nSelanjutnya kamis siang Rencana Mau bertemu dengan Buk Rizky dikandir N3 bagian Pertahanan mengenai bagaimana prosedur proses pelepasan Mess Gedung medan', actionToBeTaken: '', namePic: 'Oka Aritonang / SDM / Sekper', targetDate: '2026-08-21', status: 'Open', remarks: 'Hasil analisa sudah selesai, Memo sudah diserahkan ke bagian Sekper agar diriview.', bagian: 'SISTEM' },
  { bulan: 8, item: 'Seleksi security Sei Mangkei', description: 'Seleksi nya akan dilakukan dgn 2 Opsi:\nOpsi 1. Minta bantuan tool Security yang pemenang\nOpsi 2. Internal INL. Sebagai catatan : Setelah pemenang ditentukan minggu ini', actionToBeTaken: '', namePic: 'Oka Aritonang / HSSE', targetDate: '2026-08-25', status: 'Open', remarks: '- Pemenang sudah ditetapkan,\n- Seleksi atas personil lama akan selesai tgl. 12 Jul 24.\n- Setelah itu akan ditetapkan personil baru\n\n(Nama-nama security, foto serta pengalaman security sei mangkei untuk diseleksi terlampir)', bagian: 'HSSE' },
  { bulan: 8, item: 'Sertifikasi ISCC SBE', description: 'Meeting internal HSSE mengenai peluang Sertifikasi ISCC SBE peluang penurunan Harga SBE sekarang Rp.380/kg turun menjadi Rp.250/kg sekitar Rp.150.\nNamun masih butuh studi, dalam minggu ini akan clear', actionToBeTaken: '', namePic: 'Oka Aritonang / HSSE', targetDate: '2026-08-20', status: 'Open', remarks: 'Meeting dengan Mega grand terkait tindaklanjut ISCC SBE menetapkan kerjasama tgl. 11 serta akhir Jul ada kunjungan ke dumai.', bagian: 'HSSE' },
  { bulan: 8, item: 'Perbantuan/ Pemanfaatan untuk personil cleaning area Refinery', description: 'Pemanfaatan Operator Loader untuk pengangkutan limbah SBE akan diperbantukan sebagai cleaning di sekitar Refinery.\nAnalisanya pekerjaan operator setelah angkut SBE tidak mempunyai kegiatan lagi. Sehingga diperbantukan/ dimanfaatkan sebagai tenaga cleaning.', actionToBeTaken: '', namePic: 'Oka Aritonang / SDM', targetDate: '2026-08-15', closedDate: '2026-08-15', status: 'Closed', remarks: 'Minggu ini akan terealisasi.', bagian: 'HSSE' },
  { bulan: 8, item: 'Kegiatan Jumat Bersih', description: 'Jumat ini akan dilakukan Jumat bersih area sekitar Pump House dan Refinery.', actionToBeTaken: '', namePic: 'Oka Aritonang', targetDate: '2026-08-14', closedDate: '2026-08-14', status: 'Closed', remarks: 'Memo akan di share', bagian: 'HSSE' },
  { bulan: 8, item: 'Review proses bisnis project Management', description: 'Review proses bisnis project Management sudah dibahas secara internal dengan Pak Ipan dan Tim Andika.\nAda penambahan terkait pengawasan dan Monitoring setiap Project.', actionToBeTaken: '', namePic: 'Oka Aritonang', targetDate: '2026-08-28', status: 'Open', remarks: 'On Progress.\nSosialisasi akan dilakukan minggu depan', bagian: 'SISTEM' },
  { bulan: 8, item: 'Review Proses Bisnis Marketing dan sales', description: 'Review Proses Bisnis Marketing dan sales sudah dilakukan dan telah direview oleh Pak Mehaga, saran Pak mehaga agar direview Tim risiko manajemen sebelum ke tim BCG.', actionToBeTaken: '', namePic: 'Oka Aritonang', targetDate: '2026-08-29', status: 'Open', remarks: 'On Progress.\nAkan diskusi dengan Tim MR', bagian: 'SISTEM' },
  // September
  { bulan: 9, item: 'Migrasi Server Cloud Staging ke Data Center Lokal', description: 'Persiapan migrasi server cloud untuk pemenuhan kepatuhan privasi data lokal.', actionToBeTaken: 'Penyusunan alur sinkronisasi data dan pengujian latensi.', namePic: 'Salman Jaya Sempurna / Tomy Inri Akbar Lingga', targetDate: '2026-09-25', status: 'On Progress', remarks: 'Tahap konfigurasi firewall dan pengujian koneksi.', bagian: 'IT' },
  // Oktober
  { bulan: 10, item: 'Inspeksi Fasilitas K3 & Sertifikasi Alat Berat', description: 'Pemeriksaan rutin kelayakan operasional forklift dan boiler pabrik.', actionToBeTaken: 'Pengajuan perpanjangan sertifikat ke Disnaker.', namePic: 'Fitri Febriadi Turnip', targetDate: '2026-10-20', status: 'Open', remarks: 'Pemeriksaan fisik dijadwalkan minggu kedua.', bagian: 'HSSE' },
  // November
  { bulan: 11, item: 'Penyusunan RKAP Program Kerja Sistem & IT Tahun 2027', description: 'Perencanaan anggaran dan daftar target pengembangan IT untuk tahun depan.', actionToBeTaken: 'Rapat konsolidasi kebutuhan perangkat lunak dan infrastruktur.', namePic: 'RINKO / Herbina Silaban', targetDate: '2026-11-28', status: 'Open', remarks: 'Draf awal RKAP sedang disusun.', bagian: 'IT' },
  // Desember
  { bulan: 12, item: 'Evaluasi Tahunan & Closing Audit Kinerja SDM & IT', description: 'Laporan pencapaian KPI bulanan dan penyelesaian seluruh highlight report 2026.', actionToBeTaken: 'Ekspor laporan rekapitulasi eksekutif akhir tahun.', namePic: 'RINKO / Herbina Silaban / Fitri Febriadi Turnip', targetDate: '2026-12-25', status: 'Open', remarks: 'Persiapan rekapitulasi data akhir tahun.', bagian: 'SISTEM' },
]

async function main() {
  console.log('Clearing old data...')
  await (prisma as any).highlight.deleteMany()
  await (prisma as any).activity.deleteMany()
  await (prisma as any).ref_Item_ProgramKerja.deleteMany()
  await (prisma as any).ref_ProgramKerja.deleteMany()

  console.log('Seeding Parent Program Kerja (A, B, C)...')
  for (const parent of parentPrograms) {
    await (prisma as any).ref_ProgramKerja.create({ data: parent })
  }

  console.log('Seeding Sub-Program (Child Items)...')
  for (const child of childPrograms) {
    await (prisma as any).ref_Item_ProgramKerja.create({ data: child })
  }

  console.log('Seeding quality operational activity records...')
  let globalNo = 1
  const activityBatch: any[] = []

  const pushActivity = (params: {
    year: number
    user: SeedUser
    task: { itemName: string; task: string; action: string }
    startDate: string
    dueDate: string
    closedDate: string | null
    status: 'Closed' | 'On Progress' | 'Open'
    tindakLanjut: string
    kendala: string
    remarks: string
    kegiatanText: string
    descriptionText: string
  }) => {
    const progKode = params.user.group
    const itemId = `PROG-${progKode}${['A', 'B', 'C'].indexOf(progKode) + 1}-${params.year}`

    activityBatch.push({
      id: `ACT-${String(globalNo).padStart(4, '0')}`,
      no: globalNo,
      idProgram: itemId,
      kategoriProgram: `${progKode} ${parentPrograms.find(p => p.kode === progKode)?.namaProgram || ''}`,
      itemName: params.task.itemName,
      kegiatan: params.kegiatanText,
      descriptionAction: params.descriptionText,
      startDate: params.startDate,
      dueDate: params.dueDate,
      closedDate: params.closedDate,
      status: params.status,
      tindakLanjut: params.tindakLanjut,
      kendala: params.kendala,
      remarks: params.remarks,
      picEmail: params.user.email,
      picNama: params.user.nama,
      isActive: true,
    })
    globalNo++
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  // 2026 activities: deterministic, realistic, and spread across the year.
  staff.forEach((user, userIdx) => {
    const tasks = taskPool[user.group]
    for (let month = 1; month <= 12; month++) {
      const m = pad(month)

      // Variasi realistis antar bulan dan antar user.
      const closedCount = 3 + ((month + userIdx) % 3) // 3-5
      const progressCount = month % 3 === 0 ? 2 : 1
      const openCount = month % 4 === 0 ? 1 : (month === 1 ? 1 : 0)

      for (let c = 0; c < closedCount; c++) {
        const day = Math.min(20, (c + 1) * 3)
        const date = `${2026}-${m}-${pad(day)}`
        const task = tasks[c % tasks.length]
        pushActivity({
          year: 2026,
          user,
          task,
          startDate: date,
          dueDate: date,
          closedDate: date,
          status: 'Closed',
          tindakLanjut: 'Selesai dan terverifikasi',
          kendala: '',
          remarks: 'Selesai sesuai target',
          kegiatanText: `${task.task} (${user.unit} - #${c + 1})`,
          descriptionText: `${task.action} - PIC: ${user.nama}`,
        })
      }

      for (let p = 0; p < progressCount; p++) {
        const day = 18 + p
        const date = `${2026}-${m}-${pad(day)}`
        const task = tasks[(p + 1) % tasks.length]
        pushActivity({
          year: 2026,
          user,
          task,
          startDate: date,
          dueDate: `${2026}-${m}-${pad(28)}`,
          closedDate: null,
          status: 'On Progress',
          tindakLanjut: 'Dalam proses validasi',
          kendala: '',
          remarks: 'Dipantau oleh PIC',
          kegiatanText: `${task.task} (Progres #${p + 1})`,
          descriptionText: `Tahap pengerjaan: ${task.action}`,
        })
      }

      for (let o = 0; o < openCount; o++) {
        const day = 24 + o
        const date = `${2026}-${m}-${pad(day)}`
        const task = tasks[(o + 2) % tasks.length]
        pushActivity({
          year: 2026,
          user,
          task,
          startDate: date,
          dueDate: `${2026}-${m}-${pad(28)}`,
          closedDate: null,
          status: 'Open',
          tindakLanjut: 'Menunggu alokasi / koordinasi',
          kendala: 'Menunggu koordinasi lintas unit',
          remarks: 'Perlu perhatian',
          kegiatanText: `${task.task} (Pending #${o + 1})`,
          descriptionText: `Persiapan pengerjaan: ${task.action}`,
        })
      }
    }
  })

  // Light 2025 historical data (3 representative users).
  const historyUsers = staff.filter(u => ['RINKO', 'Herbina Silaban', 'Fitri Febriadi Turnip'].includes(u.nama))
  historyUsers.forEach((user, userIdx) => {
    const tasks = taskPool[user.group]
    for (let month = 1; month <= 12; month++) {
      const m = pad(month)
      const date = `${2025}-${m}-${pad(6 + (month % 5))}`
      const task = tasks[month % tasks.length]
      pushActivity({
        year: 2025,
        user,
        task,
        startDate: date,
        dueDate: date,
        closedDate: date,
        status: 'Closed',
        tindakLanjut: 'Selesai historis',
        kendala: '',
        remarks: 'Baseline 2025',
        kegiatanText: `${task.task} (2025 #${month})`,
        descriptionText: `${task.action} - PIC: ${user.nama}`,
      })
    }
  })

  console.log(`Inserting ${activityBatch.length} activity records...`)
  const chunkSize = 200
  for (let i = 0; i < activityBatch.length; i += chunkSize) {
    const chunk = activityBatch.slice(i, i + chunkSize)
    await (prisma as any).activity.createMany({ data: chunk })
  }

  console.log('Seeding monthly highlight reports (2026)...')
  for (const [i, h] of highlightSamples.entries()) {
    await (prisma as any).highlight.create({
      data: { ...h, tahun: 2026, no: i + 1 },
    })
  }

  console.log('✅ Seeding Completed Successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
