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
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-slate-800 leading-none">Highlight & Activity Report</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">SDM &amp; Sistem Program</p>
        </div>
      </div>

      {/* Right: User + Actions */}
      <div className="flex items-center gap-2">
        {/* Back to Portal */}
        <button
          onClick={() => openPortal()}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg border border-slate-200 transition-colors"
        >
          <ExternalLink size={14} />
          Portal
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
          <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400">{user?.employee?.jabatan || 'Staff'}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          title="Hapus sesi & logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
