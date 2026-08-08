import secureSession from '@fastify/secure-session'
import fp from 'fastify-plugin'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { config } from '../config/env'

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
  employee: SessionEmployee
  grade: EmployeeGrade | null
  unit: OrganizationUnit | null
  penempatanArea: PlacementArea | null
}

declare module '@fastify/secure-session' {
  interface SessionData {
    user: SessionUser
  }
}

declare module 'fastify' {
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
      secure: config.isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: config.cookieMaxAgeSeconds,
    },
  })

  app.decorate('authenticate', async function authenticate(request, reply) {
    const user = request.session.get('user') as SessionUser | undefined
    if (!user) {
      await reply.code(401).send({ success: false, error: 'Unauthorized' })
    }
  })
})
