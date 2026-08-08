import { config } from '../config/env'

export class PortalDataError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
    this.name = 'PortalDataError'
  }
}

export async function getPortalData(
  path: string,
  query: Record<string, string | number | undefined> = {},
) {
  if (!config.ssoInternalToken) {
    throw new PortalDataError('SSO_INTERNAL_TOKEN backend belum dikonfigurasi', 503)
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
    throw new PortalDataError('Portal API tidak dapat dihubungi', 503)
  }

  const body = await response.json().catch(() => null) as {
    success?: boolean
    data?: unknown
    error?: string
  } | null
  if (!response.ok || body?.success !== true) {
    throw new PortalDataError(
      body?.error ?? 'Request data Portal gagal',
      response.status >= 500 ? 502 : response.status,
    )
  }
  return body.data
}
