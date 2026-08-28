import type { SessionUser } from '../plugins/auth'
import prisma from '../plugins/prisma'

export function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}

export function defaultRole(user: Pick<SessionUser, 'jabatan' | 'employee'>) {
  const job = typeof user.jabatan === 'string' ? user.jabatan : user.employee?.jabatan || ''
  return /kepala|kasubag|manager|pimpinan/i.test(job) ? 'ADMIN' : 'USER'
}

export async function resolveUser(user: SessionUser): Promise<SessionUser> {
  const ids = [user.employeeId, user.sub].filter(Boolean)
  const overrides = await prisma.ref_UserOverride.findMany({ where: { userId: { in: ids } } })
  const override = overrides.find(row => row.userId === user.employeeId) || overrides.find(row => row.userId === user.sub)
  if (overrides.some(row => row.isActive === false)) throw httpError(403, 'Akses e-SIH untuk akun ini dinonaktifkan')
  return { ...user, role: override?.role || defaultRole(user), programIds: Array.isArray(override?.programIds) ? override.programIds.filter((id): id is string => typeof id === 'string') : [] }
}

const normalized = (value?: string | null) => (value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ')

export function ownsRecord(user: SessionUser, record: { authorId?: string | null; picEmail?: string | null; picNama?: string | null; namePic?: string | null; pics?: unknown }) {
  if (user.role === 'ADMIN' || record.authorId === user.sub) return true
  if (user.email && normalized(record.picEmail) === normalized(user.email)) return true
  const names = (record.picNama || record.namePic || '').split(/[/,;]+/)
  if (user.name && names.some(name => normalized(name) === normalized(user.name))) return true
  return Array.isArray(record.pics) && record.pics.some(pic =>
    (user.email && normalized(pic.email) === normalized(user.email)) || (user.name && normalized(pic.name || pic.nama) === normalized(user.name)))
}

export function assertOwnsRecord(user: SessionUser, record: Parameters<typeof ownsRecord>[1]) {
  if (!ownsRecord(user, record)) throw httpError(403, 'Anda hanya dapat mengubah kegiatan sendiri atau yang ditugaskan kepada Anda')
}
