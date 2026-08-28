import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { exchangePortalToken, SsoExchangeError } from '../services/portal-sso.service'
import { config } from '../config/env'
import type { SessionUser } from '../plugins/auth'
import { resolveUser } from '../services/authorization.service'
import { readSessionUser, writeSessionUser } from '../services/session.service'

const loginSchema = z.object({
  ssoToken: z.string().min(1),
  appId: z.string().uuid(),
})

export default async function authRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store')
  })
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
    writeSessionUser(request, user)
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

      writeSessionUser(request, user)
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

  app.get('/me', async (request) => {
    const identity = readSessionUser(request)
    const user = identity ? await resolveUser(identity) : null

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
