import { z } from 'zod'

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD').refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, 'Tanggal tidak valid')
const text = z.string().max(20000)
export const activityInput = z.object({
  idProgram: z.string().max(200).nullable().optional(),
  kegiatan: z.string().trim().min(1).max(1000),
  descriptionAction: text.optional(),
  startDate: date,
  dueDate: date,
  closedDate: z.union([date, z.literal(''), z.null()]).optional(),
  status: z.enum(['Open', 'On Progress', 'Closed', 'Cancelled']),
  picNama: z.string().trim().min(1).max(1000),
  picEmail: z.union([z.string().email(), z.literal('')]).optional(),
  tindakLanjut: text.optional(),
  kendala: text.optional(),
  remarks: text.optional(),
})

export const reportQuery = z.object({
  year: z.coerce.number().int().min(1900).max(9999).optional(),
  month: z.union([z.literal('ALL'), z.coerce.number().int().min(1).max(12)]).optional(),
  status: z.enum(['ALL', 'Open', 'On Progress', 'Closed', 'Cancelled']).optional(),
  category: z.string().max(200).optional(),
  includeInactive: z.enum(['true', 'false']).optional(),
})

export function validateActivityDates(activity: { startDate: string; dueDate: string; closedDate?: string | null; status: string }) {
  if (activity.dueDate < activity.startDate) throw Object.assign(new Error('Target selesai tidak boleh sebelum tanggal mulai'), { statusCode: 422 })
  if (activity.status === 'Closed' && !activity.closedDate) throw Object.assign(new Error('Tanggal selesai wajib diisi untuk status Closed'), { statusCode: 422 })
  if (activity.closedDate && activity.closedDate < activity.startDate) throw Object.assign(new Error('Tanggal selesai tidak boleh sebelum tanggal mulai'), { statusCode: 422 })
}

export function changedActivityFields(current: Record<string, any>, next: Record<string, any>, activityId: string, changedBy: string) {
  return Object.entries(next).filter(([field, value]) => value !== undefined && String(current[field] ?? '') !== String(value ?? '')).map(([field, value]) => ({
    activityId, field,
    oldValue: current[field] == null ? null : String(current[field]),
    newValue: value == null ? null : String(value),
    changedBy,
  }))
}
