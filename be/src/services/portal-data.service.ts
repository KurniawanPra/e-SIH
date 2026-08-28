import { config } from '../config/env'

export class PortalDataError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
    this.name = 'PortalDataError'
  }
}

interface CacheItem {
  data: unknown
  expiresAt: number
}

const memoryCache = new Map<string, CacheItem>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 menit cache in-memory

export function clearPortalDataCache() {
  memoryCache.clear()
}

export async function getPortalData(
  path: string,
  query: Record<string, string | number | undefined> = {},
) {
  if (!config.ssoInternalToken) {
    throw new PortalDataError('SSO_INTERNAL_TOKEN backend belum dikonfigurasi', 503)
  }

  const queryParams = new URLSearchParams(
    Object.entries(query)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ).toString()
  const cacheKey = `${path}?${queryParams}`

  const cached = memoryCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data
  }

  const url = new URL(`${config.portalApiUrl}${path}`)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'x-internal': config.ssoInternalToken,
      },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    if (cached) return cached.data
    throw new PortalDataError('Portal API tidak dapat dihubungi', 503)
  }

  const body = await response.json().catch(() => null) as {
    success?: boolean
    data?: unknown
    error?: string
  } | null
  if (!response.ok || body?.success !== true) {
    if (cached) return cached.data
    throw new PortalDataError(
      body?.error ?? 'Request data Portal gagal',
      response.status >= 500 ? 502 : response.status,
    )
  }

  memoryCache.set(cacheKey, {
    data: body.data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  return body.data
}
