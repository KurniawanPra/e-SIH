'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  ListChecks,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle
} from 'lucide-react'
import ModalPortal from '@/components/ModalPortal'

import { useYear } from '@/context/YearContext'
import { useToast } from '@/context/ToastContext'

interface SubItem {
  id?: string
  kode: string
  namaItem: string
  status: string
  progress: number
  keterangan?: string
  isActive?: boolean
}

interface ParentPK {
  id: string
  kode: string
  namaProgram: string
  deskripsi?: string
  totalProgress: number
  items: SubItem[]
  isActive?: boolean
}

export default function MasterProgramKerjaPage() {
  const { toast } = useToast()
  const { selectedYear } = useYear()
  const [parents, setParents] = useState<ParentPK[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>('ALL')
  
  // Program Modal State
  const [showProgramModal, setShowProgramModal] = useState(false)
  const [editProgram, setEditProgram] = useState<ParentPK | null>(null)
  const [programForm, setProgramForm] = useState({ kode: '', namaProgram: '', deskripsi: '' })
  
  // Sub-Item Modal State (Add/Edit Sub-Item under a Program)
  const [showSubModal, setShowSubModal] = useState(false)
  const [selectedParentForSub, setSelectedParentForSub] = useState<ParentPK | null>(null)
  const [editSubItemObj, setEditSubItemObj] = useState<SubItem | null>(null)
  const [subForm, setSubForm] = useState({ kode: '', namaItem: '', status: 'On Progress', progress: 0, keterangan: '' })

  const [submitting, setSubmitting] = useState(false)

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    isDanger?: boolean
    onConfirm: () => Promise<void> | void
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/esih/program-kerja?year=${selectedYear}`)
      const data: ParentPK[] = res.data.data || []
      setParents(data)
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear])

  // Program Modal Handlers
  const openAddProgram = () => {
    setEditProgram(null)
    setProgramForm({ kode: '', namaProgram: '', deskripsi: '' })
    setShowProgramModal(true)
  }

  const openEditProgram = (p: ParentPK) => {
    setEditProgram(p)
    setProgramForm({ kode: p.kode, namaProgram: p.namaProgram, deskripsi: p.deskripsi || '' })
    setShowProgramModal(true)
  }

  const submitProgramForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editProgram) {
        await api.put(`/api/esih/program-kerja/${editProgram.id}`, { ...programForm, tahun: selectedYear })
        toast.success(`Program Kerja [${programForm.kode}] berhasil diperbarui`, 'Sukses Diperbarui')
      } else {
        await api.post('/api/esih/program-kerja', { ...programForm, tahun: selectedYear })
        toast.success(`Program Kerja [${programForm.kode}] berhasil ditambahkan`, 'Sukses Ditambahkan')
      }
      setShowProgramModal(false)
      fetchData()
    } catch {
      toast.error('Gagal menyimpan Program Kerja', 'Terjadi Kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleProgramActive = (p: ParentPK) => {
    setConfirmModal({
      open: true,
      title: 'Ubah Status Program Kerja',
      message: `Apakah Anda yakin ingin ${p.isActive ? 'menonaktifkan' : 'mengaktifkan'} Program Kerja [${p.kode}] "${p.namaProgram}"?`,
      confirmLabel: p.isActive ? 'Nonaktifkan' : 'Aktifkan',
      isDanger: p.isActive,
      onConfirm: async () => {
        try {
          await api.patch(`/api/esih/program-kerja/${p.id}/toggle`)
          toast.success(`Status Program Kerja [${p.kode}] berhasil diubah`, 'Status Diperbarui')
          fetchData()
        } catch (e) {
          console.error(e)
          toast.error('Gagal mengubah status Program Kerja', 'Terjadi Kesalahan')
        }
      }
    })
  }

  // Sub-Item Modal Handlers
  const openAddSubItem = (parent: ParentPK) => {
    setSelectedParentForSub(parent)
    setEditSubItemObj(null)
    const nextNum = (parent.items?.length || 0) + 1
    setSubForm({
      kode: `${parent.kode}.${nextNum}`,
      namaItem: '',
      status: 'On Progress',
      progress: 0,
      keterangan: ''
    })
    setShowSubModal(true)
  }

  const openEditSubItem = (parent: ParentPK, item: SubItem) => {
    setSelectedParentForSub(parent)
    setEditSubItemObj(item)
    setSubForm({
      kode: item.kode,
      namaItem: item.namaItem,
      status: item.status || 'On Progress',
      progress: item.progress || 0,
      keterangan: item.keterangan || ''
    })
    setShowSubModal(true)
  }

  const submitSubForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedParentForSub) return
    setSubmitting(true)

    try {
      if (editSubItemObj && editSubItemObj.id) {
        await api.put(`/api/esih/programs/${editSubItemObj.id}`, {
          programKerjaId: selectedParentForSub.id,
          tahun: selectedYear,
          ...subForm
        })
        toast.success(`Sub-Item [${subForm.kode}] berhasil diperbarui`, 'Sukses Diperbarui')
      } else {
        await api.post('/api/esih/programs', {
          programKerjaId: selectedParentForSub.id,
          tahun: selectedYear,
          ...subForm
        })
        toast.success(`Sub-Item [${subForm.kode}] berhasil ditambahkan`, 'Sukses Ditambahkan')
      }
      setShowSubModal(false)
      fetchData()
    } catch {
      toast.error('Gagal menyimpan Sub-Item Program', 'Terjadi Kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSubItemActive = (sub: SubItem) => {
    if (!sub.id) return
    const isCurrentlyActive = sub.isActive !== false
    setConfirmModal({
      open: true,
      title: 'Ubah Status Sub-Item',
      message: `Apakah Anda yakin ingin ${isCurrentlyActive ? 'menonaktifkan' : 'mengaktifkan'} Sub-Item [${sub.kode}] "${sub.namaItem}"?`,
      confirmLabel: isCurrentlyActive ? 'Nonaktifkan' : 'Aktifkan',
      isDanger: isCurrentlyActive,
      onConfirm: async () => {
        try {
          await api.patch(`/api/esih/programs/${sub.id}/toggle`)
          toast.success(`Status Sub-Item [${sub.kode}] berhasil diubah`, 'Status Diperbarui')
          fetchData()
        } catch (e) {
          console.error(e)
          toast.error('Gagal mengubah status Sub-Item', 'Terjadi Kesalahan')
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 sm:pb-32">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FolderKanban className="text-brand-700 shrink-0" size={22} />
            <span>Kelola Program Kerja &amp; Sub-Item</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Daftar Program Kerja Induk beserta rincian Sub-Item Program Kerja di dalamnya ({selectedYear}).
          </p>
        </div>
        <button
          onClick={openAddProgram}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Program Kerja Induk</span>
        </button>
      </div>

      {/* Program Cards & Sub-Item List */}
      <div className="space-y-4">
        {parents.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-xs text-center text-slate-600 font-semibold text-xs">
            Belum ada data Program Kerja. Silakan tambah Program Kerja baru.
          </div>
        ) : (
          parents.map((p) => {
            const isExpanded = expandedId === p.id || expandedId === 'ALL'
            const activeItems = (p.items || []).filter(i => i.isActive !== false)

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl shadow-xs overflow-hidden transition-all ${
                  !p.isActive ? 'opacity-50 bg-slate-50' : ''
                }`}
              >
                {/* Parent Program Main Header Row (No borders on point A, B, C) */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-900 flex items-center justify-center text-base font-bold font-mono shrink-0">
                      {p.kode}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {p.namaProgram}
                        </h3>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          p.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.isActive ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>
                      {p.deskripsi && (
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          {p.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3.5 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="w-full sm:w-44">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1">
                        <span className="text-xs text-slate-500">Total Progress:</span>
                        <span className="text-slate-900 font-mono">{p.totalProgress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            p.totalProgress >= 80 ? 'bg-emerald-500' : p.totalProgress >= 50 ? 'bg-amber-400' : 'bg-brand-600'
                          }`}
                          style={{ width: `${p.totalProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openAddSubItem(p)}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        title="Tambah Sub-Item Program Kerja"
                      >
                        <Plus size={14} /> <span>Sub-Item</span>
                      </button>
                      <button
                        onClick={() => openEditProgram(p)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                        title="Edit Program Kerja Induk"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => toggleProgramActive(p)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                        title={p.isActive ? 'Nonaktifkan Program' : 'Aktifkan Program'}
                      >
                        {p.isActive ? <EyeOff size={15} className="text-slate-600" /> : <Eye size={15} className="text-emerald-700" />}
                      </button>
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                        title="Lihat / Sembunyikan Sub-Item"
                      >
                        {expandedId === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Sub-Items Table Section */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ListChecks size={15} className="text-brand-700" />
                        Rincian Sub-Item Program Kerja ({p.items?.length || 0} Item)
                      </h4>
                      <button
                        onClick={() => openAddSubItem(p)}
                        className="text-xs font-bold text-brand-700 hover:text-brand-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} /> Tambah Sub-Item Baru
                      </button>
                    </div>

                    {!p.items || p.items.length === 0 ? (
                      <div className="bg-white p-5 rounded-2xl shadow-2xs text-center text-xs text-slate-600 font-medium">
                        Belum ada Sub-Item Program Kerja untuk program induk {p.kode}. Klik &ldquo;Tambah Sub-Item Baru&rdquo; untuk menambahkan.
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-2xs overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs min-w-[640px]">
                          <thead>
                            <tr className="bg-slate-100/70 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                              <th className="py-2.5 px-3.5 w-20">Kode</th>
                              <th className="py-2.5 px-3.5">Nama Sub-Item Program</th>
                              <th className="py-2.5 px-3.5 w-28 text-left">Status</th>
                              <th className="py-2.5 px-3.5 w-36">Progress (%)</th>
                              <th className="py-2.5 px-3.5 text-left w-24">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {p.items.map((sub) => (
                              <tr
                                key={sub.id || sub.kode}
                                className={`hover:bg-slate-50 transition-colors ${
                                  sub.isActive === false ? 'opacity-40' : ''
                                }`}
                              >
                                <td className="py-3 px-3.5 font-mono font-bold text-brand-800 whitespace-nowrap">
                                  {sub.kode}
                                </td>
                                <td className="py-3 px-3.5">
                                  <p className="font-semibold text-slate-900">{sub.namaItem}</p>
                                  {sub.keterangan && (
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{sub.keterangan}</p>
                                  )}
                                </td>
                                <td className="py-3 px-3.5 text-left">
                                  <span
                                     className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border whitespace-nowrap ${
                                       sub.status === 'Cancelled'
                                         ? 'bg-red-50 text-red-700 border-red-200'
                                         : sub.status === 'Closed'
                                         ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                         : sub.status === 'On Progress'
                                         ? 'bg-amber-50 text-amber-700 border-amber-200'
                                         : 'bg-sky-50 text-sky-700 border-sky-200'
                                     }`}
                                   >
                                     {sub.status === 'Closed' ? <CheckCircle2 size={11} /> : sub.status === 'Cancelled' ? <AlertCircle size={11} /> : <Clock size={11} />}
                                     <span className="whitespace-nowrap">{sub.status}</span>
                                   </span>
                                </td>
                                <td className="py-3 px-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          sub.progress === 100 ? 'bg-emerald-500' : 'bg-brand-600'
                                        }`}
                                        style={{ width: `${sub.progress}%` }}
                                      />
                                    </div>
                                    <span className="font-mono font-bold text-slate-600 text-xs w-7 text-right">
                                      {sub.progress}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-3.5 text-left">
                                  <div className="inline-flex items-center justify-start gap-1">
                                    <button
                                      onClick={() => openEditSubItem(p, sub)}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                                      title="Edit Sub-Item"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    {sub.id && (
                                      <button
                                        onClick={() => toggleSubItemActive(sub)}
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                                        title={sub.isActive === false ? 'Aktifkan Sub-Item' : 'Nonaktifkan Sub-Item'}
                                      >
                                        {sub.isActive === false ? <Eye size={13} className="text-emerald-700" /> : <EyeOff size={13} />}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Program Induk Modal */}
      {showProgramModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <FolderKanban size={18} className="text-brand-700" />
                  {editProgram ? 'Edit Program Kerja Induk' : 'Tambah Program Kerja Induk'}
                </h3>
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="p-1 rounded-lg neu-btn text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitProgramForm} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Kode Program Induk *</label>
                    <input
                      type="text"
                      placeholder="Contoh: A, B, C"
                      value={programForm.kode}
                      onChange={(e) => setProgramForm({ ...programForm, kode: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Nama Program Kerja *</label>
                    <input
                      type="text"
                      placeholder="Contoh: ENABLING DIGITAL AND RELIABLE OPERATION"
                      value={programForm.namaProgram}
                      onChange={(e) => setProgramForm({ ...programForm, namaProgram: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Deskripsi Ringkas</label>
                    <textarea
                      rows={3}
                      placeholder="Uraian atau tujuan utama program kerja..."
                      value={programForm.deskripsi}
                      onChange={(e) => setProgramForm({ ...programForm, deskripsi: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 bg-white sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setShowProgramModal(false)}
                    className="px-4 py-2 rounded-lg neu-btn font-bold text-xs text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg neu-btn-brand font-semibold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Program'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Sub-Item Modal */}
      {showSubModal && selectedParentForSub && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <ListChecks size={18} className="text-brand-700" />
                  {editSubItemObj ? `Edit Sub-Item: ${editSubItemObj.kode}` : `Tambah Sub-Item ke Program ${selectedParentForSub.kode}`}
                </h3>
                <button
                  onClick={() => setShowSubModal(false)}
                  className="p-1 rounded-lg neu-btn text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitSubForm} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200 text-xs text-brand-900 font-bold">
                    Program Induk: [{selectedParentForSub.kode}] {selectedParentForSub.namaProgram}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Kode Sub-Item *</label>
                      <input
                        type="text"
                        placeholder="A.1"
                        value={subForm.kode}
                        onChange={(e) => setSubForm({ ...subForm, kode: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Nama Sub-Item Program *</label>
                      <input
                        type="text"
                        placeholder="Contoh: IT Development"
                        value={subForm.namaItem}
                        onChange={(e) => setSubForm({ ...subForm, namaItem: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Status Sub-Item</label>
                    <select
                      value={subForm.status}
                      onChange={(e) => setSubForm({ ...subForm, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="On Progress">On Progress (Berjalan)</option>
                      <option value="Closed">Closed (Selesai)</option>
                      <option value="Open">Open (Belum Dimulai)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Keterangan Tambahan</label>
                    <textarea
                      rows={2}
                      placeholder="Opsional..."
                      value={subForm.keterangan}
                      onChange={(e) => setSubForm({ ...subForm, keterangan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 bg-white sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setShowSubModal(false)}
                    className="px-4 py-2 rounded-lg neu-btn font-bold text-xs text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg neu-btn-brand font-semibold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Sub-Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Action Confirmation Modal */}
      {confirmModal.open && (
        <ModalPortal>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden my-auto animate-zoom-in">
              <div className="p-5 text-center space-y-2.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto border ${
                  confirmModal.isDanger ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  <AlertTriangle size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{confirmModal.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    const action = confirmModal.onConfirm
                    setConfirmModal(prev => ({ ...prev, open: false }))
                    await action()
                  }}
                  className={`px-4 py-2 rounded-lg text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs ${
                    confirmModal.isDanger ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-700 hover:bg-brand-800'
                  }`}
                >
                  {confirmModal.confirmLabel || 'Ya, Lanjutkan'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
