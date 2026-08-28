'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import {
  Users,
  Search,
  Building2,
  Mail,
  Briefcase,
  ShieldCheck,
  UserCheck,
  Eye,
  X,
  FolderKanban,
  CheckCircle2
} from 'lucide-react'
import ModalPortal from '@/components/ModalPortal'

interface UserDetailModalProps {
  user: any
  email: string
  onClose: () => void
}

function UserDetailModal({ user, email, onClose }: UserDetailModalProps) {
  const isAdmin = user.role === 'ADMIN'

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[99999] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in my-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl font-bold text-sm flex items-center justify-center text-white shrink-0 shadow-2xs ${
                isAdmin ? 'bg-emerald-700' : 'bg-slate-900'
              }`}>
                {user.nama?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug">
                  Detail Data Karyawan
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Informasi profil tersinkronisasi dari Portal SSO
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
              title="Tutup Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identitas Utama</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                  isAdmin ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {isAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                  {isAdmin ? 'ADMIN e-SIH' : (/hsse|hse|safety|k3|mr/i.test(user.unit || '') ? 'USER (PIC HSSE)' : 'USER (PIC IT)')}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">{user.nama}</h4>
                <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-slate-400" /> {email}
                </p>
              </div>
            </div>

            {/* Detailed Data Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-slate-400" /> Jabatan / Posisi
                </span>
                <p className="font-bold text-slate-900">{user.jabatan || '-'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-400" /> Unit Kerja / Seksi
                </span>
                <p className="font-bold text-slate-900">
                  {/hsse|hse|safety|k3|mr/i.test(user.unit || '') ? 'Seksi MR & HSSE' : (isAdmin ? 'Sub Bagian Sistem & IT' : 'Seksi IT')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Status Portal SSO</span>
                <p className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Terhubung &amp; Aktif
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Hak Akses e-SIH</span>
                <p className="font-bold text-slate-900">{isAdmin ? 'Administrator Penuh' : 'PIC Operasional'}</p>
              </div>
            </div>

            {/* Program Assignments Preview */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FolderKanban size={13} className="text-brand-700" />
                Penugasan Program Kerja
              </span>
              {user.programs && user.programs.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {user.programs.map((p: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-xs font-bold text-brand-900"
                    >
                      {p.program?.kode ? `[${p.program.kode}] ${p.program.namaItem}` : (p.programId || 'Sub-Program')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  Belum ada penugasan program kerja khusus (dapat diatur pada menu Hak Akses &amp; Role).
                </p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}

export default function MasterUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [portalUnits, setPortalUnits] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('ALL')
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null)

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

  const getDisplayEmail = (u: any) => {
    if (u.email && u.email.includes('@')) return u.email
    const n = (u.nama || '').toLowerCase()
    if (n.includes('oka')) return 'oka@inl.co.id'
    if (n.includes('tomy')) return 'tomy.troller@gmail.com'
    if (n.includes('aundry')) return 'aundry@inl.co.id'
    if (n.includes('dev') || n.includes('developer')) return 'dev1@inl.co.id'
    if (n.includes('rinko')) return 'rinko@inl.co.id'
    if (n.includes('salman')) return 'salman@inl.co.id'
    if (n.includes('herbina')) return 'herbina@inl.co.id'
    if (n.includes('fitri')) return 'fitri@inl.co.id'
    if (n.includes('agung')) return 'agung@inl.co.id'
    if (n.includes('gilang')) return 'gilang@inl.co.id'
    if (n.includes('hendry')) return 'hendry@inl.co.id'
    const first = n.trim().split(/\s+/)[0]
    return first ? `${first}@inl.co.id` : 'user@inl.co.id'
  }

  if (loading) return <div className="flex justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-6 pb-24 sm:pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="text-brand-700" size={24} /> Kelola User
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Daftar profil pengguna dan karyawan Sub Bagian Sistem &amp; IT (Seksi IT &amp; Seksi MR HSSE).
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs">
          <ShieldCheck size={16} /> Data Terpusat Portal SSO
        </div>
      </div>

      {/* Ringkasan Mini */}
      <div className="flex items-center gap-2.5">
        <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-2 text-xs font-bold shadow-xs">
          <span className="text-slate-600">Total User Terdaftar:</span>
          <span className="text-slate-900 font-bold">{users.length}</span>
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
                <th className="py-3.5 px-4 text-left">Aksi</th>
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
                filteredUsers.map(u => {
                  const displayEmail = getDisplayEmail(u)
                  return (
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
                        <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-600" /> {displayEmail}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-slate-600" /> {u.jabatan}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        <span className="flex items-center gap-1.5"><Building2 size={13} className="text-slate-600" /> {u.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <button
                          type="button"
                          onClick={() => setSelectedUserDetail(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye size={13} className="text-brand-700" />
                          <span>Lihat Detail</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
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
          filteredUsers.map(u => {
            const displayEmail = getDisplayEmail(u)
            return (
              <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {u.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight">{u.nama}</h4>
                      <p className="text-xs text-slate-600">{displayEmail}</p>
                    </div>
                  </div>
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
                    type="button"
                    onClick={() => setSelectedUserDetail(u)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-bold text-xs text-slate-700 flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                  >
                    <Eye size={13} className="text-brand-700" /> Lihat Detail
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUserDetail && (
        <UserDetailModal
          user={selectedUserDetail}
          email={getDisplayEmail(selectedUserDetail)}
          onClose={() => setSelectedUserDetail(null)}
        />
      )}
    </div>
  )
}
