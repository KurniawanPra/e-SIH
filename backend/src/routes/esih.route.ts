import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import prisma from '../plugins/prisma'
import { getPortalData } from '../services/portal-data.service'

const esihRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', fastify.authenticate)

  // ==========================================
  // 1. PARENT PROGRAM KERJA ROUTES
  // ==========================================

  // GET all Parent Program Kerja with average progress & items
  // GET all Parent Program Kerja with average progress & items
  fastify.get('/program-kerja', async (request: any, reply) => {
    const { year } = request.query || {}

    const parentPrograms = await prisma.ref_ProgramKerja.findMany({
      orderBy: { kode: 'asc' },
      include: {
        items: {
          where: year ? { tahun: Number(year) } : {},
          orderBy: { kode: 'asc' },
          include: {
            activities: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    // Calculate total progress percentage from sub-items for each parent
    const result = parentPrograms.map((parent: any) => {
      const activeItems = parent.items.filter((i: any) => i.isActive)
      const itemsWithProgress = activeItems.map((item: any) => {
        let itemProgress = item.progress
        const activeActivities = item.activities || []
        if (activeActivities.length > 0) {
          const closedCount = activeActivities.filter((a: any) => a.status === 'Closed').length
          itemProgress = Math.round((closedCount / activeActivities.length) * 100)
        } else {
          if (item.status === 'Closed') itemProgress = 100
          else if (item.status === 'On Progress') itemProgress = 50
          else itemProgress = 0
        }
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
        items: itemsWithProgress,
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

    const newId = `PK-${kode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${tahun || 2026}`
    const created = await prisma.ref_ProgramKerja.create({
      data: {
        id: newId,
        kode,
        namaProgram,
        deskripsi,
        tahun: tahun ? Number(tahun) : 2026,
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
    const { year } = request.query || {}
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
      : status === 'Closed' ? 100 : status === 'On Progress' ? 50 : 0

    const newId = `PROG-${kode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${tahun || 2026}`
    const created = await prisma.ref_Item_ProgramKerja.create({
      data: {
        id: newId,
        programKerjaId,
        kode,
        namaItem,
        status: status || 'On Progress',
        progress: calcProgress,
        tahun: tahun ? Number(tahun) : 2026,
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
      : status === 'Closed' ? 100 : status === 'On Progress' ? 50 : 0

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

  // GET all activities
  fastify.get('/activities', async (request: any, reply) => {
    const { status, category, year, month } = request.query || {}
    
    const where: any = {}
    if (status && status !== 'ALL') where.status = status

    if (year || month) {
      const filterYear = year ? parseInt(year) : new Date().getFullYear()
      if (month && month !== 'ALL') {
        const filterMonth = parseInt(month)
        const startDateGte = `${filterYear}-${String(filterMonth).padStart(2, '0')}-01`
        const lastDay = new Date(filterYear, filterMonth, 0).getDate()
        const endDateLte = `${filterYear}-${String(filterMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        where.startDate = {
          gte: startDateGte,
          lte: endDateLte
        }
      } else if (year) {
        where.startDate = {
          gte: `${filterYear}-01-01`,
          lte: `${filterYear}-12-31`
        }
      }
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [
        { startDate: 'desc' },
        { no: 'asc' }
      ],
      include: {
        program: {
          include: {
            programKerja: true
          }
        }
      }
    })
    
    return { data: activities }
  })

  // POST create Activity
  fastify.post('/activities', async (request: any, reply) => {
    const { idProgram, kegiatan, descriptionAction, startDate, dueDate, closedDate, status, picNama, picEmail, tindakLanjut, kendala, remarks } = request.body || {}
    if (!kegiatan || !picNama) {
      return reply.code(400).send({ success: false, error: 'Kegiatan dan Nama PIC wajib diisi' })
    }

    const count = await prisma.activity.aggregate({ _max: { no: true } })
    const newNo = (count._max.no ?? 0) + 1
    const newId = `ACT-${String(newNo).padStart(3, '0')}`

    const programItem = idProgram ? await prisma.ref_Item_ProgramKerja.findUnique({
      where: { id: idProgram },
      include: { programKerja: true }
    }) : null

    const created = await prisma.activity.create({
      data: {
        id: newId,
        no: newNo,
        idProgram: idProgram || null,
        kategoriProgram: programItem?.programKerja ? `${programItem.programKerja.kode} ${programItem.programKerja.namaProgram}` : 'Kegiatan Personal',
        itemName: programItem?.namaItem || 'Weekly Activity',
        kegiatan,
        descriptionAction,
        startDate: startDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        status: status || 'On Progress',
        picNama,
        picEmail: picEmail || `${picNama.toLowerCase().replace(/\s+/g, '')}@inl.co.id`,
        closedDate: status === 'Closed' && closedDate ? closedDate : null,
        tindakLanjut,
        kendala,
        remarks,
      }
    })

    return reply.code(201).send({ success: true, data: created })
  })

  // PUT edit Activity
  fastify.put('/activities/:id', async (request: any, reply) => {
    const { id } = request.params
    const { idProgram, kegiatan, descriptionAction, startDate, dueDate, closedDate, status, picNama, picEmail, tindakLanjut, kendala, remarks } = request.body || {}

    let programItem = null
    if (idProgram) {
      programItem = await prisma.ref_Item_ProgramKerja.findUnique({
        where: { id: idProgram },
        include: { programKerja: true }
      })
      if (!programItem) {
        return reply.code(400).send({ success: false, error: 'Sub-Program tidak ditemukan' })
      }
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        idProgram,
        kategoriProgram: programItem?.programKerja ? `${programItem.programKerja.kode} ${programItem.programKerja.namaProgram}` : undefined,
        itemName: programItem?.namaItem,
        kegiatan,
        descriptionAction,
        startDate,
        dueDate,
        closedDate,
        status,
        picNama,
        picEmail,
        tindakLanjut,
        kendala,
        remarks,
      }
    })

    return { success: true, data: updated }
  })

  // PATCH toggle active/inactive Activity
  fastify.patch('/activities/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    const current = await prisma.activity.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Data tidak ditemukan' })

    const updated = await prisma.activity.update({
      where: { id },
      data: { isActive: !current.isActive }
    })
    return { success: true, data: updated }
  })

  // ==========================================
  // 4. DASHBOARD KPI
  // ==========================================

  fastify.get('/dashboard', async (request, reply) => {
    const [totalParents, totalChildPrograms, onProgressPrograms, closedPrograms, totalActivities, openActivities, onProgressActivities, closedActivities, cancelledActivities] = await Promise.all([
      prisma.ref_ProgramKerja.count({ where: { isActive: true } }),
      prisma.ref_Item_ProgramKerja.count({ where: { isActive: true } }),
      prisma.ref_Item_ProgramKerja.count({ where: { isActive: true, status: 'On Progress' } }),
      prisma.ref_Item_ProgramKerja.count({ where: { isActive: true, status: 'Closed' } }),
      prisma.activity.count({ where: { isActive: true } }),
      prisma.activity.count({ where: { isActive: true, status: 'Open' } }),
      prisma.activity.count({ where: { isActive: true, status: 'On Progress' } }),
      prisma.activity.count({ where: { isActive: true, status: 'Closed' } }),
      prisma.activity.count({ where: { isActive: true, status: 'Cancelled' } })
    ])

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
    const { month, year } = request.query || {}
    const where: any = {}
    if (month) where.bulan = Number(month)
    if (year) where.tahun = Number(year)

    const highlights = await prisma.highlight.findMany({
      where,
      orderBy: [{ no: 'asc' }, { createdAt: 'asc' }],
      include: {
        author: { select: { id: true, nama: true, email: true } },
        program: { include: { programKerja: true } },
      },
    })
    return { data: highlights }
  })

  // GET monthly highlight summary
  fastify.get('/highlights/summary', async (request: any, reply) => {
    const { year } = request.query || {}
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
    const { bulan, tahun, no, item, description, actionToBeTaken, namePic, targetDate, closedDate, status, remarks, programId, pics } = request.body || {}
    if (!bulan || !tahun || !item) {
      return reply.code(400).send({ success: false, error: 'Bulan, Tahun, dan Item wajib diisi' })
    }

    if (programId) {
      const progItem = await prisma.ref_Item_ProgramKerja.findUnique({ where: { id: programId } })
      if (!progItem) {
        return reply.code(400).send({ success: false, error: 'Sub-Program tidak ditemukan' })
      }
    }

    const sessionUser = request.session.get('user')
    let authorId: string | null = null
    if (sessionUser?.email) {
      const user = await prisma.user.findUnique({ where: { email: sessionUser.email } })
      if (user) authorId = user.id
    }
    const count = await prisma.highlight.count({
      where: { bulan: Number(bulan), tahun: Number(tahun) },
    })

    const picList = Array.isArray(pics) ? pics.filter((p: any) => p && (p.name || p.email || p.nama)) : null
    const namePicResult = picList && picList.length > 0
      ? picList.map((p: any) => p.name || p.nama).filter(Boolean).join(' / ')
      : (namePic ?? null)

    const created = await prisma.highlight.create({
      data: {
        bulan: Number(bulan),
        tahun: Number(tahun),
        no: no !== undefined && no !== null ? Number(no) : count + 1,
        item,
        description,
        actionToBeTaken,
        namePic: namePicResult,
        targetDate,
        closedDate: status === 'Closed' && closedDate ? closedDate : null,
        status: status || 'Open',
        remarks,
        authorId,
        programId: programId || null,
        pics: picList && picList.length > 0 ? picList : undefined,
      },
    })
    return reply.code(201).send({ success: true, data: created })
  })

  // PUT edit highlight
  fastify.put('/highlights/:id', async (request: any, reply) => {
    const { id } = request.params
    const { bulan, tahun, no, item, description, actionToBeTaken, namePic, targetDate, closedDate, status, remarks, programId, pics } = request.body || {}

    if (programId) {
      const progItem = await prisma.ref_Item_ProgramKerja.findUnique({ where: { id: programId } })
      if (!progItem) {
        return reply.code(400).send({ success: false, error: 'Sub-Program tidak ditemukan' })
      }
    }

    const picList = Array.isArray(pics) ? pics.filter((p: any) => p && (p.name || p.email || p.nama)) : null
    const namePicResult = picList && picList.length > 0
      ? picList.map((p: any) => p.name || p.nama).filter(Boolean).join(' / ')
      : (namePic !== undefined ? namePic : undefined)

    const updated = await prisma.highlight.update({
      where: { id },
      data: {
        bulan: bulan !== undefined && bulan !== null ? Number(bulan) : undefined,
        tahun: tahun !== undefined && tahun !== null ? Number(tahun) : undefined,
        no: no !== undefined && no !== null ? Number(no) : undefined,
        item,
        description,
        actionToBeTaken,
        namePic: namePicResult,
        targetDate,
        closedDate: status !== 'Closed' ? null : closedDate ?? undefined,
        status,
        remarks,
        programId: programId !== undefined ? (programId || null) : undefined,
        pics: picList && picList.length > 0 ? picList : undefined,
      },
    })
    return { success: true, data: updated }
  })

  // DELETE highlight
  fastify.delete('/highlights/:id', async (request: any, reply) => {
    const { id } = request.params
    const current = await prisma.highlight.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Data tidak ditemukan' })

    await prisma.highlight.delete({ where: { id } })
    return { success: true, data: { id } }
  })

  // ==========================================
  // 6. USER SDM MANAGEMENT ROUTES (Portal SSO Integration)
  // ==========================================

  // GET all users/employees directly from Portal SSO API (filtered strictly for Sistem & IT units)
  fastify.get('/users', async (request, reply) => {
    try {
      // 1. Fetch real employee dataset directly from Portal SSO API
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

      if (employeesRaw.length > 0) {
        // Filter strictly for Oka Aritonang (Kasubag Sistem & IT) and downward staff hierarchy (excl. Kabag Ferdiansyah)
        const sistemItEmployees = employeesRaw.filter((emp: any) => {
          const n = (emp.namaLengkap || emp.nama || emp.name || '').toLowerCase()
          const u = (emp.unitNama || emp.unit?.nama || emp.unit || '').toLowerCase()
          const j = (emp.jabatan?.nama || emp.jabatan || '').toLowerCase()

          // Exclude Kabag (Ferdiansyah / Kepala Bagian)
          if (n.includes('ferdiansyah') || j.includes('kabag') || j.includes('kepala bagian') || u === 'sdm & sistem') {
            return false
          }

          return u === 'sistem & it' || u === 'it' || j.includes('sistem dan it') || j.includes('asisten it') || j.includes('it dev') || j.includes('it spesialist') || j.includes('admin network')
        })

        const formatted = (sistemItEmployees.length > 0 ? sistemItEmployees : employeesRaw).map((emp: any) => {
          const nama = emp.namaLengkap || emp.nama || emp.name || emp.user?.namaLengkap || emp.user?.nama || 'Karyawan INL'
          const email = emp.email || emp.user?.email || ''
          const jabatan = typeof emp.jabatan === 'string' ? emp.jabatan : (emp.jabatan?.nama || emp.jabatan?.name || emp.posisi?.nama || emp.posisi || 'Staff Operasional')
          const unit = emp.unitNama || (typeof emp.unit === 'string' ? emp.unit : emp.unit?.nama) || 'Sistem & IT'
          const isActive = emp.isActive !== false

          return {
            id: emp.id || emp.employeeId || emp.user?.id || email || nama,
            nama,
            email,
            jabatan,
            unit,
            isActive,
            role: (jabatan.toLowerCase().includes('kepala') || jabatan.toLowerCase().includes('kasubag') || jabatan.toLowerCase().includes('manager') || jabatan.toLowerCase().includes('pimpinan')) ? 'ADMIN' : 'USER',
            programs: []
          }
        })
        return { data: formatted }
      }
    } catch (e) {
      console.warn('Portal SSO employees API error, using fallback list:', (e as Error).message)
    }

    // Fallback list matching Portal SSO real database for Oka Aritonang & downward IT staff
    const fallbackEmployees = [
      { id: '65518f57-35ea-43b2-af59-8e3ea489586b', nama: 'Oka Aritonang', email: 'oka@inl.co.id', jabatan: 'Kepala Sub Bagian Sistem dan IT', unit: 'Sistem & IT', isActive: true, role: 'ADMIN', programs: [] },
      { id: '32a5db30-417c-40da-8849-5a299ed1b0fc', nama: 'Tomy Inri Akbar Lingga', email: 'tomy@inl.co.id', jabatan: 'Asisten IT', unit: 'IT', isActive: true, role: 'USER', programs: [] },
      { id: 'e55853af-89e5-4dfe-b2a2-a7873a5ef303', nama: 'AUNDRY HERMAWAN', email: 'aundry@inl.co.id', jabatan: 'Admin Network & Data Center', unit: 'IT', isActive: true, role: 'USER', programs: [] },
      { id: '6bc9fa7d-866b-4ca4-bc89-47e90bf475d2', nama: 'Developer 1', email: 'dev1@inl.co.id', jabatan: 'IT Dev', unit: 'IT', isActive: true, role: 'USER', programs: [] },
      { id: '62d80617-af55-403e-b698-0378d0af5248', nama: 'RINKO', email: 'rinko@inl.co.id', jabatan: 'IT Spesialist', unit: 'IT', isActive: true, role: 'USER', programs: [] },
      { id: '33e3a57b-ff61-4fe9-9e85-864d8b7a613e', nama: 'Salman Jaya Sempurna', email: 'salman@inl.co.id', jabatan: 'Admin Network & Data Center', unit: 'IT', isActive: true, role: 'USER', programs: [] },
    ]

    return { data: fallbackEmployees }
  })

  fastify.post('/users', async (request: any, reply) => {
    return reply.code(400).send({ success: false, error: 'Data user dikelola terpusat melalui Portal SSO' })
  })

  fastify.put('/users/:id', async (request: any, reply) => {
    return reply.send({ success: true, message: 'Data user dikelola terpusat via Portal SSO' })
  })

  fastify.patch('/users/:id/toggle', async (request: any, reply) => {
    return reply.send({ success: true, message: 'Status user dikelola terpusat via Portal SSO' })
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
