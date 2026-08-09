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
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import ModalPortal from '@/components/ModalPortal'

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
  const [subSearchQuery, setSubSearchQuery] = useState('')
  const [subDropdownOpen, setSubDropdownOpen] = useState(false)

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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [inputPage, setInputPage] = useState('1')
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(1)
    setInputPage('1')
  }, [selectedMonth, selectedYear, userFilter, statusFilter, search])

  useEffect(() => {
    setInputPage(String(currentPage))
  }, [currentPage])

  const totalPages = Math.ceil(filteredActivities.length / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredActivities.length)

  const paginatedActivities = useMemo(() => {
    return filteredActivities.slice(startIndex, startIndex + pageSize)
  }, [filteredActivities, startIndex])

  // Searchable Sub-Item Program Options for Modal
  const filteredSubItems = useMemo(() => {
    if (!subSearchQuery.trim()) return itemPrograms
    const q = subSearchQuery.toLowerCase()
    return itemPrograms.filter(s =>
      s.namaItem?.toLowerCase().includes(q) ||
      s.kode?.toLowerCase().includes(q) ||
      s.programKerja?.kode?.toLowerCase().includes(q)
    )
  }, [itemPrograms, subSearchQuery])

  const selectedSubObj = useMemo(() => {
    return itemPrograms.find(s => s.id === form.idProgram) || itemPrograms[0]
  }, [itemPrograms, form.idProgram])

  // Calculate Monthly Summary Stats matching referensi 2.jpeg
  const summaryStats = useMemo(() => {
    const total = monthActivities.length
    const open = monthActivities.filter((a: any) => a.status === 'Open' || a.status === 'On Progress').length
    const closed = monthActivities.filter((a: any) => a.status === 'Closed').length
    const cancelled = monthActivities.filter((a: any) => a.status === 'Cancelled').length
    const closure = total > 0 ? Math.round((closed / total) * 100) : 0
    return { total, open, closed, cancelled, closure }
  }, [monthActivities])

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
    link.setAttribute('download', `e-SIH_Monthly_Highlight_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.csv`)
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
    setSubSearchQuery('')
    setSubDropdownOpen(false)
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
            <Plus size={16} /> Tambah Highlight
          </button>
        </div>
      </div>

      {/* Management Highlight Summary Card (Format Referensi 2.jpeg) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-stretch justify-between gap-5">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileSpreadsheet className="text-brand-700" size={16} /> Management Highlight Report Summary ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
            </span>
            <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Dokumen: INLHO/REP-F/-021
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-300 text-xs font-bold">
            <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-300 py-2 px-3.5 text-slate-700 font-black">
              <span>Metrik Aktivitas</span>
              <span className="text-right">Jumlah / Nilai</span>
            </div>
            <div className="grid grid-cols-2 py-1.5 px-3.5 border-b border-slate-200 bg-red-50/50">
              <span className="text-slate-800 font-extrabold">No. of Action Item</span>
              <span className="text-right font-black text-slate-900">{summaryStats.total}</span>
            </div>
            <div className="grid grid-cols-2 py-1.5 px-3.5 border-b border-slate-200 bg-amber-50/50">
              <span className="text-slate-800 font-extrabold">Open (Aktif / On Progress)</span>
              <span className="text-right font-black text-amber-700">{summaryStats.open}</span>
            </div>
            <div className="grid grid-cols-2 py-1.5 px-3.5 border-b border-slate-200 bg-emerald-50/50">
              <span className="text-slate-800 font-extrabold">Closed (Selesai)</span>
              <span className="text-right font-black text-emerald-700">{summaryStats.closed}</span>
            </div>
            <div className="grid grid-cols-2 py-1.5 px-3.5 border-b border-slate-200 bg-slate-50">
              <span className="text-slate-800 font-extrabold">Cancelled (Dibatalkan)</span>
              <span className="text-right font-black text-slate-500">{summaryStats.cancelled}</span>
            </div>
            <div className="grid grid-cols-2 py-2 px-3.5 bg-brand-50 text-brand-900 font-black border-t border-brand-200">
              <span>Closure (%)</span>
              <span className="text-right text-sm">{summaryStats.closure}%</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shrink-0">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Tingkat Penutupan (Closure)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-brand-800">{summaryStats.closure}%</span>
              <span className="text-xs font-bold text-slate-600">{summaryStats.closed} / {summaryStats.total} Ditutup</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-300">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summaryStats.closure >= 80 ? 'bg-emerald-600' : summaryStats.closure >= 50 ? 'bg-amber-500' : 'bg-brand-600'
                }`}
                style={{ width: `${summaryStats.closure}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Status Terbanyak</span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-black">
              {summaryStats.open >= summaryStats.closed ? `${summaryStats.open} Open` : `${summaryStats.closed} Closed`}
            </span>
          </div>
        </div>
      </div>

      {/* Month Filter Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider w-full sm:w-auto">Rekapitulasi Bulan:</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl neu-select text-xs font-extrabold text-brand-800 outline-none cursor-pointer min-w-0 max-w-full"
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
          <option value="Cancelled">Cancelled (Dibatalkan)</option>
        </select>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b-2 border-slate-300 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center sticky left-0 bg-slate-200 text-slate-900 font-black z-10 border-r-2 border-slate-300 shadow-xs">No</th>
                <th className="py-3.5 px-4 w-60">Program Kerja</th>
                <th className="py-3.5 px-4">Sub-Item Program</th>
                <th className="py-3.5 px-4">Action / Kegiatan Highlight</th>
                <th className="py-3.5 px-4 w-32">Target Due</th>
                <th className="py-3.5 px-4 w-36 text-center">Status</th>
                <th className="py-3.5 px-4 w-40">Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    Tidak ada data highlight aktivitas pada bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono font-black text-slate-800 sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-300/80 shadow-xs">{startIndex + idx + 1}</td>
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
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginatedActivities.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 text-center text-slate-400 font-semibold text-xs">
            Tidak ada data highlight aktivitas pada bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
          </div>
        ) : (
          paginatedActivities.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border-2 border-slate-300 p-4 shadow-xs space-y-2.5 w-full min-w-0">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 min-w-0">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200 truncate min-w-0">
                  {a.program?.programKerja?.kode} - {a.program?.kode}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border shrink-0 ${
                  a.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {a.status}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 text-sm leading-snug">{a.kegiatan || a.descriptionAction}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 text-xs font-bold text-slate-700 min-w-0">
                <span className="flex items-center gap-1.5 truncate min-w-0"><User size={13} className="text-slate-400 shrink-0" /> <span className="truncate min-w-0">{a.picNama?.split('/')[0]}</span></span>
                <span className="text-slate-500 font-medium shrink-0">{a.dueDate}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {filteredActivities.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-300 shadow-2xs">
          <p className="text-xs font-extrabold text-slate-600">
            Menampilkan <span className="text-brand-700">{startIndex + 1}</span>–<span className="text-brand-700">{endIndex}</span> dari <span className="text-slate-900">{filteredActivities.length}</span> data
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl neu-btn text-xs font-extrabold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={15} /> Prev
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>Hal</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={inputPage}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setInputPage(e.target.value)
                  if (val >= 1 && val <= totalPages) {
                    setCurrentPage(val)
                  }
                }}
                onBlur={() => {
                  if (!inputPage || Number(inputPage) < 1 || Number(inputPage) > totalPages) {
                    setInputPage(String(currentPage))
                  }
                }}
                className="w-12 text-center py-1 rounded-lg neu-input text-xs font-black text-slate-900 outline-none"
              />
              <span>dari {totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-xl neu-btn text-xs font-extrabold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Add Highlight with Searchable Dropdown */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="font-black text-slate-900 text-base">Tambah Laporan Highlight Bulanan</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl neu-btn text-slate-500 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitForm} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Searchable Select Dropdown for Sub-Item Program */}
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-700">Sub-Item Program Kerja *</label>
                    
                    <div
                      onClick={() => setSubDropdownOpen(!subDropdownOpen)}
                      className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-bold text-slate-900 cursor-pointer flex items-center justify-between bg-white border-2 border-slate-300 hover:border-brand-700 transition-colors"
                    >
                      <span className="truncate">
                        {selectedSubObj ? `[${selectedSubObj.programKerja?.kode || 'A'}] ${selectedSubObj.kode || ''} — ${selectedSubObj.namaItem || ''}` : 'Pilih Sub-Item Program Kerja...'}
                      </span>
                      <ChevronDown size={14} className="text-slate-500 shrink-0 ml-2" />
                    </div>

                    {subDropdownOpen && (
                      <div className="mt-1.5 bg-slate-50 rounded-2xl border-2 border-slate-300 p-2 space-y-2 max-h-52 overflow-y-auto animate-zoom-in">
                        <div className="relative sticky top-0 bg-slate-50 pb-1 z-10">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Ketik untuk mencari sub-item program..."
                            value={subSearchQuery}
                            onChange={e => setSubSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none bg-white"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1">
                          {filteredSubItems.length === 0 ? (
                            <p className="text-xs text-slate-400 font-bold text-center py-3">Tidak ditemukan sub-item cocok.</p>
                          ) : (
                            filteredSubItems.map(s => (
                              <div
                                key={s.id}
                                onClick={() => {
                                  setForm({ ...form, idProgram: s.id })
                                  setSubDropdownOpen(false)
                                  setSubSearchQuery('')
                                }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                  form.idProgram === s.id
                                    ? 'neu-active-green'
                                    : 'hover:bg-white text-slate-800 border border-transparent hover:border-slate-200'
                                }`}
                              >
                                [{s.programKerja?.kode}] {s.kode} — {s.namaItem}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
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
                </div>

                {/* Sticky Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 bg-white sticky bottom-0 z-10">
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
                    className="px-5 py-2 rounded-xl neu-btn-brand font-extrabold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Laporan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
