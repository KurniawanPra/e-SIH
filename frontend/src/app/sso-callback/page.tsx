'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { exchangeSsoToken, getApiError, openPortal } from '@/lib/api'

const activeExchanges = new Set<string>()

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [ssoToken] = useState(() => searchParams.get('token'))

  useEffect(() => {
    if (!ssoToken) {
      setError('Token SSO tidak ditemukan')
      return
    }
    if (activeExchanges.has(ssoToken)) return

    activeExchanges.add(ssoToken)
    window.history.replaceState(null, '', '/sso-callback')

    exchangeSsoToken(ssoToken)
      .then(() => {
        activeExchanges.delete(ssoToken)
        router.replace('/dashboard')
      })
      .catch((reason) => {
        activeExchanges.delete(ssoToken)
        setError(getApiError(reason, 'Login SSO gagal'))
      })
  }, [router, ssoToken])

  return (
    <main className="centered-page">
      <section className="status-panel" aria-live="polite">
        {error ? (
          <>
            <p className="status-label error-label">Autentikasi gagal</p>
            <h1>Sesi tidak dapat dibuat</h1>
            <p className="muted-text">{error}</p>
            <button type="button" className="primary-button" onClick={openPortal}>
              Kembali ke Portal
            </button>
          </>
        ) : (
          <>
            <span className="spinner" aria-hidden="true" />
            <p className="status-label">Portal SSO</p>
            <h1>Menyiapkan sesi</h1>
            <p className="muted-text">Memverifikasi identitas dan membuka aplikasi.</p>
          </>
        )}
      </section>
    </main>
  )
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={<main className="centered-page"><span className="spinner" /></main>}>
      <CallbackContent />
    </Suspense>
  )
}
