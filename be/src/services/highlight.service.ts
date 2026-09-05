import { z } from 'zod'

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD').refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, 'Tanggal tidak valid')
const optionalDate = z.union([date, z.literal(''), z.null()]).optional()
const text = z.string().max(20000).nullable().optional()
const pic = z.object({
  name: z.string().trim().max(1000).optional(), nama: z.string().trim().max(1000).optional(),
  email: z.union([z.string().trim().email('Email PIC tidak valid'), z.literal('')]).optional(),
})
export const highlightInput = z.object({
  bulan: z.coerce.number().int().min(1).max(12), tahun: z.coerce.number().int().min(1900).max(9999),
  no: z.number().int().min(0).optional(), item: z.string().trim().min(1, 'Judul Aktivitas wajib diisi').max(1000),
  bagian: z.string().trim().min(1, 'Bagian wajib diisi').max(200),
  description: text, actionToBeTaken: text, remarks: text,
  namePic: z.string().trim().max(20000).nullable().optional(), pics: z.array(pic).max(100).nullable().optional(),
  programId: z.string().max(200).nullable().optional(), startDate: optionalDate, targetDate: optionalDate, closedDate: optionalDate,
  status: z.enum(['Open', 'On Progress', 'Closed', 'Cancelled']).optional(),
})

type ExistingHighlight = { status: string; closedDate?: string | null }
export function parseHighlight(input: unknown, existing?: ExistingHighlight) {
  const parsed = existing ? highlightInput.partial().parse(input) : highlightInput.parse(input)
  const status = parsed.status ?? existing?.status ?? 'On Progress'
  const closedDate = parsed.closedDate === undefined ? existing?.closedDate : parsed.closedDate
  const legacyClosed = existing?.status === 'Closed' && !existing.closedDate
  if (status === 'Closed' && !closedDate && !legacyClosed) {
    throw Object.assign(new Error('Tanggal selesai wajib diisi untuk status Closed'), { statusCode: 422 })
  }
  // Explicit empty arrays clear PICs. Legacy clients editing namePic must also clear old emails.
  const pics = parsed.pics !== undefined
    ? (parsed.pics || []).map(p => ({ name: p.name || p.nama || '', email: p.email || '' })).filter(p => p.name || p.email)
    : parsed.namePic !== undefined
      ? (parsed.namePic || '').split('/').map(name => ({ name: name.trim(), email: '' })).filter(p => p.name)
      : undefined
  return {
    ...parsed, status,
    closedDate: status !== 'Closed' ? null : closedDate || null,
    ...(parsed.startDate !== undefined ? { startDate: parsed.startDate || null } : {}),
    ...(parsed.targetDate !== undefined ? { targetDate: parsed.targetDate || null } : {}),
    ...(parsed.programId !== undefined ? { programId: parsed.programId || null } : {}),
    pics,
    namePic: pics !== undefined ? pics.map(p => p.name || p.email).join(' / ') : undefined,
  }
}
