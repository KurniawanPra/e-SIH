'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Eye, EyeOff, X, Layers } from 'lucide-react'

interface ParentPK { id: string; kode: string; namaProgram: string }
interface SubPK { id: string; programKerjaId: string; kode: string; namaItem: string; status: string; progress: number; keterangan?: string; isActive: boolean; programKerja?: ParentPK }

export default function MasterSubPKPage() {
  const [subPrograms, setSubPrograms] = useState<SubPK[]>([])
  const [parentOptions, setParentOptions] = useState<ParentPK[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<SubPK | null>(null)
  const [form, setForm] = useState({ programKerjaId: '', kode: '', namaItem: '', status: 'On Progress', progress: 0, keterangan: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [resSub, resParent] = await Promise.all([
        api.get('/api/esih/programs'),
        api.get('/api/esih/program-kerja'),
      ])
      setSubPrograms(resSub.data.data || [])
      setParentOptions(resParent.data.data || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditItem(null); setForm({ programKerjaId: parentOptions[0]?.id || '', kode: '', namaItem: '', status: 'On Progress', progress: 0, keterangan: '' }); setShowModal(true) }
  const openEdit = (item: SubPK) => { setEditItem(item); setForm({ programKerjaId: item.programKerjaId, kode: item.kode, namaItem: item.namaItem, status: item.status, progress: item.progress, keterangan: item.keterangan || '' }); setShowModal(true) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      editItem ? await api.put(`/api/esih/programs/${editItem.id}`, form) : await api.post('/api/esih/programs', form)
      setShowModal(false); fetchData()
    } catch { alert('Gagal menyimpan Sub-Program Kerja') } finally { setSubmitting(false) }
  }

  const toggle = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin mengubah status aktif Sub-Program ini?')) {
      try { await api.patch(`/api/esih/programs/${id}/toggle`); fetchData() }
      catch { alert('Gagal mengubah status aktif') }
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers size={20} className="text-brand-700" /> Master Sub-Program Kerja (Sub PK)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Kelola rincian item Sub-Program Kerja (misal: IT Development, IT Infrastructure, dll).</p>
        </div>
        <button onClick={openAdd} className="w-full sm:w-auto flex items-center justify-center gap-2 neu-btn-brand font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer"><Plus size={16} /> Tambah Sub PK</button>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {subPrograms.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 text-center text-slate-400 font-semibold text-xs">
            Belum ada data Sub-Program Kerja.
          </div>
        ) : (
          subPrograms.map(it => (
            <div key={it.id} className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3 ${!it.isActive ? 'opacity-40' : ''}`}>
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate min-w-0">{it.namaItem}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate min-w-0">Bagian dari: <strong className="text-brand-700">{it.programKerja?.kode} {it.programKerja?.namaProgram}</strong></p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${it.status === 'Closed' ? 'bg-green-50 text-green-700' : it.status === 'On Progress' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{it.status}</span>
              </div>
              {it.keterangan && <p className="text-xs text-slate-500">{it.keterangan}</p>}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex-1 mr-4 min-w-0">
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Progress</span><span className="font-bold text-slate-700">{it.progress}%</span></div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${it.progress === 100 ? 'bg-green-500' : 'bg-brand-600'}`} style={{ width: `${it.progress}%` }} /></div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(it)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 cursor-pointer"><Pencil size={14} /></button>
                  <button onClick={() => toggle(it.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 cursor-pointer">{it.isActive ? <EyeOff size={14} /> : <Eye size={14} />}</button>
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
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Program Induk (Parent)</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Nama Sub-Program (Item)</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase w-40">Progress</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Status Aktif</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {subPrograms.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400 font-semibold text-sm">Belum ada data Sub-Program Kerja.</td></tr>
              ) : (
                subPrograms.map(it => (
                  <tr key={it.id} className={`hover:bg-slate-50 transition-colors ${!it.isActive ? 'opacity-40' : ''}`}>
                    <td className="px-5 py-3.5 font-bold text-brand-700">{it.kode}</td>
                    <td className="px-5 py-3.5"><span className="inline-flex px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-medium">{it.programKerja?.kode} - {it.programKerja?.namaProgram}</span></td>
                    <td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{it.namaItem}</p>{it.keterangan && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{it.keterangan}</p>}</td>
                    <td className="px-5 py-3.5"><span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${it.status === 'Closed' ? 'bg-green-50 text-green-700' : it.status === 'On Progress' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{it.status}</span></td>
                    <td className="px-5 py-3.5"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${it.progress === 100 ? 'bg-green-500' : 'bg-brand-600'}`} style={{ width: `${it.progress}%` }} /></div><span className="text-xs font-bold text-slate-500 w-8 text-right">{it.progress}%</span></div></td>
                    <td className="px-5 py-3.5 text-center"><span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${it.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{it.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="px-5 py-3.5 text-right"><div className="inline-flex gap-1"><button onClick={() => openEdit(it)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"><Pencil size={15} /></button><button onClick={() => toggle(it.id)} className={`p-1.5 rounded-md transition-colors cursor-pointer ${it.isActive ? 'hover:bg-amber-50 text-slate-400 hover:text-amber-600' : 'hover:bg-green-50 text-slate-400 hover:text-green-600'}`}>{it.isActive ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Sub PK */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0 bg-white z-10">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">{editItem ? `Edit Sub PK: ${editItem.namaItem}` : 'Tambah Sub-Program Kerja'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl neu-btn text-slate-500 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Program Kerja Induk (Parent)</label><select value={form.programKerjaId} onChange={e => setForm({ ...form, programKerjaId: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200">{parentOptions.map(p => <option key={p.id} value={p.id}>[{p.kode}] {p.namaProgram}</option>)}</select></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1">Kode Sub</label><input type="text" placeholder="A.1" value={form.kode} onChange={e => setForm({ ...form, kode: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1">Nama Sub-Program (Item)</label><input type="text" placeholder="IT Development" value={form.namaItem} onChange={e => setForm({ ...form, namaItem: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1">Status Pekerjaan</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200"><option>Open</option><option>On Progress</option><option>Closed</option></select></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1">Progress (%)</label><input type="number" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
                </div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Detail Sub PK</label><textarea rows={2} value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200 resize-none" /></div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 bg-white sticky bottom-0 z-10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl neu-btn font-bold text-xs text-slate-700 cursor-pointer">Batal</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl neu-btn-brand font-extrabold text-xs cursor-pointer disabled:opacity-50">{submitting ? 'Menyimpan...' : 'Simpan Sub PK'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
