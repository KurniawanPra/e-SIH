'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
  Lock,
  Unlock,
  Building2,
  Mail,
  Briefcase,
  FolderKanban,
  Save
} from 'lucide-react'

export default function AccessControlPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [programs, setPrograms] = useState<any[]>([])
  const [drafts, setDrafts] = useState<Record<string, string[]>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/esih/users')
      setUsers(res.data.data || [])
      const d: Record<string, string[]> = {}
      ;(res.data.data || []).forEach((u: any) => {
        d[u.id] = (u.programs || []).map((p: any) => p.programId).filter(Boolean)
      })
      setDrafts(d)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    api.get('/api/esih/programs').then(r => setPrograms(r.data.data || [])).catch(() => setPrograms([]))
  }, [])

  const progLabel = (p: any) =>
    p ? `${p.programKerja?.kode || ''} - ${p.namaItem} (${p.programKerja?.namaProgram || 'Program'})` : ''

  const progShort = (p: any) => (p ? `${p.programKerja?.namaProgram || ''} · ${p.namaItem}` : '')

  const toggleProgram = (userId: string, programId: string) => {
    setDrafts(prev => {
      const cur = prev[userId] || []
      return {
        ...prev,
        [userId]: cur.includes(programId) ? cur.filter(id => id !== programId) : [...cur, programId],
      }
    })
  }

  const isDirty = (u: any) => {
    const current = (u.programs || []).map((p: any) => p.programId).filter(Boolean)
    const draft = drafts[u.id] || []
    return current.length !== draft.length || current.some((id: string) => !draft.includes(id))
  }

  const saveAssignment = async (u: any) => {
    setSavingId(u.id)
    try {
      await api.put(`/api/esih/users/${u.id}`, { programIds: drafts[u.id] || [] })
      await fetchUsers()
      alert(`Penugasan sub-program ${u.nama} berhasil disimpan${u.role !== 'ADMIN' ? '. Admin akan menerima notifikasi perubahan.' : ''}`)
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan penugasan sub-program')
    } finally {
      setSavingId(null)
    }
  }

  const ProgramChips = ({ u }: { u: any }) => (
    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
      {programs.length === 0 && <span className="text-xs text-slate-600 font-semibold">Belum ada sub-program.</span>}
      {programs.map(p => {
        const active = (drafts[u.id] || []).includes(p.id)
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => toggleProgram(u.id, p.id)}
            title={progLabel(p)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition cursor-pointer ${
              active
                ? 'border-brand-500 bg-brand-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
            }`}
          >
            {p.namaItem}
          </button>
        )
      })}
    </div>
  )

  const handleRoleToggle = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    try {
      await api.put(`/api/esih/users/${id}`, { role: newRole })
      fetchUsers()
    } catch {
      alert('Gagal mengubah hak akses role')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><span className="spinner" /></div>

  const totalAdmins = users.filter(u => u.role === 'ADMIN').length
  const totalUsers = users.filter(u => u.role !== 'ADMIN').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-700" size={24} /> Pengaturan Hak Akses User (RBAC)
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Manajemen Peran &amp; Wewenang Pengguna Aplikasi e-SIH Operation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300">
            Total Admin: <strong className="text-emerald-700">{totalAdmins}</strong> | Staff User: <strong className="text-slate-900">{totalUsers}</strong>
          </span>
        </div>
      </div>

      {/* Role Capabilities Matrix Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Admin Card */}
        <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <ShieldCheck size={18} /> Role Admin (Pengelola Sistem)
          </div>
          <ul className="text-xs font-bold text-slate-700 space-y-1.5">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-700" /> Akses Penuh Kelola Master Data (Program Kerja, Item, Users, Hak Akses)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-700" /> Mengedit &amp; Mengubah Seluruh Laporan Aktivitas Tim IT</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-700" /> Pengaturan Sistem &amp; Ekspor Rekapitulasi Eksekutif</li>
          </ul>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <UserCheck size={18} /> Role Staff User (PIC IT)
          </div>
          <ul className="text-xs font-bold text-slate-700 space-y-1.5">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-slate-600" /> Mengakses Dashboard &amp; Melihat Laporan Aktivitas</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-slate-600" /> Menginput &amp; Memperbarui Status Aktivitas yang Ditugaskan</li>
            <li className="flex items-center gap-2"><Lock size={14} className="text-amber-600" /> Terbatasi dari Modul Master Data &amp; Konfigurasi Akses</li>
          </ul>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {users.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-600 text-xs font-semibold">
            Tidak ada data user yang tersedia.
          </div>
        ) : (
          users.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                    u.role === 'ADMIN' ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {u.nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm leading-tight truncate min-w-0">{u.nama}</h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1 truncate min-w-0">
                      <Mail size={11} className="text-slate-600 shrink-0" /> {u.email}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border shrink-0 ${
                  u.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {u.role === 'ADMIN' ? <ShieldCheck size={11} /> : <UserCheck size={11} />}
                  {u.role === 'ADMIN' ? 'ADMIN' : 'STAFF'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                <p className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Briefcase size={13} className="text-slate-600 shrink-0" /> <span className="truncate min-w-0">{u.jabatan}</span>
                </p>
                <p className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-600 shrink-0" /> <span className="truncate min-w-0">{u.unit}</span>
                </p>
                <div className="pt-1">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                    <FolderKanban size={12} /> Sub-Program Penugasan
                  </p>
                  <ProgramChips u={u} />
                </div>
              </div>

              <div className="pt-1 flex justify-end gap-1.5">
                <button
                  onClick={() => handleRoleToggle(u.id, u.role)}
                  className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    u.role === 'ADMIN'
                      ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {u.role === 'ADMIN' ? <Lock size={13} /> : <Unlock size={13} />}
                  {u.role === 'ADMIN' ? 'Ubah ke Staff User' : 'Jadikan Admin'}
                </button>
                <button
                  onClick={() => saveAssignment(u)}
                  disabled={!isDirty(u) || savingId === u.id}
                  className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    !isDirty(u)
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  <Save size={13} />
                  {savingId === u.id ? 'Menyimpan...' : 'Simpan Penugasan'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Roles Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <th className="py-3.5 px-4">Nama Pengguna SDM</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Jabatan &amp; Unit Kerja</th>
                <th className="py-3.5 px-4 text-center">Hak Akses (Role)</th>
                <th className="py-3.5 px-4 min-w-64">Sub-Program Penugasan (Bisa Lebih Dari Satu)</th>
                <th className="py-3.5 px-4 text-right">Ubah Hak Akses / Simpan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        u.role === 'ADMIN' ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {u.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.nama}</p>
                        <p className="text-xs text-slate-600 font-medium">{u.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-600" /> {u.email}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <p>{u.jabatan}</p>
                    <p className="text-xs text-slate-600 font-medium">{u.unit}</p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
                      u.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {u.role === 'ADMIN' ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                      {u.role === 'ADMIN' ? 'ADMIN e-SIH' : 'STAFF USER'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-slate-600">
                      <FolderKanban size={11} /> Pilih sub-program tempat user bekerja
                    </div>
                    <ProgramChips u={u} />
                    {(drafts[u.id] || []).length > 0 && (
                      <p className="mt-1.5 text-xs font-bold text-brand-700">Terpilih: {(drafts[u.id] || []).length} sub-program</p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs neu-btn ${
                        u.role === 'ADMIN' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.role === 'ADMIN' ? 'Ubah ke Staff User' : 'Jadikan Admin'}
                    </button>
                    <div className="mt-2">
                      <button
                        onClick={() => saveAssignment(u)}
                        disabled={!isDirty(u) || savingId === u.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs neu-btn w-full ${
                          !isDirty(u)
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-sky-700 hover:bg-sky-50'
                        }`}
                      >
                        {savingId === u.id ? 'Menyimpan...' : (<span className="inline-flex items-center gap-1"><Save size={13} /> Simpan Penugasan</span>)}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
