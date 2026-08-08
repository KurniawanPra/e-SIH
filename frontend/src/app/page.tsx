'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PortalLoginGate from '@/components/PortalLoginGate'
import { getCurrentUser } from '@/lib/api'

function LandingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token') ?? searchParams.get('sso_token')
    if (token) {
      router.replace(`/sso-callback?token=${encodeURIComponent(token)}`)
      return
    }

    getCurrentUser()
      .then(() => router.replace('/dashboard'))
      .catch(() => undefined)
  }, [router, searchParams])

  return <PortalLoginGate />
}

export default function HomePage() {
  return (
    <Suspense fallback={<main className="centered-page"><span className="spinner" /></main>}>
      <LandingContent />
    </Suspense>
  )
}
