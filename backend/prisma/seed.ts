import "dotenv/config"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing old data...')
  await prisma.activity.deleteMany()
  await prisma.masterProgram.deleteMany()
  await prisma.programKerja.deleteMany()

  console.log('Seeding Parent Program Kerja (2026 & 2025)...')
  const parentPrograms = [
    // 2026 Program Kerja
    {
      id: 'PK-A-2026',
      kode: 'A',
      namaProgram: 'ENABLING DIGITAL AND RELIABLE OPERATION',
      deskripsi: 'Program Kerja Pengembangan IT, Digitalisasi, Infrastruktur Jaringan & Pembayaran IT (2026)',
      tahun: 2026,
    },
    {
      id: 'PK-B-2026',
      kode: 'B',
      namaProgram: 'DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS',
      deskripsi: 'Program Kerja Audit Internal/Eksternal, Sertifikasi ISO/RSPO/Halal, Inspeksi Supplier & Lisensi (2026)',
      tahun: 2026,
    },
    {
      id: 'PK-C-2026',
      kode: 'C',
      namaProgram: 'HEALTH, SAFETY AND ENVIRONMENT (HSE)',
      deskripsi: 'Program Kerja Penanggulangan Darurat, Training HSE, Risk Management, Inspeksi & Laporan HSE (2026)',
      tahun: 2026,
    },

    // 2025 Program Kerja (Historical)
    {
      id: 'PK-A-2025',
      kode: 'A',
      namaProgram: 'DIGITAL INFRASTRUCTURE & SMART AUTOMATION (2025)',
      deskripsi: 'Program kerja transformasi digital dasar dan infrastruktur pabrik (2025)',
      tahun: 2025,
    },
    {
      id: 'PK-B-2025',
      kode: 'B',
      namaProgram: 'SUSTAINABILITY & STANDARDIZATION COMPLIANCE (2025)',
      deskripsi: 'Program kerja kepatuhan audit dasar ISO dan sertifikasi industri (2025)',
      tahun: 2025,
    },
    {
      id: 'PK-C-2025',
      kode: 'C',
      namaProgram: 'PLANT SAFETY & RISK PREVENTION (2025)',
      deskripsi: 'Program kerja keselamatan kerja dan pencegahan risiko pabrik (2025)',
      tahun: 2025,
    },
  ]

  for (const parent of parentPrograms) {
    await prisma.programKerja.create({ data: parent })
  }

  console.log('Seeding Sub-Program (Child Items)...')
  const childPrograms = [
    // 2026 Sub Programs
    { id: 'PROG-A1-2026', programKerjaId: 'PK-A-2026', kode: 'A.1', namaItem: 'IT Development', status: 'On Progress', progress: 85, tahun: 2026, keterangan: 'Pengembangan aplikasi SmartWB, SAP, e-SIH, dan integrasi sistem RFID & AI CCTV' },
    { id: 'PROG-A2-2026', programKerjaId: 'PK-A-2026', kode: 'A.2', namaItem: 'IT Network & Infrastructure', status: 'On Progress', progress: 78, tahun: 2026, keterangan: 'Pemeliharaan perangkat jaringan, router, switch pabrik, dan koneksi ISP' },
    { id: 'PROG-A3-2026', programKerjaId: 'PK-A-2026', kode: 'A.3', namaItem: 'IT Administration, Tagihan & Pembayaran IT', status: 'On Progress', progress: 90, tahun: 2026, keterangan: 'Pengelolaan administrasi lisensi, invoice vendor IT, serta pelatihan staff' },
    { id: 'PROG-B1-2026', programKerjaId: 'PK-B-2026', kode: 'B.1', namaItem: 'Audit Internal, Audit Eksternal & Management Review', status: 'On Progress', progress: 72, tahun: 2026, keterangan: 'Pelaksanaan audit tata kelola berkala dan kaji ulang manajemen' },
    { id: 'PROG-B2-2026', programKerjaId: 'PK-B-2026', kode: 'B.2', namaItem: 'Inspeksi & Monitoring Supplier (Vendor), Update Lisensi & HPS', status: 'On Progress', progress: 65, tahun: 2026, keterangan: 'Evaluasi kinerja vendor dan pembaruan lisensi operasional' },
    { id: 'PROG-B3-2026', programKerjaId: 'PK-B-2026', kode: 'B.3', namaItem: 'Sertifikat Eksternal (ISO 9001, RSPO, Halal, Kosher, CPPOB, SNI)', status: 'On Progress', progress: 88, tahun: 2026, keterangan: 'Pemeliharaan & perpanjangan 12 sertifikasi resmi eksternal' },
    { id: 'PROG-C1-2026', programKerjaId: 'PK-C-2026', kode: 'C.1', namaItem: 'Emergency Preparedness & HSE Training', status: 'On Progress', progress: 80, tahun: 2026, keterangan: 'Kesiapsiagaan tanggap darurat dan pelatihan K3 berkala' },
    { id: 'PROG-C2-2026', programKerjaId: 'PK-C-2026', kode: 'C.2', namaItem: 'Risk Management, Regulation & HSE Inspection', status: 'On Progress', progress: 75, tahun: 2026, keterangan: 'Manajemen risiko lingkungan kerja, kepatuhan regulasi & inspeksi rutin' },
    { id: 'PROG-C3-2026', programKerjaId: 'PK-C-2026', kode: 'C.3', namaItem: 'HSE Report, HSE Meeting & Health Living Moment', status: 'On Progress', progress: 82, tahun: 2026, keterangan: 'Pelaporan K3 bulanan, rapat evaluasi HSE & gerakan hidup sehat' },

    // 2025 Sub Programs
    { id: 'PROG-A1-2025', programKerjaId: 'PK-A-2025', kode: 'A.1', namaItem: 'Legacy System Migration & SAP Rollout', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Migrasi database ERP lama ke SAP S/4HANA (2025)' },
    { id: 'PROG-A2-2025', programKerjaId: 'PK-A-2025', kode: 'A.2', namaItem: 'Fiber Optic Backbone Installation', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Pemasangan kabel fiber optik area pabrik Sei Mangkei (2025)' },
    { id: 'PROG-A3-2025', programKerjaId: 'PK-A-2025', kode: 'A.3', namaItem: 'IT Infrastructure Renewal 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Pembaruan perangkat lunak & hardware server (2025)' },
    { id: 'PROG-B1-2025', programKerjaId: 'PK-B-2025', kode: 'B.1', namaItem: 'Audit ISO 27001 Readiness', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Persiapan awal audit Sistem Manajemen Keamanan Informasi (2025)' },
    { id: 'PROG-B2-2025', programKerjaId: 'PK-B-2025', kode: 'B.2', namaItem: 'Vendor Audit & Assessment 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Penilaian kepatuhan vendor IT & pabrik (2025)' },
    { id: 'PROG-B3-2025', programKerjaId: 'PK-B-2025', kode: 'B.3', namaItem: 'Halal & ISO Renewal 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Perpanjangan lisensi Halal & ISO 9001 (2025)' },
    { id: 'PROG-C1-2025', programKerjaId: 'PK-C-2025', kode: 'C.1', namaItem: 'Annual Fire Drill 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Pelatihan kebakaran & evakuasi karyawan (2025)' },
    { id: 'PROG-C2-2025', programKerjaId: 'PK-C-2025', kode: 'C.2', namaItem: 'Safety Risk Mapping 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Pemetaan potensi risiko K3 di pabrik (2025)' },
    { id: 'PROG-C3-2025', programKerjaId: 'PK-C-2025', kode: 'C.3', namaItem: 'HSE Monthly Review 2025', status: 'Closed', progress: 100, tahun: 2025, keterangan: 'Kaji ulang bulanan implementasi K3 (2025)' },
  ]

  for (const child of childPrograms) {
    await prisma.masterProgram.create({ data: child })
  }

  console.log('Seeding Users SDM...')
  try {
    await (prisma as any).user.deleteMany()
  } catch (e) {}

  const staff = [
    { name: 'Kurniawan Pralambang', email: 'kurniawan@inl.co.id', jabatan: 'Kepala Unit Organisasi Sub Bagian Sistem & IT', unit: 'IT & Sistem Operational', role: 'ADMIN' },
    { name: 'Herbina', email: 'herbina@inl.co.id', jabatan: 'Staff IT Development', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Fitri', email: 'fitri@inl.co.id', jabatan: 'Staff System Analyst', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Agung', email: 'agung@inl.co.id', jabatan: 'Staff Infrastructure & Network', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Salman', email: 'salman@inl.co.id', jabatan: 'Staff Database Administrator', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Tommy', email: 'tommy@inl.co.id', jabatan: 'Staff IT Support & Operation', unit: 'IT & Sistem Operational', role: 'USER' },
    { name: 'Aundry', email: 'aundry@inl.co.id', jabatan: 'Staff Quality Assurance', unit: 'IT & Sistem Operational', role: 'USER' },
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

  console.log('Seeding Real Operational Activity Records into Database...')
  let globalNo = 1

  const getItemsPool = (year: number) => [
    { progId: `PROG-A1-${year}`, item: 'IT Development', kat: `A. ENABLING DIGITAL AND RELIABLE OPERATION`, task: 'Development module RFID Timbangan SmartWB Phase', action: 'Integrasi sistem RFID dengan database timbangan digital & AI CCTV' },
    { progId: `PROG-A1-${year}`, item: 'IT Development', kat: `A. ENABLING DIGITAL AND RELIABLE OPERATION`, task: 'Migrasi Portal SSO dan Fastify Backend v4', action: 'Sinkronisasi token SSO dengan aplikasi e-SIH & SmartWB' },
    { progId: `PROG-A2-${year}`, item: 'IT Network & Infrastructure', kat: `A. ENABLING DIGITAL AND RELIABLE OPERATION`, task: 'Pemasangan Access Point Jaringan Pabrik Sei Mangkei', action: 'Konfigurasi Mikrotik Router & Failover ISP utama' },
    { progId: `PROG-A3-${year}`, item: 'IT Administration & Tagihan', kat: `A. ENABLING DIGITAL AND RELIABLE OPERATION`, task: 'Pembayaran Lisensi SAP & Microsoft 365', action: 'Verifikasi invoice vendor IT dan pencairan pembayaran' },
    { progId: `PROG-B1-${year}`, item: 'Audit Internal & Review', kat: `B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS`, task: 'Audit Internal Kepatuhan ISO 9001:2015', action: 'Pemeriksaan dokumen SOP operational pabrik' },
    { progId: `PROG-C1-${year}`, item: 'HSE Training & Emergency', kat: `C. HEALTH, SAFETY AND ENVIRONMENT (HSE)`, task: 'Simulasi Tanggap Darurat & Drill Pemadam Kebakaran', action: 'Pelaksanaan drill tanggap darurat karyawan area refinery' }
  ]

  // Seeding function per PIC
  const createPicData = async (
    picName: string,
    picEmail: string,
    year: number,
    monthlyCounts: { [m: number]: { closed?: number; progress?: number; open?: number; weeklyClosed?: { [w: number]: number } } }
  ) => {
    const itemsPool = getItemsPool(year)
    for (let m = 1; m <= 12; m++) {
      const spec = monthlyCounts[m] || { closed: 5, progress: 1, open: 1 }
      const mStr = String(m).padStart(2, '0')

      if (spec.weeklyClosed) {
        const weeks = [
          { w: 1, start: 1, end: 7, count: spec.weeklyClosed[1] || 0 },
          { w: 2, start: 8, end: 14, count: spec.weeklyClosed[2] || 0 },
          { w: 3, start: 15, end: 21, count: spec.weeklyClosed[3] || 0 },
          { w: 4, start: 22, end: 28, count: spec.weeklyClosed[4] || 0 },
          { w: 5, start: 29, end: 31, count: spec.weeklyClosed[5] || 0 }
        ]

        for (const wr of weeks) {
          for (let c = 0; c < wr.count; c++) {
            const day = Math.min(wr.end, wr.start + (c % (wr.end - wr.start + 1)))
            const dayStr = String(day).padStart(2, '0')
            const t = itemsPool[c % itemsPool.length]
            const startDate = `${year}-${mStr}-${dayStr}`

            await prisma.activity.create({
              data: {
                id: `ACT-${String(globalNo).padStart(4, '0')}`,
                no: globalNo++,
                idProgram: t.progId,
                kategoriProgram: t.kat,
                itemName: t.item,
                kegiatan: `${t.task} (W${wr.w} #${c + 1})`,
                descriptionAction: `${t.action} - PIC: ${picName}`,
                startDate,
                dueDate: startDate,
                closedDate: startDate,
                status: 'Closed',
                tindakLanjut: 'Selesai dan terverifikasi di sistem',
                remarks: 'Tutup SLA Tepat Waktu',
                picEmail,
                picNama: picName,
                isActive: true
              }
            })
          }
        }
      } else if (spec.closed) {
        for (let c = 0; c < spec.closed; c++) {
          const day = Math.min(28, (c % 28) + 1)
          const dayStr = String(day).padStart(2, '0')
          const t = itemsPool[c % itemsPool.length]
          const startDate = `${year}-${mStr}-${dayStr}`

          await prisma.activity.create({
            data: {
              id: `ACT-${String(globalNo).padStart(4, '0')}`,
              no: globalNo++,
              idProgram: t.progId,
              kategoriProgram: t.kat,
              itemName: t.item,
              kegiatan: `${t.task} #${c + 1}`,
              descriptionAction: `${t.action} - PIC: ${picName}`,
              startDate,
              dueDate: startDate,
              closedDate: startDate,
              status: 'Closed',
              tindakLanjut: 'Selesai dan terverifikasi di sistem',
              remarks: 'Tutup SLA Tepat Waktu',
              picEmail,
              picNama: picName,
              isActive: true
            }
          })
        }
      }

      if (spec.progress) {
        for (let p = 0; p < spec.progress; p++) {
          const day = Math.min(28, (p * 5) + 3)
          const dayStr = String(day).padStart(2, '0')
          const t = itemsPool[(p + 2) % itemsPool.length]
          const startDate = `${year}-${mStr}-${dayStr}`

          await prisma.activity.create({
            data: {
              id: `ACT-${String(globalNo).padStart(4, '0')}`,
              no: globalNo++,
              idProgram: t.progId,
              kategoriProgram: t.kat,
              itemName: t.item,
              kegiatan: `${t.task} (Progres #${p + 1})`,
              descriptionAction: `Tahap pengerjaan: ${t.action}`,
              startDate,
              dueDate: `${year}-${mStr}-28`,
              status: 'On Progress',
              tindakLanjut: 'Dalam proses pengujian dan validasi tim',
              remarks: 'Dalam Pengawasan PIC',
              picEmail,
              picNama: picName,
              isActive: true
            }
          })
        }
      }

      if (spec.open) {
        for (let o = 0; o < spec.open; o++) {
          const day = Math.min(28, (o * 7) + 5)
          const dayStr = String(day).padStart(2, '0')
          const t = itemsPool[(o + 4) % itemsPool.length]
          const startDate = `${year}-${mStr}-${dayStr}`

          await prisma.activity.create({
            data: {
              id: `ACT-${String(globalNo).padStart(4, '0')}`,
              no: globalNo++,
              idProgram: t.progId,
              kategoriProgram: t.kat,
              itemName: t.item,
              kegiatan: `${t.task} (Pending #${o + 1})`,
              descriptionAction: `Persiapan pengerjaan: ${t.action}`,
              startDate,
              dueDate: `${year}-${mStr}-28`,
              status: 'Open',
              tindakLanjut: 'Menunggu alokasi SDM dan persetujuan anggaran',
              remarks: 'Perlu Perhatian Khusus',
              picEmail,
              picNama: picName,
              isActive: true
            }
          })
        }
      }
    }
  }

  // --- Seed Kurniawan Pralambang (2026) ---
  console.log('Seeding Kurniawan Pralambang activities for 2026...')
  await createPicData('Kurniawan Pralambang', 'kurniawan@inl.co.id', 2026, {
    1: { closed: 2 },
    2: { closed: 29 },
    3: { closed: 54 },
    4: { closed: 38 },
    5: { closed: 42 },
    6: { closed: 20 },
    7: { closed: 25 },
    8: { closed: 25, progress: 5, open: 2, weeklyClosed: { 1: 5, 2: 7, 3: 8, 4: 5, 5: 0 } },
    9: { closed: 0 },
    10: { closed: 0 },
    11: { closed: 0 },
    12: { closed: 0 },
  })

  // --- Seed Herbina (2026) ---
  console.log('Seeding Herbina activities for 2026...')
  await createPicData('Herbina', 'herbina@inl.co.id', 2026, {
    1: { closed: 2 },
    2: { closed: 29 },
    3: { closed: 54 },
    4: { closed: 35 },
    5: { closed: 40 },
    6: { closed: 18 },
    7: { closed: 22 },
    8: { closed: 11, progress: 4, open: 1, weeklyClosed: { 1: 2, 2: 3, 3: 4, 4: 2, 5: 0 } },
    9: { closed: 0 },
    10: { closed: 0 },
    11: { closed: 0 },
    12: { closed: 0 },
  })

  // --- Seed Fitri (2026) ---
  console.log('Seeding Fitri activities for 2026...')
  await createPicData('Fitri', 'fitri@inl.co.id', 2026, {
    1: { closed: 15 },
    2: { closed: 22 },
    3: { closed: 28 },
    4: { closed: 24 },
    5: { closed: 30 },
    6: { closed: 25 },
    7: { closed: 21 },
    8: { closed: 18, progress: 3, open: 2 },
  })

  // --- Seed Agung, Salman, Tommy, Aundry (2026) ---
  console.log('Seeding other staff activities for 2026...')
  await createPicData('Agung', 'agung@inl.co.id', 2026, {
    1: { closed: 10 }, 2: { closed: 15 }, 3: { closed: 20 }, 4: { closed: 18 },
    5: { closed: 22 }, 6: { closed: 19 }, 7: { closed: 17 }, 8: { closed: 14, progress: 2 }
  })
  await createPicData('Salman', 'salman@inl.co.id', 2026, {
    1: { closed: 8 }, 2: { closed: 12 }, 3: { closed: 18 }, 4: { closed: 15 },
    5: { closed: 19 }, 6: { closed: 16 }, 7: { closed: 15 }, 8: { closed: 12, progress: 2 }
  })
  await createPicData('Tommy', 'tommy@inl.co.id', 2026, {
    1: { closed: 6 }, 2: { closed: 10 }, 3: { closed: 15 }, 4: { closed: 12 },
    5: { closed: 14 }, 6: { closed: 13 }, 7: { closed: 12 }, 8: { closed: 10, progress: 1 }
  })
  await createPicData('Aundry', 'aundry@inl.co.id', 2026, {
    1: { closed: 5 }, 2: { closed: 8 }, 3: { closed: 12 }, 4: { closed: 10 },
    5: { closed: 11 }, 6: { closed: 10 }, 7: { closed: 9 }, 8: { closed: 8, progress: 1 }
  })

  // --- Seed Historical Activities for 2025 ---
  console.log('Seeding historical activities for 2025...')
  await createPicData('Kurniawan Pralambang', 'kurniawan@inl.co.id', 2025, {
    1: { closed: 10 }, 2: { closed: 12 }, 3: { closed: 15 }, 4: { closed: 14 },
    5: { closed: 16 }, 6: { closed: 18 }, 7: { closed: 15 }, 8: { closed: 20 },
    9: { closed: 18 }, 10: { closed: 22 }, 11: { closed: 20 }, 12: { closed: 25 }
  })
  await createPicData('Herbina', 'herbina@inl.co.id', 2025, {
    1: { closed: 8 }, 2: { closed: 10 }, 3: { closed: 12 }, 4: { closed: 11 },
    5: { closed: 14 }, 6: { closed: 15 }, 7: { closed: 12 }, 8: { closed: 16 },
    9: { closed: 14 }, 10: { closed: 18 }, 11: { closed: 15 }, 12: { closed: 20 }
  })

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
