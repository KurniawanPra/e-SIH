'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  ChevronDown,
  ChevronRight,
  X,
  Users,
  LogOut,
  AlertTriangle,
  ShieldCheck,
  CalendarClock,
  Layers
} from 'lucide-react'
import type { SessionUser } from '@/types/auth'
import ModalPortal from '@/components/ModalPortal'

interface SidebarProps {
  user: SessionUser | null
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [masterOpen, setMasterOpen] = useState(pathname.includes('/master'))
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const isAdmin = user?.role === 'ADMIN'
  const programKerjaLabel = isAdmin ? 'Daftar Program Kerja' : 'Program Kerja Ku'
  const activitiesLabel = isAdmin ? 'Activities' : 'Activities Ku'
  const proyekLabel = 'Update Aktivitas'

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: programKerjaLabel, path: '/dashboard/master/programs', icon: FolderKanban },
    { name: activitiesLabel, path: '/dashboard/weekly', icon: ListChecks },
    { name: proyekLabel, path: '/dashboard/monthly', icon: CalendarClock },
  ]

  const masterItems = [
    { name: 'Program Kerja Induk', path: '/dashboard/master/program-kerja', icon: FolderKanban },
    { name: 'Master Bagian', path: '/dashboard/master/bagian', icon: Layers },
    { name: 'Kelola Users', path: '/dashboard/master/users', icon: Users },
    { name: 'Hak Akses & Role', path: '/dashboard/master/roles', icon: ShieldCheck },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/30 z-40 lg:hidden transition-opacity ${
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={onToggle}
      />

      <aside
        className={`fixed top-0 left-0 z-50 h-dvh w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Logo Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <span className="w-7 h-7 rounded bg-brand-700 text-white flex items-center justify-center font-bold text-xs">
              SIH
            </span>
            <div className="leading-tight">
              <span className="font-bold text-slate-900 text-sm block">e-SIH</span>
              <span className="text-[10px] text-slate-500 block">PT INL Operation</span>
            </div>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded text-slate-500 hover:bg-slate-100"
            aria-label="Tutup Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <span className="block px-2.5 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu
            </span>
            <ul className="space-y-1.5">
              {navItems.map((item) => {
                const normalizedPath =
                  pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
                const active =
                  item.path === '/dashboard'
                    ? normalizedPath === '/dashboard'
                    : normalizedPath.startsWith(item.path)

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle()
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium no-underline transition-all border ${
                        active
                          ? 'bg-brand-50 text-brand-700 font-semibold border-brand-500 shadow-2xs'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <item.icon size={16} className={active ? 'text-brand-700' : 'text-slate-500'} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Master Data (Admin Only) */}
          {isAdmin && (
            <div>
              <span className="block px-2.5 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pengaturan
              </span>
              {(() => {
                const normalizedPath =
                  pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
                const isMasterActive =
                  normalizedPath.includes('/master') && !normalizedPath.includes('/master/programs')

                return (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setMasterOpen(!masterOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                        isMasterActive
                          ? 'bg-brand-50 text-brand-700 font-semibold border-brand-500 shadow-2xs'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <FolderKanban
                          size={16}
                          className={isMasterActive ? 'text-brand-700' : 'text-slate-500'}
                        />
                        <span>Master Data</span>
                      </span>
                      {masterOpen ? (
                        <ChevronDown size={14} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={14} className="text-slate-400" />
                      )}
                    </button>

                    {masterOpen && (
                      <ul className="ml-4 pl-2.5 border-l border-slate-200 space-y-1 pt-1">
                        {masterItems.map((sub) => {
                          const isSubActive = normalizedPath.includes(sub.path)
                          return (
                            <li key={sub.path}>
                              <Link
                                href={sub.path}
                                onClick={() => {
                                  if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle()
                                }}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs no-underline transition-all border ${
                                  isSubActive
                                    ? 'text-brand-700 font-semibold bg-brand-50 border-brand-400 shadow-2xs'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                <sub.icon
                                  size={14}
                                  className={isSubActive ? 'text-brand-700' : 'text-slate-400'}
                                />
                                <span>{sub.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </nav>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2.5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.name || 'Pengguna'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.employee?.jabatan || user?.jabatan || 'Staff'}
            </p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-lg border border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-700 font-semibold text-xs transition-colors cursor-pointer"
            title="Keluar dari e-SIH"
          >
            <LogOut size={15} className="text-red-600 shrink-0" />
            <span>Keluar / Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-900/40 z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-lg w-full max-w-sm overflow-hidden my-auto">
              <div className="p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Konfirmasi Keluar</h3>
                <p className="text-xs text-slate-600">
                  Apakah Anda yakin ingin keluar dari aplikasi e-SIH?
                </p>
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    const { logoutSession } = await import('@/lib/api')
                    await logoutSession()
                  }}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  )
}
