'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, CalendarDays, CalendarRange, FolderKanban, ListChecks, ChevronDown, ChevronRight, PanelLeftClose, X } from 'lucide-react'
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
]

export default function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [masterOpen, setMasterOpen] = useState(pathname.includes('/master'))

  if (collapsed) return null

  return (
    <>
      {/* Overlay on mobile */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden" onClick={onToggle} />

      <aside className="fixed top-0 left-0 z-50 h-dvh w-72 lg:w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 shadow-2xl lg:shadow-none">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white font-extrabold text-xs">SIH</div>
            <div className="leading-tight">
              <span className="font-bold text-slate-900 text-sm block">e-SIH</span>
              <span className="text-[10px] text-slate-400 tracking-wide">INL Operation</span>
            </div>
          </Link>
          <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors">
            <PanelLeftClose size={18} className="hidden lg:block" />
            <X size={20} className="lg:hidden text-slate-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu Utama</p>
            <ul className="space-y-1">
              {nav.map(item => {
                const active = pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle() }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all no-underline ${
                        active
                          ? 'bg-brand-700 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Master Data Section */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Master Data</p>
            <button
              onClick={() => setMasterOpen(!masterOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-3"><FolderKanban size={18} strokeWidth={1.8} /> Kelola Data</span>
              {masterOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {masterOpen && (
              <ul className="ml-5 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                <li>
                  <Link
                    href="/dashboard/master/program-kerja"
                    onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle() }}
                    className={`block px-3 py-2 rounded-lg text-xs no-underline transition-colors ${
                      pathname.includes('/master/program-kerja') ? 'font-bold text-brand-700 bg-brand-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    Program Kerja
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/master/items"
                    onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle() }}
                    className={`block px-3 py-2 rounded-lg text-xs no-underline transition-colors ${
                      pathname.includes('/master/items') ? 'font-bold text-brand-700 bg-brand-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2"><ListChecks size={15} /> Item Program</span>
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50">
          <p className="text-[11px] font-semibold text-slate-700 truncate">{user?.name || 'Kurniawan Pralambang'}</p>
          <p className="text-[10px] text-slate-400 truncate">{user?.employee?.jabatan || 'Pimpinan IT & Sistem'}</p>
        </div>
      </aside>
    </>
  )
}
