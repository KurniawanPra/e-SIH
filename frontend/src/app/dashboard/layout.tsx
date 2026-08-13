'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import MarqueeFooter from '@/components/MarqueeFooter'
import { getCurrentUser } from '@/lib/api'
import type { SessionUser } from '@/types/auth'

import { YearProvider } from '@/context/YearContext'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    getCurrentUser().then((u) => { if (u) setUser(u) }).catch(() => { })
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [])

  return (
    <YearProvider>
      <div className="min-h-dvh bg-slate-50 relative">
        <Sidebar user={user} collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-3.5 sm:p-5 lg:p-6 pb-16">
            <div key={pathname} className="animate-page-enter">{children}</div>
          </main>
        </div>

        <MarqueeFooter sidebarOpen={sidebarOpen} />
      </div>
    </YearProvider>
  )
}
