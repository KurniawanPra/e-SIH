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
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || DEFAULT_PORTAL_URL,
  portalLoginUrl: process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL || `${DEFAULT_PORTAL_URL}/login`,
  targetAppId: process.env.NEXT_PUBLIC_TARGET_APP_ID || DEFAULT_APP_ID,
  backendDriver: (process.env.NEXT_PUBLIC_BACKEND_DRIVER ?? 'fastify') as BackendDriver,
}

let configPromise: Promise<RuntimeConfigState> | null = null

export async function ensureRuntimeConfig(): Promise<RuntimeConfigState> {
  if (runtimeConfig.apiUrl && runtimeConfig.portalUrl && runtimeConfig.targetAppId) {
    return runtimeConfig
  }
  if (typeof window === 'undefined') {
    return runtimeConfig
  }
  if (!configPromise) {
    configPromise = fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.apiUrl) runtimeConfig.apiUrl = data.apiUrl
        if (data.portalUrl) runtimeConfig.portalUrl = data.portalUrl
        if (data.portalLoginUrl) runtimeConfig.portalLoginUrl = data.portalLoginUrl
        if (data.targetAppId) runtimeConfig.targetAppId = data.targetAppId
        if (data.backendDriver) runtimeConfig.backendDriver = data.backendDriver

        if (runtimeConfig.apiUrl) {
          api.defaults.baseURL = runtimeConfig.apiUrl
        }
        return runtimeConfig
      })
      .catch(() => runtimeConfig)
  }
  return configPromise
}

const envApiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
export const API_URL = envApiUrl || ''
export const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || DEFAULT_PORTAL_URL
export const PORTAL_LOGIN_URL = process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL
  || `${PORTAL_URL.replace(/\/$/, '')}/login`
export const TARGET_APP_ID = process.env.NEXT_PUBLIC_TARGET_APP_ID || DEFAULT_APP_ID
export const BACKEND_DRIVER = (process.env.NEXT_PUBLIC_BACKEND_DRIVER ?? 'fastify') as BackendDriver

export const api = axios.create({
  baseURL: API_URL,
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
  const currentBaseUrl = runtimeConfig.apiUrl || API_URL || ''
  if (!reqConfig.baseURL || reqConfig.baseURL === '') {
    reqConfig.baseURL = currentBaseUrl
  }
  return reqConfig
})

export function getResolvedBackendDriver(): BackendDriver {
  const raw = (runtimeConfig.backendDriver || process.env.NEXT_PUBLIC_BACKEND_DRIVER || 'fastify')
    .toString()
    .replace(/\r/g, '')
    .trim()
    .toLowerCase()
  return raw === 'laravel' ? 'laravel' : 'fastify'
}

export function validateRuntimeConfig() {
  const fallback = typeof window !== 'undefined'
    ? (window.location.protocol === 'https:' ? window.location.origin : `${window.location.protocol}//${window.location.hostname}:3016`)
    : ''
  const apiUrl = runtimeConfig.apiUrl || API_URL || fallback
  const portalUrl = runtimeConfig.portalUrl || PORTAL_URL || DEFAULT_PORTAL_URL
  const targetAppId = runtimeConfig.targetAppId || TARGET_APP_ID || DEFAULT_APP_ID

  if (!apiUrl || !portalUrl || !targetAppId) {
    throw new Error('Environment SSO frontend belum lengkap')
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
  const response = await api.post<ApiEnvelope<{ user: SessionUser }>>('/api/auth/login', {
    ssoToken,
    appId: targetAppId,
  })
  return response.data.data.user
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  await ensureRuntimeConfig()
  validateRuntimeConfig()
  const response = await api.get<ApiEnvelope<SessionUser | null>>('/api/auth/me')
  return response.data.data
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

export async function logoutSession() {
  await prepareCsrf()
  await api.post('/api/auth/logout')
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
