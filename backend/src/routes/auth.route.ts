import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { exchangePortalToken, SsoExchangeError } from '../services/portal-sso.service'

const loginSchema = z.object({
  ssoToken: z.string().min(1),
  appId: z.string().uuid(),
})

export default async function authRoutes(app: FastifyInstance) {
  app.get('/csrf', async () => ({
    success: true,
    data: { csrfToken: null },
  }))

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

  app.get('/me', { preHandler: [app.authenticate] }, async (request) => ({
    success: true,
    data: request.session.get('user'),
  }))

  app.post('/logout', async (request, reply) => {
    request.session.delete()
    return reply.send({
      success: true,
      data: { message: 'Logout berhasil' },
    })
  })
}
