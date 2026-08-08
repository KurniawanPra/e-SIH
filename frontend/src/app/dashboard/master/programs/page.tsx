'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function MasterProgramPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/esih/programs')
      .then(res => {
        setPrograms(res.data.data || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Master Program Kerja</h4>
          <p className="text-muted mb-0">Kelola daftar program kerja strategis.</p>
        </div>
        <button className="btn btn-primary fw-bold px-4">
          <i className="bi bi-plus-lg me-2"></i>Tambah Program
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">ID Program</th>
                  <th className="py-3">Kategori</th>
                  <th className="py-3">Nama Program</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Progress</th>
                  <th className="py-3 text-end px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">Belum ada data program kerja.</td>
                  </tr>
                ) : (
                  programs.map(prog => (
                    <tr key={prog.id}>
                      <td className="px-4 fw-medium">{prog.id}</td>
                      <td>{prog.kategori}</td>
                      <td className="fw-bold">{prog.namaItem}</td>
                      <td>
                        <span className={`badge rounded-pill ${prog.status === 'Closed' ? 'bg-success' : prog.status === 'On Progress' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {prog.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress w-100" style={{ height: '8px' }}>
                            <div className="progress-bar bg-primary" style={{ width: `${prog.progress}%` }}></div>
                          </div>
                          <span className="small text-muted">{prog.progress}%</span>
                        </div>
                      </td>
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light me-2"><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
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
