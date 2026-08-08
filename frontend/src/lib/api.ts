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

const envApiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
export const API_URL = envApiUrl
  || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:4101` : '')
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

export function validateRuntimeConfig() {
  if (!API_URL || !PORTAL_URL || !TARGET_APP_ID) {
    throw new Error('Environment SSO frontend belum lengkap')
  }
  if (BACKEND_DRIVER !== 'fastify' && BACKEND_DRIVER !== 'laravel') {
    throw new Error('NEXT_PUBLIC_BACKEND_DRIVER harus fastify atau laravel')
  }
  if (TARGET_APP_ID === '00000000-0000-0000-0000-000000000000') {
    throw new Error('NEXT_PUBLIC_TARGET_APP_ID masih menggunakan placeholder')
  }
}

export async function prepareCsrf() {
  if (BACKEND_DRIVER === 'laravel') {
    await api.get('/api/auth/csrf')
  }
}

export async function exchangeSsoToken(ssoToken: string) {
  validateRuntimeConfig()
  await prepareCsrf()
  const response = await api.post<ApiEnvelope<{ user: SessionUser }>>('/api/auth/login', {
    ssoToken,
    appId: TARGET_APP_ID,
  })
  return response.data.data.user
}

export async function getCurrentUser() {
  validateRuntimeConfig()
  const response = await api.get<ApiEnvelope<SessionUser>>('/api/auth/me')
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

export function openPortal() {
  validateRuntimeConfig()
  window.location.assign(PORTAL_LOGIN_URL)
}

export function getApiError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error
      ?? error.response?.data?.message
      ?? error.message
  }
  return error instanceof Error ? error.message : fallback
}
