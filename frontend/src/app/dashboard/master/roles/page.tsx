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
  Briefcase
} from 'lucide-react'

export default function AccessControlPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/esih/users')
      setUsers(res.data.data || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-700" size={24} /> Pengaturan Hak Akses User (RBAC)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
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
        <div className="bg-emerald-50/60 rounded-2xl border-2 border-emerald-300 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
            <ShieldCheck size={18} /> Role Admin (Pengelola Sistem)
          </div>
          <ul className="text-xs font-bold text-slate-700 space-y-1.5">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-700" /> Akses Penuh Kelola Master Data (Program Kerja, Item, Users, Hak Akses)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-700" /> Mengedit &amp; Mengubah Seluruh Laporan Aktivitas Tim IT</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-700" /> Pengaturan Sistem &amp; Ekspor Rekapitulasi Eksekutif</li>
          </ul>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 rounded-2xl border-2 border-slate-300 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <UserCheck size={18} /> Role Staff User (PIC IT)
          </div>
          <ul className="text-xs font-bold text-slate-700 space-y-1.5">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-slate-500" /> Mengakses Dashboard &amp; Melihat Laporan Aktivitas</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-slate-500" /> Menginput &amp; Memperbarui Status Aktivitas yang Ditugaskan</li>
            <li className="flex items-center gap-2"><Lock size={14} className="text-amber-600" /> Terbatasi dari Modul Master Data &amp; Konfigurasi Akses</li>
          </ul>
        </div>
      </div>

      {/* User Roles Table */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Pengguna SDM</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Jabatan &amp; Unit Kerja</th>
                <th className="py-3.5 px-4 text-center">Hak Akses (Role)</th>
                <th className="py-3.5 px-4 text-right">Ubah Hak Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        u.role === 'ADMIN' ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {u.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{u.nama}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{u.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" /> {u.email}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <p>{u.jabatan}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{u.unit}</p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${
                      u.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {u.role === 'ADMIN' ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                      {u.role === 'ADMIN' ? 'ADMIN e-SIH' : 'STAFF USER'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs neu-btn ${
                        u.role === 'ADMIN' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.role === 'ADMIN' ? 'Ubah ke Staff User' : 'Jadikan Admin'}
                    </button>
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
