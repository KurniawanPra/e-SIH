import assert from 'node:assert/strict'
import { createServer, type Server } from 'node:http'
import { after, before, test } from 'node:test'
import type { FastifyInstance } from 'fastify'

const frontendOrigin = 'http://localhost:4100'
const appId = '11111111-1111-4111-8111-111111111111'
let portal: Server
let app: FastifyInstance

before(async () => {
  portal = createServer((request, response) => {
    if (request.url === '/api/sso/grades') {
      assert.equal(request.headers['x-internal'], 'test-internal-token')
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({
        success: true,
        data: [{ id: 'grade-1', kode: 'BOM-4', label: 'Officer', level: 5 }],
      }))
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
          namaLengkap: 'User Template',
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
  app = module.buildApp()
  await app.ready()
})

after(async () => {
  await app.close()
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

  assert.equal(login.statusCode, 200)
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
