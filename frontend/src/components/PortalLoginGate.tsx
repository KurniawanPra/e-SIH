'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { openPortal } from '@/lib/api'

const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Aplikasi Internal'
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION?.trim()
  || 'Layanan kerja internal yang terhubung dengan Portal INL.'
const appLogoUrl = process.env.NEXT_PUBLIC_APP_LOGO_URL?.trim() || '/app-logo.svg'
const portalName = process.env.NEXT_PUBLIC_PORTAL_NAME?.trim() || 'InTes / Portal SSO'
const portalAccountName = process.env.NEXT_PUBLIC_PORTAL_ACCOUNT_NAME?.trim() || 'Portal INL'
const accessSteps = [
  {
    title: `Masuk di ${portalAccountName}`,
    description: 'Gunakan akun kerja perusahaan yang sudah terdaftar.',
  },
  {
    title: 'Akses diverifikasi',
    description: `${portalName} memeriksa identitas dan izin ${appName}.`,
  },
  {
    title: `Kembali ke ${appName}`,
    description: 'Sesi dibuat dan pekerjaan dapat dilanjutkan.',
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

  function handleLogin() {
    try {
      openPortal()
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Portal belum dikonfigurasi')
    }
  }

  return (
    <main className="login-gate">
      <section className="login-intro" aria-labelledby="login-title">
        <header className="login-topbar">
          <span className="product-mark">
            {appName}
          </span>
          <span className="sso-required">SSO / Required</span>
        </header>

        <div className="login-copy">
          <div className="application-logo" aria-label={`Logo ${appName}`}>
            {logoFailed ? (
              <span aria-hidden="true">{initials}</span>
            ) : (
              <Image
                src={appLogoUrl}
                alt={`Logo ${appName}`}
                width={136}
                height={136}
                priority
                unoptimized
                onError={() => setLogoFailed(true)}
              />
            )}
          </div>

          <p className="login-eyebrow">Akses aplikasi terkelola</p>
          <h1 id="login-title">{appName}</h1>
          <p className="app-description">{appDescription}</p>
          <p className="login-explanation">
            Akses ke {appName} menggunakan akun {portalAccountName}. Identitas dan hak
            akses kerja diverifikasi sebelum aplikasi dibuka.
          </p>

          <button type="button" className="portal-login-button" onClick={handleLogin}>
            <span className="key-symbol" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <circle cx="8" cy="12" r="3.5" />
                <path d="M11.5 12H21M17 12v3M20 12v2" />
              </svg>
            </span>
            <span>Login with Portal</span>
            <svg className="arrow-symbol" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 15 15 5M8 5h7v7" />
            </svg>
          </button>

          {(configError || notice) && (
            <p className="login-notice" role="status">{configError || notice}</p>
          )}
        </div>

        <footer className="login-privacy">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <rect x="4" y="8" width="12" height="9" rx="2" />
            <path d="M7 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          Kredensial hanya dimasukkan di {portalAccountName}.
        </footer>
      </section>

      <aside className="login-guide" aria-label="Alur login SSO">
        <div className="guide-heading">
          <p className="guide-kicker">Gerbang aplikasi</p>
          <h2>Masuk sekali. Lanjutkan pekerjaan di {appName}.</h2>
          <p className="guide-summary">
            {portalName} menghubungkan identitas kerja ke {appName} tanpa membagikan kata sandi.
          </p>
        </div>

        <ol className="access-timeline">
          {accessSteps.map((step, index) => (
            <li key={step.title}>
              <i className="timeline-dot" aria-hidden="true" />
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="handoff-note">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
            <path d="m9 12 2 2 4-5" />
          </svg>
          <div>
            <strong>One-time SSO handoff</strong>
            <p>Token {portalAccountName} digunakan sekali dan tidak disimpan oleh browser.</p>
          </div>
        </div>
      </aside>
    </main>
  )
}
