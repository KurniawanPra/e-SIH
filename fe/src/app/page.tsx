'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/api'
import PortalLoginGate from '@/components/PortalLoginGate'

function LandingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      router.replace(`/sso-callback?token=${encodeURIComponent(token)}`)
      return
    }

    getCurrentUser()
      .then((user) => {
        if (user) {
          router.replace('/dashboard')
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
