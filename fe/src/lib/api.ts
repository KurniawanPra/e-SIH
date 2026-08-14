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

export const runtimeConfig: RuntimeConfigState = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL ?? '',
  portalLoginUrl: process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL ?? '',
  targetAppId: process.env.NEXT_PUBLIC_TARGET_APP_ID ?? '',
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
export const API_URL = envApiUrl
  || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3016` : '')
export const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://portal.example.com'
export const PORTAL_LOGIN_URL = process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL
  ?? `${PORTAL_URL.replace(/\/$/, '')}/login`
export const TARGET_APP_ID = process.env.NEXT_PUBLIC_TARGET_APP_ID ?? ''
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
  if (runtimeConfig.apiUrl && (!reqConfig.baseURL || reqConfig.baseURL === '')) {
    reqConfig.baseURL = runtimeConfig.apiUrl
  }
  return reqConfig
})

export function validateRuntimeConfig() {
  const apiUrl = runtimeConfig.apiUrl || API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3016` : '')
  const portalUrl = runtimeConfig.portalUrl || PORTAL_URL
  const targetAppId = runtimeConfig.targetAppId || TARGET_APP_ID

  if (!apiUrl || !portalUrl || !targetAppId) {
    throw new Error('Environment SSO frontend belum lengkap')
  }
  if (runtimeConfig.backendDriver !== 'fastify' && runtimeConfig.backendDriver !== 'laravel') {
    throw new Error('NEXT_PUBLIC_BACKEND_DRIVER harus fastify atau laravel')
  }
  if (targetAppId === '00000000-0000-0000-0000-000000000000') {
    throw new Error('NEXT_PUBLIC_TARGET_APP_ID masih menggunakan placeholder')
  }
}

export async function prepareCsrf() {
  if (runtimeConfig.backendDriver === 'laravel') {
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
  const portalLoginUrl = runtimeConfig.portalLoginUrl
    || (runtimeConfig.portalUrl ? `${runtimeConfig.portalUrl.replace(/\/$/, '')}/login` : PORTAL_LOGIN_URL)
  window.location.assign(portalLoginUrl)
}

export function getApiError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error
      ?? error.response?.data?.message
      ?? error.message
  }
  return error instanceof Error ? error.message : fallback
}
