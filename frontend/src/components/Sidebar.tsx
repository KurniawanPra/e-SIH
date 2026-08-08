'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { SessionUser } from '@/types/auth'

interface SidebarProps {
  user: SessionUser | null
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [masterOpen, setMasterOpen] = useState(pathname.includes('/master'))

  const isAdminOrPimpinan = user?.employee?.jabatan?.toLowerCase().includes('pimpinan') || user?.employee?.jabatan?.toLowerCase().includes('admin') || true // Default fallback for dev

  const navItems = [
    { name: 'Executive Dashboard', path: '/dashboard', icon: 'bi-speedometer2' },
    { name: 'Weekly Activities', path: '/dashboard/weekly', icon: 'bi-calendar-week' },
    { name: 'Monthly Activities', path: '/dashboard/monthly', icon: 'bi-calendar-month' },
  ]

  return (
    <div className="sidebar d-flex flex-column" id="sidebar">
      <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ height: '64px' }}>
        <h4 className="text-primary fw-bold mb-0">e-SIH</h4>
        <div className="lh-sm">
          <div className="fw-bold fs-6">INL Operation</div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>Highlight Report</div>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-muted small fw-bold text-uppercase mb-2">Navigasi Utama</p>
        <ul className="nav nav-pills flex-column">
          {navItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link 
                href={item.path} 
                className={`nav-link ${pathname === item.path ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon} me-2`}></i> {item.name}
              </Link>
            </li>
          ))}
          
          {isAdminOrPimpinan && (
            <li className="nav-item mt-2">
              <a 
                className="nav-link d-flex justify-content-between align-items-center" 
                style={{ cursor: 'pointer' }}
                onClick={() => setMasterOpen(!masterOpen)}
              >
                <span><i className="bi bi-database me-2"></i> Master Data</span>
                <i className={`bi bi-chevron-${masterOpen ? 'up' : 'down'}`} style={{ fontSize: '0.75rem' }}></i>
              </a>
              {masterOpen && (
                <ul className="nav flex-column ms-3 mt-1" style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '0.5rem' }}>
                  <li className="nav-item">
                    <Link 
                      href="/dashboard/master/programs" 
                      className={`nav-link text-muted small ${pathname.includes('/master/programs') ? 'fw-bold text-primary' : ''}`}
                    >
                      <i className="bi bi-card-checklist me-1"></i> Program Kerja
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
