import type { FastifyRequest } from 'fastify'
import type { SessionEmployee, SessionUser } from '../plugins/auth'

export interface SessionIdentity {
  sub: string
  email: string
  employee: SessionEmployee
}

// A cookie is limited to about 4 KB, including encryption/encoding overhead.
// Persist only the fields e-SIH uses, once. Portal's photo, hierarchy, history,
// and arbitrary extra fields are not session data. Overrides stay in the DB.
export function sessionIdentity(user: SessionUser): SessionIdentity {
  const { employee } = user
  const grade = user.grade ?? employee.grade
  const unit = user.unit ?? employee.unit
  const placement = user.penempatanArea ?? employee.penempatanArea
  return {
    sub: user.sub,
    email: user.email,
    employee: {
      id: user.employeeId,
      nrk: employee.nrk,
      namaLengkap: user.name,
      jabatan: user.jabatan,
      grade: grade ? { id: grade.id, kode: grade.kode, label: grade.label, level: grade.level } : null,
      unit: unit ? { id: unit.id, kode: unit.kode, nama: unit.nama, tipe: unit.tipe, parentId: unit.parentId, path: unit.path } : null,
      penempatanArea: placement ? { id: placement.id, kode: placement.kode, nama: placement.nama } : null,
    },
  }
}

export function writeSessionUser(request: FastifyRequest, user: SessionUser) {
  request.session.regenerate()
  request.session.set('identity', sessionIdentity(user))
}

export function readSessionUser(request: FastifyRequest): SessionUser | null {
  let identity = request.session.get('identity')
  if (!identity) {
    // Compact older, valid sessions on their next request (same configured name/key).
    const legacy = request.session.get('user')
    if (!legacy) return null
    identity = sessionIdentity(legacy)
    writeSessionUser(request, legacy)
  }
  const { employee } = identity
  return {
    sub: identity.sub,
    email: identity.email,
    employeeId: employee.id,
    name: employee.namaLengkap,
    jabatan: employee.jabatan ?? null,
    employee,
    grade: employee.grade ?? null,
    unit: employee.unit ?? null,
    penempatanArea: employee.penempatanArea ?? null,
  }
}
