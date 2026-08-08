'use client'

import { useEffect, useState } from 'react'
import type { SessionUser } from '@/types/auth'
import { getCurrentUser, api } from '@/lib/api'

interface SubPKOption {
  id: string
  kode: string
  namaItem: string
  programKerja?: {
    kode: string
    namaProgram: string
  }
}

interface ActivityItem {
  id: string
  no: number
  idProgram: string
  kategoriProgram: string
  itemName: string
  kegiatan: string
  descriptionAction?: string
  startDate: string
  dueDate: string
  closedDate?: string
  tindakLanjut?: string
  kendala?: string
  status: string
  remarks?: string
  picEmail: string
  picNama: string
  isActive: boolean
  program?: {
    kode: string
    namaItem: string
    programKerja?: {
      kode: string
      namaProgram: string
    }
  }
}

export default function WeeklyActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [subOptions, setSubOptions] = useState<SubPKOption[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<ActivityItem | null>(null)
  const [formData, setFormData] = useState({
    idProgram: '',
    kegiatan: '',
    descriptionAction: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    closedDate: '',
    status: 'On Progress',
    picNama: '',
    picEmail: '',
    tindakLanjut: '',
    kendala: '',
    remarks: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [resAct, resSub] = await Promise.all([
        api.get('/api/esih/activities'),
        api.get('/api/esih/programs'),
      ])
      setActivities(resAct.data.data || [])
      setSubOptions(resSub.data.data || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      if (u?.name) {
        setFormData((prev) => ({ ...prev, picNama: u.name, picEmail: u.email || '' }))
      }
    })
    fetchData()
  }, [])

  const handleOpenAdd = () => {
    setEditItem(null)
    setFormData({
      idProgram: subOptions[0]?.id || '',
      kegiatan: '',
      descriptionAction: '',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      closedDate: '',
      status: 'On Progress',
      picNama: user?.name || '',
      picEmail: user?.email || '',
      tindakLanjut: '',
      kendala: '',
      remarks: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item: ActivityItem) => {
    setEditItem(item)
    setFormData({
      idProgram: item.idProgram,
      kegiatan: item.kegiatan,
      descriptionAction: item.descriptionAction || '',
      startDate: item.startDate,
      dueDate: item.dueDate,
      closedDate: item.closedDate || '',
      status: item.status,
      picNama: item.picNama,
      picEmail: item.picEmail,
      tindakLanjut: item.tindakLanjut || '',
      kendala: item.kendala || '',
      remarks: item.remarks || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editItem) {
        await api.put(`/api/esih/activities/${editItem.id}`, formData)
      } else {
        await api.post('/api/esih/activities', formData)
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      alert('Gagal menyimpan Aktivitas Mingguan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin mengubah status aktif aktivitas ini?')) {
      try {
        await api.patch(`/api/esih/activities/${id}/toggle`)
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
        <p className="mt-2 text-muted small">Memuat Weekly Activities...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Weekly Activities</h4>
          <p className="text-muted mb-0">Laporan aktivitas mingguan tim terkelola.</p>
        </div>
        <button className="btn btn-success fw-bold px-4" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Tambah Aktivitas Mingguan
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '1100px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3">Program Induk (Parent)</th>
                  <th className="py-3">Sub-Program (Child)</th>
                  <th className="py-3">Kegiatan Mingguan</th>
                  <th className="py-3">Tenggat Waktu</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">PIC (Staff)</th>
                  <th className="py-3 text-center">Status Aktif</th>
                  <th className="py-3 text-end px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">Belum ada data aktivitas mingguan.</td>
                  </tr>
                ) : (
                  activities.map((act, index) => (
                    <tr key={act.id} className={!act.isActive ? 'table-secondary opacity-75' : ''}>
                      <td className="px-4 text-muted fw-bold">{index + 1}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                          {act.program?.programKerja?.kode || 'A'} {act.program?.programKerja?.namaProgram || act.kategoriProgram}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{act.program?.kode || ''} {act.itemName}</div>
                      </td>
                      <td>
                        <div className="fw-medium text-dark">{act.kegiatan}</div>
                        {act.descriptionAction && (
                          <div className="small text-muted text-truncate" style={{ maxWidth: '240px' }}>
                            {act.descriptionAction}
                          </div>
                        )}
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
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                            {act.picNama?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="small fw-bold text-dark">{act.picNama}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill ${act.isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary'}`}>
                          {act.isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light me-1" onClick={() => handleOpenEdit(act)} title="Edit Aktivitas">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className={`btn btn-sm ${act.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`} 
                          onClick={() => handleToggleActive(act.id)}
                          title={act.isActive ? 'Nonaktifkan Aktivitas' : 'Aktifkan Aktivitas'}
                        >
                          <i className={`bi bi-${act.isActive ? 'eye-slash' : 'check-circle'}`}></i>
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

      {/* Modal Add/Edit Activity */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {editItem ? `Edit Aktivitas Mingguan: #${editItem.no}` : 'Tambah Aktivitas Mingguan Baru'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Pilih Sub-Program Kerja (Child)</label>
                    <select 
                      className="form-select" 
                      value={formData.idProgram}
                      onChange={(e) => setFormData({ ...formData, idProgram: e.target.value })}
                      required
                    >
                      {subOptions.map((s) => (
                        <option value={s.id} key={s.id}>
                          [{s.programKerja?.kode || 'A'}] {s.kode} - {s.namaItem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Kegiatan Mingguan</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: Final testing & Go Live SmartWB dengan RFID" 
                      value={formData.kegiatan}
                      onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Action to be taken (Deskripsi Tindakan)</label>
                    <textarea 
                      className="form-control" 
                      rows={2}
                      placeholder="Langkah spesifik yang diambil dalam kegiatan..."
                      value={formData.descriptionAction}
                      onChange={(e) => setFormData({ ...formData, descriptionAction: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-bold text-dark">Tanggal Mulai (Start)</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-bold text-dark">Tenggat Waktu (Due Date)</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
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
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold text-dark">Nama Penanggung Jawab (PIC)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Contoh: Tommy / Salman" 
                        value={formData.picNama}
                        onChange={(e) => setFormData({ ...formData, picNama: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold text-dark">Tindak Lanjut</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Tindak lanjut yang harus dilakukan..." 
                        value={formData.tindakLanjut}
                        onChange={(e) => setFormData({ ...formData, tindakLanjut: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Remarks / Catatan Tambahan</label>
                    <textarea 
                      className="form-control" 
                      rows={2}
                      placeholder="Catatan progres, kendala atau informasi tambahan..."
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-success fw-bold px-4" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan Aktivitas'}
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
