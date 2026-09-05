import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import prisma from '../plugins/prisma'
import { getPortalData } from '../services/portal-data.service'
import { z } from 'zod'
import { parseHighlight } from '../services/highlight.service'
import { assertOwnsRecord, httpError } from '../services/authorization.service'
import { activityInput, reportQuery, validateActivityDates, changedActivityFields } from '../services/activity.service'

const esihRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.addHook('preHandler', async (request) => {
    const user = request.authUser!
    const route = request.routeOptions.url || ''
    const mutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    if (mutation && /\/(program-kerja|programs|users|master\/bagian|notifications)(\/|$)/.test(route) && user.role !== 'ADMIN') {
      throw httpError(403, 'Hanya admin yang dapat mengubah master data dan hak akses')
    }
  })

  // ==========================================
  // 1. PARENT PROGRAM KERJA ROUTES
  // ==========================================

  // GET all Parent Program Kerja with average progress & items
  fastify.get('/program-kerja', async (request: any, reply) => {
    const { year, includeInactive } = reportQuery.parse(request.query || {})
    const showInactive = includeInactive === 'true' && request.authUser?.role === 'ADMIN'
    const yearNum = year ? Number(year) : null

    const parentPrograms = await prisma.ref_ProgramKerja.findMany({
      where: { ...(!showInactive ? { isActive: true } : {}), ...(yearNum ? { tahun: yearNum } : {}) },
      orderBy: { kode: 'asc' },
      include: {
        items: {
          where: yearNum ? { tahun: yearNum } : {},
          orderBy: { kode: 'asc' },
          include: {
            activities: {
              where: {
                isActive: true,
                ...(yearNum ? { startDate: { gte: `${yearNum}-01-01`, lte: `${yearNum}-12-31` } } : {}),
              }
            }
          }
        }
      }
    })

    // Calculate total progress percentage from sub-items for each parent
    // Progress selalu dihitung dari activities aktif saja; tanpa activities = 0%.
    // Kolom progress manual tidak lagi dipakai sebagai fallback agar konsisten
    // dengan data activities (closure rate).
    const result = parentPrograms.map((parent: any) => {
      const activeItems = parent.items.filter((i: any) => i.isActive)
      const itemsWithProgress = activeItems.map((item: any) => {
        const activeActivities = item.activities || []
        const closedCount = activeActivities.filter((a: any) => a.status === 'Closed').length
        const itemProgress = activeActivities.length > 0
          ? Math.round((closedCount / activeActivities.length) * 100)
          : 0
        return {
          ...item,
          progress: itemProgress
        }
      })

      const totalProgress = itemsWithProgress.length > 0
        ? Math.round(itemsWithProgress.reduce((acc: number, curr: any) => acc + curr.progress, 0) / itemsWithProgress.length)
        : 0

      return {
        ...parent,
        items: showInactive ? parent.items.map((item: any) => itemsWithProgress.find((active: any) => active.id === item.id) || { ...item, progress: 0 }) : itemsWithProgress,
        totalProgress,
      }
    })

    return { data: result }
  })

  // POST create Parent Program Kerja
  fastify.post('/program-kerja', async (request: any, reply) => {
    const { kode, namaProgram, deskripsi, tahun } = request.body || {}
    if (!kode || !namaProgram) {
      return reply.code(400).send({ success: false, error: 'Kode dan Nama Program Induk wajib diisi' })
    }

    const programYear = reportQuery.parse({ year: tahun ?? new Date().getFullYear() }).year!
    const newId = `PK-${kode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${programYear}`
    const created = await prisma.ref_ProgramKerja.create({
      data: {
        id: newId,
        kode,
        namaProgram,
        deskripsi,
        tahun: programYear,
      }
    })
    return reply.code(201).send({ success: true, data: created })
  })

  // PUT edit Parent Program Kerja
  fastify.put('/program-kerja/:id', async (request: any, reply) => {
    const { id } = request.params
    const { kode, namaProgram, deskripsi, tahun } = request.body || {}

    const updated = await prisma.ref_ProgramKerja.update({
      where: { id },
      data: {
        kode,
        namaProgram,
        deskripsi,
        ...(tahun ? { tahun: Number(tahun) } : {}),
      }
    })
    return { success: true, data: updated }
  })

  // PATCH toggle active/inactive (Soft Delete) Parent Program Kerja
  fastify.patch('/program-kerja/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    const current = await prisma.ref_ProgramKerja.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Data tidak ditemukan' })

    const updated = await prisma.ref_ProgramKerja.update({
      where: { id },
      data: { isActive: !current.isActive }
    })
    return { success: true, data: updated }
  })

  // ==========================================
  // 2. SUB-PROGRAM (CHILD ITEMS) ROUTES
  // ==========================================

  // GET all Sub-Programs (MasterProgram)
  fastify.get('/programs', async (request: any, reply) => {
    const { year } = reportQuery.parse(request.query || {})
    const where: any = {}
    if (year) {
      where.tahun = Number(year)
    }

    const programs = await prisma.ref_Item_ProgramKerja.findMany({
      where,
      orderBy: { kode: 'asc' },
      include: {
        programKerja: true
      }
    })
    return { data: programs }
  })

  // POST create Sub-Program
  fastify.post('/programs', async (request: any, reply) => {
    const { programKerjaId, kode, namaItem, status, progress, keterangan, tahun } = request.body || {}
    if (!programKerjaId || !kode || !namaItem) {
      return reply.code(400).send({ success: false, error: 'Program Induk, Kode, dan Nama Sub-Program wajib diisi' })
    }

    const calcProgress = progress !== undefined && progress !== null && Number(progress) > 0
      ? Number(progress)
      : status === 'Closed' ? 100 : 0

    const programYear = reportQuery.parse({ year: tahun ?? new Date().getFullYear() }).year!
    const newId = `PROG-${kode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${programYear}`
    const created = await prisma.ref_Item_ProgramKerja.create({
      data: {
        id: newId,
        programKerjaId,
        kode,
        namaItem,
        status: status || 'On Progress',
        progress: calcProgress,
        tahun: programYear,
        keterangan,
      }
    })
    return reply.code(201).send({ success: true, data: created })
  })

  // PUT edit Sub-Program (termasuk IT Development, dll)
  fastify.put('/programs/:id', async (request: any, reply) => {
    const { id } = request.params
    const { programKerjaId, kode, namaItem, status, progress, keterangan } = request.body || {}

    const calcProgress = progress !== undefined && progress !== null && Number(progress) > 0
      ? Number(progress)
      : status === 'Closed' ? 100 : 0

    const updated = await prisma.ref_Item_ProgramKerja.update({
      where: { id },
      data: {
        programKerjaId,
        kode,
        namaItem,
        status,
        progress: calcProgress,
        keterangan,
      }
    })
    return { success: true, data: updated }
  })

  // PATCH toggle active/inactive Sub-Program
  fastify.patch('/programs/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    const current = await prisma.ref_Item_ProgramKerja.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Data tidak ditemukan' })

    const updated = await prisma.ref_Item_ProgramKerja.update({
      where: { id },
      data: { isActive: !current.isActive }
    })
    return { success: true, data: updated }
  })

  // ==========================================
  // 3. WEEKLY & MONTHLY ACTIVITIES ROUTES
  // ==========================================

  fastify.get('/activities', async (request) => {
    const { status, category, year, month } = reportQuery.parse(request.query || {})
    const where: any = { isActive: true }
    if (status && status !== 'ALL') where.status = status
    if (category && category !== 'ALL') where.kategoriProgram = { startsWith: category }
    if (year || (month && month !== 'ALL')) {
      const y = year || new Date().getFullYear()
      if (month && month !== 'ALL') {
        const prefix = `${y}-${String(month).padStart(2, '0')}`
        where.startDate = { gte: `${prefix}-01`, lte: `${prefix}-${new Date(y, month, 0).getDate()}` }
      } else where.startDate = { gte: `${y}-01-01`, lte: `${y}-12-31` }
    }
    const activities = await prisma.activity.findMany({
      where, orderBy: [{ startDate: 'desc' }, { no: 'asc' }],
      include: { program: { include: { programKerja: true } } },
    })
    return { data: activities }
  })

  fastify.post('/activities', async (request, reply) => {
    const user = request.authUser!
    const parsed = activityInput.parse(request.body)
    const input = user.role === 'ADMIN' ? parsed : { ...parsed, picNama: user.name, picEmail: user.email }
    const program = input.idProgram ? await prisma.ref_Item_ProgramKerja.findUnique({ where: { id: input.idProgram }, include: { programKerja: true } }) : null
    if (input.idProgram && (!program || !program.isActive || !program.programKerja.isActive)) throw httpError(422, 'Subprogram tidak ditemukan atau tidak aktif')
    const data = {
      ...input, idProgram: input.idProgram || null,
      kategoriProgram: program ? `${program.programKerja.kode} ${program.programKerja.namaProgram}` : 'Kegiatan Personal',
      itemName: program?.namaItem || 'Weekly Activity',
      picEmail: input.picEmail || '',
      closedDate: input.status === 'Closed' ? input.closedDate || null : null,
    }
    validateActivityDates(data)
    for (let attempt = 0; attempt < 5; attempt++) {
      const last = await prisma.activity.findFirst({ orderBy: { no: 'desc' }, select: { no: true } })
      const no = (last?.no || 0) + 1
      try {
        const created = await prisma.activity.create({ data: { ...data, no, id: `ACT-${String(no).padStart(4, '0')}` } })
        return reply.code(201).send({ success: true, data: created })
      } catch (error: any) {
        if (error.code !== 'P2002') throw error
      }
    }
    throw httpError(409, 'Nomor aktivitas sedang digunakan. Silakan coba kembali.')
  })

  // Preserve activity history instead of removing the record and its audit trail.
  fastify.delete('/activities/:id', async (request: any) => {
    const user = request.authUser!
    if (user.role !== 'ADMIN') throw httpError(403, 'Hanya admin yang dapat menonaktifkan aktivitas')
    const id = request.params.id
    await prisma.$transaction(async tx => {
      const current = await tx.activity.findUnique({ where: { id } })
      if (!current) throw httpError(404, 'Aktivitas tidak ditemukan')
      await tx.activity.update({ where: { id }, data: { isActive: false } })
      if (current.isActive) await tx.activityAuditLog.create({ data: { activityId: id, field: 'isActive', oldValue: 'true', newValue: 'false', changedBy: user.sub } })
    })
    return { success: true, data: { id } }
  })

  fastify.put('/activities/:id', async (request: any) => {
    const id = request.params.id
    const input = activityInput.partial().parse(request.body)
    const user = request.authUser!
    const updated = await prisma.$transaction(async tx => {
      const current = await tx.activity.findUnique({ where: { id } })
      if (!current || !current.isActive) throw httpError(404, 'Aktivitas tidak ditemukan')
      assertOwnsRecord(user, current)
      const data: any = { ...input }
      if (user.role !== 'ADMIN') {
        delete data.picNama
        delete data.picEmail
      }
      if (input.idProgram !== undefined) {
        const program = input.idProgram ? await tx.ref_Item_ProgramKerja.findUnique({ where: { id: input.idProgram }, include: { programKerja: true } }) : null
        if (input.idProgram && (!program || !program.isActive || !program.programKerja.isActive)) throw httpError(422, 'Subprogram tidak ditemukan atau tidak aktif')
        data.idProgram = input.idProgram || null
        data.kategoriProgram = program ? `${program.programKerja.kode} ${program.programKerja.namaProgram}` : 'Kegiatan Personal'
        data.itemName = program?.namaItem || 'Weekly Activity'
      }
      const next = { ...current, ...data }
      data.closedDate = next.status === 'Closed' ? next.closedDate || null : null
      validateActivityDates({ ...next, closedDate: data.closedDate })
      const logs = changedActivityFields(current, data, id, user.sub)
      const result = await tx.activity.update({ where: { id }, data })
      if (logs.length) await tx.activityAuditLog.createMany({ data: logs })
      return result
    })
    return { success: true, data: updated }
  })

  // GET audit trail untuk sebuah activity
  fastify.get('/activities/:id/audit', async (request: any, reply) => {
    const { id } = request.params
    const logs = await prisma.activityAuditLog.findMany({
      where: { activityId: id },
      orderBy: { changedAt: 'desc' },
    })
    return { success: true, data: logs }
  })

  // PATCH toggle active/inactive Activity
  fastify.patch('/activities/:id/toggle', async (request: any, reply) => {
    if (request.authUser?.role !== 'ADMIN') throw httpError(403, 'Hanya admin yang dapat menonaktifkan aktivitas')
    const { id } = request.params
    const updated = await prisma.$transaction(async tx => {
      const current = await tx.activity.findUnique({ where: { id } })
      if (!current) throw httpError(404, 'Aktivitas tidak ditemukan')
      const data = { isActive: !current.isActive }
      const result = await tx.activity.update({ where: { id }, data })
      await tx.activityAuditLog.createMany({ data: changedActivityFields(current, data, id, request.authUser!.sub) })
      return result
    })
    return { success: true, data: updated }
  })

  // ==========================================
  // 4. DASHBOARD KPI
  // ==========================================

  fastify.get('/dashboard', async (request, reply) => {
    const { year } = reportQuery.parse(request.query || {})

    const programWhere: any = { isActive: true }
    const itemWhere: any = { isActive: true }
    const activityWhere: any = { isActive: true }

    if (year) {
      const y = Number(year)
      programWhere.tahun = y
      itemWhere.tahun = y
      activityWhere.startDate = { gte: `${y}-01-01`, lte: `${y}-12-31` }
    }

    const [totalParents, programsByStatus, activitiesByStatus] = await Promise.all([
      prisma.ref_ProgramKerja.count({ where: programWhere }),
      prisma.ref_Item_ProgramKerja.groupBy({ by: ['status'], where: itemWhere, _count: { _all: true } }),
      prisma.activity.groupBy({ by: ['status'], where: activityWhere, _count: { _all: true } }),
    ])
    const countStatus = (groups: Array<{ status: string; _count: { _all: number } }>, status: string) => groups.find(group => group.status === status)?._count._all || 0
    const totalChildPrograms = programsByStatus.reduce((total, group) => total + group._count._all, 0)
    const totalActivities = activitiesByStatus.reduce((total, group) => total + group._count._all, 0)
    const onProgressPrograms = countStatus(programsByStatus, 'On Progress')
    const closedPrograms = countStatus(programsByStatus, 'Closed')
    const openActivities = countStatus(activitiesByStatus, 'Open')
    const onProgressActivities = countStatus(activitiesByStatus, 'On Progress')
    const closedActivities = countStatus(activitiesByStatus, 'Closed')
    const cancelledActivities = countStatus(activitiesByStatus, 'Cancelled')

    const closureRate = totalActivities > 0 ? Math.round((closedActivities / totalActivities) * 100) : 0

    return {
      kpi: {
        totalParents,
        totalPrograms: totalChildPrograms,
        onProgressPrograms,
        closedPrograms,
        totalActivities,
        openActivities,
        onProgressActivities,
        closedActivities,
        cancelledActivities,
        closureRate
      }
    }
  })

  // ==========================================
  // 5. MONTHLY HIGHLIGHT REPORT ROUTES
  // ==========================================

  // GET all highlights, filter by month & year
  fastify.get('/highlights', async (request: any, reply) => {
    const { month, year } = reportQuery.parse(request.query || {})
    const where: any = {}
    if (month && month !== 'ALL') where.bulan = Number(month)
    if (year) where.tahun = Number(year)

    const highlights = await prisma.highlight.findMany({
      where,
      orderBy: [{ no: 'asc' }, { createdAt: 'asc' }],
      include: {
        program: { include: { programKerja: true } },
      },
    })
    return { data: highlights }
  })

  // GET monthly highlight summary
  fastify.get('/highlights/summary', async (request: any, reply) => {
    const { year } = reportQuery.parse(request.query || {})
    const where: any = {}
    if (year) where.tahun = Number(year)

    const groups = await prisma.highlight.groupBy({
      by: ['bulan', 'tahun'],
      where,
      _count: { _all: true },
    })
    return { data: groups }
  })

  // POST create highlight
  fastify.post('/highlights', async (request: any, reply) => {
    const input = parseHighlight(request.body || {})
    const { programId, bulan, tahun } = input

    if (programId) {
      const progItem = await prisma.ref_Item_ProgramKerja.findUnique({ where: { id: programId } })
      if (!progItem) {
        return reply.code(400).send({ success: false, error: 'Sub-Program tidak ditemukan' })
      }
    }

    const sessionUser = request.authUser
    const authorId = sessionUser?.sub || null
    const count = await prisma.highlight.count({
      where: { bulan: Number(bulan), tahun: Number(tahun) },
    })

    const created = await prisma.highlight.create({
      data: {
        ...input,
        bulan: bulan!, tahun: tahun!, item: input.item!, bagian: input.bagian!,
        no: input.no ?? count + 1,
        authorId,
      },
      include: { program: { include: { programKerja: true } } },
    })
    return reply.code(201).send({ success: true, data: created })
  })

  // PUT edit highlight
  fastify.put('/highlights/:id', async (request: any, reply) => {
    const { id } = request.params

    const existing = await prisma.highlight.findUnique({ where: { id } })
    if (!existing) {
      return reply.code(404).send({ success: false, error: 'Highlight tidak ditemukan' })
    }
    assertOwnsRecord(request.authUser!, existing)
    const input = parseHighlight(request.body || {}, existing)
    const { programId } = input

    if (programId) {
      const progItem = await prisma.ref_Item_ProgramKerja.findUnique({ where: { id: programId } })
      if (!progItem) {
        return reply.code(400).send({ success: false, error: 'Sub-Program tidak ditemukan' })
      }
    }

    const updated = await prisma.highlight.update({
      where: { id },
      data: input,
      include: { program: { include: { programKerja: true } } },
    })
    return { success: true, data: updated }
  })

  // DELETE highlight
  fastify.delete('/highlights/:id', async (request: any, reply) => {
    const { id } = request.params
    const current = await prisma.highlight.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Data tidak ditemukan' })

    assertOwnsRecord(request.authUser!, current)
    await prisma.highlight.delete({ where: { id } })
    return { success: true, data: { id } }
  })

  // ==========================================
  // 6. MASTER BAGIAN / UNIT HIGHLIGHT
  // ==========================================

  fastify.get('/master/bagian', async (request: any, reply) => {
    const list = await prisma.ref_Bagian.findMany({ orderBy: { kode: 'asc' } })
    return { success: true, data: list }
  })

  fastify.post('/master/bagian', async (request: any, reply) => {
    const { kode, nama, deskripsi } = request.body || {}
    if (!nama) {
      return reply.code(400).send({ success: false, error: 'Nama Bagian wajib diisi' })
    }
    const created = await prisma.ref_Bagian.create({
      data: {
        id: `bag-${Date.now().toString(36)}`,
        kode: (kode || nama.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)).toUpperCase(),
        nama,
        deskripsi: deskripsi || '',
      },
    })
    return reply.code(201).send({ success: true, data: created })
  })

  fastify.put('/master/bagian/:id', async (request: any, reply) => {
    const { id } = request.params
    const { kode, nama, deskripsi } = request.body || {}
    const current = await prisma.ref_Bagian.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Master Bagian tidak ditemukan' })

    const updated = await prisma.ref_Bagian.update({
      where: { id },
      data: {
        kode: kode ? kode.toUpperCase() : current.kode,
        nama: nama || current.nama,
        deskripsi: deskripsi !== undefined ? deskripsi : current.deskripsi,
      },
    })
    return reply.send({ success: true, data: updated })
  })

  fastify.patch('/master/bagian/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    const current = await prisma.ref_Bagian.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Master Bagian tidak ditemukan' })

    const updated = await prisma.ref_Bagian.update({
      where: { id },
      data: { isActive: !current.isActive },
    })
    return reply.send({ success: true, data: updated })
  })

  fastify.delete('/master/bagian/:id', async (request: any, reply) => {
    const { id } = request.params
    const current = await prisma.ref_Bagian.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Master Bagian tidak ditemukan' })

    await prisma.ref_Bagian.delete({ where: { id } })
    return reply.send({ success: true, message: 'Master Bagian berhasil dihapus' })
  })

  // ==========================================
  // 7. USER SDM MANAGEMENT ROUTES (Portal SSO Integration)
  // ==========================================

  async function findUserOverride(userId: string) {
    return prisma.ref_UserOverride.findUnique({ where: { userId } })
  }

  // GET all users/employees directly & dynamically from Portal SSO API
  fastify.get('/users', async (request, reply) => {
    try {
      const portalData = await getPortalData('/api/sso/employees')
      let employeesRaw: any[] = []
      
      if (Array.isArray(portalData)) {
        employeesRaw = portalData
      } else if (portalData && typeof portalData === 'object') {
        const pd = portalData as any
        if (Array.isArray(pd.items)) employeesRaw = pd.items
        else if (Array.isArray(pd.employees)) employeesRaw = pd.employees
        else if (Array.isArray(pd.data)) employeesRaw = pd.data
        else if (Array.isArray(pd.results)) employeesRaw = pd.results
      }

      if (!employeesRaw || employeesRaw.length === 0) {
        return reply.code(502).send({ success: false, error: 'Data karyawan tidak ditemukan dari Portal SSO' })
      }

      // Filter employees for IT, Sistem, and HSSE units
      const filtered = employeesRaw.filter((emp: any) => {
        const n = (emp?.namaLengkap || emp?.nama || emp?.name || '').toLowerCase()
        const u = (emp?.unitNama || emp?.unit?.nama || emp?.unit || '').toLowerCase()
        const j = (emp?.jabatan?.nama || emp?.jabatan || emp?.posisi?.nama || emp?.posisi || '').toLowerCase()

        // Exclude higher management like Kabag unless needed
        if (n.includes('ferdiansyah') || j.includes('kabag') || j.includes('kepala bagian') || u === 'sdm & sistem') {
          return false
        }

        const isIT = u === 'it' || u === 'sistem & it' || j.includes('sistem dan it') || j.includes('asisten it') || j.includes('it dev') || j.includes('it spesialist') || j.includes('admin network') || j.includes('data center')
        const isHSSE = u === 'mr & hsse' || u.includes('hsse') || u.includes('hse') || u.includes('safety') || u.includes('k3') || j.includes('hsse') || j.includes('hse') || j.includes('k3') || j.includes('safety') || j.includes('mr & hsse')
        return isIT || isHSSE
      })

      const targetList = filtered.length > 0 ? filtered : employeesRaw

      const overrides = await prisma.ref_UserOverride.findMany()
      const overrideMap = new Map(overrides.map(o => [o.userId, o]))

      const formatted = targetList.map((emp: any) => {
        const nama = emp?.namaLengkap || emp?.nama || emp?.name || emp?.user?.namaLengkap || emp?.user?.nama || 'Karyawan INL'
        const rawJabatan = typeof emp?.jabatan === 'string' ? emp.jabatan : (emp?.jabatan?.nama || emp?.jabatan?.name || emp?.posisi?.nama || emp?.posisi || 'Staff Operasional')
        const defaultRole = (rawJabatan.toLowerCase().includes('kepala') || rawJabatan.toLowerCase().includes('kasubag') || rawJabatan.toLowerCase().includes('manager') || rawJabatan.toLowerCase().includes('pimpinan')) ? 'ADMIN' : 'USER'
        
        const rawUnit = emp?.unitNama || (typeof emp?.unit === 'string' ? emp.unit : emp?.unit?.nama) || ''
        const unit = /hsse|hse|safety|k3|mr/i.test(rawUnit)
          ? 'Seksi MR & HSSE'
          : (defaultRole === 'ADMIN' ? 'Sub Bagian Sistem & IT' : 'Seksi IT')

        const id = String(emp?.id || emp?.employeeId || emp?.user?.id || '')
        const email = emp?.email || null

        const override = overrideMap.get(id) || overrideMap.get(nama) || overrideMap.get(email)
        const role = override?.role || defaultRole
        const programIds: string[] = Array.isArray(override?.programIds)
          ? override.programIds.filter((p: any): p is string => typeof p === 'string')
          : []
        const isActive = override?.isActive !== undefined && override?.isActive !== null ? override.isActive : (emp?.isActive !== false)

        return {
          id,
          nama,
          email,
          jabatan: rawJabatan,
          unit,
          isActive,
          role,
          programs: programIds.map(pId => ({ programId: pId }))
        }
      })

      return reply.send({ success: true, data: formatted })
    } catch (err) {
      console.error('Error fetching dynamic users from Portal SSO:', err)
      return reply.code(502).send({ success: false, error: 'Gagal mengambil data user langsung dari Portal SSO' })
    }
  })

  fastify.post('/users', async (request: any, reply) => {
    return reply.code(400).send({ success: false, error: 'Data user dikelola terpusat melalui Portal SSO' })
  })

  fastify.put('/users/:id', async (request: any, reply) => {
    const { id } = request.params
    const { role, programIds } = z.object({
      role: z.enum(['ADMIN', 'USER']).optional(),
      programIds: z.array(z.string().min(1).max(200)).max(500).optional(),
    }).strict().parse(request.body)
    if (role === undefined && programIds === undefined) throw httpError(422, 'Tidak ada perubahan yang dikirim')
    const data: any = {}
    if (role !== undefined) data.role = role
    if (programIds !== undefined) {
      const parents = await prisma.ref_ProgramKerja.findMany({ where: { isActive: true }, include: { items: { where: { isActive: true } } } })
      const valid = new Set(parents.flatMap(p => [p.id, ...p.items.map(item => item.id)]))
      data.programIds = [...new Set(programIds.map(value => {
        if (valid.has(value)) return value
        const parent = parents.find(p => value === p.kode || value === `PK-${p.kode}`)
        if (!parent) throw httpError(422, 'Penugasan berisi program yang tidak ditemukan atau tidak aktif')
        return parent.id
      }))]
    }
    const updated = await prisma.ref_UserOverride.upsert({ where: { userId: id }, update: data, create: { userId: id, ...data } })

    return reply.send({ success: true, message: 'Hak akses user berhasil diperbarui', data: updated })
  })

  fastify.patch('/users/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    const existing = await findUserOverride(id)
    const nextIsActive = existing?.isActive !== undefined && existing?.isActive !== null ? !existing.isActive : false

    const updated = await prisma.ref_UserOverride.upsert({ where: { userId: id }, update: { isActive: nextIsActive }, create: { userId: id, isActive: nextIsActive } })

    return reply.send({ success: true, message: 'Status user berhasil diperbarui', data: updated })
  })

  // ==========================================
  // 7. NOTIFICATION ROUTES (untuk dashboard admin)
  // ==========================================

  // GET notifications (opsional filter unread)
  fastify.get('/notifications', async (request: any, reply) => {
    const { unread, limit } = request.query || {}
    const where: any = {}
    if (unread === '1' || unread === 'true') where.isRead = false

    const take = limit ? Number(limit) : undefined
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
    })
    return { data: notifications }
  })

  // GET jumlah notifikasi belum dibaca
  fastify.get('/notifications/unread-count', async (_request, _reply) => {
    const count = await prisma.notification.count({ where: { isRead: false } })
    return { data: { count } }
  })

  // PATCH tandai notifikasi sudah dibaca (bisa semua jika id = all)
  fastify.patch('/notifications/:id/read', async (request: any, reply) => {
    const { id } = request.params
    if (id === 'all') {
      const updated = await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      })
      return { success: true, data: { count: updated.count } }
    }

    const current = await prisma.notification.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Notifikasi tidak ditemukan' })

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
    return { success: true, data: updated }
  })
}

export default esihRoutes
