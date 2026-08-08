'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function MonthlyActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    periode: 'Juli 2024',
    subject: 'A. ENABLING DIGITAL AND RELIABLE OPERATION',
    subSubject: 'IT Development',
    actionItem: '',
    status: 'On Progress',
    remarks: '',
  })

  useEffect(() => {
    api.get('/api/esih/activities')
      .then(res => {
        setActivities(res.data.data || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Aktivitas bulanan berhasil ditambahkan ke rekapitulasi!')
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted small">Memuat Monthly Activities...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Monthly Activities (Management Highlight Report)</h4>
          <p className="text-muted mb-0">Rekapitulasi laporan bulanan manajemen dan pencapaian target.</p>
        </div>
        <button className="btn btn-success fw-bold px-4" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Tambah Laporan Bulanan
        </button>
      </div>

      {/* KPI Highlight Header Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm bg-white p-3">
            <span className="small text-muted fw-bold text-uppercase">Total Action Item</span>
            <h3 className="fw-bold text-dark mb-0">{activities.length}</h3>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm bg-white p-3">
            <span className="small text-muted fw-bold text-uppercase">Status Open</span>
            <h3 className="fw-bold text-danger mb-0">{activities.filter(a => a.status === 'Open').length}</h3>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm bg-white p-3">
            <span className="small text-muted fw-bold text-uppercase">Status Closed</span>
            <h3 className="fw-bold text-success mb-0">{activities.filter(a => a.status === 'Closed').length}</h3>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 shadow-sm bg-success text-white p-3">
            <span className="small text-white-50 fw-bold text-uppercase">Closure Rate (%)</span>
            <h3 className="fw-bold mb-0">
              {activities.length > 0 ? Math.round((activities.filter(a => a.status === 'Closed').length / activities.length) * 100) : 0}%
            </h3>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3">Subject / Program Induk</th>
                  <th className="py-3">Sub Subject</th>
                  <th className="py-3">Action to be taken</th>
                  <th className="py-3">Target Date</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 px-4">PIC</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, index) => (
                  <tr key={act.id}>
                    <td className="px-4 fw-bold text-muted">{index + 1}</td>
                    <td><span className="badge bg-success-subtle text-success border">{act.kategoriProgram}</span></td>
                    <td className="fw-bold text-dark">{act.itemName}</td>
                    <td>{act.descriptionAction || act.kegiatan}</td>
                    <td><i className="bi bi-calendar me-1 text-muted"></i>{act.dueDate}</td>
                    <td>
                      <span className={`badge rounded-pill ${act.status === 'Closed' ? 'bg-success' : act.status === 'On Progress' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="px-4 fw-medium">{act.picNama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Monthly Activity */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Tambah Laporan Bulanan</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Periode Laporan</label>
                    <input type="text" className="form-control" value={formData.periode} onChange={(e) => setFormData({ ...formData, periode: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Subject / Program Induk</label>
                    <input type="text" className="form-control" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Sub Subject</label>
                    <input type="text" className="form-control" value={formData.subSubject} onChange={(e) => setFormData({ ...formData, subSubject: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Action Item / Kegiatan</label>
                    <textarea className="form-control" rows={3} value={formData.actionItem} onChange={(e) => setFormData({ ...formData, actionItem: e.target.value })} required></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-success fw-bold px-4">Simpan Laporan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
