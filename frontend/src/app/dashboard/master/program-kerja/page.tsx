'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Eye, EyeOff, X } from 'lucide-react'

interface ParentPK { id: string; kode: string; namaProgram: string; deskripsi?: string; totalProgress: number; isActive: boolean; items?: any[] }

export default function ProgramKerjaPage() {
  const [parents, setParents] = useState<ParentPK[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<ParentPK | null>(null)
  const [form, setForm] = useState({ kode: '', namaProgram: '', deskripsi: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetch = () => { api.get('/api/esih/program-kerja').then(r => { setParents(r.data.data || []); setLoading(false) }).catch((e) => { console.error(e); setLoading(false) }) }
  useEffect(fetch, [])

  const openAdd = () => { setEditItem(null); setForm({ kode: '', namaProgram: '', deskripsi: '' }); setShowModal(true) }
  const openEdit = (p: ParentPK) => { setEditItem(p); setForm({ kode: p.kode, namaProgram: p.namaProgram, deskripsi: p.deskripsi || '' }); setShowModal(true) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      editItem ? await api.put(`/api/esih/program-kerja/${editItem.id}`, form) : await api.post('/api/esih/program-kerja', form)
      setShowModal(false); fetch()
    } catch { alert('Gagal menyimpan') } finally { setSubmitting(false) }
  }

  const toggle = async (id: string) => { if (confirm('Ubah status aktif?')) { await api.patch(`/api/esih/program-kerja/${id}/toggle`); fetch() } }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h2 className="text-lg sm:text-xl font-bold text-slate-900">Program Kerja</h2><p className="text-xs sm:text-sm text-slate-500 mt-0.5">Kelola kelompok utama Program Kerja dan pantau total progress.</p></div>
        <button onClick={openAdd} className="w-full sm:w-auto flex items-center justify-center gap-2 neu-btn-brand font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer"><Plus size={16} /> Tambah Program</button>
      </div>

      {/* Mobile Card List */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {parents.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 text-center text-slate-400 font-semibold text-xs">
            Belum ada data Program Kerja.
          </div>
        ) : (
          parents.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3 ${!p.isActive ? 'opacity-40' : ''}`}>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-brand-700 text-white flex items-center justify-center text-xs font-bold shrink-0">{p.kode}</span>
                <span className="font-semibold text-slate-900 text-sm truncate min-w-0">{p.namaProgram}</span>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{p.isActive ? 'Aktif' : 'Nonaktif'}</span>
            </div>
            {p.deskripsi && <p className="text-xs text-slate-500">{p.deskripsi}</p>}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex-1 mr-4 min-w-0">
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Progress</span><span className="font-bold text-slate-700">{p.totalProgress}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.totalProgress >= 80 ? 'bg-green-500' : p.totalProgress >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${p.totalProgress}%` }} /></div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 cursor-pointer"><Pencil size={14} /></button>
                <button onClick={() => toggle(p.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 cursor-pointer">{p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Kode</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Nama Program Kerja</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Item</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase w-48">Progress</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {parents.map(p => (
                <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${!p.isActive ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-3.5 font-bold text-brand-700">{p.kode}</td>
                  <td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{p.namaProgram}</p>{p.deskripsi && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{p.deskripsi}</p>}</td>
                  <td className="px-5 py-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">{p.items?.length || 0}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${p.totalProgress >= 80 ? 'bg-green-500' : p.totalProgress >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${p.totalProgress}%` }} /></div>
                      <span className="text-xs font-bold text-slate-600 w-9 text-right">{p.totalProgress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center"><span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{p.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => toggle(p.id)} className={`p-1.5 rounded-md transition-colors ${p.isActive ? 'hover:bg-amber-50 text-slate-400 hover:text-amber-600' : 'hover:bg-green-50 text-slate-400 hover:text-green-600'}`}>{p.isActive ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">{editItem ? 'Edit Program Kerja' : 'Tambah Program Kerja'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl neu-btn text-slate-500 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Kode</label><input type="text" placeholder="A, B, C" value={form.kode} onChange={e => setForm({ ...form, kode: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-200 outline-none" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Nama Program Kerja</label><input type="text" placeholder="ENABLING DIGITAL AND RELIABLE OPERATION" value={form.namaProgram} onChange={e => setForm({ ...form, namaProgram: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-200 outline-none" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label><textarea rows={2} placeholder="Penjelasan singkat..." value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-200 outline-none resize-none" /></div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 bg-white sticky bottom-0 z-10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl neu-btn font-bold text-xs text-slate-700 cursor-pointer">Batal</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl neu-btn-brand font-extrabold text-xs cursor-pointer disabled:opacity-50">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
