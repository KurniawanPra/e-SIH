'use client'

import { Menu, LogOut, ExternalLink } from 'lucide-react'
import type { SessionUser } from '@/types/auth'
import { returnToPortal } from '@/lib/api'

import { useYear } from '@/context/YearContext'

interface HeaderProps {
  user: SessionUser | null
  onToggleSidebar: () => void
}

export default function Header({ user, onToggleSidebar }: HeaderProps) {
  const { selectedYear, setSelectedYear, availableYears } = useYear()

  const handleLogout = async () => {
    try {
      const { api } = await import('@/lib/api')
      await api.post('/api/auth/logout')
    } catch { }
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-30 h-16 neu-header flex items-center justify-between px-3.5 sm:px-5 lg:px-6">
      {/* Left: Hamburger + Brand/Title + Global Year Selector */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl neu-btn text-slate-700 cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} strokeWidth={2.2} />
        </button>
        <div className="flex items-center gap-3">
          <div className="sm:block">
            <h1 className="text-sm font-black text-slate-900 leading-none flex items-center gap-2">
              <img src="/esih-logo.png" alt="e-SIH Logo" className="w-6 h-6 rounded-md object-cover sm:hidden" />
              <span>e-SIH Operation</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5 hidden sm:block">Highlight &amp; Activity Report — PT INL</p>
          </div>

          {/* Global Year Dropdown */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-300">
            <span className="text-[11px] font-extrabold text-slate-600 hidden md:inline">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="neu-btn text-xs font-black text-slate-900 bg-white border border-slate-300 px-2 py-1 rounded-xl cursor-pointer hover:border-slate-800 outline-none transition-all shadow-xs"
              title="Pilih Tahun Operasional"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right: User + Actions */}
      <div className="flex items-center gap-3">
        {/* Back to Portal */}
        <button
          onClick={() => returnToPortal()}
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
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${user?.role === 'ADMIN' || !user?.role ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                {user?.role === 'ADMIN' || !user?.role ? 'ADMIN' : 'USER'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">{user?.employee?.jabatan || user?.jabatan || 'Kepala Unit Organisasi Sub Bagian Sistem & IT'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
