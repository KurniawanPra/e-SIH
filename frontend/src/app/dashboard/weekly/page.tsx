'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, api } from '@/lib/api'
import { Plus, Pencil, EyeOff, Eye, X, Clock, CheckCircle2, Calendar, User } from 'lucide-react'
import type { SessionUser } from '@/types/auth'

export default function WeeklyActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [subOpts, setSubOpts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ idProgram: '', kegiatan: '', descriptionAction: '', startDate: '', dueDate: '', closedDate: '', status: 'On Progress', picNama: '', picEmail: '', tindakLanjut: '', kendala: '', remarks: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    const [r1, r2] = await Promise.all([api.get('/api/esih/activities'), api.get('/api/esih/programs')])
    setActivities(r1.data.data || []); setSubOpts(r2.data.data || []); setLoading(false)
  }
  useEffect(() => { getCurrentUser().then(setUser); fetchAll() }, [])

  const today = new Date().toISOString().split('T')[0]
  const openAdd = () => { setEditItem(null); setForm({ idProgram: subOpts[0]?.id || '', kegiatan: '', descriptionAction: '', startDate: today, dueDate: today, closedDate: '', status: 'On Progress', picNama: user?.name || '', picEmail: user?.email || '', tindakLanjut: '', kendala: '', remarks: '' }); setShowModal(true) }
  const openEdit = (a: any) => { setEditItem(a); setForm({ idProgram: a.idProgram, kegiatan: a.kegiatan, descriptionAction: a.descriptionAction || '', startDate: a.startDate, dueDate: a.dueDate, closedDate: a.closedDate || '', status: a.status, picNama: a.picNama, picEmail: a.picEmail, tindakLanjut: a.tindakLanjut || '', kendala: a.kendala || '', remarks: a.remarks || '' }); setShowModal(true) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try { editItem ? await api.put(`/api/esih/activities/${editItem.id}`, form) : await api.post('/api/esih/activities', form); setShowModal(false); fetchAll() }
    catch { alert('Gagal menyimpan') } finally { setSubmitting(false) }
  }

  const toggle = async (id: string) => { if (confirm('Ubah status aktif?')) { await api.patch(`/api/esih/activities/${id}/toggle`); fetchAll() } }

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Weekly Activities</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Laporan aktivitas mingguan tim.</p>
        </div>
        <button onClick={openAdd} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm">
          <Plus size={16} /> Tambah Aktivitas
        </button>
      </div>

      {/* Mobile Card List View (Visible on Small Screens) */}
      <div className="grid gap-3 sm:hidden">
        {activities.map((a) => (
          <div key={a.id} className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-2.5 ${!a.isActive ? 'opacity-40' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-bold">
                {a.program?.kode} {a.itemName}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${a.status === 'Closed' ? 'bg-green-50 text-green-700' : a.status === 'On Progress' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                {a.status === 'Closed' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {a.status}
              </span>
            </div>

            <div>
              <p className="font-semibold text-slate-900 text-sm">{a.kegiatan}</p>
              {a.descriptionAction && <p className="text-xs text-slate-500 mt-0.5">{a.descriptionAction}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px]"><User size={12} className="text-slate-400" /> {a.picNama}</span>
                <span className="flex items-center gap-1 text-[11px]"><Calendar size={12} className="text-slate-400" /> {a.dueDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Pencil size={14} /></button>
                <button onClick={() => toggle(a.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600">{a.isActive ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">No</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Kegiatan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">PIC</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activities.map((a, i) => (
                <tr key={a.id} className={`hover:bg-slate-50 transition-colors ${!a.isActive ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 text-xs">{a.program?.kode} {a.itemName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{a.program?.programKerja?.kode} - {a.program?.programKerja?.namaProgram?.substring(0, 30)}</p>
                  </td>
                  <td className="px-4 py-3"><p className="font-medium text-slate-700 text-xs">{a.kegiatan}</p>{a.descriptionAction && <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">{a.descriptionAction}</p>}</td>
                  <td className="px-4 py-3"><p className="text-xs text-slate-600">{a.startDate}</p><p className="text-[11px] text-red-400 mt-0.5">Due: {a.dueDate}</p></td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${a.status === 'Closed' ? 'bg-green-50 text-green-700' : a.status === 'On Progress' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{a.status === 'Closed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}{a.status}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-brand-700 text-white flex items-center justify-center text-[10px] font-bold">{a.picNama?.charAt(0)}</div><span className="text-xs font-medium text-slate-600">{a.picNama}</span></div></td>
                  <td className="px-4 py-3 text-right"><div className="inline-flex gap-1"><button onClick={() => openEdit(a)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"><Pencil size={15} /></button><button onClick={() => toggle(a.id)} className="p-1.5 rounded-md hover:bg-amber-50 text-slate-400 hover:text-amber-600">{a.isActive ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive Modal */}
      {showModal && (
        <div className="modal-backdrop fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4">
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10"><h3 className="font-bold text-slate-900 text-sm sm:text-base">{editItem ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><X size={18} /></button></div>
            <form onSubmit={submit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Item Program</label><select value={form.idProgram} onChange={e => setForm({ ...form, idProgram: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200">{subOpts.map(s => <option key={s.id} value={s.id}>[{s.programKerja?.kode}] {s.kode} - {s.namaItem}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Kegiatan</label><input type="text" value={form.kegiatan} onChange={e => setForm({ ...form, kegiatan: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Action / Deskripsi</label><textarea rows={2} value={form.descriptionAction} onChange={e => setForm({ ...form, descriptionAction: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200 resize-none" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Start</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200"><option>Open</option><option>On Progress</option><option>Closed</option></select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">PIC</label><input type="text" value={form.picNama} onChange={e => setForm({ ...form, picNama: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Tindak Lanjut</label><input type="text" value={form.tindakLanjut} onChange={e => setForm({ ...form, tindakLanjut: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Remarks</label><textarea rows={2} value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-200 resize-none" /></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100">Batal</button><button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50">{submitting ? 'Menyimpan...' : 'Simpan'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
