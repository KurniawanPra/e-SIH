import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'

function cleanString(val: string): string {
  let s = val.replace(/\r/g, '').trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }
  return s
}

function getFileEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  const candidateFiles = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    '/app/.env.local',
    '/app/.env',
  ]

  for (const filePath of candidateFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        for (const line of content.split('\n')) {
          const trimmed = line.replace(/\r/g, '').trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const eqIdx = trimmed.indexOf('=')
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim()
            const val = cleanString(trimmed.slice(eqIdx + 1))
            if (!env[key]) {
              env[key] = val
            }
          }
        }
      } catch {
        // ignore read errors
      }
    }
  }
  return env
}

export async function GET() {
  const fileEnv = getFileEnv()

  const getEnv = (key: string, fallback = '') => {
    const raw = process.env[key] || fileEnv[key] || fallback
    return cleanString(raw)
  }

  const portalUrl = getEnv('NEXT_PUBLIC_PORTAL_URL', 'https://portal.inl.co.id')
  const portalLoginUrl = getEnv('NEXT_PUBLIC_PORTAL_LOGIN_URL', `${portalUrl.replace(/\/$/, '')}/login`)
  const rawDriver = getEnv('NEXT_PUBLIC_BACKEND_DRIVER', 'fastify').toLowerCase()
  const backendDriver = rawDriver === 'laravel' ? 'laravel' : 'fastify'

  return NextResponse.json({
    apiUrl: getEnv('NEXT_PUBLIC_API_URL', ''),
    portalUrl,
    portalLoginUrl,
    targetAppId: getEnv('NEXT_PUBLIC_TARGET_APP_ID', '924b0197-31b4-4620-b15e-c037989b49a3'),
    backendDriver,
    appName: getEnv('NEXT_PUBLIC_APP_NAME', 'Aplikasi e-SIH'),
    appDescription: getEnv('NEXT_PUBLIC_APP_DESCRIPTION', 'Applikasi mengelola project manajement.'),
    appLogoUrl: getEnv('NEXT_PUBLIC_APP_LOGO_URL', '/app-logo.svg'),
    portalName: getEnv('NEXT_PUBLIC_PORTAL_NAME', 'InTes / Portal SSO'),
    portalAccountName: getEnv('NEXT_PUBLIC_PORTAL_ACCOUNT_NAME', 'Portal INL'),
  })
}
