'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'

// Distinct color themes per program kerja (A, B, C, D, E, F...)
const PROGRAM_THEMES = [
  {
    // A - Emerald / Green (Brand theme)
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    border: 'border-emerald-300 hover:border-emerald-500',
    text: 'text-emerald-950',
    kodeText: 'text-emerald-700 font-bold font-mono',
    progress: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    // B - Sky / Blue (Tech / Operation)
    bg: 'bg-sky-50 hover:bg-sky-100',
    border: 'border-sky-300 hover:border-sky-500',
    text: 'text-sky-950',
    kodeText: 'text-sky-700 font-bold font-mono',
    progress: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    // C - Amber / Orange (HSE / Caution)
    bg: 'bg-amber-50 hover:bg-amber-100',
    border: 'border-amber-300 hover:border-amber-500',
    text: 'text-amber-950',
    kodeText: 'text-amber-700 font-bold font-mono',
    progress: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    // D - Purple / Violet
    bg: 'bg-purple-50 hover:bg-purple-100',
    border: 'border-purple-300 hover:border-purple-500',
    text: 'text-purple-950',
    kodeText: 'text-purple-700 font-bold font-mono',
    progress: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    // E - Rose / Coral
    bg: 'bg-rose-50 hover:bg-rose-100',
    border: 'border-rose-300 hover:border-rose-500',
    text: 'text-rose-950',
    kodeText: 'text-rose-700 font-bold font-mono',
    progress: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  {
    // F - Teal / Cyan
    bg: 'bg-teal-50 hover:bg-teal-100',
    border: 'border-teal-300 hover:border-teal-500',
    text: 'text-teal-950',
    kodeText: 'text-teal-700 font-bold font-mono',
    progress: 'bg-teal-100 text-teal-900 border-teal-300',
  },
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

  // Duplicate items 4x for continuous seamless loop without gap
  const loopPrograms = [...programs, ...programs, ...programs, ...programs]

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-slate-200 text-xs shadow-sm h-11 flex items-center transition-all duration-300 overflow-hidden ${
        sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
      }`}
    >
      {/* Marquee Track */}
      <div className="w-full overflow-hidden relative flex items-center">
        <div className="animate-marquee flex items-center gap-3 py-1">
          {loopPrograms.map((pk, idx) => {
            const theme = PROGRAM_THEMES[idx % PROGRAM_THEMES.length]
            return (
              <Link
                key={`${pk.id}-${idx}`}
                href="/dashboard/master/programs"
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs no-underline transition-all shrink-0 cursor-pointer shadow-xs ${theme.bg} ${theme.border} ${theme.text}`}
                title={`Klik untuk melihat detail program ${pk.kode} - ${pk.namaProgram}`}
              >
                {/* Kode Letter (A, B, C...) - No Background */}
                <span className={`text-xs shrink-0 ${theme.kodeText}`}>
                  [{pk.kode}]
                </span>

                {/* Program Title */}
                <span className="font-semibold whitespace-nowrap">
                  {pk.namaProgram}
                </span>

                {/* Percentage Badge */}
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold border shrink-0 ${theme.progress}`}>
                  {pk.totalProgress || 0}%
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}