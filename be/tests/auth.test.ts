import assert from 'node:assert/strict'
import { createServer, type Server } from 'node:http'
import { after, before, test } from 'node:test'
import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { createTestDatabase } from './database'

const frontendOrigin = 'http://localhost:4100'
const appId = '11111111-1111-4111-8111-111111111111'
let portal: Server
let app: FastifyInstance
let database: Awaited<ReturnType<typeof createTestDatabase>>
let prisma: PrismaClient

before(async () => {
  database = await createTestDatabase()
  process.env.DATABASE_URL = database.url
  portal = createServer(async (request, response) => {
    if (request.url === '/api/sso/grades') {
      assert.equal(request.headers['x-internal'], 'test-internal-token')
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({
        success: true,
        data: [{ id: 'grade-1', kode: 'BOM-4', label: 'Officer', level: 5 }],
      }))
      return
    }
    let raw = ''
    for await (const chunk of request) raw += chunk
    const token = JSON.parse(raw || '{}').token
    if (token === 'fixture-ADMIN' || token === 'fixture-USER') {
      const admin = token === 'fixture-ADMIN'
      const id = admin ? '65518f57-35ea-43b2-af59-8e3ea489586b' : '32a5db30-417c-40da-8849-5a299ed1b0fc'
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ success: true, data: {
        id, email: admin ? 'oka@inl.co.id' : 'tomy.troller@gmail.com', isActive: true,
        employee: { id, namaLengkap: admin ? 'Oka Aritonang' : 'Tomy Inri Akbar Lingga', jabatan: admin ? 'Kepala Sub Bagian Sistem dan IT' : 'Asisten IT', unit: { id: 'unit-it', nama: 'Seksi IT' } },
      } }))
      return
    }
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
      success: true,
      data: {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'user@example.test',
        isActive: true,
        employee: {
          id: '33333333-3333-4333-8333-333333333333',
          nrk: 'EMP-001',
          namaLengkap: token === 'oversized-identity' ? 'N'.repeat(5_000) : 'User Template',
          // Portal can return unrelated, large employee metadata. It must not live in a cookie.
          ...(token === 'large-profile' ? { fotoProfil: 'data:image/png;base64,' + 'A'.repeat(12_000), riwayat: 'metadata'.repeat(2_000) } : {}),
          jabatan: 'Programmer',
          atasan: {
            id: '55555555-5555-4555-8555-555555555555',
            nama: 'Atasan Template',
          },
          grade: { kode: 'BOM-4', label: 'Officer', level: 5 },
          unit: {
            id: '44444444-4444-4444-8444-444444444444',
            kode: 'SIS',
            nama: 'Seksi Sistem',
            tipe: 'seksi',
            path: 'Direktorat Utama / Bagian IT / Seksi Sistem',
            ...(token === 'large-profile' ? { hierarchy: Array.from({ length: 20 }, (_, i) => ({ id: `unit-${i}`, nama: 'Unit induk organisasi', kode: `U${i}`, tipe: 'bagian', parentId: null })) } : {}),
          },
          penempatanArea: {
            id: '66666666-6666-4666-8666-666666666666',
            kode: 'HO',
            nama: 'Kantor Pusat',
          },
        },
      },
    }))
  })

  await new Promise<void>((resolve) => portal.listen(0, '127.0.0.1', resolve))
  const address = portal.address()
  if (!address || typeof address === 'string') throw new Error('Portal test gagal start')

  process.env.NODE_ENV = 'test'
  process.env.PORTAL_API_URL = `http://127.0.0.1:${address.port}`
  process.env.SSO_INTERNAL_TOKEN = 'test-internal-token'
  process.env.TARGET_APP_ID = appId
  process.env.TARGET_FRONTEND_ORIGIN = frontendOrigin
  process.env.SESSION_SECRET_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

  const module = await import('../src/app')
  prisma = (await import('../src/plugins/prisma')).default
  app = module.buildApp()
  await app.ready()
})

after(async () => {
  await app?.close()
  await prisma?.$disconnect()
  await database?.close()
  await new Promise<void>((resolve, reject) => {
    portal.close((error) => error ? reject(error) : resolve())
  })
})

