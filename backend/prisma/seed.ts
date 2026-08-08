import "dotenv/config"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing old data...')
  await prisma.activity.deleteMany()
  await prisma.masterProgram.deleteMany()
  await prisma.programKerja.deleteMany()

  console.log('Seeding Parent Program Kerja (A, B, C)...')
  const parentPrograms = [
    {
      id: 'PK-A',
      kode: 'A',
      namaProgram: 'ENABLING DIGITAL AND RELIABLE OPERATION',
      deskripsi: 'Program Kerja Pengembangan IT, Digitalisasi, Infrastruktur Jaringan & Pembayaran IT',
    },
    {
      id: 'PK-B',
      kode: 'B',
      namaProgram: 'DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS',
      deskripsi: 'Program Kerja Audit Internal/Eksternal, Sertifikasi ISO/RSPO/Halal, Inspeksi Supplier & Lisensi',
    },
    {
      id: 'PK-C',
      kode: 'C',
      namaProgram: 'HEALTH, SAFETY AND ENVIRONMENT (HSE)',
      deskripsi: 'Program Kerja Penanggulangan Darurat, Training HSE, Risk Management, Inspeksi & Laporan HSE',
    },
  ]

  for (const parent of parentPrograms) {
    await prisma.programKerja.create({ data: parent })
  }

  console.log('Seeding Sub-Program (Child Items)...')
  const childPrograms = [
    // Sub-items for A. ENABLING DIGITAL AND RELIABLE OPERATION
    {
      id: 'PROG-A1',
      programKerjaId: 'PK-A',
      kode: 'A.1',
      namaItem: 'IT Development',
      status: 'On Progress',
      progress: 53,
      keterangan: 'Pengembangan aplikasi SmartWB, SAP, e-SIH, dan integrasi sistem RFID & AI CCTV',
    },
    {
      id: 'PROG-A2',
      programKerjaId: 'PK-A',
      kode: 'A.2',
      namaItem: 'IT Network & Infrastructure',
      status: 'On Progress',
      progress: 53,
      keterangan: 'Pemeliharaan perangkat jaringan, router, switch pabrik, dan koneksi ISP',
    },
    {
      id: 'PROG-A3',
      programKerjaId: 'PK-A',
      kode: 'A.3',
      namaItem: 'IT Administration, Tagihan & Pembayaran IT & Training',
      status: 'On Progress',
      progress: 53,
      keterangan: 'Pengelolaan administrasi lisensi, invoice vendor IT, serta pelatihan staff',
    },

    // Sub-items for B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS
    {
      id: 'PROG-B1',
      programKerjaId: 'PK-B',
      kode: 'B.1',
      namaItem: 'Audit Internal, Audit Eksternal & Management Review',
      status: 'On Progress',
      progress: 51,
      keterangan: 'Pelaksanaan audit tata kelola berkala dan kaji ulang manajemen',
    },
    {
      id: 'PROG-B2',
      programKerjaId: 'PK-B',
      kode: 'B.2',
      namaItem: 'Inspeksi & Monitoring Supplier (Vendor), Update Lisensi & HPS',
      status: 'On Progress',
      progress: 51,
      keterangan: 'Evaluasi kinerja vendor dan pembaruan lisensi operasional',
    },
    {
      id: 'PROG-B3',
      programKerjaId: 'PK-B',
      kode: 'B.3',
      namaItem: 'Sertifikat Eksternal (ISO 9001, ISO 37001, GMP, HACCP, RSPO, ISCC, Halal, Kosher, CPPOB, SNI, Smeta)',
      status: 'On Progress',
      progress: 51,
      keterangan: 'Pemeliharaan & perpanjangan 12 sertifikasi resmi eksternal',
    },

    // Sub-items for C. HEALTH, SAFETY AND ENVIRONMENT (HSE)
    {
      id: 'PROG-C1',
      programKerjaId: 'PK-C',
      kode: 'C.1',
      namaItem: 'Emergency Preparedness & HSE Training (Internal & Eksternal)',
      status: 'On Progress',
      progress: 51,
      keterangan: 'Kesiapsiagaan tanggap darurat dan pelatihan K3 berkala',
    },
    {
      id: 'PROG-C2',
      programKerjaId: 'PK-C',
      kode: 'C.2',
      namaItem: 'Risk Management, Regulation & HSE Inspection',
      status: 'On Progress',
      progress: 51,
      keterangan: 'Manajemen risiko lingkungan kerja, kepatuhan regulasi & inspeksi rutin',
    },
    {
      id: 'PROG-C3',
      programKerjaId: 'PK-C',
      kode: 'C.3',
      namaItem: 'HSE Report, HSE Meeting & Health Living Moment',
      status: 'On Progress',
      progress: 51,
      keterangan: 'Pelaporan K3 bulanan, rapat evaluasi HSE & gerakan hidup sehat',
    },
  ]

  for (const child of childPrograms) {
    await prisma.masterProgram.create({ data: child })
  }

  console.log('Seeding Real Activities from Highlight Excel...')
  const staffList = [
    { email: 'herbina@inl.co.id', nama: 'Herbina' },
    { email: 'fitri@inl.co.id', nama: 'Fitri' },
    { email: 'agung@inl.co.id', nama: 'Agung' },
    { email: 'salman@inl.co.id', nama: 'Salman' },
    { email: 'aundry@inl.co.id', nama: 'Aundry' },
    { email: 'tommy@inl.co.id', nama: 'Tommy' },
    { email: 'gilang@inl.co.id', nama: 'Gilang' },
    { email: 'hendry@inl.co.id', nama: 'Hendry' },
  ]

  const activitiesData = [
    {
      no: 1,
      idProgram: 'PROG-A1',
      kategoriProgram: 'A. ENABLING DIGITAL AND RELIABLE OPERATION',
      itemName: 'IT Development',
      kegiatan: 'Final testing & Go Live SmartWB dengan teknologi RFID & AI CCTV',
      descriptionAction: 'Final Testing SmartWB (RFID): 1. Ceklis Form sebelum Testing, 2. Live Test dengan Kabag SDM & Sistem',
      startDate: '2026-01-06',
      dueDate: '2026-03-31',
      status: 'On Progress',
      tindakLanjut: 'Develop Proses Bisnis & Pembelian 70 kartu RFID',
      remarks: 'Go Live SmartWB (RFID): Pengadaan 70 Kartu RFID, aplikasi baru & lama jalan paralel',
      picEmail: staffList[5].email, // Tommy
      picNama: 'Tommy / Salman',
    },
    {
      no: 2,
      idProgram: 'PROG-A1',
      kategoriProgram: 'A. ENABLING DIGITAL AND RELIABLE OPERATION',
      itemName: 'IT Development',
      kegiatan: 'Integrasi SAP dengan SmartWB',
      descriptionAction: 'Pengumpulan Data: 1. Pengadaan Laptop Developer yang dapat mengomodasi pengembangan AI, 2. TCode yang digunakan pada SAP',
      startDate: '2026-01-08',
      dueDate: '2026-06-30',
      status: 'On Progress',
      tindakLanjut: 'Desain Database, ERD, FlowChart & Use Case Diagram',
      remarks: 'Pembuatan API SAP dengan PT SISI & pengembangan web registrasi desktop timbangan',
      picEmail: staffList[3].email, // Salman
      picNama: 'Tommy / Salman',
    },
    {
      no: 3,
      idProgram: 'PROG-B3',
      kategoriProgram: 'B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS',
      itemName: 'Sertifikat Eksternal',
      kegiatan: 'Koordinasi SKD Kosher & Sertifikasi ISCC SBE',
      descriptionAction: 'Penyusunan Prosedur implementasi RSPO Market communication and Claim & Koordinasi dengan tim MGT',
      startDate: '2026-01-06',
      dueDate: '2026-01-25',
      closedDate: '2026-01-25',
      status: 'Closed',
      tindakLanjut: 'Meeting internal HSSE mengenai peluang Sertifikasi ISCC SBE',
      remarks: 'Kosher & RSPO audit berjalan sesuai jadwal',
      picEmail: staffList[1].email, // Fitri
      picNama: staffList[1].nama,
    },
    {
      no: 4,
      idProgram: 'PROG-C1',
      kategoriProgram: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)',
      itemName: 'Emergency Preparedness & HSE Training',
      kegiatan: 'Program kerja bagian MR & HSSE & Monitoring data limbah di SIMPEL',
      descriptionAction: 'Pelaporan Lingkungan Triwulan ke-4 2025 & Verifikasi invoice pengangkutan SBE',
      startDate: '2026-01-06',
      dueDate: '2026-01-25',
      closedDate: '2026-01-25',
      status: 'Closed',
      tindakLanjut: 'Cek data limbah masuk, menyesuaikan dengan database dan penyerahan pengangkutan',
      remarks: 'Selesai diserahkan ke SIMPEL',
      picEmail: staffList[0].email, // Herbina
      picNama: staffList[0].nama,
    },
    {
      no: 5,
      idProgram: 'PROG-A2',
      kategoriProgram: 'A. ENABLING DIGITAL AND RELIABLE OPERATION',
      itemName: 'IT Network & Infrastructure',
      kegiatan: 'Pemeliharaan Akses Wifi Router & Cabling Pabrik',
      descriptionAction: 'Pemeriksaan rutin berkala switch & mikrotik pabrik Sei Mangkei',
      startDate: '2026-01-12',
      dueDate: '2026-02-28',
      status: 'On Progress',
      tindakLanjut: 'Perapihan jalur kabel dan pengujian failover ISP',
      remarks: 'Koneksi jaringan stabil 99.9%',
      picEmail: staffList[2].email, // Agung
      picNama: staffList[2].nama,
    },
    {
      no: 6,
      idProgram: 'PROG-B1',
      kategoriProgram: 'B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS',
      itemName: 'Audit Internal & Management Review',
      kegiatan: 'Closing temuan RSPO mengenai SOP (submit ke auditor)',
      descriptionAction: 'Penyusunan laporan neraca limbah Semester 2 2025 dan pelaporan neraca limbah ke KLHK',
      startDate: '2026-01-09',
      dueDate: '2026-01-30',
      status: 'On Progress',
      tindakLanjut: 'Menunggu rincian biaya dan FR revisi dari Sauca',
      remarks: 'Proses approval persetujuan anggaran PPAB',
      picEmail: staffList[4].email, // Aundry
      picNama: staffList[4].nama,
    },
    {
      no: 7,
      idProgram: 'PROG-C2',
      kategoriProgram: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)',
      itemName: 'Risk Management & HSE Inspection',
      kegiatan: 'Pengecekan hasil analisa pemantauan lingkungan Semester 2 tahun 2025',
      descriptionAction: 'Verifikasi penyimpangan BE, PA dan Vit.A ke lapangan untuk persiapan audit Kosher',
      startDate: '2026-01-12',
      dueDate: '2026-02-15',
      status: 'On Progress',
      tindakLanjut: 'Penyusunan laporan final audit oleh auditor',
      remarks: 'Verifikasi ke lapangan dan koordinasi jadwal audit',
      picEmail: staffList[6].email, // Gilang
      picNama: staffList[6].nama,
    },
    {
      no: 8,
      idProgram: 'PROG-A3',
      kategoriProgram: 'A. ENABLING DIGITAL AND RELIABLE OPERATION',
      itemName: 'IT Administration & Tagihan',
      kegiatan: 'Koordinasi perubahan invoice tagihan I ke MGT',
      descriptionAction: 'Invoice disesuaikan dengan faktur pajak yaitu ditujukan ke MGT. Invoice selanjutnya ke Megatech',
      startDate: '2026-01-12',
      dueDate: '2026-01-26',
      closedDate: '2026-01-26',
      status: 'Closed',
      tindakLanjut: 'Tanda tangan ulang invoice & penyerahan ke finance',
      remarks: 'Selesai diproses',
      picEmail: staffList[7].email, // Hendry
      picNama: staffList[7].nama,
    },
  ]

  for (const act of activitiesData) {
    await prisma.activity.create({
      data: {
        id: `ACT-${String(act.no).padStart(3, '0')}`,
        ...act,
      },
    })
  }

  console.log('Database successfully re-seeded with exact Excel data (A, B, C Program Kerja)!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
