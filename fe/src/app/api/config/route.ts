import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'

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
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const eqIdx = trimmed.indexOf('=')
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim()
            let val = trimmed.slice(eqIdx + 1).trim()
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1)
            }
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
    return process.env[key] || fileEnv[key] || fallback
  }

  const portalUrl = getEnv('NEXT_PUBLIC_PORTAL_URL', 'https://portal.inl.co.id')
  const portalLoginUrl = getEnv('NEXT_PUBLIC_PORTAL_LOGIN_URL', `${portalUrl.replace(/\/$/, '')}/login`)

  return NextResponse.json({
    apiUrl: getEnv('NEXT_PUBLIC_API_URL', ''),
    portalUrl,
    portalLoginUrl,
    targetAppId: getEnv('NEXT_PUBLIC_TARGET_APP_ID', '924b0197-31b4-4620-b15e-c037989b49a3'),
    backendDriver: getEnv('NEXT_PUBLIC_BACKEND_DRIVER', 'fastify'),
    appName: getEnv('NEXT_PUBLIC_APP_NAME', 'Aplikasi e-SIH'),
    appDescription: getEnv('NEXT_PUBLIC_APP_DESCRIPTION', 'Applikasi mengelola project manajement.'),
    appLogoUrl: getEnv('NEXT_PUBLIC_APP_LOGO_URL', '/app-logo.svg'),
    portalName: getEnv('NEXT_PUBLIC_PORTAL_NAME', 'InTes / Portal SSO'),
    portalAccountName: getEnv('NEXT_PUBLIC_PORTAL_ACCOUNT_NAME', 'Portal INL'),
  })
}
