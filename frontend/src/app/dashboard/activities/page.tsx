'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import {
  ListFilter,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Layers,
  FolderKanban,
  FileSpreadsheet
} from 'lucide-react'

export default function AllActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [parentPrograms, setParentPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [programFilter, setProgramFilter] = useState('ALL')

  useEffect(() => {
    Promise.all([
      api.get('/api/esih/activities'),
      api.get('/api/esih/program-kerja')
    ])
      .then(([r1, r2]) => {
        setActivities(r1.data.data || [])
        setParentPrograms(r2.data.data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // Unique PICs who uploaded activities
  const availablePics = useMemo(() => {
    const picSet = new Set<string>()
    activities.forEach((a: any) => {
      const name = a.picNama?.split('/')[0]?.trim()
      if (name) picSet.add(name)
    })
    return Array.from(picSet).sort()
  }, [activities])

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((a: any) => {
      if (userFilter !== 'ALL') {
        const picName = a.picNama?.split('/')[0]?.trim() || ''
        if (picName.toLowerCase() !== userFilter.toLowerCase()) return false
      }

      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false

      if (programFilter !== 'ALL') {
        const progKode = a.program?.programKerja?.kode
        if (progKode !== programFilter) return false
      }

      if (search.trim()) {
        const q = search.toLowerCase()
        const matchKegiatan = a.kegiatan?.toLowerCase().includes(q)
        const matchDesc = a.descriptionAction?.toLowerCase().includes(q)
        const matchPic = a.picNama?.toLowerCase().includes(q)
        const matchItem = a.itemName?.toLowerCase().includes(q)
        if (!matchKegiatan && !matchDesc && !matchPic && !matchItem) return false
      }

      return true
    })
  }, [activities, userFilter, statusFilter, programFilter, search])

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ListFilter className="text-brand-700" size={24} /> All Activities (Master Log)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Database Master Seluruh Aktivitas Operasional ({activities.length} Laporan Terdaftar)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300">
            Total Filtered: <strong className="text-brand-700">{filteredActivities.length}</strong>
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kata kunci kegiatan, PIC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-input text-xs font-bold text-slate-900 outline-none"
          />
        </div>

        {/* Filter Program Kerja */}
        <select
          value={programFilter}
          onChange={e => setProgramFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
        >
          <option value="ALL">Semua Program Kerja Induk ({parentPrograms.length})</option>
          {parentPrograms.map(p => (
            <option key={p.id} value={p.kode}>Prog {p.kode}: {p.namaProgram}</option>
          ))}
        </select>

        {/* Filter PIC */}
        <select
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
        >
          <option value="ALL">Semua User PIC ({availablePics.length})</option>
          {availablePics.map(pic => (
            <option key={pic} value={pic}>{pic}</option>
          ))}
        </select>

        {/* Filter Status */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl neu-select text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
        >
          <option value="ALL">Semua Status Aktivitas</option>
          <option value="Closed">Closed (Selesai)</option>
          <option value="On Progress">On Progress (Berjalan)</option>
          <option value="Open">Open (Belum Dimulai)</option>
        </select>
      </div>

      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b-2 border-slate-300 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-60">Program &amp; Sub-Item</th>
                <th className="py-3.5 px-4">Kegiatan / Deskripsi</th>
                <th className="py-3.5 px-4 w-32">Tanggal Start</th>
                <th className="py-3.5 px-4 w-36 text-center">Status</th>
                <th className="py-3.5 px-4 w-40">Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    Tidak ada aktivitas yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((a, i) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono font-bold">{i + 1}</td>
                    <td className="py-3.5 px-4 space-y-1">
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                        {a.program?.programKerja?.kode} - {a.program?.programKerja?.namaProgram}
                      </span>
                      <p className="font-extrabold text-slate-900 text-xs leading-tight">
                        {a.program?.kode} - {a.itemName}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900 text-xs leading-snug">{a.kegiatan}</p>
                      {a.descriptionAction && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">{a.descriptionAction}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {a.startDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${
                        a.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : a.status === 'On Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {a.status === 'Closed' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          {a.picNama?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-800 truncate">{a.picNama?.split('/')[0]}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredActivities.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 text-center text-slate-400 font-semibold text-xs">
            Tidak ada aktivitas yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filteredActivities.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border-2 border-slate-300 p-4 shadow-2xs space-y-2.5 w-full min-w-0">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 min-w-0">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200 truncate min-w-0">
                  {a.program?.programKerja?.kode} - {a.program?.kode}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border shrink-0 ${
                  a.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {a.status}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 text-sm leading-snug">{a.kegiatan}</p>
                {a.descriptionAction && <p className="text-xs text-slate-500 mt-1">{a.descriptionAction}</p>}
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 text-xs font-bold text-slate-700 min-w-0">
                <span className="flex items-center gap-1.5 truncate min-w-0"><User size={13} className="text-slate-400 shrink-0" /> <span className="truncate min-w-0">{a.picNama?.split('/')[0]}</span></span>
                <span className="text-slate-500 font-medium shrink-0">{a.startDate}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
