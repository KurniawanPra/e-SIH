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
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3.5 sm:px-5 lg:px-6">
      {/* Left: Hamburger + Brand/Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="sm:block">
          <h1 className="text-sm font-bold text-slate-900 leading-none flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-brand-700 text-white text-[11px] font-extrabold flex items-center justify-center sm:hidden">SIH</span>
            <span>e-SIH Operation</span>
          </h1>
          <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Highlight &amp; Activity Report — PT INL</p>
        </div>
      </div>

      {/* Right: User + Actions */}
      <div className="flex items-center gap-2">
        {/* Back to Portal */}
        <button
          onClick={() => openPortal()}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl border border-slate-200 transition-colors"
        >
          <ExternalLink size={14} />
          <span className="hidden sm:inline">Portal</span>
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
          <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">{user?.name || 'Kurniawan Pralambang'}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{user?.employee?.jabatan || 'Pimpinan IT'}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
          title="Hapus sesi & logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
