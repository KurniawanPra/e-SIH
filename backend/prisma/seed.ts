import "dotenv/config"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const getPastDate = (daysAgo: number) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString().split('T')[0]
  }

  const getFutureDate = (daysAhead: number) => {
    const d = new Date()
    d.setDate(d.getDate() + daysAhead)
    return d.toISOString().split('T')[0]
  }

  console.log('Clearing old data...')
  await prisma.activity.deleteMany()
  await prisma.masterProgram.deleteMany()
  await prisma.programKerja.deleteMany()

  console.log('Seeding Parent ProgramKerja...')
  const parentPrograms = [
    {
      id: 'PK-01',
      kode: '1.0',
      namaProgram: 'Program Kerja IT & Digitalisasi Sistem',
      deskripsi: 'Inisiatif pengembangan aplikasi internal dan modernisasi sistem e-SIH & Portal INL.',
    },
    {
      id: 'PK-02',
      kode: '2.0',
      namaProgram: 'Program Kerja Operasional & Infrastruktur IT',
      deskripsi: 'Pemeliharaan perangkat keras, jaringan pabrik, dan server lokal.',
    },
    {
      id: 'PK-03',
      kode: '3.0',
      namaProgram: 'Program Kerja Keamanan Informasi & Disaster Recovery',
      deskripsi: 'Proteksi aset data, audit keamanan cyber, dan prosedur backup berkala.',
    },
    {
      id: 'PK-04',
      kode: '4.0',
      namaProgram: 'Program Kerja Layanan Support & Helpdesk',
      deskripsi: 'Dukungan operasional harian untuk pengguna sistem IT.',
    },
  ]

  for (const parent of parentPrograms) {
    await prisma.programKerja.create({ data: parent })
  }

  console.log('Seeding Child MasterProgram Items...')
  const childPrograms = [
    {
      id: 'PROG-01',
      programKerjaId: 'PK-01',
      kode: '1.1',
      namaItem: 'Pengembangan Aplikasi e-SIH (Next.js & Fastify)',
      status: 'On Progress',
      progress: 85,
      keterangan: 'Migrasi arsitektur monolitik GAS ke Next.js + Fastify + SQLite',
    },
    {
      id: 'PROG-02',
      programKerjaId: 'PK-01',
      kode: '1.2',
      namaItem: 'Integrasi Portal SSO INL & Passkey WebAuthn',
      status: 'On Progress',
      progress: 90,
      keterangan: 'Penerapan login satu pintu (SSO) internal',
    },
    {
      id: 'PROG-03',
      programKerjaId: 'PK-01',
      kode: '1.3',
      namaItem: 'Pengembangan Executive Dashboard Analitik',
      status: 'On Progress',
      progress: 60,
      keterangan: 'Visualisasi KPI performa aktivitas mingguan dan bulanan',
    },
    {
      id: 'PROG-04',
      programKerjaId: 'PK-02',
      kode: '2.1',
      namaItem: 'Pemeliharaan Server & Perangkat Jaringan Pabrik',
      status: 'On Progress',
      progress: 75,
      keterangan: 'Pemeriksaan fisik server dan router switch pabrik',
    },
    {
      id: 'PROG-05',
      programKerjaId: 'PK-02',
      kode: '2.2',
      namaItem: 'Upgrade Bandwidth & Redundansi ISP Office',
      status: 'Closed',
      progress: 100,
      keterangan: 'Implementasi koneksi ISP sekunder (failover)',
    },
    {
      id: 'PROG-06',
      programKerjaId: 'PK-03',
      kode: '3.1',
      namaItem: 'Audit Keamanan Cyber & Vulnerability Scanning',
      status: 'On Progress',
      progress: 50,
      keterangan: 'Pemindaian celah keamanan berkala pada server aplikasi',
    },
    {
      id: 'PROG-07',
      programKerjaId: 'PK-03',
      kode: '3.2',
      namaItem: 'Penerapan Backup Database Otomatis & DR Plan',
      status: 'Closed',
      progress: 100,
      keterangan: 'Backup harian otomatis ke penyimpanan lokal aman',
    },
    {
      id: 'PROG-08',
      programKerjaId: 'PK-04',
      kode: '4.1',
      namaItem: 'Penanganan Ticket Layanan IT Operational',
      status: 'On Progress',
      progress: 80,
      keterangan: 'Dukungan teknis hardware dan software staff',
    },
  ]

  for (const child of childPrograms) {
    await prisma.masterProgram.create({ data: child })
  }

  console.log('Seeding Activities...')
  const staffList = [
    { email: 'syariful@inl.co.id', nama: 'Syariful (Head of IT)' },
    { email: 'kurniawan@inl.co.id', nama: 'Kurniawan (IT Support & Dev)' },
    { email: 'ahmad@inl.co.id', nama: 'Ahmad (Network Engineer)' },
    { email: 'budi@inl.co.id', nama: 'Budi (System Analyst)' },
    { email: 'dewi@inl.co.id', nama: 'Dewi (Database Admin)' },
    { email: 'eka@inl.co.id', nama: 'Eka (Helpdesk Support)' },
    { email: 'fajar@inl.co.id', nama: 'Fajar (Security Officer)' },
  ]

  const activitiesData = [
    // Staff 1: Kurniawan
    {
      no: 1,
      idProgram: 'PROG-01',
      kategoriProgram: '1.0 IT & Digitalisasi',
      itemName: 'Pengembangan Aplikasi e-SIH (Next.js & Fastify)',
      kegiatan: 'Inisialisasi Proyek Fastify & Prisma SQLite',
      descriptionAction: 'Membuat struktur folder backend dan konfigurasi ORM',
      startDate: getPastDate(20),
      dueDate: getPastDate(15),
      closedDate: getPastDate(15),
      status: 'Closed',
      picEmail: staffList[1].email,
      picNama: staffList[1].nama,
    },
    {
      no: 2,
      idProgram: 'PROG-01',
      kategoriProgram: '1.0 IT & Digitalisasi',
      itemName: 'Pengembangan Aplikasi e-SIH (Next.js & Fastify)',
      kegiatan: 'Pembuatan UI Bootstrap 5 & Halaman Dashboard',
      descriptionAction: 'Mengubah komponen HTML statis ke Next.js React',
      startDate: getPastDate(10),
      dueDate: getFutureDate(3),
      status: 'On Progress',
      picEmail: staffList[1].email,
      picNama: staffList[1].nama,
    },
    {
      no: 3,
      idProgram: 'PROG-02',
      kategoriProgram: '1.0 IT & Digitalisasi',
      itemName: 'Integrasi Portal SSO INL & Passkey WebAuthn',
      kegiatan: 'Pengujian Token Exchange Endpoint SSO',
      descriptionAction: 'Verifikasi integrasi login satu pintu dengan portal-app-be',
      startDate: getPastDate(5),
      dueDate: getFutureDate(2),
      status: 'On Progress',
      picEmail: staffList[1].email,
      picNama: staffList[1].nama,
    },

    // Staff 0: Syariful
    {
      no: 4,
      idProgram: 'PROG-03',
      kategoriProgram: '1.0 IT & Digitalisasi',
      itemName: 'Pengembangan Executive Dashboard Analitik',
      kegiatan: 'Review Spesifikasi KPI Performa Program Kerja',
      descriptionAction: 'Penyelarasan kebutuhan laporan untuk jajaran manajemen',
      startDate: getPastDate(14),
      dueDate: getPastDate(7),
      closedDate: getPastDate(7),
      status: 'Closed',
      picEmail: staffList[0].email,
      picNama: staffList[0].nama,
    },

    // Staff 2: Ahmad
    {
      no: 5,
      idProgram: 'PROG-04',
      kategoriProgram: '2.0 Operasional & Infrastruktur',
      itemName: 'Pemeliharaan Server & Perangkat Jaringan Pabrik',
      kegiatan: 'Maintenance Switch & Cabling Ruang Server',
      descriptionAction: 'Pembersihan fisik dan perapihan pengkabelan patch panel',
      startDate: getPastDate(8),
      dueDate: getPastDate(2),
      closedDate: getPastDate(2),
      status: 'Closed',
      picEmail: staffList[2].email,
      picNama: staffList[2].nama,
    },
    {
      no: 6,
      idProgram: 'PROG-05',
      kategoriProgram: '2.0 Operasional & Infrastruktur',
      itemName: 'Upgrade Bandwidth & Redundansi ISP Office',
      kegiatan: 'Konfigurasi Failover Router Mikrotik',
      descriptionAction: 'Pengujian perpindahan otomatis jalur internet utama ke cadangan',
      startDate: getPastDate(25),
      dueDate: getPastDate(18),
      closedDate: getPastDate(18),
      status: 'Closed',
      picEmail: staffList[2].email,
      picNama: staffList[2].nama,
    },

    // Staff 4: Dewi
    {
      no: 7,
      idProgram: 'PROG-07',
      kategoriProgram: '3.0 Keamanan Informasi',
      itemName: 'Penerapan Backup Database Otomatis & DR Plan',
      kegiatan: 'Setup Cron Job Backup SQLite',
      descriptionAction: 'Penjadwalan dump database harian otomatis',
      startDate: getPastDate(30),
      dueDate: getPastDate(20),
      closedDate: getPastDate(20),
      status: 'Closed',
      picEmail: staffList[4].email,
      picNama: staffList[4].nama,
    },

    // Staff 6: Fajar
    {
      no: 8,
      idProgram: 'PROG-06',
      kategoriProgram: '3.0 Keamanan Informasi',
      itemName: 'Audit Keamanan Cyber & Vulnerability Scanning',
      kegiatan: 'Pentest Celah Keamanan Port Server',
      descriptionAction: 'Pemeriksaan port terbuka dan vuln assessment',
      startDate: getPastDate(4),
      dueDate: getFutureDate(5),
      status: 'On Progress',
      picEmail: staffList[6].email,
      picNama: staffList[6].nama,
    },

    // Staff 5: Eka
    {
      no: 9,
      idProgram: 'PROG-08',
      kategoriProgram: '4.0 Layanan Support',
      itemName: 'Penanganan Ticket Layanan IT Operational',
      kegiatan: 'Penyelesaian Penanganan Kendala Printer Staff',
      descriptionAction: 'Penggantian toner dan konfigurasi ulang ip printer',
      startDate: getPastDate(2),
      dueDate: getFutureDate(1),
      status: 'On Progress',
      picEmail: staffList[5].email,
      picNama: staffList[5].nama,
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

  console.log('Database successfully re-seeded with Parent-Child ProgramKerja structure!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
