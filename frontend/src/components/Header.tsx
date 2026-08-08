'use client'

import { Menu, LogOut, ExternalLink } from 'lucide-react'
import type { SessionUser } from '@/types/auth'
import { openPortal } from '@/lib/api'

interface HeaderProps {
  user: SessionUser | null
  onToggleSidebar: () => void
}

export default function Header({ user, onToggleSidebar }: HeaderProps) {
  const handleLogout = async () => {
    try {
      const { api } = await import('@/lib/api')
      await api.post('/api/auth/logout')
    } catch {}
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-30 h-16 neu-header flex items-center justify-between px-3.5 sm:px-5 lg:px-6">
      {/* Left: Hamburger + Brand/Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl neu-btn text-slate-700 cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} strokeWidth={2.2} />
        </button>
        <div className="sm:block">
          <h1 className="text-sm font-black text-slate-900 leading-none flex items-center gap-2">
            <span className="w-6 h-6 rounded-md neu-active-green text-white text-[11px] font-black flex items-center justify-center sm:hidden">SIH</span>
            <span>e-SIH Operation</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5 hidden sm:block">Highlight &amp; Activity Report — PT INL</p>
        </div>
      </div>

      {/* Right: User + Actions */}
      <div className="flex items-center gap-3">
        {/* Back to Portal */}
        <button
          onClick={() => openPortal()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 neu-btn rounded-xl hover:text-brand-700 cursor-pointer"
        >
          <ExternalLink size={14} />
          <span className="hidden sm:inline">Portal</span>
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-300">
          <div className="w-8 h-8 rounded-full neu-active-green flex items-center justify-center text-xs font-black">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block leading-tight">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-extrabold text-slate-900 truncate max-w-[130px]">{user?.name || 'Kurniawan Pralambang'}</p>
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                user?.role === 'ADMIN' || !user?.role ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                {user?.role === 'ADMIN' || !user?.role ? 'ADMIN' : 'USER'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{user?.employee?.jabatan || user?.jabatan || 'Pimpinan IT & Sistem'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
