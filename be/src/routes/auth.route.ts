import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { exchangePortalToken, SsoExchangeError } from '../services/portal-sso.service'
import { generateToken, verifyToken } from '../services/token.service'
import { config } from '../config/env'
import type { SessionUser } from '../plugins/auth'

const loginSchema = z.object({
  ssoToken: z.string().min(1),
  appId: z.string().uuid(),
})

export default async function authRoutes(app: FastifyInstance) {
  app.get('/csrf', async () => ({
    success: true,
    data: { csrfToken: null },
  }))

  app.post('/demo-login', async (request, reply) => {
    if (config.isProduction) {
      return reply.code(404).send({ success: false, error: 'Not found' })
    }

    const { role } = (request.body as { role?: string }) || {}
    if (role !== 'ADMIN' && role !== 'USER') {
      return reply.code(400).send({ success: false, error: 'Role harus ADMIN atau USER' })
    }
    const isAdmin = role === 'ADMIN'

    const user: SessionUser = {
      sub: isAdmin ? '65518f57-35ea-43b2-af59-8e3ea489586b' : '32a5db30-417c-40da-8849-5a299ed1b0fc',
      email: isAdmin ? 'oka@inl.co.id' : 'tomy.troller@gmail.com',
      employeeId: isAdmin ? '65518f57-35ea-43b2-af59-8e3ea489586b' : '32a5db30-417c-40da-8849-5a299ed1b0fc',
      name: isAdmin ? 'Oka Aritonang' : 'Tomy Inri Akbar Lingga',
      jabatan: isAdmin ? 'Kepala Sub Bagian Sistem dan IT' : 'Asisten IT',
      role: isAdmin ? 'ADMIN' : 'USER',
      employee: {
        id: isAdmin ? '65518f57-35ea-43b2-af59-8e3ea489586b' : '32a5db30-417c-40da-8849-5a299ed1b0fc',
        namaLengkap: isAdmin ? 'Oka Aritonang' : 'Tomy Inri Akbar Lingga',
        jabatan: isAdmin ? 'Kepala Sub Bagian Sistem dan IT' : 'Asisten IT',
        unit: { id: 'u-it', kode: 'IT', nama: isAdmin ? 'Sub Bagian Sistem & IT' : 'Seksi IT' }
      },
      grade: { id: 'g-1', kode: isAdmin ? 'M1' : 'S1', label: isAdmin ? 'Manager 1' : 'Staff', level: isAdmin ? 1 : 3 },
      unit: { id: 'u-1', kode: 'IT', nama: isAdmin ? 'Sub Bagian Sistem & IT' : 'Seksi IT' },
      penempatanArea: { id: 'p-1', kode: 'HO', nama: 'Head Office' },
    }
    const token = generateToken(user)
    request.session.set('user', user)
    return reply.send({ success: true, data: { user, token } })
  })

  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(422).send({
        success: false,
        error: 'Payload login tidak valid',
      })
    }

    try {
      const user = await exchangePortalToken(
        parsed.data.ssoToken,
        parsed.data.appId,
      )

      const token = generateToken(user)
      request.session.set('user', user)
      return reply.send({ success: true, data: { user, token } })
    } catch (error) {
      const statusCode = error instanceof SsoExchangeError ? error.statusCode : 500
      request.log.warn({ error, statusCode }, 'SSO login rejected')
      return reply.code(statusCode).send({
        success: false,
        error: error instanceof SsoExchangeError ? error.message : 'Login SSO gagal',
      })
    }
  })

  app.get('/me', async (request) => {
    let user = (request.session.get('user') as SessionUser | null) ?? null
    if (!user) {
      const authHeader = request.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim()
        user = (verifyToken(token) as SessionUser | null) ?? null
        if (user) {
          request.session.set('user', user)
        }
      }
    }
    if (user) {
      if (!user.role) {
        const rawJabatan = (typeof user.jabatan === 'string' ? user.jabatan : user.employee?.jabatan) || ''
        const jLower = rawJabatan.toLowerCase()
        user.role = (jLower.includes('kepala') || jLower.includes('kasubag') || jLower.includes('manager') || jLower.includes('pimpinan')) ? 'ADMIN' : 'USER'
        request.session.set('user', user)
      }
    }
    return {
      success: true,
      data: user,
    }
  })

  app.post('/logout', async (request, reply) => {
    request.session.delete()
    return reply.send({
      success: true,
      data: { message: 'Logout berhasil' },
    })
  })
}
