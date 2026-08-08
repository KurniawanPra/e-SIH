import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { exchangePortalToken, SsoExchangeError } from '../services/portal-sso.service'
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
    const { role } = (request.body as { role?: string }) || {}
    const isAdmin = role === 'ADMIN'

    const user: SessionUser = {
      sub: isAdmin ? 'demo-admin-id' : 'demo-user-id',
      email: isAdmin ? 'kurniawan@inl.co.id' : 'herbina@inl.co.id',
      employeeId: isAdmin ? 'emp-admin' : 'emp-user',
      name: isAdmin ? 'Kurniawan Pralambang' : 'Herbina',
      jabatan: isAdmin ? 'Kepala Unit Organisasi Sub Bagian Sistem & IT' : 'Staff IT Development',
      role: isAdmin ? 'ADMIN' : 'USER',
      employee: {
        id: isAdmin ? 'emp-admin' : 'emp-user',
        namaLengkap: isAdmin ? 'Kurniawan Pralambang' : 'Herbina',
        jabatan: isAdmin ? 'Kepala Unit Organisasi Sub Bagian Sistem & IT' : 'Staff IT Development',
      },
      grade: { id: 'g-1', kode: isAdmin ? 'M1' : 'S1', label: isAdmin ? 'Manager 1' : 'Staff', level: isAdmin ? 1 : 3 },
      unit: { id: 'u-1', kode: 'IT', nama: 'IT & Sistem Operational' },
      penempatanArea: { id: 'p-1', kode: 'HO', nama: 'Head Office' },
    }
    request.session.set('user', user)
    return reply.send({ success: true, data: { user } })
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

      request.session.set('user', user)
      return reply.send({ success: true, data: { user } })
    } catch (error) {
      const statusCode = error instanceof SsoExchangeError ? error.statusCode : 500
      request.log.warn({ error, statusCode }, 'SSO login rejected')
      return reply.code(statusCode).send({
        success: false,
        error: error instanceof SsoExchangeError ? error.message : 'Login SSO gagal',
      })
    }
  })

  app.get('/me', async (request) => ({
    success: true,
    data: request.session.get('user') ?? null,
  }))

  app.post('/logout', async (request, reply) => {
    request.session.delete()
    return reply.send({
      success: true,
      data: { message: 'Logout berhasil' },
    })
  })
}
