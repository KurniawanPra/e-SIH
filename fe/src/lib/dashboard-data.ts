type ApiGet = (url: string) => Promise<{ data: any }>

// A directory/Highlight outage must not discard otherwise successful monitoring data.
export async function loadDashboardData(get: ApiGet, year: number) {
  const sources = [
    { key: 'kpi', label: 'Ringkasan monitoring', url: `/api/esih/dashboard?year=${year}` },
    { key: 'parents', label: 'Program kerja', url: `/api/esih/program-kerja?year=${year}` },
    { key: 'activities', label: 'Aktivitas', url: `/api/esih/activities?year=${year}` },
    { key: 'highlights', label: 'Highlight', url: `/api/esih/highlights?year=${year}` },
    { key: 'users', label: 'Direktori pengguna', url: '/api/esih/users' },
  ] as const
  const results = await Promise.allSettled(sources.map(source => get(source.url)))
  const data: { kpi: any; parents: any[]; activities: any[]; highlights: any[]; users: any[]; errors: string[] } = {
    kpi: null, parents: [], activities: [], highlights: [], users: [], errors: [],
  }
  results.forEach((result, index) => {
    const source = sources[index]
    if (result.status === 'rejected') data.errors.push(source.label)
    else if (source.key === 'kpi') data.kpi = result.value.data.kpi
    else data[source.key] = Array.isArray(result.value.data.data) ? result.value.data.data : []
  })
  return data
}
