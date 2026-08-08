'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface ParentPK {
  id: string
  kode: string
  namaProgram: string
}

interface SubPK {
  id: string
  programKerjaId: string
  kode: string
  namaItem: string
  status: string
  progress: number
  keterangan?: string
  isActive: boolean
  programKerja?: ParentPK
}

export default function MasterSubPKPage() {
  const [subPrograms, setSubPrograms] = useState<SubPK[]>([])
  const [parentOptions, setParentOptions] = useState<ParentPK[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<SubPK | null>(null)
  const [formData, setFormData] = useState({
    programKerjaId: '',
    kode: '',
    namaItem: '',
    status: 'On Progress',
    progress: 0,
    keterangan: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [resSub, resParent] = await Promise.all([
        api.get('/api/esih/programs'),
        api.get('/api/esih/program-kerja'),
      ])
      setSubPrograms(resSub.data.data || [])
      setParentOptions(resParent.data.data || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAdd = () => {
    setEditItem(null)
    setFormData({
      programKerjaId: parentOptions[0]?.id || '',
      kode: '',
      namaItem: '',
      status: 'On Progress',
      progress: 0,
      keterangan: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item: SubPK) => {
    setEditItem(item)
    setFormData({
      programKerjaId: item.programKerjaId,
      kode: item.kode,
      namaItem: item.namaItem,
      status: item.status,
      progress: item.progress,
      keterangan: item.keterangan || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editItem) {
        await api.put(`/api/esih/programs/${editItem.id}`, formData)
      } else {
        await api.post('/api/esih/programs', formData)
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      alert('Gagal menyimpan Sub-Program Kerja')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin mengubah status aktif Sub-Program ini?')) {
      try {
        await api.patch(`/api/esih/programs/${id}/toggle`)
        fetchData()
      } catch (err) {
        alert('Gagal mengubah status aktif')
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted small">Memuat Master Sub-Program Kerja...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Master Sub-Program Kerja (Sub PK)</h4>
          <p className="text-muted mb-0">Kelola rincian item Sub-Program Kerja (misal: IT Development, IT Infrastructure, dll).</p>
        </div>
        <button className="btn btn-success fw-bold px-4" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Tambah Sub PK
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">Kode Sub</th>
                  <th className="py-3">Program Induk (Parent)</th>
                  <th className="py-3">Nama Sub-Program (Item)</th>
                  <th className="py-3">Status</th>
                  <th className="py-3" style={{ width: '180px' }}>Progress</th>
                  <th className="py-3 text-center">Status Aktif</th>
                  <th className="py-3 text-end px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {subPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">Belum ada data Sub-Program Kerja.</td>
                  </tr>
                ) : (
                  subPrograms.map((item) => (
                    <tr key={item.id} className={!item.isActive ? 'table-secondary opacity-75' : ''}>
                      <td className="px-4 fw-bold text-success">{item.kode}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                          {item.programKerja?.kode} - {item.programKerja?.namaProgram}
                        </span>
                      </td>
                      <td className="fw-bold text-dark">{item.namaItem}</td>
                      <td>
                        <span className={`badge rounded-pill ${item.status === 'Closed' ? 'bg-success' : item.status === 'On Progress' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress w-100" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar ${item.progress === 100 ? 'bg-success' : 'bg-primary'}`} 
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                          <span className="small text-muted fw-bold">{item.progress}%</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill ${item.isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary'}`}>
                          {item.isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light me-1" onClick={() => handleOpenEdit(item)} title="Edit Sub PK">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className={`btn btn-sm ${item.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`} 
                          onClick={() => handleToggleActive(item.id)}
                          title={item.isActive ? 'Nonaktifkan Sub PK' : 'Aktifkan Sub PK'}
                        >
                          <i className={`bi bi-${item.isActive ? 'eye-slash' : 'check-circle'}`}></i>
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

      {/* Modal Add/Edit Sub PK */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {editItem ? `Edit Sub PK: ${editItem.namaItem}` : 'Tambah Sub-Program Kerja'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Pilih Program Kerja Induk (Parent)</label>
                    <select 
                      className="form-select" 
                      value={formData.programKerjaId}
                      onChange={(e) => setFormData({ ...formData, programKerjaId: e.target.value })}
                      required
                    >
                      {parentOptions.map((p) => (
                        <option value={p.id} key={p.id}>
                          [{p.kode}] {p.namaProgram}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-bold text-dark">Kode Sub</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Contoh: A.1, B.2" 
                        value={formData.kode}
                        onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-bold text-dark">Nama Sub-Program (Item)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Contoh: IT Development" 
                        value={formData.namaItem}
                        onChange={(e) => setFormData({ ...formData, namaItem: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold text-dark">Status Pekerjaan</label>
                      <select 
                        className="form-select" 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Open">Open</option>
                        <option value="On Progress">On Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold text-dark">Progress (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        className="form-control" 
                        value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Keterangan / Detail Sub PK</label>
                    <textarea 
                      className="form-control" 
                      rows={3}
                      placeholder="Penjelasan aktivitas atau ruang lingkup sub program ini..."
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-success fw-bold px-4" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan Sub PK'}
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
