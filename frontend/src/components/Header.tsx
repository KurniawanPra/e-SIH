'use client'

import type { SessionUser } from '@/types/auth'

interface HeaderProps {
  user: SessionUser | null
  onLogout: () => void
  loggingOut: boolean
}

export default function Header({ user, onLogout, loggingOut }: HeaderProps) {
  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom px-4" style={{ height: '64px' }}>
      <div className="container-fluid px-0 d-flex justify-content-between align-items-center">
        <div>
          <button className="btn btn-light d-md-none me-2" type="button" onClick={() => document.body.classList.toggle('sidebar-collapsed')}>
            <i className="bi bi-list"></i>
          </button>
          <span className="navbar-brand mb-0 h1 fw-bold fs-5 text-dark">
            Overview
          </span>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          {user && (
            <div className="d-flex align-items-center gap-2">
              <div className="text-end d-none d-sm-block lh-sm">
                <div className="fw-bold fs-6 text-dark">{user.name}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.employee?.position_name || 'Staff'}</div>
              </div>
              <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button className="btn btn-outline-danger btn-sm ms-3" onClick={onLogout} disabled={loggingOut}>
                <i className="bi bi-box-arrow-right"></i> {loggingOut ? '...' : 'Keluar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
