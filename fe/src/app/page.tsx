'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/api'
import PortalLoginGate from '@/components/PortalLoginGate'

function extractToken(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
    || params.get('sso_token')
    || params.get('ssoToken')
    || params.get('sso-token')
    || params.get('code')
    || params.get('ticket')
  if (token) return token

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''))
    return hashParams.get('token')
      || hashParams.get('sso_token')
      || hashParams.get('ssoToken')
      || hashParams.get('sso-token')
      || hashParams.get('code')
      || hashParams.get('ticket')
  }
  return null
}

function LandingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = extractToken() || searchParams.get('token') || searchParams.get('sso_token') || searchParams.get('ssoToken')
    if (token) {
      router.replace(`/sso-callback?token=${encodeURIComponent(token)}`)
      return
    }

    getCurrentUser()
      .then((user) => {
        if (user) {
          window.location.href = '/dashboard'
        } else {
          setChecking(false)
        }
      })
      .catch(() => {
        setChecking(false)
      })
  }, [router, searchParams])

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <span className="spinner" />
      </div>
    )
  }

  return <PortalLoginGate />
}

export default function RootPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-slate-50">
          <span className="spinner" />
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  )
}
