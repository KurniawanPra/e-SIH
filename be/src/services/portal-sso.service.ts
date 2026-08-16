import { config } from '../config/env'
import type { SessionEmployee, SessionUser } from '../plugins/auth'

interface PortalUser {
  id: string
  email: string
  isActive: boolean
  employee?: SessionEmployee | null
}

interface PortalVerifyResponse {
  success: boolean
  data?: PortalUser
  error?: string
}

export class SsoExchangeError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
    this.name = 'SsoExchangeError'
  }
}

export async function exchangePortalToken(
  ssoToken: string,
  appId: string,
) {
  if (appId !== config.appId) {
    throw new SsoExchangeError('appId tidak sesuai dengan konfigurasi aplikasi', 422)
  }

  // Token Portal hanya sekali pakai. Jangan menambahkan retry otomatis.
  let response: Response
  try {
    response = await fetch(`${config.portalApiUrl}/api/sso/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ssoToken, app_id: appId }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new SsoExchangeError('Portal SSO tidak dapat dihubungi', 503)
  }

  const body = await response.json().catch(() => null) as PortalVerifyResponse | null
  if (!response.ok || !body?.success || !body.data) {
    throw new SsoExchangeError(
      body?.error ?? 'Verifikasi SSO gagal',
      response.status >= 500 ? 502 : 401,
    )
  }

  const portalUser = body.data
  const employee = portalUser.employee
  if (!portalUser.isActive || !employee?.id) {
    throw new SsoExchangeError('Akun Portal tidak aktif atau belum terhubung ke employee', 403)
  }

  // Verifikasi bahwa unit karyawan milik Sub Bagian Sistem & IT atau MR & HSSE (atau seksi turunannya)
  const unitNama = employee.unit?.nama || ''
  const unitPath = employee.unit?.path || ''
  const isAuthorizedUnit = /sistem|it|teknologi|informasi|hsse|hse|safety|k3|mr/i.test(unitNama) || /sistem|it|teknologi|informasi|hsse|hse|safety|k3|mr/i.test(unitPath)
  if (!isAuthorizedUnit) {
    throw new SsoExchangeError('Aplikasi e-SIH khusus untuk karyawan Sub Bagian Sistem & IT, HSSE, serta seksi operasional terkait', 403)
  }

  const empAny = employee as any
  const rawJabatan = (typeof employee.jabatan === 'string' ? employee.jabatan : empAny?.jabatan?.nama) || empAny?.posisi?.nama || empAny?.posisi || ''
  const jabatanLower = rawJabatan.toLowerCase()
  const role = (jabatanLower.includes('kepala') || jabatanLower.includes('kasubag') || jabatanLower.includes('manager') || jabatanLower.includes('pimpinan')) ? 'ADMIN' : 'USER'

  // Portal adalah source of truth untuk identitas user + employee.
  // Snapshot ini masuk ke session, bukan ke tabel users aplikasi target.
  const user: SessionUser = {
    sub: portalUser.id,
    email: portalUser.email,
    employeeId: employee.id,
    name: employee.namaLengkap,
    jabatan: rawJabatan || null,
    role,
    employee,
    grade: employee.grade ?? null,
    unit: employee.unit ?? null,
    penempatanArea: employee.penempatanArea ?? null,
  }

  return user
}
