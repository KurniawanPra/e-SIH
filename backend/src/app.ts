import cors from '@fastify/cors'
import Fastify from 'fastify'
import { config } from './config/env'
import authPlugin from './plugins/auth'
import authRoutes from './routes/auth.route'
import portalDataRoutes from './routes/portal-data.route'
import esihRoutes from './routes/esih.route'

export function buildApp() {
  const app = Fastify({
    logger: config.nodeEnv !== 'test',
    trustProxy: false,
  })

  const allowedOrigins = [
    config.frontendOrigin,
    'http://localhost:4100',
    'http://127.0.0.1:4100'
  ]

  app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
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
    if (unsafeMethods.has(request.method) && origin && !allowedOrigins.includes(origin)) {
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
    service: 'sso-target-fastify4',
    timestamp: new Date().toISOString(),
  })
  app.get('/', health)
  app.get('/health', health)

  return app
}
