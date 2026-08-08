'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, CalendarDays, CalendarRange, FolderKanban, ListChecks, ChevronDown, ChevronRight, PanelLeftClose } from 'lucide-react'
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
      <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onToggle} />

      <aside className="fixed top-0 left-0 z-50 h-dvh w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-content-center text-white font-extrabold text-xs grid place-items-center">SIH</div>
            <div className="leading-tight">
              <span className="font-bold text-slate-900 text-sm block">e-SIH</span>
              <span className="text-[10px] text-slate-400 tracking-wide">INL Operation</span>
            </div>
          </Link>
          <button onClick={onToggle} className="lg:flex hidden p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors">
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu</p>
          <ul className="space-y-0.5">
            {nav.map(item => {
              const active = pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => { if (window.innerWidth < 1024) onToggle() }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all no-underline ${
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

          {/* Master Data Section */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mt-6 mb-2">Master Data</p>
          <button
            onClick={() => setMasterOpen(!masterOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-3"><FolderKanban size={18} strokeWidth={1.8} /> Kelola Data</span>
            {masterOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {masterOpen && (
            <ul className="ml-5 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-3">
              <li>
                <Link
                  href="/dashboard/master/program-kerja"
                  onClick={() => { if (window.innerWidth < 1024) onToggle() }}
                  className={`block px-3 py-2 rounded-md text-[13px] no-underline transition-colors ${
                    pathname.includes('/master/program-kerja') ? 'font-semibold text-brand-700 bg-brand-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Program Kerja
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/master/items"
                  onClick={() => { if (window.innerWidth < 1024) onToggle() }}
                  className={`block px-3 py-2 rounded-md text-[13px] no-underline transition-colors ${
                    pathname.includes('/master/items') ? 'font-semibold text-brand-700 bg-brand-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2"><ListChecks size={15} /> Item Program</span>
                </Link>
              </li>
            </ul>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 text-center">© {new Date().getFullYear()} PT Industri Nabati Lestari</div>
        </div>
      </aside>
    </>
  )
}
