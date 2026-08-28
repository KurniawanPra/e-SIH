'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import ModalPortal from './ModalPortal'

function DetailsDialog({ activity, onClose }: { activity: any; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement as HTMLElement | null
    element?.showModal()
    return () => { element?.close(); previousFocus?.focus() }
  }, [])

  const fields = [
    ['Status', activity.status],
    ['PIC', activity.picNama || activity.namePic || activity.pics?.map((p: any) => p.name || p.nama || p.email).join(' / ')],
    ['Email PIC', activity.picEmail || activity.pics?.map((p: any) => p.email).filter(Boolean).join(' / ')],
    ['Program kerja', activity.program?.programKerja?.namaProgram || activity.kategoriProgram],
    ['Subprogram', activity.program?.namaItem || activity.itemName],
    ['Tanggal mulai', activity.startDate],
    ['Target selesai', activity.dueDate || activity.targetDate],
    ['Tanggal selesai', activity.closedDate],
    ['Deskripsi', activity.descriptionAction || activity.description],
    ['Tindak lanjut', activity.tindakLanjut || activity.actionToBeTaken],
    ['Kendala', activity.kendala],
    ['Catatan', activity.remarks],
    ['Waktu laporan', activity.createdAt ? new Date(activity.createdAt).toLocaleString('id-ID') : null],
  ]

  return (
    <dialog ref={dialog} aria-labelledby="activity-detail-title"
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === dialog.current) onClose() }}
      className="w-[calc(100%-2rem)] max-w-2xl max-h-[85dvh] rounded-2xl border border-slate-200 p-0 shadow-xl backdrop:bg-slate-900/50">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-brand-700 mb-1">Detail Laporan Kegiatan</p>
          <h2 id="activity-detail-title" className="text-lg font-bold text-slate-900 whitespace-pre-wrap break-words">{activity.kegiatan || activity.item}</h2>
        </div>
        <button type="button" autoFocus onClick={onClose} aria-label="Tutup detail kegiatan" className="p-2 rounded-lg hover:bg-slate-100 shrink-0"><X size={20} /></button>
      </div>
      <dl className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(([label, value]) => (
          <div key={label} className={['Deskripsi', 'Tindak lanjut', 'Kendala', 'Catatan', 'Program kerja'].includes(label) ? 'sm:col-span-2' : ''}>
            <dt className="text-xs font-semibold text-slate-500 mb-1">{label}</dt>
            <dd className="text-sm text-slate-900 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </dialog>
  )
}

export default function ActivityDetailsModal(props: { activity: any; onClose: () => void }) {
  return <ModalPortal><DetailsDialog {...props} /></ModalPortal>
}
