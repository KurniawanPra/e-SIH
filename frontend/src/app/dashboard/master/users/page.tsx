'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Building2,
  Mail,
  Briefcase,
  ShieldCheck
} from 'lucide-react'

export default function MasterUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nama: '',
    email: '',
    jabatan: 'Staff Operasional',
    unit: 'IT & Sistem Operational'
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/esih/users')
      setUsers(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const uniqueUnits = useMemo(() => {
    const set = new Set<string>()
    users.forEach(u => { if (u.unit) set.add(u.unit) })
    return Array.from(set)
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.jabatan.toLowerCase().includes(search.toLowerCase())
      const matchUnit = unitFilter === 'ALL' || u.unit === unitFilter
      return matchSearch && matchUnit
    })
  }, [users, search, unitFilter])

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditId(user.id)
      setForm({
        nama: user.nama,
        email: user.email,
        jabatan: user.jabatan || 'Staff Operasional',
        unit: user.unit || 'IT & Sistem Operational'
      })
    } else {
      setEditId(null)
      setForm({
        nama: '',
        email: '',
        jabatan: 'Staff Operasional',
        unit: 'IT & Sistem Operational'
      })
    }
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama || !form.email) {
      setErrorMsg('Nama Lengkap dan Email wajib diisi')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      if (editId) {
        await api.put(`/api/esih/users/${editId}`, form)
      } else {
        await api.post('/api/esih/users', form)
      }
      setIsModalOpen(false)
      fetchUsers()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/api/esih/users/${id}/toggle`)
      fetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><span className="spinner" /></div>

  const totalActive = users.filter(u => u.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="text-brand-700" size={24} /> Kelola User Sub Bagian Sistem &amp; IT
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manajemen Pengguna &amp; Penanggung Jawab Aktivitas Operasional (PIC IT)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 neu-btn-brand font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={16} /> Tambah User IT Baru
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border-2 border-slate-300 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total User IT</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-slate-300 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">User Aktif</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{totalActive}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-slate-300 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unit Kerja</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{uniqueUnits.length || 1}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-slate-300 shadow-2xs">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Akses PIC</p>
          <p className="text-2xl font-black text-amber-700 mt-1">100%</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau jabatan user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
          />
        </div>
        <select
          value={unitFilter}
          onChange={e => setUnitFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
        >
          <option value="ALL">Semua Unit Kerja ({uniqueUnits.length})</option>
          {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4">Unit Kerja</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-semibold">
                    Tidak ada data user yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-900">{u.nama}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" /> {u.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-slate-400" /> {u.jabatan}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5"><Building2 size={13} className="text-slate-400" /> {u.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(u.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                          u.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {u.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {u.isActive ? 'Aktif' : 'Non-Aktif'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="p-1.5 text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border-2 border-slate-300 text-slate-400 text-xs font-semibold">
            Tidak ada data user yang sesuai.
          </div>
        ) : (
          filteredUsers.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {u.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{u.nama}</h4>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(u.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    u.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {u.isActive ? 'Aktif' : 'Non-Aktif'}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                <p className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Briefcase size={13} className="text-slate-400" /> {u.jabatan}
                </p>
                <p className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-400" /> {u.unit}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleOpenModal(u)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-bold text-xs text-slate-700 flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <Edit2 size={14} /> Edit User
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-700" />
                {editId ? 'Edit Data User SDM' : 'Tambah User SDM Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap Staff IT *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Herbina"
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Resmi INL *</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: herbina@inl.co.id"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Jabatan Staff IT</label>
                <input
                  type="text"
                  placeholder="Contoh: Staff IT Development"
                  value={form.jabatan}
                  onChange={e => setForm({ ...form, jabatan: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Unit Kerja / Divisi</label>
                <input
                  type="text"
                  placeholder="Contoh: IT & Sistem Operational"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-700 font-extrabold text-xs text-white hover:bg-brand-800 transition-colors shadow-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
