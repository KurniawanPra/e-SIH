'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { api, getCurrentUser } from '@/lib/api'
import Link from 'next/link'
import {
  TrendingUp,
  BarChart3,
  FolderKanban,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  User,
  UserCheck,
  CalendarDays,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  FileText,
  Layers,
  Plus,
  Pencil,
  X,
  Search,
  Check,
  Sparkles
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LabelList,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import type { SessionUser } from '@/types/auth'
import { useYear } from '@/context/YearContext'
import ModalPortal from '@/components/ModalPortal'
import { useToast } from '@/context/ToastContext'
import { isSamePerson } from '@/lib/utils'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Individual Scrollable Program Kerja Card Component with 4-Status Breakdown & Collapsible Detail
function ProgramKerjaItemCard({ parent, myActivities }: { parent: any; myActivities?: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false) // Default: Collapsed
  const activeItems = useMemo(() => parent.items?.filter((i: any) => i.isActive !== false) || [], [parent])
  const isScrollable = activeItems.length > 3

  // All activities under this parent program
  const parentActivities = useMemo(() => {
    if (!myActivities || myActivities.length === 0) return []
    return myActivities.filter((a: any) =>
      a.program?.programKerjaId === parent.id ||
      a.kategoriProgram?.startsWith(`${parent.kode}.`) ||
      activeItems.some((i: any) => i.id === a.idProgram || i.id === a.program?.id || (a.itemName && a.itemName.toLowerCase() === i.namaItem?.toLowerCase()))
    )
  }, [myActivities, parent, activeItems])

  // 4 Status counts for parent program
  const parentStatusCounts = useMemo(() => {
    const closed = parentActivities.filter((a: any) => a.status === 'Closed').length
    const progress = parentActivities.filter((a: any) => a.status === 'On Progress').length
    const open = parentActivities.filter((a: any) => a.status === 'Open').length
    const cancelled = parentActivities.filter((a: any) => a.status === 'Cancelled').length
    const total = parentActivities.length
    return { closed, progress, open, cancelled, total }
  }, [parentActivities])

  // Function to calculate 4 status counts for each sub-program item
  const getItemStats = (item: any) => {
    const itemTasks = parentActivities.filter((a: any) =>
      a.idProgram === item.id ||
      a.program?.id === item.id ||
      (a.itemName && a.itemName.toLowerCase() === item.namaItem?.toLowerCase())
    )
    const closed = itemTasks.filter((a: any) => a.status === 'Closed').length
    const progress = itemTasks.filter((a: any) => a.status === 'On Progress').length
    const open = itemTasks.filter((a: any) => a.status === 'Open').length
    const cancelled = itemTasks.filter((a: any) => a.status === 'Cancelled').length
    return {
      total: itemTasks.length,
      closed,
      progress,
      open,
      cancelled
    }
  }

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(isScrollable)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 shadow-xs hover:shadow-md transition-all overflow-hidden w-full max-w-full">
      {/* Header Row (Clickable to Expand/Collapse) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 cursor-pointer select-none bg-gradient-to-r from-white via-slate-50/40 to-brand-50/20 hover:to-brand-50/40 transition-colors space-y-3"
      >
        {/* Top Row: Point Letter (Clean Typography) + Title + Badges + Expand Toggle Button */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            {/* Clean Bold Letter without background */}
            <span className="text-2xl sm:text-3xl font-black text-brand-900 tracking-tight leading-none shrink-0 pt-0.5">
              {parent.kode}.
            </span>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {parent.namaProgram}
                </h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shrink-0">
                  <Layers size={12} className="text-slate-500" /> {activeItems.length} Sub-Program
                </span>
                {parentStatusCounts.total > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold shrink-0">
                    <UserCheck size={12} /> {parentStatusCounts.total} Tugas Saya
                  </span>
                )}
              </div>

              {/* 4 Status Breakdown Pills (Open, On Progress, Closed, Canceled) */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold pt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200" title="Tugas Selesai (Closed)">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Selesai: <strong>{parentStatusCounts.closed}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200" title="Tugas Sedang Dikerjakan (On Progress)">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Progres: <strong>{parentStatusCounts.progress}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200" title="Tugas Masih Terbuka (Open)">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600" /> Open: <strong>{parentStatusCounts.open}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200" title="Tugas Dibatalkan (Canceled)">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Canceled: <strong>{parentStatusCounts.cancelled}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0 ${isExpanded
                ? 'bg-brand-50 border-brand-300 text-brand-800 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian Sub-Program'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Dedicated Full-Width Progress Bar Row */}
        <div className="pt-2 border-t border-slate-200/70 space-y-1.5 w-full">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="text-slate-600">Progress Capaian Program Kerja Tahunan</span>
            <span className="text-slate-900 font-black text-sm">{parent.totalProgress}%</span>
          </div>
          <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-300 ${parent.totalProgress >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : parent.totalProgress >= 50
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500'
                }`}
              style={{ width: `${parent.totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Collapsible Sub-items Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-3 border-t border-slate-200/80 bg-slate-50/50 space-y-3 animate-dropdown-in">
          {/* Scroll Buttons Header if > 3 items */}
          {isScrollable && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Daftar Sub-Program Kerja ({activeItems.length} Item):</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  title="Geser Kiri"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  title="Geser Kanan"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Items Container */}
          <div className="relative w-full max-w-full overflow-hidden">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className={
                isScrollable
                  ? 'flex overflow-x-auto gap-3 pb-2 scrollbar-none scroll-smooth w-full'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full'
              }
            >
              {activeItems.map((item: any) => {
                const stats = getItemStats(item)
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between hover:border-brand-300 transition-all shadow-xs gap-2.5 ${isScrollable ? 'w-[250px] sm:w-[270px] shrink-0' : 'w-full'
                      }`}
                  >
                    {/* 1. Kode & Nama Item Sub */}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold block">
                          {item.kode}
                        </span>
                        {stats.total > 0 && (
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                            {stats.total} Tugas
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2" title={item.namaItem}>
                        {item.namaItem}
                      </h5>
                    </div>

                    {/* 2. Progress Capaian (Center Aligned) */}
                    <div className="space-y-1.5 py-0.5 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[11px] font-bold text-slate-500">Progress Capaian</span>
                        <span className="text-sm font-black text-slate-900 leading-none mt-0.5">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200 p-0.2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${item.progress >= 80
                              ? 'bg-emerald-600'
                              : item.progress >= 50
                                ? 'bg-brand-700'
                                : 'bg-amber-500'
                            }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 3. 4 Status Micro-Pills for Sub-Program */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-bold pt-1.5 border-t border-slate-100">
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <span>Selesai</span>
                        <strong>{stats.closed}</strong>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100">
                        <span>Progres</span>
                        <strong>{stats.progress}</strong>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100">
                        <span>Open</span>
                        <strong>{stats.open}</strong>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-red-50 text-red-800 border border-red-100">
                        <span>Canceled</span>
                        <strong>{stats.cancelled}</strong>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CustomHighlightTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]?.payload || {}
  return (
    <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200 shadow-xl text-xs space-y-2 min-w-[190px] z-50 animate-dropdown-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
        <span className="font-bold text-slate-900 text-sm">{data.bulan || data.month || label}</span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
          Total: {data.Total || 0}
        </span>
      </div>
      <div className="space-y-1.5 pt-0.5 font-semibold">
        <div className="flex items-center justify-between text-emerald-800 bg-emerald-50/70 px-2 py-1 rounded-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Selesai:
          </span>
          <strong className="font-bold text-sm">{data.Selesai || 0}</strong>
        </div>
        <div className="flex items-center justify-between text-amber-800 bg-amber-50/70 px-2 py-1 rounded-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Progres:
          </span>
          <strong className="font-bold text-sm">{data.Progres || 0}</strong>
        </div>
        <div className="flex items-center justify-between text-sky-800 bg-sky-50/70 px-2 py-1 rounded-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> Open:
          </span>
          <strong className="font-bold text-sm">{data.Open || 0}</strong>
        </div>
        <div className="flex items-center justify-between text-red-800 bg-red-50/70 px-2 py-1 rounded-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Canceled:
          </span>
          <strong className="font-bold text-sm">{data.Cancelled || 0}</strong>
        </div>
      </div>
    </div>
  )
}

function HighlightPicSearchDropdown({
  selectedUser,
  onChangeUser,
  userName,
  allCount,
  myCount,
  picOptions,
  picCounts
}: {
  selectedUser: string
  onChangeUser: (val: string) => void
  userName?: string
  allCount: number
  myCount: number
  picOptions: string[]
  picCounts: Record<string, number>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredPicOptions = useMemo(() => {
    if (!search.trim()) return picOptions
    const q = search.toLowerCase()
    return picOptions.filter(p => p.toLowerCase().includes(q))
  }, [picOptions, search])

  const getDisplayText = () => {
    if (selectedUser === 'ME') return `Highlight Saya (${myCount})`
    if (selectedUser === 'ALL') return `Semua PIC (${allCount})`
    return `${selectedUser} (${picCounts[selectedUser] || 0})`
  }

  return (
    <div ref={dropdownRef} className="relative w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs font-bold text-slate-800 transition-colors cursor-pointer"
        title="Pilih PIC Highlight"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <User size={13} className="text-brand-700 shrink-0" />
          <span className="text-slate-600 font-semibold shrink-0">Filter PIC:</span>
          <span className="truncate text-slate-900">{getDisplayText()}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-700' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 sm:left-0 top-full mt-1.5 z-[9999] w-full min-w-[280px] rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl space-y-2 animate-dropdown-in flex flex-col">
          {/* Search Input */}
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Cari nama PIC..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-7 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Select Options */}
          <div className="space-y-1 shrink-0 pb-1 border-b border-slate-100">
            <button
              type="button"
              onClick={() => {
                onChangeUser('ME')
                setIsOpen(false)
                setSearch('')
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${selectedUser === 'ME'
                  ? 'bg-brand-50 text-brand-800 border border-brand-200 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-2 truncate">
                <User size={13} className="text-brand-600 shrink-0" />
                <span className="truncate">Highlight Saya ({userName || 'Staff'})</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  {myCount}
                </span>
                {selectedUser === 'ME' && <Check size={14} className="text-brand-700" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onChangeUser('ALL')
                setIsOpen(false)
                setSearch('')
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${selectedUser === 'ALL'
                  ? 'bg-brand-50 text-brand-800 border border-brand-200 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Users size={13} className="text-brand-600 shrink-0" />
                <span className="truncate">Semua PIC</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  {allCount}
                </span>
                {selectedUser === 'ALL' && <Check size={14} className="text-brand-700" />}
              </div>
            </button>
          </div>

          {/* PIC List */}
          <div className="overflow-y-auto max-h-52 space-y-0.5 pr-1 custom-scrollbar">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Daftar PIC Tim ({filteredPicOptions.length})
            </p>
            {filteredPicOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 font-medium">
                Tidak ada PIC cocok dengan pencarian
              </div>
            ) : (
              filteredPicOptions.map(pic => {
                const isSelected = selectedUser === pic
                const count = picCounts[pic] || 0
                return (
                  <button
                    key={pic}
                    type="button"
                    onClick={() => {
                      onChangeUser(pic)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${isSelected
                        ? 'bg-brand-50 text-brand-800 border border-brand-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span className="truncate">{pic}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {count}
                      </span>
                      {isSelected && <Check size={14} className="text-brand-700 shrink-0" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PicFilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (val: string) => void
  options: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const list = q ? options.filter((o) => o.toLowerCase().includes(q)) : options
    return ['ALL', ...list]
  }, [options, search])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex items-center justify-between gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs font-bold text-slate-800 transition-colors cursor-pointer min-w-[180px]"
      >
        <span className="flex items-center gap-1.5 truncate">
          <User size={13} className="text-brand-700 shrink-0" />
          <span className="truncate">{value === 'ALL' ? 'Semua PIC' : value}</span>
        </span>
        <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-[9999] w-72 max-w-[80vw] rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl space-y-2 animate-dropdown-in">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari PIC..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                  setSearch('')
                }}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${value === opt ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {opt === 'ALL' ? 'Semua PIC' : opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { toast } = useToast()
  const { selectedYear, setSelectedYear, availableYears } = useYear()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [kpi, setKpi] = useState<any>(null)
  const [parents, setParents] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [highlights, setHighlights] = useState<any[]>([])
  const [userList, setUserList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL')
  const [selectedPieProgram, setSelectedPieProgram] = useState<string>('ALL')
  const [selectedHighlightUser, setSelectedHighlightUser] = useState<string>('ME')
  const [selectedHighlightMonth, setSelectedHighlightMonth] = useState<number | 'ALL'>('ALL')
  const [highlightStartDate, setHighlightStartDate] = useState<string>('')
  const [highlightEndDate, setHighlightEndDate] = useState<string>('')

  // Filters for user dashboard "Program Kerja Ku"
  const [programPicFilter, setProgramPicFilter] = useState<string>('ALL')
  const [programStatusFilter, setProgramStatusFilter] = useState<string>('ALL')
  const [programStartDate, setProgramStartDate] = useState<string>('')
  const [programEndDate, setProgramEndDate] = useState<string>('')

  const currentMonthNum = useMemo(() => new Date().getMonth() + 1, [])

  const yearOptions = availableYears

  useEffect(() => {
    getCurrentUser().then((u) => { if (u) setUser(u) }).catch(() => undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/api/esih/dashboard?year=${selectedYear}`),
      api.get(`/api/esih/program-kerja?year=${selectedYear}`),
      api.get(`/api/esih/activities?year=${selectedYear}`),
      api.get(`/api/esih/highlights?year=${selectedYear}`),
      api.get('/api/esih/users').catch(() => ({ data: { data: [] } }))
    ])
      .then(([r1, r2, r3, r4, r5]) => {
        setKpi(r1.data.kpi)
        setParents(r2.data.data || [])
        setActivities(r3.data.data || [])
        setHighlights(r4.data.data || [])
        setUserList(r5.data?.data || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
  }, [selectedYear])

  // Matched User Object from SSO / Overrides
  const currentUserObj = useMemo(() => {
    if (!user) return null
    const myId = String((user as any)?.id || '')
    return userList.find((u: any) => {
      const uId = String(u.id || '')
      if (myId && uId && myId === uId) return true
      return isSamePerson(
        { name: user.name, email: user.email },
        { name: u.nama, email: u.email },
      )
    })
  }, [userList, user])

  // Program IDs assigned directly to user (from Master Roles / ref_UserOverride)
  const assignedProgramIds = useMemo(() => {
    const progs = (currentUserObj as any)?.programs || []
    return progs.map((p: any) => String(p.programId || p.id || p || '')).filter(Boolean)
  }, [currentUserObj])

  const filtered = useMemo(() => {
    return activities.filter((a: any) => {
      if (a.isActive === false) return false
      const dStr = a.startDate || a.dueDate || a.closedDate || (a.createdAt ? a.createdAt.split('T')[0] : '')
      if (dStr) {
        const itemYear = new Date(dStr).getFullYear()
        if (!isNaN(itemYear) && itemYear !== selectedYear) return false
      }
      return true
    })
  }, [activities, selectedYear])

  // Staff IT Personal Activities (matching primary or secondary PIC by name or email)
  const myActivities = useMemo(() => {
    if (!user?.name) return filtered
    const my = { name: user.name, email: user.email }

    return activities.filter((a: any) => {
      if (a.isActive === false) return false
      const dStr = a.startDate || a.dueDate || a.closedDate || (a.createdAt ? a.createdAt.split('T')[0] : '')
      if (dStr) {
        const itemYear = new Date(dStr).getFullYear()
        if (!isNaN(itemYear) && itemYear !== selectedYear) return false
      }

      const isPrimaryPicMatch = isSamePerson(my, { name: a.picNama?.split('/')[0]?.trim(), email: a.picEmail })
      const isPicsArrayMatch = Array.isArray(a.pics) && a.pics.some((p: any) =>
        isSamePerson(my, { name: p.name || p.nama, email: p.email }),
      )

      return isPrimaryPicMatch || isPicsArrayMatch
    })
  }, [activities, selectedYear, user, filtered])

  // Activities untuk "Program Kerja Ku": tampilkan semua activity tahun terpilih,
  // lalu biarkan user memfilter PIC/status/tanggal secara manual.
  const programActivities = useMemo(() => {
    return activities.filter((a: any) => {
      if (a.isActive === false) return false

      const dStr = a.startDate || a.dueDate || a.closedDate || (a.createdAt ? a.createdAt.split('T')[0] : '')
      if (dStr) {
        const y = new Date(dStr).getFullYear()
        if (!isNaN(y) && y !== selectedYear) return false
      }

      if (programPicFilter !== 'ALL') {
        const pic = { name: a.picNama?.split('/')[0]?.trim(), email: a.picEmail }
        if (!isSamePerson({ name: programPicFilter }, pic)) return false
      }

      if (programStatusFilter !== 'ALL' && a.status !== programStatusFilter) return false

      if (programStartDate && dStr && dStr < programStartDate) return false
      if (programEndDate && dStr && dStr > programEndDate) return false

      return true
    })
  }, [activities, selectedYear, programPicFilter, programStatusFilter, programStartDate, programEndDate])

  // Daftar PIC unik dari userList + activities untuk dropdown filter "Program Kerja Ku"
  const programPicOptions = useMemo(() => {
    const map = new Map<string, string>()
    userList.forEach((u: any) => {
      if (u.nama) map.set(u.nama, u.nama)
    })
    activities.forEach((a: any) => {
      if (a.picNama) {
        a.picNama.split(/[/,;]+/).forEach((n: string) => {
          const t = n.trim()
          if (t) map.set(t, t)
        })
      }
    })
    return Array.from(map.values()).sort()
  }, [userList, activities])

  // Filter only tasks that are still open/active (excluding Closed)
  const myOpenActivities = useMemo(() => {
    return myActivities.filter((a: any) => a.status !== 'Closed')
  }, [myActivities])

  const myStats = useMemo(() => {
    const o = myActivities.filter((a: any) => a.status === 'Open').length
    const p = myActivities.filter((a: any) => a.status === 'On Progress').length
    const c = myActivities.filter((a: any) => a.status === 'Closed').length
    const x = myActivities.filter((a: any) => a.status === 'Cancelled').length
    return { open: o, progress: p, closed: c, cancelled: x, total: o + p + c + x }
  }, [myActivities])

  const myRate = myStats.total > 0 ? Math.round((myStats.closed / myStats.total) * 100) : 0

  // PIC Highlight Counts
  const picCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    highlights.forEach((h: any) => {
      if (h.namePic) {
        h.namePic.split('/').forEach((p: string) => {
          const trimmed = p.trim()
          if (trimmed) {
            counts[trimmed] = (counts[trimmed] || 0) + 1
          }
        })
      }
    })
    return counts
  }, [highlights])

  // Count of highlights for the logged-in user
  const myHighlightsCount = useMemo(() => {
    if (!user?.name) return highlights.length
    const my = { name: user.name, email: user.email }
    return highlights.filter((h: any) => {
      const nameMatch = h.namePic
        ? h.namePic.split('/').some((n: string) => isSamePerson(my, { name: n.trim() }))
        : false
      const picsMatch = Array.isArray(h.pics) && h.pics.some((p: any) =>
        isSamePerson(my, { name: p.name || p.nama, email: p.email }),
      )
      return nameMatch || picsMatch
    }).length
  }, [highlights, user])

  // PIC List Options for Highlight Filter
  const picOptions = useMemo(() => {
    const map = new Map<string, string>()
    userList.forEach((u: any) => {
      if (u.nama) map.set(u.nama, u.nama)
    })
    highlights.forEach((h: any) => {
      if (h.namePic) {
        h.namePic.split('/').forEach((p: string) => {
          const trimmed = p.trim()
          if (trimmed) map.set(trimmed, trimmed)
        })
      }
    })
    return Array.from(map.values()).sort()
  }, [userList, highlights])

  // Filtered Highlights based on selected PIC/User, Month, and Date Range
  const filteredHighlightsForChart = useMemo(() => {
    let result = highlights

    // 1. Filter PIC / User
    if (selectedHighlightUser !== 'ALL') {
      const target = selectedHighlightUser === 'ME'
        ? { name: user?.name, email: user?.email }
        : { name: selectedHighlightUser }

      result = result.filter((h: any) => {
        const nameMatch = h.namePic
          ? h.namePic.split('/').some((n: string) => isSamePerson(target, { name: n.trim() }))
          : false
        const picsMatch = Array.isArray(h.pics) && h.pics.some((p: any) =>
          isSamePerson(target, { name: p.name || p.nama, email: p.email }),
        )
        return nameMatch || picsMatch
      })
    }

    // 2. Filter Month
    if (selectedHighlightMonth !== 'ALL') {
      result = result.filter((h: any) => Number(h.bulan) === Number(selectedHighlightMonth))
    }

    // 3. Filter Date Range
    if (highlightStartDate) {
      result = result.filter((h: any) => {
        const d = h.targetDate || h.closedDate || ''
        return d && d >= highlightStartDate
      })
    }
    if (highlightEndDate) {
      result = result.filter((h: any) => {
        const d = h.targetDate || h.closedDate || ''
        return d && d <= highlightEndDate
      })
    }

    return result
  }, [highlights, selectedHighlightUser, user, selectedHighlightMonth, highlightStartDate, highlightEndDate])

  // Monthly Highlight Chart Data (Jan - Des or Weekly Breakdown for single month)
  const highlightChartData = useMemo(() => {
    if (selectedHighlightMonth === 'ALL') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
      return months.map((monthName, idx) => {
        const monthNum = idx + 1
        const monthHighlights = filteredHighlightsForChart.filter((h: any) => Number(h.bulan) === monthNum)
        const closed = monthHighlights.filter((h: any) => h.status === 'Closed').length
        const progress = monthHighlights.filter((h: any) => h.status === 'On Progress').length
        const open = monthHighlights.filter((h: any) => h.status === 'Open').length
        const cancelled = monthHighlights.filter((h: any) => h.status === 'Cancelled').length
        const total = monthHighlights.length

        return {
          month: monthName,
          bulan: MONTH_NAMES[idx],
          Selesai: closed,
          Progres: progress,
          Open: open,
          Cancelled: cancelled,
          Total: total
        }
      })
    } else {
      // Breakdown into exactly 4 Weeks for the Selected Month
      const monthIdx = Number(selectedHighlightMonth) - 1
      const monthName = MONTH_NAMES[monthIdx] || `Bulan ${selectedHighlightMonth}`
      const weeks = [
        { label: 'Minggu 1 (1-7)', fullLabel: `${monthName} - Minggu 1 (Tgl 1-7)`, startDay: 1, endDay: 7 },
        { label: 'Minggu 2 (8-14)', fullLabel: `${monthName} - Minggu 2 (Tgl 8-14)`, startDay: 8, endDay: 14 },
        { label: 'Minggu 3 (15-21)', fullLabel: `${monthName} - Minggu 3 (Tgl 15-21)`, startDay: 15, endDay: 21 },
        { label: 'Minggu 4 (22-31)', fullLabel: `${monthName} - Minggu 4 (Tgl 22-31)`, startDay: 22, endDay: 31 },
      ]

      // Filter all highlights belonging to this month
      const currentMonthHighlights = filteredHighlightsForChart.filter(
        (h: any) => Number(h.bulan) === Number(selectedHighlightMonth)
      )

      return weeks.map((w, wIdx) => {
        const weekHighlights = currentMonthHighlights.filter((h: any, itemIdx: number) => {
          const dStr = h.targetDate || h.closedDate || h.startDate || (h.createdAt ? h.createdAt.split('T')[0] : '')
          if (dStr) {
            const parts = dStr.split('-')
            if (parts.length === 3) {
              const day = parseInt(parts[2], 10)
              if (!isNaN(day) && day >= 1 && day <= 31) {
                return day >= w.startDay && day <= w.endDay
              }
            }
            const parsed = new Date(dStr)
            if (!isNaN(parsed.getDate())) {
              const day = parsed.getDate()
              return day >= w.startDay && day <= w.endDay
            }
          }
          // If no specific date exists, distribute items evenly across the 4 weeks
          return (itemIdx % 4) === wIdx
        })

        const closed = weekHighlights.filter((h: any) => h.status === 'Closed').length
        const progress = weekHighlights.filter((h: any) => h.status === 'On Progress').length
        const open = weekHighlights.filter((h: any) => h.status === 'Open').length
        const cancelled = weekHighlights.filter((h: any) => h.status === 'Cancelled').length
        const total = weekHighlights.length

        return {
          month: w.label,
          bulan: w.fullLabel,
          Selesai: closed,
          Progres: progress,
          Open: open,
          Cancelled: cancelled,
          Total: total
        }
      })
    }
  }, [filteredHighlightsForChart, selectedHighlightMonth])

  // Summary Metrics for the Highlight Chart
  const highlightChartStats = useMemo(() => {
    const total = filteredHighlightsForChart.length
    const closed = filteredHighlightsForChart.filter((h: any) => h.status === 'Closed').length
    const progress = filteredHighlightsForChart.filter((h: any) => h.status === 'On Progress').length
    const open = filteredHighlightsForChart.filter((h: any) => h.status === 'Open').length
    const cancelled = filteredHighlightsForChart.filter((h: any) => h.status === 'Cancelled').length
    const rate = total > 0 ? Math.round((closed / total) * 100) : 0
    return { total, closed, progress, open, cancelled, rate }
  }, [filteredHighlightsForChart])



  const stats = useMemo(() => {
    const o = filtered.filter((a: any) => a.status === 'Open').length
    const p = filtered.filter((a: any) => a.status === 'On Progress').length
    const c = filtered.filter((a: any) => a.status === 'Closed').length
    const x = filtered.filter((a: any) => a.status === 'Cancelled').length
    return { open: o, progress: p, closed: c, cancelled: x, total: o + p + c + x }
  }, [filtered])

  const rate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0

  const slaRate = useMemo(() => {
    const closed = filtered.filter((a: any) => a.status === 'Closed' && a.closedDate && a.dueDate)
    const onTime = closed.filter((a: any) => a.closedDate <= a.dueDate).length
    return closed.length > 0 ? Math.round((onTime / closed.length) * 100) : 0
  }, [filtered])

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return months.map((month, index) => {
      const closed = filtered.filter((a: any) => new Date(a.startDate).getMonth() === index && a.status === 'Closed').length
      const open = filtered.filter((a: any) => new Date(a.startDate).getMonth() === index && (a.status === 'Open' || a.status === 'On Progress')).length
      return { month, Selesai: closed, Berjalan: open }
    })
  }, [filtered])

  const myChartData = useMemo(() => {
    if (selectedMonth === 'ALL') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
      return months.map((month, index) => {
        const closed = myActivities.filter((a: any) => {
          const dStr = a.closedDate || a.startDate || a.dueDate || (a.createdAt ? a.createdAt.split('T')[0] : '')
          if (!dStr) return false
          const d = new Date(dStr)
          return !isNaN(d.getTime()) && d.getMonth() === index && a.status === 'Closed'
        }).length
        return { label: month, month, Selesai: closed }
      })
    } else {
      const weeks = [
        { label: 'W1 (1-7)', startDay: 1, endDay: 7 },
        { label: 'W2 (8-14)', startDay: 8, endDay: 14 },
        { label: 'W3 (15-21)', startDay: 15, endDay: 21 },
        { label: 'W4 (22-28)', startDay: 22, endDay: 28 },
        { label: 'W5 (29-31)', startDay: 29, endDay: 31 },
      ]
      return weeks.map(w => {
        const closed = myActivities.filter((a: any) => {
          const dStr = a.closedDate || a.startDate || a.dueDate || (a.createdAt ? a.createdAt.split('T')[0] : '')
          if (!dStr) return false
          const d = new Date(dStr)
          if (isNaN(d.getTime())) return false
          const day = d.getDate()
          return d.getMonth() === selectedMonth && day >= w.startDay && day <= w.endDay && a.status === 'Closed'
        }).length
        return { label: w.label, month: w.label, Selesai: closed }
      })
    }
  }, [myActivities, selectedMonth])

  const myFilteredActivities = useMemo(() => {
    return myActivities.filter((a: any) => {
      const dStr = a.startDate || a.dueDate || a.closedDate || (a.createdAt ? a.createdAt.split('T')[0] : '')
      if (!dStr) return true
      const d = new Date(dStr)
      if (isNaN(d.getTime())) return true
      if (selectedMonth !== 'ALL' && d.getMonth() !== selectedMonth) return false
      return true
    })
  }, [myActivities, selectedMonth])

  const chartStats = useMemo(() => {
    const realClosed = myFilteredActivities.filter((a: any) => a.status === 'Closed').length
    const realProgress = myFilteredActivities.filter((a: any) => a.status === 'On Progress').length
    const realOpen = myFilteredActivities.filter((a: any) => a.status === 'Open').length
    const realCancelled = myFilteredActivities.filter((a: any) => a.status === 'Cancelled').length
    const realTotal = realClosed + realProgress + realOpen + realCancelled
    const rate = realTotal > 0 ? Math.round((realClosed / realTotal) * 100) : 0
    const high = Math.max(...myChartData.map(d => d.Selesai), 0)
    const low = Math.min(...myChartData.map(d => d.Selesai), 0)
    return { closed: realClosed, progress: realProgress, open: realOpen, cancelled: realCancelled, total: realTotal, rate, high, low }
  }, [myFilteredActivities, myChartData])

  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return months.map((month, index) => {
      const closedAccumulated = filtered.filter((a: any) => {
        const d = new Date(a.startDate)
        return d.getMonth() <= index && a.status === 'Closed'
      }).length
      return { month, Akumulatif: closedAccumulated }
    })
  }, [filtered])

  const selectedProgramActivities = useMemo(() => {
    if (selectedPieProgram === 'ALL') return filtered
    return filtered.filter((a: any) => {
      const kat = (a.kategoriProgram || '').toUpperCase()
      const progId = (a.idProgram || '').toUpperCase()
      const item = (a.itemName || '').toUpperCase()
      const pic = (a.picNama || '').toUpperCase()
      const keg = (a.kegiatan || '').toUpperCase()

      if (selectedPieProgram === 'SISTEM' || selectedPieProgram === 'B') {
        return progId.includes('B') || kat.startsWith('B') || kat.includes('SUSTAINABLE') || kat.includes('AUDIT') || kat.includes('SISTEM') || kat.includes('ISO') || pic.includes('HERBINA')
      }
      if (selectedPieProgram === 'HSSE' || selectedPieProgram === 'C') {
        return progId.includes('C') || kat.startsWith('C') || kat.includes('HSE') || kat.includes('HSSE') || kat.includes('SAFETY') || kat.includes('ENVIRONMENT') || pic.includes('AGUNG') || pic.includes('FITRI') || keg.includes('HSE') || keg.includes('SAFETY')
      }
      if (selectedPieProgram === 'IT' || selectedPieProgram === 'A') {
        return progId.includes('A') || kat.startsWith('A') || kat.includes('DIGITAL') || kat.includes('IT') || kat.includes('INFRA') || kat.includes('DEVELOPMENT') || pic.includes('KURNIAWAN') || pic.includes('SALMAN') || pic.includes('TOMMY') || pic.includes('AUNDRY') || keg.includes('IT')
      }
      return kat.startsWith(selectedPieProgram) || progId.includes(selectedPieProgram)
    })
  }, [filtered, selectedPieProgram])

  const pieStats = useMemo(() => {
    const closed = selectedProgramActivities.filter((a: any) => a.status === 'Closed').length
    const progress = selectedProgramActivities.filter((a: any) => a.status === 'On Progress').length
    const open = selectedProgramActivities.filter((a: any) => a.status === 'Open').length
    const total = closed + progress + open
    const rate = total > 0 ? Math.round((closed / total) * 100) : 0
    return { closed, progress, open, total, rate }
  }, [selectedProgramActivities])

  const pieData = useMemo(() => [
    { name: 'Selesai (Closed)', value: pieStats.closed, color: '#006837' },
    { name: 'On Progress', value: pieStats.progress, color: '#f59e0b' },
    { name: 'Open', value: pieStats.open, color: '#dc2626' },
  ], [pieStats])

  const groupTaskVolumeData = useMemo(() => {
    const groups = [
      { name: 'Prog A', fullName: 'Digital & IT Infra', key: 'A' },
      { name: 'Prog B', fullName: 'Audit & ISO Halal', key: 'B' },
      { name: 'Prog C', fullName: 'HSE & Safety', key: 'C' }
    ]
    return groups.map(g => {
      const gActs = filtered.filter((a: any) => a.kategoriProgram?.startsWith(g.key) || a.idProgram?.includes(g.key))
      const closed = gActs.filter((a: any) => a.status === 'Closed').length
      const progress = gActs.filter((a: any) => a.status === 'On Progress' || a.status === 'Open').length
      return { program: g.name, fullName: g.fullName, Selesai: closed, Berjalan: progress, Total: gActs.length }
    })
  }, [filtered])

  const kendalaStatusData = useMemo(() => {
    const lancar = filtered.filter((a: any) => (!a.kendala || a.kendala === '-' || a.kendala.trim() === '') && a.status === 'Closed').length
    const monitoring = filtered.filter((a: any) => a.status === 'On Progress').length
    const penanganan = filtered.filter((a: any) => (a.kendala && a.kendala !== '-' && a.kendala.trim() !== '') || a.status === 'Open').length
    return [
      { status: 'Lancar', label: 'Bebas Kendala', Jumlah: lancar },
      { status: 'Progres', label: 'Monitoring', Jumlah: monitoring },
      { status: 'Kendala', label: 'Perlu Action', Jumlah: penanganan }
    ]
  }, [filtered])

  const categoryRealization = useMemo(() => {
    const catMap: Record<string, { total: number; closed: number }> = {
      'A': { total: 0, closed: 0 },
      'B': { total: 0, closed: 0 },
      'C': { total: 0, closed: 0 },
    }

    filtered.forEach((a: any) => {
      const progId = a.idProgram || ''
      let code = 'A'
      if (progId.includes('B')) code = 'B'
      if (progId.includes('C')) code = 'C'

      if (catMap[code]) {
        catMap[code].total += 1
        if (a.status === 'Closed') catMap[code].closed += 1
      }
    })

    return [
      { code: 'A', name: 'Digital & IT Infra', ...catMap['A'], pct: catMap['A'].total > 0 ? Math.round((catMap['A'].closed / catMap['A'].total) * 100) : 0, color: '#006837' },
      { code: 'B', name: 'Audit & ISO Halal', ...catMap['B'], pct: catMap['B'].total > 0 ? Math.round((catMap['B'].closed / catMap['B'].total) * 100) : 0, color: '#f59e0b' },
      { code: 'C', name: 'HSE & Safety Drill', ...catMap['C'], pct: catMap['C'].total > 0 ? Math.round((catMap['C'].closed / catMap['C'].total) * 100) : 0, color: '#0284c7' },
    ]
  }, [filtered])

  const employeeProgress = useMemo(() => {
    const picMap = new Map<string, { name: string; total: number; closed: number; progress: number; open: number }>()

    filtered.forEach((a: any) => {
      const name = a.picNama?.split('/')[0]?.trim() || 'Unassigned'
      const email = (a.picEmail || '').trim().toLowerCase()
      const key = email || `name:${name.toLowerCase()}`

      if (!picMap.has(key)) {
        picMap.set(key, { name, total: 0, closed: 0, progress: 0, open: 0 })
      }
      const row = picMap.get(key)!
      row.total += 1
      if (a.status === 'Closed') row.closed += 1
      else if (a.status === 'On Progress') row.progress += 1
      else if (a.status === 'Open') row.open += 1
    })

    return Array.from(picMap.values()).map((row) => {
      const data = row as { name: string; total: number; closed: number; progress: number; open: number }
      const closedPct = data.total > 0 ? Math.round((data.closed / data.total) * 100) : 0
      const progressPct = data.total > 0 ? Math.round((data.progress / data.total) * 100) : 0
      const openPct = data.total > 0 ? Math.max(0, 100 - closedPct - progressPct) : 0
      return { name: data.name, total: data.total, closed: data.closed, progress: data.progress, open: data.open, percentage: closedPct, progressPct, openPct }
    }).sort((a, b) => b.total - a.total)
  }, [filtered])

  const priorityTasks = useMemo(() => {
    return filtered
      .filter((a: any) => a.status === 'Open' || a.status === 'On Progress')
      .slice(0, 4)
  }, [filtered])

  const topPics = useMemo(() => employeeProgress.slice(0, 3), [employeeProgress])

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalSum = payload.reduce((acc: number, entry: any) => acc + (Number(entry.value) || 0), 0)
      return (
        <div className="chart-tooltip-zoom bg-slate-900 text-white p-3.5 rounded-xl shadow-lg text-xs space-y-1.5 border border-slate-700">
          <p className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1 text-xs font-semibold">Bulan {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-5 font-semibold">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">{entry.value} Aktivitas</span>
            </div>
          ))}
          {payload.length > 1 && (
            <div className="pt-1.5 border-t border-slate-700 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Total Volume:</span>
              <span>{totalSum} Aktivitas</span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip-zoom bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
          <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1">Sampai Bulan {label}</p>
          <p className="font-semibold text-emerald-400 text-sm">{payload[0].value} Total Aktivitas Selesai</p>
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="chart-tooltip-zoom bg-slate-900 text-white p-3.5 rounded-xl shadow-lg text-xs border border-slate-700">
          <p className="font-bold flex items-center gap-1.5" style={{ color: data.payload.color }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            {data.name}
          </p>
          <p className="font-semibold text-white text-base mt-1">{data.value} Aktivitas</p>
        </div>
      )
    }
    return null
  }

  const CustomHighlightTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="chart-tooltip-zoom bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs border border-slate-700 space-y-2 min-w-[190px] z-[1000]">
          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 flex items-center justify-between">
            <span>Bulan {data.bulan}</span>
            <span className="text-[11px] font-normal text-slate-400">{data.Total} Highlight</span>
          </div>
          <div className="space-y-1 font-semibold text-[11px]">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Selesai:</span>
              <span className="font-bold">{data.Selesai}</span>
            </div>
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Progres:</span>
              <span className="font-bold">{data.Progres}</span>
            </div>
            <div className="flex items-center justify-between text-sky-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" /> Open:</span>
              <span className="font-bold">{data.Open}</span>
            </div>
            {data.Cancelled > 0 && (
              <div className="flex items-center justify-between text-red-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Cancelled:</span>
                <span className="font-bold">{data.Cancelled}</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  const isUserRole = user?.role !== 'ADMIN'

  // =========================================================================
  // VIEW FOR STAFF USER (Role: USER) - Concise, Personal Task Dashboard
  // =========================================================================
  if (isUserRole) {
    return (
      <div className="space-y-6 pb-28 sm:pb-36">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <UserCheck className="text-brand-700" size={24} /> Dashboard Staff IT &amp; Sistem Operational
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Selamat datang, <strong className="text-slate-900">{user?.name}</strong> ({user?.jabatan || 'Staff IT'}). Berikut ringkasan tugas aktivitas Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-900 neu-select outline-none cursor-pointer"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Section Header: Ringkasan Aktivitas Personal (Penugasan Tugas Tahunan) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-700" /> Ringkasan Kinerja Aktivitas &amp; Tugas Saya
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-800 border border-brand-200">
                Data Aktivitas Personal (Weekly Tasks)
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Akumulasi seluruh tindakan kerja &amp; project mingguan yang ditugaskan ke Anda sepanjang tahun <strong className="text-slate-900">{selectedYear}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs">
              <CalendarDays size={13} className="text-slate-500" /> Periode: 1 Tahun ({selectedYear})
            </span>
          </div>
        </div>

        {/* 3 Personal KPI Cards (Center Aligned) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: My Total Tasks */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-300 transition-all">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <FolderKanban size={14} className="text-brand-700" /> Total Laporan Aktivitas Saya
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{myStats.total}</div>
            <p className="text-xs font-semibold text-slate-500">
              Total penugasan aktivitas Anda pada tahun {selectedYear}
            </p>
          </div>

          {/* Card 2: My Closure Rate */}
          <div className="bg-gradient-to-b from-brand-50/90 to-emerald-50/50 p-5 rounded-2xl border border-brand-200 shadow-sm text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-400 transition-all">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900">
              <CheckCircle2 size={14} className="text-emerald-700" /> Realisasi Selesai (Closure Rate)
            </div>
            <div className="text-4xl font-black text-brand-800 tracking-tight">{myRate}%</div>
            <div className="w-full max-w-[200px] bg-slate-200/80 h-2.5 rounded-full overflow-hidden border border-brand-200 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-brand-700 rounded-full transition-all duration-500"
                style={{ width: `${myRate}%` }}
              />
            </div>
            <p className="text-xs font-bold text-slate-700 pt-0.5">
              <strong className="text-emerald-800">{myStats.closed}</strong> dari <strong className="text-slate-900">{myStats.total}</strong> Selesai ({myRate}%)
            </p>
          </div>

          {/* Card 3: My Status Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-300 transition-all">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Activity size={14} className="text-brand-700" /> Sebaran 4 Status Tugas ({selectedYear})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-1">
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/90 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 text-center">
                  Selesai
                </span>
                <span className="text-base font-black text-emerald-950 mt-0.5">{myStats.closed}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50/90 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 text-center">
                  Progres
                </span>
                <span className="text-base font-black text-amber-950 mt-0.5">{myStats.progress}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-50/90 border border-sky-200">
                <span className="text-[11px] font-bold text-sky-800 text-center">
                  Open
                </span>
                <span className="text-base font-black text-sky-950 mt-0.5">{myStats.open}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-50/90 border border-red-200">
                <span className="text-[11px] font-bold text-red-800 text-center">
                  Canceled
                </span>
                <span className="text-base font-black text-red-950 mt-0.5">{myStats.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* White Theme Line Chart with Year & Month Dropdowns */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Header & Year/Month Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LineIcon size={18} className="text-brand-700" /> Realisasi Penyelesaian Aktivitas Saya
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Grafik tren realisasi tugas selesai per {selectedMonth === 'ALL' ? 'Bulan (Jan - Des)' : 'Minggu (Sprint)'}
              </p>
            </div>

            {/* Year & Month Dropdowns */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 neu-select outline-none cursor-pointer border border-slate-300"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>

              <select
                value={selectedMonth === 'ALL' ? 'ALL' : selectedMonth}
                onChange={e => setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-800 bg-brand-50 neu-select outline-none cursor-pointer border border-brand-200"
              >
                <option value="ALL">Semua Bulan (Jan - Des)</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grow space-y-4">
            {/* Real Stats Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">{chartStats.closed} Task</span>
                <div className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200 text-xs font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{chartStats.rate}%</span>
                  <span className="text-slate-600 font-normal ml-0.5">Closure Rate</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-amber-600" /> Dalam Proses: <strong className="text-amber-700">{chartStats.progress + chartStats.open} Task</strong>
                </span>
                <span>
                  High: <strong className="text-sky-600 font-bold">{chartStats.high} Task</strong>
                </span>
                <span>
                  Low: <strong className="text-amber-600 font-bold">{chartStats.low} Task</strong>
                </span>
              </div>
            </div>

            {/* Chart Area */}
            <ChartContainer
              config={{
                Selesai: { label: 'Selesai (Closed)', color: '#006837' }
              }}
              className="h-80 w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
            >
              <ComposedChart
                data={myChartData}
                margin={{
                  top: 25,
                  right: 15,
                  left: -15,
                  bottom: 15,
                }}
              >
                <defs>
                  <linearGradient id="brandGreenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006837" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#006837" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 8"
                  stroke="#e2e8f0"
                  strokeOpacity={0.8}
                  horizontal={true}
                  vertical={false}
                />

                {/* Vertical reference line at peak point */}
                {myChartData.length > 0 && (
                  <ReferenceLine
                    x={myChartData.reduce((max, d) => d.Selesai > max.Selesai ? d : max, myChartData[0])?.label}
                    stroke="#006837"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                )}

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#006837', fontWeight: 'bold' }}
                  tickMargin={14}
                  interval="preserveStartEnd"
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#006837', fontWeight: 'bold' }}
                  tickFormatter={(val) => `${val}`}
                  tickMargin={14}
                />

                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-slate-900 text-white border border-slate-700 rounded-xl p-3 shadow-lg space-y-1 text-xs font-semibold z-[1000]">
                          <div className="text-slate-600 font-bold mb-1">{data.label}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-emerald-400">{data.Selesai} Task Selesai</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ strokeDasharray: '3 3', stroke: '#006837', strokeOpacity: 0.5 }}
                />

                <Line
                  type="monotone"
                  dataKey="Selesai"
                  stroke="#006837"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props
                    const maxTask = Math.max(...myChartData.map((d: any) => d.Selesai))
                    const minTask = Math.min(...myChartData.map((d: any) => d.Selesai))
                    if (payload.Selesai === maxTask || payload.Selesai === minTask) {
                      return (
                        <circle
                          key={`dot-${payload.label}`}
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="#006837"
                          stroke="white"
                          strokeWidth={2.5}
                        />
                      )
                    }
                    return <g key={`dot-${payload.label}`} />
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#006837',
                    stroke: 'white',
                    strokeWidth: 2.5,
                  }}
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        </div>

        {/* Section: Program Kerja Ku (menampilkan semua program, dengan filter PIC/status/tanggal) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban size={18} className="text-brand-700" /> Program Kerja Ku ({selectedYear})
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Semua program kerja operasional. Gunakan filter untuk mempersempit berdasarkan PIC, status, atau rentang tanggal.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              {programActivities.length} Aktivitas Tampil
            </span>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center gap-2.5">
            <PicFilterDropdown
              value={programPicFilter}
              onChange={setProgramPicFilter}
              options={programPicOptions}
            />

            <select
              value={programStatusFilter}
              onChange={(e) => setProgramStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer hover:bg-slate-50"
            >
              <option value="ALL">Semua Status</option>
              <option value="Open">Open</option>
              <option value="On Progress">On Progress</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <CalendarDays size={14} className="text-slate-500 shrink-0" />
              <input
                type="date"
                value={programStartDate}
                onChange={(e) => setProgramStartDate(e.target.value)}
                className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500"
                title="Tanggal Awal"
              />
              <span className="text-xs font-bold text-slate-500">s/d</span>
              <input
                type="date"
                value={programEndDate}
                onChange={(e) => setProgramEndDate(e.target.value)}
                className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500"
                title="Tanggal Akhir"
              />
              {(programStartDate || programEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setProgramStartDate('')
                    setProgramEndDate('')
                  }}
                  className="p-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold"
                  title="Reset range tanggal"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {(programPicFilter !== 'ALL' || programStatusFilter !== 'ALL' || programStartDate || programEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setProgramPicFilter('ALL')
                  setProgramStatusFilter('ALL')
                  setProgramStartDate('')
                  setProgramEndDate('')
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {parents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-xs">
              <FolderKanban size={36} className="mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-800">Belum Ada Program Kerja</p>
              <p className="text-xs text-slate-600">Belum ada program kerja pada tahun {selectedYear}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 w-full min-w-0">
              {parents
                .filter((p: any) => p.isActive !== false)
                .map((parent: any) => (
                  <div key={parent.id}>
                    <ProgramKerjaItemCard parent={parent} myActivities={programActivities} />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Section: Update Highlight Aktivitas Bulanan (Bentuk Chart dengan Filter Per-User, Bulan, dan Range Tanggal) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5 mb-16 sm:mb-24">
          {/* Header & Controls */}
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {selectedHighlightMonth === 'ALL'
                      ? `Update Highlight Bulanan (${selectedYear})`
                      : `Update Highlight Mingguan - Bulan ${MONTH_NAMES[Number(selectedHighlightMonth) - 1]} (${selectedYear})`}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${selectedHighlightMonth === 'ALL'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                  >
                    {selectedHighlightMonth === 'ALL' ? (
                      <>
                        <FileSpreadsheet size={11} className="text-purple-700" /> Mode Highlight Bulanan (Monthly)
                      </>
                    ) : (
                      <>
                        <CalendarDays size={11} className="text-blue-700" /> Mode Highlight Mingguan (Weekly)
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 font-semibold mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 text-brand-800 border border-brand-200 font-bold">
                    <User size={12} className="text-brand-700" />
                    {selectedHighlightUser === 'ME'
                      ? `Milik: ${user?.name || 'Saya'}`
                      : selectedHighlightUser === 'ALL'
                        ? 'Milik: Semua PIC Tim'
                        : `Milik: ${selectedHighlightUser}`}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                    <CalendarDays size={12} className="text-slate-600" />
                    {selectedHighlightMonth === 'ALL'
                      ? `Periode: 12 Bulan (Jan - Des ${selectedYear})`
                      : `Periode: 4 Minggu Bulan ${MONTH_NAMES[Number(selectedHighlightMonth) - 1]} ${selectedYear}`}
                  </span>
                  {(highlightStartDate || highlightEndDate) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                      Tgl: {highlightStartDate || 'Awal'} s/d {highlightEndDate || 'Akhir'}
                    </span>
                  )}
                </div>
              </div>

              {/* Mode Toggle & Quick Links */}
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                {/* Segmented Control Mode Switcher */}
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedHighlightMonth('ALL')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${selectedHighlightMonth === 'ALL'
                        ? 'bg-white text-brand-800 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Bulanan (Jan - Des)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHighlightMonth(currentMonthNum)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${selectedHighlightMonth !== 'ALL'
                        ? 'bg-white text-brand-800 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Mingguan ({MONTH_NAMES[currentMonthNum - 1]?.slice(0, 3)})
                  </button>
                </div>

                <Link
                  href="/dashboard/monthly"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Buka Halaman Tabel Highlight Bulanan Lengkap"
                >
                  Tabel Bulanan <ExternalLink size={12} />
                </Link>
                {/* <Link
                  href="/dashboard/weekly"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Buka Laporan Aktivitas Mingguan"
                >
                  Aktivitas Mingguan <ExternalLink size={12} />
                </Link> */}
              </div>
            </div>

            {/* Filter Bar: Filter PIC, Filter Bulan, dan Filter Range Tanggal (Full Width) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full items-center bg-slate-50/70 p-3 rounded-xl border border-slate-200">
              {/* Filter PIC Searchable Dropdown */}
              <div className="md:col-span-4 w-full">
                <HighlightPicSearchDropdown
                  selectedUser={selectedHighlightUser}
                  onChangeUser={setSelectedHighlightUser}
                  userName={user?.name}
                  allCount={highlights.length}
                  myCount={myHighlightsCount}
                  picOptions={picOptions}
                  picCounts={picCounts}
                />
              </div>

              {/* Filter Bulan Dropdown */}
              <div className="md:col-span-3 w-full flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 shrink-0">Bulan:</span>
                <select
                  value={selectedHighlightMonth}
                  onChange={e => setSelectedHighlightMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-white border border-slate-300 outline-none cursor-pointer shadow-2xs"
                >
                  <option value="ALL">Semua Bulan (Jan - Des)</option>
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Filter Range Tanggal */}
              <div className="md:col-span-5 w-full flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-slate-600 shrink-0">
                  <CalendarDays size={13} className="text-brand-600" /> Tanggal:
                </span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    type="date"
                    value={highlightStartDate}
                    onChange={e => setHighlightStartDate(e.target.value)}
                    className="w-full flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-brand-500 shadow-2xs cursor-pointer"
                    title="Tanggal Awal"
                  />
                  <span className="text-slate-400 font-normal shrink-0">s/d</span>
                  <input
                    type="date"
                    value={highlightEndDate}
                    onChange={e => setHighlightEndDate(e.target.value)}
                    className="w-full flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-brand-500 shadow-2xs cursor-pointer"
                    title="Tanggal Akhir"
                  />
                </div>
                {(highlightStartDate || highlightEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setHighlightStartDate('')
                      setHighlightEndDate('')
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <X size={11} /> Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Highlight Summary Mini Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-bold">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-slate-600">Total</span>
              <span className="font-bold text-slate-900">{highlightChartStats.total}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700">Selesai</span>
              <span className="font-bold text-emerald-900">{highlightChartStats.closed}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-amber-700">Progres</span>
              <span className="font-bold text-amber-900">{highlightChartStats.progress}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-sky-700">Open</span>
              <span className="font-bold text-sky-900">{highlightChartStats.open}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-50 border border-red-200">
              <span className="text-red-700">Canceled</span>
              <span className="font-bold text-red-900">{highlightChartStats.cancelled}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-indigo-700">Closure</span>
              <span className="font-bold text-indigo-900">{highlightChartStats.rate}%</span>
            </div>
          </div>

          {/* Recharts Bar Chart (Modern Stacked Format with Consistent Proportions) */}
          <div className="h-[340px] sm:h-[380px] w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={highlightChartData}
                barCategoryGap={selectedHighlightMonth === 'ALL' ? '22%' : '30%'}
                margin={{ top: 28, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 'bold' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => (dataMax === 0 ? 5 : Math.max(Math.ceil(dataMax * 1.25), dataMax + 1))]}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomHighlightTooltip />}
                  cursor={{ fill: 'rgba(0, 104, 55, 0.05)' }}
                  wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                />
                <Bar
                  dataKey="Selesai"
                  name="Selesai"
                  stackId="highlightStack"
                  fill="#006837"
                  maxBarSize={selectedHighlightMonth === 'ALL' ? 44 : 64}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="Progres"
                  name="Progres"
                  stackId="highlightStack"
                  fill="#f59e0b"
                  maxBarSize={selectedHighlightMonth === 'ALL' ? 44 : 64}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="Open"
                  name="Open"
                  stackId="highlightStack"
                  fill="#0284c7"
                  maxBarSize={selectedHighlightMonth === 'ALL' ? 44 : 64}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="Cancelled"
                  name="Canceled"
                  stackId="highlightStack"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={selectedHighlightMonth === 'ALL' ? 44 : 64}
                  className="cursor-pointer"
                >
                  <LabelList
                    dataKey="Total"
                    position="top"
                    offset={8}
                    formatter={(val: any) => (Number(val) > 0 ? `${val}` : '')}
                    style={{ fontSize: 12, fontWeight: '800', fill: '#0f172a' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Elegant Status Legend */}
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 flex-wrap text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#006837] shadow-2xs" />
              <span>Selesai (Closed)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#f59e0b] shadow-2xs" />
              <span>On Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#0284c7] shadow-2xs" />
              <span>Open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#ef4444] shadow-2xs" />
              <span>Canceled</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW FOR ADMIN / KEPALA UNIT ORGANISASI SUB BAGIAN SISTEM & IT (Role: ADMIN) - Comprehensive Executive Dashboard
  // =========================================================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 items-start w-full max-w-full overflow-hidden">
      {/* LEFT MAIN CONTENT AREA */}
      <div className="lg:col-span-2 2xl:col-span-3 min-w-0 space-y-6 overflow-hidden">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Executive Dashboard {user?.jabatan || 'Kepala Sub Bagian Sistem dan IT'}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Selamat datang, <strong className="text-slate-900">{user?.name || 'Admin'}</strong> &mdash; Sistem Laporan Highlight &amp; Monitoring Kinerja Sub Bagian Sistem &amp; IT
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700">Tahun:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-900 neu-select outline-none cursor-pointer"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Program Kerja Cards */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-800" /> Program Kerja Utama ({selectedYear})
          </h3>
          <div className="grid grid-cols-1 gap-4 w-full min-w-0">
            {parents.filter(p => p.isActive).map((parent, index) => (
              <div key={parent.id} >
                <ProgramKerjaItemCard parent={parent} />
              </div>
            ))}
          </div>
        </div>

        {/* RECHARTS ANALYTICS SECTION */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <LineIcon size={16} className="text-slate-800" /> Analisis Realisasi &amp; Tren Aktivitas Tim IT (Tahun {selectedYear})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Chart 1: Recharts Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-hidden" >
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900">Aktivitas per Bulan</h4>
                <p className="text-xs text-slate-600 font-medium">Jumlah aktivitas selesai vs dalam proses per bulan</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={2} barCategoryGap="10%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }} wrapperStyle={{ zIndex: 1000 }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Selesai" fill="#006837" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Berjalan" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Recharts Area Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-hidden" >
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900">Tren Akumulatif Penyelesaian</h4>
                <p className="text-xs text-slate-600 font-medium">Perkembangan kumulatif aktivitas yang telah closed</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAkumulatif" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006837" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#006837" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: '#006837', strokeWidth: 1.5, strokeDasharray: '4 4' }} wrapperStyle={{ zIndex: 1000 }} />
                    <Area type="monotone" dataKey="Akumulatif" stroke="#006837" strokeWidth={3} fillOpacity={1} fill="url(#colorAkumulatif)" dot={{ r: 4, fill: '#006837', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, stroke: '#006837', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 3: Doughnut Chart with Program Group Dropdown Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-hidden" >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Komposisi Status Aktivitas Operasional
                </h4>
                <p className="text-xs text-slate-600 font-medium">Proporsi status aktivitas operasional ({pieStats.total} total)</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-700 shrink-0">Filter Bagian:</span>
                <select
                  value={selectedPieProgram}
                  onChange={(e) => setSelectedPieProgram(e.target.value)}
                  className="neu-btn text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg hover:border-slate-300 transition-all cursor-pointer outline-none"
                >
                  <option value="ALL">Semua Bagian</option>
                  <option value="SISTEM">Sistem</option>
                  <option value="HSSE">HSSE</option>
                  <option value="IT">IT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
              <div className="h-56 relative flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-3xl font-bold text-slate-900 leading-none">{pieStats.rate}%</span>
                  <span className="text-xs font-semibold text-slate-600 mt-1">Closure Rate</span>
                </div>

                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} wrapperStyle={{ zIndex: 1000 }} />
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {pieData.map((item) => {
                  const itemPercent = pieStats.total > 0 ? Math.round((item.value / pieStats.total) * 100) : 0
                  return (
                    <div key={item.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-600 font-medium">{item.value} dari {pieStats.total} Laporan</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{itemPercent}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Workload Section - List Format */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-12 sm:mb-16 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-slate-800" /> Kinerja Penanggung Jawab Aktivitas (PIC) Sub Bagian Sistem &amp; IT ({selectedYear})
            </h3>
            <span className="text-xs font-semibold text-slate-600">{employeeProgress.length} Personel SDM</span>
          </div>

          <div className="space-y-3">
            {employeeProgress.map((emp) => (
              <div
                key={emp.name}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-400 hover:shadow-sm transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight truncate">{emp.name}</h5>
                      <p className="text-xs text-slate-600 font-semibold truncate">{emp.total} Total Laporan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                      {emp.percentage}% Closed
                    </span>
                  </div>
                </div>

                {/* Multi-Segment Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300 flex">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{ width: `${emp.percentage}%` }}
                      title={`Selesai (Closed): ${emp.closed} dari ${emp.total} Laporan (${emp.percentage}%)`}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${emp.progressPct}%` }}
                      title={`On Progress: ${emp.progress} dari ${emp.total} Laporan (${emp.progressPct}%)`}
                    />
                    <div
                      className="h-full bg-emerald-400 transition-all"
                      style={{ width: `${emp.openPct}%` }}
                      title={`Open: ${emp.open} dari ${emp.total} Laporan (${emp.openPct}%)`}
                    />
                  </div>

                  {/* 3 Parameter Indicator (Simple 1 Baris) */}
                  <div className="flex flex-wrap items-center justify-between text-xs sm:text-xs pt-0.5 font-semibold gap-x-2 gap-y-1">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" /> Selesai (Closed): <strong className="text-slate-900">{emp.closed} / {emp.total} ({emp.percentage}%)</strong>
                    </span>
                    <span className="text-amber-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /> On Progress: <strong className="text-slate-900">{emp.progress} / {emp.total} ({emp.progressPct}%)</strong>
                    </span>
                    <span className="text-emerald-800 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> Open: <strong className="text-slate-900">{emp.open} / {emp.total} ({emp.openPct}%)</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (Executive Summary & Quick Action List) */}
      <div className="lg:col-span-1 2xl:col-span-1 min-w-0 space-y-4">
        {/* Card 1: Ringkasan KPI */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Ringkasan Realisasi ({selectedYear})
            </h3>
            <span className="text-xs font-bold text-brand-700">{rate}% Selesai</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-700 rounded-full"
                style={{ width: `${rate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{stats.closed} selesai</span>
              <span>{stats.total} total aktivitas</span>
            </div>
          </div>

          {/* 3 Metric Rows */}
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">Program Kerja Induk</span>
              <span className="font-semibold text-slate-900">{kpi?.totalParents || 0}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">Sub-Program Kerja</span>
              <span className="font-semibold text-slate-900">{kpi?.totalPrograms || 0}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">Dalam Pengerjaan (On Progress)</span>
              <span className="font-semibold text-amber-600">{stats.progress}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">Belum Dimulai (Open)</span>
              <span className="font-semibold text-slate-700">{stats.open}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Kinerja PIC */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">
              Kinerja PIC
            </h4>
            <span className="text-xs text-slate-500">SLA: {slaRate}%</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topPics.map((pic) => (
              <div key={pic.name} className="py-2 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-slate-900 truncate">{pic.name}</p>
                  <p className="text-[11px] text-slate-500">{pic.closed} dari {pic.total} aktivitas</p>
                </div>
                <span className="font-semibold text-slate-700 shrink-0">{pic.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Aktivitas Perlu Perhatian */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">
              Perlu Tindak Lanjut
            </h4>
            <span className="text-xs text-slate-500">{priorityTasks.length} task</span>
          </div>

          <div className="space-y-2">
            {priorityTasks.length > 0 ? (
              priorityTasks.slice(0, 4).map((task: any) => (
                <div key={task.id} className="p-2.5 rounded border border-slate-100 bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 truncate">{task.itemName || task.kategoriProgram}</span>
                    <span className="shrink-0">{task.dueDate || task.startDate}</span>
                  </div>
                  <p className="font-medium text-slate-900 line-clamp-2">{task.kegiatan}</p>
                  <p className="text-[11px] text-slate-500">PIC: {task.picNama}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-2 text-center">Semua tugas berjalan sesuai jadwal.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
