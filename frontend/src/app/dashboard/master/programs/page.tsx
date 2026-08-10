'use client'

import { useEffect, useState, useMemo } from 'react'
import { api, getCurrentUser } from '@/lib/api'
import { useYear } from '@/context/YearContext'
import ModalPortal from '@/components/ModalPortal'
import {
  FolderKanban,
  ListChecks,
  Plus,
  Pencil,
  X,
  Search,
  CheckCircle2,
  Clock,
  Users,
  Layers,
  UserCheck,
  Crown
} from 'lucide-react'
import type { SessionUser } from '@/types/auth'

interface ActivityItem {
  id: string
  no: number
  idProgram?: string
  kategoriProgram: string
  itemName: string
  kegiatan: string
  descriptionAction?: string
  startDate: string
  dueDate: string
  closedDate?: string
  status: string
  remarks?: string
  picEmail: string
  picNama: string
  isActive?: boolean
}

interface SubProgram {
  id: string
  programKerjaId: string
  kode: string
  namaItem: string
  status: string
  progress: number
  tahun: number
  keterangan?: string
  activities?: ActivityItem[]
}

interface ParentProgram {
  id: string
  kode: string
  namaProgram: string
  deskripsi?: string
  totalProgress: number
  items: SubProgram[]
}

interface UserOption {
  id: string
  nama: string
  email: string
  jabatan?: string
}

const emptyActivityForm = {
  idProgram: '',
  kegiatan: '',
  descriptionAction: '',
  startDate: new Date().toISOString().split('T')[0],
  dueDate: new Date().toISOString().split('T')[0],
  closedDate: '',
  status: 'On Progress',
  picNama: '',
  picEmail: '',
  remarks: ''
}