test('menukar token Portal menjadi sesi cookie HttpOnly', async () => {
  const login = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    headers: { origin: frontendOrigin },
    payload: { ssoToken: 'one-time-token', appId },
  })

  assert.equal(login.statusCode, 200, login.body)
  assert.equal(login.json().data.token, undefined)
  const setCookie = login.headers['set-cookie']
  assert.equal(typeof setCookie, 'string')
  assert.match(setCookie as string, /HttpOnly/i)

  const cookie = (setCookie as string).split(';', 1)[0]
  const me = await app.inject({
    method: 'GET',
    url: '/api/auth/me',
    headers: { cookie },
  })

  assert.equal(me.statusCode, 200)
  assert.equal(me.headers['cache-control'], 'no-store')
  assert.equal(me.json().data.name, 'User Template')
  assert.equal(me.json().data.employeeId, '33333333-3333-4333-8333-333333333333')
  assert.equal(me.json().data.employee.nrk, 'EMP-001')
  assert.equal(
    me.json().data.unit.path,
    'Direktorat Utama / Bagian IT / Seksi Sistem',
  )
  assert.equal(me.json().data.penempatanArea.nama, 'Kantor Pusat')

  const grades = await app.inject({
    method: 'GET',
    url: '/api/portal/grades',
    headers: { cookie },
  })
  assert.equal(grades.statusCode, 200)
  assert.equal(grades.json().data[0].kode, 'BOM-4')
})

test('menolak request mutasi tanpa Origin frontend', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { ssoToken: 'one-time-token', appId },
  })

  assert.equal(response.statusCode, 403)
})

async function session(role: 'ADMIN' | 'USER') {
  const login = await app.inject({ method: 'POST', url: '/api/auth/login', headers: { origin: frontendOrigin }, payload: { ssoToken: `fixture-${role}`, appId } })
  assert.equal(login.statusCode, 200, login.body)
  return { origin: frontendOrigin, cookie: String(login.headers['set-cookie']).split(';', 1)[0] }
}

const activity = {
  kegiatan: 'Laporan kegiatan lengkap', descriptionAction: 'Deskripsi panjang yang tetap terbaca di modal.',
  startDate: '2026-08-08', dueDate: '2026-08-15', status: 'Open',
  picNama: 'Tomy Inri Akbar Lingga', picEmail: 'tomy.troller@gmail.com',
}

test('Migrated reporting tables accept Portal identities without a legacy User row', async () => {
  const admin = await session('ADMIN')
  const parent = await app.inject({ method: 'POST', url: '/api/esih/program-kerja', headers: admin, payload: { kode: 'A', namaProgram: 'Program nyata', tahun: 2026 } })
  assert.equal(parent.statusCode, 201, parent.body)
  const sub = await app.inject({ method: 'POST', url: '/api/esih/programs', headers: admin, payload: { programKerjaId: parent.json().data.id, kode: 'A.1', namaItem: 'Subprogram nyata', tahun: 2026 } })
  assert.equal(sub.statusCode, 201, sub.body)
  const assignment = await app.inject({ method: 'PUT', url: '/api/esih/users/32a5db30-417c-40da-8849-5a299ed1b0fc', headers: admin, payload: { programIds: [parent.json().data.id] } })
  assert.equal(assignment.statusCode, 200, assignment.body)
  const user = await session('USER')
  const me = await app.inject({ url: '/api/auth/me', headers: user })
  assert.deepEqual(me.json().data.programIds, [parent.json().data.id])
  const highlight = await app.inject({ method: 'POST', url: '/api/esih/highlights', headers: user, payload: { bulan: 8, tahun: 2026, item: 'Highlight Portal', bagian: 'IT', programId: sub.json().data.id } })
  assert.equal(highlight.statusCode, 201, highlight.body)
  const list = await app.inject({ url: '/api/esih/highlights?year=2026&month=ALL', headers: user })
  assert.equal(list.statusCode, 200, list.body)
  assert.equal(list.json().data.length, 1)
})

test('Persisted activities drive dashboard counts for both roles; no sample activity is injected', async () => {
  const user = await session('USER')
  const created = await app.inject({ method: 'POST', url: '/api/esih/activities', headers: user, payload: activity })
  assert.equal(created.statusCode, 201, created.body)
  const id = created.json().data.id
  const changed = await app.inject({ method: 'PUT', url: `/api/esih/activities/${id}`, headers: user, payload: { status: 'Closed', closedDate: '2026-08-12' } })
  assert.equal(changed.statusCode, 200, changed.body)
  assert.equal(changed.json().data.kegiatan, activity.kegiatan)
  const audit = await prisma.activityAuditLog.findMany({ where: { activityId: id } })
  assert.deepEqual(audit.map(log => log.field).sort(), ['closedDate', 'status'])
  for (const headers of [user, await session('ADMIN')]) {
    const dashboard = await app.inject({ url: '/api/esih/dashboard?year=2026', headers })
    assert.equal(dashboard.statusCode, 200, dashboard.body)
    assert.equal(dashboard.json().kpi.totalActivities, 1)
    assert.equal(dashboard.json().kpi.closedActivities, 1)
    const list = await app.inject({ url: '/api/esih/activities?year=2026', headers })
    assert.deepEqual(list.json().data.map((a: any) => a.id), [id])
  }
})

