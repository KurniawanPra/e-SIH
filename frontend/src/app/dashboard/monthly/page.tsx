'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import {
  CalendarRange,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  User,
  Plus,
  X,
  FileSpreadsheet,
  Download,
  Award
} from 'lucide-react'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function MonthlyActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [itemPrograms, setItemPrograms] = useState<any[]>([])
  const [parentPrograms, setParentPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Selected Month & Year
  const currentMonthIdx = new Date().getMonth() + 1
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // Filters
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    idProgram: '',
    kegiatan: '',
    descriptionAction: '',
    startDate: '',
    dueDate: '',
    status: 'On Progress',
    picNama: '',
    picEmail: '',
    remarks: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get('/api/esih/activities'),
        api.get('/api/esih/programs'),
        api.get('/api/esih/program-kerja')
      ])
      setActivities(r1.data.data || [])
      setItemPrograms(r2.data.data || [])
      setParentPrograms(r3.data.data || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // Filtered by selected year and month
  const monthActivities = useMemo(() => {
    return activities.filter((a: any) => {
      if (!a.startDate) return false
      const d = new Date(a.startDate)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      return m === selectedMonth && y === selectedYear
    })
  }, [activities, selectedMonth, selectedYear])

  // Unique PICs who actually uploaded activities in selected month
  const availablePics = useMemo(() => {
    const picSet = new Set<string>()
    monthActivities.forEach((a: any) => {
      const name = a.picNama?.split('/')[0]?.trim()
      if (name) picSet.add(name)
    })
    return Array.from(picSet).sort()
  }, [monthActivities])

  // Filtered activities based on Search, User Filter, and Status Filter
  const filteredActivities = useMemo(() => {
    return monthActivities.filter((a: any) => {
      if (userFilter !== 'ALL') {
        const picName = a.picNama?.split('/')[0]?.trim() || ''
        if (picName.toLowerCase() !== userFilter.toLowerCase()) return false
      }

      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false

      if (search.trim()) {
        const q = search.toLowerCase()
        const matchKegiatan = a.kegiatan?.toLowerCase().includes(q)
        const matchDesc = a.descriptionAction?.toLowerCase().includes(q)
        const matchPic = a.picNama?.toLowerCase().includes(q)
        const matchItem = a.itemName?.toLowerCase().includes(q)
        if (!matchKegiatan && !matchDesc && !matchPic && !matchItem) return false
      }

      return true
    })
  }, [monthActivities, userFilter, statusFilter, search])

  // Calculate Overall System Stats vs Filtered Month Stats
  const totalCount = activities.length
  const openCount = activities.filter((a: any) => a.status === 'Open').length
  const progressCount = activities.filter((a: any) => a.status === 'On Progress').length
  const closedCount = activities.filter((a: any) => a.status === 'Closed').length
  const closureRate = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0

  const handleExportExcel = () => {
    if (filteredActivities.length === 0) {
      alert('Tidak ada data laporan bulanan untuk di-export.')
      return
    }

    const headers = [
      'No',
      'Program Kerja Induk',
      'Sub-Item Program',
      'Action / Kegiatan Highlight',
      'Target Due Date',
      'Status Aktivitas',
      'Penanggung Jawab (PIC IT)'
    ]

    const rows = filteredActivities.map((a, idx) => [
      idx + 1,
      `"${(a.program?.programKerja?.kode || '')} - ${(a.program?.programKerja?.namaProgram || '').replace(/"/g, '""')}"`,
      `"${(a.program?.kode || '')} - ${(a.itemName || '').replace(/"/g, '""')}"`,
      `"${(a.kegiatan || a.descriptionAction || '').replace(/"/g, '""')}"`,
      a.dueDate || '',
      a.status || '',
      `"${(a.picNama || '').replace(/"/g, '""')}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `e-SIH_Monthly_Highlight_${MONTH_NAMES[selectedMonth - 1]}_2026.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openAdd = () => {
    const today = new Date().toISOString().split('T')[0]
    setForm({
      idProgram: itemPrograms[0]?.id || '',
      kegiatan: '',
      descriptionAction: '',
      startDate: today,
      dueDate: today,
      status: 'On Progress',
      picNama: '',
      picEmail: '',
      remarks: ''
    })
    setShowModal(true)
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/esih/activities', form)
      setShowModal(false)
      fetchAll()
    } catch {
      alert('Gagal menyimpan laporan bulanan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarRange className="text-brand-700" size={24} /> Monthly Report (Highlight Digest)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Rekapitulasi Highlight Kinerja Operasional Sub Bagian Sistem &amp; IT
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 neu-btn-emerald font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 neu-btn-brand font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus size={16} /> Tambah Aktivitas
          </button>
        </div>
      </div>

      {/* Sleek Large Badge Pills Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Badge 1: Total Action */}
        <div className="bg-white rounded-full border-2 border-slate-300 shadow-2xs px-4 py-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Total Action</span>
          <span className="text-lg sm:text-xl font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-300 shrink-0">
            {totalCount}
          </span>
        </div>

        {/* Badge 2: Open Tasks */}
        <div className="bg-white rounded-full border-2 border-red-200 shadow-2xs px-4 py-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-black uppercase text-red-600 tracking-wider flex items-center gap-1.5">
            <AlertCircle size={14} className="text-red-500" /> Open Tasks
          </span>
          <span className="text-lg sm:text-xl font-black text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 shrink-0">
            {openCount}
          </span>
        </div>

        {/* Badge 3: On Progress */}
        <div className="bg-white rounded-full border-2 border-amber-200 shadow-2xs px-4 py-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-amber-500" /> On Progress
          </span>
          <span className="text-lg sm:text-xl font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shrink-0">
            {progressCount}
          </span>
        </div>

        {/* Badge 4: Closure Rate */}
        <div className="neu-active-green rounded-full border-2 border-brand-800 shadow-sm px-4 py-2 flex items-center justify-between gap-3 text-white">
          <span className="text-[11px] font-black uppercase text-white/90 tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-300" /> Closure Rate
          </span>
          <span className="text-lg sm:text-xl font-black text-white bg-white/20 px-3 py-1 rounded-full border border-white/30 shrink-0">
            {closureRate}%
          </span>
        </div>
      </div>

      {/* Month Filter Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Rekapitulasi Bulan:</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl neu-select text-xs font-extrabold text-brand-800 outline-none cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name} {selectedYear}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Highlight Terdaftar: <strong className="text-brand-700">{filteredActivities.length}</strong> Aktivitas
        </span>
      </div>

      {/* Search & Secondary Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kegiatan highlight, PIC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
          />
        </div>

        <select
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
        >
          <option value="ALL">Filter PIC IT: Semua User ({availablePics.length})</option>
          {availablePics.map(pic => (
            <option key={pic} value={pic}>{pic}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
        >
          <option value="ALL">Filter Status: Semua Status</option>
          <option value="Closed">Closed (Selesai)</option>
          <option value="On Progress">On Progress (Berjalan)</option>
          <option value="Open">Open (Belum Dimulai)</option>
        </select>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b-2 border-slate-300 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-60">Program Kerja</th>
                <th className="py-3.5 px-4">Sub-Item Program</th>
                <th className="py-3.5 px-4">Action / Kegiatan Highlight</th>
                <th className="py-3.5 px-4 w-32">Target Due</th>
                <th className="py-3.5 px-4 w-36 text-center">Status</th>
                <th className="py-3.5 px-4 w-40">Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    Tidak ada data highlight aktivitas pada bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                        {a.program?.programKerja?.kode}. {a.program?.programKerja?.namaProgram?.substring(0, 30)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {a.program?.kode} - {a.itemName}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900 text-xs leading-snug">{a.kegiatan}</p>
                      {a.descriptionAction && <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">{a.descriptionAction}</p>}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {a.dueDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${
                        a.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : a.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {a.status === 'Closed' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          {a.picNama?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-800 truncate">{a.picNama?.split('/')[0]}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="grid gap-3 md:hidden">
        {filteredActivities.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border-2 border-slate-300 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200 truncate">
                {a.program?.programKerja?.kode} - {a.program?.kode}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                a.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {a.status}
              </span>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm leading-snug">{a.kegiatan || a.descriptionAction}</p>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5"><User size={13} className="text-slate-400" /> {a.picNama?.split('/')[0]}</span>
              <span className="text-slate-500 font-medium">{a.dueDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Highlight */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base">Tambah Laporan Highlight Bulanan</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl neu-btn text-slate-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitForm} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Sub-Item Program Kerja *</label>
                <select
                  value={form.idProgram}
                  onChange={e => setForm({ ...form, idProgram: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-bold text-slate-900 outline-none cursor-pointer"
                >
                  {itemPrograms.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.programKerja?.kode}] {s.kode} — {s.namaItem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Action / Kegiatan Highlight *</label>
                <textarea
                  rows={3}
                  value={form.kegiatan}
                  onChange={e => setForm({ ...form, kegiatan: e.target.value })}
                  required
                  placeholder="Tuliskan uraian kegiatan highlight..."
                  className="w-full px-3.5 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Due Date *</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    placeholder="Nama PIC"
                    value={form.picNama}
                    onChange={e => setForm({ ...form, picNama: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl neu-btn font-bold text-xs text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
