import cors from '@fastify/cors'
import { ZodError } from 'zod'
import prisma from './plugins/prisma'
import Fastify from 'fastify'
import { config } from './config/env'
import authPlugin from './plugins/auth'
import authRoutes from './routes/auth.route'
import portalDataRoutes from './routes/portal-data.route'
import esihRoutes from './routes/esih.route'

export function buildApp() {
  const app = Fastify({
    logger: config.nodeEnv !== 'test',
    trustProxy: config.trustedProxies.length ? config.trustedProxies : false,
  })

  const allowedOrigins = [
    config.frontendOrigin,
    ...config.allowedOrigins,
  ]

  const isOriginAllowed = (origin: string) => allowedOrigins.includes(origin)

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(422).send({ success: false, error: error.issues[0]?.message || 'Data tidak valid' })
    }
    const code = (error as any).code
    if (code === 'P2021' || code === 'P2022') {
      request.log.error({ code }, 'Database schema is incomplete; apply migrations')
      return reply.code(503).send({ success: false, code: 'SCHEMA_NOT_READY', error: 'Skema database belum lengkap. Administrator perlu menjalankan npm run migrate pada backend.' })
    }
    if (['P1001', 'P1002', 'P1008', 'P1017', 'P2024'].includes(code)) {
      return reply.code(503).send({ success: false, error: 'Database sedang tidak tersedia. Data belum disimpan; silakan coba lagi.' })
    }
    if (code === 'P2002') return reply.code(409).send({ success: false, error: 'Data dengan identitas yang sama sudah ada' })
    if (code === 'P2025') return reply.code(404).send({ success: false, error: 'Data tidak ditemukan' })
    if (code === 'P2003') return reply.code(422).send({ success: false, error: 'Data masih terkait dengan data lain atau referensinya tidak valid' })
    const known = error as { statusCode?: number; message?: string }
    const status = known.statusCode && known.statusCode < 500 ? known.statusCode : 500
    if (status === 500) request.log.error({ err: error }, 'Request failed')
    return reply.code(status).send({ success: false, error: status === 500 ? 'Terjadi kesalahan pada server' : known.message || 'Request gagal' })
  })

  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || isOriginAllowed(origin)) {
        cb(null, true)
        return
      }
      cb(null, false)
    },
    credentials: true,
  })
  app.register(authPlugin)

  app.addHook('onRequest', async (request, reply) => {
    const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
    const origin = request.headers.origin
    if (unsafeMethods.has(request.method) && (!origin || !isOriginAllowed(origin))) {
      return reply.code(403).send({
        success: false,
        error: 'Origin tidak diizinkan',
      })
    }
  })

  app.register(authRoutes, { prefix: '/api/auth' })
  app.register(portalDataRoutes, { prefix: '/api/portal' })
  app.register(esihRoutes, { prefix: '/api/esih' })

  const health = async () => ({
    status: 'ok',
    service: 'esih-backend',
    timestamp: new Date().toISOString(),
  })
  app.get('/health', health)
  app.get('/ready', async () => {
    await prisma.$queryRaw`SELECT 1`
    await prisma.ref_UserOverride.count()
    await prisma.highlight.findFirst({ select: { bagian: true } })
    await prisma.activityAuditLog.count()
    await prisma.ref_Bagian.count()
    return { status: 'ready' }
  })
  app.get('/api/config', async () => ({
    apiUrl: '',
    portalUrl: config.portalApiUrl,
    targetAppId: config.appId,
    backendDriver: 'fastify',
    appName: 'e-SIH',
    portalName: 'InTes / Portal SSO',
    portalAccountName: 'Portal INL',
  }))

  return app
}
