'use client'

import { useEffect, useState } from 'react'
import type { SessionUser } from '@/types/auth'
import { getCurrentUser, api } from '@/lib/api'

export default function WeeklyActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
    api.get('/api/esih/activities')
      .then(res => {
        setActivities(res.data.data || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted small">Memuat Weekly Activities...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Weekly Activities</h4>
          <p className="text-muted mb-0">Laporan aktivitas mingguan tim yang terhubung ke Master Program Kerja.</p>
        </div>
        <button className="btn btn-success fw-bold px-4">
          <i className="bi bi-plus-lg me-2"></i>Tambah Aktivitas
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '1000px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3">Program Induk (Parent)</th>
                  <th className="py-3">Sub-Program (Child)</th>
                  <th className="py-3">Kegiatan Mingguan</th>
                  <th className="py-3">Tenggat Waktu</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 px-4">PIC (Staff)</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">Belum ada data aktivitas mingguan.</td>
                  </tr>
                ) : (
                  activities.map((act, index) => (
                    <tr key={act.id}>
                      <td className="px-4 text-muted fw-bold">{index + 1}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                          {act.program?.programKerja?.kode || '1.0'} {act.program?.programKerja?.namaProgram || act.kategoriProgram}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{act.program?.kode || ''} {act.itemName}</div>
                      </td>
                      <td>
                        <div className="fw-medium text-dark">{act.kegiatan}</div>
                        <div className="small text-muted text-truncate" style={{ maxWidth: '240px' }}>
                          {act.descriptionAction || '-'}
                        </div>
                      </td>
                      <td>
                        <div className="small text-dark"><i className="bi bi-calendar-check me-1 text-success"></i>{act.startDate}</div>
                        <div className="small text-danger mt-1"><i className="bi bi-calendar-x me-1"></i>{act.dueDate}</div>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${act.status === 'Closed' ? 'bg-success' : act.status === 'On Progress' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                            {act.picNama?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="small fw-bold text-dark">{act.picNama}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
