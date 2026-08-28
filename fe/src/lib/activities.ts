import { isSamePerson } from './utils'

export type ActivityWeek = 'ALL' | 'W1' | 'W2' | 'W3' | 'W4' | 'W5'

// Date-only values stay date-only: UTC conversion would shift days in some time zones.
export function dateOnly(value?: string | null): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/)
  if (!match) return ''
  const [, year, month, day] = match
  const parsed = new Date(Number(year), Number(month) - 1, Number(day))
  return parsed.getFullYear() === Number(year) && parsed.getMonth() + 1 === Number(month) && parsed.getDate() === Number(day)
    ? `${year}-${month}-${day}` : ''
}

export function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function activityDate(activity: { startDate?: string; dueDate?: string; createdAt?: string }) {
  return dateOnly(activity.startDate) || dateOnly(activity.dueDate) || dateOnly(activity.createdAt)
}

export function periodRange(year: number, month: number, week: ActivityWeek = 'ALL') {
  const lastDay = new Date(year, month, 0).getDate()
  const startDay = week === 'ALL' ? 1 : (Number(week.slice(1)) - 1) * 7 + 1
  const endDay = week === 'ALL' ? lastDay : Math.min(startDay + 6, lastDay)
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  // W5 in a 28-day February is an empty period, not March 1.
  return { start: `${prefix}-${String(startDay).padStart(2, '0')}`, end: `${prefix}-${String(endDay).padStart(2, '0')}`, empty: startDay > lastDay }
}

export function inDateRange(value: string, start: string, end: string) {
  const date = dateOnly(value)
  return !!date && (!start || date >= start) && (!end || date <= end) && !(start && end && start > end)
}

export function activityWeek(value?: string) {
  const date = dateOnly(value)
  return date ? `M${Math.ceil(Number(date.slice(8, 10)) / 7)}` : '-'
}

export function hasActivityPic(activity: any, person: { name?: string | null; email?: string | null }) {
  if (isSamePerson(person, { email: activity.picEmail })) return true
  const names = String(activity.picNama || activity.namePic || '').split(/[/,;]+/)
  return names.some(name => isSamePerson(person, { name: name.trim() })) ||
    (Array.isArray(activity.pics) && activity.pics.some((pic: any) => isSamePerson(person, { name: pic.name || pic.nama, email: pic.email })))
}

export function activityCounts(activities: Array<{ status: string }>) {
  return {
    total: activities.length,
    open: activities.filter(a => a.status === 'Open').length,
    progress: activities.filter(a => a.status === 'On Progress').length,
    closed: activities.filter(a => a.status === 'Closed').length,
    cancelled: activities.filter(a => a.status === 'Cancelled').length,
  }
}

export function programActivities(parent: any, suppliedActivities?: any[]) {
  const items = (parent.items || []).filter((item: any) => item.isActive !== false)
  const activities = suppliedActivities ?? items.flatMap((item: any) => item.activities || [])
  return activities.filter((activity: any) => activity.isActive !== false && (
    activity.program?.programKerjaId === parent.id ||
    items.some((item: any) => item.id === activity.idProgram || item.id === activity.program?.id)
  ))
}
