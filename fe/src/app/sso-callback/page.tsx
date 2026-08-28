'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { exchangeSsoToken, getApiError, openPortal } from '@/lib/api'
import type { SessionUser } from '@/types/auth'
import { AlertCircle, ArrowLeft } from 'lucide-react'

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
  const loginAttempt = useRef<Promise<SessionUser> | null>(null)

  useEffect(() => {
    let active = true
    if (!loginAttempt.current) {
      const token = extractToken() || searchParams.get('token') || searchParams.get('sso_token') || searchParams.get('ssoToken')
      if (!token) {
        setError('Token SSO tidak ditemukan. Buka e-SIH melalui Portal dengan URL localhost yang terdaftar untuk aplikasi ini.')
        return
      }
      // Retain the promise across StrictMode effect replay; a one-use token must be exchanged once.
      loginAttempt.current = exchangeSsoToken(token)
      window.history.replaceState(window.history.state, '', '/sso-callback')
    }
    loginAttempt.current
      .then(() => {
        if (active) router.replace('/dashboard')
      })
      .catch((reason) => {
        if (active) setError(getApiError(reason, 'Login SSO gagal'))
      })
    return () => { active = false }
  }, [router, searchParams])

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-50" suppressHydrationWarning>
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-6 text-center" suppressHydrationWarning>
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
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-2 mx-auto mb-4 flex items-center justify-center shadow-xs">
              <img
                src="/esih-logo.png"
                alt="e-SIH Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="spinner mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Menyiapkan Sesi e-SIH</h3>
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
      <div className="min-h-dvh flex items-center justify-center" suppressHydrationWarning>
        <span className="spinner" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
