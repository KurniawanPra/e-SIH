'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import ModalPortal from './ModalPortal'
import { Highlight, HIGHLIGHT_LABELS as labels, HIGHLIGHT_MONTHS, highlightPics, formatHighlightDate } from '@/lib/highlights'

type Props = { activity: Highlight; onClose: () => void }

function HighlightDetailsDialog({ activity, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const element = dialog.current
    element?.showModal()
    return () => { element?.close(); previous?.focus() }
  }, [])
  const timestamp = (value?: string) => value ? new Date(value).toLocaleString('id-ID') : '—'
  const fields: [string, string | null | undefined][] = [
    ['Periode', `${HIGHLIGHT_MONTHS[activity.bulan - 1]} ${activity.tahun}`],
    [labels.bagian, activity.bagian],
    ...(activity.program?.programKerja?.namaProgram ? [['Program kerja', activity.program.programKerja.namaProgram] as [string, string]] : []),
    ...(activity.program?.namaItem || activity.programId ? [[labels.programId, activity.program?.namaItem || activity.programId] as [string, string]] : []),
    [labels.namePic, highlightPics(activity).map(p => `${p.name || p.email}${p.name && p.email ? ` (${p.email})` : ''}`).join('\n')],
    [labels.status, activity.status],
    [labels.startDate, formatHighlightDate(activity.startDate)],
    [labels.targetDate, formatHighlightDate(activity.targetDate)],
    ...(activity.status === 'Closed' ? [[labels.closedDate, formatHighlightDate(activity.closedDate)] as [string, string]] : []),
    [labels.description, activity.description], [labels.actionToBeTaken, activity.actionToBeTaken], [labels.remarks, activity.remarks],
  ]
  return <dialog ref={dialog} aria-labelledby="highlight-detail-title" onCancel={e => { e.preventDefault(); onClose() }}
      onClick={e => { if (e.target === dialog.current) onClose() }}
      className="w-[calc(100%-2rem)] max-w-2xl max-h-[85dvh] rounded-2xl border border-slate-200 p-0 shadow-xl backdrop:bg-slate-900/50">
      <header className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-start justify-between gap-4">
        <div className="min-w-0"><p className="text-xs font-semibold text-brand-700 mb-1">Detail Update Aktivitas</p>
          <h2 id="highlight-detail-title" className="text-lg font-bold text-slate-900 whitespace-pre-wrap break-words">{activity.item}</h2></div>
        <button type="button" autoFocus onClick={onClose} aria-label="Tutup detail aktivitas" className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
      </header>
      <dl className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(([label, value]) => <div key={label} className={[labels.namePic, labels.description, labels.actionToBeTaken, labels.remarks].includes(label) ? 'sm:col-span-2' : ''}>
          <dt className="text-xs font-semibold text-slate-500 mb-1">{label}</dt>
          <dd className="text-sm text-slate-900 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{value || '—'}</dd>
        </div>)}
      </dl>
      <footer className="border-t p-5 text-xs text-slate-500 space-y-1"><p>Dibuat pada: {timestamp(activity.createdAt)}</p><p>Diperbarui pada: {timestamp(activity.updatedAt)}</p></footer>
    </dialog>
}

export default function HighlightDetailsModal(props: Props) {
  return <ModalPortal><HighlightDetailsDialog {...props} /></ModalPortal>
}
