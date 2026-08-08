'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  FolderKanban,
  ListChecks,
  ChevronDown,
  ChevronRight,
  X,
  Users,
  LogOut,
  AlertTriangle,
  ListFilter,
  ShieldCheck
} from 'lucide-react'
import type { SessionUser } from '@/types/auth'

interface SidebarProps {
  user: SessionUser | null
  collapsed: boolean
  onToggle: () => void
}

const nav = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Weekly Activities', path: '/dashboard/weekly', icon: CalendarDays },
  { name: 'Monthly Report', path: '/dashboard/monthly', icon: CalendarRange },
  { name: 'All Activities', path: '/dashboard/activities', icon: ListFilter },
]

export default function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [masterOpen, setMasterOpen] = useState(pathname.includes('/master'))
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const isAdmin = user?.role === 'ADMIN' || !user?.role // default Kurniawan is admin

  if (collapsed) return null

  return (
    <>
      {/* Overlay on mobile */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden" onClick={onToggle} />

      <aside className="fixed top-0 left-0 z-50 h-dvh w-72 lg:w-64 neu-sidebar flex flex-col transition-transform duration-200">
        {/* Logo Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-300">
          <Link href="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 rounded-xl neu-active-green flex items-center justify-center text-white font-black text-xs">SIH</div>
            <div className="leading-tight">
              <span className="font-black text-slate-900 text-sm block">e-SIH</span>
              <span className="text-[10px] text-slate-500 font-bold tracking-wide">INL Operation</span>
            </div>
          </Link>
          {/* Close button on mobile only */}
          <button onClick={onToggle} className="lg:hidden p-2 rounded-xl neu-btn text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2.5">Menu Utama</p>
            <ul className="space-y-2">
              {nav.map(item => {
                const active = pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle() }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all no-underline ${
                        active
                          ? 'neu-active-green font-black'
                          : 'neu-btn font-bold text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <item.icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Master Data Section (Admin & System Config) */}
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2.5">Master Data</p>
            <button
              onClick={() => setMasterOpen(!masterOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 neu-btn transition-all cursor-pointer"
            >
              <span className="flex items-center gap-3"><FolderKanban size={18} strokeWidth={1.8} /> Kelola Data</span>
              {masterOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {masterOpen && (
              <ul className="ml-4 mt-2 space-y-1.5 border-l-2 border-slate-300 pl-2">
                <li>
                  <Link
                    href="/dashboard/master/program-kerja"
                    onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle() }}
                    className={`block px-3 py-2 rounded-lg text-xs no-underline transition-all ${
                      pathname.includes('/master/program-kerja')
                        ? 'neu-active-green font-extrabold'
                        : 'neu-btn text-slate-700 font-bold hover:text-slate-900'
                    }`}
                  >
                    Program Kerja
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/master/items"
                    onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle() }}
                    className={`block px-3 py-2 rounded-lg text-xs no-underline transition-all ${
                      pathname.includes('/master/items')
                        ? 'neu-active-green font-extrabold'
                        : 'neu-btn text-slate-700 font-bold hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2"><ListChecks size={15} /> Item Program</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/master/users"
                    onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle() }}
                    className={`block px-3 py-2 rounded-lg text-xs no-underline transition-all ${
                      pathname.includes('/master/users')
                        ? 'neu-active-green font-extrabold'
                        : 'neu-btn text-slate-700 font-bold hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Users size={15} /> Kelola Users</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/master/roles"
                    onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle() }}
                    className={`block px-3 py-2 rounded-lg text-xs no-underline transition-all ${
                      pathname.includes('/master/roles')
                        ? 'neu-active-green font-extrabold'
                        : 'neu-btn text-slate-700 font-bold hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2"><ShieldCheck size={15} /> Hak Akses</span>
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </nav>

        {/* Footer User Info & Role Badge & Full Width Logout */}
        <div className="p-3.5 border-t border-slate-300 neu-inset space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-black text-slate-900 truncate">{user?.name || 'Kurniawan Pralambang'}</p>
              <p className="text-[10px] text-slate-500 font-semibold truncate">{user?.employee?.jabatan || 'Pimpinan IT & Sistem'}</p>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
              isAdmin ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}>
              {isAdmin ? 'ADMIN' : 'USER'}
            </span>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold text-xs transition-colors cursor-pointer shadow-2xs neu-btn"
            title="Hapus sesi & logout"
          >
            <LogOut size={15} />
            <span>Hapus Sesi / Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto neu-btn">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-black text-slate-900 text-base">Konfirmasi Keluar Sesi</h3>
              <p className="text-xs text-slate-600 font-medium">
                Apakah Anda yakin ingin mengakhiri sesi login saat ini dan keluar dari aplikasi <strong className="text-slate-900">e-SIH Operation</strong>?
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl neu-btn font-bold text-xs text-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    const { api } = await import('@/lib/api')
                    await api.post('/api/auth/logout')
                  } catch {}
                  window.location.href = '/'
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Ya, Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
