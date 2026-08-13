'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { api } from '@/lib/api'
import {
  ListFilter,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  FolderKanban,
  FilterX,
  ChevronDown,
  ChevronUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  AlertCircle,
  ArrowUp
} from 'lucide-react'

// Custom Searchable Dropdown Component
function SearchableDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Cari...'
}: {
  label: string
  options: { value: string; label: string; subLabel?: string }[]
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((o) => o.value === value)

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.subLabel && o.subLabel.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className={`space-y-1 relative ${isOpen ? 'z-50' : 'z-auto'}`} ref={containerRef}>
      <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 rounded-xl neu-select text-xs font-bold text-slate-900 flex items-center justify-between gap-2 bg-white text-left cursor-pointer outline-none"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'Pilih...'}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border-2 border-slate-300 shadow-xl z-[100] p-2 space-y-2 animate-dropdown-in max-h-64 flex flex-col">
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-1 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-bold">
                Tidak ada pilihan cocok.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs text-left transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 text-brand-800 font-black'
                        : 'hover:bg-slate-100 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate leading-tight">{opt.label}</p>
                      {opt.subLabel && <p className="text-[10px] text-slate-400 font-normal truncate">{opt.subLabel}</p>}
                    </div>
                    {isSelected && <Check size={14} className="text-brand-700 shrink-0" />}
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

// Custom Status Dropdown Component
function CustomStatusDropdown({
  value,
  onChange
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const statuses = [
    { value: 'ALL', label: 'Semua Status', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { value: 'Closed', label: 'Closed (Selesai)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 'On Progress', label: 'On Progress (Berjalan)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'Open', label: 'Open (Belum Dimulai)', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'Cancelled', label: 'Cancelled (Dibatalkan)', color: 'bg-slate-100 text-slate-600 border-slate-300' }
  ]

  const currentStatus = statuses.find((s) => s.value === value) || statuses[0]

  return (
    <div className={`space-y-1 relative ${isOpen ? 'z-50' : 'z-auto'}`} ref={containerRef}>
      <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
        Status Aktivitas
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 rounded-xl neu-select text-xs font-bold text-slate-900 flex items-center justify-between gap-2 bg-white text-left cursor-pointer outline-none"
      >
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-black border ${currentStatus.color}`}>
          {currentStatus.value === 'Closed' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
          {currentStatus.label}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border-2 border-slate-300 shadow-xl z-[100] p-1.5 space-y-1 animate-dropdown-in">
          {statuses.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => {
                onChange(st.value)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                value === st.value ? 'bg-slate-100 font-black' : 'hover:bg-slate-50 font-bold'
              }`}
            >
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${st.color}`}>
                {st.value === 'Closed' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {st.label}
              </span>
              {value === st.value && <Check size={14} className="text-slate-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AllActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [parentPrograms, setParentPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Selected Program Kerja Tab ('ALL' or parent.id / parent.kode)
  const [activeTab, setActiveTab] = useState<string>('ALL')

  // Filters
  const [search, setSearch] = useState('')
  const [subItemFilter, setSubItemFilter] = useState('ALL')
  const [userFilter, setUserFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/api/esih/activities'),
      api.get('/api/esih/program-kerja')
    ])
      .then(([r1, r2]) => {
        setActivities(r1.data.data || [])
        setParentPrograms(r2.data.data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // Window scroll listener for Back to Top button
  useEffect(() => {
    const handleWindowScroll = () => {
      setShowBackToTop(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleWindowScroll)
    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [])

  // Sub-items available based on active tab
  const availableSubItems = useMemo(() => {
    if (activeTab === 'ALL') {
      const allSubs: any[] = []
      parentPrograms.forEach((p: any) => {
        if (p.items) {
          p.items.forEach((item: any) => {
            allSubs.push({ ...item, parentKode: p.kode, parentNama: p.namaProgram })
          })
        }
      })
      return allSubs
    }
    const currentParent = parentPrograms.find(
      (p: any) => p.id === activeTab || p.kode === activeTab
    )
    return currentParent?.items || []
  }, [activeTab, parentPrograms])

  const subItemDropdownOptions = useMemo(() => {
    return [
      { value: 'ALL', label: `Semua Sub-Item (${availableSubItems.length})` },
      ...availableSubItems.map((sub: any) => ({
        value: sub.id || sub.kode,
        label: `Item ${sub.kode} — ${sub.namaItem}`,
        subLabel: sub.parentNama ? `Program: ${sub.parentKode} ${sub.parentNama}` : undefined
      }))
    ]
  }, [availableSubItems])

  // Reset Sub-Item Filter when Tab Changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setSubItemFilter('ALL')
  }

  // Unique PICs
  const availablePics = useMemo(() => {
    const picSet = new Set<string>()
    activities.forEach((a: any) => {
      const name = a.picNama?.split('/')[0]?.trim()
      if (name) picSet.add(name)
    })
    return Array.from(picSet).sort()
  }, [activities])

  const picDropdownOptions = useMemo(() => {
    return [
      { value: 'ALL', label: `Semua PIC (${availablePics.length})` },
      ...availablePics.map((pic) => ({
        value: pic,
        label: pic
      }))
    ]
  }, [availablePics])

  // Filtered Activities Calculation
  const filteredActivities = useMemo(() => {
    return activities.filter((a: any) => {
      if (activeTab !== 'ALL') {
        const progId = a.program?.programKerjaId || a.program?.programKerja?.id || a.program?.programKerja?.kode
        const matchesTab = progId === activeTab || a.program?.programKerja?.kode === activeTab
        if (!matchesTab) return false
      }

      if (subItemFilter !== 'ALL') {
        const itemId = a.idProgram || a.program?.id
        const itemKode = a.program?.kode
        if (itemId !== subItemFilter && itemKode !== subItemFilter && a.program?.namaItem !== subItemFilter) {
          return false
        }
      }

      if (userFilter !== 'ALL') {
        const picName = a.picNama?.split('/')[0]?.trim() || ''
        if (picName.toLowerCase() !== userFilter.toLowerCase()) return false
      }

      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false

      if (startDateFilter && a.startDate < startDateFilter) return false
      if (endDateFilter && a.startDate > endDateFilter) return false

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
  }, [activities, activeTab, subItemFilter, userFilter, statusFilter, startDateFilter, endDateFilter, search])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [inputPage, setInputPage] = useState('1')
  const pageSize = 10

  // Reset page when filters or tabs change
  useEffect(() => {
    setCurrentPage(1)
    setInputPage('1')
  }, [activeTab, userFilter, statusFilter, startDateFilter, endDateFilter, search])

  // Sync inputPage when currentPage changes
  useEffect(() => {
    setInputPage(String(currentPage))
  }, [currentPage])

  const totalPages = Math.ceil(filteredActivities.length / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredActivities.length)

  const paginatedActivities = useMemo(() => {
    return filteredActivities.slice(startIndex, startIndex + pageSize)
  }, [filteredActivities, startIndex])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-16 sm:pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ListFilter className="text-brand-700" size={24} /> Semua Aktivitas (Log Master)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Database Log Master Seluruh Aktivitas Operasional ({activities.length} Aktivitas Terdaftar)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 hidden sm:inline">
            Total: <strong className="text-brand-700">{filteredActivities.length}</strong> Aktivitas
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center gap-2 font-extrabold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-all ${
              showFilters || (userFilter !== 'ALL' || statusFilter !== 'ALL' || startDateFilter || endDateFilter)
                ? 'bg-brand-50 text-brand-800 border-2 border-brand-300 shadow-xs'
                : 'neu-btn text-slate-700 hover:text-slate-900'
            }`}
          >
            <ListFilter size={15} />
            <span>Filter Lanjutan</span>
            {(userFilter !== 'ALL' || statusFilter !== 'ALL' || startDateFilter || endDateFilter) && (
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            )}
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Program Kerja Tabs & Quick Search */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="overflow-x-auto scrollbar-thin flex-1 min-w-0">
            <div className="flex items-center gap-2 border-b border-slate-200 min-w-max pb-1">
              <button
                onClick={() => handleTabChange('ALL')}
                className={`px-3.5 py-2 text-xs transition-all cursor-pointer flex items-center gap-2 border-b-3 font-black -mb-[1px] ${
                  activeTab === 'ALL'
                    ? 'border-brand-700 text-brand-700 bg-emerald-50/50 rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl font-bold'
                }`}
              >
                <FolderKanban size={15} className={activeTab === 'ALL' ? 'text-brand-700' : 'text-slate-400'} />
                Semua Program Kerja
              </button>
              {parentPrograms.map((p) => {
                const isActive = activeTab === p.id || activeTab === p.kode
                return (
                  <button
                    key={p.id}
                    onClick={() => handleTabChange(p.id)}
                    className={`px-3.5 py-2 text-xs transition-all cursor-pointer flex items-center gap-2 border-b-3 font-black -mb-[1px] ${
                      isActive
                        ? 'border-brand-700 text-brand-700 bg-emerald-50/50 rounded-t-xl'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl font-bold'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.kode}
                    </span>
                    <span className="truncate max-w-[220px]">{p.namaProgram}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Search Box */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kegiatan, uraian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Collapsible Panel for Advanced Filters (Status, PIC, Range Tanggal) */}
      {showFilters && (
        <div className="bg-white p-4 rounded-2xl border-2 border-brand-200 shadow-sm space-y-3 animate-dropdown-in relative z-50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
              <ListFilter size={15} /> Konfigurasi Filter Spesifik Aktivitas
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Custom Status Dropdown */}
            <CustomStatusDropdown value={statusFilter} onChange={setStatusFilter} />

            {/* Searchable PIC Dropdown */}
            <SearchableDropdown
              label="Penanggung Jawab (PIC)"
              options={picDropdownOptions}
              value={userFilter}
              onChange={setUserFilter}
              placeholder="Cari nama PIC..."
            />

            {/* Range Tanggal Start */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                Filter Tanggal Start
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                  title="Tanggal Mulai"
                />
                <span className="text-xs font-bold text-slate-400">—</span>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                  title="Tanggal Sampai"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Scrollable Table Container */}
      <div className="hidden md:block bg-white rounded-2xl border-2 border-slate-300 shadow-sm relative overflow-hidden">
        {/* Scrollable Container */}
        <div className="overflow-x-auto relative min-w-full">
          <table className="w-full text-left border-collapse min-w-[1350px]">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-300 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center sticky left-0 bg-slate-100 text-slate-900 font-black z-10 border-r-2 border-slate-300 shadow-xs">No</th>
                <th className="py-3.5 px-4 min-w-[400px]">Laporan Kegiatan &amp; Detail Uraian</th>
                <th className="py-3.5 px-4 w-32">Tanggal Start</th>
                <th className="py-3.5 px-4 w-32">Target Selesai</th>
                <th className="py-3.5 px-4 w-36 text-center">Status</th>
                <th className="py-3.5 px-4 w-40">PIC</th>
                <th className="py-3.5 px-4 min-w-[180px]">Tindak Lanjut</th>
                <th className="py-3.5 px-4 min-w-[180px]">Kendala</th>
                <th className="py-3.5 px-4 min-w-[180px]">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 font-bold">
                    Tidak ada data aktivitas pada tab/filter terpilih.
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((a, i) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-center font-mono font-black text-slate-800 sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-300/80 shadow-xs">
                      {startIndex + i + 1}
                    </td>

                    {/* Kegiatan & Detail Column */}
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-900 text-xs leading-snug">{a.kegiatan}</p>
                      {a.descriptionAction && (
                        <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                          {a.descriptionAction}
                        </p>
                      )}
                    </td>

                    {/* Tanggal Start */}
                    <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {a.startDate || '-'}
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {a.dueDate || '-'}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${
                          a.status === 'On Progress'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : a.status === 'Open'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {a.status === 'Closed' ? <CheckCircle2 size={13} /> : a.status === 'Open' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {a.status}
                      </span>
                    </td>

                    {/* PIC Column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          {a.picNama?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-800 truncate text-[11px]">
                          {a.picNama?.split('/')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Tindak Lanjut */}
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {a.tindakLanjut ? (
                        <span className="leading-relaxed">{a.tindakLanjut}</span>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>

                    {/* Kendala */}
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {a.kendala ? (
                        <span className="leading-relaxed text-red-700 font-semibold">{a.kendala}</span>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>

                    {/* Keterangan / Remarks */}
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {a.remarks ? (
                        <span className="leading-relaxed">{a.remarks}</span>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginatedActivities.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 text-center text-slate-400 font-semibold text-xs">
            Tidak ada data aktivitas pada tab/filter terpilih.
          </div>
        ) : (
          paginatedActivities.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border-2 border-slate-300 p-4 shadow-2xs space-y-2.5 w-full min-w-0"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 min-w-0">
                <span className="text-[11px] font-bold text-slate-500">
                  Start: <strong className="text-slate-900">{a.startDate || '-'}</strong> | Due:{' '}
                  <strong className="text-slate-900">{a.dueDate || '-'}</strong>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border shrink-0 ${
                    a.status === 'On Progress'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : a.status === 'Open'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 text-sm leading-snug">{a.kegiatan}</p>
                {a.descriptionAction && <p className="text-xs text-slate-500 mt-1">{a.descriptionAction}</p>}
              </div>

              {/* Tindak Lanjut, Kendala & Keterangan on Mobile */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                <p className="text-slate-600 font-medium">
                  <strong className="text-slate-800">Tindak Lanjut:</strong> {a.tindakLanjut || '-'}
                </p>
                <p className="text-slate-600 font-medium">
                  <strong className="text-slate-800">Kendala:</strong> {a.kendala || '-'}
                </p>
                <p className="text-slate-600 font-medium">
                  <strong className="text-slate-800">Keterangan:</strong> {a.remarks || '-'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 text-xs font-bold text-slate-700 min-w-0">
                <span className="flex items-center gap-1.5 truncate min-w-0">
                  <User size={13} className="text-slate-400 shrink-0" />{' '}
                  <span className="truncate min-w-0">{a.picNama?.split('/')[0]}</span>
                </span>
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

      {/* Back to Top Floating Circular Button */}
      {showBackToTop &&
        typeof window !== 'undefined' &&
        createPortal(
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-5 z-[99999] w-12 h-12 rounded-full bg-brand-700 text-white hover:bg-brand-800 shadow-2xl flex items-center justify-center border-2 border-white cursor-pointer transition-all hover:scale-110 animate-zoom-in"
            title="Kembali ke Atas"
          >
            <ArrowUp size={22} strokeWidth={3} />
          </button>,
          document.body,
        )}
    </div>
  )
}
