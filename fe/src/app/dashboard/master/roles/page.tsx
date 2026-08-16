'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import {
  ShieldCheck,
  UserCheck,
  Building2,
  Mail,
  Briefcase,
  FolderKanban,
  Save,
  Lock,
  Unlock,
  ChevronDown,
  Check
} from 'lucide-react'
import ModalPortal from '@/components/ModalPortal'
import { useToast } from '@/context/ToastContext'

const MASTER_PROGRAM_KERJA = [
  {
    id: 'PK-A',
    kode: 'A',
    namaProgram: 'ENABLING DIGITAL AND RELIABLE OPERATION',
    deskripsi: 'Program Kerja IT Development, Maintenance, Infrastruktur & Security'
  },
  {
    id: 'PK-B',
    kode: 'B',
    namaProgram: 'DRIVING SUSTAINABLE & RESPONSIBLE OPERATIONS',
    deskripsi: 'Program Kerja Audit, Sertifikasi ISO/RSPO, Halal & Sustainability'
  },
  {
    id: 'PK-C',
    kode: 'C',
    namaProgram: 'HEALTH, SAFETY AND ENVIRONMENT (HSE)',
    deskripsi: 'Program Kerja Tanggap Darurat, K3, Training HSE & Pengelolaan Lingkungan'
  }
]

// Normalizes any program ID formats ('PK-A', 'A', 'A.1', etc.) into standard master IDs ('PK-A', 'PK-B', 'PK-C')
function normalizeProgramIds(rawList: any[]): string[] {
  const set = new Set<string>()
  rawList.forEach(item => {
    const val = String(typeof item === 'string' ? item : item?.programId || '').toUpperCase().trim()
    if (val === 'PK-A' || val === 'A' || val.startsWith('A.') || val.includes('DIGITAL')) {
      set.add('PK-A')
    }
    if (val === 'PK-B' || val === 'B' || val.startsWith('B.') || val.includes('SUSTAINABLE')) set.add('PK-B')
    if (val === 'PK-C' || val === 'C' || val.startsWith('C.') || val.includes('HSE') || val.includes('SAFETY')) set.add('PK-C')
  })
  return Array.from(set)
}

interface ProgramKerjaTriggerButtonProps {
  user: any
  masterPrograms: typeof MASTER_PROGRAM_KERJA
  selectedIds: string[]
  isOpen: boolean
  onToggle: (rect: DOMRect) => void
}

function ProgramKerjaTriggerButton({
  user,
  masterPrograms,
  selectedIds,
  isOpen,
  onToggle,
}: ProgramKerjaTriggerButtonProps) {
  const selected = masterPrograms.filter(p => selectedIds.includes(p.id))

  return (
    <div className="w-full max-w-[240px]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          onToggle(rect)
        }}
        className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs overflow-hidden ${
          selected.length === 0
            ? 'border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-900'
            : 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/80 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
          <FolderKanban size={14} className={selected.length > 0 ? 'text-emerald-700 shrink-0' : 'text-slate-400 shrink-0'} />
          {selected.length === 0 ? (
            <span className="text-slate-500 font-medium truncate">Pilih Program Kerja...</span>
          ) : selected.length === 1 ? (
            <span className="font-bold text-slate-900 truncate" title={`[${selected[0].kode}] ${selected[0].namaProgram}`}>
              [{selected[0].kode}] {selected[0].namaProgram}
            </span>
          ) : (
            <span className="font-bold text-slate-900 truncate">
              Program {selected.map(p => p.kode).join(', ')} ({selected.length} Program)
            </span>
          )}
        </div>
        <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}

