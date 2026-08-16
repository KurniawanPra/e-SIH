'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import MarqueeFooter from '@/components/MarqueeFooter'
import { getCurrentUser } from '@/lib/api'
import type { SessionUser } from '@/types/auth'
import { YearProvider } from '@/context/YearContext'
import { ToastProvider } from '@/context/ToastContext'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    getCurrentUser()
      .then((u) => {
        if (!isMounted) return
        if (u) {
          setUser(u)
          setLoading(false)
        } else {
          router.replace('/')
        }
      })
      .catch(() => {
        if (!isMounted) return
        router.replace('/')
      })

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
    return () => {
      isMounted = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <span className="spinner" />
      </div>
    )
  }

  return (
    <ToastProvider>
      <YearProvider>
        <div className="min-h-dvh bg-slate-50 relative">
          <Sidebar user={user} collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

          <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
            <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className="p-3.5 sm:p-5 lg:p-6 pb-16">
              <div key={pathname}>{children}</div>
            </main>
          </div>

          <MarqueeFooter sidebarOpen={sidebarOpen} />
        </div>
      </YearProvider>
    </ToastProvider>
  )
}
