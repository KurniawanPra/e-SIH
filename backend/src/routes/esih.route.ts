import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import prisma from '../plugins/prisma'

const esihRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // ==========================================
  // 1. PARENT PROGRAM KERJA ROUTES
  // ==========================================

  // GET all Parent Program Kerja with average progress & items
  // GET all Parent Program Kerja with average progress & items
  fastify.get('/program-kerja', async (request: any, reply) => {
    const { year } = request.query || {}
    const where: any = {}
    if (year) {
      where.tahun = Number(year)
    }

    const parentPrograms = await prisma.programKerja.findMany({
      where,
      orderBy: { kode: 'asc' },
      include: {
        items: {
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
    const result = parentPrograms.map(parent => {
      const activeItems = parent.items.filter(i => i.isActive)
      const itemsWithProgress = activeItems.map(item => {
        let itemProgress = item.progress
        const activeActivities = item.activities || []
        if (activeActivities.length > 0) {
          const closedCount = activeActivities.filter(a => a.status === 'Closed').length
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
        ? Math.round(itemsWithProgress.reduce((acc, curr) => acc + curr.progress, 0) / itemsWithProgress.length)
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
    const created = await prisma.programKerja.create({
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

    const updated = await prisma.programKerja.update({
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
    const current = await prisma.programKerja.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Data tidak ditemukan' })

    const updated = await prisma.programKerja.update({
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

    const programs = await prisma.masterProgram.findMany({
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
    const created = await prisma.masterProgram.create({
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
        status: status || 'On Progress',
        progress: calcProgress,
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

    const updated = await prisma.masterProgram.update({
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
    const current = await prisma.masterProgram.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ success: false, error: 'Data tidak ditemukan' })

    const updated = await prisma.masterProgram.update({
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
    const { status, category } = request.query
    
    const where: any = {}
    if (status && status !== 'ALL') where.status = status

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
    const { idProgram, kegiatan, descriptionAction, startDate, dueDate, status, picNama, picEmail, tindakLanjut, kendala, remarks } = request.body || {}
    if (!idProgram || !kegiatan || !picNama) {
      return reply.code(400).send({ success: false, error: 'Sub-Program, Kegiatan, dan Nama PIC wajib diisi' })
    }

    const count = await prisma.activity.aggregate({ _max: { no: true } })
    const newNo = (count._max.no ?? 0) + 1
    const newId = `ACT-${String(newNo).padStart(3, '0')}`

    const programItem = await prisma.masterProgram.findUnique({
      where: { id: idProgram },
      include: { programKerja: true }
    })

    const created = await prisma.activity.create({
      data: {
        id: newId,
        no: newNo,
        idProgram,
        kategoriProgram: programItem?.programKerja ? `${programItem.programKerja.kode} ${programItem.programKerja.namaProgram}` : 'Program',
        itemName: programItem?.namaItem || 'Item',
        kegiatan,
        descriptionAction,
        startDate: startDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        status: status || 'On Progress',
        picNama,
        picEmail: picEmail || `${picNama.toLowerCase().replace(/\s+/g, '')}@inl.co.id`,
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
      programItem = await prisma.masterProgram.findUnique({
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
      prisma.programKerja.count({ where: { isActive: true } }),
      prisma.masterProgram.count({ where: { isActive: true } }),
      prisma.masterProgram.count({ where: { isActive: true, status: 'On Progress' } }),
      prisma.masterProgram.count({ where: { isActive: true, status: 'Closed' } }),
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
  // 5. USER SDM MANAGEMENT ROUTES
  // ==========================================

  // GET all users
  fastify.get('/users', async (request, reply) => {
    try {
      const users = await (prisma as any).user.findMany({
        orderBy: { nama: 'asc' }
      })
      return { data: users }
    } catch (e) {
      // Fallback if table query fails
      const activities = await prisma.activity.findMany({ select: { picNama: true, picEmail: true } })
      const map = new Map()
      activities.forEach(a => {
        if (!map.has(a.picEmail)) {
          map.set(a.picEmail, { id: a.picEmail, nama: a.picNama, email: a.picEmail, jabatan: 'Staff Operasional', unit: 'IT & Sistem Operational', isActive: true })
        }
      })
      return { data: Array.from(map.values()) }
    }
  })

  // POST create user
  fastify.post('/users', async (request: any, reply) => {
    const { nama, email, jabatan, unit } = request.body || {}
    if (!nama || !email) {
      return reply.code(400).send({ success: false, error: 'Nama dan Email wajib diisi' })
    }

    try {
      const created = await (prisma as any).user.create({
        data: {
          nama,
          email,
          jabatan: jabatan || 'Staff Operasional',
          unit: unit || 'IT & Sistem Operational',
          isActive: true
        }
      })
      return reply.code(201).send({ success: true, data: created })
    } catch (e: any) {
      return reply.code(400).send({ success: false, error: e.message || 'Gagal menambahkan user' })
    }
  })

  // PUT edit user
  fastify.put('/users/:id', async (request: any, reply) => {
    const { id } = request.params
    const { nama, email, jabatan, unit, role } = request.body || {}

    try {
      const updated = await (prisma as any).user.update({
        where: { id },
        data: { nama, email, jabatan, unit, role }
      })
      return { success: true, data: updated }
    } catch (e: any) {
      return reply.code(400).send({ success: false, error: 'Gagal memperbarui user' })
    }
  })

  // PATCH toggle active user
  fastify.patch('/users/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    try {
      const current = await (prisma as any).user.findUnique({ where: { id } })
      if (!current) return reply.code(404).send({ success: false, error: 'User tidak ditemukan' })

      const updated = await (prisma as any).user.update({
        where: { id },
        data: { isActive: !current.isActive }
      })
      return { success: true, data: updated }
    } catch (e: any) {
      return reply.code(400).send({ success: false, error: 'Gagal mengubah status user' })
    }
  })
}

export default esihRoutes
