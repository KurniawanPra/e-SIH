'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const BADGE_COLORS = [
  'border-2 border-emerald-400 text-emerald-300 hover:border-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-100 hover:shadow-emerald-950/80',
  'border-2 border-amber-400 text-amber-300 hover:border-amber-300 hover:bg-amber-500/20 hover:text-amber-100 hover:shadow-amber-950/80',
  'border-2 border-sky-400 text-sky-300 hover:border-sky-300 hover:bg-sky-500/20 hover:text-sky-100 hover:shadow-sky-950/80',
  'border-2 border-purple-400 text-purple-300 hover:border-purple-300 hover:bg-purple-500/20 hover:text-purple-100 hover:shadow-purple-950/80',
  'border-2 border-rose-400 text-rose-300 hover:border-rose-300 hover:bg-rose-500/20 hover:text-rose-100 hover:shadow-rose-950/80',
  'border-2 border-indigo-400 text-indigo-300 hover:border-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-100 hover:shadow-indigo-950/80'
]

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

  // Duplicate items 4x for a completely seamless, gapless continuous loop
  const loopPrograms = [...programs, ...programs, ...programs, ...programs]

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t-2 border-[#006837] shadow-[0_-4px_20px_rgba(0,0,0,0.4)] text-white h-10 hover:h-14 flex items-center transition-all duration-300 ease-out group ${
        sidebarOpen ? 'lg:pl-68' : 'lg:pl-4'
      }`}
    >
      {/* Wrapper with horizontal clipping and unclipped vertical headroom (-mt-4 pt-4) */}
      <div className="w-full relative -mt-4 pt-4 pb-1 overflow-x-clip overflow-y-visible">
        <div className="animate-marquee flex items-center gap-6 text-xs font-bold py-1">
          {loopPrograms.map((pk, idx) => {
            const colorClass = BADGE_COLORS[idx % BADGE_COLORS.length]
            return (
              <div
                key={`${pk.id}-${idx}`}
                className={`px-3.5 py-1 rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none text-xs font-black flex items-center gap-2 shrink-0 bg-slate-950/95 ${colorClass} transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-110 hover:mx-2.5 hover:z-50 cursor-pointer shadow-xl`}
              >
                <span className="font-mono text-[11px] opacity-90">[{pk.kode}]</span>
                <span>{pk.namaProgram}</span>
                <span className="px-2 py-0.5 rounded-tl-lg rounded-br-lg border border-current text-[10px] font-black">
                  {pk.totalProgress || 0}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
