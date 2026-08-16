'use client'

import { useState } from 'react'
import { openPortal } from '@/lib/api'
import { LogIn, AlertTriangle, Info, Lock, ShieldCheck } from 'lucide-react'

const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'e-SIH'
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION?.trim()
  || 'Operational IT Report & Activity Tracking — PT Industri Nabati Lestari'
const portalName = process.env.NEXT_PUBLIC_PORTAL_NAME?.trim() || 'InTes / Portal SSO'
const portalAccountName = process.env.NEXT_PUBLIC_PORTAL_ACCOUNT_NAME?.trim() || 'Portal INL'

const accessSteps = [
  {
    title: `Masuk di ${portalAccountName}`,
    description: 'Gunakan akun kerja resmi perusahaan yang sudah terdaftar.',
  },
  {
    title: 'Verifikasi Otomatis',
    description: `${portalName} memverifikasi identitas dan hak akses Anda.`,
  },
  {
    title: `Masuk ke ${appName}`,
    description: 'Sesi aman dibuat dan Anda langsung diarahkan ke Dashboard.',
  },
]

export default function PortalLoginGate({ notice = '' }: { notice?: string }) {
  const [configError, setConfigError] = useState('')

  async function handleLogin() {
    try {
      await openPortal()
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Portal belum dikonfigurasi')
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Radial */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative z-10">
        {/* Top Accent Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200/80 p-0.5 shadow-2xs flex items-center justify-center shrink-0">
              <img
                src="/esih-logo.png"
                alt="e-SIH Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm block leading-tight">
                {appName}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
                PT Industri Nabati Lestari
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shadow-2xs">
            <ShieldCheck size={13} className="text-emerald-600" />
            SSO Terintegrasi
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          {/* Main Logo & Title Hero */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm mb-4">
              <img
                src="/esih-logo.png"
                alt={`Logo ${appName}`}
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl drop-shadow-sm"
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{appName}</h2>
            <p className="text-xs font-semibold text-slate-600 max-w-sm mx-auto leading-relaxed">
              {appDescription}
            </p>
          </div>

          {(configError || notice) && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-medium mb-5 border border-red-200">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>{configError || notice}</div>
            </div>
          )}

          {/* Login Button */}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all shadow-md shadow-emerald-700/25 hover:shadow-lg hover:shadow-emerald-700/30 flex items-center justify-center gap-2 mb-6 cursor-pointer"
          >
            <LogIn size={18} />
            Masuk via {portalAccountName}
          </button>

          {/* SSO Process Stepper */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Info size={14} className="text-emerald-700" /> Alur Masuk SSO
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {accessSteps.map((step, index) => (
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs" key={step.title}>
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <strong className="block text-[11px] font-bold text-slate-900 leading-tight">{step.title}</strong>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight block mt-0.5">{step.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center text-xs font-medium text-slate-500 flex items-center justify-center gap-1.5">
          <Lock size={12} className="text-slate-400" /> Keamanan sesi terenkripsi &amp; terjamin oleh {portalName}
        </div>
      </div>
    </div>
  )
}
