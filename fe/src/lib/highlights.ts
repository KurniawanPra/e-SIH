export const HIGHLIGHT_STATUSES = ['Open', 'On Progress', 'Closed', 'Cancelled'] as const
export const HIGHLIGHT_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export const HIGHLIGHT_LABELS = {
  item: 'Judul Aktivitas', bagian: 'Bagian', programId: 'Subprogram', namePic: 'Penanggung Jawab (PIC)',
  status: 'Status', startDate: 'Tanggal Mulai', targetDate: 'Target selesai', closedDate: 'Tanggal selesai',
  description: 'Deskripsi', actionToBeTaken: 'Tindak lanjut', remarks: 'Catatan',
}
export type HighlightPic = { name: string; email: string }
export type HighlightProgram = { id: string; namaItem: string; isActive?: boolean; programKerja?: { namaProgram: string } }
export type Highlight = {
  id: string; bulan: number; tahun: number; item: string; status: string
  bagian?: string | null; description?: string | null; actionToBeTaken?: string | null
  namePic?: string | null; pics?: unknown; programId?: string | null; program?: HighlightProgram | null
  startDate?: string | null; targetDate?: string | null; closedDate?: string | null; remarks?: string | null
  createdAt?: string; updatedAt?: string
}
export type HighlightFormValues = {
  bulan: number; tahun: number; bagian: string; item: string; description: string
  actionToBeTaken: string; pics: HighlightPic[]; programId: string
  startDate: string; targetDate: string; closedDate: string; status: string; remarks: string
}

export function highlightPics(value: Pick<Highlight, 'pics' | 'namePic'>): HighlightPic[] {
  const pics = Array.isArray(value.pics) ? value.pics.flatMap(p => {
    if (!p || typeof p !== 'object') return []
    const name = String(p.name || p.nama || '').trim()
    const email = String(p.email || '').trim()
    return name || email ? [{ name, email }] : []
  }) : []
  return pics.length ? pics : (value.namePic || '').split('/').map(name => ({ name: name.trim(), email: '' })).filter(p => p.name)
}

function inputDate(value?: string | null) {
  return value?.match(/^\d{4}-\d{2}-\d{2}T/) ? value.slice(0, 10) : value || ''
}

export function highlightForm(value?: Highlight, month = new Date().getMonth() + 1, year = new Date().getFullYear(), bagian = ''): HighlightFormValues {
  return {
    bulan: value?.bulan ?? month, tahun: value?.tahun ?? year, bagian: value?.bagian || bagian,
    item: value?.item || '', description: value?.description || '', actionToBeTaken: value?.actionToBeTaken || '',
    pics: value ? highlightPics(value) : [], programId: value?.programId || value?.program?.id || '',
    startDate: inputDate(value?.startDate), targetDate: inputDate(value?.targetDate), closedDate: inputDate(value?.closedDate),
    status: value?.status || 'On Progress', remarks: value?.remarks || '',
  }
}

export function highlightPayload(form: HighlightFormValues) {
  const pics = form.pics.map(p => ({ name: p.name.trim(), email: p.email.trim() })).filter(p => p.name || p.email)
  return {
    ...form, item: form.item.trim(), bagian: form.bagian.trim(), pics,
    namePic: pics.map(p => p.name || p.email).join(' / '),
    programId: form.programId || null, startDate: form.startDate || null, targetDate: form.targetDate || null,
    closedDate: form.status === 'Closed' ? form.closedDate || null : null,
  }
}

export function formatHighlightDate(value?: string | null) {
  if (!value) return '—'
  const date = inputDate(value)
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split('-').reverse().join('/') : date
}
