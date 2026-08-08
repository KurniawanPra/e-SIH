'use client'

export default function MonthlyActivitiesPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Monthly Activities</h4>
          <p className="text-muted mb-0">Laporan ringkasan aktivitas bulanan tim.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm text-center py-5">
        <div className="card-body">
          <i className="bi bi-calendar2-month text-muted" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3 fw-bold">Modul Bulanan</h5>
          <p className="text-muted">Data bulanan sedang dalam pengembangan.</p>
        </div>
      </div>
    </div>
  )
}
