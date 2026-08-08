import "dotenv/config"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const getPastDate = (daysAgo: number) => {
    let d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString().split('T')[0]
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const programsData = [
    { id: 'PROG-01', kategori: 'A. ENABLING DIGITAL OPERATION', namaItem: 'IT Development', status: 'On Progress', progress: 80, keterangan: 'Integrasi sistem & ERP' },
    { id: 'PROG-02', kategori: 'A. ENABLING DIGITAL OPERATION', namaItem: 'IT Network & Infrastructure', status: 'On Progress', progress: 60, keterangan: 'Upgrade bandwidth & maintenance' },
    { id: 'PROG-03', kategori: 'A. ENABLING DIGITAL OPERATION', namaItem: 'IT Administration', status: 'Open', progress: 10, keterangan: 'Perpanjangan Lisensi Antivirus' },
    { id: 'PROG-04', kategori: 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', namaItem: 'Sertifikasi Eksternal', status: 'On Progress', progress: 25, keterangan: 'Audit Halal & Kosher' },
    { id: 'PROG-05', kategori: 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', namaItem: 'Audit Internal', status: 'On Progress', progress: 70, keterangan: 'Audit Mutu Semester 1' },
    { id: 'PROG-06', kategori: 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', namaItem: 'Inspeksi & Monitoring', status: 'Open', progress: 15, keterangan: 'Monitoring limbah' },
    { id: 'PROG-07', kategori: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', namaItem: 'Emergency Preparedness', status: 'Closed', progress: 100, keterangan: 'Simulasi kebakaran selesai' },
    { id: 'PROG-08', kategori: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', namaItem: 'HSE Training', status: 'On Progress', progress: 30, keterangan: 'Pelatihan K3 Umum' },
    { id: 'PROG-09', kategori: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', namaItem: 'Risk Management', status: 'On Progress', progress: 50, keterangan: 'Review HIRADC' }
  ]

  const activitiesData = [
    { id: 'ACT-001', no: 1, idProgram: 'PROG-01', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Development', kegiatan: 'Integrasi SAP ERP Module', descriptionAction: 'Develop & Testing API', startDate: getPastDate(90), dueDate: getPastDate(60), closedDate: getPastDate(60), tindakLanjut: 'UAT selesai', kendala: '-', status: 'Closed', remarks: 'Sukses go-live', picEmail: 'salman@perusahaan.com', picNama: 'Salman' },
    { id: 'ACT-002', no: 2, idProgram: 'PROG-01', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Development', kegiatan: 'Pembuatan Modul Approval HR', descriptionAction: 'Coding & Design', startDate: getPastDate(50), dueDate: getPastDate(20), closedDate: getPastDate(20), tindakLanjut: 'Deploy ke Production', kendala: '-', status: 'Closed', remarks: 'Modul HR live', picEmail: 'salman@perusahaan.com', picNama: 'Salman' },
    { id: 'ACT-003', no: 3, idProgram: 'PROG-01', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Development', kegiatan: 'Perbaikan Bug Absensi', descriptionAction: 'Tracing bug di backend', startDate: getPastDate(15), dueDate: getPastDate(5), closedDate: getPastDate(6), tindakLanjut: 'Upload patch', kendala: '-', status: 'Closed', remarks: 'Absensi lancar', picEmail: 'salman@perusahaan.com', picNama: 'Salman' },
    { id: 'ACT-004', no: 4, idProgram: 'PROG-01', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Development', kegiatan: 'Migrasi Database Utama', descriptionAction: 'Backup & Restore Data', startDate: getPastDate(5), dueDate: getPastDate(-10), closedDate: '', tindakLanjut: 'Test integrasi', kendala: 'Kapasitas server penuh', status: 'On Progress', remarks: 'Menunggu persetujuan upgrade server', picEmail: 'salman@perusahaan.com', picNama: 'Salman' },
    { id: 'ACT-005', no: 5, idProgram: 'PROG-02', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Network & Infrastructure', kegiatan: 'Pemasangan Access Point Area Produksi', descriptionAction: 'Tarik kabel & Pasang AP', startDate: getPastDate(60), dueDate: getPastDate(55), closedDate: getPastDate(55), tindakLanjut: 'Sinyal stabil', kendala: '-', status: 'Closed', remarks: 'Selesai tepat waktu', picEmail: 'reza@perusahaan.com', picNama: 'Reza' },
    { id: 'ACT-006', no: 6, idProgram: 'PROG-02', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Network & Infrastructure', kegiatan: 'Maintenance Server Room', descriptionAction: 'Pembersihan fisik & cek kabel', startDate: getPastDate(30), dueDate: getPastDate(28), closedDate: getPastDate(29), tindakLanjut: 'Selesai', kendala: '-', status: 'Closed', remarks: 'Suhu server stabil', picEmail: 'reza@perusahaan.com', picNama: 'Reza' },
    { id: 'ACT-007', no: 7, idProgram: 'PROG-02', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Network & Infrastructure', kegiatan: 'Upgrade Bandwidth ISP', descriptionAction: 'Meeting dengan Telkom', startDate: getPastDate(10), dueDate: getPastDate(-5), closedDate: '', tindakLanjut: 'Draft BAST', kendala: 'Menunggu tanda tangan GM', status: 'On Progress', remarks: '-', picEmail: 'reza@perusahaan.com', picNama: 'Reza' },
    { id: 'ACT-008', no: 8, idProgram: 'PROG-04', kategoriProgram: 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', itemName: 'Sertifikasi Eksternal', kegiatan: 'Persiapan Audit Halal', descriptionAction: 'Review dokumen bahan baku', startDate: getPastDate(120), dueDate: getPastDate(90), closedDate: getPastDate(85), tindakLanjut: 'Dokumen di-submit', kendala: '-', status: 'Closed', remarks: 'Sertifikat terbit', picEmail: 'fitri@perusahaan.com', picNama: 'Fitri' },
    { id: 'ACT-009', no: 9, idProgram: 'PROG-04', kategoriProgram: 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', itemName: 'Sertifikasi Eksternal', kegiatan: 'Audit Surveillance ISO 9001', descriptionAction: 'Mendampingi auditor', startDate: getPastDate(45), dueDate: getPastDate(40), closedDate: getPastDate(40), tindakLanjut: 'Perbaikan minor', kendala: '-', status: 'Closed', remarks: 'Lolos audit', picEmail: 'fitri@perusahaan.com', picNama: 'Fitri' },
    { id: 'ACT-010', no: 10, idProgram: 'PROG-05', kategoriProgram: 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', itemName: 'Audit Internal', kegiatan: 'Audit Mutu Internal Semester 1', descriptionAction: 'Pelaksanaan Audit', startDate: getPastDate(15), dueDate: getPastDate(-15), closedDate: '', tindakLanjut: 'Kompilasi temuan', kendala: 'Beberapa auditee sedang cuti', status: 'On Progress', remarks: 'Jadwal diatur ulang', picEmail: 'fitri@perusahaan.com', picNama: 'Fitri' },
    { id: 'ACT-011', no: 11, idProgram: 'PROG-07', kategoriProgram: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', itemName: 'Emergency Preparedness', kegiatan: 'Simulasi Kebakaran Gabungan', descriptionAction: 'Praktik pemadaman api', startDate: getPastDate(75), dueDate: getPastDate(70), closedDate: getPastDate(70), tindakLanjut: 'Evaluasi waktu tanggap', kendala: '-', status: 'Closed', remarks: 'Waktu evakuasi 3 menit', picEmail: 'herbina@perusahaan.com', picNama: 'Herbina' },
    { id: 'ACT-012', no: 12, idProgram: 'PROG-08', kategoriProgram: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', itemName: 'HSE Training', kegiatan: 'Pelatihan K3 Umum Batch 1', descriptionAction: 'Training in-house', startDate: getPastDate(40), dueDate: getPastDate(35), closedDate: getPastDate(35), tindakLanjut: 'Sertifikat internal dibagikan', kendala: '-', status: 'Closed', remarks: 'Dihadiri 30 orang', picEmail: 'herbina@perusahaan.com', picNama: 'Herbina' },
    { id: 'ACT-013', no: 13, idProgram: 'PROG-09', kategoriProgram: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', itemName: 'Risk Management', kegiatan: 'Review HIRADC Pabrik', descriptionAction: 'Inspeksi lapangan', startDate: getPastDate(10), dueDate: getPastDate(-10), closedDate: '', tindakLanjut: 'Revisi dokumen', kendala: 'Menunggu input manager produksi', status: 'On Progress', remarks: '-', picEmail: 'herbina@perusahaan.com', picNama: 'Herbina' },
    { id: 'ACT-014', no: 14, idProgram: 'PROG-08', kategoriProgram: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', itemName: 'HSE Training', kegiatan: 'Pelatihan First Aid', descriptionAction: 'Kerjasama dengan PMI', startDate: getPastDate(100), dueDate: getPastDate(98), closedDate: getPastDate(98), tindakLanjut: 'Selesai', kendala: '-', status: 'Closed', remarks: 'Berjalan lancar', picEmail: 'agung@perusahaan.com', picNama: 'Agung' },
    { id: 'ACT-015', no: 15, idProgram: 'PROG-09', kategoriProgram: 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', itemName: 'Risk Management', kegiatan: 'Inspeksi APAR Bulanan', descriptionAction: 'Cek tekanan & kondisi fisik', startDate: getPastDate(20), dueDate: getPastDate(18), closedDate: getPastDate(19), tindakLanjut: 'Penggantian 2 APAR bocor', kendala: '-', status: 'Closed', remarks: 'Aman', picEmail: 'agung@perusahaan.com', picNama: 'Agung' },
    { id: 'ACT-016', no: 16, idProgram: 'PROG-06', kategoriProgram: 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', itemName: 'Inspeksi & Monitoring', kegiatan: 'Pengujian Kualitas Air Limbah', descriptionAction: 'Ambil sampel ke lab', startDate: todayStr, dueDate: getPastDate(-5), closedDate: '', tindakLanjut: 'Menunggu hasil lab eksternal', kendala: 'Lab penuh', status: 'On Progress', remarks: '-', picEmail: 'agung@perusahaan.com', picNama: 'Agung' },
    { id: 'ACT-017', no: 17, idProgram: 'PROG-03', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Administration', kegiatan: 'Perpanjangan Lisensi Microsoft', descriptionAction: 'Rekap user aktif', startDate: todayStr, dueDate: getPastDate(-7), closedDate: '', tindakLanjut: 'Approval PO', kendala: '-', status: 'Open', remarks: '-', picEmail: 'dina@perusahaan.com', picNama: 'Dina' },
    { id: 'ACT-018', no: 18, idProgram: 'PROG-03', kategoriProgram: 'A. ENABLING DIGITAL OPERATION', itemName: 'IT Administration', kegiatan: 'Pengadaan Laptop Staff Baru', descriptionAction: 'Survey harga vendor', startDate: getPastDate(5), dueDate: getPastDate(-14), closedDate: '', tindakLanjut: 'Tunggu barang datang', kendala: 'Stok kosong di distributor', status: 'On Progress', remarks: '-', picEmail: 'dina@perusahaan.com', picNama: 'Dina' },
    { id: 'ACT-019', no: 19, idProgram: 'PROG-05', kategoriProgram: 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', itemName: 'Audit Internal', kegiatan: 'Meeting Tinjauan Manajemen', descriptionAction: 'Persiapan materi presentasi KPI', startDate: getPastDate(3), dueDate: getPastDate(-2), closedDate: '', tindakLanjut: 'Finalisasi slide', kendala: '-', status: 'On Progress', remarks: '-', picEmail: 'pimpinan@perusahaan.com', picNama: 'Kasubag SDM & Sistem' }
  ]

  for (const prog of programsData) {
    await prisma.masterProgram.upsert({
      where: { id: prog.id },
      update: prog,
      create: prog
    })
  }

  for (const act of activitiesData) {
    await prisma.activity.upsert({
      where: { id: act.id },
      update: act,
      create: act
    })
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
