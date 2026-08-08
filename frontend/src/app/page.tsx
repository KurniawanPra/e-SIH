'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, getCurrentUser } from '@/lib/api'
import { LogIn, ShieldCheck, Sparkles, Building2, User, Lock } from 'lucide-react'

/*
// ==========================================
// [SSO LOGIN COMMENTED OUT FOR DEMO MODE]
// Un-comment this section when ready for SSO integration
// ==========================================
import PortalLoginGate from '@/components/PortalLoginGate'
import { useSearchParams } from 'next/navigation'

function SsoLandingContent() {
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
*/

export default function DemoLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [username, setUsername] = useState('kurniawan@inl.co.id')
  const [password, setPassword] = useState('••••••••')

  useEffect(() => {
    getCurrentUser()
      .then(() => router.replace('/dashboard'))
      .catch(() => setChecking(false))
  }, [router])

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/demo-login')
      router.replace('/dashboard')
    } catch {
      // Fallback: direct navigate to dashboard
      router.replace('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <span className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-slate-100">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-xl mx-auto shadow-lg shadow-brand-600/30">
            SIH
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">e-SIH Operation</h1>
          <p className="text-xs text-slate-300">System Highlight Report & Activity Tracking</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Sparkles size={13} /> Demo Mode Active
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleDemoLogin} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <User size={13} /> Username / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder-slate-500"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock size={13} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder-slate-500"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
                Masuk ke Dashboard (Demo)
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 text-center space-y-2 text-[11px] text-slate-400">
          <p className="flex items-center justify-center gap-1">
            <Building2 size={13} /> PT Industri Nabati Lestari
          </p>
          <p className="text-[10px] text-slate-500">
            *Mode Demo langsung aktif tanpa verifikasi SSO portal.
          </p>
        </div>
      </div>
    </div>
  )
}
