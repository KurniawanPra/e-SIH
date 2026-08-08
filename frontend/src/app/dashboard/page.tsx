'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { api } from '@/lib/api'
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
  Target,
  Trophy,
  ShieldCheck
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
  CartesianGrid
} from 'recharts'

// Individual Scrollable Program Kerja Card Component
function ProgramKerjaItemCard({ parent }: { parent: any }) {
  const scrollRef = useRef<HTMLDivElement>(null)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200 min-w-0 overflow-hidden">
        {/* Letter A B C + Title */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1 overflow-hidden">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none shrink-0 pt-0.5">
            {parent.kode}
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug truncate">{parent.namaProgram}</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{activeItems.length} Item Program Kerja</p>
          </div>
        </div>

        {/* Progress Bar Indicator */}
        <div className="flex items-center gap-3 w-full md:w-56 shrink-0 self-end md:self-auto">
          <div className="flex-1 bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                parent.totalProgress >= 80 ? 'bg-emerald-600' : parent.totalProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${parent.totalProgress}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 min-w-[36px] text-right shrink-0">{parent.totalProgress}%</span>
        </div>
      </div>

      {/* Sub-items Area with Scroll Controls */}
      <div className="relative pt-4 w-full max-w-full overflow-hidden">
        {/* Scroll Buttons Header if > 3 items */}
        {isScrollable && (
          <div className="flex items-center justify-end mb-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => scroll('left')}
                className="w-7 h-7 rounded-full bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors"
                title="Geser Kiri"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-7 h-7 rounded-full bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors"
                title="Geser Kanan"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Items Container with Realistic Progressive Blur & Smooth Transitions */}
        <div className="relative w-full max-w-full overflow-hidden">
          {/* Left Progressive Edge Blur Overlay */}
          {isScrollable && (
            <div className={`edge-blur-left ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
          )}

          {/* Right Progressive Edge Blur Overlay */}
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
                className={`p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between hover:bg-white hover:border-slate-800 transition-all shadow-2xs ${
                  isScrollable ? 'w-[240px] sm:w-[260px] shrink-0' : 'w-full'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.status === 'Closed' ? 'bg-emerald-600' : item.status === 'On Progress' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    {item.kode}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    item.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : item.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-xs leading-snug mb-3 truncate">{item.namaItem}</p>
                
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.progress === 100 ? 'bg-emerald-600' : 'bg-slate-700'}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 shrink-0">{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<any>(null)
  const [parents, setParents] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const yearOptions = useMemo(() => {
    const yearsSet = new Set<number>()
    const current = new Date().getFullYear()
    yearsSet.add(current - 1)
    yearsSet.add(current)
    yearsSet.add(current + 1)

    activities.forEach((a: any) => {
      if (a.startDate) {
        const y = new Date(a.startDate).getFullYear()
        if (!isNaN(y)) yearsSet.add(y)
      }
    })

    return Array.from(yearsSet).sort((a, b) => a - b)
  }, [activities])

  useEffect(() => {
    Promise.all([
      api.get('/api/esih/dashboard'),
      api.get('/api/esih/program-kerja'),
      api.get('/api/esih/activities')
    ])
      .then(([r1, r2, r3]) => {
        setKpi(r1.data.kpi)
        setParents(r2.data.data || [])
        setActivities(r3.data.data || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const filtered = useMemo(() => {
    return activities.filter((a: any) => {
      if (!a.startDate || !a.isActive) return false
      const year = new Date(a.startDate).getFullYear()
      return year === selectedYear
    })
  }, [activities, selectedYear])

  const stats = useMemo(() => {
    const o = filtered.filter((a: any) => a.status === 'Open').length
    const p = filtered.filter((a: any) => a.status === 'On Progress').length
    const c = filtered.filter((a: any) => a.status === 'Closed').length
    return { open: o, progress: p, closed: c, total: o + p + c }
  }, [filtered])

  const rate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return months.map((month, index) => {
      const closed = filtered.filter((a: any) => new Date(a.startDate).getMonth() === index && a.status === 'Closed').length
      const open = filtered.filter((a: any) => new Date(a.startDate).getMonth() === index && a.status !== 'Closed').length
      return { month, Selesai: closed, Berjalan: open }
    })
  }, [filtered])

  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return months.map((month, index) => {
      const closedAccumulated = filtered.filter((a: any) => {
        const d = new Date(a.closedDate || a.startDate)
        return d.getMonth() <= index && a.status === 'Closed'
      }).length
      return { month, Akumulatif: closedAccumulated }
    })
  }, [filtered])

  const pieData = useMemo(() => [
    { name: 'Selesai (Closed)', value: stats.closed, color: '#006837' },
    { name: 'On Progress', value: stats.progress, color: '#f59e0b' },
    { name: 'Open', value: stats.open, color: '#dc2626' },
  ], [stats])

  // Right Sidebar Chart Data: Realisasi Selesai per Kuartal (Q1 - Q4)
  const quarterlyData = useMemo(() => {
    const quarters = [
      { name: 'Q1', Selesai: 0 },
      { name: 'Q2', Selesai: 0 },
      { name: 'Q3', Selesai: 0 },
      { name: 'Q4', Selesai: 0 },
    ]
    filtered.forEach((a: any) => {
      if (a.status === 'Closed') {
        const m = new Date(a.startDate).getMonth()
        const qIdx = Math.floor(m / 3)
        if (quarters[qIdx]) quarters[qIdx].Selesai++
      }
    })
    return quarters
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

  const topPics = useMemo(() => employeeProgress.slice(0, 3), [employeeProgress])

  // Custom Recharts Tooltip with High Z-Index & Zoom Animation
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip-zoom bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
          <p className="font-extrabold text-slate-300 border-b border-slate-700 pb-1 mb-1">Bulan {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 font-semibold">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-extrabold text-white">{entry.value} Aktivitas</span>
            </div>
          ))}
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 items-start w-full max-w-full overflow-hidden">
      {/* LEFT MAIN CONTENT AREA */}
      <div className="lg:col-span-2 2xl:col-span-3 min-w-0 space-y-6 overflow-hidden">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Sistem Laporan Highlight &amp; Monitoring Kinerja Program Operasional</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700">Tahun:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3.5 py-1.5 rounded-xl border-2 border-slate-300 text-xs font-extrabold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-slate-400 outline-none cursor-pointer"
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
            {parents.filter(p => p.isActive).map(parent => (
              <ProgramKerjaItemCard key={parent.id} parent={parent} />
            ))}
          </div>
        </div>

        {/* RECHARTS ANALYTICS SECTION */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <LineIcon size={16} className="text-slate-800" /> Analisis Realisasi &amp; Tren Aktivitas (Tahun {selectedYear})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Chart 1: Recharts Bar Chart */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 overflow-hidden">
              <div className="mb-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Aktivitas per Bulan</h4>
                <p className="text-[11px] text-slate-500 font-medium">Jumlah aktivitas selesai vs dalam proses per bulan</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={0} barCategoryGap="20%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }} wrapperStyle={{ zIndex: 1000 }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Selesai" fill="#006837" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Berjalan" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Recharts Area Chart */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 overflow-hidden">
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

          {/* Chart 3: Doughnut Chart (High Z-Index Tooltip) */}
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 overflow-hidden">
            <div className="mb-4">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Komposisi Status Aktivitas</h4>
              <p className="text-[11px] text-slate-500 font-medium">Rincian proporsi status aktivitas operasional ({stats.total} total)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
              <div className="h-56 relative flex items-center justify-center">
                {/* Center Overlay Text Cleanly Positioned behind tooltip */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-3xl font-black text-slate-900 leading-none">{rate}%</span>
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
                  const itemPercent = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0
                  return (
                    <div key={item.name} className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{item.value} dari {stats.total} Laporan</p>
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

        {/* Employee Workload Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Users size={16} className="text-slate-800" /> Kinerja Penanggung Jawab Aktivitas (PIC) ({selectedYear})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {employeeProgress.map((emp) => (
              <div key={emp.name} className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-4 hover:border-slate-800 transition-all overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate">{emp.name}</h5>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{emp.total} Total Laporan</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 shrink-0">
                    {emp.percentage}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        emp.percentage >= 80 ? 'bg-emerald-600' : emp.percentage >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${emp.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 pt-1 font-bold">
                    <span className="text-emerald-700">{emp.closed} Selesai</span>
                    <span className="text-amber-600">{emp.progress} Berjalan</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (Perfectly level with Executive Dashboard card, 0 margin) */}
      <div className="lg:col-span-1 2xl:col-span-1 min-w-0 space-y-4 mt-0">
        {/* Card 1: Overall Program Kerja & Target Kuartal */}
        <div className="bg-white rounded-2xl border-2 border-brand-700 shadow-md p-5 space-y-5">
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

          {/* Additional Statistical Chart: Target Selesai per Kuartal */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Target size={14} className="text-brand-700" /> Target Selesai per Kuartal
              </p>
              <span className="text-[10px] font-bold text-slate-400">Q1-Q4</span>
            </div>
            <div className="h-36 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} wrapperStyle={{ zIndex: 1000 }} />
                  <Bar dataKey="Selesai" fill="#006837" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Status Aktivitas</p>
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

        {/* Card 2: Peringkat Top Performers (Fills bottom height perfectly to match Kinerja PIC) */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> Top Performer PIC
            </h4>
            <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
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
            <span className="font-black text-emerald-700">96.8%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
