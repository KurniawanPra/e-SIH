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

async function main() {
  console.log('Clearing old data...')
  await (prisma as any).highlight.deleteMany()
  await (prisma as any).activity.deleteMany()
  await (prisma as any).ref_Item_ProgramKerja.deleteMany()
  await (prisma as any).ref_ProgramKerja.deleteMany()

  console.log('Seeding Parent Program Kerja (A, B, C)...')
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

  for (const parent of parentPrograms) {
    await (prisma as any).ref_ProgramKerja.create({ data: parent })
  }

  console.log('Seeding Sub-Program (Child Items)...')
  const childPrograms = [
    // 2026 Sub Programs
    { id: 'PROG-A1-2026', programKerjaId: 'PK-A', kode: 'A.1', namaItem: 'IT Development', status: 'On Progress', progress: 85, tahun: 2026, keterangan: 'Pengembangan aplikasi SmartWB, SAP, e-SIH, dan integrasi sistem RFID & AI CCTV' },
    { id: 'PROG-A2-2026', programKerjaId: 'PK-A', kode: 'A.2', namaItem: 'IT Network & Infrastructure', status: 'On Progress', progress: 78, tahun: 2026, keterangan: 'Pemeliharaan perangkat jaringan, router, switch pabrik, dan koneksi ISP' },
    { id: 'PROG-A3-2026', programKerjaId: 'PK-A', kode: 'A.3', namaItem: 'IT Administration, Tagihan & Pembayaran IT', status: 'On Progress', progress: 90, tahun: 2026, keterangan: 'Pengelolaan administrasi lisensi, invoice vendor IT, serta pelatihan staff' },
    { id: 'PROG-B1-2026', programKerjaId: 'PK-B', kode: 'B.1', namaItem: 'Audit Internal, Audit Eksternal & Management Review', status: 'On Progress', progress: 72, tahun: 2026, keterangan: 'Pelaksanaan audit tata kelola berkala dan kaji ulang manajemen' },
    { id: 'PROG-B2-2026', programKerjaId: 'PK-B', kode: 'B.2', namaItem: 'Inspeksi & Monitoring Supplier (Vendor), Update Lisensi & HPS', status: 'On Progress', progress: 65, tahun: 2026, keterangan: 'Evaluasi kinerja vendor dan pembaruan lisensi operasional' },
    { id: 'PROG-B3-2026', programKerjaId: 'PK-B', kode: 'B.3', namaItem: 'Sertifikat Eksternal (ISO 9001, RSPO, Halal, Kosher, CPPOB, SNI)', status: 'On Progress', progress: 88, tahun: 2026, keterangan: 'Pemeliharaan & perpanjangan 12 sertifikasi resmi eksternal' },
    { id: 'PROG-C1-2026', programKerjaId: 'PK-C', kode: 'C.1', namaItem: 'Emergency Preparedness & HSE Training', status: 'On Progress', progress: 80, tahun: 2026, keterangan: 'Kesiapsiagaan tanggap darurat dan pelatihan K3 berkala' },
    { id: 'PROG-C2-2026', programKerjaId: 'PK-C', kode: 'C.2', namaItem: 'Risk Management, Regulation & HSE Inspection', status: 'On Progress', progress: 75, tahun: 2026, keterangan: 'Manajemen risiko lingkungan kerja, kepatuhan regulasi & inspeksi rutin' },
    { id: 'PROG-C3-2026', programKerjaId: 'PK-C', kode: 'C.3', namaItem: 'HSE Report, HSE Meeting & Health Living Moment', status: 'On Progress', progress: 82, tahun: 2026, keterangan: 'Pelaporan K3 bulanan, rapat evaluasi HSE & gerakan hidup sehat' },

    // 2025 Sub Programs
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

  for (const child of childPrograms) {
    await (prisma as any).ref_Item_ProgramKerja.create({ data: child })
  }

  console.log('Seeding Users SDM...')
  try {
    await (prisma as any).user.deleteMany()
  } catch (e) {}

  const staff = [
    { name: 'Oka Aritonang', email: 'okha.aritonang@gmail.com', jabatan: 'Kepala Sub Bagian Sistem dan IT', unit: 'Sub Bagian Sistem & IT', role: 'ADMIN' },
    { name: 'RINKO', email: 'ayamsaya85@gmail.com', jabatan: 'IT Spesialist', unit: 'Seksi IT', role: 'USER' },
    { name: 'Tomy Inri Akbar Lingga', email: 'tomy.troller@gmail.com', jabatan: 'Asisten IT', unit: 'Seksi IT', role: 'USER' },
    { name: 'Developer 1', email: 'developer@developer.com', jabatan: 'IT Dev', unit: 'Seksi IT', role: 'USER' },
    { name: 'Salman Jaya Sempurna', email: 'salmanichigo@gmail.com', jabatan: 'Admin Network & Data Center', unit: 'Seksi IT', role: 'USER' },
    { name: 'AUNDRY HERMAWAN', email: 'aundry@inl.co.id', jabatan: 'Admin Network & Data Center', unit: 'Seksi IT', role: 'USER' },
    { name: 'Herbina Silaban', email: 'herbina.silaban@gmail.com', jabatan: 'Asisten MR & HSSE', unit: 'Seksi MR & HSSE', role: 'USER' },
    { name: 'Fitri Febriadi Turnip', email: 'fitriturnip@gmail.com', jabatan: 'Asisten MR & HSSE', unit: 'Seksi MR & HSSE', role: 'USER' },
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

  const getPicItemsPool = (picName: string, year: number) => {
    // Program Kerja B: Sustainable & Operations (Herbina Silaban)
    if (['Herbina', 'Herbina Silaban'].includes(picName)) {
      return [
        { progId: `PROG-B1-${year}`, item: 'Audit Internal, Audit Eksternal & Management Review', kat: `B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS`, task: 'Audit Internal Kepatuhan ISO 9001:2015', action: 'Pemeriksaan dokumen SOP operational pabrik' },
        { progId: `PROG-B2-${year}`, item: 'Inspeksi & Monitoring Supplier (Vendor)', kat: `B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS`, task: 'Inspeksi Kepatuhan Supplier Bahan Baku', action: 'Verifikasi sertifikat keberlanjutan vendor CPO & Kernel' },
        { progId: `PROG-B3-${year}`, item: 'Sertifikat Eksternal (ISO, RSPO, Halal)', kat: `B. DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS`, task: 'Perpanjangan Sertifikat Halal & RSPO', action: 'Audit lapangan dan pengajuan perpanjangan lisensi eksternal' }
      ]
    }

    // Program Kerja C: HSE / Safety & Environment / HSSE (Fitri Febriadi Turnip)
    if (['Fitri', 'Fitri Febriadi Turnip', 'Agung'].includes(picName)) {
      return [
        { progId: `PROG-C1-${year}`, item: 'Emergency Preparedness & HSE Training', kat: `C. HEALTH, SAFETY AND ENVIRONMENT (HSE)`, task: 'Simulasi Tanggap Darurat & Drill Pemadam Kebakaran', action: 'Pelaksanaan drill tanggap darurat karyawan area refinery' },
        { progId: `PROG-C2-${year}`, item: 'Risk Management & HSE Inspection', kat: `C. HEALTH, SAFETY AND ENVIRONMENT (HSE)`, task: 'Inspeksi Potensi Bahaya & APD', action: 'Inspeksi rutin ketersediaan APD dan fasilitas K3 pabrik' },
        { progId: `PROG-C3-${year}`, item: 'Waste Management & Environment Compliance', kat: `C. HEALTH, SAFETY AND ENVIRONMENT (HSE)`, task: 'Pengujian Mutu Air Limbah & Emisi Udara', action: 'Pengambilan sampel limbah WWTP dan pelaporan RKL-RPL' }
      ]
    }

    // Program Kerja A: Digital & IT Systems (RINKO, Tomy, Salman, Developer 1, Aundry, Oka)
    return [
      { progId: `PROG-A1-${year}`, item: 'Digitalisasi Operasional Pabrik & SmartWB', kat: `A. ENABLING DIGITAL AND RELIABLE OPERATION`, task: 'Implementasi & Pemeliharaan Sistem SmartWB', action: 'Monitoring pembacaan sensor load cell dan kalibrasi sistem timbangan' },
      { progId: `PROG-A2-${year}`, item: 'Otomatisasi Sistem Pelaporan & Dashboard ERP', kat: `A. ENABLING DIGITAL AND RELIABLE OPERATION`, task: 'Pengembangan Modul Pelaporan Dashboard Executive', action: 'Integrasi query database dan sinkronisasi data transaksi SAP' },
      { progId: `PROG-A3-${year}`, item: 'Infrastruktur Jaringan & Keamanan Data Center', kat: `A. ENABLING DIGITAL AND RELIABLE OPERATION`, task: 'Maintenance Server, Switch Core & Backup Database', action: 'Pengecekan temperatur data center dan backup harian snapshot VM' }
    ]
  }

  const activityBatch: any[] = []

  const pushActivityRecord = (params: {
    t: { progId: string; item: string; kat: string; task: string; action: string }
    year: number
    picName: string
    picEmail: string
    startDate: string
    dueDate: string
    closedDate: string | null
    status: string
    tindakLanjut: string
    remarks: string
    kegiatanText: string
    descriptionText: string
  }) => {
    const currentNo = globalNo++
    let targetProgId = params.t.progId
    let targetItemName = params.t.item
    let targetKat = params.t.kat

    // Untuk no >= 129, arahkan kegiatan yang tadinya ke program kerja ke-1 (PROG-A1 / IT Development) ke program kerja ke-2 (PROG-A2 / IT Network & Infrastructure)
    if (currentNo >= 129 && targetProgId.startsWith('PROG-A1')) {
      targetProgId = `PROG-A2-${params.year}`
      targetItemName = 'IT Network & Infrastructure'
    }

    activityBatch.push({
      id: `ACT-${String(currentNo).padStart(4, '0')}`,
      no: currentNo,
      idProgram: targetProgId,
      kategoriProgram: targetKat,
      itemName: targetItemName,
      kegiatan: params.kegiatanText,
      descriptionAction: params.descriptionText,
      startDate: params.startDate,
      dueDate: params.dueDate,
      closedDate: params.closedDate,
      status: params.status,
      tindakLanjut: params.tindakLanjut,
      remarks: params.remarks,
      picEmail: params.picEmail,
      picNama: params.picName,
      isActive: true
    })
  }

  // Seeding function per PIC
  const createPicData = (
    picName: string,
    picEmail: string,
    year: number,
    monthlyCounts: { [m: number]: { closed?: number; progress?: number; open?: number; weeklyClosed?: { [w: number]: number } } }
  ) => {
    const itemsPool = getPicItemsPool(picName, year)
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

            pushActivityRecord({
              t,
              year,
              picName,
              picEmail,
              startDate,
              dueDate: startDate,
              closedDate: startDate,
              status: 'Closed',
              tindakLanjut: 'Selesai dan terverifikasi di sistem',
              remarks: 'Tutup SLA Tepat Waktu',
              kegiatanText: `${t.task} (W${wr.w} #${c + 1})`,
              descriptionText: `${t.action} - PIC: ${picName}`
            })
          }
        }
      } else if (spec.closed) {
        for (let c = 0; c < spec.closed; c++) {
          const day = Math.min(28, (c % 28) + 1)
          const dayStr = String(day).padStart(2, '0')
          const t = itemsPool[c % itemsPool.length]
          const startDate = `${year}-${mStr}-${dayStr}`

          pushActivityRecord({
            t,
            year,
            picName,
            picEmail,
            startDate,
            dueDate: startDate,
            closedDate: startDate,
            status: 'Closed',
            tindakLanjut: 'Selesai dan terverifikasi di sistem',
            remarks: 'Tutup SLA Tepat Waktu',
            kegiatanText: `${t.task} #${c + 1}`,
            descriptionText: `${t.action} - PIC: ${picName}`
          })
        }
      }

      if (spec.progress) {
        for (let p = 0; p < spec.progress; p++) {
          const day = Math.min(28, (p * 5) + 3)
          const dayStr = String(day).padStart(2, '0')
          const t = itemsPool[(p + 2) % itemsPool.length]
          const startDate = `${year}-${mStr}-${dayStr}`

          pushActivityRecord({
            t,
            year,
            picName,
            picEmail,
            startDate,
            dueDate: `${year}-${mStr}-28`,
            closedDate: null,
            status: 'On Progress',
            tindakLanjut: 'Dalam proses pengujian dan validasi tim',
            remarks: 'Dalam Pengawasan PIC',
            kegiatanText: `${t.task} (Progres #${p + 1})`,
            descriptionText: `Tahap pengerjaan: ${t.action}`
          })
        }
      }

      if (spec.open) {
        for (let o = 0; o < spec.open; o++) {
          const day = Math.min(28, (o * 7) + 5)
          const dayStr = String(day).padStart(2, '0')
          const t = itemsPool[(o + 4) % itemsPool.length]
          const startDate = `${year}-${mStr}-${dayStr}`

          pushActivityRecord({
            t,
            year,
            picName,
            picEmail,
            startDate,
            dueDate: `${year}-${mStr}-28`,
            closedDate: null,
            status: 'Open',
            tindakLanjut: 'Menunggu alokasi SDM dan persetujuan anggaran',
            remarks: 'Perlu Perhatian Khusus',
            kegiatanText: `${t.task} (Pending #${o + 1})`,
            descriptionText: `Persiapan pengerjaan: ${t.action}`
          })
        }
      }
    }
  }

  // --- Seed RINKO / Kurniawan Pralambang (2026) ---
  console.log('Generating RINKO activities for 2026...')
  createPicData('RINKO', 'ayamsaya85@gmail.com', 2026, {
    1: { closed: 18, progress: 2, open: 1 },
    2: { closed: 29, progress: 3, open: 1 },
    3: { closed: 54, progress: 4, open: 2 },
    4: { closed: 38, progress: 3, open: 1 },
    5: { closed: 42, progress: 4, open: 2 },
    6: { closed: 20, progress: 2, open: 1 },
    7: { closed: 25, progress: 3, open: 1 },
    8: { closed: 25, progress: 5, open: 2, weeklyClosed: { 1: 5, 2: 7, 3: 8, 4: 5, 5: 0 } },
    9: { closed: 22, progress: 4, open: 2 },
    10: { closed: 28, progress: 5, open: 3 },
    11: { closed: 24, progress: 4, open: 2 },
    12: { closed: 30, progress: 6, open: 3 },
  })

  // --- Seed Herbina Silaban (2026) ---
  console.log('Generating Herbina Silaban activities for 2026...')
  createPicData('Herbina Silaban', 'herbina.silaban@gmail.com', 2026, {
    1: { closed: 14, progress: 2, open: 1 },
    2: { closed: 29, progress: 3, open: 1 },
    3: { closed: 54, progress: 4, open: 2 },
    4: { closed: 35, progress: 3, open: 1 },
    5: { closed: 40, progress: 4, open: 2 },
    6: { closed: 18, progress: 2, open: 1 },
    7: { closed: 22, progress: 3, open: 1 },
    8: { closed: 11, progress: 4, open: 1, weeklyClosed: { 1: 2, 2: 3, 3: 4, 4: 2, 5: 0 } },
    9: { closed: 18, progress: 3, open: 2 },
    10: { closed: 24, progress: 4, open: 2 },
    11: { closed: 20, progress: 3, open: 2 },
    12: { closed: 26, progress: 5, open: 3 },
  })

  // --- Seed Fitri Febriadi Turnip (2026) ---
  console.log('Generating Fitri Febriadi Turnip activities for 2026...')
  createPicData('Fitri Febriadi Turnip', 'fitriturnip@gmail.com', 2026, {
    1: { closed: 15, progress: 2 },
    2: { closed: 22, progress: 3 },
    3: { closed: 28, progress: 4 },
    4: { closed: 24, progress: 3 },
    5: { closed: 30, progress: 4 },
    6: { closed: 25, progress: 3 },
    7: { closed: 21, progress: 2 },
    8: { closed: 18, progress: 3, open: 2 },
    9: { closed: 16, progress: 3 },
    10: { closed: 20, progress: 4 },
    11: { closed: 18, progress: 3 },
    12: { closed: 22, progress: 4 },
  })

  // --- Seed Tomy, Salman, Developer 1, Aundry, Oka (2026) ---
  console.log('Generating other staff activities for 2026...')
  createPicData('Tomy Inri Akbar Lingga', 'tomy.troller@gmail.com', 2026, {
    1: { closed: 12 }, 2: { closed: 18 }, 3: { closed: 22 }, 4: { closed: 19 },
    5: { closed: 24 }, 6: { closed: 20 }, 7: { closed: 18 }, 8: { closed: 16, progress: 2 },
    9: { closed: 18 }, 10: { closed: 20 }, 11: { closed: 19 }, 12: { closed: 22 }
  })
  createPicData('Salman Jaya Sempurna', 'salmanichigo@gmail.com', 2026, {
    1: { closed: 8 }, 2: { closed: 12 }, 3: { closed: 18 }, 4: { closed: 15 },
    5: { closed: 19 }, 6: { closed: 16 }, 7: { closed: 15 }, 8: { closed: 12, progress: 2 },
    9: { closed: 14 }, 10: { closed: 16 }, 11: { closed: 15 }, 12: { closed: 18 }
  })
  createPicData('Developer 1', 'developer@developer.com', 2026, {
    1: { closed: 10 }, 2: { closed: 14 }, 3: { closed: 18 }, 4: { closed: 16 },
    5: { closed: 20 }, 6: { closed: 18 }, 7: { closed: 16 }, 8: { closed: 14, progress: 3 },
    9: { closed: 16 }, 10: { closed: 18 }, 11: { closed: 17 }, 12: { closed: 20 }
  })
  createPicData('AUNDRY HERMAWAN', 'aundry@inl.co.id', 2026, {
    1: { closed: 5 }, 2: { closed: 8 }, 3: { closed: 12 }, 4: { closed: 10 },
    5: { closed: 11 }, 6: { closed: 10 }, 7: { closed: 9 }, 8: { closed: 8, progress: 1 },
    9: { closed: 9 }, 10: { closed: 12 }, 11: { closed: 10 }, 12: { closed: 13 }
  })
  createPicData('Oka Aritonang', 'okha.aritonang@gmail.com', 2026, {
    1: { closed: 6 }, 2: { closed: 9 }, 3: { closed: 14 }, 4: { closed: 12 },
    5: { closed: 15 }, 6: { closed: 12 }, 7: { closed: 11 }, 8: { closed: 10, progress: 2 },
    9: { closed: 11 }, 10: { closed: 14 }, 11: { closed: 13 }, 12: { closed: 15 }
  })

  // --- Seed Historical Activities for 2025 ---
  console.log('Generating historical activities for 2025...')
  createPicData('RINKO', 'ayamsaya85@gmail.com', 2025, {
    1: { closed: 10 }, 2: { closed: 12 }, 3: { closed: 15 }, 4: { closed: 14 },
    5: { closed: 16 }, 6: { closed: 18 }, 7: { closed: 15 }, 8: { closed: 20 },
    9: { closed: 18 }, 10: { closed: 22 }, 11: { closed: 20 }, 12: { closed: 25 }
  })
  createPicData('Herbina Silaban', 'herbina.silaban@gmail.com', 2025, {
    1: { closed: 8 }, 2: { closed: 10 }, 3: { closed: 12 }, 4: { closed: 11 },
    5: { closed: 14 }, 6: { closed: 15 }, 7: { closed: 12 }, 8: { closed: 16 },
    9: { closed: 14 }, 10: { closed: 18 }, 11: { closed: 15 }, 12: { closed: 20 }
  })

  console.log(`Inserting ${activityBatch.length} activity records in bulk...`)
  const chunkSize = 200
  for (let i = 0; i < activityBatch.length; i += chunkSize) {
    const chunk = activityBatch.slice(i, i + chunkSize)
    await (prisma as any).activity.createMany({ data: chunk })
  }

  // --- Seed Monthly Highlight Reports (2026) ---
  console.log('Seeding monthly highlight reports (2026)...')
  const highlightSamples: Array<{ bulan: number; item: string; description: string; actionToBeTaken: string; namePic: string; targetDate: string; status: string; remarks: string; closedDate?: string; bagian: string }> = [
    // Januari
    {
      bulan: 1,
      item: 'Kick-off Digitalisasi SmartWB & Evaluasi Sistem ERP',
      description: 'Penyusunan blueprint arsitektur sistem SmartWB dan evaluasi kebutuhan lisensi pengguna.',
      actionToBeTaken: 'Finalisasi kebutuhan server dan pembagian task developer IT.',
      namePic: 'RINKO / Fitri Febriadi Turnip',
      targetDate: '2026-01-25',
      status: 'Closed',
      closedDate: '2026-01-24',
      remarks: 'Penyusunan blueprint selesai dan disetujui Kabag.',
      bagian: 'IT',
    },
    {
      bulan: 1,
      item: 'Audit Internal Kepatuhan ISO 9001:2015 Periode Q1',
      description: 'Pemeriksaan dokumen SOP operational pabrik Sei Mangkei.',
      actionToBeTaken: 'Penyusunan laporan temuan audit dan distribusi rekomendasi perbaikan.',
      namePic: 'Herbina Silaban',
      targetDate: '2026-01-30',
      status: 'Closed',
      closedDate: '2026-01-29',
      remarks: 'Temuan audit telah diselesaikan oleh masing-masing unit.',
      bagian: 'SISTEM',
    },
    // Februari
    {
      bulan: 2,
      item: 'Upgrade Bandwidth Failover ISP Pabrik',
      description: 'Peningkatan kapasitas bandwidth jaringan backup ISP dari 50Mbps ke 100Mbps.',
      actionToBeTaken: 'Instalasi router mikrotik baru dan pengujian failover otomatis.',
      namePic: 'Tomy Inri Akbar Lingga / Salman Jaya Sempurna',
      targetDate: '2026-02-20',
      status: 'Closed',
      closedDate: '2026-02-18',
      remarks: 'Koneksi failover berjalan stabil tanpa lag.',
      bagian: 'IT',
    },
    {
      bulan: 2,
      item: 'Persiapan Audit Sertifikasi Halal BPJPH',
      description: 'Verifikasi dokumen bahan baku dan sistem jaminan produk halal (SJPH).',
      actionToBeTaken: 'Pendampingan auditor eksternal selama inspeksi pabrik.',
      namePic: 'Herbina Silaban',
      targetDate: '2026-02-28',
      status: 'Closed',
      closedDate: '2026-02-27',
      remarks: 'Sertifikat Halal diterbitkan resmi.',
      bagian: 'SISTEM',
    },
    // Maret
    {
      bulan: 3,
      item: 'Pengembangan Modul AI CCTV Vehicle Counting',
      description: 'Pelatihan model AI untuk mendeteksi jenis kendaraan tangki CPO.',
      actionToBeTaken: 'Integrasi modul AI dengan antrean timbangan digital.',
      namePic: 'RINKO / Salman Jaya Sempurna',
      targetDate: '2026-03-25',
      status: 'Closed',
      closedDate: '2026-03-24',
      remarks: 'Akurasi deteksi AI mencapai 96.5%.',
      bagian: 'IT',
    },
    // April
    {
      bulan: 4,
      item: 'Pelatihan Tanggap Darurat & Drill Damkar Pabrik',
      description: 'Simulasi penanganan keadaan darurat kebakaran untuk seluruh karyawan refinery.',
      actionToBeTaken: 'Pengujian fungsi hydrant dan APAR di titik vital operasional.',
      namePic: 'Fitri Febriadi Turnip',
      targetDate: '2026-04-18',
      status: 'Closed',
      closedDate: '2026-04-18',
      remarks: 'Seluruh karyawan lulus pengujian simulasi.',
      bagian: 'HSSE',
    },
    // Mei
    {
      bulan: 5,
      item: 'Renewal Lisensi Software & Database Security Patch',
      description: 'Pembaruan lisensi antivirus enterprise dan patching kerentanan database SQL.',
      actionToBeTaken: 'Penerapan patch keamanan pada server staging dan produksi.',
      namePic: 'Salman Jaya Sempurna / Tomy Inri Akbar Lingga',
      targetDate: '2026-05-15',
      status: 'Closed',
      closedDate: '2026-05-14',
      remarks: 'Patching sukses tanpa downtime.',
      bagian: 'IT',
    },
    // Juni
    {
      bulan: 6,
      item: 'Audit Kesiapsiagaan Sistem Keamanan Informasi (ISO 27001)',
      description: 'Review kebijakan privasi data dan hak akses akun karyawan.',
      actionToBeTaken: 'Pemberlakuan Multi-Factor Authentication (MFA) pada portal internal.',
      namePic: 'RINKO / AUNDRY HERMAWAN',
      targetDate: '2026-06-28',
      status: 'Closed',
      closedDate: '2026-06-25',
      remarks: 'MFA telah aktif untuk seluruh pengguna admin.',
      bagian: 'IT',
    },
    // Juli
    {
      bulan: 7,
      item: 'Inspeksi & Evaluasi Kinerja Vendor IT Hardware',
      description: 'Penilaian SLA perbaikan perangkat komputer dan jaringan dari vendor mitra.',
      actionToBeTaken: 'Penyusunan skor vendor dan rekomendasi kontrak perpanjangan.',
      namePic: 'Herbina Silaban / Tomy Inri Akbar Lingga',
      targetDate: '2026-07-22',
      status: 'Closed',
      closedDate: '2026-07-21',
      remarks: 'Evaluasi vendor selesai tepat waktu.',
      bagian: 'IT',
    },
    // Agustus (Highlight Report INLHO/REP-F/-021)
    {
      bulan: 8,
      item: 'Rencana Pindah ke KPBN',
      description: 'Sudah konfirmasi ke bagian Asset KPBN rencana Kamis mau bertemu dengan Pak Erwin Kasubag Optimalisasi Asset Jam 10 di KPBN Medan.\nSelanjutnya kamis siang Rencana Mau bertemu dengan Buk Rizky dikandir N3 bagian Pertahanan mengenai bagaimana prosedur proses pelepasan Mess Gedung medan',
      actionToBeTaken: '',
      namePic: 'Oka Aritonang / SDM / Sekper',
      targetDate: '2026-08-21',
      status: 'Open',
      remarks: 'Hasil analisa sudah selesai, Memo sudah diserahkan ke bagian Sekper agar diriview.',
      bagian: 'SISTEM',
    },
    {
      bulan: 8,
      item: 'Seleksi security Sei Mangkei',
      description: 'Seleksi nya akan dilakukan dgn 2 Opsi:\nOpsi 1. Minta bantuan tool Security yang pemenang\nOpsi 2. Internal INL. Sebagai catatan : Setelah pemenang ditentukan minggu ini',
      actionToBeTaken: '',
      namePic: 'Oka Aritonang / HSSE',
      targetDate: '2026-08-25',
      status: 'Open',
      remarks: '- Pemenang sudah ditetapkan,\n- Seleksi atas personil lama akan selesai tgl. 12 Jul 24.\n- Setelah itu akan ditetapkan personil baru\n\n(Nama-nama security, foto serta pengalaman security sei mangkei untuk diseleksi terlampir)',
      bagian: 'HSSE',
    },
    {
      bulan: 8,
      item: 'Sertifikasi ISCC SBE',
      description: 'Meeting internal HSSE mengenai peluang Sertifikasi ISCC SBE peluang penurunan Harga SBE sekarang Rp.380/kg turun menjadi Rp.250/kg sekitar Rp.150.\nNamun masih butuh studi, dalam minggu ini akan clear',
      actionToBeTaken: '',
      namePic: 'Oka Aritonang / HSSE',
      targetDate: '2026-08-20',
      status: 'Open',
      remarks: 'Meeting dengan Mega grand terkait tindaklanjut ISCC SBE menetapkan kerjasama tgl. 11 serta akhir Jul ada kunjungan ke dumai.',
      bagian: 'HSSE',
    },
    {
      bulan: 8,
      item: 'Perbantuan/ Pemanfaatan untuk personil cleaning area Refinery',
      description: 'Pemanfaatan Operator Loader untuk pengangkutan limbah SBE akan diperbantukan sebagai cleaning di sekitar Refinery.\nAnalisanya pekerjaan operator setelah angkut SBE tidak mempunyai kegiatan lagi. Sehingga diperbantukan/ dimanfaatkan sebagai tenaga cleaning.',
      actionToBeTaken: '',
      namePic: 'Oka Aritonang / SDM',
      targetDate: '2026-08-15',
      closedDate: '2026-08-15',
      status: 'Closed',
      remarks: 'Minggu ini akan terealisasi.',
      bagian: 'HSSE',
    },
    {
      bulan: 8,
      item: 'Kegiatan Jumat Bersih',
      description: 'Jumat ini akan dilakukan Jumat bersih area sekitar Pump House dan Refinery.',
      actionToBeTaken: '',
      namePic: 'Oka Aritonang',
      targetDate: '2026-08-14',
      closedDate: '2026-08-14',
      status: 'Closed',
      remarks: 'Memo akan di share',
      bagian: 'HSSE',
    },
    {
      bulan: 8,
      item: 'Review proses bisnis project Management',
      description: 'Review proses bisnis project Management sudah dibahas secara internal dengan Pak Ipan dan Tim Andika.\nAda penambahan terkait pengawasan dan Monitoring setiap Project.',
      actionToBeTaken: '',
      namePic: 'Oka Aritonang',
      targetDate: '2026-08-28',
      status: 'Open',
      remarks: 'On Progress.\nSosialisasi akan dilakukan minggu depan',
      bagian: 'SISTEM',
    },
    {
      bulan: 8,
      item: 'Review Proses Bisnis Marketing dan sales',
      description: 'Review Proses Bisnis Marketing dan sales sudah dilakukan dan telah direview oleh Pak Mehaga, saran Pak mehaga agar direview Tim risiko manajemen sebelum ke tim BCG.',
      actionToBeTaken: '',
      namePic: 'Oka Aritonang',
      targetDate: '2026-08-29',
      status: 'Open',
      remarks: 'On Progress.\nAkan diskusi dengan Tim MR',
      bagian: 'SISTEM',
    },
    // September
    {
      bulan: 9,
      item: 'Migrasi Server Cloud Staging ke Data Center Lokal',
      description: 'Persiapan migrasi server cloud untuk pemenuhan kepatuhan privasi data lokal.',
      actionToBeTaken: 'Penyusunan alur sinkronisasi data dan pengujian latensi.',
      namePic: 'Salman Jaya Sempurna / Tomy Inri Akbar Lingga',
      targetDate: '2026-09-25',
      status: 'On Progress',
      remarks: 'Tahap konfigurasi firewall dan pengujian koneksi.',
      bagian: 'IT',
    },
    // Oktober
    {
      bulan: 10,
      item: 'Inspeksi Fasilitas K3 & Sertifikasi Alat Berat',
      description: 'Pemeriksaan rutin kelayakan operasional forklift dan boiler pabrik.',
      actionToBeTaken: 'Pengajuan perpanjangan sertifikat ke Disnaker.',
      namePic: 'Fitri Febriadi Turnip',
      targetDate: '2026-10-20',
      status: 'Open',
      remarks: 'Pemeriksaan fisik dijadwalkan minggu kedua.',
      bagian: 'HSSE',
    },
    // November
    {
      bulan: 11,
      item: 'Penyusunan RKAP Program Kerja Sistem & IT Tahun 2027',
      description: 'Perencanaan anggaran dan daftar target pengembangan IT untuk tahun depan.',
      actionToBeTaken: 'Rapat konsolidasi kebutuhan perangkat lunak dan infrastruktur.',
      namePic: 'RINKO / Herbina Silaban',
      targetDate: '2026-11-28',
      status: 'Open',
      remarks: 'Draf awal RKAP sedang disusun.',
      bagian: 'IT',
    },
    // Desember
    {
      bulan: 12,
      item: 'Evaluasi Tahunan & Closing Audit Kinerja SDM & IT',
      description: 'Laporan pencapaian KPI bulanan dan penyelesaian seluruh highlight report 2026.',
      actionToBeTaken: 'Ekspor laporan rekapitulasi eksekutif akhir tahun.',
      namePic: 'RINKO / Herbina Silaban / Fitri Febriadi Turnip',
      targetDate: '2026-12-25',
      status: 'Open',
      remarks: 'Persiapan rekapitulasi data akhir tahun.',
      bagian: 'SISTEM',
    },
  ]
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
