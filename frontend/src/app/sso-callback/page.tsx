'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { exchangeSsoToken, getApiError, openPortal } from '@/lib/api'
import { AlertCircle, ArrowLeft } from 'lucide-react'

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
    <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-6 text-center">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Autentikasi Gagal</h3>
            <p className="text-xs text-slate-500 mb-6">{error}</p>
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
            <p className="text-xs text-slate-500">Memverifikasi identitas Anda dengan Portal SSO...</p>
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
