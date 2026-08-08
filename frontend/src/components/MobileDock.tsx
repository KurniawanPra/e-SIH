'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, CalendarRange, FolderKanban, ExternalLink } from 'lucide-react'
import { openPortal } from '@/lib/api'

const items = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Weekly', path: '/dashboard/weekly', icon: CalendarDays },
  { name: 'Monthly', path: '/dashboard/monthly', icon: CalendarRange },
  { name: 'Data', path: '/dashboard/master/items', icon: FolderKanban },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <nav className="mobile-dock fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden bg-white/70 border border-slate-200/60 shadow-xl rounded-2xl px-2 py-1.5 flex items-center gap-1">
      {items.map(item => {
        const active = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl text-[10px] font-medium transition-all no-underline ${
              active ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <item.icon size={18} strokeWidth={active ? 2.2 : 1.6} />
            {item.name}
          </Link>
        )
      })}
      <button
        onClick={() => openPortal()}
        className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium text-slate-400 hover:bg-slate-100 transition-all"
      >
        <ExternalLink size={18} strokeWidth={1.6} />
        Portal
      </button>
    </nav>
  )
}
