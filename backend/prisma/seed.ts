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
    { id: 'PROG-A1', programKerjaId: 'PK-A', kode: 'A.1', namaItem: 'IT Development', status: 'On Progress', progress: 85, keterangan: 'Pengembangan aplikasi SmartWB, SAP, e-SIH, dan integrasi sistem RFID & AI CCTV' },
    { id: 'PROG-A2', programKerjaId: 'PK-A', kode: 'A.2', namaItem: 'IT Network & Infrastructure', status: 'On Progress', progress: 78, keterangan: 'Pemeliharaan perangkat jaringan, router, switch pabrik, dan koneksi ISP' },
    { id: 'PROG-A3', programKerjaId: 'PK-A', kode: 'A.3', namaItem: 'IT Administration, Tagihan & Pembayaran IT', status: 'On Progress', progress: 90, keterangan: 'Pengelolaan administrasi lisensi, invoice vendor IT, serta pelatihan staff' },
    { id: 'PROG-B1', programKerjaId: 'PK-B', kode: 'B.1', namaItem: 'Audit Internal, Audit Eksternal & Management Review', status: 'On Progress', progress: 72, keterangan: 'Pelaksanaan audit tata kelola berkala dan kaji ulang manajemen' },
    { id: 'PROG-B2', programKerjaId: 'PK-B', kode: 'B.2', namaItem: 'Inspeksi & Monitoring Supplier (Vendor), Update Lisensi & HPS', status: 'On Progress', progress: 65, keterangan: 'Evaluasi kinerja vendor dan pembaruan lisensi operasional' },
    { id: 'PROG-B3', programKerjaId: 'PK-B', kode: 'B.3', namaItem: 'Sertifikat Eksternal (ISO 9001, RSPO, Halal, Kosher, CPPOB, SNI)', status: 'On Progress', progress: 88, keterangan: 'Pemeliharaan & perpanjangan 12 sertifikasi resmi eksternal' },
    { id: 'PROG-C1', programKerjaId: 'PK-C', kode: 'C.1', namaItem: 'Emergency Preparedness & HSE Training', status: 'On Progress', progress: 80, keterangan: 'Kesiapsiagaan tanggap darurat dan pelatihan K3 berkala' },
    { id: 'PROG-C2', programKerjaId: 'PK-C', kode: 'C.2', namaItem: 'Risk Management, Regulation & HSE Inspection', status: 'On Progress', progress: 75, keterangan: 'Manajemen risiko lingkungan kerja, kepatuhan regulasi & inspeksi rutin' },
    { id: 'PROG-C3', programKerjaId: 'PK-C', kode: 'C.3', namaItem: 'HSE Report, HSE Meeting & Health Living Moment', status: 'On Progress', progress: 82, keterangan: 'Pelaporan K3 bulanan, rapat evaluasi HSE & gerakan hidup sehat' },
  ]

  for (const child of childPrograms) {
    await prisma.masterProgram.create({ data: child })
  }

  console.log('Seeding Users SDM...')
  try {
    await (prisma as any).user.deleteMany()
  } catch (e) {}

  const staff = [
    { name: 'Kurniawan Pralambang', email: 'kurniawan@inl.co.id', jabatan: 'Pimpinan IT & Sistem', unit: 'IT & Sistem Operational', role: 'ADMIN' },
    { name: 'Herbina', email: 'herbina@inl.co.id', jabatan: 'Staff IT Development', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Fitri', email: 'fitri@inl.co.id', jabatan: 'Staff System Analyst', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Agung', email: 'agung@inl.co.id', jabatan: 'Staff Infrastructure & Network', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Salman', email: 'salman@inl.co.id', jabatan: 'Staff Database Administrator', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Tommy', email: 'tommy@inl.co.id', jabatan: 'Staff IT Support & Operation', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Aundry', email: 'aundry@inl.co.id', jabatan: 'Staff Quality Assurance', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Gilang', email: 'gilang@inl.co.id', jabatan: 'Staff HSE Officer', unit: 'HSE Operational', role: 'USER' },
    { name: 'Hendry', email: 'hendry@inl.co.id', jabatan: 'Staff Auditor Operational', unit: 'Internal Audit', role: 'USER' },
  ]

  for (const u of staff) {
    try {
      await (prisma as any).user.create({
        data: {
          nama: u.name,
          email: u.email,
          jabatan: u.jabatan,
          unit: u.unit,
          role: u.role,
          isActive: true
        }
      })
    } catch (e) {}
  }

  const templates = [
    { progId: 'PROG-A1', item: 'IT Development', kat: 'A. ENABLING DIGITAL AND RELIABLE OPERATION', task: 'Development module RFID Timbangan SmartWB Phase', action: 'Integrasi sistem RFID dengan database timbangan digital & AI CCTV' },
    { progId: 'PROG-A1', item: 'IT Development', kat: 'A. ENABLING DIGITAL AND RELIABLE OPERATION', task: 'Migrasi Portal SSO dan Fastify Backend v4', action: 'Sinkronisasi token SSO dengan aplikasi e-SIH & SmartWB' },
    { progId: 'PROG-A1', item: 'IT Development', kat: 'A. ENABLING DIGITAL AND RELIABLE OPERATION', task: 'Pengembangan Fitur Dashboard Executive & Reporting', action: 'Pembuatan grafik analitik interaktif & rekapitulasi monthly highlight' },
    { progId: 'PROG-A2', item: 'IT Network & Infrastructure', kat: 'A. ENABLING DIGITAL AND RELIABLE OPERATION', task: 'Pemasangan Access Point Jaringan Pabrik Sei Mangkei', action: 'Konfigurasi Mikrotik Router & Failover ISP utama dengan cadangan' },
    { progId: 'PROG-A2', item: 'IT Network & Infrastructure', kat: 'A. ENABLING DIGITAL AND RELIABLE OPERATION', task: 'Penataan Server Room & Perapihan Cabling Rack', action: 'Management kabel UTP Cat6 & pengujian beban listrik UPS Server' },
    { progId: 'PROG-A3', item: 'IT Administration & Tagihan', kat: 'A. ENABLING DIGITAL AND RELIABLE OPERATION', task: 'Proses Pembayaran Lisensi SAP & Microsoft 365', action: 'Verifikasi invoice vendor IT dan pencairan pembayaran ke Finance' },
    { progId: 'PROG-B1', item: 'Audit Internal & Management Review', kat: 'B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS', task: 'Pelaksanaan Audit Internal Kepatuhan ISO 9001:2015', action: 'Pemeriksaan dokumen SOP operational pabrik dan temuan audit' },
    { progId: 'PROG-B2', item: 'Inspeksi & Monitoring Supplier', kat: 'B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS', task: 'Evaluasi Vendor Bahan Baku & Kemasan Minyak Goreng', action: 'Inspeksi lapangan ke fasilitas supplier utama CPO & PK' },
    { progId: 'PROG-B3', item: 'Sertifikat Eksternal', kat: 'B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS', task: 'Persiapan Audit Halal & Survelen RSPO 2026', action: 'Penyusunan berkas kelengkapan bahan dan penyesuaian kriteria audit' },
    { progId: 'PROG-C1', item: 'Emergency Preparedness & HSE Training', kat: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', task: 'Simulasi Tanggap Darurat & Drill Pemadam Kebakaran', action: 'Pelaksanaan drill tanggap darurat bersama seluruh karyawan area refinery' },
    { progId: 'PROG-C2', item: 'Risk Management & HSE Inspection', kat: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', task: 'Inspeksi Kelayakan APAR & Sistem Hydrant Pabrik', action: 'Pemeriksaan tekanan air hydrant dan kelayakan APAR di 15 zone' },
    { progId: 'PROG-C3', item: 'HSE Report & Meeting', kat: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', task: 'Pelaporan Triwulan Lingkungan ke KLHK (SIMPEL)', action: 'Penginputan data limbah B3 dan pemantauan kualitas emisi pabrik' },
  ]

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  let count = 1
  for (let i = 0; i < 100; i++) {
    const t = templates[i % templates.length]
    const picObj = staff[i % staff.length]
    const m = months[Math.floor(i / 8.5) % 12]
    const mStr = String(m).padStart(2, '0')
    const startDay = Math.min(28, (i % 20) + 1)
    const dueDay = Math.min(28, startDay + (i % 10) + 5)
    
    // Status distribution: ~65% Closed, ~25% On Progress, ~10% Open
    let status = 'Closed'
    if (i % 5 === 0) status = 'On Progress'
    if (i % 9 === 0) status = 'Open'

    const startDate = `2026-${mStr}-${String(startDay).padStart(2, '0')}`
    const dueDate = `2026-${mStr}-${String(dueDay).padStart(2, '0')}`
    const closedDate = status === 'Closed' ? dueDate : null

    await prisma.activity.create({
      data: {
        id: `ACT-${String(count).padStart(3, '0')}`,
        no: count,
        idProgram: t.progId,
        kategoriProgram: t.kat,
        itemName: t.item,
        kegiatan: `${t.task} - Batch #${Math.floor(i / 12) + 1}`,
        descriptionAction: `${t.action} (Penanggungjawab: ${picObj.name})`,
        startDate,
        dueDate,
        closedDate,
        status,
        tindakLanjut: status === 'Closed' ? 'Selesai dan terverifikasi' : 'Dalam koordinasi tim teknis',
        remarks: status === 'Closed' ? 'Selesai sesuai target SLA' : 'Monitoring berkala',
        picEmail: picObj.email,
        picNama: picObj.name,
        isActive: true,
      }
    })
    count++
  }

  console.log('Successfully seeded 100 operational activities into SQLite database!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