test('User cannot assign roles/programs, edit another PIC or disable another account', async () => {
  const user = await session('USER')
  for (const [method, url, payload] of [
    ['PUT', '/api/esih/users/another-id', { role: 'ADMIN' }],
    ['PATCH', '/api/esih/users/another-id/toggle', {}],
    ['POST', '/api/esih/program-kerja', { kode: 'X', namaProgram: 'Forbidden' }],
  ] as const) {
    const result = await app.inject({ method, url, payload, headers: user })
    assert.equal(result.statusCode, 403, result.body)
  }
  const admin = await session('ADMIN')
  const created = await app.inject({ method: 'POST', url: '/api/esih/activities', headers: admin, payload: { ...activity, picNama: 'Other Person', picEmail: 'other@example.test' } })
  const denied = await app.inject({ method: 'PUT', url: `/api/esih/activities/${created.json().data.id}`, headers: user, payload: { status: 'Cancelled' } })
  assert.equal(denied.statusCode, 403, denied.body)
})

test('Invalid dates/status/program assignment return validation errors', async () => {
  const admin = await session('ADMIN')
  for (const payload of [{ ...activity, startDate: '2026-02-30' }, { ...activity, dueDate: '2026-01-01' }, { ...activity, status: 'invalid' }]) {
    const result = await app.inject({ method: 'POST', url: '/api/esih/activities', headers: admin, payload })
    assert.equal(result.statusCode, 422, result.body)
  }
  const assignment = await app.inject({ method: 'PUT', url: '/api/esih/users/unknown', headers: admin, payload: { programIds: ['does-not-exist'] } })
  assert.equal(assignment.statusCode, 422, assignment.body)
  const range = await app.inject({ url: '/api/esih/highlights?month=13', headers: admin })
  assert.equal(range.statusCode, 422)
})

test('Deletion preserves history and removes activity from monitoring', async () => {
  const admin = await session('ADMIN')
  const record = await prisma.activity.findFirstOrThrow({ where: { kegiatan: activity.kegiatan } })
  const removed = await app.inject({ method: 'DELETE', url: `/api/esih/activities/${record.id}`, headers: admin })
  assert.equal(removed.statusCode, 200, removed.body)
  assert.equal((await prisma.activity.findUniqueOrThrow({ where: { id: record.id } })).isActive, false)
  assert.ok(await prisma.activityAuditLog.count({ where: { activityId: record.id } }))
  const restored = await app.inject({ method: 'PATCH', url: `/api/esih/activities/${record.id}/toggle`, headers: admin })
  assert.equal(restored.statusCode, 200, restored.body)
  assert.equal(restored.json().data.isActive, true)
  assert.equal(await prisma.activityAuditLog.count({ where: { activityId: record.id, field: 'isActive' } }), 2)
})

test('Large Portal profiles fit a browser cookie and retain the identity used by e-SIH', async () => {
  const login = await app.inject({ method: 'POST', url: '/api/auth/login', headers: { origin: frontendOrigin }, payload: { ssoToken: 'large-profile', appId } })
  assert.equal(login.statusCode, 200, login.body)
  const setCookie = String(login.headers['set-cookie'])
  assert.ok(Buffer.byteLength(setCookie) < 4096, `Cookie is ${Buffer.byteLength(setCookie)} bytes; browsers reject oversized cookies`)
  const me = await app.inject({ url: '/api/auth/me', headers: { cookie: setCookie.split(';', 1)[0] } })
  assert.equal(me.json().data.name, 'User Template')
  assert.equal(me.json().data.unit.path, 'Direktorat Utama / Bagian IT / Seksi Sistem')
  assert.equal(me.json().data.employee.nrk, 'EMP-001')
  assert.equal(me.headers['set-cookie'], undefined, 'Reading a session must not grow or rewrite the cookie')
})

test('Oversized required identity returns a clear error instead of a false login success', async () => {
  const login = await app.inject({ method: 'POST', url: '/api/auth/login', headers: { origin: frontendOrigin }, payload: { ssoToken: 'oversized-identity', appId } })
  assert.equal(login.statusCode, 502)
  assert.equal(login.json().code, 'SESSION_TOO_LARGE')
  assert.equal(login.json().success, false)
  assert.ok(Buffer.byteLength(String(login.headers['set-cookie'])) < 4096)
  assert.match(String(login.headers['set-cookie']), /Max-Age=0/)
})

