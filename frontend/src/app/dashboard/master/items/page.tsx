'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Eye, EyeOff, X } from 'lucide-react'

interface ParentPK { id: string; kode: string; namaProgram: string }
interface ItemProg { id: string; programKerjaId: string; kode: string; namaItem: string; status: string; progress: number; keterangan?: string; isActive: boolean; programKerja?: ParentPK }

export default function ItemProgramPage() {
  const [items, setItems] = useState<ItemProg[]>([])
  const [parentOpts, setParentOpts] = useState<ParentPK[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<ItemProg | null>(null)
  const [form, setForm] = useState({ programKerjaId: '', kode: '', namaItem: '', status: 'On Progress', progress: 0, keterangan: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    const [r1, r2] = await Promise.all([api.get('/api/esih/programs'), api.get('/api/esih/program-kerja')])
    setItems(r1.data.data || []); setParentOpts(r2.data.data || []); setLoading(false)
  }
  useEffect(() => { fetchAll() }, [])

  const openAdd = () => { setEditItem(null); setForm({ programKerjaId: parentOpts[0]?.id || '', kode: '', namaItem: '', status: 'On Progress', progress: 0, keterangan: '' }); setShowModal(true) }
  const openEdit = (it: ItemProg) => { setEditItem(it); setForm({ programKerjaId: it.programKerjaId, kode: it.kode, namaItem: it.namaItem, status: it.status, progress: it.progress, keterangan: it.keterangan || '' }); setShowModal(true) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try { editItem ? await api.put(`/api/esih/programs/${editItem.id}`, form) : await api.post('/api/esih/programs', form); setShowModal(false); fetchAll() }
    catch { alert('Gagal menyimpan') } finally { setSubmitting(false) }
  }

  const toggle = async (id: string) => { if (confirm('Ubah status aktif item ini?')) { await api.patch(`/api/esih/programs/${id}/toggle`); fetchAll() } }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h2 className="text-lg sm:text-xl font-bold text-slate-900">Item Program</h2><p className="text-xs sm:text-sm text-slate-500 mt-0.5">Rincian item program kerja (IT Development, Infrastructure, dll).</p></div>
        <button onClick={openAdd} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm"><Plus size={16} /> Tambah Item</button>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 sm:hidden">
        {items.map(it => (
          <div key={it.id} className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3 ${!it.isActive ? 'opacity-40' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900 text-sm">{it.namaItem}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Bagian dari: <strong className="text-brand-700">{it.programKerja?.kode} {it.programKerja?.namaProgram}</strong></p>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${it.status === 'Closed' ? 'bg-green-50 text-green-700' : it.status === 'On Progress' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{it.status}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Progress</span><span className="font-bold text-slate-700">{it.progress}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${it.progress === 100 ? 'bg-green-500' : 'bg-brand-600'}`} style={{ width: `${it.progress}%` }} /></div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(it)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Pencil size={14} /></button>
                <button onClick={() => toggle(it.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600">{it.isActive ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Kode</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Nama Item</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Program Kerja</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase w-40">Progress</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs uppercase">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(it => (
                <tr key={it.id} className={`hover:bg-slate-50 transition-colors ${!it.isActive ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-3.5 font-bold text-brand-700">{it.kode}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{it.namaItem}</p>
                    {it.keterangan && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{it.keterangan}</p>}
                  </td>
                  <td className="px-5 py-3.5"><span className="inline-flex px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-medium">{it.programKerja?.kode} - {it.programKerja?.namaProgram}</span></td>
                  <td className="px-5 py-3.5"><span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${it.status === 'Closed' ? 'bg-green-50 text-green-700' : it.status === 'On Progress' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{it.status}</span></td>
                  <td className="px-5 py-3.5"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${it.progress === 100 ? 'bg-green-500' : 'bg-brand-600'}`} style={{ width: `${it.progress}%` }} /></div><span className="text-xs font-bold text-slate-500 w-8 text-right">{it.progress}%</span></div></td>
                  <td className="px-5 py-3.5 text-right"><div className="inline-flex gap-1"><button onClick={() => openEdit(it)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"><Pencil size={15} /></button><button onClick={() => toggle(it.id)} className={`p-1.5 rounded-md ${it.isActive ? 'hover:bg-amber-50 text-slate-400 hover:text-amber-600' : 'hover:bg-green-50 text-slate-400 hover:text-green-600'}`}>{it.isActive ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4">
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-sm sm:text-base">{editItem ? `Edit: ${editItem.namaItem}` : 'Tambah Item Program'}</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><X size={18} /></button></div>
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Program Kerja (Induk)</label><select value={form.programKerjaId} onChange={e => setForm({ ...form, programKerjaId: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200">{parentOpts.map(p => <option key={p.id} value={p.id}>[{p.kode}] {p.namaProgram}</option>)}</select></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Kode</label><input type="text" placeholder="A.1" value={form.kode} onChange={e => setForm({ ...form, kode: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
                <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1">Nama Item</label><input type="text" placeholder="IT Development" value={form.namaItem} onChange={e => setForm({ ...form, namaItem: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200"><option>Open</option><option>On Progress</option><option>Closed</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Progress (%)</label><input type="number" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan</label><textarea rows={2} value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200 resize-none" /></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100">Batal</button><button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50">{submitting ? 'Menyimpan...' : 'Simpan'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
