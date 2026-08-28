import secureSession from '@fastify/secure-session'
import fp from 'fastify-plugin'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { config } from '../config/env'
import { resolveUser } from '../services/authorization.service'
import { readSessionUser, type SessionIdentity } from '../services/session.service'

export interface EmployeeGrade {
  id?: string
  kode: string
  label?: string | null
  level: number
}

export interface OrganizationUnit {
  id: string
  kode?: string | null
  nama: string
  tipe?: string | null
  parentId?: string | null
  path?: string
  hierarchy?: Array<{
    id: string
    kode: string
    nama: string
    tipe: string
    parentId: string | null
  }>
}

export interface PlacementArea {
  id: string
  kode?: string | null
  nama: string
  latitude?: string | null
  longitude?: string | null
}

export interface SessionEmployee {
  id: string
  nrk?: string | null
  nama?: string | null
  namaLengkap: string
  jenisKelamin?: string | null
  jabatan?: string | null
  tanggalMasuk?: string | null
  fotoProfil?: string | null
  isActive?: boolean
  atasan?: {
    id: string
    nrk?: string | null
    nama?: string | null
    jabatan?: string | null
  } | null
  grade?: EmployeeGrade | null
  unit?: OrganizationUnit | null
  penempatanArea?: PlacementArea | null
}

export interface SessionUser {
  sub: string
  email: string
  employeeId: string
  name: string
  jabatan: string | null
  role?: string
  programIds?: string[]
  employee: SessionEmployee
  grade: EmployeeGrade | null
  unit: OrganizationUnit | null
  penempatanArea: PlacementArea | null
}

declare module '@fastify/secure-session' {
  interface SessionData {
    identity: SessionIdentity
    // Read-only compatibility with cookies issued before compact sessions.
    user: SessionUser
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser: SessionUser | null
  }
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>
  }
}

export default fp(async function authPlugin(app) {
  await app.register(secureSession, {
    key: config.sessionSecret,
    cookieName: config.cookieName,
    expiry: config.cookieMaxAgeSeconds,
    cookie: {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: config.cookieMaxAgeSeconds,
    },
  })

  app.decorateRequest('authUser', null)

  // Check the final serialized header, after encryption and cookie encoding.
  // Never report login success if the browser will reject the session cookie.
  app.addHook('onSend', async (request, reply, payload) => {
    const header = reply.getHeader('set-cookie')
    const cookies = Array.isArray(header) ? header : header ? [String(header)] : []
    const sessionCookie = cookies.find(cookie => cookie.startsWith(`${config.cookieName}=`))
    if (sessionCookie && Buffer.byteLength(sessionCookie) > 4096) {
      request.log.error({ cookieBytes: Buffer.byteLength(sessionCookie) }, 'Session cookie exceeds browser limit')
      request.session.delete()
      const otherCookies = cookies.filter(cookie => !cookie.startsWith(`${config.cookieName}=`))
      reply.removeHeader('set-cookie')
      if (otherCookies.length) reply.header('set-cookie', otherCookies)
      reply.clearCookie(config.cookieName, { path: '/', httpOnly: true, secure: config.cookieSecure, sameSite: 'lax' })
      reply.code(502).type('application/json')
      return JSON.stringify({ success: false, code: 'SESSION_TOO_LARGE', error: 'Identitas dari Portal terlalu besar untuk sesi e-SIH. Hubungi administrator untuk memeriksa data profil Portal.' })
    }
    return payload
  })

  app.decorate('authenticate', async function authenticate(request, reply) {
    const user = readSessionUser(request)

    if (!user) {
      const error = new Error('Unauthorized') as Error & { statusCode: number }
      error.statusCode = 401
      throw error
    }
    request.authUser = await resolveUser(user)
  })
})
