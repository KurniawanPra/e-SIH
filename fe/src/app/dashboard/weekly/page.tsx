'use client'

import { useEffect, useState, useMemo } from 'react'
import { getCurrentUser, api } from '@/lib/api'
import {
  Plus,
  Pencil,
  X,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Search,
  RefreshCw,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ListFilter,
  Download,
  FilterX,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  FileSpreadsheet
} from 'lucide-react'
import type { SessionUser } from '@/types/auth'
import ModalPortal from '@/components/ModalPortal'
import { exportTableToExcel3 } from '@/lib/excelExport'
import { useYear } from '@/context/YearContext'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Week label dalam 1 bulan: W1 (1-7), W2 (8-14), W3 (15-21), W4 (22-28), W5 (29+)
const getWeekTag = (dateStr?: string) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const day = d.getDate()
  if (day >= 1 && day <= 7) return 'W1'
  if (day >= 8 && day <= 14) return 'W2'
  if (day >= 15 && day <= 21) return 'W3'
  if (day >= 22 && day <= 28) return 'W4'
  return 'W5'
}

const isSameMonthYear = (dateStr?: string, month?: number, year?: number) => {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  return d.getMonth() + 1 === month && d.getFullYear() === year
}

const formatUploadTime = (iso?: string | null) => {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

// Label minggu utk tampilan: M1, M2, M3, M4, M5 (berdasarkan Target Due Date / Start Date)
const weekLabel = (startDate?: string, dueDate?: string) => {
  const tag = getWeekTag(dueDate || startDate)
  if (!tag) return '-'
  return tag.replace('W', 'M')
}

export default function WeeklyActivitiesPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)
  const isAdmin = user?.role === 'ADMIN' || !user?.role

  // Month & Week Sprints Grouping
  const currentMonthIdx = new Date().getMonth() + 1
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx)
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL')
  const { selectedYear, setSelectedYear } = useYear()

  const yearOptions = useMemo(() => {
    const yearsSet = new Set<number>()
    const currentY = new Date().getFullYear()
    for (let y = currentY - 3; y <= currentY + 3; y++) {
      yearsSet.add(y)
    }
    activities.forEach((a: any) => {
      if (a.startDate) {
        const y = new Date(a.startDate).getFullYear()
        if (!isNaN(y)) yearsSet.add(y)
      }
    })
    return Array.from(yearsSet).sort((a, b) => a - b)
  }, [activities])

  // Count activities per month for 12-Month Calendar view
  const monthStatsMap = useMemo(() => {
    const map: { [m: number]: { total: number; closed: number; progress: number; open: number } } = {}
    for (let m = 1; m <= 12; m++) {
      map[m] = { total: 0, closed: 0, progress: 0, open: 0 }
    }
    activities.forEach((a: any) => {
      if (!a.startDate) return
      const d = new Date(a.startDate)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      if (y === selectedYear && map[m]) {
        map[m].total++
        if (a.status === 'Closed') map[m].closed++
        else if (a.status === 'On Progress') map[m].progress++
        else if (a.status === 'Open') map[m].open++
      }
    })
    return map
  }, [activities, selectedYear])

  // Date Range Filters for Excel Export
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals & Searchable Dropdown State
  const [showModal, setShowModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State for Add / Edit
  const [form, setForm] = useState({
    idProgram: '',
    kegiatan: '',
    descriptionAction: '',
    startDate: '',
    dueDate: '',
    closedDate: '',
    status: 'On Progress',
    picNama: '',
    picEmail: '',
    tindakLanjut: '',
    kendala: '',
    remarks: ''
  })

  // Quick Status Update State
  const [statusForm, setStatusForm] = useState({
    id: '',
    status: 'Closed',
    tindakLanjut: '',
    kendala: '',
    closedDate: '',
    dueDate: ''
  })

  const fetchAll = async () => {
    try {
      const [r1, r4] = await Promise.all([
        api.get(`/api/esih/activities?year=${selectedYear}`),
        api.get('/api/esih/users')
      ])
      setActivities(r1.data.data || [])
      setUsersList(r4.data.data || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    getCurrentUser().then((u) => { if (u) setUser(u) }).catch(() => undefined)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchAll()
  }, [selectedYear])

  // Priority scoring for sorting activities:
  // Items with kendala/tindakLanjut and unfinished status (On Progress / Open) come FIRST
  const getPriorityScore = (a: any) => {
    const hasKendala = Boolean(a.kendala && a.kendala !== '-' && a.kendala.trim() !== '')
    const hasTindakLanjut = Boolean(a.tindakLanjut && a.tindakLanjut !== '-' && a.tindakLanjut.trim() !== '')
    const isUnfinished = a.status === 'Open' || a.status === 'On Progress'

    if (hasKendala && hasTindakLanjut && isUnfinished) return 100
    if (hasKendala && isUnfinished) return 90
    if (hasTindakLanjut && isUnfinished) return 80
    if (hasKendala) return 70
    if (a.status === 'On Progress') return 50
    if (a.status === 'Open') return 40
    return 10
  }

  // Filtered & Sorted activities based on Priority, Month, Week, Date Range, Search, User Filter, and Status Filter
  const filteredActivities = useMemo(() => {
    const list = activities.filter((a: any) => {
      if (!a.startDate) return false
      const d = new Date(a.startDate)
      const m = d.getMonth() + 1
      const y = d.getFullYear()

      // Date Range Custom Filter (if specified)
      if (startDateFilter && a.startDate < startDateFilter) return false
      if (endDateFilter && a.startDate > endDateFilter) return false

      // If no custom date range, apply Month Grouping Filter
      if (!startDateFilter && !endDateFilter) {
        if (m !== selectedMonth) return false
        if (y !== selectedYear) return false

        // Week Grouping Filter (W1: 1-7, W2: 8-14, W3: 15-21, W4: 22-28, W5: 29+)
        if (selectedWeek !== 'ALL') {
          const actDate = a.dueDate || a.startDate
          const weekTag = getWeekTag(actDate)
          if (weekTag !== selectedWeek || !isSameMonthYear(actDate, m, y)) return false
        }
      }

      // Staff Role Filter: If non-admin user, only show activities created by/assigned to current user
      if (user?.role === 'USER' && user?.name) {
        const picLower = (a.picNama || '').toLowerCase()
        const userLower = user.name.toLowerCase()
        const emailLower = (user.email || '').toLowerCase()
        const picEmailLower = (a.picEmail || '').toLowerCase()
        const isMatchName = picLower.includes(userLower)
        const isMatchEmail = Boolean(emailLower && picEmailLower && picEmailLower.includes(emailLower))
        if (!isMatchName && !isMatchEmail) return false
      }

      // User Filter
      if (userFilter !== 'ALL') {
        const picName = a.picNama?.split('/')[0]?.trim() || ''
        if (picName.toLowerCase() !== userFilter.toLowerCase()) return false
      }

      // Status Filter
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchKegiatan = a.kegiatan?.toLowerCase().includes(q)
        const matchDesc = a.descriptionAction?.toLowerCase().includes(q)
        const matchPic = a.picNama?.toLowerCase().includes(q)
        const matchProgram = a.program?.namaItem?.toLowerCase().includes(q)
        const matchKendala = a.kendala?.toLowerCase().includes(q)
        const matchTindak = a.tindakLanjut?.toLowerCase().includes(q)
        if (!matchKegiatan && !matchDesc && !matchPic && !matchProgram && !matchKendala && !matchTindak) return false
      }

      return true
    })

    return list.sort((a: any, b: any) => {
      const scoreA = getPriorityScore(a)
      const scoreB = getPriorityScore(b)
      if (scoreA !== scoreB) {
        return scoreB - scoreA
      }
      return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
    })
  }, [activities, selectedMonth, selectedYear, selectedWeek, startDateFilter, endDateFilter, userFilter, statusFilter, search, user])

  // Summary Stats for the filtered period
  const summaryStats = useMemo(() => {
    const total = filteredActivities.length
    const closed = filteredActivities.filter((a: any) => a.status === 'Closed').length
    const progress = filteredActivities.filter((a: any) => a.status === 'On Progress').length
    const open = filteredActivities.filter((a: any) => a.status === 'Open').length
    return { total, closed, progress, open }
  }, [filteredActivities])

  // Unique PICs available in system and activities (independent of userFilter)
  const availablePics = useMemo(() => {
    const picSet = new Set<string>()
    usersList.forEach((u: any) => {
      if (u.nama && u.nama.trim()) picSet.add(u.nama.trim())
    })
    activities.forEach((a: any) => {
      if (a.picNama) {
        a.picNama.split(/[/,;]+/).forEach((n: string) => {
          const trimmed = n.trim()
          if (trimmed) picSet.add(trimmed)
        })
      }
    })
    return Array.from(picSet).sort()
  }, [activities, usersList])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [inputPage, setInputPage] = useState('1')
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(1)
    setInputPage('1')
  }, [selectedMonth, selectedWeek, selectedYear, userFilter, statusFilter, startDateFilter, endDateFilter, search])

  useEffect(() => {
    setInputPage(String(currentPage))
  }, [currentPage])

  const totalPages = Math.ceil(filteredActivities.length / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredActivities.length)

  const paginatedActivities = useMemo(() => {
    return filteredActivities.slice(startIndex, startIndex + pageSize)
  }, [filteredActivities, startIndex])

  const today = new Date().toISOString().split('T')[0]

  // Export Filtered Activities to Excel File (Weekly Activity Sheet format)
  const handleExportExcel = async () => {
    if (filteredActivities.length === 0) {
      alert('Tidak ada data laporan untuk di-export.')
      return
    }

    const titleStr = `Weekly Activities SIH - ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
    
    await exportTableToExcel3({
      title: titleStr,
      subKode: 'ACTIVITIES',
      subNamaItem: `Activities_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}`,
      year: selectedYear,
      activities: filteredActivities
    })
  }

  const openAdd = () => {
    setEditItem(null)

    setForm({
      idProgram: '',
      kegiatan: '',
      descriptionAction: '',
      startDate: today,
      dueDate: today,
      closedDate: '',
      status: 'On Progress',
      picNama: user?.name || 'Herbina',
      picEmail: user?.email || 'herbina@inl.co.id',
      tindakLanjut: '',
      kendala: '',
      remarks: ''
    })
    setShowModal(true)
  }

  const openEdit = (a: any) => {
    setEditItem(a)

    setForm({
      idProgram: a.idProgram || '',
      kegiatan: a.kegiatan,
      descriptionAction: a.descriptionAction || '',
      startDate: a.startDate,
      dueDate: a.dueDate,
      closedDate: a.closedDate || '',
      status: a.status,
      picNama: a.picNama,
      picEmail: a.picEmail || '',
      tindakLanjut: a.tindakLanjut || '',
      kendala: a.kendala || '',
      remarks: a.remarks || ''
    })
    setShowModal(true)
  }

  const openQuickStatus = (a: any) => {
    setStatusForm({
      id: a.id,
      status: a.status === 'Closed' ? 'On Progress' : 'Closed',
      tindakLanjut: a.tindakLanjut || '',
      kendala: a.kendala || '',
      closedDate: a.status === 'Closed' ? '' : today,
      dueDate: a.dueDate || ''
    })
    setShowStatusModal(true)
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editItem) {
        await api.put(`/api/esih/activities/${editItem.id}`, form)
      } else {
        await api.post('/api/esih/activities', form)
      }
      setShowModal(false)
      fetchAll()
    } catch {
      alert('Gagal menyimpan data aktivitas')
    } finally {
      setSubmitting(false)
    }
  }

  const submitQuickStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.put(`/api/esih/activities/${statusForm.id}`, {
        status: statusForm.status,
        tindakLanjut: statusForm.tindakLanjut,
        kendala: statusForm.kendala,
        closedDate: statusForm.status === 'Closed' ? (statusForm.closedDate || today) : '',
        dueDate: statusForm.dueDate
      })
      setShowStatusModal(false)
      fetchAll()
    } catch {
      alert('Gagal memperbarui status aktivitas')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-5 pb-16 sm:pb-24">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ListChecks className="text-brand-700" size={24} /> {isAdmin ? 'Activities' : 'Activities Ku'} (Laporan Aktivitas Mingguan)
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Laporan pekerjaan yang dilakukan user dalam 1 minggu - dilacak dari Tanggal Start &amp; Due Date, plus waktu upload laporan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex w-full items-center justify-center gap-2 font-semibold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer transition-all sm:w-auto ${
              showFilters || (userFilter !== 'ALL' || statusFilter !== 'ALL' || startDateFilter || endDateFilter)
                ? 'bg-brand-50 text-brand-800 border border-brand-300 shadow-xs'
                : 'neu-btn text-slate-700 hover:text-slate-900'
            }`}
          >
            <ListFilter size={16} />
            <span>Filter Lanjutan &amp; Ekspor</span>
            {(userFilter !== 'ALL' || statusFilter !== 'ALL' || startDateFilter || endDateFilter) && (
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            )}
            {showFilters ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 cursor-pointer sm:w-auto shadow-xs transition-colors"
            title="Export Data Aktivitas ke Excel"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>

          <button
            onClick={openAdd}
            className="inline-flex w-full items-center justify-center gap-2 neu-btn-brand font-semibold rounded-lg cursor-pointer sm:w-auto"
          >
            <Plus size={16} /> Tambah Aktivitas
          </button>
        </div>
      </div>

      {/* Primary Always-Visible Control Bar (Bulan Operasional, Year, Date Range & Quick Search) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        {/* Row 1: Bulan Operasional, Year, Date Range & Quick Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Month & Year Selection */}
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <span className="text-xs font-semibold text-slate-900 hidden sm:inline">Bulan Operasional:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl neu-select text-xs font-semibold text-brand-800 outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  Bulan {name} {selectedYear}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl neu-select text-xs font-semibold text-brand-800 outline-none cursor-pointer"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>

            <span className="text-xs font-bold text-slate-600 ml-1">
              Total: <strong className="text-brand-700">{filteredActivities.length}</strong> Aktivitas
            </span>
          </div>

          {/* Range Tanggal Filter & Quick Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
            {/* Filter Range Tanggal (Start & End Date) */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-300">
              <span className="text-xs font-semibold text-slate-700 px-1 flex items-center gap-1">
                <Calendar size={13} className="text-brand-600 shrink-0" /> Range:
              </span>
              <input
                type="date"
                value={startDateFilter}
                onChange={e => setStartDateFilter(e.target.value)}
                className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500"
                title="Tanggal Awal"
              />
              <span className="text-xs font-bold text-slate-600">s/d</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={e => setEndDateFilter(e.target.value)}
                className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500"
                title="Tanggal Akhir"
              />
              {(startDateFilter || endDateFilter) && (
                <button
                  onClick={() => {
                    setStartDateFilter('')
                    setEndDateFilter('')
                  }}
                  className="p-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-xs font-bold cursor-pointer"
                  title="Reset Filter Range Tanggal"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Search Bar */}
            <div className="relative flex-1 min-w-[200px] sm:w-60">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                placeholder="Cari kegiatan, PIC, deskripsi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Week Pills (Minggu 1 - Minggu 5) */}
        <div className="pt-2.5 border-t border-slate-200">
          <span className="block text-xs font-bold text-slate-700 mb-2">Pilih Minggu (berdasarkan Start &amp; Due Date):</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {[
              { id: 'ALL', label: 'Semua Minggu' },
              { id: 'W1', label: 'Minggu 1 (Tgl 1-7)' },
              { id: 'W2', label: 'Minggu 2 (Tgl 8-14)' },
              { id: 'W3', label: 'Minggu 3 (Tgl 15-21)' },
              { id: 'W4', label: 'Minggu 4 (Tgl 22-28)' },
              { id: 'W5', label: 'Minggu 5 (Tgl 29-31)' },
            ].map(week => {
              const active = selectedWeek === week.id
              return (
                <button
                  key={week.id}
                  onClick={() => setSelectedWeek(week.id)}
                  className={`px-3 py-2 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap overflow-hidden ${
                    active
                      ? 'neu-active-green font-bold shadow-xs'
                      : 'neu-btn font-semibold text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {week.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary Status Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Total Aktivitas</span>
          <span className="text-base font-bold text-slate-900 bg-slate-100 px-3 py-0.5 rounded-full border border-slate-300">
            {summaryStats.total}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700">Closed (Selesai)</span>
          <span className="text-base font-bold text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
            {summaryStats.closed}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700">On Progress</span>
          <span className="text-base font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-200">
            {summaryStats.progress}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 shadow-xs px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-red-700">Open (Belum Mulai)</span>
          <span className="text-base font-bold text-red-600 bg-red-50 px-3 py-0.5 rounded-full border border-red-200">
            {summaryStats.open}
          </span>
        </div>
      </div>

      {/* Collapsible Expandable Panel for Advanced Filters & Export */}
      {showFilters && (
        <div className="bg-white p-4 rounded-2xl border border-brand-200 shadow-sm space-y-3 animate-dropdown-in relative z-50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-brand-800 flex items-center gap-1.5">
              <ListFilter size={15} /> Konfigurasi Filter Lanjutan &amp; Ekspor Data
            </span>
            {(userFilter !== 'ALL' || statusFilter !== 'ALL' || startDateFilter || endDateFilter) && (
              <button
                onClick={() => {
                  setUserFilter('ALL')
                  setStatusFilter('ALL')
                  setStartDateFilter('')
                  setEndDateFilter('')
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <FilterX size={14} /> Reset Semua Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end pt-1">
            {/* Range Tanggal Export */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Range Tanggal Export
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={e => setStartDateFilter(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                  title="Tanggal Awal"
                />
                <span className="text-xs font-bold text-slate-600 text-center sm:self-center">s/d</span>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={e => setEndDateFilter(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                  title="Tanggal Akhir"
                />
              </div>
            </div>

            {/* Filter PIC */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Filter PIC
              </label>
              <select
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
              >
                <option value="ALL">Semua User ({availablePics.length})</option>
                {availablePics.map(pic => (
                  <option key={pic} value={pic}>{pic}</option>
                ))}
              </select>
            </div>

            {/* Filter Status & Unduh Button */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Status &amp; Ekspor
              </label>
              <div className="flex items-stretch gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Closed">Closed</option>
                  <option value="On Progress">On Progress</option>
                  <option value="Open">Open</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  onClick={handleExportExcel}
                  className="px-3 py-2 rounded-lg neu-btn-emerald font-semibold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Unduh Excel/CSV"
                >
                  <Download size={14} /> Unduh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card List View (Visible on Mobile Screens) */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {paginatedActivities.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-600 font-semibold text-xs">
            Tidak ada laporan aktivitas pada rentang tanggal/filter terpilih.
          </div>
        ) : (
          paginatedActivities.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 w-full min-w-0">
              {/* Top Row: Status */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 min-w-0">
                <span className="text-xs font-bold text-slate-700">Aktivitas #{a.no || a.id}</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${
                  a.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : a.status === 'Open' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {a.status === 'Closed' ? <CheckCircle2 size={12} /> : a.status === 'Open' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {a.status}
                </span>
              </div>

              {/* Week Badge */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 border border-brand-200 text-xs font-bold text-brand-800" title={`Start: ${a.startDate || '-'} | Due: ${a.dueDate || '-'}`}>
                  <CalendarDays size={12} /> Minggu: {weekLabel(a.startDate, a.dueDate)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                  <Clock size={11} className="text-slate-600" /> Upload: {formatUploadTime(a.createdAt)}
                </span>
              </div>

              {/* Activity Details */}
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm leading-snug">{a.kegiatan}</p>
                {a.descriptionAction && <p className="text-xs text-slate-600 font-medium mt-1">{a.descriptionAction}</p>}
                {a.tindakLanjut && (
                  <p className="text-xs text-slate-700 font-semibold mt-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
                    Tindak Lanjut: {a.tindakLanjut}
                  </p>
                )}
                {a.kendala && (
                  <p className="text-xs text-red-700 font-semibold mt-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                    Kendala: {a.kendala}
                  </p>
                )}
              </div>

              {/* Footer Row: PIC, Date & Action Buttons */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2 text-xs text-slate-600 min-w-0 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 truncate min-w-0">
                    <User size={13} className="text-slate-600 shrink-0" /> {a.picNama?.split('/')[0]}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-600 shrink-0">
                    <Calendar size={12} className="text-slate-600" /> {a.startDate}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openQuickStatus(a)}
                    className="px-2.5 py-1 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors shadow-xs"
                    title="Update Status Aktivitas"
                  >
                    <RefreshCw size={13} /> Update Status
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop & Tablet Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b-2 border-slate-300 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <th className="py-3.5 px-4 w-12 text-center sticky left-0 bg-slate-100 text-slate-900 font-bold z-10 border-r-2 border-slate-300 shadow-xs">No</th>
                <th className="py-3.5 px-4 w-24">Minggu</th>
                <th className="py-3.5 px-4 min-w-[220px]">Laporan Kegiatan</th>
                <th className="py-3.5 px-4 min-w-[180px]">Tindak Lanjut</th>
                <th className="py-3.5 px-4 min-w-[180px]">Kendala</th>
                <th className="py-3.5 px-4 w-32">Tanggal Start</th>
                <th className="py-3.5 px-4 w-36 text-center">Status</th>
                <th className="py-3.5 px-4 w-40">Penanggung Jawab (PIC)</th>
                <th className="py-3.5 px-4 w-44">Waktu Upload Laporan</th>
                <th className="py-3.5 px-4 w-36 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-600 font-bold">
                    Tidak ada data laporan aktivitas pada rentang tanggal/filter terpilih.
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((a, i) => {
                  const hasActiveKendala = Boolean(a.kendala && a.kendala !== '-' && a.kendala.trim() !== '' && a.status !== 'Closed')
                  return (
                    <tr
                      key={a.id}
                      className={`transition-colors ${
                        hasActiveKendala ? 'bg-red-50/70 hover:bg-red-100/70' : 'hover:bg-slate-50'
                      }`}
                    >
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-300/80 shadow-xs">{startIndex + i + 1}</td>

                    {/* Minggu Column (Start & Due) */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-xs font-bold text-brand-800 whitespace-nowrap" title={`Start: ${a.startDate || '-'} | Due: ${a.dueDate || '-'}`}>
                        {weekLabel(a.startDate, a.dueDate)}
                      </span>
                    </td>

                    {/* Kegiatan Column */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900 text-xs leading-snug">{a.kegiatan}</p>
                      {a.descriptionAction && (
                        <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-2">{a.descriptionAction}</p>
                      )}
                    </td>

                    {/* Tindak Lanjut Column */}
                    <td className="py-4 px-4">
                      {a.tindakLanjut ? (
                        <p className="text-xs text-slate-700 font-semibold leading-snug">{a.tindakLanjut}</p>
                      ) : (
                        <span className="text-xs text-slate-300 font-medium">-</span>
                      )}
                    </td>

                    {/* Kendala Column */}
                    <td className="py-4 px-4">
                      {a.kendala ? (
                        <p className="text-xs text-red-600 font-semibold leading-snug">{a.kendala}</p>
                      ) : (
                        <span className="text-xs text-slate-300 font-medium">-</span>
                      )}
                    </td>

                    {/* Start Date */}
                    <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {a.startDate}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        a.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : a.status === 'Open' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {a.status === 'Closed' ? <CheckCircle2 size={13} /> : a.status === 'Open' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {a.status}
                      </span>
                    </td>

                    {/* PIC Column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {a.picNama?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 truncate">{a.picNama?.split('/')[0]}</span>
                      </div>
                    </td>

                    {/* Waktu Upload Laporan Column */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 whitespace-nowrap">
                        <Clock size={12} className="text-slate-600 shrink-0" /> {formatUploadTime(a.createdAt)}
                      </span>
                    </td>

                    {/* 2 Actions Column: Update Status & Edit (NO DELETE) */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openQuickStatus(a)}
                          className="px-2.5 py-1 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors shadow-xs"
                          title="Update Status Aktivitas"
                        >
                          <RefreshCw size={13} /> Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {filteredActivities.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-600">
            Menampilkan <span className="text-brand-700">{startIndex + 1}</span>–<span className="text-brand-700">{endIndex}</span> dari <span className="text-slate-900">{filteredActivities.length}</span> data
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg neu-btn text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
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
                className="w-12 text-center py-1 rounded-lg neu-input text-xs font-bold text-slate-900 outline-none"
              />
              <span>dari {totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg neu-btn text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Streamlined Add / Edit Activity Modal */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="font-bold text-slate-900 text-base">
                  {editItem ? 'Edit Weekly Activities Report' : 'Tambah Weekly Activities Report'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg neu-btn text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitForm} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">1. Kegiatan / Detail Laporan *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tuliskan uraian kegiatan/laporan aktivitas..."
                      value={form.kegiatan}
                      onChange={e => setForm({ ...form, kegiatan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">2. Tanggal Start *</label>
                      <input
                        type="date"
                        required
                        value={form.startDate}
                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Status Aktivitas</label>
                      <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                      >
                        <option value="On Progress">On Progress (Berjalan)</option>
                        <option value="Open">Open (Belum Dimulai)</option>
                        <option value="Closed">Closed (Selesai)</option>
                        <option value="Cancelled">Cancelled (Dibatalkan)</option>
                      </select>
                    </div>
                  </div>

                  {/* Hidden/Defaulted PIC Field */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">Penanggung Jawab (PIC):</span>
                    <span className="font-semibold text-slate-900">{form.picNama}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Tindak Lanjut / Catatan</label>
                      <textarea
                        rows={2}
                        placeholder="Opsional: catatan tindak lanjut..."
                        value={form.tindakLanjut}
                        onChange={e => setForm({ ...form, tindakLanjut: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Kendala / Hambatan</label>
                      <textarea
                        rows={2}
                        placeholder="Opsional: kendala yang dihadapi..."
                        value={form.kendala}
                        onChange={e => setForm({ ...form, kendala: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer - rapat ke dasar modal */}
                <div className="px-5 py-3.5 border-t border-slate-200 bg-white shrink-0 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg neu-btn font-bold text-xs text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg neu-btn-brand font-semibold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Simpan Aktivitas'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Quick Update Status Modal */}
      {showStatusModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <RefreshCw size={16} className="text-brand-700" /> Update Status Aktivitas
                </h3>
                <button onClick={() => setShowStatusModal(false)} className="p-1 rounded-lg neu-btn text-slate-600 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={submitQuickStatus} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status Baru *</label>
                    <select
                      value={statusForm.status}
                      onChange={e => setStatusForm({ ...statusForm, status: e.target.value, closedDate: e.target.value === 'Closed' ? statusForm.closedDate || today : '' })}
                      className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="Closed">Closed (Selesai)</option>
                      <option value="On Progress">On Progress (Berjalan)</option>
                      <option value="Open">Open (Belum Dimulai)</option>
                      <option value="Cancelled">Cancelled (Dibatalkan)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Target Date / Due Date</label>
                    <input
                      type="date"
                      value={statusForm.dueDate}
                      onChange={e => setStatusForm({ ...statusForm, dueDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none cursor-pointer"
                    />
                  </div>



                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Catatan / Tindak Lanjut</label>
                    <input
                      type="text"
                      placeholder="Opsional: catatan penyelesaian..."
                      value={statusForm.tindakLanjut}
                      onChange={e => setStatusForm({ ...statusForm, tindakLanjut: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kendala / Hambatan</label>
                    <input
                      type="text"
                      placeholder="Opsional: kendala yang dihadapi..."
                      value={statusForm.kendala}
                      onChange={e => setStatusForm({ ...statusForm, kendala: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 bg-white sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 rounded-lg neu-btn font-bold text-xs text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg neu-btn-brand font-semibold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Memperbarui...' : 'Perbarui Status'}
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
