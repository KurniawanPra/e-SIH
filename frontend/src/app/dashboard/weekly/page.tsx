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
  FileSpreadsheet,
  Download,
  FilterX
} from 'lucide-react'
import type { SessionUser } from '@/types/auth'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function WeeklyActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [parentPrograms, setParentPrograms] = useState<any[]>([])
  const [itemPrograms, setItemPrograms] = useState<any[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)

  // Month & Week Sprints Grouping
  const currentMonthIdx = new Date().getMonth() + 1
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx)
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL')

  // Date Range Filters for Excel Export
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State for Add / Edit
  const [selectedParentId, setSelectedParentId] = useState('')
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
    remarks: ''
  })

  // Quick Status Update State
  const [statusForm, setStatusForm] = useState({
    id: '',
    status: 'Closed',
    tindakLanjut: '',
    closedDate: ''
  })

  const fetchAll = async () => {
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        api.get('/api/esih/activities'),
        api.get('/api/esih/programs'),
        api.get('/api/esih/program-kerja'),
        api.get('/api/esih/users')
      ])
      setActivities(r1.data.data || [])
      setItemPrograms(r2.data.data || [])
      setParentPrograms(r3.data.data || [])
      setUsersList(r4.data.data || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    getCurrentUser().then(setUser)
    fetchAll()
  }, [])

  // Filtered Item Programs based on selected Program Kerja Induk
  const filteredItemOpts = useMemo(() => {
    if (!selectedParentId) return itemPrograms
    return itemPrograms.filter((i: any) => i.idProgramKerja === selectedParentId)
  }, [itemPrograms, selectedParentId])

  // Unique PICs who actually uploaded activities
  const availablePics = useMemo(() => {
    const picSet = new Set<string>()
    activities.forEach((a: any) => {
      const name = a.picNama?.split('/')[0]?.trim()
      if (name) picSet.add(name)
    })
    return Array.from(picSet).sort()
  }, [activities])

  // Filtered activities based on Month, Week, Date Range, Search, User Filter, and Status Filter
  const filteredActivities = useMemo(() => {
    return activities.filter((a: any) => {
      if (!a.startDate) return false
      const d = new Date(a.startDate)
      const m = d.getMonth() + 1
      const day = d.getDate()

      // Date Range Custom Filter (if specified)
      if (startDateFilter && a.startDate < startDateFilter) return false
      if (endDateFilter && a.startDate > endDateFilter) return false

      // If no custom date range, apply Month Grouping Filter
      if (!startDateFilter && !endDateFilter) {
        if (m !== selectedMonth) return false

        // Week Sprint Grouping Filter (W1: 1-7, W2: 8-14, W3: 15-21, W4: 22-28, W5: 29+)
        if (selectedWeek !== 'ALL') {
          let weekTag = 'W1'
          if (day >= 8 && day <= 14) weekTag = 'W2'
          else if (day >= 15 && day <= 21) weekTag = 'W3'
          else if (day >= 22 && day <= 28) weekTag = 'W4'
          else if (day >= 29) weekTag = 'W5'

          if (weekTag !== selectedWeek) return false
        }
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
        if (!matchKegiatan && !matchDesc && !matchPic && !matchProgram) return false
      }

      return true
    })
  }, [activities, selectedMonth, selectedWeek, startDateFilter, endDateFilter, userFilter, statusFilter, search])

  const today = new Date().toISOString().split('T')[0]

  // Export Filtered Activities to Excel / CSV File
  const handleExportExcel = () => {
    if (filteredActivities.length === 0) {
      alert('Tidak ada data laporan untuk di-export.')
      return
    }

    const headers = [
      'No',
      'Program Kerja Induk',
      'Sub-Item Program',
      'Laporan Kegiatan',
      'Deskripsi Action',
      'Tanggal Start',
      'Due Date',
      'Status Aktivitas',
      'Penanggung Jawab (PIC)',
      'Tindak Lanjut / Catatan'
    ]

    const rows = filteredActivities.map((a, idx) => [
      idx + 1,
      `"${(a.program?.programKerja?.kode || '')} - ${(a.program?.programKerja?.namaProgram || '').replace(/"/g, '""')}"`,
      `"${(a.program?.kode || '')} - ${(a.itemName || '').replace(/"/g, '""')}"`,
      `"${(a.kegiatan || '').replace(/"/g, '""')}"`,
      `"${(a.descriptionAction || '').replace(/"/g, '""')}"`,
      a.startDate || '',
      a.dueDate || '',
      a.status || '',
      `"${(a.picNama || '').replace(/"/g, '""')}"`,
      `"${(a.tindakLanjut || '').replace(/"/g, '""')}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    const dateRangeSuffix = startDateFilter && endDateFilter ? `${startDateFilter}_sd_${endDateFilter}` : `${MONTH_NAMES[selectedMonth - 1]}_2026`
    link.setAttribute('download', `e-SIH_Weekly_Activities_${dateRangeSuffix}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openAdd = () => {
    setEditItem(null)
    const firstParent = parentPrograms[0]?.id || ''
    setSelectedParentId(firstParent)
    const availableItems = itemPrograms.filter((i: any) => i.idProgramKerja === firstParent)
    
    setForm({
      idProgram: availableItems[0]?.id || itemPrograms[0]?.id || '',
      kegiatan: '',
      descriptionAction: '',
      startDate: today,
      dueDate: today,
      closedDate: '',
      status: 'On Progress',
      picNama: user?.name || 'Herbina',
      picEmail: user?.email || 'herbina@inl.co.id',
      tindakLanjut: '',
      remarks: ''
    })
    setShowModal(true)
  }

  const openEdit = (a: any) => {
    setEditItem(a)
    const parentId = a.program?.idProgramKerja || parentPrograms[0]?.id || ''
    setSelectedParentId(parentId)

    setForm({
      idProgram: a.idProgram,
      kegiatan: a.kegiatan,
      descriptionAction: a.descriptionAction || '',
      startDate: a.startDate,
      dueDate: a.dueDate,
      closedDate: a.closedDate || '',
      status: a.status,
      picNama: a.picNama,
      picEmail: a.picEmail,
      tindakLanjut: a.tindakLanjut || '',
      remarks: a.remarks || ''
    })
    setShowModal(true)
  }

  const openQuickStatus = (a: any) => {
    setStatusForm({
      id: a.id,
      status: a.status === 'Closed' ? 'On Progress' : 'Closed',
      tindakLanjut: a.tindakLanjut || '',
      closedDate: a.status === 'Closed' ? '' : today
    })
    setShowStatusModal(true)
  }

  const handleParentChange = (parentId: string) => {
    setSelectedParentId(parentId)
    const matchingItems = itemPrograms.filter((i: any) => i.idProgramKerja === parentId)
    if (matchingItems.length > 0) {
      setForm(prev => ({ ...prev, idProgram: matchingItems[0].id }))
    }
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
        closedDate: statusForm.status === 'Closed' ? (statusForm.closedDate || today) : ''
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
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="text-brand-700" size={24} /> Weekly Activities (Sprint Mingguan)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pengelompokan Aktivitas Operasional per Bulan &amp; Minggu Sprints (Minggu 1 - 5)
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 neu-btn-brand font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
        >
          <Plus size={16} /> Tambah Aktivitas
        </button>
      </div>

      {/* Month & Week Sprints Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Pilih Bulan Operasional:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3.5 py-1.5 rounded-xl neu-select text-xs font-extrabold text-brand-800 outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  Bulan {name} 2026
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Total Laporan: <strong className="text-brand-700">{filteredActivities.length}</strong> Aktivitas
          </span>
        </div>

        {/* Week Sprint Pills (Minggu 1 s/d Minggu 5) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Sprint Minggu:</span>
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
                className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  active
                    ? 'neu-active-green font-black shadow-xs'
                    : 'neu-btn font-extrabold text-slate-700 hover:text-slate-900'
                }`}
              >
                {week.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Date Range Filter for Excel Export & Custom Range */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={15} className="text-brand-700" /> Range Tanggal Export:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDateFilter}
              onChange={e => setStartDateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
              title="Tanggal Awal"
            />
            <span className="text-xs font-bold text-slate-400">s/d</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={e => setEndDateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
              title="Tanggal Akhir"
            />
          </div>
          {(startDateFilter || endDateFilter) && (
            <button
              onClick={() => { setStartDateFilter(''); setEndDateFilter('') }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1 cursor-pointer neu-btn"
              title="Reset Filter Tanggal"
            >
              <FilterX size={14} /> Reset Tanggal
            </button>
          )}
        </div>

        <button
          onClick={handleExportExcel}
          className="px-3.5 py-1.5 rounded-xl neu-btn-emerald font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Download size={14} /> Unduh (.CSV / Excel)
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kegiatan, PIC, atau deskripsi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
          />
        </div>

        {/* Filter by User */}
        <div className="relative">
          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
          >
            <option value="ALL">Filter PIC: Semua User ({availablePics.length})</option>
            {availablePics.map(pic => (
              <option key={pic} value={pic}>{pic}</option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
          >
            <option value="ALL">Filter Status: Semua Status</option>
            <option value="Closed">Closed (Selesai)</option>
            <option value="On Progress">On Progress (Berjalan)</option>
            <option value="Open">Open (Belum Dimulai)</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List View (Visible on Mobile Screens) */}
      <div className="grid gap-3.5 md:hidden">
        {filteredActivities.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 text-center text-slate-500 font-semibold text-xs">
            Tidak ada laporan aktivitas pada rentang tanggal/filter terpilih.
          </div>
        ) : (
          filteredActivities.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border-2 border-slate-300 p-4 shadow-xs space-y-3">
              {/* Top Row: Program Badge & Status */}
              <div className="space-y-1.5 border-b border-slate-200 pb-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200 truncate">
                    {a.program?.programKerja?.kode} - {a.program?.programKerja?.namaProgram}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border shrink-0 ${
                    a.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : a.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                  }`}>
                    {a.status === 'Closed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {a.status}
                  </span>
                </div>
                <p className="font-black text-slate-900 text-xs">{a.program?.kode} - {a.itemName}</p>
              </div>

              {/* Activity Details */}
              <div>
                <p className="font-extrabold text-slate-900 text-sm leading-snug">{a.kegiatan}</p>
                {a.descriptionAction && <p className="text-xs text-slate-600 font-medium mt-1">{a.descriptionAction}</p>}
              </div>

              {/* Footer Row: PIC, Date & Action Buttons */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <User size={13} className="text-slate-400" /> {a.picNama?.split('/')[0]}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Calendar size={12} className="text-slate-400" /> {a.startDate}
                  </span>
                </div>

                {/* 2 Action Buttons: Update Status & Edit (NO DELETE) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openQuickStatus(a)}
                    className="p-2 rounded-xl neu-btn text-brand-700 hover:bg-brand-50 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    title="Update Status Aktivitas"
                  >
                    <RefreshCw size={13} /> Status
                  </button>
                  <button
                    onClick={() => openEdit(a)}
                    className="p-2 rounded-xl neu-btn text-slate-700 hover:bg-slate-100 cursor-pointer"
                    title="Edit Aktivitas"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop & Tablet Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b-2 border-slate-300 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-64">Program &amp; Item Kerja</th>
                <th className="py-3.5 px-4">Laporan Kegiatan</th>
                <th className="py-3.5 px-4 w-32">Tanggal Start</th>
                <th className="py-3.5 px-4 w-36 text-center">Status</th>
                <th className="py-3.5 px-4 w-40">Penanggung Jawab (PIC)</th>
                <th className="py-3.5 px-4 w-36 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    Tidak ada data laporan aktivitas pada rentang tanggal/filter terpilih.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((a, i) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-center text-slate-400 font-mono font-bold text-xs">{i + 1}</td>
                    
                    {/* Program Column - Clean Responsive Formatting */}
                    <td className="py-4 px-4 space-y-1">
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                        {a.program?.programKerja?.kode} - {a.program?.programKerja?.namaProgram}
                      </span>
                      <p className="font-extrabold text-slate-900 text-xs leading-snug">
                        {a.program?.kode} - {a.itemName}
                      </p>
                    </td>

                    {/* Kegiatan Column */}
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-900 text-xs leading-snug">{a.kegiatan}</p>
                      {a.descriptionAction && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">{a.descriptionAction}</p>
                      )}
                    </td>

                    {/* Start Date */}
                    <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {a.startDate}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${
                        a.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : a.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {a.status === 'Closed' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {a.status}
                      </span>
                    </td>

                    {/* PIC Column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          {a.picNama?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-800 truncate">{a.picNama?.split('/')[0]}</span>
                      </div>
                    </td>

                    {/* 2 Actions Column: Update Status & Edit (NO DELETE) */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openQuickStatus(a)}
                          className="px-2.5 py-1.5 rounded-xl neu-btn text-brand-700 hover:bg-brand-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Update Status Aktivitas"
                        >
                          <RefreshCw size={13} /> Update
                        </button>
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded-xl neu-btn text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Edit Aktivitas"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Streamlined Add / Edit Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-zoom-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="font-black text-slate-900 text-base">
                {editItem ? 'Edit Laporan Aktivitas' : 'Tambah Laporan Aktivitas Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl neu-btn text-slate-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitForm} className="p-5 space-y-4">
              {/* Streamlined Form Fields */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">1. Program Kerja Induk *</label>
                <select
                  value={selectedParentId}
                  onChange={e => handleParentChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-bold text-slate-900 outline-none cursor-pointer"
                >
                  {parentPrograms.map(p => (
                    <option key={p.id} value={p.id}>
                      Program {p.kode}: {p.namaProgram}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">2. Sub-Item Program Kerja *</label>
                <select
                  value={form.idProgram}
                  onChange={e => setForm({ ...form, idProgram: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-bold text-slate-900 outline-none cursor-pointer"
                >
                  {filteredItemOpts.map(i => (
                    <option key={i.id} value={i.id}>
                      Item {i.kode} — {i.namaItem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">3. Kegiatan / Detail Laporan *</label>
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
                  <label className="text-xs font-bold text-slate-700">4. Tanggal Start *</label>
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
                    className="w-full px-3.5 py-2 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="On Progress">On Progress (Berjalan)</option>
                    <option value="Open">Open (Belum Dimulai)</option>
                    <option value="Closed">Closed (Selesai)</option>
                  </select>
                </div>
              </div>

              {/* Hidden/Defaulted PIC Field */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">Penanggung Jawab (PIC):</span>
                <span className="font-extrabold text-slate-900">{form.picNama}</span>
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
                  {submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah Aktivitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <RefreshCw size={16} className="text-brand-700" /> Update Status Aktivitas
                </h3>
                <button onClick={() => setShowStatusModal(false)} className="p-1 rounded-lg neu-btn text-slate-500 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={submitQuickStatus} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status Baru *</label>
                  <select
                    value={statusForm.status}
                    onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Closed">Closed (Selesai)</option>
                    <option value="On Progress">On Progress (Berjalan)</option>
                    <option value="Open">Open (Belum Dimulai)</option>
                  </select>
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

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 rounded-xl neu-btn font-bold text-xs text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Memperbarui...' : 'Perbarui Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
