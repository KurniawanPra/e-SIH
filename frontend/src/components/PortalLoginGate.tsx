'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { openPortal } from '@/lib/api'

const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Aplikasi e-SIH'
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

  function handleLogin() {
    try {
      openPortal()
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Portal belum dikonfigurasi')
    }
  }

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-10 col-lg-7">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <span className="fw-bold fs-4 text-success d-flex align-items-center gap-2">
                <i className="bi bi-layers-fill"></i> {appName}
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                <i className="bi bi-shield-check me-1"></i> SSO Terintegrasi
              </span>
            </div>

            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="mb-3 d-inline-block p-3 rounded-circle bg-light border">
                  {logoFailed ? (
                    <div className="fw-bold fs-3 text-success d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
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

                <h3 className="fw-bold text-dark mb-2">{appName}</h3>
                <p className="text-muted small mb-3">{appDescription}</p>
              </div>

              {(configError || notice) && (
                <div className="alert alert-danger d-flex align-items-center mb-4 rounded-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  <div>{configError || notice}</div>
                </div>
              )}

              <div className="d-grid mb-4">
                <button 
                  type="button" 
                  className="btn btn-success btn-lg fw-bold py-3 shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleLogin}
                >
                  <i className="bi bi-box-arrow-in-right fs-5"></i>
                  <span>Masuk via {portalAccountName}</span>
                </button>
              </div>

              <div className="bg-light p-4 rounded-3 border">
                <h6 className="fw-bold text-dark mb-3">
                  <i className="bi bi-info-circle me-2 text-success"></i>Alur Masuk Sistem SSO
                </h6>
                <div className="row g-3">
                  {accessSteps.map((step, index) => (
                    <div className="col-12 col-md-4" key={step.title}>
                      <div className="d-flex align-items-start gap-2">
                        <span className="badge bg-success rounded-circle px-2 py-1 small">{index + 1}</span>
                        <div>
                          <strong className="d-block small text-dark">{step.title}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{step.description}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-footer bg-light border-0 py-3 text-center text-muted small">
              <i className="bi bi-lock me-1"></i> Keamanan terjamin oleh {portalName}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
