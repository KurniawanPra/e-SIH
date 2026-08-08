'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/esih/dashboard')
    .then(res => {
      setData(res.data.kpi)
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
          <h4 className="fw-bold mb-1 text-dark">Executive Dashboard</h4>
          <p className="text-muted mb-0">Ringkasan performa program dan aktivitas.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>Total Program</h6>
              <h3 className="fw-bold mb-0 text-dark">{data?.totalPrograms || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>Program On Progress</h6>
              <h3 className="fw-bold mb-0 text-warning">{data?.onProgressPrograms || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>Total Aktivitas Mingguan</h6>
              <h3 className="fw-bold mb-0 text-dark">{data?.totalActivities || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>Aktivitas Selesai (Closed)</h6>
              <h3 className="fw-bold mb-0 text-success">{data?.closedActivities || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for Charts */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h6 className="fw-bold text-dark mb-0">Tren Penyelesaian Aktivitas</h6>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
              <div className="text-center text-muted">
                <i className="bi bi-bar-chart fs-1"></i>
                <p className="mt-2">Grafik akan segera hadir di modul pelaporan</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h6 className="fw-bold text-dark mb-0">Status Aktivitas</h6>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between mb-3 align-items-center">
                <span>Open</span>
                <span className="badge bg-danger rounded-pill px-3 py-2">{data?.openActivities || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 align-items-center">
                <span>On Progress</span>
                <span className="badge bg-warning text-dark rounded-pill px-3 py-2">{data?.onProgressActivities || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 align-items-center">
                <span>Closed</span>
                <span className="badge bg-success rounded-pill px-3 py-2">{data?.closedActivities || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
