'use client'

import { useEffect, useRef } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import ModalPortal from './ModalPortal'
import { HighlightFormValues, HighlightProgram, HIGHLIGHT_LABELS as labels, HIGHLIGHT_MONTHS, HIGHLIGHT_STATUSES } from '@/lib/highlights'

type Props = {
  form: HighlightFormValues; onChange: (form: HighlightFormValues) => void; editing: boolean
  programs: HighlightProgram[]; bagian: { id: string; kode: string; nama: string; isActive: boolean }[]
  submitting: boolean; error: string; masterError: string; allowLegacyClosed: boolean
  onClose: () => void; onSubmit: () => void
}
const inputClass = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none'

function HighlightFormDialog({ form, onChange, editing, programs, bagian, submitting, error, masterError, allowLegacyClosed, onClose, onSubmit }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const element = dialog.current
    element?.showModal()
    return () => { element?.close(); previous?.focus() }
  }, [])
  const set = <K extends keyof HighlightFormValues>(key: K, value: HighlightFormValues[K]) => onChange({ ...form, [key]: value })
  const textInput = (key: 'item' | 'startDate' | 'targetDate' | 'closedDate', required = false) => <label className="block">
    <span className="block text-xs font-semibold text-slate-600 mb-1">{labels[key]}{required ? ' *' : ''}</span>
    <input className={inputClass} value={form[key]} required={required} maxLength={key === 'item' ? 1000 : undefined}
      type={key === 'item' || (form[key] && !/^\d{4}-\d{2}-\d{2}$/.test(form[key])) ? 'text' : 'date'}
      onChange={e => set(key, e.target.value)} />
  </label>
  return <dialog ref={dialog} aria-labelledby="highlight-form-title" onCancel={e => { e.preventDefault(); if (!submitting) onClose() }}
      className="w-[calc(100%-2rem)] max-w-2xl max-h-[90dvh] rounded-2xl border border-slate-200 p-0 shadow-xl backdrop:bg-slate-900/50">
      <form onSubmit={e => { e.preventDefault(); onSubmit() }}>
        <header className="sticky top-0 z-10 flex justify-between items-center gap-3 border-b bg-white px-5 py-4">
          <h2 id="highlight-form-title" className="font-bold text-slate-900">{editing ? 'Edit' : 'Tambah'} Update Aktivitas</h2>
          <button type="button" disabled={submitting} onClick={onClose} aria-label="Tutup form aktivitas" className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
        </header>
        <fieldset disabled={submitting} className="p-5 space-y-4">
          {masterError && <p role="status" className="text-sm text-amber-800 bg-amber-50 p-3 rounded-xl">{masterError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-slate-600">Bulan *<select aria-label="Bulan" className={`${inputClass} mt-1`} value={form.bulan} onChange={e => set('bulan', Number(e.target.value))}>{HIGHLIGHT_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
            <label className="text-xs font-semibold text-slate-600">Tahun *<input className={`${inputClass} mt-1`} type="number" required min={1900} max={9999} value={form.tahun} onChange={e => set('tahun', Number(e.target.value))} /></label>
          </div>
          <label className="block text-xs font-semibold text-slate-600">{labels.bagian} *<select aria-label={labels.bagian} required className={`${inputClass} mt-1`} value={form.bagian} onChange={e => set('bagian', e.target.value)}>
            <option value="">Pilih bagian</option>
            {form.bagian && !bagian.some(b => b.kode === form.bagian && b.isActive) && <option value={form.bagian}>{form.bagian} (data tersimpan)</option>}
            {bagian.filter(b => b.isActive).map(b => <option key={b.id} value={b.kode}>{b.nama} ({b.kode})</option>)}
          </select></label>
          {textInput('item', true)}
          <div className="space-y-2"><p className="text-xs font-semibold text-slate-600">{labels.namePic}</p>
            <p className="text-xs text-slate-500">Nama orang atau unit dapat diisi manual. Email opsional.</p>
            {form.pics.map((pic, i) => <div key={i} className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="text-xs text-slate-600">Nama / unit<input className={`${inputClass} mt-1`} maxLength={1000} value={pic.name} onChange={e => set('pics', form.pics.map((p, index) => index === i ? { ...p, name: e.target.value } : p))} /></label>
                <label className="text-xs text-slate-600">Email PIC<input type="email" className={`${inputClass} mt-1`} value={pic.email} onChange={e => set('pics', form.pics.map((p, index) => index === i ? { ...p, email: e.target.value } : p))} /></label>
              </div>
              <button type="button" aria-label={`Hapus PIC ${i + 1}`} onClick={() => set('pics', form.pics.filter((_, index) => index !== i))} className="p-2 text-red-600"><Trash2 size={16} /></button>
            </div>)}
            <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700" onClick={() => set('pics', [...form.pics, { name: '', email: '' }])}><Plus size={16} /> Tambah PIC</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-semibold text-slate-600">{labels.status}<select aria-label={labels.status} className={`${inputClass} mt-1`} value={form.status} onChange={e => onChange({ ...form, status: e.target.value, closedDate: e.target.value === 'Closed' ? form.closedDate : '' })}>{HIGHLIGHT_STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
            {textInput('startDate')}
            {textInput('targetDate')}
            {form.status === 'Closed' && textInput('closedDate', !allowLegacyClosed)}
          </div>
          {allowLegacyClosed && form.status === 'Closed' && !form.closedDate && <p className="text-xs text-slate-500">Data lama belum memiliki tanggal selesai. Lengkapi jika tanggalnya diketahui.</p>}
          {(['description', 'actionToBeTaken', 'remarks'] as const).map(key => <label key={key} className="block text-xs font-semibold text-slate-600">{labels[key]}<textarea className={`${inputClass} mt-1`} rows={3} maxLength={20000} value={form[key]} onChange={e => set(key, e.target.value)} /></label>)}
        </fieldset>
        <footer className="sticky bottom-0 border-t bg-white p-5">
          {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <div className="flex justify-end gap-2"><button type="button" disabled={submitting} onClick={onClose} className="rounded-xl border px-4 py-2 text-sm">Batal</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan'}</button></div>
        </footer>
      </form>
    </dialog>
}

export default function HighlightFormModal(props: Props) {
  return <ModalPortal><HighlightFormDialog {...props} /></ModalPortal>
}
