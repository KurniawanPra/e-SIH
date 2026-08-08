'use client'

import { useEffect, useState } from 'react'
import PortalLoginGate from '@/components/PortalLoginGate'
import { getApiError, getCurrentUser, logoutSession } from '@/lib/api'
import type { SessionUser } from '@/types/auth'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((reason) => setError(getApiError(reason, 'Sesi tidak tersedia')))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logoutSession()
      setUser(null)
      setError('Sesi telah berakhir')
    } catch (reason) {
      setError(getApiError(reason, 'Logout gagal'))
    } finally {
      setLoggingOut(false)
    }
  }

  if (!loading && !user) {
    return <PortalLoginGate notice={error} />
  }

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>
  }

  return (
    <div className="app-layout w-100">
      <Sidebar user={user} />
      <div className="main-wrapper">
        <Header user={user} onLogout={handleLogout} loggingOut={loggingOut} />
        <main className="p-4 bg-light flex-grow-1">
          {children}
        </main>
      </div>
    </div>
  )
}
