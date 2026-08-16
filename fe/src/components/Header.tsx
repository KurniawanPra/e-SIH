'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, ExternalLink, ChevronDown, UserCheck, ShieldCheck, LogOut } from 'lucide-react'
import type { SessionUser } from '@/types/auth'
import { returnToPortal } from '@/lib/api'
import { useYear } from '@/context/YearContext'

interface HeaderProps {
  user: SessionUser | null
  onToggleSidebar: () => void
}

export default function Header({ user, onToggleSidebar }: HeaderProps) {
  const { selectedYear, setSelectedYear, availableYears } = useYear()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const { logoutSession } = await import('@/lib/api')
    await logoutSession()
  }

  const isHSSE = /hsse|hse|safety|k3|mr/i.test(user?.unit?.nama || user?.employee?.unit?.nama || '')
  const roleLabel = isAdmin ? 'ADMIN e-SIH' : isHSSE ? 'USER (PIC HSSE)' : 'USER (PIC IT)'
  const unitLabel = isHSSE ? 'Seksi MR & HSSE' : (isAdmin ? 'Sub Bagian Sistem & IT' : 'Seksi IT')

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Menu Toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 text-sm">e-SIH Operation</span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Sub Bagian Sistem &amp; IT PT Industri Nabati Lestari
          </span>
        </div>
      </div>

      {/* Right: Year Selector + Portal Link + User Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Simple Year Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span>Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:border-slate-400"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* Portal SSO Link */}
        <button
          onClick={() => returnToPortal()}
          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ExternalLink size={13} />
          <span className="hidden sm:inline">Portal SSO</span>
        </button>

        <div className="h-4 w-px bg-slate-200" />

        {/* User Profile Dropdown (Directly reflects authenticated Portal user) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-left p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center text-xs font-bold shrink-0 ${
              isAdmin ? 'bg-emerald-700' : 'bg-slate-900'
            }`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block leading-tight text-left">
              <span className="block text-xs font-bold text-slate-900 truncate max-w-[130px]">
                {user?.name || 'Pengguna'}
              </span>
              <span className="block text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                {user?.employee?.jabatan || user?.jabatan || (isAdmin ? 'Admin e-SIH' : isHSSE ? 'Staff HSSE' : 'Staff IT')}
              </span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Popover */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2.5 z-50 space-y-2 animate-zoom-in">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-[11px] text-slate-600 font-medium">{user?.email || 'email@inl.co.id'}</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {user?.employee?.jabatan || user?.jabatan || 'Staff'} &bull; {unitLabel}
                </p>
                <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Peran:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isAdmin ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                    {isAdmin ? <ShieldCheck size={11} /> : <UserCheck size={11} />}
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => returnToPortal()}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ExternalLink size={13} /> Buka Dashboard Portal
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut size={13} /> Keluar / Logout Sesi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
