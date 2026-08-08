'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface ParentPK {
  id: string
  kode: string
  namaProgram: string
  deskripsi?: string
  totalProgress: number
  isActive: boolean
  items?: any[]
}

export default function MasterParentPKPage() {
  const [parents, setParents] = useState<ParentPK[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<ParentPK | null>(null)
  const [formData, setFormData] = useState({ kode: '', namaProgram: '', deskripsi: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchParents = () => {
    api.get('/api/esih/program-kerja')
      .then(res => {
        setParents(res.data.data || [])
        setLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchParents()
  }, [])

  const handleOpenAdd = () => {
    setEditItem(null)
    setFormData({ kode: '', namaProgram: '', deskripsi: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (item: ParentPK) => {
    setEditItem(item)
    setFormData({
      kode: item.kode,
      namaProgram: item.namaProgram,
      deskripsi: item.deskripsi || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editItem) {
        await api.put(`/api/esih/program-kerja/${editItem.id}`, formData)
      } else {
        await api.post('/api/esih/program-kerja', formData)
      }
      setShowModal(false)
      fetchParents()
    } catch (err) {
      alert('Gagal menyimpan data Program Kerja Induk')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin mengubah status aktif program ini?')) {
      try {
        await api.patch(`/api/esih/program-kerja/${id}/toggle`)
        fetchParents()
      } catch (err) {
        alert('Gagal mengubah status aktif')
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted small">Memuat Master Program Kerja Induk...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Master Program Kerja (Induk)</h4>
          <p className="text-muted mb-0">Kelola kelompok utama Program Kerja dan pantau Total Progress Sub-Program.</p>
        </div>
        <button className="btn btn-success fw-bold px-4" onClick={handleOpenAdd}>
          <i className="bi bi-folder-plus me-2"></i>Tambah PK Induk
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">Kode PK</th>
                  <th className="py-3">Nama Program Kerja Induk</th>
                  <th className="py-3">Deskripsi</th>
                  <th className="py-3 text-center">Jumlah Sub-PK</th>
                  <th className="py-3" style={{ width: '220px' }}>Total Progress (Rata-rata)</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="py-3 text-end px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {parents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">Belum ada data Program Kerja Induk.</td>
                  </tr>
                ) : (
                  parents.map((parent) => (
                    <tr key={parent.id} className={!parent.isActive ? 'table-secondary opacity-75' : ''}>
                      <td className="px-4 fw-bold text-success">{parent.kode}</td>
                      <td>
                        <div className="fw-bold text-dark">{parent.namaProgram}</div>
                      </td>
                      <td className="small text-muted">{parent.deskripsi || '-'}</td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-bold">
                          {parent.items?.length || 0} Item
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress w-100" style={{ height: '10px' }}>
                            <div 
                              className={`progress-bar ${parent.totalProgress === 100 ? 'bg-success' : 'bg-primary'}`} 
                              style={{ width: `${parent.totalProgress}%` }}
                            ></div>
                          </div>
                          <span className="small text-dark fw-bold">{parent.totalProgress}%</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill ${parent.isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary'}`}>
                          {parent.isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light me-1" onClick={() => handleOpenEdit(parent)} title="Edit PK">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className={`btn btn-sm ${parent.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`} 
                          onClick={() => handleToggleActive(parent.id)}
                          title={parent.isActive ? 'Nonaktifkan PK' : 'Aktifkan PK'}
                        >
                          <i className={`bi bi-${parent.isActive ? 'eye-slash' : 'check-circle'}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Parent PK */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {editItem ? 'Edit Program Kerja Induk' : 'Tambah Program Kerja Induk'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Kode PK (Singkat)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: A, B, C atau 1.0, 2.0" 
                      value={formData.kode}
                      onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Nama Program Kerja Induk</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: ENABLING DIGITAL AND RELIABLE OPERATION" 
                      value={formData.namaProgram}
                      onChange={(e) => setFormData({ ...formData, namaProgram: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Deskripsi (Keterangan)</label>
                    <textarea 
                      className="form-control" 
                      rows={3}
                      placeholder="Penjelasan singkat mengenai grup program ini..."
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-success fw-bold px-4" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan Program'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