test('Program assignments and role changes stay fresh without rewriting the identity cookie', async () => {
  const login = await app.inject({ method: 'POST', url: '/api/auth/login', headers: { origin: frontendOrigin }, payload: { ssoToken: 'one-time-token', appId } })
  const headers = { origin: frontendOrigin, cookie: String(login.headers['set-cookie']).split(';', 1)[0] }
  const userId = login.json().data.user.employeeId
  const programIds = Array.from({ length: 500 }, (_, i) => `program-${i}-${'x'.repeat(30)}`)
  try {
    await prisma.ref_UserOverride.create({ data: { userId, role: 'ADMIN', programIds } })
    const me = await app.inject({ url: '/api/auth/me', headers })
    assert.equal(me.json().data.role, 'ADMIN')
    assert.deepEqual(me.json().data.programIds, programIds)
    assert.equal(me.headers['set-cookie'], undefined)
    const dashboard = await app.inject({ url: '/api/esih/dashboard', headers })
    assert.equal(dashboard.statusCode, 200)
    assert.equal(dashboard.headers['set-cookie'], undefined)
    await prisma.ref_UserOverride.update({ where: { userId }, data: { role: 'USER' } })
    const denied = await app.inject({ method: 'POST', url: '/api/esih/program-kerja', headers, payload: {} })
    assert.equal(denied.statusCode, 403, denied.body)
    const changed = await app.inject({ url: '/api/auth/me', headers })
    assert.equal(changed.json().data.role, 'USER')
  } finally { await prisma.ref_UserOverride.deleteMany({ where: { userId } }) }
})

test('Old valid cookies are compacted, and logout removes the session', async () => {
  const login = await app.inject({ method: 'POST', url: '/api/auth/login', headers: { origin: frontendOrigin }, payload: { ssoToken: 'one-time-token', appId } })
  const { config } = await import('../src/config/env')
  const legacy = app.createSecureSession({ user: login.json().data.user })
  const cookie = `${config.cookieName}=${encodeURIComponent(app.encodeSecureSession(legacy))}`
  const me = await app.inject({ url: '/api/auth/me', headers: { cookie } })
  assert.equal(me.json().data.name, 'User Template')
  const compactCookie = String(me.headers['set-cookie']).split(';', 1)[0]
  const stored = app.decodeSecureSession(decodeURIComponent(compactCookie.slice(compactCookie.indexOf('=') + 1)))!
  assert.ok(stored.get('identity'))
  assert.equal(stored.get('user'), undefined)
  const logout = await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { origin: frontendOrigin, cookie: compactCookie } })
  assert.equal(logout.statusCode, 200)
  assert.match(String(logout.headers['set-cookie']), /Max-Age=0/)
  const anonymous = await app.inject({ url: '/api/auth/me' })
  assert.equal(anonymous.json().data, null)
})

test('Inactive master programs remain available to admin for reactivation only', async () => {
  const admin = await session('ADMIN')
  const user = await session('USER')
  const parent = await prisma.ref_ProgramKerja.findFirstOrThrow()
  const sub = await prisma.ref_Item_ProgramKerja.findFirstOrThrow()
  await prisma.ref_ProgramKerja.update({ where: { id: parent.id }, data: { isActive: false } })
  await prisma.ref_Item_ProgramKerja.update({ where: { id: sub.id }, data: { isActive: false } })
  for (const headers of [admin, user]) {
    const normal = await app.inject({ url: '/api/esih/program-kerja?year=2026', headers })
    assert.equal(normal.json().data.length, 0)
  }
  const master = await app.inject({ url: '/api/esih/program-kerja?year=2026&includeInactive=true', headers: admin })
  assert.equal(master.json().data[0].id, parent.id)
  assert.equal(master.json().data[0].items[0].id, sub.id)
  const denied = await app.inject({ url: '/api/esih/program-kerja?includeInactive=true', headers: user })
  assert.equal(denied.json().data.length, 0)
})

test('Disabled users are rejected even with an already issued session', async () => {
  const user = await session('USER')
  const admin = await session('ADMIN')
  const disabled = await app.inject({ method: 'PATCH', url: '/api/esih/users/32a5db30-417c-40da-8849-5a299ed1b0fc/toggle', headers: admin })
  assert.equal(disabled.statusCode, 200)
  const result = await app.inject({ url: '/api/esih/activities', headers: user })
  assert.equal(result.statusCode, 403, result.body)
})

test('Missing schema returns actionable 503 without leaking Prisma SQL', async () => {
  const admin = await session('ADMIN')
  const findMany = prisma.ref_UserOverride.findMany
  prisma.ref_UserOverride.findMany = (async () => { throw Object.assign(new Error('SQL secret detail'), { code: 'P2021' }) }) as any
  try {
    const result = await app.inject({ url: '/api/esih/dashboard', headers: admin })
    assert.equal(result.statusCode, 503)
    assert.equal(result.json().code, 'SCHEMA_NOT_READY')
    assert.ok(!result.body.includes('SQL secret'))
  } finally { prisma.ref_UserOverride.findMany = findMany }
})
