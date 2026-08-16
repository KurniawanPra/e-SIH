'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { exchangeSsoToken, getApiError, openPortal } from '@/lib/api'
import { AlertCircle, ArrowLeft } from 'lucide-react'

const activeExchanges = new Set<string>()

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

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [ssoToken] = useState(() => extractToken() || searchParams.get('token') || searchParams.get('sso_token') || searchParams.get('ssoToken'))

  useEffect(() => {
    const token = ssoToken || extractToken()
    if (!token) {
      setError('Token SSO tidak ditemukan. Pastikan Anda masuk melalui Portal INL.')
      return
    }
    if (activeExchanges.has(token)) return

    activeExchanges.add(token)
    window.history.replaceState(null, '', '/sso-callback')

    if (typeof window !== 'undefined') {
      localStorage.removeItem('esih_token')
      localStorage.removeItem('esih_user')
      sessionStorage.clear()
    }

    exchangeSsoToken(token)
      .then(() => {
        activeExchanges.delete(token)
        sessionStorage.removeItem('sso_redirect_attempted')
        router.replace('/dashboard')
      })
      .catch((reason) => {
        activeExchanges.delete(token)
        setError(getApiError(reason, 'Login SSO gagal'))
      })
  }, [router, ssoToken])

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-6 text-center">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Autentikasi Gagal</h3>
            <p className="text-xs text-slate-600 mb-6">{error}</p>
            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              onClick={openPortal}
            >
              <ArrowLeft size={16} /> Kembali ke Portal
            </button>
          </>
        ) : (
          <>
            <div className="spinner mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Menyiapkan Sesi</h3>
            <p className="text-xs text-slate-600">Memverifikasi identitas Anda dengan Portal SSO...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <span className="spinner" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
