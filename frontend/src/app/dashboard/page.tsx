'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import { TrendingUp, BarChart3, FolderKanban, Activity, CheckCircle2, Clock } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function DashboardPage() {
  const [kpi, setKpi] = useState<any>(null)
  const [parents, setParents] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const yearOptions = useMemo(() => { const c = new Date().getFullYear(); return [c - 2, c - 1, c, c + 1] }, [])

  useEffect(() => {
    Promise.all([api.get('/api/esih/dashboard'), api.get('/api/esih/program-kerja'), api.get('/api/esih/activities')])
      .then(([r1, r2, r3]) => { setKpi(r1.data.kpi); setParents(r2.data.data || []); setActivities(r3.data.data || []); setLoading(false) })
      .catch(console.error)
  }, [])

  const filtered = useMemo(() => activities.filter((a: any) => new Date(a.startDate).getFullYear() === selectedYear && a.isActive), [activities, selectedYear])
  const stats = useMemo(() => {
    const o = filtered.filter((a: any) => a.status === 'Open').length
    const p = filtered.filter((a: any) => a.status === 'On Progress').length
    const c = filtered.filter((a: any) => a.status === 'Closed').length
    return { open: o, progress: p, closed: c, total: o + p + c }
  }, [filtered])

  const monthlyChart = useMemo(() => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    const closed = new Array(12).fill(0), open = new Array(12).fill(0)
    filtered.forEach((a: any) => { const m = new Date(a.startDate).getMonth(); a.status === 'Closed' ? closed[m]++ : open[m]++ })
    return {
      labels, datasets: [
        { label: 'Selesai', data: closed, backgroundColor: '#16a34a', borderRadius: 6, barThickness: 14 },
        { label: 'Berjalan', data: open, backgroundColor: '#e2e8f0', borderRadius: 6, barThickness: 14 },
      ]
    }
  }, [filtered])

  const picChart = useMemo(() => {
    const m: Record<string, number> = {}
    filtered.forEach((a: any) => { const n = a.picNama?.split('/')[0]?.trim() || '?'; m[n] = (m[n] || 0) + 1 })
    const s = Object.entries(m).sort((a, b) => b[1] - a[1])
    return {
      labels: s.map(([n]) => n),
      datasets: [{ label: 'Aktivitas', data: s.map(([, c]) => c), backgroundColor: '#006837', borderRadius: 6, barThickness: 18 }]
    }
  }, [filtered])

  const doughnut = useMemo(() => ({
    labels: ['Open', 'On Progress', 'Selesai'],
    datasets: [{ data: [stats.open, stats.progress, stats.closed], backgroundColor: ['#ef4444', '#f59e0b', '#16a34a'], borderWidth: 0 }]
  }), [stats])

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  const rate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Executive Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Ringkasan performa program & aktivitas tahun {selectedYear}</p>
        </div>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="self-start sm:self-auto px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-500 outline-none">
          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Program Kerja', value: kpi?.totalParents || 0, icon: FolderKanban, color: 'text-brand-700', bg: 'bg-brand-50' },
          { label: 'Item Program', value: kpi?.totalPrograms || 0, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: `Aktivitas (${selectedYear})`, value: stats.total, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Closure Rate', value: `${rate}%`, icon: CheckCircle2, color: 'text-white', bg: 'bg-brand-700', card: 'bg-brand-700 text-white' },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl p-4 shadow-sm border border-slate-100 ${c.card || 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${c.card ? 'bg-white/15' : c.bg} flex items-center justify-center`}><c.icon size={20} className={c.color} /></div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${c.card ? 'text-white/70' : 'text-slate-400'}`}>{c.label}</p>
                <p className={`text-2xl font-bold ${c.card ? '' : 'text-slate-900'}`}>{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Program Kerja Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-brand-700" /> Program Kerja {selectedYear}</h3>
        <div className="grid gap-3">
          {parents.filter(p => p.isActive).map(parent => (
            <div key={parent.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-brand-700 text-white flex items-center justify-center text-xs font-bold">{parent.kode}</span>
                  <span className="font-semibold text-slate-800 text-sm">{parent.namaProgram}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${parent.totalProgress >= 80 ? 'bg-green-500' : parent.totalProgress >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${parent.totalProgress}%` }} /></div>
                  <span className="text-xs font-bold text-slate-600 w-9 text-right">{parent.totalProgress}%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parent.items?.filter((i: any) => i.isActive).map((item: any) => (
                  <span key={item.id} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${item.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-200' : item.status === 'On Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {item.status === 'Closed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    <strong>{item.kode}</strong> {item.namaItem} <span className="text-slate-400 ml-0.5">({item.progress}%)</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3">Analisis {selectedYear}</h3>
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Bar: Monthly */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Aktivitas per Bulan</p>
            <Bar data={monthlyChart} options={{ responsive: true, plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f1f5f9' } } } }} height={90} />
          </div>
          {/* Doughnut: Status */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4 self-start">Distribusi Status</p>
            <div className="w-44"><Doughnut data={doughnut} options={{ responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 12, font: { size: 11 } } } } }} /></div>
            <p className="text-3xl font-extrabold text-brand-700 mt-3">{rate}%</p>
            <p className="text-xs text-slate-400">Closure Rate</p>
          </div>
        </div>

        {/* PIC Chart */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Beban Kerja per PIC</p>
          <Bar data={picChart} options={{ indexAxis: 'y' as const, responsive: true, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f1f5f9' } }, y: { grid: { display: false }, ticks: { font: { size: 12, weight: 'bold' as const } } } } }} height={50} />
        </div>
      </div>
    </div>
  )
}
