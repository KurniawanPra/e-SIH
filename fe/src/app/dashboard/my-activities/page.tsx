'use client'

import { useEffect, useState, useMemo } from 'react'
import { api, getCurrentUser } from '@/lib/api'
import {
  ListChecks,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Calendar,
  FilterX,
  RefreshCw,
  Pencil,
  Plus,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import type { SessionUser } from '@/types/auth'
import ModalPortal from '@/components/ModalPortal'
import { isSamePerson } from '@/lib/utils'

export default function MyActivitiesPage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [itemPrograms, setItemPrograms] = useState<any[]>([])
  const [parentPrograms, setParentPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
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

  const [statusForm, setStatusForm] = useState({
    id: '',
    status: 'Closed',
    tindakLanjut: '',
    closedDate: '',
    dueDate: ''
  })

  const fetchAll = async () => {
    try {
      const [u, r1, r2, r3] = await Promise.all([
        getCurrentUser().catch(() => null),
        api.get('/api/esih/activities'),
        api.get('/api/esih/programs'),
        api.get('/api/esih/program-kerja')
      ])
      setUser(u)
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

  // User's personal activities
  const myActivities = useMemo(() => {
    if (!user?.name) return activities
    const my = { name: user.name, email: user.email }
    return activities.filter((a: any) =>
      isSamePerson(my, { name: a.picNama?.split('/')[0]?.trim(), email: a.picEmail }),
    )
  }, [activities, user])

  // Filtered by year, status, and search query
  const filteredActivities = useMemo(() => {
    return myActivities.filter((a: any) => {
      if (!a.startDate) return false
      const year = new Date(a.startDate).getFullYear()
      if (year !== selectedYear) return false

      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false

      if (search.trim()) {
        const q = search.toLowerCase()
        const matchKegiatan = a.kegiatan?.toLowerCase().includes(q)
        const matchDesc = a.descriptionAction?.toLowerCase().includes(q)
        const matchItem = a.itemName?.toLowerCase().includes(q)
        if (!matchKegiatan && !matchDesc && !matchItem) return false
      }

      return true
    })
  }, [myActivities, selectedYear, statusFilter, search])

  // Stats
  const totalMyTasks = filteredActivities.length
  const openMyTasks = filteredActivities.filter((a: any) => a.status === 'Open' || a.status === 'On Progress').length
  const closedMyTasks = filteredActivities.filter((a: any) => a.status === 'Closed').length
  const closureRate = totalMyTasks > 0 ? Math.round((closedMyTasks / totalMyTasks) * 100) : 0

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [inputPage, setInputPage] = useState('1')
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(1)
    setInputPage('1')
  }, [selectedYear, statusFilter, search])

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

  const openAdd = () => {
    setEditItem(null)
    const firstParent = parentPrograms[0]?.id || ''
    setSelectedParentId(firstParent)
    const availableItems = itemPrograms.filter((i: any) => i.programKerjaId === firstParent)

    setForm({
      idProgram: availableItems[0]?.id || itemPrograms[0]?.id || '',
      kegiatan: '',
      descriptionAction: '',
      startDate: today,
      dueDate: today,
      closedDate: '',
      status: 'On Progress',
      picNama: user?.name || '',
      picEmail: user?.email || '',
      tindakLanjut: '',
      remarks: ''
    })
    setShowModal(true)
  }

  const openEdit = (a: any) => {
    setEditItem(a)
    const parentId = a.program?.programKerjaId || parentPrograms[0]?.id || ''
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
      picEmail: a.picEmail || '',
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
      alert('Gagal menyimpan tugas aktivitas')
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
        closedDate: statusForm.status === 'Closed' ? (statusForm.closedDate || today) : '',
        dueDate: statusForm.dueDate
      })
      setShowStatusModal(false)
      fetchAll()
    } catch {
      alert('Gagal memperbarui status tugas')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-6 mb-12 sm:mb-16">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ListChecks className="text-brand-700" size={24} /> My Activities (Tugas Aktivitas Saya)
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Daftar tugas aktivitas operasional khusus akun <strong className="text-slate-900">{user?.name || 'Staf IT'}</strong>
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 neu-btn-brand font-semibold rounded-lg cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Tambah Tugas Saya
        </button>
      </div>

      {/* Personal KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Badge 1: Total Tasks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600 block">Total Tugas</span>
            <span className="text-2xl font-bold text-slate-900">{totalMyTasks} Task</span>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Tahun {selectedYear}
          </span>
        </div>

        {/* Badge 2: Open Tasks */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 block">Belum Selesai (Open)</span>
            <span className="text-2xl font-bold text-amber-700">{openMyTasks} Task</span>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            Aktif
          </span>
        </div>

        {/* Badge 3: Closure Rate */}
        <div className="bg-brand-50/80 p-4 rounded-2xl border border-brand-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-brand-800 block">Realisasi (Closure %)</span>
            <span className="text-2xl font-bold text-brand-700">{closureRate}%</span>
          </div>
          <span className="text-xs font-bold text-brand-800 bg-white px-2.5 py-1 rounded-lg border border-brand-200">
            {closedMyTasks}/{totalMyTasks} Closed
          </span>
        </div>
      </div>

      {/* Control Bar: Filter Status, Year, & Quick Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
          >
            <option value="ALL">Semua Status ({totalMyTasks})</option>
            <option value="On Progress">On Progress (Berjalan)</option>
            <option value="Open">Open (Belum Dimulai)</option>
            <option value="Closed">Closed (Selesai)</option>
            <option value="Cancelled">Cancelled (Dibatalkan)</option>
          </select>

          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl neu-select text-xs font-semibold text-brand-800 outline-none cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>Tahun {y}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Cari tugas saya..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
          />
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b-2 border-slate-300 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <th className="py-3.5 px-4 w-12 text-center sticky left-0 bg-slate-100 text-slate-900 font-bold z-10 border-r-2 border-slate-300">No</th>
                <th className="py-3.5 px-4 w-48">Program Kerja</th>
                <th className="py-3.5 px-4 min-w-[380px]">Kegiatan</th>
                <th className="py-3.5 px-4 w-32">Tanggal Start</th>
                <th className="py-3.5 px-4 w-32">Due Date</th>
                <th className="py-3.5 px-4 w-36 text-left">Status</th>
                <th className="py-3.5 px-4 w-40 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-600 font-bold">
                    Tidak ada tugas aktivitas pada filter terpilih.
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-300/80">{startIndex + idx + 1}</td>
                    <td className="py-4 px-4 space-y-1">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                        {a.program?.programKerja?.kode} - {a.program?.kode}
                      </span>
                      <p className="font-semibold text-slate-900 text-xs">{a.itemName}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900 text-xs leading-snug">{a.kegiatan}</p>
                      {a.descriptionAction && <p className="text-xs text-slate-600 font-medium mt-0.5">{a.descriptionAction}</p>}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">{a.startDate}</td>
                    <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">{a.dueDate}</td>
                    <td className="py-4 px-4 text-left">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
                        a.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-300' : a.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : a.status === 'Open' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {a.status === 'Closed' ? <CheckCircle2 size={13} /> : a.status === 'Cancelled' ? <XCircle size={13} /> : a.status === 'Open' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        <span className="whitespace-nowrap">{a.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center justify-start gap-1.5">
                        <button
                          onClick={() => openQuickStatus(a)}
                          className="px-2.5 py-1.5 rounded-lg neu-btn text-brand-700 hover:bg-brand-50 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          title="Update Status"
                        >
                          <RefreshCw size={13} /> Update Status
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

      {/* Mobile Card List View */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {paginatedActivities.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-600 font-semibold text-xs">
            Tidak ada tugas aktivitas pada filter terpilih.
          </div>
        ) : (
          paginatedActivities.map((a, idx) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shrink-0 ${
                  a.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-300' : a.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : a.status === 'Open' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {a.status === 'Closed' ? <CheckCircle2 size={12} /> : a.status === 'Cancelled' ? <XCircle size={12} /> : a.status === 'Open' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {a.status}
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">{startIndex + idx + 1}</span>
              </div>

              <div className="space-y-1">
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                  {a.program?.programKerja?.kode} - {a.program?.kode}
                </span>
                <p className="font-semibold text-slate-900 text-sm">{a.itemName}</p>
                <p className="font-bold text-slate-800 text-sm leading-snug">{a.kegiatan}</p>
                {a.descriptionAction && <p className="text-xs text-slate-600 font-medium">{a.descriptionAction}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-600" /> Start: {a.startDate}</span>
                <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-600" /> Due: {a.dueDate}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => openQuickStatus(a)}
                  className="px-3 py-2 rounded-lg neu-btn text-brand-700 hover:bg-brand-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
                >
                  <RefreshCw size={13} /> Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {filteredActivities.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-600">
            Menampilkan <span className="text-brand-700">{startIndex + 1}</span>–<span className="text-brand-700">{endIndex}</span> dari <span className="text-slate-900">{filteredActivities.length}</span> data tugas
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg neu-btn text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <span className="text-xs font-bold text-slate-700">Hal {currentPage} dari {totalPages}</span>
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

      {/* Add / Edit Tugas Modal */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="font-bold text-slate-900 text-base">
                  {editItem ? 'Edit Tugas Saya' : 'Tambah Tugas Saya'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg neu-btn text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitForm} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">1. Program Kerja *</label>
                  <select
                    value={selectedParentId}
                    onChange={e => {
                      setSelectedParentId(e.target.value)
                      const firstItem = itemPrograms.find((i: any) => i.programKerjaId === e.target.value)
                      setForm({ ...form, idProgram: firstItem?.id || '' })
                    }}
                    className="w-full px-3 py-2 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                  >
                    {parentPrograms.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.kode} - {p.namaProgram}</option>
                    ))}
                  </select>
                  <select
                    value={form.idProgram}
                    onChange={e => setForm({ ...form, idProgram: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer mt-2"
                  >
                    {itemPrograms.filter((i: any) => i.programKerjaId === selectedParentId).map((i: any) => (
                      <option key={i.id} value={i.id}>{i.kode} - {i.namaItem}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">2. Kegiatan *</label>
                  <input
                    value={form.kegiatan}
                    onChange={e => setForm({ ...form, kegiatan: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    placeholder="Nama kegiatan yang dikerjakan"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">3. Deskripsi / Action</label>
                  <textarea
                    value={form.descriptionAction}
                    onChange={e => setForm({ ...form, descriptionAction: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    placeholder="Penjelasan detail kegiatan &amp; tindakan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tanggal Start *</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Due Date *</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Open">Open (Belum Dimulai)</option>
                    <option value="On Progress">On Progress (Berjalan)</option>
                    <option value="Closed">Closed (Selesai)</option>
                    <option value="Cancelled">Cancelled (Dibatalkan)</option>
                  </select>
                </div>

                {form.status === 'Closed' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tanggal Closed</label>
                    <input
                      type="date"
                      value={form.closedDate}
                      onChange={e => setForm({ ...form, closedDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tindak Lanjut</label>
                  <textarea
                    value={form.tindakLanjut}
                    onChange={e => setForm({ ...form, tindakLanjut: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    placeholder="Tindak lanjut / catatan"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg neu-btn text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg neu-btn-brand font-semibold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah Tugas'}
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
                  <RefreshCw size={16} className="text-brand-700" /> Update Status Tugas
                </h3>
                <button onClick={() => setShowStatusModal(false)} className="p-1 rounded-lg neu-btn text-slate-600 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={submitQuickStatus} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status Baru *</label>
                  <select
                    value={statusForm.status}
                    onChange={e => setStatusForm({ ...statusForm, status: e.target.value, closedDate: e.target.value === 'Closed' ? statusForm.closedDate || today : '' })}
                    className="w-full px-3 py-2 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Open">Open (Belum Dimulai)</option>
                    <option value="On Progress">On Progress (Berjalan)</option>
                    <option value="Closed">Closed (Selesai)</option>
                    <option value="Cancelled">Cancelled (Dibatalkan)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Date / Due Date</label>
                  <input
                    type="date"
                    value={statusForm.dueDate}
                    onChange={e => setStatusForm({ ...statusForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  />
                </div>



                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tindak Lanjut</label>
                  <textarea
                    value={statusForm.tindakLanjut}
                    onChange={e => setStatusForm({ ...statusForm, tindakLanjut: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    placeholder="Tindak lanjut / catatan"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 rounded-lg neu-btn text-xs font-semibold text-slate-600 cursor-pointer"
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
