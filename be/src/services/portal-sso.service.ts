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
    if (config.nodeEnv === 'development') {
      return {
        id: 'dev-user-id',
        sub: 'dev-user-id',
        email: 'oka@inl.co.id',
        name: 'Oka Aritonang',
        isActive: true,
        employeeId: 'emp-001',
        jabatan: 'Kepala Sub Bagian Sistem & IT',
        employee: {
          id: 'emp-001',
          namaLengkap: 'Oka Aritonang',
          jabatan: 'Kepala Sub Bagian Sistem & IT',
          unit: { nama: 'Sub Bagian Sistem & IT' }
        }
      } as unknown as SessionUser
    }
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

  // Verifikasi bahwa unit karyawan milik Sub Bagian Sistem & IT (atau seksi turunannya)
  const unitNama = employee.unit?.nama || ''
  const unitPath = employee.unit?.path || ''
  const isItSubBagian = /sistem|it|teknologi|informasi/i.test(unitNama) || /sistem|it|teknologi|informasi/i.test(unitPath)
  if (!isItSubBagian) {
    throw new SsoExchangeError('Aplikasi e-SIH khusus untuk karyawan Sub Bagian Sistem & IT serta seksi turunannya', 403)
  }

  // Portal adalah source of truth untuk identitas user + employee.
  // Snapshot ini masuk ke session, bukan ke tabel users aplikasi target.
  const user: SessionUser = {
    sub: portalUser.id,
    email: portalUser.email,
    employeeId: employee.id,
    name: employee.namaLengkap,
    jabatan: employee.jabatan ?? null,
    employee,
    grade: employee.grade ?? null,
    unit: employee.unit ?? null,
    penempatanArea: employee.penempatanArea ?? null,
  }

  return user
}
