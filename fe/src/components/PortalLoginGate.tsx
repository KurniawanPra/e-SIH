'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { openPortal } from '@/lib/api'
import { ShieldCheck, LogIn, AlertTriangle, Info, Lock } from 'lucide-react'

const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'e-SIH'
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION?.trim()
  || 'System Highlight Report & Activity Tracking - PT Industri Nabati Lestari'
const appLogoUrl = process.env.NEXT_PUBLIC_APP_LOGO_URL?.trim() || '/app-logo.svg'
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

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

export default function PortalLoginGate({ notice = '' }: { notice?: string }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const [configError, setConfigError] = useState('')
  const initials = useMemo(() => getInitials(appName), [])

  async function handleLogin() {
    try {
      await openPortal()
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Portal belum dikonfigurasi')
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between border-b border-slate-50">
          <span className="font-extrabold text-lg text-brand-700 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-700 text-white flex items-center justify-center text-xs">SIH</span>
            {appName}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <ShieldCheck size={14} /> SSO Terintegrasi
          </span>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-3">
              {logoFailed ? (
                <div className="w-16 h-16 rounded-xl bg-brand-700 text-white font-bold text-xl flex items-center justify-center">
                  {initials}
                </div>
              ) : (
                <Image
                  src={appLogoUrl}
                  alt={`Logo ${appName}`}
                  width={64}
                  height={64}
                  priority
                  unoptimized
                  onError={() => setLogoFailed(true)}
                />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{appName}</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">{appDescription}</p>
          </div>

          {(configError || notice) && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium mb-5 border border-red-200">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>{configError || notice}</div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-700 text-white font-bold text-sm hover:bg-brand-800 transition-colors shadow-md shadow-brand-700/20 flex items-center justify-center gap-2 mb-6"
          >
            <LogIn size={18} />
            Masuk via {portalAccountName}
          </button>

          {/* Access steps */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Info size={14} className="text-brand-700" /> Alur Masuk SSO
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {accessSteps.map((step, index) => (
                <div className="flex items-start gap-2" key={step.title}>
                  <span className="w-5 h-5 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <strong className="block text-[11px] text-slate-800 leading-tight">{step.title}</strong>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{step.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Lock size={12} /> Keamanan terjamin oleh {portalName}
        </div>
      </div>
    </div>
  )
}