export default function RolesManagementPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string[]>>({})
  const [activeDropdown, setActiveDropdown] = useState<{ userId: string; rect: DOMRect } | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/esih/users')
      const data = res.data.data || []
      setUsers(data)
      const initial: Record<string, string[]> = {}
      data.forEach((u: any) => {
        initial[u.id] = normalizeProgramIds(u.programs || [])
      })
      setDrafts(initial)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Close dropdown on window scroll
  useEffect(() => {
    const handleScroll = () => {
      if (activeDropdown) setActiveDropdown(null)
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [activeDropdown])

  const toggleProgram = (userId: string, programId: string) => {
    setDrafts(prev => {
      const cur = prev[userId] || []
      const next = cur.includes(programId)
        ? cur.filter(id => id !== programId)
        : [...cur, programId]
      return {
        ...prev,
        [userId]: next,
      }
    })
  }

  const isDirty = (u: any) => {
    const current = normalizeProgramIds(u.programs || [])
    const draft = drafts[u.id] || []
    if (current.length !== draft.length) return true
    return current.some(id => !draft.includes(id)) || draft.some(id => !current.includes(id))
  }

  const saveAssignment = async (u: any) => {
    setSavingId(u.id)
    try {
      const selectedProgramIds = drafts[u.id] || []
      await api.put(`/api/esih/users/${u.id}`, { programIds: selectedProgramIds })
      await fetchUsers()
      toast.success(`Penugasan program kerja ${u.nama} berhasil disimpan`, 'Penugasan Berhasil')
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan penugasan program kerja', 'Terjadi Kesalahan')
    } finally {
      setSavingId(null)
    }
  }

  const handleRoleToggle = async (u: any) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN'
    try {
      await api.put(`/api/esih/users/${u.id}`, { role: newRole })
      await fetchUsers()
      if (newRole === 'ADMIN') {
        toast.success(`Berhasil menjadikan ${u.nama} sebagai Admin e-SIH`, 'Hak Akses Diperbarui')
      } else {
        toast.info(`Hak akses ${u.nama} berhasil diubah menjadi User (PIC IT)`, 'Hak Akses Diperbarui')
      }
    } catch {
      toast.error('Gagal mengubah hak akses role', 'Terjadi Kesalahan')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><span className="spinner" /></div>

  const totalAdmins = users.filter(u => u.role === 'ADMIN').length
  const totalUsers = users.filter(u => u.role !== 'ADMIN').length

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

  return (
    <div className="space-y-6 pb-24 sm:pb-32">
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
            Total Admin: <strong className="text-emerald-700">{totalAdmins}</strong> | User: <strong className="text-slate-900">{totalUsers}</strong>
          </span>
        </div>
      </div>

      {/* Role Capabilities Matrix Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Admin Card */}
        <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/80 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
            <h3 className="text-emerald-950 font-bold text-xs uppercase tracking-wider">
              Role Admin (Pengelola Sistem)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              Hak Akses Penuh
            </span>
          </div>
          <div className="text-xs text-slate-700 space-y-2 font-medium leading-relaxed">
            <p>
              Wewenang penuh untuk mengelola Master Data Program Kerja, Sub-Item, penugasan pengguna, pengaturan hak akses, serta memantau Executive Dashboard lintas seksi.
            </p>
            <p className="text-[11px] text-emerald-900 font-semibold bg-white/80 p-2.5 rounded-xl border border-emerald-200/70">
              Mencakup wewenang pengelolaan aktivitas operasional dan monitoring untuk <strong>Seksi IT</strong> dan <strong>Seksi MR &amp; HSSE</strong>.
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <h3 className="text-slate-900 font-bold text-xs uppercase tracking-wider">
              Role User (Staff &amp; Personel Operasional)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 border border-slate-300">
              Hak Akses Terbatas
            </span>
          </div>
          <div className="text-xs text-slate-700 space-y-2 font-medium leading-relaxed">
            <p>
              Diberikan kepada PIC operasional untuk memantau KPI personal, melihat daftar program kerja yang ditugaskan, serta menginput dan memperbarui realisasi aktivitas kerja masing-masing.
            </p>
            <p className="text-[11px] text-slate-700 font-semibold bg-white/80 p-2.5 rounded-xl border border-slate-200">
              Data identitas user terhubung langsung dengan Portal SSO terpusat (mencakup pegawai dari <strong>Seksi IT</strong> dan <strong>Seksi MR &amp; HSSE</strong>).
            </p>
          </div>
        </div>
      </div>

      {/* User Roles Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-500 font-medium">Belum ada data user.</p>
          </div>
        ) : (
          users.map(u => {
            const userProgramIds = drafts[u.id] || []

            return (
              <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
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
                        <Mail size={11} className="text-slate-600 shrink-0" /> {getDisplayEmail(u)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border shrink-0 ${
                    u.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {u.role === 'ADMIN' ? <ShieldCheck size={11} /> : <UserCheck size={11} />}
                    {u.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                  <p className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Briefcase size={13} className="text-slate-600 shrink-0" /> <span className="truncate min-w-0">{u.jabatan}</span>
                  </p>
                  <p className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-600 shrink-0" /> <span className="truncate min-w-0">{u.unit}</span>
                  </p>
                  <div className="pt-2">
                    <ProgramKerjaTriggerButton
                      user={u}
                      masterPrograms={MASTER_PROGRAM_KERJA}
                      selectedIds={userProgramIds}
                      isOpen={activeDropdown?.userId === u.id}
                      onToggle={(rect) => {
                        if (activeDropdown?.userId === u.id) {
                          setActiveDropdown(null)
                        } else {
                          setActiveDropdown({ userId: u.id, rect })
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="pt-1 flex justify-end gap-1.5">
                  <button
                    onClick={() => handleRoleToggle(u)}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      u.role === 'ADMIN'
                        ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {u.role === 'ADMIN' ? <Lock size={13} /> : <Unlock size={13} />}
                    {u.role === 'ADMIN' ? 'Ubah ke User' : 'Jadikan Admin'}
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
                    {savingId === u.id ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* User Roles Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <th className="py-3.5 px-4 w-[180px]">Nama</th>
                <th className="py-3.5 px-4 w-[190px]">Email</th>
                <th className="py-3.5 px-4 w-[200px]">Jabatan &amp; Unit Kerja</th>
                <th className="py-3.5 px-4 w-[140px] text-left">Hak Akses (Role)</th>
                <th className="py-3.5 px-4 w-[250px]">Pilih Program Kerja</th>
                <th className="py-3.5 px-4 w-[180px] text-left">Ubah Hak Akses / Simpan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {users.map(u => {
                const userProgramIds = drafts[u.id] || []

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors align-top">
                    <td className="py-3.5 px-4 overflow-hidden">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                          u.role === 'ADMIN' ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
                        }`}>
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 truncate">{u.nama}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-600 overflow-hidden">
                      <span className="flex items-center gap-1.5 truncate"><Mail size={13} className="text-slate-600 shrink-0" /> {getDisplayEmail(u)}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800 overflow-hidden">
                      <p className="truncate">{u.jabatan}</p>
                      <p className="text-xs text-slate-600 font-medium truncate">{u.unit}</p>
                    </td>

                    <td className="py-3.5 px-4 text-left">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
                        u.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                        {u.role === 'ADMIN' ? 'ADMIN e-SIH' : 'USER'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 overflow-hidden">
                      <ProgramKerjaTriggerButton
                        user={u}
                        masterPrograms={MASTER_PROGRAM_KERJA}
                        selectedIds={userProgramIds}
                        isOpen={activeDropdown?.userId === u.id}
                        onToggle={(rect) => {
                          if (activeDropdown?.userId === u.id) {
                            setActiveDropdown(null)
                          } else {
                            setActiveDropdown({ userId: u.id, rect })
                          }
                        }}
                      />
                    </td>

                    <td className="py-3.5 px-4 text-left">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs neu-btn ${
                          u.role === 'ADMIN' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.role === 'ADMIN' ? 'Ubah ke User' : 'Jadikan Admin'}
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE FLOATING DROPDOWN PORTAL (Pure Program Kerja Selection Only) */}
      {activeDropdown && (() => {
        const u = users.find(user => user.id === activeDropdown.userId)
        if (!u) return null
        const userProgramIds = drafts[u.id] || []
        const rect = activeDropdown.rect

        // Viewport calculation: Flip UP if not enough space below
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const showAbove = spaceBelow < 250 && spaceAbove > spaceBelow

        const width = 320
        const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16))

        return (
          <ModalPortal>
            <div
              className="fixed inset-0 z-[99998]"
              onClick={() => setActiveDropdown(null)}
            />
            <div
              style={{
                position: 'fixed',
                ...(showAbove
                  ? { bottom: `${window.innerHeight - rect.top + 6}px` }
                  : { top: `${rect.bottom + 6}px` }),
                left: `${left}px`,
                width: `${width}px`,
                zIndex: 99999,
              }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-1.5 animate-zoom-in max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Pilih Program Kerja</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  {userProgramIds.length} Dipilih
                </span>
              </div>

              <div className="space-y-1 pt-1">
                {MASTER_PROGRAM_KERJA.map(parent => {
                  const isSelected = userProgramIds.includes(parent.id)

                  return (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => toggleProgram(u.id, parent.id)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 shadow-2xs'
                          : 'hover:bg-slate-50 text-slate-700 font-medium border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {parent.kode}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-slate-900 leading-tight">
                            Program {parent.kode}: {parent.namaProgram}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5 truncate">
                            {parent.deskripsi}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProgram(u.id, parent.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </ModalPortal>
        )
      })()}
    </div>
  )
}
