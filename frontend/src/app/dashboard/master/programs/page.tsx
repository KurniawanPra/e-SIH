'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { FolderKanban, Layers, Plus, Pencil, FolderPlus } from 'lucide-react'

interface ChildItem {
  id: string
  kode: string
  namaItem: string
  status: string
  progress: number
  keterangan?: string
}

interface ParentProgram {
  id: string
  kode: string
  namaProgram: string
  deskripsi?: string
  items: ChildItem[]
}

export default function MasterProgramPage() {
  const [parentPrograms, setParentPrograms] = useState<ParentProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/esih/program-kerja')
      .then(res => { setParentPrograms(res.data.data || []); setLoading(false) })
      .catch((err) => { console.error(err); setLoading(false) })
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban size={20} className="text-brand-700" /> Master Program Kerja
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Struktur hierarki Program Kerja Induk (Parent) dan Sub-Program (Child).</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/dashboard/master/parent-pk" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand-700 text-brand-700 font-extrabold text-xs hover:bg-brand-700 hover:text-white transition-colors no-underline">
            <FolderPlus size={15} /> Tambah Program Induk
          </Link>
          <Link href="/dashboard/master/sub-pk" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 neu-btn-brand font-extrabold text-xs px-4 py-2.5 rounded-xl no-underline">
            <Plus size={15} /> Tambah Sub-Program
          </Link>
        </div>
      </div>

      {parentPrograms.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm text-center py-14">
          <FolderKanban size={40} className="text-slate-300 mx-auto mb-3" />
          <h5 className="font-bold text-slate-700">Belum ada data Program Kerja</h5>
          <p className="text-xs text-slate-400 mt-1">Silakan tambahkan Program Kerja Induk terlebih dahulu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {parentPrograms.map((parent) => (
            <div key={parent.id} className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
              {/* Parent Program Header */}
              <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-700 text-white font-black text-sm flex items-center justify-center shrink-0">{parent.kode}</div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 text-sm leading-snug truncate min-w-0">{parent.namaProgram}</h5>
                    {parent.deskripsi && <span className="text-[11px] text-slate-500 font-medium block truncate min-w-0">{parent.deskripsi}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-extrabold text-slate-700">
                    <Layers size={12} className="text-brand-700" /> {parent.items.length} Sub-Program
                  </span>
                  <Link href="/dashboard/master/sub-pk" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Kelola Sub-Program" aria-label="Kelola Sub-Program">
                    <Pencil size={15} />
                  </Link>
                </div>
              </div>

              {/* Mobile Child Cards */}
              <div className="grid grid-cols-1 gap-2.5 p-3.5 sm:hidden">
                {parent.items.length === 0 ? (
                  <p className="text-center text-slate-400 font-semibold text-xs py-4">Belum ada sub-program di bawah grup ini.</p>
                ) : (
                  parent.items.map((child) => (
                    <div key={child.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="font-black text-brand-700 text-xs shrink-0">{child.kode}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${child.status === 'Closed' ? 'bg-green-100 text-green-700' : child.status === 'On Progress' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{child.status}</span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs truncate min-w-0">{child.namaItem}</p>
                      {child.keterangan && <p className="text-[11px] text-slate-500 line-clamp-2">{child.keterangan}</p>}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${child.progress === 100 ? 'bg-green-500' : 'bg-brand-600'}`} style={{ width: `${child.progress}%` }} /></div>
                        <span className="text-[11px] font-bold text-slate-600 shrink-0">{child.progress}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Child Table */}
              <div className="hidden sm:block">
                {parent.items.length === 0 ? (
                  <p className="text-center text-slate-400 font-semibold text-sm py-6">Belum ada sub-program di bawah grup ini.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-2.5 px-5 text-left font-semibold text-slate-500 text-xs uppercase w-20">Kode</th>
                        <th className="py-2.5 px-5 text-left font-semibold text-slate-500 text-xs uppercase">Nama Sub-Program (Child)</th>
                        <th className="py-2.5 px-5 text-left font-semibold text-slate-500 text-xs uppercase">Keterangan</th>
                        <th className="py-2.5 px-5 text-left font-semibold text-slate-500 text-xs uppercase">Status</th>
                        <th className="py-2.5 px-5 text-left font-semibold text-slate-500 text-xs uppercase w-44">Progress</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-50">
                        {parent.items.map((child) => (
                          <tr key={child.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-5 font-bold text-brand-700">{child.kode}</td>
                            <td className="py-3 px-5"><p className="font-semibold text-slate-800">{child.namaItem}</p></td>
                            <td className="py-3 px-5 text-xs text-slate-400 truncate max-w-xs">{child.keterangan || '-'}</td>
                            <td className="py-3 px-5"><span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${child.status === 'Closed' ? 'bg-green-50 text-green-700' : child.status === 'On Progress' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{child.status}</span></td>
                            <td className="py-3 px-5"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${child.progress === 100 ? 'bg-green-500' : 'bg-brand-600'}`} style={{ width: `${child.progress}%` }} /></div><span className="text-xs font-bold text-slate-500 w-8 text-right">{child.progress}%</span></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