export default function DaftarProgramKerjaPage() {
  const { selectedYear } = useYear()
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)
  const [usersList, setUsersList] = useState<UserOption[]>([])
  const [parents, setParents] = useState<ParentProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL')
  const [onlyMyPrograms, setOnlyMyPrograms] = useState(false)

  // TABS STATE: Main Tab (Parent PK: e.g., 'PK-A') & Sub Tab (Child Item: e.g., 'ALL' or 'PROG-A1-2026')
  const [activeParentTab, setActiveParentTab] = useState<string>('PK-A')
  const [activeSubTab, setActiveSubTab] = useState<string>('ALL')

  // Activity Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [activityForm, setActivityForm] = useState({ ...emptyActivityForm })
  const [selectedPics, setSelectedPics] = useState<{ nama: string; email: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = currentUser?.role === 'ADMIN' || !currentUser?.role

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        if (u) {
          setCurrentUser(u)
        }
      })
      .catch(() => {})

    api.get('/api/esih/users')
      .then(res => setUsersList(res.data.data || []))
      .catch(() => {})
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      let res
      try {
        res = await api.get(`/api/esih/program-kerja?year=${selectedYear}`)
      } catch {
        await api.post('/api/auth/demo-login', { role: 'ADMIN' })
        res = await api.get(`/api/esih/program-kerja?year=${selectedYear}`)
      }
      const data: ParentProgram[] = res.data.data || []
      setParents(data)
      if (data.length > 0 && !data.some(p => p.id === activeParentTab)) {
        setActiveParentTab(data[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear])

  // Helper functions to manage Multi-PIC order (1st PIC = PIC Utama)
  const updatePicsState = (newPics: { nama: string; email: string }[]) => {
    setSelectedPics(newPics)
    const picNamaStr = newPics.map(p => p.nama).join(' / ')
    const primaryEmail = newPics[0]?.email || ''
    setActivityForm(prev => ({
      ...prev,
      picNama: picNamaStr,
      picEmail: primaryEmail
    }))
  }

  const addPic = (userObj: { nama: string; email: string }) => {
    if (!selectedPics.some(p => p.nama.toLowerCase() === userObj.nama.toLowerCase())) {
      updatePicsState([...selectedPics, userObj])
    }
  }

  const removePic = (index: number) => {
    const updated = selectedPics.filter((_, i) => i !== index)
    updatePicsState(updated)
  }

  const setAsPrimaryPic = (index: number) => {
    if (index <= 0 || index >= selectedPics.length) return
    const target = selectedPics[index]
    const rest = selectedPics.filter((_, i) => i !== index)
    updatePicsState([target, ...rest])
  }

  // Reset activeSubTab to 'ALL' whenever activeParentTab changes
  const handleParentTabChange = (parentId: string) => {
    setActiveParentTab(parentId)
    setActiveSubTab('ALL')
  }

  // Selected Parent Object
  const currentParent = useMemo(() => {
    return parents.find(p => p.id === activeParentTab) || parents[0]
  }, [parents, activeParentTab])

  // Sub-items of current active Parent
  const currentSubItems = useMemo(() => {
    return currentParent?.items || []
  }, [currentParent])

  // Flat list of all sub-programs for modal selection
  const allSubPrograms = useMemo(() => {
    const list: { id: string; label: string }[] = []
    parents.forEach(p => {
      p.items?.forEach(sub => {
        list.push({
          id: sub.id,
          label: `[${sub.kode}] ${sub.namaItem} (${p.namaProgram})`
        })
      })
    })
    return list
  }, [parents])

  const openAddModal = (subId?: string) => {
    setEditingActivityId(null)
    const defaultPicName = currentUser?.name || 'Kurniawan Pralambang'
    const defaultPicEmail = currentUser?.email || 'kurniawan@inl.co.id'
    const initialPics = [{ nama: defaultPicName, email: defaultPicEmail }]
    const chosenSubId = subId || (activeSubTab !== 'ALL' ? activeSubTab : currentSubItems[0]?.id || allSubPrograms[0]?.id || '')

    setSelectedPics(initialPics)
    setActivityForm({
      ...emptyActivityForm,
      idProgram: chosenSubId,
      picNama: defaultPicName,
      picEmail: defaultPicEmail
    })
    setShowModal(true)
  }

  const openEditModal = (act: ActivityItem) => {
    setEditingActivityId(act.id)
    const rawNames = act.picNama ? act.picNama.split(/[/,;]+/).map(n => n.trim()).filter(Boolean) : []
    const parsedPics = rawNames.map((name, i) => {
      const matchedUser = usersList.find(u => u.nama.toLowerCase() === name.toLowerCase())
      return {
        nama: name,
        email: matchedUser?.email || (i === 0 ? act.picEmail : '')
      }
    })
    setSelectedPics(parsedPics.length > 0 ? parsedPics : [{ nama: act.picNama || '', email: act.picEmail || '' }])

    setActivityForm({
      idProgram: act.idProgram || '',
      kegiatan: act.kegiatan || '',
      descriptionAction: act.descriptionAction || '',
      startDate: act.startDate || new Date().toISOString().split('T')[0],
      dueDate: act.dueDate || new Date().toISOString().split('T')[0],
      closedDate: act.closedDate || '',
      status: act.status || 'On Progress',
      picNama: act.picNama || '',
      picEmail: act.picEmail || '',
      remarks: act.remarks || ''
    })
    setShowModal(true)
  }

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityForm.kegiatan.trim()) {
      alert('Nama Kegiatan wajib diisi')
      return
    }
    if (selectedPics.length === 0) {
      alert('Minimal 1 PIC (PIC Utama) wajib dipilih dari dropdown')
      return
    }
    setSubmitting(true)
    try {
      if (editingActivityId) {
        await api.put(`/api/esih/activities/${editingActivityId}`, activityForm)
      } else {
        await api.post('/api/esih/activities', activityForm)
      }
      setShowModal(false)
      fetchData()
    } catch {
      alert('Gagal menyimpan Kegiatan Program Kerja')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActivityStatus = async (act: ActivityItem) => {
    const nextStatus = act.status === 'Closed' ? 'On Progress' : 'Closed'
    const todayStr = new Date().toISOString().split('T')[0]
    try {
      await api.put(`/api/esih/activities/${act.id}`, {
        ...act,
        status: nextStatus,
        closedDate: nextStatus === 'Closed' ? todayStr : null
      })
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  // Filter activities based on search, status filter, and user assignment
  const filterActivities = (activities: ActivityItem[] = []) => {
    return activities.filter(act => {
      // 1. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchQ =
          act.kegiatan?.toLowerCase().includes(q) ||
          act.descriptionAction?.toLowerCase().includes(q) ||
          act.picNama?.toLowerCase().includes(q) ||
          act.itemName?.toLowerCase().includes(q) ||
          act.remarks?.toLowerCase().includes(q)
        if (!matchQ) return false
      }

      // 2. Status Filter
      if (statusFilter === 'OPEN') {
        if (act.status === 'Closed' || act.status === 'Cancelled') return false
      } else if (statusFilter === 'CLOSED') {
        if (act.status !== 'Closed' && act.status !== 'Cancelled') return false
      }

      // 3. User Role Assignment Filter
      if (onlyMyPrograms && currentUser) {
        const userEmail = currentUser.email?.toLowerCase() || ''
        const userName = currentUser.name?.toLowerCase() || ''
        const isMyPic =
          act.picEmail?.toLowerCase() === userEmail ||
          act.picNama?.toLowerCase().includes(userName)
        if (!isMyPic) return false
      }

      return true
    })
  }

  // Render PIC Badges distinguishing PIC Utama (1st) from PIC Pendukung (subsequent)
  const renderPicBadges = (picNamaStr: string) => {
    if (!picNamaStr) return <span className="text-slate-400">-</span>
    const names = picNamaStr.split(/[/,;]+/).map(n => n.trim()).filter(Boolean)
    if (names.length === 0) return <span className="text-slate-400">-</span>

    const primaryPic = names[0]
    const secondaryPics = names.slice(1)

    return (
      <div className="flex flex-col gap-1.5">
        {/* PIC Utama Badge */}
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-[11px] font-black text-amber-950 shadow-2xs"
            title="PIC Utama (Penanggung Jawab Utama)"
          >
            <Crown size={12} className="text-amber-600 shrink-0" />
            <span>{primaryPic}</span>
            <span className="text-[9px] bg-amber-200/90 text-amber-950 font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
              Utama
            </span>
          </span>
        </div>

        {/* PIC Pendukung Badges */}
        {secondaryPics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {secondaryPics.map((name, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs"
                title="PIC Pendukung"
              >
                <UserCheck size={10} className="text-slate-500 shrink-0" />
                <span>{name}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Displayed sub-items for active parent tab
  const displayedSubItems = useMemo(() => {
    if (activeSubTab === 'ALL') return currentSubItems
    return currentSubItems.filter(s => s.id === activeSubTab)
  }, [currentSubItems, activeSubTab])

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-slate-800">
            <FolderKanban size={22} className="text-brand-600 shrink-0" />
            {isAdmin ? 'Daftar Program Kerja (Semua Karyawan)' : 'Program Kerja Ku'}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Kelola Project &amp; Kegiatan berdasarkan Tab Program Kerja Induk (A, B, C) dan Sub-Item Program Kerja ({selectedYear}).
          </p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} /> Tambah Project / Kegiatan
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari Project, Kegiatan, PIC, atau kata kunci..."
            className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
          />
        </div>

        {/* Filter Status Pills */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Status
          </button>
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'OPEN' ? 'bg-amber-500 text-white shadow-xs font-black' : 'text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock size={12} /> Masih Open
          </button>
          <button
            onClick={() => setStatusFilter('CLOSED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'CLOSED' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 size={12} /> Sudah Close
          </button>
        </div>

        {/* User filter checkbox */}
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 shrink-0">
          <input
            type="checkbox"
            checked={onlyMyPrograms}
            onChange={e => setOnlyMyPrograms(e.target.checked)}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <UserCheck size={14} className="text-brand-600" />
          <span>Hanya Ditugaskan Ke Saya</span>
        </label>
      </div>

      {/* 1. MAIN TABS (Program Kerja A, B, C) */}
      <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto flex flex-nowrap items-center gap-2.5 scrollbar-thin">
        {parents.map(p => {
          const isActive = p.id === activeParentTab
          const subCount = p.items?.length || 0
          return (
            <button
              key={p.id}
              onClick={() => handleParentTabChange(p.id)}
              className={`flex-1 min-w-[260px] sm:min-w-[280px] shrink-0 flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-white text-emerald-850 font-black border-2 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-700 font-bold border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 border ${
                  isActive ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {p.kode}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-black tracking-tight truncate ${isActive ? 'text-emerald-950' : 'text-slate-900'}`} title={`Program ${p.kode}: ${p.namaProgram}`}>
                    Program {p.kode}: {p.namaProgram}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 truncate">
                    {subCount} Sub-Program Item
                  </div>
                </div>
              </div>
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shrink-0 border ${
                isActive ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {p.totalProgress}%
              </span>
            </button>
          )
        })}
      </div>

      {/* 2. SUB-TABS (Child Sub-Items under active Parent) */}
      {currentParent && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-600" />
                Sub-Item Program Kerja [{currentParent.kode}]:
              </span>
              <button
                onClick={() => setActiveSubTab('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeSubTab === 'ALL'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-black ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Tampilkan Seluruh Sub-Item Program Kerja"
              >
                <Layers size={13} className={activeSubTab === 'ALL' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Lihat Semua Sub-Item ({currentSubItems.length})</span>
              </button>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total {currentSubItems.length} Sub-Item
            </span>
          </div>

          {/* Sub-Item Tabs list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin flex-nowrap">
            {currentSubItems.map(sub => {
              const isActive = sub.id === activeSubTab
              const rawActs = sub.activities || []
              const filteredActs = filterActivities(rawActs)
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 font-bold shrink-0 ${
                    isActive
                      ? 'bg-white text-emerald-900 border-2 border-emerald-600 shadow-2xs font-black ring-2 ring-emerald-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${
                    isActive ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {sub.kode}
                  </span>
                  <span>{sub.namaItem}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold border ${
                    isActive ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {filteredActs.length}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. PROJECTS / ACTIVITIES TABLES (FOR DISPLAYED SUB-ITEMS) */}
      <div className="space-y-5">
        {displayedSubItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 font-semibold text-sm">
            Tidak ada Sub-Item Program Kerja untuk kelompok ini.
          </div>
        ) : (
          displayedSubItems.map(sub => {
            const rawActivities = sub.activities || []
            const activities = filterActivities(rawActivities)
            const openCount = activities.filter(a => a.status === 'Open' || a.status === 'On Progress').length
            const closedCount = activities.filter(a => a.status === 'Closed' || a.status === 'Cancelled').length

            return (
              <div key={sub.id} className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
                {/* Sub-Item Section Header Banner */}
                <div className="px-4 sm:px-5 py-3.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-700 text-white font-mono font-black text-xs shrink-0">
                      {sub.kode}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">
                        {sub.namaItem}
                      </h3>
                      {sub.keterangan && (
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {sub.keterangan}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      Total: <b>{activities.length}</b> Kegiatan (<b className="text-amber-600">{openCount}</b> Open, <b className="text-emerald-600">{closedCount}</b> Close)
                    </span>
                    <button
                      onClick={() => openAddModal(sub.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus size={14} /> Tambah Kegiatan
                    </button>
                  </div>
                </div>

                {/* Projects / Activities Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                        <th className="py-3 px-3.5 w-12 text-center">No</th>
                        <th className="py-3 px-3.5 min-w-[200px]">Project / Kegiatan</th>
                        <th className="py-3 px-3.5 min-w-[220px]">Action To Be Taken</th>
                        <th className="py-3 px-3.5 min-w-[180px]">Nama PIC (Utama &amp; Pendukung)</th>
                        <th className="py-3 px-3.5 w-24">Target Date</th>
                        <th className="py-3 px-3.5 w-24">Closed Date</th>
                        <th className="py-3 px-3.5 w-32">Status</th>
                        <th className="py-3 px-3.5 min-w-[150px]">Remarks</th>
                        <th className="py-3 px-3.5 w-20 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activities.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">
                            Belum ada Project / Kegiatan tercatat di bawah sub-program {sub.kode} ({sub.namaItem}).
                          </td>
                        </tr>
                      ) : (
                        activities.map((act, index) => {
                          const isOpenStatus = act.status === 'Open' || act.status === 'On Progress'
                          return (
                            <tr key={act.id} className="hover:bg-slate-50/80 transition-colors align-top">
                              <td className="py-3.5 px-3.5 text-center font-bold text-slate-400">
                                {index + 1}
                              </td>
                              <td className="py-3.5 px-3.5 font-extrabold text-slate-900 leading-snug">
                                {act.kegiatan}
                              </td>
                              <td className="py-3.5 px-3.5 text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {act.descriptionAction || '-'}
                              </td>
                              <td className="py-3.5 px-3.5">
                                {renderPicBadges(act.picNama)}
                              </td>
                              <td className="py-3.5 px-3.5 font-medium text-slate-700 whitespace-nowrap">
                                {act.dueDate || act.startDate || '-'}
                              </td>
                              <td className="py-3.5 px-3.5 font-medium text-slate-700 whitespace-nowrap">
                                {act.closedDate || '-'}
                              </td>
                              <td className="py-3.5 px-3.5">
                                <div className="space-y-1">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${
                                      act.status === 'Closed'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : act.status === 'On Progress'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : act.status === 'Open'
                                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-300'
                                    }`}
                                  >
                                    {act.status === 'Closed' ? (
                                      <CheckCircle2 size={12} className="text-emerald-600" />
                                    ) : (
                                      <Clock size={12} className="text-amber-600" />
                                    )}
                                    {act.status}
                                  </span>
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mt-0.5">
                                    {isOpenStatus ? (
                                      <>
                                        <Clock size={11} className="text-amber-500 shrink-0" />
                                        <span>Masih Open</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                        <span>Selesai</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3.5 text-slate-500 whitespace-pre-wrap">
                                {act.remarks || '-'}
                              </td>
                              <td className="py-3.5 px-3.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => openEditModal(act)}
                                    className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                                    title="Edit Project / Kegiatan"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => toggleActivityStatus(act)}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      act.status === 'Closed'
                                        ? 'text-amber-600 hover:bg-amber-50'
                                        : 'text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                    title={act.status === 'Closed' ? 'Tandai Kembali On Progress' : 'Tandai Selesai (Closed)'}
                                  >
                                    {act.status === 'Closed' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Form for Add/Edit Project Activity */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <ListChecks size={18} className="text-brand-700" />
                  {editingActivityId ? 'Edit Project / Kegiatan' : 'Tambah Project / Kegiatan Baru'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-xl neu-btn text-slate-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitActivity} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                <div className="space-y-3.5">
                  {/* Select Sub-Program */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Sub-Program / Item Program Kerja *</label>
                    <select
                      value={activityForm.idProgram}
                      onChange={e => setActivityForm({ ...activityForm, idProgram: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    >
                      {allSubPrograms.map(sp => (
                        <option key={sp.id} value={sp.id}>{sp.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nama Project / Kegiatan */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Nama Project / Kegiatan *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Development module RFID Timbangan SmartWB Phase 2"
                      value={activityForm.kegiatan}
                      onChange={e => setActivityForm({ ...activityForm, kegiatan: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  {/* Action To Be Taken */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Action To Be Taken (Tindakan/Langkah Kerja)</label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Integrasi sistem RFID dengan database timbangan digital & AI CCTV..."
                      value={activityForm.descriptionAction}
                      onChange={e => setActivityForm({ ...activityForm, descriptionAction: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 resize-none"
                    />
                  </div>

                  {/* Dropdown PIC Utama & PIC Pendukung Selection */}
                  <div className="space-y-2.5 border-t border-b border-slate-200 py-3.5 bg-slate-50/70 p-3.5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-slate-800">
                        Pilih PIC (Penanggung Jawab)* — <span className="text-amber-700">PIC #1 Adalah PIC Utama</span>
                      </label>
                      <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                        {selectedPics.length} PIC Dipilih
                      </span>
                    </div>

                    {/* Dropdown Selector */}
                    <div className="flex gap-2">
                      <select
                        value=""
                        onChange={(e) => {
                          const userObj = usersList.find(u => u.id === e.target.value || u.email === e.target.value)
                          if (userObj) addPic(userObj)
                        }}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
                      >
                        <option value="">+ Pilih &amp; Tambah PIC dari Daftar Karyawan...</option>
                        {usersList.map(u => (
                          <option key={u.id || u.email} value={u.id || u.email}>
                            {u.nama} — {u.jabatan || 'Staff'} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* List of Selected PICs with Order & Role Badges */}
                    {selectedPics.length === 0 ? (
                      <p className="text-xs text-red-500 font-bold italic py-1">
                        * Minimal 1 PIC (PIC Utama) harus dipilih dari dropdown.
                      </p>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {selectedPics.map((pic, idx) => {
                          const isPrimary = idx === 0
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                                isPrimary
                                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-300'
                                  : 'bg-white border-slate-200 text-slate-800 font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isPrimary ? (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[10px] shrink-0">
                                    <Crown size={11} className="text-amber-700" /> PIC UTAMA
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] shrink-0">
                                    <UserCheck size={11} className="text-slate-500" /> PIC Pendukung #{idx}
                                  </span>
                                )}
                                <span className="font-extrabold text-slate-900 truncate">{pic.nama}</span>
                                {pic.email && (
                                  <span className="text-[11px] text-slate-400 font-medium truncate">({pic.email})</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => setAsPrimaryPic(idx)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-extrabold cursor-pointer transition-colors"
                                    title="Jadikan orang ini sebagai PIC Utama"
                                  >
                                    Set PIC Utama
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removePic(idx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                  title="Hapus PIC ini"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Auto-filled Email PIC Utama */}
                    <div className="space-y-1 pt-1.5">
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                        Email PIC Utama (Otomatis Dari PIC Pertama)*
                      </label>
                      <input
                        type="email"
                        value={activityForm.picEmail}
                        onChange={e => setActivityForm({ ...activityForm, picEmail: e.target.value })}
                        required
                        readOnly
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-800 outline-none cursor-not-allowed"
                        placeholder="Email PIC Utama akan terisi otomatis saat PIC dipilih..."
                      />
                    </div>
                  </div>

                  {/* Status, Target Date, Closed Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Status *</label>
                      <select
                        value={activityForm.status}
                        onChange={e => setActivityForm({ ...activityForm, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                      >
                        <option value="On Progress">On Progress (Open)</option>
                        <option value="Open">Open (Masih Open)</option>
                        <option value="Closed">Closed (Selesai/Done)</option>
                        <option value="Cancelled">Cancelled (Dibatalkan)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Target Date *</label>
                      <input
                        type="date"
                        value={activityForm.dueDate}
                        onChange={e => setActivityForm({ ...activityForm, dueDate: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Closed Date</label>
                      <input
                        type="date"
                        value={activityForm.closedDate}
                        onChange={e => setActivityForm({ ...activityForm, closedDate: e.target.value })}
                        disabled={activityForm.status !== 'Closed'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Remarks (Catatan Tambahan)</label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Tutup SLA Tepat Waktu / Perlu Perhatian Khusus..."
                      value={activityForm.remarks}
                      onChange={e => setActivityForm({ ...activityForm, remarks: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 bg-white sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-brand-600 text-white font-extrabold text-xs hover:bg-brand-700 transition-colors shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : editingActivityId ? 'Simpan Perubahan' : 'Simpan Project / Kegiatan'}
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
