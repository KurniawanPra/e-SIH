import { NextResponse } from 'next/server'
import { env as runtimeEnv } from 'node:process'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Read at request time so one standalone image can use its runtime env_file.
  const portalUrl = (runtimeEnv.NEXT_PUBLIC_PORTAL_URL || '').trim()
  const portalLoginUrl = (runtimeEnv.NEXT_PUBLIC_PORTAL_LOGIN_URL || (portalUrl ? `${portalUrl.replace(/\/$/, '')}/login` : '')).trim()
  const targetAppId = (runtimeEnv.NEXT_PUBLIC_TARGET_APP_ID || '').trim()
  const rawDriver = (runtimeEnv.NEXT_PUBLIC_BACKEND_DRIVER || 'fastify').trim().toLowerCase()
  const backendDriver = rawDriver === 'laravel' ? 'laravel' : 'fastify'

  return NextResponse.json({
    apiUrl: '',
    portalUrl,
    portalLoginUrl,
    targetAppId,
    backendDriver,
    appName: runtimeEnv.NEXT_PUBLIC_APP_NAME || 'Aplikasi e-SIH',
    appDescription: runtimeEnv.NEXT_PUBLIC_APP_DESCRIPTION || 'System Highlight Report & Activity Tracking - PT Industri Nabati Lestari',
    appLogoUrl: runtimeEnv.NEXT_PUBLIC_APP_LOGO_URL || '/esih-logo.png',
    portalName: runtimeEnv.NEXT_PUBLIC_PORTAL_NAME || 'InTes / Portal SSO',
    portalAccountName: runtimeEnv.NEXT_PUBLIC_PORTAL_ACCOUNT_NAME || 'Portal INL',
  })
}
