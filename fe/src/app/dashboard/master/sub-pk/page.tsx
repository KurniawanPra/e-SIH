'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MasterSubPKPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/master/program-kerja')
  }, [router])

  return (
    <div className="flex items-center justify-center py-20">
      <span className="spinner" />
    </div>
  )
}
