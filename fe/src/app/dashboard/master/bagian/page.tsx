'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  Search,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import ModalPortal from '@/components/ModalPortal'
import { useToast } from '@/context/ToastContext'

interface MasterBagian {
  id: string
  kode: string
  nama: string
  deskripsi?: string
  isActive: boolean
}

export default function MasterBagianPage() {
  const { toast } = useToast()
  const [bagianList, setBagianList] = useState<MasterBagian[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<MasterBagian | null>(null)
  const [form, setForm] = useState({ kode: '', nama: '', deskripsi: '' })
  const [submitting, setSubmitting] = useState(false)

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    isDanger?: boolean
    onConfirm: () => Promise<void> | void
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const fetchBagian = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/esih/master/bagian')
      setBagianList(res.data.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat master bagian', 'Terjadi Kesalahan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBagian()
  }, [])

  const handleOpenAdd = () => {
    setEditItem(null)
    setForm({ kode: '', nama: '', deskripsi: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (item: MasterBagian) => {
    setEditItem(item)
    setForm({
      kode: item.kode,
      nama: item.nama,
      deskripsi: item.deskripsi || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama.trim()) {
      toast.error('Nama Bagian wajib diisi', 'Validasi Gagal')
      return
    }

    setSubmitting(true)
    try {
      if (editItem) {
        await api.put(`/api/esih/master/bagian/${editItem.id}`, form)
        toast.success(`Master bagian "${form.nama}" berhasil diperbarui`, 'Berhasil')
      } else {
        await api.post('/api/esih/master/bagian', form)
        toast.success(`Master bagian "${form.nama}" berhasil ditambahkan`, 'Berhasil')
      }
      setShowModal(false)
      fetchBagian()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Gagal menyimpan master bagian', 'Terjadi Kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (item: MasterBagian) => {
    try {
      await api.patch(`/api/esih/master/bagian/${item.id}/toggle`)
      toast.success(
        `Status ${item.nama} diubah menjadi ${item.isActive ? 'Nonaktif' : 'Aktif'}`,
        'Status Diperbarui'
      )
      fetchBagian()
    } catch (err) {
      console.error(err)
      toast.error('Gagal memperbarui status', 'Terjadi Kesalahan')
    }
  }

  const handleDelete = (item: MasterBagian) => {
    setConfirmModal({
      open: true,
      title: 'Hapus Master Bagian',
      message: `Apakah Anda yakin ingin menghapus master bagian "${item.nama}"? Opsi ini akan menghapusnya dari pilihan highlight.`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/api/esih/master/bagian/${item.id}`)
          toast.success(`Master bagian "${item.nama}" berhasil dihapus`, 'Terhapus')
          fetchBagian()
        } catch (err) {
          console.error(err)
          toast.error('Gagal menghapus master bagian', 'Terjadi Kesalahan')
        }
      },
    })
  }

  const filtered = bagianList.filter((b) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      b.nama.toLowerCase().includes(q) ||
      b.kode.toLowerCase().includes(q) ||
      (b.deskripsi && b.deskripsi.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl border text-brand-700 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Data Bagian</h1>
              <p className="text-xs text-slate-500 font-medium">
                Kelola daftar Bagian / Unit untuk pilihan dinamis pada formulir dan filter Manajemen Highlight Bulanan.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 font-bold text-xs px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Master Bagian</span>
        </button>
      </div>

      {/* Main Content Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search Bar & Summary */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode, nama, atau deskripsi bagian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total Master Bagian: <span className="font-bold text-slate-900">{filtered.length}</span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-36">Kode Bagian</th>
                <th className="py-3.5 px-4 w-60">Nama Bagian</th>
                <th className="py-3.5 px-4 min-w-[280px]">Deskripsi / Ruang Lingkup</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    Memuat data master bagian...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">
                    Tidak ada data master bagian yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
                        {item.kode}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                      {item.nama}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium leading-relaxed">
                      {item.deskripsi || '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          item.isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <CheckCircle2 size={12} />
                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggle(item)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            item.isActive
                              ? 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {item.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer"
                          title="Edit Bagian"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus Bagian"
                        >
                          <Trash2 size={14} />
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

      {/* Add / Edit Modal */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-overlay-fade">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Layers size={18} className="text-brand-700" />
                  {editItem ? 'Edit Master Bagian' : 'Tambah Master Bagian'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kode Bagian (Singkatan) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SISTEM, IT, HSSE"
                    value={form.kode}
                    onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Bagian Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sub Bagian Sistem"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Deskripsi / Ruang Lingkup (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Keterangan singkat mengenai tugas atau ruang lingkup bagian ini..."
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl neu-btn text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999999] flex items-center justify-center p-4 animate-overlay-fade">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm p-5 space-y-4 animate-zoom-in">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    confirmModal.isDanger
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{confirmModal.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{confirmModal.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                  className="px-3.5 py-1.5 rounded-xl neu-btn text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await confirmModal.onConfirm()
                    setConfirmModal({ ...confirmModal, open: false })
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                    confirmModal.isDanger
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-brand-700 hover:bg-brand-800'
                  }`}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
