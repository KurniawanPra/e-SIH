'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface ChildItem {
  id: string
  kode: string
  namaItem: string
  status: string
  progress: number
  keterangan?: string
}

interface ParentProgram {
  id: string
  kode: string
  namaProgram: string
  deskripsi?: string
  items: ChildItem[]
}

export default function MasterProgramPage() {
  const [parentPrograms, setParentPrograms] = useState<ParentProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/esih/program-kerja')
      .then(res => {
        setParentPrograms(res.data.data || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted small">Memuat Master Program Kerja...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Master Program Kerja</h4>
          <p className="text-muted mb-0">Struktur hierarki Program Kerja Induk (Parent) dan Sub-Program (Child).</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success fw-bold px-3">
            <i className="bi bi-folder-plus me-2"></i>Tambah Program Induk
          </button>
          <button className="btn btn-success fw-bold px-3">
            <i className="bi bi-plus-lg me-2"></i>Tambah Sub-Program
          </button>
        </div>
      </div>

      {parentPrograms.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3 fw-bold">Belum ada data Program Kerja</h5>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {parentPrograms.map((parent) => (
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden" key={parent.id}>
              {/* Parent Program Header */}
              <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success text-white rounded-3 px-3 py-2 fw-bold fs-6">
                    {parent.kode}
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">{parent.namaProgram}</h5>
                    {parent.deskripsi && (
                      <span className="text-muted small">{parent.deskripsi}</span>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                    <i className="bi bi-diagram-2 me-1 text-success"></i> {parent.items.length} Sub-Program
                  </span>
                  <button className="btn btn-sm btn-light text-muted">
                    <i className="bi bi-pencil"></i>
                  </button>
                </div>
              </div>

              {/* Child Program Items Table */}
              <div className="card-body p-0">
                {parent.items.length === 0 ? (
                  <div className="p-3 text-center text-muted small">
                    Belum ada sub-program di bawah grup ini.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="py-2 px-4" style={{ width: '80px' }}>Kode</th>
                          <th className="py-2">Nama Sub-Program (Child)</th>
                          <th className="py-2">Keterangan</th>
                          <th className="py-2">Status</th>
                          <th className="py-2" style={{ width: '180px' }}>Progress</th>
                          <th className="py-2 text-end px-4" style={{ width: '100px' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parent.items.map((child) => (
                          <tr key={child.id}>
                            <td className="px-4 fw-bold text-success">{child.kode}</td>
                            <td className="fw-bold text-dark">{child.namaItem}</td>
                            <td className="small text-muted">{child.keterangan || '-'}</td>
                            <td>
                              <span className={`badge rounded-pill ${child.status === 'Closed' ? 'bg-success' : child.status === 'On Progress' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                {child.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress w-100" style={{ height: '8px' }}>
                                  <div 
                                    className={`progress-bar ${child.progress === 100 ? 'bg-success' : 'bg-primary'}`} 
                                    style={{ width: `${child.progress}%` }}
                                  ></div>
                                </div>
                                <span className="small text-muted fw-bold">{child.progress}%</span>
                              </div>
                            </td>
                            <td className="text-end px-4">
                              <button className="btn btn-sm btn-light me-1"><i className="bi bi-pencil"></i></button>
                              <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
