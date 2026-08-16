'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  XCircle,
  Users,
  Layers,
  UserCheck,
  BadgeCheck,
  Filter,
  FilterX,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  FolderLock,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  Check
} from 'lucide-react'
import { exportSubItemToExcel, exportTableToExcel3 } from '@/lib/excelExport'
import type { SessionUser } from '@/types/auth'
import { useToast } from '@/context/ToastContext'
import { isSamePerson } from '@/lib/utils'

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
  role?: string
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

function PicFilterSearchDropdown({
  value,
  onChange,
  options,
  currentUserName,
}: {
  value: string
  onChange: (val: string) => void
  options: string[]
  currentUserName?: string | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return options
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, query])

  const displayLabel =
    value === 'ALL'
      ? 'Semua PIC'
      : value === currentUserName
        ? `${value} (Saya)`
        : value

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex items-center justify-between gap-2 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 shadow-2xs text-xs font-bold text-slate-800 transition-colors cursor-pointer min-w-[200px]"
      >
        <span className="flex items-center gap-1.5 truncate">
          <UserCheck size={13} className="text-brand-700 shrink-0" />
          <span className="truncate">PIC: {displayLabel}</span>
        </span>
        <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-[9999] w-72 max-w-[80vw] rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl space-y-2 animate-dropdown-in">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama PIC..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onChange('ALL')
                setIsOpen(false)
                setQuery('')
              }}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                value === 'ALL' ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Semua PIC
            </button>

            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-500 font-medium">
                Tidak ada PIC cocok
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                    setQuery('')
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    value === opt ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {opt === currentUserName && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                      Saya
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DaftarProgramKerjaPage() {
  const { toast } = useToast()
  const { selectedYear } = useYear()
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)
  const [usersList, setUsersList] = useState<UserOption[]>([])
  const [parents, setParents] = useState<ParentProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'On Progress' | 'Open' | 'Closed' | 'Cancelled'>('ALL')
  const [picFilter, setPicFilter] = useState<string>('ALL')

  // TABS STATE: Main Tab (Parent PK: e.g., 'PK-A') & Sub Tab (Child Item: e.g., 'ALL' or 'PROG-A1-2026')
  const [activeParentTab, setActiveParentTab] = useState<string>('PK-A')
  const [activeSubTab, setActiveSubTab] = useState<string>('ALL')

  // PAGINATION STATE: pageSize (per-page) & subPages (current page per sub-item id)
  const [pageSize, setPageSize] = useState<number>(10)
  const [subPages, setSubPages] = useState<{ [subId: string]: number }>({})

  // Activity Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [activityForm, setActivityForm] = useState({ ...emptyActivityForm })
  const [selectedPics, setSelectedPics] = useState<{ nama: string; email: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  // 1. Searchable Sub-Program Dropdown State inside Modal
  const [subProgramDropdownOpen, setSubProgramDropdownOpen] = useState(false)
  const [subProgramSearchQuery, setSubProgramSearchQuery] = useState('')

  // 2. Searchable PIC Selector Dropdown State inside Modal
  const [picDropdownOpen, setPicDropdownOpen] = useState(false)
  const [picSearchQuery, setPicSearchQuery] = useState('')

  const router = useRouter()
  const isAdmin = currentUser?.role === 'ADMIN'

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        if (u) {
          setCurrentUser(u)
        }
      })
      .catch(() => { })

    api.get('/api/esih/users')
      .then(res => setUsersList(res.data.data || []))
      .catch(() => { })
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/esih/program-kerja?year=${selectedYear}`)
      const data: ParentProgram[] = res.data.data || []
      setParents(data)
      if (data.length > 0) {
        const targetParent = data.find(p => p.id === activeParentTab) || data[0]
        if (!data.some(p => p.id === activeParentTab)) {
          setActiveParentTab(targetParent.id)
        }
        if (targetParent.items && targetParent.items.length > 0 && (activeSubTab === 'ALL' || !targetParent.items.some(s => s.id === activeSubTab))) {
          setActiveSubTab(targetParent.items[0].id)
        }
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

  // Switch parent tab and default activeSubTab to the 1st sub-item of that parent
  const handleParentTabChange = (parentId: string) => {
    setActiveParentTab(parentId)
    const targetParent = parents.find(p => p.id === parentId)
    if (targetParent && targetParent.items && targetParent.items.length > 0) {
      setActiveSubTab(targetParent.items[0].id)
    } else {
      setActiveSubTab('ALL')
    }
  }

  // Check if non-admin user has NO assigned programs
  const userObj = useMemo(() => {
    if (isAdmin) return null
    return usersList.find((u) =>
      isSamePerson(
        { name: currentUser?.name, email: currentUser?.email },
        { name: u.nama, email: u.email },
      ),
    )
  }, [isAdmin, usersList, currentUser])

  const assignedProgramIds = useMemo(() => {
    if (isAdmin) return []
    return ((userObj as any)?.programs || []).map((p: any) => String(p.programId || '')).filter(Boolean)
  }, [isAdmin, userObj])

  // Flag: non-admin user with no program kerja assigned by admin.
  // Sekarang semua program kerja tetap ditampilkan untuk user non-admin,
  // sehingga aktivitas dari semua PIC bisa dipantau.
  const hasNoAssignment = false

  // Displayed Parent Programs (semua program untuk admin dan user non-admin)
  const displayParents = useMemo(() => {
    return parents
  }, [parents])

  // Automatically ensure activeParentTab points to a valid assigned program
  useEffect(() => {
    if (displayParents.length > 0) {
      if (!displayParents.some(p => p.id === activeParentTab)) {
        const firstParent = displayParents[0]
        setActiveParentTab(firstParent.id)
        if (firstParent.items && firstParent.items.length > 0) {
          setActiveSubTab(firstParent.items[0].id)
        }
      }
    }
  }, [displayParents, activeParentTab])

  // Selected Parent Object
  const currentParent = useMemo(() => {
    return displayParents.find(p => p.id === activeParentTab) || displayParents[0] || (parents.length > 0 ? parents[0] : null)
  }, [displayParents, activeParentTab, parents])

  // Sub-items of current active Parent (shows all sub-items under the selected parent program)
  const currentSubItems = useMemo(() => {
    return currentParent?.items || []
  }, [currentParent])

  // Flat list of all sub-programs for dropdowns & selection
  const allSubPrograms = useMemo(() => {
    const list: {
      id: string
      programKerjaId: string
      kode: string
      namaItem: string
      parentKode: string
      parentNama: string
      label: string
    }[] = []
    parents.forEach(p => {
      p.items?.forEach(sub => {
        list.push({
          id: sub.id,
          programKerjaId: p.id,
          kode: sub.kode,
          namaItem: sub.namaItem,
          parentKode: p.kode,
          parentNama: p.namaProgram,
          label: `[${sub.kode}] ${sub.namaItem} (${p.namaProgram})`
        })
      })
    })
    return list
  }, [parents])

  // For non-admin (Staff): filter to only sub-programs that belong to the user (assigned in master roles or containing user's activities)
  const mySubPrograms = useMemo(() => {
    if (isAdmin) return []
    const list: {
      id: string
      programKerjaId: string
      kode: string
      namaItem: string
      parentKode: string
      parentNama: string
      subProgram: SubProgram
    }[] = []

    const userObj = usersList.find(
      u =>
        u.nama.toLowerCase() === currentUser?.name?.toLowerCase() ||
        (currentUser?.email && u.email?.toLowerCase() === currentUser?.email?.toLowerCase())
    )
    const assignedIds: string[] = ((userObj as any)?.programs || []).map((p: any) => p.programId).filter(Boolean)

    parents.forEach(p => {
      p.items?.forEach(sub => {
        const hasMyActivity = (sub.activities || []).some(act =>
          isSamePerson(
            { name: currentUser?.name, email: currentUser?.email },
            { name: act.picNama?.split('/')[0]?.trim(), email: act.picEmail },
          ),
        )
        const isAssigned = assignedIds.includes(sub.id)

        if (hasMyActivity || isAssigned) {
          list.push({
            id: sub.id,
            programKerjaId: p.id,
            kode: sub.kode,
            namaItem: sub.namaItem,
            parentKode: p.kode,
            parentNama: p.namaProgram,
            subProgram: sub
          })
        }
      })
    })

    return list
  }, [isAdmin, parents, usersList, currentUser])

  const filteredSubProgramsForModal = useMemo(() => {
    if (!subProgramSearchQuery.trim()) return allSubPrograms
    const q = subProgramSearchQuery.toLowerCase()
    return allSubPrograms.filter(
      sp =>
        sp.kode.toLowerCase().includes(q) ||
        sp.namaItem.toLowerCase().includes(q) ||
        sp.parentKode.toLowerCase().includes(q) ||
        sp.parentNama.toLowerCase().includes(q)
    )
  }, [allSubPrograms, subProgramSearchQuery])

  const filteredUsersListForModal = useMemo(() => {
    if (!picSearchQuery.trim()) return usersList
    const q = picSearchQuery.toLowerCase()
    return usersList.filter(
      u =>
        u.nama.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.jabatan && u.jabatan.toLowerCase().includes(q))
    )
  }, [usersList, picSearchQuery])

  // Daftar nama PIC untuk filter dropdown "Program Kerja Ku"
  const picOptions = useMemo(() => {
    const set = new Set<string>()
    usersList.forEach((u) => {
      if (u.nama) set.add(u.nama)
    })
    parents.forEach((p) => {
      p.items?.forEach((sub) => {
        sub.activities?.forEach((a) => {
          if (a.picNama) {
            a.picNama.split(/[/,;]+/).forEach((n) => {
              const t = n.trim()
              if (t) set.add(t)
            })
          }
        })
      })
    })
    return Array.from(set).sort()
  }, [usersList, parents])

  const openAddModal = (subId?: string) => {
    if (!isAdmin) return
    setEditingActivityId(null)
    setSubProgramDropdownOpen(false)
    setSubProgramSearchQuery('')
    setPicDropdownOpen(false)
    const defaultPicName = currentUser?.name || usersList.find(u => u.role === 'ADMIN')?.nama || 'Oka Aritonang'
    const defaultPicEmail = currentUser?.email || usersList.find(u => u.role === 'ADMIN')?.email || 'oka@inl.co.id'
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
    if (!isAdmin) return
    setEditingActivityId(act.id)
    setSubProgramDropdownOpen(false)
    setSubProgramSearchQuery('')
    setPicDropdownOpen(false)
    setPicSearchQuery('')
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
    if (!isAdmin) return
    if (!activityForm.kegiatan || !activityForm.idProgram) {
      toast.warning('Kegiatan dan Sub-Program Kerja wajib diisi!', 'Form Belum Lengkap')
      return
    }

    try {
      setSubmitting(true)
      const primaryEmail = selectedPics[0]?.email || activityForm.picEmail || ''
      const payload = {
        ...activityForm,
        picEmail: primaryEmail
      }

      if (editingActivityId) {
        await api.put(`/api/esih/activities/${editingActivityId}`, payload)
        toast.success('Aktivitas program kerja berhasil diperbarui', 'Sukses Diperbarui')
      } else {
        await api.post('/api/esih/activities', payload)
        toast.success('Aktivitas program kerja baru berhasil ditambahkan', 'Sukses Ditambahkan')
      }
      setShowModal(false)
      fetchData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Gagal menyimpan aktivitas', 'Terjadi Kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteActivity = async (id: string, nama: string) => {
    if (!isAdmin) return
    if (!confirm(`Yakin ingin menghapus aktivitas "${nama}"?`)) return
    try {
      await api.delete(`/api/esih/activities/${id}`)
      toast.success(`Aktivitas "${nama}" berhasil dihapus`, 'Aktivitas Dihapus')
      fetchData()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menghapus aktivitas', 'Terjadi Kesalahan')
    }
  }

  const handleToggleActivityStatus = async (act: ActivityItem) => {
    const nextStatus = act.status === 'Closed' ? 'On Progress' : 'Closed'
    const todayStr = new Date().toISOString().split('T')[0]
    const nextClosedDate = nextStatus === 'Closed' ? todayStr : null

    try {
      await api.put(`/api/esih/activities/${act.id}`, {
        status: nextStatus,
        closedDate: nextClosedDate
      })
      toast.success(
        `Status kegiatan "${act.kegiatan}" diubah ke "${nextStatus}"`,
        nextStatus === 'Closed' ? 'Status: Closed (Selesai)' : 'Status: On Progress'
      )
      fetchData()
    } catch (e: any) {
      console.error(e)
      toast.error(e.response?.data?.error || 'Gagal memperbarui status aktivitas', 'Terjadi Kesalahan')
    }
  }

  // Filter activities based on search, status filter, user assignment, and sub-program item ownership
  const filterActivities = (activities: ActivityItem[] = [], currentSub?: SubProgram) => {
    const statusPriority: Record<string, number> = {
      'On Progress': 0,
      'Open': 1,
      'Closed': 2,
      'Cancelled': 3,
    }

    return activities
      .filter(act => {
        // 0. Sub-Item Ownership Check: Ensure activity strictly belongs to currentSub if provided
        if (currentSub) {
          if (act.idProgram) {
            if (act.idProgram !== currentSub.id) return false
          } else if (act.itemName) {
            if (act.itemName.toLowerCase() !== currentSub.namaItem.toLowerCase()) return false
          }
        }

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
        if (statusFilter !== 'ALL' && act.status !== statusFilter) return false

        // 3. PIC Filter
        if (picFilter !== 'ALL') {
          const matched = isSamePerson(
            { name: picFilter },
            { name: act.picNama?.split('/')[0]?.trim(), email: act.picEmail },
          )
          if (!matched) return false
        }

        return true
      })
      .sort((a, b) => {
        const pa = statusPriority[a.status] ?? 99
        const pb = statusPriority[b.status] ?? 99
        if (pa !== pb) return pa - pb
        return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
      })
  }

  // Render PIC Badges distinguishing PIC Utama (1st) from PIC Pendukung (subsequent)
  const renderPicBadges = (picNamaStr: string) => {
    if (!picNamaStr) return <span className="text-slate-600">-</span>
    const names = picNamaStr.split(/[/,;]+/).map(n => n.trim()).filter(Boolean)
    if (names.length === 0) return <span className="text-slate-600">-</span>

    const primaryPic = names[0]
    const secondaryPics = names.slice(1)

    return (
      <div className="flex flex-col gap-1.5">
        {/* PIC Utama Badge */}
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-xs font-bold text-amber-950 shadow-xs"
            title="PIC Utama (Penanggung Jawab Utama)"
          >
            <BadgeCheck size={13} className="text-amber-700 shrink-0" />
            <span>{primaryPic}</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.5 rounded-md tracking-wide">
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
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs"
                title="PIC Pendukung"
              >
                <UserCheck size={10} className="text-slate-600 shrink-0" />
                <span>{name}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Active single sub-program object for the unified single table view
  const activeSubProgramObj = useMemo(() => {
    if (!currentParent || !currentSubItems.length) return null
    if (activeSubTab !== 'ALL') {
      const matchInCurrent = currentSubItems.find(s => s.id === activeSubTab)
      if (matchInCurrent) return matchInCurrent
      // Fallback: search across all parents
      for (const p of displayParents) {
        const found = p.items?.find(s => s.id === activeSubTab)
        if (found) return found
      }
    }
    return currentSubItems[0] || null
  }, [currentParent, currentSubItems, activeSubTab, displayParents])

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="spinner" />
      </div>
    )
  }

  if (hasNoAssignment) {
    return (
      <div className="space-y-6 max-w-3xl py-2 sm:py-6">
        {/* Main Heading with Red Warning Icon (No background shape) */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <AlertTriangle size={28} className="text-red-600 shrink-0" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Halo, {currentUser?.name || 'Pengguna'}
            </h1>
          </div>
          <div className="space-y-1 pl-10">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Akses Program Kerja Belum Dikonfigurasi
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Akun Anda saat ini belum memiliki penugasan <strong>Master Program Kerja</strong> dari Administrator e-SIH.
            </p>
          </div>
        </div>

        {/* User & Admin Details Table (Clean Flat Bordered List) */}
        <div className="pl-10 space-y-4">
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-200 text-xs overflow-hidden max-w-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-slate-50/70 gap-1">
              <span className="font-semibold text-slate-500">Nama Pengguna:</span>
              <span className="font-bold text-slate-900">{currentUser?.name || '-'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-white gap-1">
              <span className="font-semibold text-slate-500">Jabatan &amp; Unit Kerja:</span>
              <span className="font-semibold text-slate-800">
                {currentUser?.employee?.jabatan || currentUser?.jabatan || 'Asisten IT'} ({/hsse|hse|safety|k3|mr/i.test(currentUser?.unit?.nama || currentUser?.employee?.unit?.nama || '') ? 'Seksi MR & HSSE' : (currentUser?.role === 'ADMIN' ? 'Sub Bagian Sistem & IT' : 'Seksi IT')})
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-slate-50/70 gap-1">
              <span className="font-semibold text-slate-500">Pengelola Sistem (Admin):</span>
              <span className="font-semibold text-emerald-800">
                Oka Aritonang (Kasubag Sistem &amp; IT)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Silakan hubungi Admin pengelola untuk mengaktifkan Program Kerja penugasan Anda pada menu <strong>Kelola Hak Akses &amp; Role</strong>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                api.get('/api/esih/users').then(res => setUsersList(res.data.data || [])).catch(() => { })
                fetchData()
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw size={14} />
              <span>Cek Ulang Status Penugasan</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
            >
              <span>Kembali ke Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-16 sm:pb-24">
      {/* Top Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <FolderKanban size={22} className="text-brand-600 shrink-0" />
          {isAdmin ? 'Daftar Program Kerja' : 'Program Kerja Ku'}
        </h1>
        <p className="text-xs font-medium text-slate-600 mt-0.5">
          {isAdmin
            ? `Kelola Project & Kegiatan berdasarkan Tab Program Kerja Induk (A, B, C) dan Sub-Item Program Kerja (${selectedYear}).`
            : `Daftar Sub-Program Kerja & Aktivitas Operasional yang ditugaskan kepada Anda (${selectedYear}).`}
        </p>
      </div>

      {/* ROW 1: SEARCH BAR & STATUS FILTER TOOLBAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari Project, Kegiatan, PIC, atau kata kunci..."
            className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter PIC Dropdown Search */}
          <PicFilterSearchDropdown
            value={picFilter}
            onChange={setPicFilter}
            options={picOptions}
            currentUserName={currentUser?.name}
          />

          {/* Filter Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer hover:bg-slate-50"
          >
            <option value="ALL">All Status</option>
            <option value="On Progress">On Progress</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Reset Filter Button */}
          {(search.trim() !== '' || statusFilter !== 'ALL' || activeSubTab !== 'ALL' || picFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('ALL')
                setActiveSubTab('ALL')
                setPicFilter('ALL')
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Reset Seluruh Filter"
            >
              <RotateCcw size={13} className="text-slate-600" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* ROW 1: MAIN PARENT PROGRAM TABS (A, B, C) */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <FolderKanban size={14} className="text-emerald-700" />
            <span>
              {isAdmin
                ? 'Semua Program Kerja Induk:'
                : 'Semua Program Kerja Induk:'}
            </span>
          </div>
          {!isAdmin && (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              {displayParents.length} Program Kerja
            </span>
          )}
        </div>

        {displayParents.length === 1 && !isAdmin ? (
          /* Single Assigned Program Banner - Automatically Selected */
          <div className="bg-white rounded-2xl border-2 border-emerald-500/70 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-emerald-50/60 via-white to-slate-50">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="w-11 h-11 rounded-2xl bg-emerald-700 text-white font-mono font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                {displayParents[0].kode}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Program Kerja {displayParents[0].kode}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Otomatis Aktif
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5" title={displayParents[0].namaProgram}>
                  {displayParents[0].namaProgram}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Memuat {displayParents[0].items?.length || 0} Sub-Item Program Kerja di bawah ini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Progress Capaian</span>
                <span className="text-sm font-bold text-emerald-700">{displayParents[0].totalProgress}%</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 font-bold text-xs">
                {displayParents[0].totalProgress}%
              </div>
            </div>
          </div>
        ) : (
          /* Multiple Programs Tabs (or Admin View) */
          <div className={`grid grid-cols-1 gap-3 ${displayParents.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
            }`}>
            {displayParents.map(p => {
              const isActive = p.id === currentParent?.id
              const subCount = p.items?.length || 0
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleParentTabChange(p.id)}
                  className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl transition-all cursor-pointer text-left ${isActive
                      ? 'bg-white text-emerald-950 font-bold border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white text-slate-700 font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${isActive ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                      {p.kode}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-bold tracking-tight leading-snug truncate ${isActive ? 'text-emerald-950' : 'text-slate-900'}`} title={p.namaProgram}>
                        Program {p.kode}: {p.namaProgram}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                        {subCount} Sub-Program Item
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 border ${isActive ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                    {p.totalProgress}%
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ROW 2: SUB-ITEM BUTTON TABS (Child Sub-Items under active Parent) */}
      {currentParent && currentSubItems.length > 0 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-600" />
              {isAdmin ? `Pilih Sub-Item Program Kerja [${currentParent.kode}]:` : `Pilih Sub-Item Penugasan [${currentParent.kode}]:`}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {currentSubItems.length} Sub-Item Tersedia
            </span>
          </div>

          {/* Sub-Item Buttons list */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin flex-nowrap">
            {currentSubItems.map(sub => {
              const isActive = sub.id === activeSubProgramObj?.id
              const rawActs = sub.activities || []
              const filteredActs = filterActivities(rawActs, sub)
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveSubTab(sub.id)
                    setSubPages({}) // Reset pagination to page 1 when switching sub-item
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-2.5 font-bold shrink-0 shadow-xs ${isActive
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-600 font-semibold shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold border ${isActive ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                    {sub.kode}
                  </span>
                  <span className="font-semibold">{sub.namaItem}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${isActive ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                    {filteredActs.length}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. SINGLE UNIFIED TABLE CONTAINER (SWITCHES PER SUB-ITEM BUTTON) */}
      <div className="space-y-5">
        {!activeSubProgramObj ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-600 font-semibold text-sm">
            {!isAdmin
              ? 'Belum ada Sub-Program Kerja atau Aktivitas yang ditugaskan kepada Anda pada tahun ini.'
              : 'Tidak ada Sub-Program Kerja untuk kelompok ini.'}
          </div>
        ) : (
          (() => {
            const sub = activeSubProgramObj
            const rawActivities = sub.activities || []
            const activities = filterActivities(rawActivities, sub)
            const openCount = activities.filter(a => a.status === 'Open' || a.status === 'On Progress').length
            const closedCount = activities.filter(a => a.status === 'Closed' || a.status === 'Cancelled').length

            // Pagination calculation for the single table
            const currentPage = subPages[sub.id] || 1
            const isAll = pageSize === -1
            const actualPageSize = isAll ? (activities.length || 1) : pageSize
            const totalPages = isAll ? 1 : Math.ceil(activities.length / actualPageSize) || 1
            const validPage = Math.min(currentPage, totalPages)
            const startIndex = isAll ? 0 : (validPage - 1) * actualPageSize
            const endIndex = isAll ? activities.length : Math.min(startIndex + actualPageSize, activities.length)
            const paginatedActivities = activities.slice(startIndex, endIndex)

            return (
              <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                {/* Sub-Item Section Header Banner */}
                <div className="px-5 py-4 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="px-3 py-1.5 rounded-xl bg-brand-700 text-white font-mono font-bold text-xs shrink-0 shadow-xs">
                      {sub.kode}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                        {sub.namaItem}
                      </h3>
                      {sub.keterangan && (
                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {sub.keterangan}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
                      Total: <b>{activities.length}</b> Kegiatan (<b className="text-amber-600">{openCount}</b> Open, <b className="text-emerald-600">{closedCount}</b> Close)
                    </span>
                    <button
                      onClick={() =>
                        exportSubItemToExcel({
                          parentKode: currentParent?.kode || 'PK',
                          parentNama: currentParent?.namaProgram || 'PROGRAM KERJA',
                          subKode: sub.kode,
                          subNamaItem: sub.namaItem,
                          subKeterangan: sub.keterangan,
                          year: selectedYear,
                          activities: activities
                        })
                      }
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                      title="Export Data Sub-Item ke Excel"
                    >
                      <FileSpreadsheet size={15} /> Export Excel
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => openAddModal(sub.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <Plus size={15} /> Tambah Kegiatan
                      </button>
                    )}
                  </div>
                </div>

                {/* Projects / Activities Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                        <th className="py-3 px-3.5 w-12 text-center">No</th>
                        <th className="py-3 px-3.5 min-w-[200px]">Project / Kegiatan</th>
                        <th className="py-3 px-3.5 min-w-[220px]">Action To Be Taken</th>
                        <th className="py-3 px-3.5 min-w-[180px]">Nama PIC (Utama &amp; Pendukung)</th>
                        <th className="py-3 px-3.5 w-24">Target Date</th>
                        <th className="py-3 px-3.5 w-24">Closed Date</th>
                        <th className="py-3 px-3.5 w-32 text-left">Status</th>
                        <th className="py-3 px-3.5 min-w-[150px]">Remarks</th>
                        <th className="py-3 px-3.5 min-w-[130px] text-left">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activities.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-600 font-semibold">
                            Belum ada Project / Kegiatan tercatat di bawah sub-program {sub.kode} ({sub.namaItem}).
                          </td>
                        </tr>
                      ) : (
                        paginatedActivities.map((act, index) => {
                          const isOpenStatus = act.status === 'Open' || act.status === 'On Progress'
                          return (
                            <tr key={act.id} className="hover:bg-slate-50/80 transition-colors align-top">
                              <td className="py-3.5 px-3.5 text-center font-bold text-slate-600">
                                {startIndex + index + 1}
                              </td>
                              <td className="py-3.5 px-3.5 font-semibold text-slate-900 leading-snug">
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
                              <td className="py-3.5 px-3.5 text-left">
                                <div className="space-y-1">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap ${act.status === 'Cancelled'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : act.status === 'Closed'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : act.status === 'On Progress'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-sky-50 text-sky-700 border-sky-200'
                                      }`}
                                  >
                                    {act.status === 'Closed' ? (
                                      <CheckCircle2 size={12} className="text-emerald-600" />
                                    ) : act.status === 'Cancelled' ? (
                                      <XCircle size={12} className="text-red-600" />
                                    ) : (
                                      <Clock size={12} className="text-amber-600" />
                                    )}
                                    <span className="whitespace-nowrap">{act.status}</span>
                                  </span>
                                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 mt-0.5">
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
                              <td className="py-3.5 px-3.5 text-slate-600 whitespace-pre-wrap">
                                {act.remarks || '-'}
                              </td>
                              <td className="py-3.5 px-3.5 text-left">
                                <div className="flex items-center justify-start gap-1.5 flex-nowrap">
                                  {/* Shortcut Status Button (On Progress <-> Closed) */}
                                  {act.status === 'Closed' ? (
                                    <button
                                      onClick={() => handleToggleActivityStatus(act)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                                      title="Klik untuk mengubah status kembali ke On Progress"
                                    >
                                      <RotateCcw size={12} className="text-amber-700 shrink-0" />
                                      <span>On Progress</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleActivityStatus(act)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                                      title="Klik untuk mengubah status menjadi Selesai (Closed)"
                                    >
                                      <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
                                      <span>Closed</span>
                                    </button>
                                  )}

                                  {/* Edit Detail Button */}
                                  {isAdmin && (
                                    <button
                                      onClick={() => openEditModal(act)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
                                      title="Edit Project / Kegiatan"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Pagination Controls */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                  {/* Left: Dropdown Rows per Page & Counter Info */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span>Tampilkan</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value))
                          setSubPages({})
                        }}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 cursor-pointer shadow-xs"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={-1}>Semua Data</option>
                      </select>
                      <span>data per halaman</span>
                    </div>

                    <span className="text-slate-300 hidden sm:inline">|</span>

                    <span>
                      {activities.length > 0 ? (
                        <>
                          Menampilkan <b className="text-slate-900">{startIndex + 1}</b> - <b className="text-slate-900">{endIndex}</b> dari <b className="text-slate-900">{activities.length}</b> data
                        </>
                      ) : (
                        '0 data'
                      )}
                    </span>
                  </div>

                  {/* Right: Direct Page Number Jump & Navigation Buttons */}
                  {activities.length > 0 && !isAll && totalPages > 1 && (
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Direct Page Input Number */}
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-xs">
                        <span className="text-xs font-bold text-slate-600">Ke Halaman:</span>
                        <input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={validPage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10)
                            if (!isNaN(val)) {
                              const target = Math.max(1, Math.min(val, totalPages))
                              setSubPages(prev => ({ ...prev, [sub.id]: target }))
                            }
                          }}
                          className="w-12 px-1.5 py-0.5 text-center font-semibold text-xs text-brand-700 bg-slate-50 border border-slate-200 rounded outline-none focus:border-brand-500 focus:bg-white"
                        />
                        <span className="text-xs font-bold text-slate-600">/ {totalPages}</span>
                      </div>

                      {/* Prev & Next Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSubPages(prev => ({ ...prev, [sub.id]: 1 }))}
                          disabled={validPage === 1}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Halaman Pertama"
                        >
                          <ChevronsLeft size={14} />
                        </button>
                        <button
                          onClick={() => setSubPages(prev => ({ ...prev, [sub.id]: Math.max(1, validPage - 1) }))}
                          disabled={validPage === 1}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Halaman Sebelumnya"
                        >
                          <ChevronLeft size={14} />
                        </button>

                        <span className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-800 font-semibold text-xs">
                          {validPage} / {totalPages}
                        </span>

                        <button
                          onClick={() => setSubPages(prev => ({ ...prev, [sub.id]: Math.min(totalPages, validPage + 1) }))}
                          disabled={validPage === totalPages}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Halaman Selanjutnya"
                        >
                          <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={() => setSubPages(prev => ({ ...prev, [sub.id]: totalPages }))}
                          disabled={validPage === totalPages}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Halaman Terakhir"
                        >
                          <ChevronsRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()
        )}
      </div>

      {/* Modal Form for Add/Edit Project Activity */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <ListChecks size={18} className="text-brand-700" />
                  {editingActivityId ? 'Edit Project / Kegiatan' : 'Tambah Project / Kegiatan Baru'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg neu-btn text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitActivity} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Form Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Searchable Sub-Program / Item Program Kerja Dropdown */}
                  <div className="space-y-1 relative">
                    <label className="block text-xs font-bold text-slate-700">
                      Sub-Program / Item Program Kerja *
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setSubProgramDropdownOpen(prev => !prev)
                          setPicDropdownOpen(false)
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 flex items-center justify-between gap-2 text-left cursor-pointer shadow-xs"
                      >
                        <span className="truncate">
                          {allSubPrograms.find(sp => sp.id === activityForm.idProgram)?.label ||
                            '-- Pilih Sub-Program / Item Program Kerja --'}
                        </span>
                        <ChevronRight
                          size={16}
                          className={`text-slate-600 shrink-0 transition-transform ${subProgramDropdownOpen ? 'rotate-90 text-brand-600' : ''
                            }`}
                        />
                      </button>

                      {subProgramDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-lg z-[100] overflow-hidden p-2 space-y-2 animate-zoom-in">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input
                              type="text"
                              autoFocus
                              value={subProgramSearchQuery}
                              onChange={e => setSubProgramSearchQuery(e.target.value)}
                              placeholder="Ketik nama/kode sub-program (misal: RFID, A.1, IT...)"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:bg-white"
                            />
                            {subProgramSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setSubProgramSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-600 hover:text-slate-600 cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>

                          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                            {filteredSubProgramsForModal.length === 0 ? (
                              <div className="p-3 text-center text-xs font-semibold text-slate-600">
                                Tidak ada Sub-Program yang cocok dengan &quot;{subProgramSearchQuery}&quot;
                              </div>
                            ) : (
                              filteredSubProgramsForModal.map(sp => {
                                const isSelected = sp.id === activityForm.idProgram
                                return (
                                  <button
                                    key={sp.id}
                                    type="button"
                                    onClick={() => {
                                      setActivityForm({ ...activityForm, idProgram: sp.id })
                                      setSubProgramDropdownOpen(false)
                                      setSubProgramSearchQuery('')
                                    }}
                                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected
                                        ? 'bg-brand-600 text-white font-bold shadow-xs'
                                        : 'hover:bg-slate-100 text-slate-800 font-bold'
                                      }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0 ${isSelected ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                          }`}
                                      >
                                        {sp.kode}
                                      </span>
                                      <span className="truncate">{sp.namaItem}</span>
                                    </div>
                                    <span
                                      className={`text-xs font-bold shrink-0 ${isSelected ? 'text-brand-100' : 'text-slate-600'
                                        }`}
                                    >
                                      {sp.parentKode}
                                    </span>
                                  </button>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                      <label className="block text-xs font-bold text-slate-800">
                        Pilih PIC (Penanggung Jawab)* - <span className="text-amber-700">PIC #1 Adalah PIC Utama</span>
                      </label>
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                        {selectedPics.length} PIC Dipilih
                      </span>
                    </div>

                    {/* Searchable PIC Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setPicDropdownOpen(prev => !prev)
                          setSubProgramDropdownOpen(false)
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 flex items-center justify-between gap-2 text-left cursor-pointer shadow-xs hover:border-slate-400"
                      >
                        <span className="truncate text-brand-700 font-semibold">
                          + Cari &amp; Tambah PIC dari Daftar Karyawan...
                        </span>
                        <ChevronRight
                          size={16}
                          className={`text-slate-600 shrink-0 transition-transform ${picDropdownOpen ? 'rotate-90 text-brand-600' : ''
                            }`}
                        />
                      </button>

                      {picDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-lg z-[100] overflow-hidden p-2 space-y-2 animate-zoom-in">
                          {/* Search Bar inside PIC Dropdown */}
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input
                              type="text"
                              autoFocus
                              value={picSearchQuery}
                              onChange={e => setPicSearchQuery(e.target.value)}
                              placeholder="Cari nama, email, atau jabatan (misal: Fitri, Tommy, Staff)..."
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:bg-white"
                            />
                            {picSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setPicSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-600 hover:text-slate-600 cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>

                          {/* Users / PIC List */}
                          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                            {filteredUsersListForModal.length === 0 ? (
                              <div className="p-3 text-center text-xs font-semibold text-slate-600">
                                Tidak ada Karyawan yang cocok dengan &quot;{picSearchQuery}&quot;
                              </div>
                            ) : (
                              filteredUsersListForModal.map(u => {
                                const isAlreadySelected = selectedPics.some(
                                  p => p.nama.toLowerCase() === u.nama.toLowerCase()
                                )
                                return (
                                  <button
                                    key={u.id || u.email}
                                    type="button"
                                    disabled={isAlreadySelected}
                                    onClick={() => {
                                      addPic(u)
                                      setPicDropdownOpen(false)
                                      setPicSearchQuery('')
                                    }}
                                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-2 ${isAlreadySelected
                                        ? 'bg-slate-100 text-slate-600 cursor-not-allowed opacity-60'
                                        : 'hover:bg-brand-50 hover:text-brand-900 text-slate-800 font-bold cursor-pointer'
                                      }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs shrink-0">
                                        {u.nama.charAt(0)}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-semibold truncate">{u.nama}</div>
                                        <div className="text-xs text-slate-600 font-medium truncate">
                                          {u.jabatan || 'Staff'} ({u.email})
                                        </div>
                                      </div>
                                    </div>
                                    {isAlreadySelected ? (
                                      <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                                        Sudah Dipilih
                                      </span>
                                    ) : (
                                      <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                                        + Pilih
                                      </span>
                                    )}
                                  </button>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )}
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
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${isPrimary
                                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold shadow-xs ring-1 ring-amber-300'
                                  : 'bg-white border-slate-200 text-slate-800 font-semibold'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isPrimary ? (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-xs shrink-0">
                                    <BadgeCheck size={12} className="text-amber-800" /> PIC UTAMA
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
                                    <UserCheck size={11} className="text-slate-600" /> PIC Pendukung #{idx}
                                  </span>
                                )}
                                <span className="font-semibold text-slate-900 truncate">{pic.nama}</span>
                                {pic.email && (
                                  <span className="text-xs text-slate-600 font-medium truncate">({pic.email})</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => setAsPrimaryPic(idx)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold cursor-pointer transition-colors"
                                    title="Jadikan orang ini sebagai PIC Utama"
                                  >
                                    Set PIC Utama
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removePic(idx)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
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
                      <label className="block text-xs font-semibold text-slate-600">
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
                  <div className="space-y-1 pb-2">
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

                {/* Fixed Footer Bar */}
                <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0 z-10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700 transition-colors shadow-md cursor-pointer disabled:opacity-50"
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
