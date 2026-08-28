import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { activityCounts, activityWeek, dateOnly, hasActivityPic, inDateRange, periodRange, programActivities } from '../../fe/src/lib/activities'
import { loadDashboardData } from '../../fe/src/lib/dashboard-data'
import { changedActivityFields } from '../src/services/activity.service'

test('ALL and M1–M5 produce inclusive ranges and matching badges', () => {
  assert.deepEqual(periodRange(2026, 8), { start: '2026-08-01', end: '2026-08-31', empty: false })
  for (let n = 1; n <= 5; n++) {
    const range = periodRange(2026, 8, `W${n}` as any)
    assert.equal(activityWeek(range.start), `M${n}`)
    assert.equal(inDateRange(range.start, range.start, range.end), true)
    assert.equal(inDateRange(range.end, range.start, range.end), true)
    assert.equal(inDateRange('2026-09-01', range.start, range.end), false)
  }
  assert.equal(inDateRange('2026-08-08', ...Object.values({ start: '2026-08-01', end: '2026-08-07' }) as [string, string]), false)
})

test('February, leap years, reversed ranges and invalid calendar dates', () => {
  assert.equal(periodRange(2026, 2, 'W5').empty, true)
  assert.equal(periodRange(2028, 2, 'W5').end, '2028-02-29')
  assert.equal(dateOnly('2026-02-29'), '')
  assert.equal(dateOnly('2026-08-08T00:00:00Z'), '2026-08-08')
  assert.equal(inDateRange('2026-08-15', '2026-08-20', '2026-08-01'), false)
  assert.equal(inDateRange('2027-01-02', '2026-12-28', '2027-01-07'), true)
})

test('Personal totals include secondary PICs but not partial names', () => {
  const activity = { picNama: 'Andi Wijaya / Siti Aminah', status: 'Closed' }
  assert.equal(hasActivityPic(activity, { name: 'Siti Aminah' }), true)
  assert.equal(hasActivityPic(activity, { name: 'Andi' }), false)
  assert.equal(hasActivityPic({ pics: [{ email: 'siti@example.test' }] }, { email: 'SITI@example.test' }), true)
  assert.deepEqual(activityCounts([activity, { status: 'Cancelled' }, { status: 'Open' }]), { total: 3, closed: 1, cancelled: 1, open: 1, progress: 0 })
})

test('A failed highlight or Portal endpoint cannot erase successful dashboard data', async () => {
  const data = await loadDashboardData(async url => {
    if (url.includes('highlights') || url.endsWith('/users')) throw new Error('unavailable')
    if (url.includes('/dashboard?')) return { data: { kpi: { totalActivities: 2 } } }
    return { data: { data: [{ id: 'persisted' }] } }
  }, 2026)
  assert.equal(data.kpi.totalActivities, 2)
  assert.equal(data.activities[0].id, 'persisted')
  assert.equal(data.parents.length, 1)
  assert.deepEqual(data.errors, ['Highlight', 'Direktori pengguna'])
})

test('Partial status updates audit only changed fields, never absent properties', () => {
  const logs = changedActivityFields({ status: 'Open', kegiatan: 'Original', closedDate: null }, { status: 'On Progress', kegiatan: undefined, closedDate: null }, 'act-1', 'user-1')
  assert.deepEqual(logs.map(log => log.field), ['status'])
})

test('Admin program cards derive counts from nested activities when no personal list is supplied', () => {
  const parent = { id: 'parent', items: [{ id: 'sub', activities: [{ idProgram: 'sub', status: 'Closed' }, { idProgram: 'sub', status: 'Open' }] }] }
  assert.equal(activityCounts(programActivities(parent)).closed, 1)
  assert.equal(activityCounts(programActivities(parent)).total, 2)
  assert.equal(programActivities(parent, []).length, 0)
})
