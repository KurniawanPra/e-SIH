// Local QA only: real HTTP app + isolated PostgreSQL + a fixture Portal. No production DB.
import { createServer } from 'node:http'
import { createTestDatabase } from './database'

async function main() {
  const database = await createTestDatabase()
  Object.assign(process.env, {
    NODE_ENV: 'test', DATABASE_URL: database.url,
    TARGET_FRONTEND_ORIGIN: 'http://localhost:18098', ALLOWED_ORIGINS: 'http://127.0.0.1:18098',
    TARGET_APP_ID: '924b0197-31b4-4620-b15e-c037989b49a3',
    SESSION_SECRET_HEX: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    COOKIE_NAME: 'esih_qa_session', COOKIE_SECURE: 'false', SSO_INTERNAL_TOKEN: 'local-qa-only',
  })
  const people = [
    { id: '65518f57-35ea-43b2-af59-8e3ea489586b', namaLengkap: 'Oka Aritonang', email: 'oka@inl.co.id', jabatan: 'Kepala Sub Bagian Sistem dan IT', unit: { id: 'unit-it', nama: 'Sistem & IT' }, isActive: true },
    { id: '32a5db30-417c-40da-8849-5a299ed1b0fc', namaLengkap: 'Tomy Inri Akbar Lingga', email: 'tomy.troller@gmail.com', jabatan: 'Asisten IT', unit: { id: 'unit-it', nama: 'IT' }, isActive: true },
  ]
  const portal = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json')
    if (request.url === '/api/sso/employees') return response.end(JSON.stringify({ success: true, data: people }))
    let body = ''
    for await (const chunk of request) body += chunk
    const token = JSON.parse(body || '{}').token
    const person = token === 'qa-admin' ? people[0] : people[1]
    const employee = token === 'qa-large' ? { ...person, fotoProfil: 'data:image/png;base64,' + 'A'.repeat(4_000) } : person
    response.end(JSON.stringify({ success: true, data: { id: person.id, email: person.email, isActive: true, employee } }))
  })
  await new Promise<void>(resolve => portal.listen(0, '127.0.0.1', resolve))
  process.env.PORTAL_API_URL = `http://127.0.0.1:${(portal.address() as any).port}`
  const prisma = (await import('../src/plugins/prisma')).default
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const date = (day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  await prisma.ref_ProgramKerja.create({ data: { id: 'PK-A-QA', kode: 'A', namaProgram: 'Program QA IT', tahun: year } })
  await prisma.ref_Item_ProgramKerja.create({ data: { id: 'PROG-A1-QA', programKerjaId: 'PK-A-QA', kode: 'A.1', namaItem: 'Pengembangan aplikasi', tahun: year } })
  await prisma.ref_UserOverride.create({ data: { userId: people[1].id, programIds: ['PK-A-QA'] } })
  for (const [i, day] of [2, 8, 15, 22, 28].entries()) {
    await prisma.activity.create({ data: {
      id: `QA-${i}`, no: i + 1, idProgram: 'PROG-A1-QA', kategoriProgram: 'A Program QA IT', itemName: 'Pengembangan aplikasi',
      kegiatan: `Kegiatan QA M${i + 1}: Pemeriksaan dashboard dan laporan operasional dengan judul panjang`,
      descriptionAction: 'Deskripsi lengkap untuk verifikasi modal. '.repeat(15) + 'AKHIR DESKRIPSI QA',
      startDate: date(day), dueDate: date(Math.min(day + 2, 28)), status: i % 2 === 0 ? 'Closed' : 'On Progress',
      closedDate: i % 2 === 0 ? date(day) : null, picNama: people[1].namaLengkap, picEmail: people[1].email,
      kendala: i === 1 ? 'Menunggu validasi' : '', tindakLanjut: 'Verifikasi laporan', remarks: 'DATA UJI LOKAL',
    } })
  }
  // Include a genuine fifth-week record only in months containing day 29.
  if (new Date(year, month, 0).getDate() >= 29) await prisma.activity.create({ data: {
    id: 'QA-5', no: 6, kategoriProgram: 'Personal', itemName: 'Weekly Activity', kegiatan: 'Kegiatan QA tanggal 29',
    startDate: date(29), dueDate: date(29), status: 'Open', picNama: people[1].namaLengkap, picEmail: people[1].email,
  } })
  await prisma.highlight.create({ data: { bulan: month, tahun: year, item: 'Highlight QA bulan ini', bagian: 'IT', namePic: people[1].namaLengkap, status: 'Closed', targetDate: date(8), closedDate: date(8), authorId: people[1].id, programId: 'PROG-A1-QA' } })
  const app = (await import('../src/app')).buildApp()
  await app.listen({ host: '127.0.0.1', port: 13015 })
  console.log('QA backend ready on 127.0.0.1:13015. Fixture SSO: /sso-callback?token=qa-admin or qa-user')
  const stop = async () => { await app.close(); await prisma.$disconnect(); await database.close(); portal.close(); process.exit(0) }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}
main().catch(error => { console.error(error); process.exit(1) })
