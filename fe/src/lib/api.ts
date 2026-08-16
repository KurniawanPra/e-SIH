import axios from 'axios'
import type {
  ApiEnvelope,
  EmployeeGrade,
  OrganizationUnit,
  PlacementArea,
  PortalEmployeeDirectoryItem,
  SessionUser,
} from '@/types/auth'

export type BackendDriver = 'fastify' | 'laravel'

export interface RuntimeConfigState {
  apiUrl: string
  portalUrl: string
  portalLoginUrl: string
  targetAppId: string
  backendDriver: BackendDriver
}

export const DEFAULT_APP_ID = '924b0197-31b4-4620-b15e-c037989b49a3'
export const DEFAULT_PORTAL_URL = 'https://portal.inl.co.id'

export const runtimeConfig: RuntimeConfigState = {
  apiUrl: '',
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || DEFAULT_PORTAL_URL,
  portalLoginUrl: process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL || `${DEFAULT_PORTAL_URL}/login`,
  targetAppId: process.env.NEXT_PUBLIC_TARGET_APP_ID || DEFAULT_APP_ID,
  backendDriver: (process.env.NEXT_PUBLIC_BACKEND_DRIVER ?? 'fastify') as BackendDriver,
}

let configPromise: Promise<RuntimeConfigState> | null = null

export async function ensureRuntimeConfig(): Promise<RuntimeConfigState> {
  if (typeof window === 'undefined') {
    return runtimeConfig
  }

  // If on a real hostname (like e-sih.inl.co.id), always force relative apiUrl and real portal domain
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname.startsWith('127.')
  if (!isLocalHost) {
    runtimeConfig.apiUrl = ''
    if (runtimeConfig.portalUrl.includes('localhost') || runtimeConfig.portalUrl.includes('127.0.0.1')) {
      runtimeConfig.portalUrl = DEFAULT_PORTAL_URL
      runtimeConfig.portalLoginUrl = `${DEFAULT_PORTAL_URL}/login`
    }
  }

  if (!configPromise) {
    configPromise = fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.apiUrl !== undefined) {
          // If on production domain, ignore localhost apiUrl
          if (!isLocalHost && (data.apiUrl.includes('localhost') || data.apiUrl.includes('127.0.0.1'))) {
            runtimeConfig.apiUrl = ''
          } else {
            runtimeConfig.apiUrl = data.apiUrl || ''
          }
        }
        if (data.portalUrl) {
          if (!isLocalHost && (data.portalUrl.includes('localhost') || data.portalUrl.includes('127.0.0.1'))) {
            runtimeConfig.portalUrl = DEFAULT_PORTAL_URL
          } else {
            runtimeConfig.portalUrl = data.portalUrl
          }
        }
        if (data.portalLoginUrl) {
          if (!isLocalHost && (data.portalLoginUrl.includes('localhost') || data.portalLoginUrl.includes('127.0.0.1'))) {
            runtimeConfig.portalLoginUrl = `${DEFAULT_PORTAL_URL}/login`
          } else {
            runtimeConfig.portalLoginUrl = data.portalLoginUrl
          }
        }
        if (data.targetAppId) runtimeConfig.targetAppId = data.targetAppId
        if (data.backendDriver) runtimeConfig.backendDriver = data.backendDriver

        api.defaults.baseURL = runtimeConfig.apiUrl || ''
        return runtimeConfig
      })
      .catch(() => runtimeConfig)
  }
  return configPromise
}

export const API_URL = ''
export const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || DEFAULT_PORTAL_URL
export const PORTAL_LOGIN_URL = process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL
  || `${PORTAL_URL.replace(/\/$/, '')}/login`
export const TARGET_APP_ID = process.env.NEXT_PUBLIC_TARGET_APP_ID || DEFAULT_APP_ID
export const BACKEND_DRIVER = (process.env.NEXT_PUBLIC_BACKEND_DRIVER ?? 'fastify') as BackendDriver

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

