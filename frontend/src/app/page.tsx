'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, getCurrentUser } from '@/lib/api'
import { LogIn, ShieldCheck, Sparkles, Building2, User, Lock, ShieldAlert, UserCheck } from 'lucide-react'

export default function DemoLoginPage() {
  const router = useRouter()
  const [loadingRole, setLoadingRole] = useState<'ADMIN' | 'USER' | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then(() => router.replace('/dashboard'))
      .catch(() => setChecking(false))
  }, [router])

  const handleDemoLoginRole = async (role: 'ADMIN' | 'USER') => {
    setLoadingRole(role)
    try {
      await api.post('/api/auth/demo-login', { role })
      router.replace('/dashboard')
    } catch {
      router.replace('/dashboard')
    } finally {
      setLoadingRole(null)
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
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-brand-600/30">
            SIH
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">e-SIH Operation</h1>
          <p className="text-xs text-slate-300 font-medium">System Highlight Report &amp; Activity Tracking</p>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Sparkles size={13} /> Demo Access Mode
          </div>
        </div>

        {/* 2 Quick Demo Login Buttons */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-center text-slate-300 uppercase tracking-wider">Pilih Hak Akses Demo Login:</p>
          
          {/* Admin Login Button */}
          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleDemoLoginRole('ADMIN')}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-between cursor-pointer border border-emerald-400/30 group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left">
                <p className="font-extrabold leading-tight">Login sbg Admin e-SIH</p>
                <p className="text-[10px] text-emerald-200 font-medium">Kurniawan P. (Pimpinan IT &amp; Akses Penuh)</p>
              </div>
            </div>
            {loadingRole === 'ADMIN' ? <span className="spinner" /> : <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          {/* Staff User Login Button */}
          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleDemoLoginRole('USER')}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-between cursor-pointer border border-white/10 group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-black">
                <UserCheck size={18} className="text-brand-400" />
              </div>
              <div className="text-left">
                <p className="font-extrabold leading-tight">Login sbg User Staff IT (PIC)</p>
                <p className="text-[10px] text-slate-400 font-medium">Herbina (Staff IT &amp; Input Laporan)</p>
              </div>
            </div>
            {loadingRole === 'USER' ? <span className="spinner" /> : <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 text-center space-y-2 text-[11px] text-slate-400">
          <p className="flex items-center justify-center gap-1.5 font-bold">
            <Building2 size={13} /> PT Industri Nabati Lestari
          </p>
          <p className="text-[10px] text-slate-400">
            *Pilih salah satu peran di atas untuk menguji fitur dengan hak akses yang relevan.
          </p>
        </div>
      </div>
    </div>
  )
}
