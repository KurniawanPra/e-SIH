'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface ParentPK {
  id: string
  kode: string
  namaProgram: string
  totalProgress: number
  isActive: boolean
  items: {
    id: string
    kode: string
    namaItem: string
    status: string
    progress: number
    isActive: boolean
  }[]
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<any>(null)
  const [parents, setParents] = useState<ParentPK[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    return [current - 2, current - 1, current, current + 1]
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/api/esih/dashboard'),
      api.get('/api/esih/program-kerja'),
      api.get('/api/esih/activities'),
    ])
      .then(([resKpi, resPK, resAct]) => {
        setKpi(resKpi.data.kpi)
        setParents(resPK.data.data || [])
        setActivities(resAct.data.data || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  // Filter activities by selected year
  const filteredActivities = useMemo(() => {
    return activities.filter((a: any) => {
      const year = new Date(a.startDate).getFullYear()
      return year === selectedYear && a.isActive
    })
  }, [activities, selectedYear])

  // Status counts for filtered activities
  const statusCounts = useMemo(() => {
    const open = filteredActivities.filter((a: any) => a.status === 'Open').length
    const onProgress = filteredActivities.filter((a: any) => a.status === 'On Progress').length
    const closed = filteredActivities.filter((a: any) => a.status === 'Closed').length
    return { open, onProgress, closed, total: open + onProgress + closed }
  }, [filteredActivities])

  // Monthly activity data for bar chart
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    const closedPerMonth = new Array(12).fill(0)
    const openPerMonth = new Array(12).fill(0)

    filteredActivities.forEach((a: any) => {
      const month = new Date(a.startDate).getMonth()
      if (a.status === 'Closed') {
        closedPerMonth[month]++
      } else {
        openPerMonth[month]++
      }
    })

    return {
      labels: months,
      datasets: [
        {
          label: 'Closed',
          data: closedPerMonth,
          backgroundColor: 'rgba(25, 135, 84, 0.8)',
          borderRadius: 4,
        },
        {
          label: 'Open / On Progress',
          data: openPerMonth,
          backgroundColor: 'rgba(255, 193, 7, 0.7)',
          borderRadius: 4,
        },
      ],
    }
  }, [filteredActivities])

  // PIC workload data for horizontal bar chart
  const picData = useMemo(() => {
    const picMap: Record<string, number> = {}
    filteredActivities.forEach((a: any) => {
      const name = a.picNama?.split('/')[0]?.trim() || 'Unknown'
      picMap[name] = (picMap[name] || 0) + 1
    })
    const sorted = Object.entries(picMap).sort((a, b) => b[1] - a[1])

    return {
      labels: sorted.map(([name]) => name),
      datasets: [
        {
          label: 'Jumlah Aktivitas',
          data: sorted.map(([, count]) => count),
          backgroundColor: [
            'rgba(25, 135, 84, 0.8)',
            'rgba(13, 110, 253, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.7)',
            'rgba(108, 117, 125, 0.7)',
            'rgba(13, 202, 240, 0.7)',
            'rgba(111, 66, 193, 0.7)',
            'rgba(253, 126, 20, 0.7)',
          ],
          borderRadius: 4,
        },
      ],
    }
  }, [filteredActivities])

  // Status doughnut chart
  const statusDoughnut = useMemo(() => ({
    labels: ['Open', 'On Progress', 'Closed'],
    datasets: [{
      data: [statusCounts.open, statusCounts.onProgress, statusCounts.closed],
      backgroundColor: ['#dc3545', '#ffc107', '#198754'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  }), [statusCounts])

  // Progress per PK (parent) bar chart
  const pkProgressData = useMemo(() => {
    const activeParents = parents.filter(p => p.isActive)
    return {
      labels: activeParents.map(p => `${p.kode}. ${p.namaProgram.substring(0, 25)}...`),
      datasets: [{
        label: 'Total Progress (%)',
        data: activeParents.map(p => p.totalProgress),
        backgroundColor: activeParents.map(p =>
          p.totalProgress >= 80 ? 'rgba(25, 135, 84, 0.8)' :
          p.totalProgress >= 50 ? 'rgba(255, 193, 7, 0.8)' :
          'rgba(220, 53, 69, 0.7)'
        ),
        borderRadius: 6,
      }],
    }
  }, [parents])

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted small">Memuat Executive Dashboard...</p>
      </div>
    )
  }

  const closureRate = statusCounts.total > 0 ? Math.round((statusCounts.closed / statusCounts.total) * 100) : 0

  return (
    <div>
      {/* Header + Year Selector */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Executive Dashboard</h4>
          <p className="text-muted mb-0">Ringkasan performa program dan aktivitas tahun <strong>{selectedYear}</strong>.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-calendar3 text-muted"></i>
          <select
            className="form-select form-select-sm fw-bold border-success text-success"
            style={{ width: 'auto' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>Tahun {y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success-subtle rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                  <i className="bi bi-folder2-open text-success fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase">Program Kerja</div>
                  <h3 className="fw-bold mb-0 text-dark">{kpi?.totalParents || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                  <i className="bi bi-diagram-2 text-primary fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase">Sub-Program</div>
                  <h3 className="fw-bold mb-0 text-dark">{kpi?.totalPrograms || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                  <i className="bi bi-activity text-warning fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase">Aktivitas ({selectedYear})</div>
                  <h3 className="fw-bold mb-0 text-dark">{statusCounts.total}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100 bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-25 rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                  <i className="bi bi-check-circle text-white fs-4"></i>
                </div>
                <div>
                  <div className="text-white-50 small fw-bold text-uppercase">Closure Rate</div>
                  <h3 className="fw-bold mb-0">{closureRate}%</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Kerja Cards with Sub-Items */}
      <h5 className="fw-bold text-dark mb-3"><i className="bi bi-clipboard-data me-2 text-success"></i>Program Kerja Tahun {selectedYear}</h5>
      <div className="d-flex flex-column gap-3 mb-4">
        {parents.filter(p => p.isActive).map(parent => (
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden" key={parent.id}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success text-white fw-bold px-3 py-2 fs-6">{parent.kode}</span>
                  <h6 className="fw-bold text-dark mb-0">{parent.namaProgram}</h6>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="progress" style={{ width: 120, height: 10 }}>
                    <div className={`progress-bar ${parent.totalProgress >= 80 ? 'bg-success' : parent.totalProgress >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${parent.totalProgress}%` }}></div>
                  </div>
                  <span className="fw-bold text-dark small">{parent.totalProgress}%</span>
                </div>
              </div>
              {/* Sub items as compact pills */}
              <div className="d-flex flex-wrap gap-2 mt-2">
                {parent.items.filter(i => i.isActive).map(item => (
                  <span
                    key={item.id}
                    className={`badge border px-3 py-2 rounded-pill d-flex align-items-center gap-1 ${
                      item.status === 'Closed'
                        ? 'bg-success-subtle text-success border-success-subtle'
                        : item.status === 'On Progress'
                        ? 'bg-warning-subtle text-dark border-warning-subtle'
                        : 'bg-danger-subtle text-danger border-danger-subtle'
                    }`}
                  >
                    <strong>{item.kode}</strong> {item.namaItem}
                    <span className="ms-1 text-muted">({item.progress}%)</span>
                    <i className={`bi bi-${item.status === 'Closed' ? 'check-circle-fill text-success' : item.status === 'On Progress' ? 'clock-history text-warning' : 'exclamation-circle text-danger'} ms-1`}></i>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <h5 className="fw-bold text-dark mb-3"><i className="bi bi-bar-chart-line me-2 text-success"></i>Analisis Grafik Tahun {selectedYear}</h5>
      <div className="row g-4 mb-4">
        {/* Bar chart: Aktivitas per Bulan */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold text-dark mb-0"><i className="bi bi-bar-chart me-2 text-primary"></i>Aktivitas per Bulan ({selectedYear})</h6>
              <span className="small text-muted">Distribusi aktivitas closed vs open/on-progress setiap bulan</span>
            </div>
            <div className="card-body px-4 pb-4">
              <Bar
                data={monthlyData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
                  },
                }}
                height={80}
              />
            </div>
          </div>
        </div>

        {/* Doughnut chart: Status Distribution */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold text-dark mb-0"><i className="bi bi-pie-chart me-2 text-warning"></i>Distribusi Status ({selectedYear})</h6>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center px-4 pb-4">
              <div style={{ maxWidth: 220 }}>
                <Doughnut
                  data={statusDoughnut}
                  options={{
                    responsive: true,
                    cutout: '65%',
                    plugins: {
                      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } },
                    },
                  }}
                />
              </div>
              <div className="mt-3 text-center">
                <span className="fw-bold fs-4 text-success">{closureRate}%</span>
                <div className="small text-muted">Closure Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Horizontal bar chart: Beban Kerja PIC */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold text-dark mb-0"><i className="bi bi-people me-2 text-info"></i>Beban Kerja per PIC ({selectedYear})</h6>
              <span className="small text-muted">Jumlah aktivitas yang ditangani setiap PIC</span>
            </div>
            <div className="card-body px-4 pb-4">
              <Bar
                data={picData}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
                    y: { grid: { display: false } },
                  },
                }}
                height={100}
              />
            </div>
          </div>
        </div>

        {/* Bar chart: Progress per Program Kerja */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold text-dark mb-0"><i className="bi bi-clipboard-check me-2 text-success"></i>Progress per Program Kerja</h6>
              <span className="small text-muted">Rata-rata pencapaian (%) setiap Program Kerja Induk</span>
            </div>
            <div className="card-body px-4 pb-4">
              <Bar
                data={pkProgressData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` }, grid: { color: '#f1f5f9' } },
                  },
                }}
                height={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
