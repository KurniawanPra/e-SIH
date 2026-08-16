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
import ModalPortal from '@/components/ModalPortal'

export default function MasterUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [portalUnits, setPortalUnits] = useState<string[]>([])
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

  const fetchPortalUnits = async () => {
    try {
      const res = await api.get('/api/portal/organization-units')
      if (res.data?.data && Array.isArray(res.data.data)) {
        const units = res.data.data
          .map((u: any) => u.nama || u.name || u.unitNama)
          .filter((name: any): name is string => typeof name === 'string' && Boolean(name.trim()))
        setPortalUnits(units)
      }
    } catch (e) {
      // Fallback silently if portal units endpoint is unavailable
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchPortalUnits()
  }, [])

  const uniqueUnits = useMemo(() => {
    const set = new Set<string>()
    portalUnits.forEach(u => set.add(u.trim()))
    users.forEach(u => { if (u.unit) set.add(u.unit.trim()) })
    return Array.from(set).sort()
  }, [users, portalUnits])

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
  const totalInactive = users.filter(u => !u.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="text-brand-700" size={24} /> Kelola User (Portal SSO Terpusat)
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Seluruh data pengguna, hak akses login, jabatan, dan unit kerja dikelola terpusat dari Portal SSO.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs">
          <ShieldCheck size={16} /> Portal SSO Live Data
        </div>
      </div>

      {/* SSO Portal Access Badge / Information Banner */}
      <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200 text-xs text-brand-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="text-brand-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-brand-900 text-sm flex items-center gap-2 flex-wrap">
              Akses Login Portal SSO <span className="text-xs px-2 py-0.5 rounded-md bg-brand-200 text-brand-900 font-mono font-semibold">App ID: 924b0197-31b4-4620-b15e-c037989b49a3</span>
            </div>
            <p className="text-slate-600 font-medium">
              Aplikasi e-SIH membaca data user langsung dari tabel employee Portal SSO. Kartu aplikasi di portal dibatasi khusus untuk karyawan <strong>Sub Bagian Sistem &amp; IT</strong> serta seksi turunannya. Personel luar unit diblokir otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan Mini (Tanpa Icon) */}
      <div className="flex items-center gap-2.5">
        <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-2 text-xs font-bold shadow-xs">
          <span className="text-slate-600">Total User:</span>
          <span className="text-slate-900 font-bold">{users.length}</span>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-2 text-xs font-bold shadow-xs">
          <span className="text-slate-600">User Nonaktif:</span>
          <span className="text-red-600 font-bold">{totalInactive}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
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
          className="px-3.5 py-2.5 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
        >
          <option value="ALL">Semua Unit Kerja ({uniqueUnits.length})</option>
          {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <th className="py-3.5 px-4">Nama User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4">Unit Kerja</th>
                <th className="py-3.5 px-4 text-center">Status Portal SSO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-600 font-semibold">
                    Tidak ada data user yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{u.nama}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-600" /> {u.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-slate-600" /> {u.jabatan}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5"><Building2 size={13} className="text-slate-600" /> {u.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          u.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {u.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {u.isActive ? 'Portal SSO Aktif' : 'Non-Aktif'}
                      </span>
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
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-600 text-xs font-semibold">
            Tidak ada data user yang sesuai.
          </div>
        ) : (
          filteredUsers.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {u.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm leading-tight">{u.nama}</h4>
                    <p className="text-xs text-slate-600">{u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(u.id)}
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                    u.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {u.isActive ? 'Aktif' : 'Non-Aktif'}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                <p className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Briefcase size={13} className="text-slate-600" /> {u.jabatan}
                </p>
                <p className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-600" /> {u.unit}
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
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 z-10">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck size={18} className="text-brand-700" />
                  {editId ? 'Edit Data User IT' : 'Tambah User IT Baru'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 flex flex-col justify-between">
                <div className="space-y-4">
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
                    <label className="text-xs font-bold text-slate-700">Sub Bagian / Unit Kerja Portal *</label>
                    <select
                      value={form.unit}
                      onChange={e => setForm({ ...form, unit: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl neu-select text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                    >
                      {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
                      {!uniqueUnits.includes(form.unit) && form.unit && (
                        <option value={form.unit}>{form.unit}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 bg-white sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg neu-btn font-bold text-xs text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg neu-btn-brand font-semibold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan User'}
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
