import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
    portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || '',
    portalLoginUrl: process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL || '',
    targetAppId: process.env.NEXT_PUBLIC_TARGET_APP_ID || '',
    backendDriver: process.env.NEXT_PUBLIC_BACKEND_DRIVER || 'fastify',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'e-SIH',
    appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || '',
    appLogoUrl: process.env.NEXT_PUBLIC_APP_LOGO_URL || '/app-logo.svg',
    portalName: process.env.NEXT_PUBLIC_PORTAL_NAME || 'InTes / Portal SSO',
    portalAccountName: process.env.NEXT_PUBLIC_PORTAL_ACCOUNT_NAME || 'Portal INL',
  })
}
