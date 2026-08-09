'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { api, getCurrentUser } from '@/lib/api'
import {
  TrendingUp,
  BarChart3,
  FolderKanban,
  Activity,
  CheckCircle2,
  Clock,
  Users,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Target,
  Trophy,
  ShieldCheck,
  Zap,
  Timer,
  Layers,
  UserCheck,
  CalendarDays,
  Cpu,
  HeartPulse
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
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import type { SessionUser } from '@/types/auth'
import { useYear } from '@/context/YearContext'

// Individual Scrollable Program Kerja Card Component
function ProgramKerjaItemCard({ parent }: { parent: any }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const activeItems = useMemo(() => parent.items?.filter((i: any) => i.isActive) || [], [parent])
  const isScrollable = activeItems.length > 3

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
    <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-4 sm:p-5 hover:border-slate-400 transition-all overflow-hidden w-full max-w-full">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 min-w-0 overflow-hidden">
        {/* Letter A B C + Title */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1 overflow-hidden">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none shrink-0 pt-0.5">
            {parent.kode}
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug truncate">{parent.namaProgram}</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{activeItems.length} Item Sub-Program Kerja</p>
          </div>
        </div>

        {/* Progress Bar & Expand/Collapse Toggle Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 self-end md:self-auto">
          <div className="flex items-center gap-2.5 min-w-[180px] sm:min-w-[220px]">
            <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  parent.totalProgress >= 80 ? 'bg-emerald-600' : parent.totalProgress >= 50 ? 'bg-brand-700' : 'bg-amber-500'
                }`}
                style={{ width: `${parent.totalProgress}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 min-w-[36px] text-right shrink-0">{parent.totalProgress}%</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all cursor-pointer shrink-0"
            title={isExpanded ? 'Ringkas' : 'Detail'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Collapsible Sub-items Area */}
      {isExpanded && (
        <div className="relative pt-4 w-full max-w-full overflow-hidden animate-fade-in-up">
          {/* Scroll Buttons Header if > 3 items */}
          {isScrollable && (
            <div className="flex items-center justify-end mb-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => scroll('left')}
                  className="w-7 h-7 rounded-full neu-btn text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Geser Kiri"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="w-7 h-7 rounded-full neu-btn text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Geser Kanan"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Items Container */}
          <div className="relative w-full max-w-full overflow-hidden">
            {isScrollable && (
              <div className={`edge-blur-left ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
            )}
            {isScrollable && (
              <div className={`edge-blur-right ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />
            )}

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className={
                isScrollable
                  ? 'flex overflow-x-auto gap-3 pb-2 scrollbar-none scroll-smooth w-full'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full'
              }
            >
              {activeItems.map((item: any) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between hover:bg-white hover:border-slate-800 transition-all shadow-2xs gap-2.5 ${
                    isScrollable ? 'w-[240px] sm:w-[260px] shrink-0' : 'w-full'
                  }`}
                >
                  {/* 1. Nama Item Sub */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">{item.kode}</span>
                    <h5 className="font-extrabold text-slate-900 text-xs leading-tight truncate">{item.namaItem}</h5>
                  </div>

                  {/* 2. Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.progress >= 80 ? 'bg-emerald-600' : item.progress >= 50 ? 'bg-brand-700' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-slate-900 shrink-0">{item.progress}%</span>
                  </div>

                  {/* 3. Status Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold">Status Progress</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${
                      item.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : item.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { selectedYear, availableYears } = useYear()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [kpi, setKpi] = useState<any>(null)
  const [parents, setParents] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL')
  const [selectedPieProgram, setSelectedPieProgram] = useState<string>('ALL')

  const yearOptions = availableYears

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/api/esih/dashboard?year=${selectedYear}`),
      api.get(`/api/esih/program-kerja?year=${selectedYear}`),
      api.get(`/api/esih/activities?year=${selectedYear}`)
    ])
      .then(([r1, r2, r3]) => {
        setKpi(r1.data.kpi)
        setParents(r2.data.data || [])
        setActivities(r3.data.data || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
  }, [selectedYear])

  const filtered = useMemo(() => {
    return activities.filter((a: any) => {
      if (!a.startDate || !a.isActive) return false
      const year = new Date(a.startDate).getFullYear()
      return year === selectedYear
    })
  }, [activities, selectedYear])

  // Staff IT Personal Activities
  const myActivities = useMemo(() => {
    if (!user?.name) return filtered
    return filtered.filter((a: any) => {
      const picName = a.picNama?.split('/')[0]?.trim() || ''
      return picName.toLowerCase() === user.name.toLowerCase()
    })
  }, [filtered, user])

  // Filter only tasks that are still open/active (excluding Closed)
  const myOpenActivities = useMemo(() => {
    return myActivities.filter((a: any) => a.status !== 'Closed')
  }, [myActivities])

  const myStats = useMemo(() => {
    const o = myActivities.filter((a: any) => a.status === 'Open').length
    const p = myActivities.filter((a: any) => a.status === 'On Progress').length
    const c = myActivities.filter((a: any) => a.status === 'Closed').length
    return { open: o, progress: p, closed: c, total: o + p + c }
  }, [myActivities])

  const myRate = myStats.total > 0 ? Math.round((myStats.closed / myStats.total) * 100) : 0

  const stats = useMemo(() => {
    const o = filtered.filter((a: any) => a.status === 'Open').length
    const p = filtered.filter((a: any) => a.status === 'On Progress').length
    const c = filtered.filter((a: any) => a.status === 'Closed').length
    return { open: o, progress: p, closed: c, total: o + p + c }
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
      const open = filtered.filter((a: any) => new Date(a.startDate).getMonth() === index && a.status !== 'Closed').length
      return { month, Selesai: closed, Berjalan: open }
    })
  }, [filtered])

  const myChartData = useMemo(() => {
    if (selectedMonth === 'ALL') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
      return months.map((month, index) => {
        const closed = myActivities.filter((a: any) => {
          if (!a.startDate) return false
          const d = new Date(a.startDate)
          return d.getFullYear() === selectedYear && d.getMonth() === index && a.status === 'Closed'
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
          if (!a.startDate) return false
          const d = new Date(a.startDate)
          const day = d.getDate()
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && day >= w.startDay && day <= w.endDay && a.status === 'Closed'
        }).length
        return { label: w.label, month: w.label, Selesai: closed }
      })
    }
  }, [myActivities, selectedYear, selectedMonth])

  const myFilteredActivities = useMemo(() => {
    return myActivities.filter((a: any) => {
      if (!a.startDate) return false
      const d = new Date(a.startDate)
      if (d.getFullYear() !== selectedYear) return false
      if (selectedMonth !== 'ALL' && d.getMonth() !== selectedMonth) return false
      return true
    })
  }, [myActivities, selectedYear, selectedMonth])

  const chartStats = useMemo(() => {
    const realClosed = myFilteredActivities.filter((a: any) => a.status === 'Closed').length
    const realProgress = myFilteredActivities.filter((a: any) => a.status === 'On Progress').length
    const realOpen = myFilteredActivities.filter((a: any) => a.status === 'Open').length
    const realTotal = realClosed + realProgress + realOpen
    const rate = realTotal > 0 ? Math.round((realClosed / realTotal) * 100) : 0
    const high = Math.max(...myChartData.map(d => d.Selesai), 0)
    const low = Math.min(...myChartData.map(d => d.Selesai), 0)
    return { closed: realClosed, progress: realProgress, open: realOpen, total: realTotal, rate, high, low }
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
      const kat = a.kategoriProgram || ''
      const progId = a.idProgram || ''
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
    const picMap: Record<string, { total: number; closed: number; progress: number }> = {}

    filtered.forEach((a: any) => {
      const name = a.picNama?.split('/')[0]?.trim() || 'Unassigned'
      if (!picMap[name]) {
        picMap[name] = { total: 0, closed: 0, progress: 0 }
      }
      picMap[name].total += 1
      if (a.status === 'Closed') picMap[name].closed += 1
      if (a.status === 'On Progress') picMap[name].progress += 1
    })

    return Object.entries(picMap).map(([name, data]) => {
      const percentage = data.total > 0 ? Math.round((data.closed / data.total) * 100) : 0
      return { name, ...data, percentage }
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
        <div className="chart-tooltip-zoom bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 border-2 border-slate-700">
          <p className="font-black text-slate-300 border-b border-slate-700 pb-1 mb-1 text-[11px] uppercase tracking-wider">Bulan {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-5 font-extrabold">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-black text-white">{entry.value} Aktivitas</span>
            </div>
          ))}
          {payload.length > 1 && (
            <div className="pt-1.5 border-t border-slate-700 flex items-center justify-between text-xs font-black text-emerald-400">
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
          <p className="font-extrabold text-slate-300 border-b border-slate-700 pb-1 mb-1">Sampai Bulan {label}</p>
          <p className="font-extrabold text-emerald-400 text-sm">{payload[0].value} Total Aktivitas Selesai</p>
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="chart-tooltip-zoom bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl text-xs border-2 border-slate-700">
          <p className="font-bold flex items-center gap-1.5" style={{ color: data.payload.color }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            {data.name}
          </p>
          <p className="font-extrabold text-white text-base mt-1">{data.value} Aktivitas</p>
        </div>
      )
    }
    return null
  }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  const isUserRole = user?.role === 'USER'

  // =========================================================================
  // VIEW FOR STAFF USER (Role: USER) — Concise, Personal Task Dashboard
  // =========================================================================
  if (isUserRole) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <UserCheck className="text-brand-700" size={24} /> Dashboard Staff IT &amp; Sistem Operational
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Selamat datang, <strong className="text-slate-900">{user?.name}</strong> ({user?.jabatan || 'Staff IT'}). Berikut ringkasan tugas aktivitas Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-900 neu-select outline-none cursor-pointer"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* 3 Personal KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: My Total Tasks */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-2 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Laporan Aktivitas Saya</p>
            <div className="text-4xl font-black text-slate-900">{myStats.total}</div>
            <p className="text-xs font-semibold text-slate-600">Ditugaskan pada tahun {selectedYear}</p>
          </div>

          {/* Card 2: My Closure Rate */}
          <div className="bg-brand-50/80 p-5 rounded-2xl border-2 border-brand-200 shadow-sm space-y-2 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
            <p className="text-xs font-black text-brand-800 uppercase tracking-wider">Realisasi Selesai (Closure Rate)</p>
            <div className="text-4xl font-black text-brand-700">{myRate}%</div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-brand-200">
              <div className="h-full bg-brand-700 rounded-full" style={{ width: `${myRate}%` }} />
            </div>
            <p className="text-xs font-bold text-slate-700 pt-1">
              <strong className="text-brand-800">{myStats.closed}</strong> dari <strong className="text-brand-800">{myStats.total}</strong> Selesai
            </p>
          </div>

          {/* Card 3: My Status Breakdown */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-2.5 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Status Tugas Saya</p>
            <div className="space-y-1.5 text-xs font-bold">
              <div className="flex justify-between text-emerald-700">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} /> Selesai (Closed)</span>
                <span className="font-black">{myStats.closed}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span className="flex items-center gap-1.5"><Clock size={13} /> On Progress</span>
                <span className="font-black">{myStats.progress}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="flex items-center gap-1.5"><Activity size={13} /> Open</span>
                <span className="font-black">{myStats.open}</span>
              </div>
            </div>
          </div>
        </div>

        {/* White Theme Line Chart with Year & Month Dropdowns */}
        <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-lg p-6 space-y-5 animate-fade-in-up mb-12 sm:mb-16" style={{ animationDelay: '320ms' }}>
          {/* Header & Year/Month Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <LineIcon size={18} className="text-brand-700" /> Realisasi Penyelesaian Aktivitas Saya
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Grafik tren realisasi tugas selesai per {selectedMonth === 'ALL' ? 'Bulan (Jan - Des)' : 'Minggu (Sprint)'}
              </p>
            </div>

            {/* Year & Month Dropdowns */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-900 neu-select outline-none cursor-pointer border border-slate-300"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>

              <select
                value={selectedMonth === 'ALL' ? 'ALL' : selectedMonth}
                onChange={e => setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-brand-800 bg-brand-50 neu-select outline-none cursor-pointer border border-brand-200"
              >
                <option value="ALL">Semua Bulan (Jan - Des)</option>
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grow space-y-4">
            {/* Real Stats Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{chartStats.closed} Task</span>
                <div className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200 text-xs font-extrabold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{chartStats.rate}%</span>
                  <span className="text-slate-500 font-normal ml-0.5">Closure Rate</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-amber-600" /> Dalam Proses: <strong className="text-amber-700">{chartStats.progress + chartStats.open} Task</strong>
                </span>
                <span>
                  High: <strong className="text-sky-600 font-black">{chartStats.high} Task</strong>
                </span>
                <span>
                  Low: <strong className="text-amber-600 font-black">{chartStats.low} Task</strong>
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
                  <pattern id="dotGridLight" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="#cbd5e1" fillOpacity="0.5" />
                  </pattern>
                  <filter id="lineGlowLight" x="-100%" y="-100%" width="300%" height="300%">
                    <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="rgba(0, 104, 55, 0.35)" />
                  </filter>
                </defs>

                <rect x="0" y="0" width="100%" height="100%" fill="url(#dotGridLight)" style={{ pointerEvents: 'none' }} />

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
                        <div className="bg-slate-900 text-white border-2 border-slate-700 rounded-xl p-3 shadow-2xl space-y-1 text-xs font-extrabold z-[1000]">
                          <div className="text-slate-400 font-bold mb-1">{data.label}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-emerald-400">{data.Selesai} Task Selesai</span>
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
                  strokeWidth={3.5}
                  filter="url(#lineGlowLight)"
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
      </div>
    )
  }

  // =========================================================================
  // VIEW FOR ADMIN / KEPALA UNIT ORGANISASI SUB BAGIAN SISTEM & IT (Role: ADMIN) — Comprehensive Executive Dashboard
  // =========================================================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 items-start w-full max-w-full overflow-hidden">
      {/* LEFT MAIN CONTENT AREA */}
      <div className="lg:col-span-2 2xl:col-span-3 min-w-0 space-y-6 overflow-hidden">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm animate-fade-in-up">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Executive Dashboard Kepala Unit Organisasi Sub Bagian Sistem &amp; IT</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Sistem Laporan Highlight &amp; Monitoring Kinerja Sub Bagian Sistem &amp; IT Operational</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700">Tahun:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-900 neu-select outline-none cursor-pointer"
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
          <div className="grid gap-4 w-full">
            {parents.filter(p => p.isActive).map((parent, index) => (
              <div key={parent.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index * 90, 450)}ms` }}>
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
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="mb-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Aktivitas per Bulan</h4>
                <p className="text-[11px] text-slate-500 font-medium">Jumlah aktivitas selesai vs dalam proses per bulan</p>
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
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 overflow-hidden animate-fade-in-up" style={{ animationDelay: '240ms' }}>
              <div className="mb-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Tren Akumulatif Penyelesaian</h4>
                <p className="text-[11px] text-slate-500 font-medium">Perkembangan kumulatif aktivitas yang telah closed</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAkumulatif" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006837" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#006837" stopOpacity={0.0}/>
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
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 overflow-hidden animate-fade-in-up" style={{ animationDelay: '330ms' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  Komposisi Status Aktivitas Operasional
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">Proporsi status aktivitas operasional ({pieStats.total} total)</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-700 shrink-0">Filter Program:</span>
                <select
                  value={selectedPieProgram}
                  onChange={(e) => setSelectedPieProgram(e.target.value)}
                  className="neu-btn text-xs font-extrabold text-slate-800 bg-slate-50 border-2 border-slate-300 px-3 py-1.5 rounded-xl hover:border-slate-800 transition-all cursor-pointer outline-none"
                >
                  <option value="ALL">Semua Kelompok Program</option>
                  <option value="A">Prog A - Digital &amp; IT Infra</option>
                  <option value="B">Prog B - Audit &amp; ISO Halal</option>
                  <option value="C">Prog C - HSE &amp; Safety Drill</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
              <div className="h-56 relative flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-3xl font-black text-slate-900 leading-none">{pieStats.rate}%</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Closure Rate</span>
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
                    <div key={item.name} className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{item.value} dari {pieStats.total} Laporan</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-900">{itemPercent}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Workload Section - List Format */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 mb-12 sm:mb-16 space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-slate-800" /> Kinerja Penanggung Jawab Aktivitas (PIC) Sub Bagian Sistem &amp; IT ({selectedYear})
            </h3>
            <span className="text-xs font-extrabold text-slate-500">{employeeProgress.length} Personel SDM</span>
          </div>

          <div className="space-y-3">
            {employeeProgress.map((emp) => (
              <div
                key={emp.name}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-400 hover:shadow-sm transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate">{emp.name}</h5>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">{emp.total} Total Laporan ({emp.closed} Selesai, {emp.progress} Berjalan)</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 inline-block">
                      {emp.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300 flex">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{ width: `${emp.percentage}%` }}
                      title={`${emp.closed} Selesai (${emp.percentage}%)`}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${emp.total > 0 ? Math.round((emp.progress / emp.total) * 100) : 0}%` }}
                      title={`${emp.progress} Berjalan`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] pt-0.5 font-extrabold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" /> {emp.closed} Selesai ({emp.percentage}%)
                    </span>
                    <span className="text-amber-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /> {emp.progress} Berjalan ({emp.total > 0 ? Math.round((emp.progress / emp.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (Perfectly level with Executive Dashboard card, mt-0) */}
      <div className="lg:col-span-1 2xl:col-span-1 min-w-0 space-y-4 mt-0">
        {/* Card 1: Overall Program Kerja, Target Kuartal & Lead Time SLA */}
        <div className="bg-white rounded-2xl border-2 border-brand-700 shadow-md p-5 space-y-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
              Overall Program Kerja ({selectedYear})
            </h3>
          </div>

          {/* Closure Rate Card */}
          <div className="bg-brand-50/70 rounded-xl p-4 border-2 border-brand-200 text-center space-y-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-800">Total Closure Rate</p>
            <div className="text-4xl font-black text-brand-700 tracking-tight py-1">{rate}%</div>
            <p className="text-xs font-bold text-slate-700">
              <strong className="text-brand-800">{stats.closed}</strong> dari <strong className="text-brand-800">{stats.total}</strong> Aktivitas Selesai
            </p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3 border border-brand-200">
              <div className="h-full bg-brand-700 rounded-full transition-all" style={{ width: `${rate}%` }} />
            </div>
          </div>

          {/* Metric 1: Program Kerja */}
          <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-900">Program Kerja</p>
              <p className="text-[11px] text-slate-500 font-medium">Kelompok Induk</p>
            </div>
            <span className="text-2xl font-black text-slate-900">{kpi?.totalParents || 0}</span>
          </div>

          {/* Metric 2: Item Program */}
          <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-900">Item Program</p>
              <p className="text-[11px] text-slate-500 font-medium">Sub-Program Kerja</p>
            </div>
            <span className="text-2xl font-black text-slate-900">{kpi?.totalPrograms || 0}</span>
          </div>

          {/* Metric 3: Aktivitas */}
          <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Aktivitas ({selectedYear})</p>
              <p className="text-[11px] text-slate-500 font-medium">Total Laporan Aktivitas</p>
            </div>
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
          </div>

          {/* Executive Chart 1: Pencapaian Volume Aktivitas per Program */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                Realisasi Task per Kelompok Program
              </p>
              <span className="text-[10px] font-bold text-slate-400 shrink-0">A, B, C</span>
            </div>
            <ChartContainer
              config={{
                Selesai: { label: 'Selesai', color: '#006837' },
                Berjalan: { label: 'Berjalan', color: '#f59e0b' }
              }}
              className="aspect-auto h-[180px] w-full"
            >
              <BarChart accessibilityLayer data={groupTaskVolumeData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="program" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="Selesai" fill="var(--color-Selesai)" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Berjalan" fill="var(--color-Berjalan)" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Executive Chart 2: Monitoring Status Kendala & Operasional */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                Status Penanganan &amp; Kendala
              </p>
              <span className="text-[10px] font-bold text-slate-400 shrink-0">Operasional</span>
            </div>
            <ChartContainer
              config={{
                Jumlah: { label: 'Aktivitas', color: '#0284c7' }
              }}
              className="aspect-auto h-[180px] w-full"
            >
              <BarChart accessibilityLayer data={kendalaStatusData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="Jumlah" fill="var(--color-Jumlah)" radius={4} maxBarSize={32} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Status Breakdown */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Status Aktivitas Operasional</p>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-700" /> Selesai (Closed)
              </span>
              <span className="font-extrabold text-brand-700">{stats.closed}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> On Progress
              </span>
              <span className="font-extrabold text-amber-600">{stats.progress}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Open
              </span>
              <span className="font-extrabold text-red-600">{stats.open}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Peringkat Top Performers */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
              Top Performer PIC
            </h4>
            <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 shrink-0">
              High Realization
            </span>
          </div>

          <div className="space-y-3">
            {topPics.map((pic, idx) => (
              <div key={pic.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                    idx === 0 ? 'bg-amber-400 text-slate-900' : idx === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-white'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-slate-900 truncate">{pic.name}</p>
                    <p className="text-[10px] text-slate-500">{pic.closed} Aktivitas Selesai</p>
                  </div>
                </div>
                <span className="text-xs font-black text-brand-700 shrink-0">{pic.percentage}%</span>
              </div>
            ))}
          </div>

          {/* Mini SLA Compliance Indicator */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-bold">
              <ShieldCheck size={14} className="text-emerald-600" /> Kepatuhan Target SLA
            </span>
            <span className="font-black text-emerald-700">{slaRate}%</span>
          </div>
        </div>

        {/* CARD 3: Prioritas Utama & Highlight Penanganan Operasional */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 border-b border-slate-200">
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
              Prioritas &amp; Highlight Penanganan
            </h4>
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 self-start sm:self-auto shrink-0">
              Needs Follow-Up
            </span>
          </div>

          <div className="space-y-3">
            {priorityTasks.length > 0 ? (
              priorityTasks.map((task: any) => (
                <div key={task.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:bg-white hover:border-slate-400 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-600 truncate">{task.itemName || task.kategoriProgram}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shrink-0 ${
                      task.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2">{task.kegiatan}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200">
                    <span className="truncate">PIC: <strong>{task.picNama}</strong></span>
                    <span className="shrink-0 font-bold text-slate-700">{task.startDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-medium text-center py-4">Seluruh aktivitas berjalan sesuai target SLA.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
