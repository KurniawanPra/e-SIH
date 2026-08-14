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
      secure: config.cookieSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: config.cookieMaxAgeSeconds,
    },
  })

  app.decorate('authenticate', async function authenticate(request, reply) {
    let user = request.session.get('user') as SessionUser | undefined
    if (!user && !config.isProduction) {
      user = {
        sub: 'demo-admin-id',
        email: 'kurniawan@inl.co.id',
        employeeId: 'emp-admin',
        name: 'Kurniawan Pralambang',
        jabatan: 'Kepala Unit Organisasi Sub Bagian Sistem & IT',
        role: 'ADMIN',
        employee: {
          id: 'emp-admin',
          namaLengkap: 'Kurniawan Pralambang',
          jabatan: 'Kepala Unit Organisasi Sub Bagian Sistem & IT',
        },
        grade: { id: 'g-1', kode: 'M1', label: 'Manager 1', level: 1 },
        unit: { id: 'u-1', kode: 'IT', nama: 'IT & Sistem Operational' },
        penempatanArea: { id: 'p-1', kode: 'HO', nama: 'Head Office' },
      }
      request.session.set('user', user)
    }
    if (!user) {
      const error = new Error('Unauthorized') as Error & { statusCode: number }
      error.statusCode = 401
      throw error
    }
  })
})
