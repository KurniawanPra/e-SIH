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
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="card border-0 shadow-lg rounded-4 p-4 text-center" style={{ maxWidth: 480, width: '100%' }}>
        <div className="card-body">
          {error ? (
            <>
              <div className="text-danger mb-3">
                <i className="bi bi-x-circle-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Autentikasi Gagal</h4>
              <p className="text-muted small mb-4">{error}</p>
              <button type="button" className="btn btn-outline-danger fw-bold w-100 py-2" onClick={openPortal}>
                <i className="bi bi-arrow-left me-2"></i>Kembali ke Portal
              </button>
            </>
          ) : (
            <>
              <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
              <h4 className="fw-bold text-dark mb-2">Menyiapkan Sesi</h4>
              <p className="text-muted small mb-0">Memverifikasi identitas Anda dengan Portal SSO...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