api.interceptors.request.use(async (reqConfig) => {
  await ensureRuntimeConfig()
  const currentBaseUrl = runtimeConfig.apiUrl || ''
  if (!reqConfig.baseURL || reqConfig.baseURL === '') {
    reqConfig.baseURL = currentBaseUrl
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('esih_token')
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`
    }
  }
  return reqConfig
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      localStorage.removeItem('esih_token')
      localStorage.removeItem('esih_user')

      const path = window.location.pathname
      const isAuthPage = path === '/' || path.startsWith('/sso-callback')
      const isRedirecting = sessionStorage.getItem('esih_auth_redirect')
      if (!isAuthPage && !isRedirecting) {
        sessionStorage.setItem('esih_auth_redirect', '1')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  },
)

export function getResolvedBackendDriver(): BackendDriver {
  const raw = (runtimeConfig.backendDriver || process.env.NEXT_PUBLIC_BACKEND_DRIVER || 'fastify')
    .toString()
    .replace(/\r/g, '')
    .trim()
    .toLowerCase()
  return raw === 'laravel' ? 'laravel' : 'fastify'
}

export function validateRuntimeConfig() {
  const portalUrl = runtimeConfig.portalUrl || PORTAL_URL || DEFAULT_PORTAL_URL
  const targetAppId = runtimeConfig.targetAppId || TARGET_APP_ID || DEFAULT_APP_ID

  if (!portalUrl || !targetAppId) {
    throw new Error('Environment SSO frontend belum lengkap: Portal URL atau Target App ID belum ditentukan')
  }
  if (targetAppId === '00000000-0000-0000-0000-000000000000') {
    throw new Error('NEXT_PUBLIC_TARGET_APP_ID masih menggunakan placeholder')
  }
}

export async function prepareCsrf() {
  if (getResolvedBackendDriver() === 'laravel') {
    await api.get('/api/auth/csrf')
  }
}

export async function exchangeSsoToken(ssoToken: string) {
  await ensureRuntimeConfig()
  validateRuntimeConfig()
  await prepareCsrf()
  const targetAppId = runtimeConfig.targetAppId || TARGET_APP_ID
  const response = await api.post<ApiEnvelope<{ user: SessionUser; token?: string }>>('/api/auth/login', {
    ssoToken,
    appId: targetAppId,
  })
  const { user, token } = response.data.data
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('esih_token', token)
    }
    if (user) {
      localStorage.setItem('esih_user', JSON.stringify(user))
    }
  }
  return user
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  await ensureRuntimeConfig()
  try {
    const response = await api.get<ApiEnvelope<SessionUser | null>>('/api/auth/me')
    const user = response.data.data
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('esih_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('esih_user')
        localStorage.removeItem('esih_token')
      }
    }
    return user
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('esih_user')
      localStorage.removeItem('esih_token')
    }
    return null
  }
}

export async function getPortalEmployees(params?: {
  id?: string
  minGradeLevel?: number
  aboveGradeLevel?: number
}) {
  const response = await api.get<ApiEnvelope<PortalEmployeeDirectoryItem[]>>(
    '/api/portal/employees',
    { params },
  )
  return response.data.data
}

export async function getPortalGrades() {
  const response = await api.get<ApiEnvelope<EmployeeGrade[]>>('/api/portal/grades')
  return response.data.data
}

export async function getPortalOrganizationUnits() {
  const response = await api.get<ApiEnvelope<OrganizationUnit[]>>('/api/portal/organization-units')
  return response.data.data
}

export async function getPortalPlacements() {
  const response = await api.get<ApiEnvelope<PlacementArea[]>>('/api/portal/placements')
  return response.data.data
}

export function returnToPortal() {
  if (typeof window === 'undefined') return
  if (window.opener && !window.opener.closed) {
    window.close()
    return
  }
  const portalBase = (runtimeConfig.portalUrl || PORTAL_URL || DEFAULT_PORTAL_URL).replace(/\/$/, '')
  window.location.href = `${portalBase}/dashboard`
}

export async function logoutSession() {
  await prepareCsrf().catch(() => null)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('esih_token')
    localStorage.removeItem('esih_user')
    sessionStorage.clear()
  }
  await api.post('/api/auth/logout').catch(() => null)
  if (typeof window !== 'undefined') {
    if (window.opener && !window.opener.closed) {
      window.close()
      return
    }
    const portalBase = (runtimeConfig.portalUrl || PORTAL_URL || DEFAULT_PORTAL_URL).replace(/\/$/, '')
    window.location.href = `${portalBase}/dashboard`
  }
}

export async function openPortal() {
  await ensureRuntimeConfig()
  validateRuntimeConfig()
  const portalBase = (runtimeConfig.portalUrl || PORTAL_URL).replace(/\/$/, '')
  const appId = runtimeConfig.targetAppId || TARGET_APP_ID
  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : ''

  // Try /launch endpoint first (Portal INL standard)
  const launchUrl = `${portalBase}/launch?appId=${encodeURIComponent(appId)}&redirect=${encodeURIComponent(redirectUrl)}`
  window.location.assign(launchUrl)
}

export function getApiError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error
      ?? error.response?.data?.message
      ?? error.message
  }
  return error instanceof Error ? error.message : fallback
}
