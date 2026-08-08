'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default function MonthlyActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [subOpts, setSubOpts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ idProgram: '', kegiatan: '', descriptionAction: '', startDate: '', dueDate: '', status: 'On Progress', picNama: '', picEmail: '', remarks: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    const [r1, r2] = await Promise.all([api.get('/api/esih/activities'), api.get('/api/esih/programs')])
    setActivities(r1.data.data || []); setSubOpts(r2.data.data || []); setLoading(false)
  }
  useEffect(() => { fetchAll() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try { await api.post('/api/esih/activities', form); setShowModal(false); fetchAll() }
    catch { alert('Gagal menyimpan') } finally { setSubmitting(false) }
  }

  const openCount = activities.filter(a => a.status === 'Open').length
  const progressCount = activities.filter(a => a.status === 'On Progress').length
  const closedCount = activities.filter(a => a.status === 'Closed').length
  const rate = activities.length > 0 ? Math.round((closedCount / activities.length) * 100) : 0

  if (loading) return <div className="flex items-center justify-center py-20"><span className="spinner" /></div>

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h2 className="text-xl font-bold text-slate-900">Monthly Report</h2><p className="text-sm text-slate-500 mt-0.5">Management Highlight Report — rekapitulasi bulanan.</p></div>
        <button onClick={() => { setForm({ idProgram: subOpts[0]?.id || '', kegiatan: '', descriptionAction: '', startDate: new Date().toISOString().split('T')[0], dueDate: '', status: 'On Progress', picNama: '', picEmail: '', remarks: '' }); setShowModal(true) }} className="self-start flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm"><Plus size={16} /> Tambah Laporan</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wide">Total Action</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activities.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wide flex items-center gap-1"><AlertCircle size={12} className="text-red-400" /> Open</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{openCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wide flex items-center gap-1"><Clock size={12} className="text-amber-400" /> On Progress</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{progressCount}</p>
        </div>
        <div className="bg-brand-700 rounded-xl shadow-sm p-4 text-white">
          <p className="text-[11px] font-semibold uppercase text-white/60 tracking-wide flex items-center gap-1"><CheckCircle2 size={12} /> Closure Rate</p>
          <p className="text-2xl font-bold mt-1">{rate}%</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '900px' }}>
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">No</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Program Kerja</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Item Program</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Action / Kegiatan</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Target</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase">PIC</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {activities.map((a, i) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-medium">{a.program?.programKerja?.kode}. {a.program?.programKerja?.namaProgram?.substring(0, 25)}</span></td>
                  <td className="px-4 py-3 font-semibold text-slate-800 text-xs">{a.program?.kode} {a.itemName}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{a.descriptionAction || a.kegiatan}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{a.dueDate}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${a.status === 'Closed' ? 'bg-green-50 text-green-700' : a.status === 'On Progress' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{a.status === 'Closed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}{a.status}</span></td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600">{a.picNama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">Tambah Laporan Bulanan</h3><button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><X size={18} /></button></div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Item Program</label><select value={form.idProgram} onChange={e => setForm({ ...form, idProgram: e.target.value })} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-200">{subOpts.map(s => <option key={s.id} value={s.id}>[{s.programKerja?.kode}] {s.kode} - {s.namaItem}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Action / Kegiatan</label><textarea rows={3} value={form.kegiatan} onChange={e => setForm({ ...form, kegiatan: e.target.value })} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-200 resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">PIC</label><input type="text" value={form.picNama} onChange={e => setForm({ ...form, picNama: e.target.value })} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-200" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Batal</button><button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg text-sm font-semibold bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50">{submitting ? 'Menyimpan...' : 'Simpan'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
