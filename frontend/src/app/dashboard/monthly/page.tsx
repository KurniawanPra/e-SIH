'use client'

import { useEffect, useState, useMemo } from 'react'
import { api, getCurrentUser } from '@/lib/api'
import {
  CalendarRange,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  Plus,
  X,
  FileSpreadsheet,
  Printer,
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  FolderOpen,
  TrendingUp
} from 'lucide-react'
import ModalPortal from '@/components/ModalPortal'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-sky-100 text-sky-700 border-sky-200',
  'On Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  Closed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-slate-200 text-slate-600 border-slate-300',
}

const emptyForm = {
  bulan: new Date().getMonth() + 1,
  tahun: new Date().getFullYear(),
  item: '',
  description: '',
  actionToBeTaken: '',
  namePic: '',
  targetDate: '',
  closedDate: '',
  status: 'On Progress',
  remarks: '',
}

export default function MonthlyActivitiesPage() {
  const [userRole, setUserRole] = useState<string>('USER')
  const [highlights, setHighlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear())
  const [view, setView] = useState<'cards' | 'table'>('table')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        const isAdmin = u?.role === 'ADMIN'
        setUserRole(u?.role || 'USER')
        setView(isAdmin ? 'cards' : 'table')
      })
      .catch(() => setView('table'))
  }, [])

  const fetchHighlights = async (month: number, year: number) => {
    try {
      const r = await api.get('/api/esih/highlights', { params: { month, year } })
      setHighlights(r.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHighlights(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear])

  const [yearHighlights, setYearHighlights] = useState<any[]>([])
  useEffect(() => {
    api
      .get('/api/esih/highlights', { params: { year: selectedYear } })
      .then(r => setYearHighlights(r.data.data || []))
      .catch(() => setYearHighlights([]))
  }, [selectedYear])

  const stats = useMemo(() => {
    const total = highlights.length
    const open = highlights.filter(h => h.status === 'Open').length
    const progress = highlights.filter(h => h.status === 'On Progress').length
    const closed = highlights.filter(h => h.status === 'Closed').length
    const cancelled = highlights.filter(h => h.status === 'Cancelled').length
    const closure = total > 0 ? Math.round((closed / total) * 100) : 0

    const bulanan: Record<number, { total: number; closure: number }> = {}
    for (let m = 1; m <= 12; m++) {
      const items = yearHighlights.filter(h => h.bulan === m)
      const c = items.filter(h => h.status === 'Closed').length
      bulanan[m] = {
        total: items.length,
        closure: items.length > 0 ? Math.round((c / items.length) * 100) : 0,
      }
    }
    return { total, open, progress, closed, cancelled, closure, bulanan }
  }, [highlights, yearHighlights])

  const filteredHighlights = useMemo(() => {
    if (!search.trim()) return highlights
    const q = search.toLowerCase()
    return highlights.filter(h =>
      h.item?.toLowerCase().includes(q) ||
      h.description?.toLowerCase().includes(q) ||
      h.namePic?.toLowerCase().includes(q) ||
      h.remarks?.toLowerCase().includes(q)
    )
  }, [highlights, search])

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, i) => selectedYear - 2 + i).sort((a, b) => b - a),
    [selectedYear],
  )

  const openAddModal = (bulan = selectedMonth, tahun = selectedYear) => {
    setEditingId(null)
    setForm({ ...emptyForm, bulan, tahun })
    setShowModal(true)
  }

  const openEditModal = (h: any) => {
    setEditingId(h.id)
    setForm({
      bulan: h.bulan,
      tahun: h.tahun,
      item: h.item || '',
      description: h.description || '',
      actionToBeTaken: h.actionToBeTaken || '',
      namePic: h.namePic || '',
      targetDate: h.targetDate || '',
      closedDate: h.closedDate || '',
      status: h.status || 'On Progress',
      remarks: h.remarks || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.item.trim()) return
    setSubmitting(true)
    try {
      const payload = { ...form }
      if (editingId) {
        await api.put(`/api/esih/highlights/${editingId}`, payload)
      } else {
        await api.post('/api/esih/highlights', payload)
      }
      setShowModal(false)
      await fetchHighlights(selectedMonth, selectedYear)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus item highlight ini?')) return
    try {
      await api.delete(`/api/esih/highlights/${id}`)
      await fetchHighlights(selectedMonth, selectedYear)
    } catch (err) {
      console.error(err)
    }
  }

  const exportCsv = () => {
    const header = ['No', 'Item', 'Description', 'Action To Be Taken', 'Name PIC', 'Target Date', 'Closed Date', 'Status', 'Remarks']
    const rows = highlights.map(h => [
      h.no, h.item, h.description, h.actionToBeTaken, h.namePic, h.targetDate, h.closedDate, h.status, h.remarks
    ])
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `Management_Highlight_Report_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const StatCard = ({ label, value, color, icon }: any) => (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm min-w-0">
      <div className={`shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <div className="truncate text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
        <div className="text-xl font-black text-slate-800 leading-tight">{value}</div>
      </div>
    </div>
  )

  const formInput = (label: string, field: keyof typeof form, type = 'text') => (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={form[field] as string}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
      />
    </label>
  )

  const periodLabel = `PERIODE : 01 - ${new Date(selectedYear, selectedMonth, 0).getDate()} ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ===== HEADER ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-black text-slate-800">
            <CalendarRange size={22} className="text-brand-600 shrink-0" /> Management Highlight Report
          </h1>
          <p className="text-xs font-medium text-slate-500">No. Dokumen: INLHO/REP-F/-021 · {periodLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <FileSpreadsheet size={15} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Action Item" value={stats.total} color="text-brand-600" icon={<FileText size={17} />} />
        <StatCard label="Open" value={stats.open} color="text-sky-600" icon={<AlertCircle size={17} />} />
        <StatCard label="On Progress" value={stats.progress} color="text-amber-600" icon={<Clock size={17} />} />
        <StatCard label="Closed" value={stats.closed} color="text-emerald-600" icon={<CheckCircle2 size={17} />} />
        <StatCard label="Cancelled" value={stats.cancelled} color="text-slate-400" icon={<XCircle size={17} />} />
        <StatCard label="Closure (%)" value={`${stats.closure}%`} color="text-indigo-600" icon={<TrendingUp size={17} />} />
      </div>

      {view === 'cards' ? (
        /* ===== ADMIN: MONTH CARDS ===== */
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
              <FolderOpen size={18} className="text-brand-600" /> Pilih Periode Bulanan {selectedYear}
            </h2>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {MONTH_NAMES.map((m, i) => {
              const month = i + 1
              const isCurrent = month === today.getMonth() + 1 && selectedYear === today.getFullYear()
              return (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMonth(month)
                    setView('table')
                  }}
                  className={`group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    isCurrent
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 bg-white hover:border-brand-300'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                      Sekarang
                    </span>
                  )}
                  <span className="text-xl font-black text-slate-800">{m}</span>
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Action Item</span>
                      <span className="text-slate-800">{stats.bulanan?.[month]?.total ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Closure</span>
                      <span className="text-emerald-600">{stats.bulanan?.[month]?.closure ?? 0}%</span>
                    </div>
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-brand-600 opacity-40 transition group-hover:opacity-100">
                    Buka tabel →
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* ===== TABLE VIEW (Format INLHO/REP-F/-021) ===== */
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-stretch">
            {userRole === 'ADMIN' && (
              <button onClick={() => setView('cards')} className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:w-auto">
                <ArrowLeft size={15} /> Pilih Bulan Lain
              </button>
            )}
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-2 py-2 text-sm font-semibold text-slate-700 sm:flex-1 sm:min-w-0"
            >
              {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-2 py-2 text-sm font-semibold text-slate-700 sm:flex-1 sm:min-w-0"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="relative col-span-3 sm:col-span-auto sm:flex-1 sm:min-w-0">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari item, PIC, deskripsi..."
                className="w-full rounded-xl border border-slate-300 py-2 pl-8 pr-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
              />
            </div>
            <button onClick={() => openAddModal()} className="flex col-span-3 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 sm:w-auto">
              <Plus size={15} /> Tambah Highlight
            </button>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-[11px] font-black uppercase tracking-wide text-slate-600">
                  <th className="px-2 py-2.5 text-center w-10">No</th>
                  <th className="px-2 py-2.5 min-w-36">Item</th>
                  <th className="px-2 py-2.5 min-w-64">Description</th>
                  <th className="px-2 py-2.5 min-w-64">Action To Be Taken</th>
                  <th className="px-2 py-2.5 min-w-32">Name PIC</th>
                  <th className="px-2 py-2.5 w-24">Target Date</th>
                  <th className="px-2 py-2.5 w-24">Closed Date</th>
                  <th className="px-2 py-2.5 w-28">Status</th>
                  <th className="px-2 py-2.5 min-w-40">Remarks</th>
                  <th className="px-2 py-2.5 w-20 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredHighlights.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <div className="text-4xl">📋</div>
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        Belum ada data highlight pada {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                      </p>
                      <button onClick={() => openAddModal()} className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700">
                        Tambah Highlight Pertama
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredHighlights.map(h => (
                    <tr key={h.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                      <td className="px-2 py-2.5 text-center font-black text-slate-500">{h.no}</td>
                      <td className="px-2 py-2.5 font-bold text-slate-700">{h.item}</td>
                      <td className="px-2 py-2.5 text-slate-600 whitespace-pre-wrap">{h.description || '-'}</td>
                      <td className="px-2 py-2.5 text-slate-600 whitespace-pre-wrap">{h.actionToBeTaken || '-'}</td>
                      <td className="px-2 py-2.5 text-slate-600">{h.namePic || '-'}</td>
                      <td className="px-2 py-2.5 text-slate-600">{h.targetDate || '-'}</td>
                      <td className="px-2 py-2.5 text-slate-600">{h.closedDate || '-'}</td>
                      <td className="px-2 py-2.5">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_COLORS[h.status] || STATUS_COLORS.Open}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-slate-500 whitespace-pre-wrap">{h.remarks || '-'}</td>
                      <td className="px-2 py-2.5 print:hidden">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openEditModal(h)} title="Edit" className="rounded-xl p-1.5 text-sky-600 hover:bg-sky-50">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(h.id)} title="Hapus" className="rounded-xl p-1.5 text-red-600 hover:bg-red-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500">
            <span>Menampilkan {filteredHighlights.length} dari {highlights.length} action item</span>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5">
              Closure Rate : <b className="text-brand-700">{stats.closure}%</b>
            </span>
          </div>
        </div>
      )}

      {/* ===== MODAL FORM ===== */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-overlay-fade overflow-y-auto">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl my-auto">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800">
                  {editingId ? 'Edit Highlight' : 'Tambah Highlight'} — {MONTH_NAMES[form.bulan - 1]} {form.tahun}
                </h3>
                <button onClick={() => setShowModal(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-1">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wide">Bulan</span>
                    <select
                      value={form.bulan}
                      onChange={e => setForm({ ...form, bulan: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                    >
                      {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </label>
                </div>
                <div className="md:col-span-1">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wide">Tahun</span>
                    <select
                      value={form.tahun}
                      onChange={e => setForm({ ...form, tahun: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                    >
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </label>
                </div>
                <div className="md:col-span-2">{formInput('Item *', 'item')}</div>
                <div className="md:col-span-2">{formInput('Name PIC', 'namePic')}</div>
                <div className="md:col-span-1">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wide">Status</span>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                    >
                      {['Open', 'On Progress', 'Closed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
                <div className="md:col-span-1">{formInput('Target Date', 'targetDate', 'date')}</div>
                {form.status === 'Closed' && (
                  <div className="md:col-span-1">{formInput('Closed Date', 'closedDate', 'date')}</div>
                )}
                <div className="md:col-span-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wide">Description</span>
                    <textarea
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                    />
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wide">Action To Be Taken</span>
                    <textarea
                      value={form.actionToBeTaken}
                      onChange={e => setForm({ ...form, actionToBeTaken: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                    />
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wide">Remarks</span>
                    <textarea
                      value={form.remarks}
                      onChange={e => setForm({ ...form, remarks: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.item.trim()}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
