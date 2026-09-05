import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { parseHighlight } from '../src/services/highlight.service'
import { highlightForm, highlightPayload, highlightPics } from '../../fe/src/lib/highlights'

const base = { bulan: 9, tahun: 2026, bagian: 'IT', item: 'Pemeliharaan server' }

test('Highlight form round trip preserves all editable fields and paired PIC emails', () => {
  const saved = {
    ...base, id: 'highlight-1', status: 'Closed', programId: 'sub-1',
    description: 'Deskripsi\nbaris kedua', actionToBeTaken: 'Periksa hasil', remarks: 'Catatan',
    startDate: '2026-09-01', targetDate: '2026-09-05', closedDate: '2026-09-06',
    pics: [{ name: 'Siti', email: 'siti@example.test' }, { name: 'HSSE', email: '' }],
    namePic: 'Siti / HSSE',
  }
  const payload = highlightPayload(highlightForm(saved))
  assert.deepEqual(payload.pics, saved.pics)
  for (const key of ['item', 'bulan', 'tahun', 'bagian', 'description', 'actionToBeTaken', 'remarks', 'status', 'programId', 'startDate', 'targetDate', 'closedDate', 'namePic'] as const) {
    assert.equal(payload[key], saved[key], key)
  }
  assert.deepEqual(parseHighlight(payload, saved), payload)
})

test('Legacy PIC names survive editing and removing every PIC clears names and emails', () => {
  const old = { ...base, id: 'legacy', status: 'Open', namePic: 'Oka / HSSE' }
  const form = highlightForm(old)
  assert.deepEqual(form.pics, [{ name: 'Oka', email: '' }, { name: 'HSSE', email: '' }])
  const cleared = parseHighlight(highlightPayload({ ...form, pics: [] }), old)
  assert.deepEqual(cleared.pics, [])
  assert.equal(cleared.namePic, '')
  assert.deepEqual(highlightPics({ pics: [{ nama: 'Lama', email: 'lama@example.test' }] }), [{ name: 'Lama', email: 'lama@example.test' }])
  const legacyClient = parseHighlight({ namePic: 'Pengganti' }, old)
  assert.deepEqual(legacyClient.pics, [{ name: 'Pengganti', email: '' }])
})

test('Partial updates preserve absent fields and explicit null clears optional values', () => {
  const partial = parseHighlight({ remarks: 'Diperbarui' }, { status: 'Open' })
  assert.equal(partial.namePic, undefined)
  assert.equal(partial.pics, undefined)
  assert.equal(partial.programId, undefined)
  assert.equal(partial.targetDate, undefined)
  const cleared = parseHighlight({ programId: '', targetDate: '' }, { status: 'Open' })
  assert.equal(cleared.programId, null)
  assert.equal(cleared.targetDate, null)
})

test('New closure requires a date; legacy closure can be edited without inventing a date', () => {
  assert.throws(() => parseHighlight({ ...base, status: 'Closed' }), /Tanggal selesai wajib/)
  assert.throws(() => parseHighlight({ status: 'Closed' }, { status: 'Open' }), /Tanggal selesai wajib/)
  assert.equal(parseHighlight({ remarks: 'Data lama' }, { status: 'Closed', closedDate: null }).closedDate, null)
  assert.equal(parseHighlight({ status: 'Open' }, { status: 'Closed', closedDate: '2026-09-05' }).closedDate, null)
  assert.throws(() => parseHighlight({ closedDate: '' }, { status: 'Closed', closedDate: '2026-09-05' }), /Tanggal selesai wajib/)
})

test('Invalid required fields, calendar dates, status and PIC email are rejected', () => {
  for (const change of [{ item: ' ' }, { bagian: '' }, { bulan: 13 }, { tahun: 0 }, { status: 'Done' }, { targetDate: '2026-02-29' }, { pics: [{ name: 'A', email: 'invalid' }] }]) {
    assert.throws(() => parseHighlight({ ...base, ...change }))
  }
  assert.equal(parseHighlight({ ...base, targetDate: '2028-02-29' }).targetDate, '2028-02-29')
})
