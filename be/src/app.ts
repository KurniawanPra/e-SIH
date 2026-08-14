  import cors from '@fastify/cors'
import os from 'node:os'
import Fastify from 'fastify'
import { config } from './config/env'
import authPlugin from './plugins/auth'
import authRoutes from './routes/auth.route'
import portalDataRoutes from './routes/portal-data.route'
import esihRoutes from './routes/esih.route'

function getLocalIpv4s(): string[] {
  const ips: string[] = []
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const iface of interfaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) ips.push(iface.address)
    }
  }
  return ips
}

export function buildApp() {
  const app = Fastify({
    logger: config.nodeEnv !== 'test',
    trustProxy: true,
  })

  const allowedOrigins = [
    config.frontendOrigin,
    'http://localhost:4100',
    'http://127.0.0.1:4100',
    ...config.allowedOrigins,
  ]

  const localIpv4s = getLocalIpv4s()

  const isOriginAllowed = (origin: string) => {
    if (config.nodeEnv === 'development') return true
    if (allowedOrigins.includes(origin)) return true
    try {
      const url = new URL(origin)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
      const host = url.hostname
      return host === 'localhost' || host.startsWith('127.') || localIpv4s.includes(host) || host === 'e-sih.inl.co.id' || host.endsWith('.inl.co.id')
    } catch {
      return false
    }
  }

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
    service: 'sso-target-fastify4',
    timestamp: new Date().toISOString(),
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
