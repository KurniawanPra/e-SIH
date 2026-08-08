'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import MobileDock from '@/components/MobileDock'
import { getCurrentUser } from '@/lib/api'
import type { SessionUser } from '@/types/auth'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {})
    // Close sidebar on mobile by default
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [])

  return (
    <div className="min-h-dvh bg-slate-50">
      <Sidebar user={user} collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
      </div>

      <MobileDock />
    </div>
  )
}
