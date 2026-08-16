'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function MarqueeFooter({ sidebarOpen }: { sidebarOpen: boolean }) {
  const [programs, setPrograms] = useState<any[]>([])

  useEffect(() => {
    api
      .get('/api/esih/program-kerja')
      .then((res) => {
        setPrograms(res.data.data || [])
      })
      .catch((err) => console.error(err))
  }, [])

  if (programs.length === 0) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 text-xs ${
        sidebarOpen ? 'lg:pl-64' : 'lg:pl-4'
      }`}
    >
      <div className="flex items-center gap-2 h-10 px-4 overflow-x-auto scrollbar-none">
        <span className="flex items-center gap-1.5 font-semibold text-brand-700 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-700 inline-block" />
          Program Kerja
        </span>
        {programs.map((pk) => (
          <span
            key={pk.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 whitespace-nowrap shrink-0"
          >
            <span className="font-mono text-slate-600">{pk.kode}</span>
            <span className="font-medium text-slate-700">{pk.namaProgram}</span>
            <span className="font-semibold text-brand-700">{pk.totalProgress || 0}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}