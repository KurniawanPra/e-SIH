'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { api, getCurrentUser } from '@/lib/api'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  Plus,
  X,
  FileSpreadsheet,
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  FolderOpen,
  FolderKanban,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react'
import ModalPortal from '@/components/ModalPortal'
import { useYear } from '@/context/YearContext'
import { exportSubItemToExcel } from '@/lib/excelExport'

function PicSearchDropdown({
  userList,
  selectedPics,
  onTogglePic,
}: {
  userList: any[]
  selectedPics: string[]
  onTogglePic: (email: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchPic, setSearchPic] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredUsers = useMemo(() => {
    if (!searchPic.trim()) return userList
    const q = searchPic.toLowerCase()
    return userList.filter(
      u => u.nama?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.jabatan?.toLowerCase().includes(q)
    )
  }, [userList, searchPic])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm flex items-center justify-between cursor-pointer hover:border-brand-400 shadow-xs transition-all"
      >
        <span className="text-slate-700 font-bold text-xs flex items-center gap-2">
          <Search size={14} className="text-slate-600" />
          {selectedPics.length === 0
            ? '- Cari & Pilih Penanggung Jawab (PIC) -'
            : `${selectedPics.length} PIC Dipilih`}
        </span>
        <ChevronDown size={16} className={`text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[9999] rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl space-y-2 max-h-64 flex flex-col">
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              autoFocus
              placeholder="Ketik nama atau email PIC..."
              value={searchPic}
              onChange={e => setSearchPic(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-1 pr-1 custom-scrollbar">
            {filteredUsers.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-600 font-medium">Tidak ada PIC yang cocok</div>
            ) : (
              filteredUsers.map(u => {
                const isSelected = selectedPics.includes(u.email)
                return (
                  <div
                    key={u.email}
                    onClick={() => {
                      onTogglePic(u.email)
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-brand-50 border border-brand-200 text-brand-900 font-semibold'
                        : 'hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {u.nama?.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate min-w-0">
                        <p className="truncate font-bold">{u.nama}</p>
                        {u.jabatan && <p className="text-xs text-slate-600 truncate">{u.jabatan}</p>}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-brand-600 font-bold text-xs shrink-0 flex items-center gap-1">
                        <Check size={14} /> Terpilih
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Selected Badges List */}
      <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 min-h-10 items-center">
        {selectedPics.length === 0 ? (
          <span className="text-xs text-slate-600 font-semibold italic">
            Belum ada PIC dipilih. Klik dropdown di atas untuk mencari dan memilih.
          </span>
        ) : (
          selectedPics.map(email => {
            const u = userList.find(x => x.email === email)
            const nameDisplay = u?.nama || email
            return (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500 bg-brand-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs"
              >
                <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                  {nameDisplay.charAt(0).toUpperCase()}
                </span>
                {nameDisplay}
                <button
                  type="button"
                  onClick={() => onTogglePic(email)}
                  className="ml-1 rounded-full p-0.5 hover:bg-white/20 transition cursor-pointer text-white/80 hover:text-white"
                  title="Hapus PIC"
                >
                  <X size={12} />
                </button>
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'On Progress': 'bg-amber-100 text-amber-800 border-amber-300',
  Closed: 'bg-slate-200 text-slate-700 border-slate-300',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-300',
}

const emptyForm = {
  bulan: new Date().getMonth() + 1,
  tahun: new Date().getFullYear(),
  bagian: 'Sistem',
  item: '',
  description: '',
  actionToBeTaken: '',
  namePic: '',
  programId: '',
  targetDate: '',
  closedDate: '',
  status: 'On Progress',
  remarks: '',
}

export default function MonthlyActivitiesPage() {
  const [userRole, setUserRole] = useState<string>('USER')
  const [highlights, setHighlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1)
  const { selectedYear, setSelectedYear } = useYear()
  const [view, setView] = useState<'cards' | 'table'>('table')
  const [search, setSearch] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)

  const [programs, setPrograms] = useState<any[]>([])
  const [userList, setUserList] = useState<any[]>([])
  const [selectedPics, setSelectedPics] = useState<string[]>([])

  useEffect(() => {
    api.get('/api/esih/programs').then(r => setPrograms(r.data.data || [])).catch(() => setPrograms([]))
    api.get('/api/esih/users').then(r => setUserList(r.data.data || [])).catch(() => setUserList([]))
  }, [])

  const togglePic = (email: string) => {
    setSelectedPics(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])
  }

  const groupedPrograms = useMemo(() => {
    const map = new Map<string, any[]>()
    programs.forEach(p => {
      const key = p.programKerja?.namaProgram || 'Program Lainnya'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    })
    return Array.from(map.entries())
  }, [programs])

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        const isAdmin = u?.role === 'ADMIN'
        setUserRole(u?.role || 'USER')
        setView(isAdmin ? 'cards' : 'table')
      })
      .catch(() => setView('table'))
  }, [])

  const fetchHighlights = async (month: number, year: number) => {
    try {
      const r = await api.get('/api/esih/highlights', { params: { month, year } })
      setHighlights(r.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHighlights(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear])

  const [yearHighlights, setYearHighlights] = useState<any[]>([])
  useEffect(() => {
    api
      .get('/api/esih/highlights', { params: { year: selectedYear } })
      .then(r => setYearHighlights(r.data.data || []))
      .catch(() => setYearHighlights([]))
  }, [selectedYear])

  const stats = useMemo(() => {
    const total = highlights.length
    const open = highlights.filter(h => h.status === 'Open').length
    const progress = highlights.filter(h => h.status === 'On Progress').length
    const closed = highlights.filter(h => h.status === 'Closed').length
    const cancelled = highlights.filter(h => h.status === 'Cancelled').length
    const closure = total > 0 ? Math.round((closed / total) * 100) : 0

    const bulanan: Record<number, { total: number; closure: number }> = {}
    for (let m = 1; m <= 12; m++) {
      const items = yearHighlights.filter(h => h.bulan === m)
      const c = items.filter(h => h.status === 'Closed').length
      bulanan[m] = {
        total: items.length,
        closure: items.length > 0 ? Math.round((c / items.length) * 100) : 0,
      }
    }
    return { total, open, progress, closed, cancelled, closure, bulanan }
  }, [highlights, yearHighlights])

  const [selectedBagian, setSelectedBagian] = useState<string>('ALL')

  const filteredHighlights = useMemo(() => {
    let list = highlights

    if (selectedBagian !== 'ALL') {
      const bq = selectedBagian.toLowerCase()
      list = list.filter(h => {
        if (h.bagian) return h.bagian.toLowerCase() === bq
        const text = `${h.item} ${h.namePic} ${h.description} ${h.remarks}`.toLowerCase()
        if (bq === 'hsse') return text.includes('hsse') || text.includes('security') || text.includes('cleaning') || text.includes('jumat bersih')
        if (bq === 'it') return text.includes('it') || text.includes('smartwb') || text.includes('rfid') || text.includes('sap') || text.includes('hardware')
        if (bq === 'sistem') return text.includes('sistem') || text.includes('sdm') || text.includes('sekper') || text.includes('kpbn') || text.includes('proses bisnis') || text.includes('iso')
        return true
      })
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(h =>
        h.item?.toLowerCase().includes(q) ||
        h.description?.toLowerCase().includes(q) ||
        h.namePic?.toLowerCase().includes(q) ||
        h.remarks?.toLowerCase().includes(q)
      )
    }

    if (startDateFilter || endDateFilter) {
      list = list.filter(h => {
        const itemDate = h.targetDate || h.startDate || (h.createdAt ? h.createdAt.split('T')[0] : '')
        if (!itemDate) return true
        if (startDateFilter && itemDate < startDateFilter) return false
        if (endDateFilter && itemDate > endDateFilter) return false
        return true
      })
    }

    return list
  }, [highlights, search, selectedBagian, startDateFilter, endDateFilter])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedMonth, selectedYear, search, selectedBagian, startDateFilter, endDateFilter])

  const totalPages = Math.ceil(filteredHighlights.length / itemsPerPage) || 1
  const startIndex = filteredHighlights.length > 0 ? (currentPage - 1) * itemsPerPage : 0
  const endIndex = Math.min(startIndex + itemsPerPage, filteredHighlights.length)
  const paginatedHighlights = useMemo(() => {
    return filteredHighlights.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredHighlights, startIndex, itemsPerPage])

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, i) => selectedYear - 2 + i).sort((a, b) => b - a),
    [selectedYear],
  )

  const openAddModal = (bulan = selectedMonth, tahun = selectedYear) => {
    setEditingId(null)
    setForm({ ...emptyForm, bulan, tahun })
    setSelectedPics([])
    setShowModal(true)
  }

  const openEditModal = (h: any) => {
    setEditingId(h.id)
    setForm({
      bulan: h.bulan,
      tahun: h.tahun,
      bagian: h.bagian || 'Sistem',
      item: h.item || '',
      description: h.description || '',
      actionToBeTaken: h.actionToBeTaken || '',
      namePic: h.namePic || '',
      programId: h.program?.id || h.programId || '',
      targetDate: h.targetDate || '',
      closedDate: h.closedDate || '',
      status: h.status || 'On Progress',
      remarks: h.remarks || ''
    })
    let picEmails = Array.isArray(h.pics) && h.pics.length > 0
      ? h.pics.map((p: any) => p?.email).filter(Boolean)
      : []
    
    // Fallback: match by user name if pics array is empty
    if (picEmails.length === 0 && h.namePic) {
      picEmails = userList
        .filter(u => u.nama && h.namePic.toLowerCase().includes(u.nama.toLowerCase()))
        .map(u => u.email)
    }
    setSelectedPics(picEmails)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.item.trim()) return
    setSubmitting(true)
    try {
      const selectedUserObjs = userList.filter(u => selectedPics.includes(u.email))
      const pics = selectedUserObjs.map(u => ({ name: u.nama, email: u.email }))
      const formattedNamePic = selectedUserObjs.length > 0
        ? selectedUserObjs.map(u => u.nama).join(' / ')
        : (form.namePic || 'SDM / IT')

      const payload: any = { ...form, namePic: formattedNamePic, pics }
      if (pics.length === 0 && editingId) {
        delete payload.pics
      }
      if (editingId) {
        await api.put(`/api/esih/highlights/${editingId}`, payload)
      } else {
        await api.post('/api/esih/highlights', payload)
      }
      setShowModal(false)
      await fetchHighlights(selectedMonth, selectedYear)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus item highlight ini?')) return
    try {
      await api.delete(`/api/esih/highlights/${id}`)
      await fetchHighlights(selectedMonth, selectedYear)
    } catch (err) {
      console.error(err)
    }
  }

  const handleExportExcel = async () => {
    if (highlights.length === 0) {
      alert('Tidak ada data highlight untuk di-export.')
      return
    }

    const mappedActivities = highlights.map((h, i) => ({
      id: h.id || String(i),
      no: i + 1,
      kegiatan: h.item || h.kegiatan || '-',
      descriptionAction: h.actionToBeTaken || h.descriptionAction || h.description || '-',
      picNama: h.namePic || h.picNama || '-',
      picEmail: h.picEmail || '',
      dueDate: h.targetDate || h.dueDate || '-',
      startDate: h.startDate || '-',
      closedDate: h.closedDate || '-',
      status: h.status || 'On Progress',
      remarks: h.remarks || '-'
    }))

    await exportSubItemToExcel({
      parentKode: 'HIGHLIGHT',
      parentNama: 'PROGRAM HIGHLIGHT REPORT',
      subKode: `PERIODE ${MONTH_NAMES[selectedMonth - 1]}`,
      subNamaItem: `Management Highlight ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
      subKeterangan: periodLabel,
      year: selectedYear,
      activities: mappedActivities
    })
  }

  const formInput = (label: string, field: keyof typeof form, type = 'text') => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={form[field] as string}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
      />
    </label>
  )

  const periodLabel = `PERIODE : 01 - ${new Date(selectedYear, selectedMonth, 0).getDate()} ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-16 sm:pb-24">
      {/* ===== HEADER ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <FolderKanban size={22} className="text-brand-600 shrink-0" /> Update Aktivitas
          </h1>
          <p className="text-xs font-medium text-slate-600">Program Highlight Report (Management Highlight) · No. Dokumen: INLHO/REP-F/-021 · {periodLabel}</p>
        </div>
      </div>

      {view === 'cards' ? (
        /* ===== ADMIN: MONTH CARDS (Maksimal 4 Card Per Baris) ===== */
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-600">
              Pilih Periode Bulanan {selectedYear}
            </h2>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {MONTH_NAMES.map((m, i) => {
              const month = i + 1
              const isCurrent = month === today.getMonth() + 1 && selectedYear === today.getFullYear()
              return (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMonth(month)
                    setView('table')
                  }}
                  className={`group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    isCurrent
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 bg-white hover:border-brand-300'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute right-2 top-2 rounded-md bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                      Sekarang
                    </span>
                  )}
                  <span className="text-xl font-bold text-slate-800">{m}</span>
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Action Item</span>
                      <span className="text-slate-800">{stats.bulanan?.[month]?.total ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Closure</span>
                      <span className="text-emerald-600">{stats.bulanan?.[month]?.closure ?? 0}%</span>
                    </div>
                  </div>
                  <span className="mt-1 text-xs font-semibold text-brand-600 opacity-40 transition group-hover:opacity-100">
                    Buka tabel →
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* ===== TABLE VIEW (Format INLHO/REP-F/-021) ===== */
        <div className="space-y-4">
          {/* Responsive List Summary Metrics */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-brand-600 shrink-0" /> Ringkasan Status Aktivitas:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-bold">
              {/* Action Item */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-slate-600">Action Item</span>
                <span className="font-bold text-slate-900 text-sm">{stats.total}</span>
              </div>

              {/* Open */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">
                <span className="text-sky-700">Open</span>
                <span className="font-bold text-sky-900 text-sm">{stats.open}</span>
              </div>

              {/* On Progress */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-amber-700">On Progress</span>
                <span className="font-bold text-amber-900 text-sm">{stats.progress}</span>
              </div>

              {/* Closed */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700">Closed</span>
                <span className="font-bold text-emerald-900 text-sm">{stats.closed}</span>
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-slate-600">Cancelled</span>
                <span className="font-bold text-slate-700 text-sm">{stats.cancelled}</span>
              </div>

              {/* Closure (%) */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-indigo-700">Closure</span>
                <span className="font-bold text-indigo-900 text-sm">{stats.closure}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              {userRole === 'ADMIN' && (
                <button
                  onClick={() => setView('cards')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 cursor-pointer transition-colors shadow-xs"
                  title="Kembali ke pilihan bulan"
                >
                  <ArrowLeft size={15} /> Pilih Bulan Lain
                </button>
              )}
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={selectedBagian}
                onChange={e => setSelectedBagian(e.target.value)}
                className="rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-2 text-sm font-bold text-brand-800 outline-none cursor-pointer"
                title="Filter berdasarkan Bagian (Sistem, IT, HSSE)"
              >
                <option value="ALL">Semua Bagian (Sistem, IT, HSSE)</option>
                <option value="Sistem">Sub Bagian Sistem</option>
                <option value="IT">Sub Bagian IT</option>
                <option value="HSSE">Sub Bagian HSSE</option>
              </select>

              {/* Filter Range Tanggal */}
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

              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari item, PIC, deskripsi..."
                  className="w-full rounded-xl border border-slate-300 py-2 pl-8 pr-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                />
              </div>
            </div>

            {/* Export Excel & Tambah Highlight buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 px-3 py-2 text-xs font-bold hover:bg-emerald-100 shadow-xs cursor-pointer"
                title="Export Data ke Excel Format Document INL (1.jpeg)"
              >
                <FileSpreadsheet size={15} /> Export Excel
              </button>
              <button
                onClick={() => openAddModal()}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-sm cursor-pointer"
              >
                <Plus size={15} /> Tambah Highlight
              </button>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-2.5 py-3 text-center w-10">No</th>
                  <th className="px-2.5 py-3 min-w-44">Item</th>
                  <th className="px-2.5 py-3 min-w-72">Description</th>
                  <th className="px-2.5 py-3 min-w-36">Name PIC</th>
                  <th className="px-2.5 py-3 w-28">Target Date</th>
                  <th className="px-2.5 py-3 w-28">Closed Date</th>
                  <th className="px-2.5 py-3 w-28 text-center">Status</th>
                  <th className="px-2.5 py-3 min-w-48">Remarks</th>
                  <th className="px-2.5 py-3 w-24 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredHighlights.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-2">
                        <FileSpreadsheet size={24} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        Belum ada data highlight pada {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                      </p>
                      <button onClick={() => openAddModal()} className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700">
                        Tambah Highlight Pertama
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedHighlights.map((h, idx) => (
                    <tr key={h.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                      <td className="px-2.5 py-3 text-center font-bold text-slate-600">{startIndex + idx + 1}</td>
                      <td className="px-2.5 py-3 font-bold text-slate-800 whitespace-pre-wrap">
                        {h.bagian && (
                          <span className={`inline-block mr-1.5 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${
                            h.bagian === 'HSSE' ? 'bg-sky-100 text-sky-800 border border-sky-300' : h.bagian === 'IT' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {h.bagian}
                          </span>
                        )}
                        {h.item}
                      </td>
                      <td className="px-2.5 py-3 text-slate-600 whitespace-pre-wrap">{h.description || '-'}</td>
                      <td className="px-2.5 py-3 text-slate-700 font-semibold">{h.namePic || '-'}</td>
                      <td className="px-2.5 py-3 text-slate-600 whitespace-nowrap font-medium">{h.targetDate || '-'}</td>
                      <td className="px-2.5 py-3 text-slate-600 whitespace-nowrap font-medium">{h.closedDate || '-'}</td>
                      <td className="px-2.5 py-3 text-center">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[h.status] || STATUS_COLORS.Open}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-2.5 py-3 text-slate-600 whitespace-pre-wrap font-medium">{h.remarks || '-'}</td>
                      <td className="px-2.5 py-3 print:hidden">
                        <div className="flex justify-center gap-1 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(h)}
                            title="Update Status"
                            className="rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs px-2.5 py-1 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors shadow-xs"
                          >
                            <RefreshCw size={13} /> Update Status
                          </button>
                          <button onClick={() => handleDelete(h.id)} title="Hapus" className="rounded-xl p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===== PAGINATION BAR ===== */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs font-semibold text-slate-600 print:hidden">
            <div className="flex items-center gap-3 flex-wrap">
              <span>
                Menampilkan <strong className="text-slate-900">{filteredHighlights.length > 0 ? startIndex + 1 : 0}</strong>–<strong className="text-slate-900">{endIndex}</strong> dari <strong className="text-slate-900">{filteredHighlights.length}</strong> data
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">|</span>
                <span className="text-slate-600">Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={e => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value={5}>5 / hal</option>
                  <option value={10}>10 / hal</option>
                  <option value={20}>20 / hal</option>
                  <option value={50}>50 / hal</option>
                  <option value={100}>100 / hal</option>
                </select>
              </div>
            </div>

            {filteredHighlights.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Direct Page Input Number */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-xs">
                    <span className="text-xs font-bold text-slate-600">Ke Halaman:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val)) {
                          const target = Math.max(1, Math.min(val, totalPages))
                          setCurrentPage(target)
                        }
                      }}
                      className="w-12 px-1.5 py-0.5 text-center font-semibold text-xs text-brand-700 bg-slate-50 border border-slate-200 rounded outline-none focus:border-brand-500 focus:bg-white"
                    />
                    <span className="text-xs font-bold text-slate-600">/ {totalPages}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  
                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-xl text-xs font-bold transition cursor-pointer ${
                          currentPage === page
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {/* ===== ADD / EDIT MODAL ===== */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              {/* Sticky Modal Top Bar / Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={20} className="text-brand-600 shrink-0" />
                  {editingId ? 'Edit Management Highlight Item' : 'Tambah Management Highlight Item'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1.5 neu-btn text-slate-600 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Middle Input Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Bulan</span>
                      <select
                        value={form.bulan}
                        onChange={e => setForm({ ...form, bulan: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                      >
                        {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Tahun</span>
                      <select
                        value={form.tahun}
                        onChange={e => setForm({ ...form, tahun: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                      >
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Bagian *</span>
                      <select
                        value={form.bagian || 'Sistem'}
                        onChange={e => setForm({ ...form, bagian: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 font-bold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none cursor-pointer bg-white"
                      >
                        <option value="Sistem">Sub Bagian Sistem</option>
                        <option value="IT">Sub Bagian IT</option>
                        <option value="HSSE">Sub Bagian HSSE</option>
                      </select>
                    </label>
                  </div>
                  <div className="md:col-span-4">{formInput('Item / Subject *', 'item')}</div>
                  <div className="md:col-span-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Penanggung Jawab (PIC) - bisa lebih dari satu (Master Data User)
                      </span>
                      <PicSearchDropdown
                        userList={userList}
                        selectedPics={selectedPics}
                        onTogglePic={togglePic}
                      />
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Status</span>
                      <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none cursor-pointer bg-white"
                      >
                        {['Open', 'On Progress', 'Closed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="md:col-span-2">{formInput('Target Date', 'targetDate', 'date')}</div>
                  {form.status === 'Closed' && (
                    <div className="md:col-span-4">{formInput('Closed Date', 'closedDate', 'date')}</div>
                  )}
                  <div className="md:col-span-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Description</span>
                      <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                      />
                    </label>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">Remarks</span>
                      <textarea
                        value={form.remarks}
                        onChange={e => setForm({ ...form, remarks: e.target.value })}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Sticky Modal Bottom Bar / Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !form.item.trim()}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 cursor-pointer transition-colors shadow-xs"
                >
                  {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
