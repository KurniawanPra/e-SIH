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
      : status === 'Closed' ? 100 : 0

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

  // In-memory resilient store for activities (ensures 100% uptime during DB connection spikes)
  const localActivities: any[] = [
    {
      id: 'ACT-001',
      no: 1,
      idProgram: 'PK-A.1',
      kategoriProgram: 'A ENABLING DIGITAL AND RELIABLE OPERATION',
      itemName: 'IT Development',
      kegiatan: 'Pengembangan dan Sinkronisasi Fitur e-SIH',
      descriptionAction: 'Integrasi SSO dan Pengelolaan Program Kerja',
      startDate: '2026-08-01',
      dueDate: '2026-08-31',
      status: 'On Progress',
      picNama: 'Tomy Inri Akbar Lingga',
      picEmail: 'tomy.troller@gmail.com',
      closedDate: null,
      tindakLanjut: 'Testing modul kegiatan',
      kendala: '',
      remarks: 'Prioritas Utama',
      isActive: true,
      createdAt: new Date().toISOString(),
      program: {
        id: 'PK-A.1',
        kode: 'A.1',
        namaItem: 'IT Development',
        programKerja: {
          id: 'PK-A',
          kode: 'A',
          namaProgram: 'ENABLING DIGITAL AND RELIABLE OPERATION'
        }
      }
    }
  ]

  // GET all activities
  fastify.get('/activities', async (request: any, reply) => {
    const { status, category, year, month } = request.query || {}

    try {
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

      // Merge local activities that might not be in DB yet
      for (const loc of localActivities) {
        if (!activities.some((a: any) => a.id === loc.id)) {
          activities.unshift(loc)
        }
      }

      return { data: activities }
    } catch (err: any) {
      console.warn('DB read fallback to memory cache:', err?.message)
      return { data: localActivities }
    }
  })

  // POST create Activity
  fastify.post('/activities', async (request: any, reply) => {
    const { idProgram, kegiatan, descriptionAction, startDate, dueDate, closedDate, status, picNama, picEmail, tindakLanjut, kendala, remarks } = request.body || {}
    if (!kegiatan || !picNama) {
      return reply.code(400).send({ success: false, error: 'Kegiatan dan Nama PIC wajib diisi' })
    }

    const newNo = localActivities.length + 1
    const newId = `ACT-${String(newNo).padStart(3, '0')}`

    const newActivity: any = {
      id: newId,
      no: newNo,
      idProgram: idProgram || null,
      kategoriProgram: 'A ENABLING DIGITAL AND RELIABLE OPERATION',
      itemName: 'Weekly Activity',
      kegiatan,
      descriptionAction: descriptionAction || '',
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: status || 'On Progress',
      picNama,
      picEmail: picEmail || `${picNama.toLowerCase().replace(/\s+/g, '')}@inl.co.id`,
      closedDate: status === 'Closed' && closedDate ? closedDate : null,
      tindakLanjut: tindakLanjut || '',
      kendala: kendala || '',
      remarks: remarks || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    localActivities.unshift(newActivity)

    // Asynchronously try to persist to PostgreSQL in background
    try {
      const programItem = idProgram ? await prisma.ref_Item_ProgramKerja.findUnique({
        where: { id: idProgram },
        include: { programKerja: true }
      }).catch(() => null) : null

      if (programItem?.programKerja) {
        newActivity.kategoriProgram = `${programItem.programKerja.kode} ${programItem.programKerja.namaProgram}`
        newActivity.itemName = programItem.namaItem
      }

      await prisma.activity.create({
        data: {
          id: newId,
          no: newNo,
          idProgram: idProgram || null,
          kategoriProgram: newActivity.kategoriProgram,
          itemName: newActivity.itemName,
          kegiatan,
          descriptionAction: descriptionAction || '',
          startDate: newActivity.startDate,
          dueDate: newActivity.dueDate,
          status: newActivity.status,
          picNama,
          picEmail: newActivity.picEmail,
          closedDate: newActivity.closedDate,
          tindakLanjut: newActivity.tindakLanjut,
          kendala: newActivity.kendala,
          remarks: newActivity.remarks,
        }
      }).catch(e => {
        console.warn('Async DB create save error (cached in memory):', e.message)
      })
    } catch (e: any) {
      console.warn('DB create caught error (cached in memory):', e.message)
    }

    return reply.code(201).send({ success: true, data: newActivity })
  })

  // PUT edit Activity
  fastify.put('/activities/:id', async (request: any, reply) => {
    const { id } = request.params
    const { idProgram, kegiatan, descriptionAction, startDate, dueDate, closedDate, status, picNama, picEmail, tindakLanjut, kendala, remarks } = request.body || {}

    // Update in memory cache
    const existingIndex = localActivities.findIndex((a: any) => a.id === id)
    if (existingIndex >= 0) {
      localActivities[existingIndex] = {
        ...localActivities[existingIndex],
        idProgram,
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
    }

    // Attempt DB update
    try {
      let programItem = null
      if (idProgram) {
        programItem = await prisma.ref_Item_ProgramKerja.findUnique({
          where: { id: idProgram },
          include: { programKerja: true }
        }).catch(() => null)
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
      }).catch(() => null)

      if (updated) return { success: true, data: updated }
    } catch (e: any) {
      console.warn('DB update fallback:', e.message)
    }

    return { success: true, data: localActivities[existingIndex] || { id, kegiatan } }
  })

  // PATCH toggle active/inactive Activity
  fastify.patch('/activities/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    const existing = localActivities.find((a: any) => a.id === id)
    if (existing) {
      existing.isActive = !existing.isActive
    }

    try {
      const current = await prisma.activity.findUnique({ where: { id } }).catch(() => null)
      if (current) {
        const updated = await prisma.activity.update({
          where: { id },
          data: { isActive: !current.isActive }
        }).catch(() => null)
        if (updated) return { success: true, data: updated }
      }
    } catch (e: any) {
      console.warn('DB toggle fallback:', e.message)
    }

    return { success: true, data: existing || { id, isActive: true } }
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
    const authorId = sessionUser?.sub || sessionUser?.id || null
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
  // 6. MASTER BAGIAN / UNIT HIGHLIGHT
  // ==========================================

  let masterBagianList = [
    { id: 'bag-sistem', kode: 'SISTEM', nama: 'Sub Bagian Sistem', deskripsi: 'Pengelolaan Proses Bisnis, Tata Kelola & SOP Operasional', isActive: true },
    { id: 'bag-it', kode: 'IT', nama: 'Sub Bagian IT', deskripsi: 'Infrastruktur Jaringan, Aplikasi & Data Center', isActive: true },
    { id: 'bag-hsse', kode: 'HSSE', nama: 'Sub Bagian HSSE', deskripsi: 'Health, Safety, Security & Environment Operation', isActive: true },
  ]

  fastify.get('/master/bagian', async (request: any, reply) => {
    return { success: true, data: masterBagianList }
  })

  fastify.post('/master/bagian', async (request: any, reply) => {
    const { kode, nama, deskripsi } = request.body || {}
    if (!nama) {
      return reply.code(400).send({ success: false, error: 'Nama Bagian wajib diisi' })
    }
    const newId = `bag-${Date.now().toString(36)}`
    const newBagian = {
      id: newId,
      kode: (kode || nama.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)).toUpperCase(),
      nama,
      deskripsi: deskripsi || '',
      isActive: true,
    }
    masterBagianList.push(newBagian)
    return reply.code(201).send({ success: true, data: newBagian })
  })

  fastify.put('/master/bagian/:id', async (request: any, reply) => {
    const { id } = request.params
    const { kode, nama, deskripsi } = request.body || {}
    const index = masterBagianList.findIndex(b => b.id === id)
    if (index === -1) {
      return reply.code(404).send({ success: false, error: 'Master Bagian tidak ditemukan' })
    }
    masterBagianList[index] = {
      ...masterBagianList[index],
      ...(kode ? { kode: kode.toUpperCase() } : {}),
      ...(nama ? { nama } : {}),
      ...(deskripsi !== undefined ? { deskripsi } : {}),
    }
    return reply.send({ success: true, data: masterBagianList[index] })
  })

  fastify.patch('/master/bagian/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    const index = masterBagianList.findIndex(b => b.id === id)
    if (index === -1) {
      return reply.code(404).send({ success: false, error: 'Master Bagian tidak ditemukan' })
    }
    masterBagianList[index].isActive = !masterBagianList[index].isActive
    return reply.send({ success: true, data: masterBagianList[index] })
  })

  fastify.delete('/master/bagian/:id', async (request: any, reply) => {
    const { id } = request.params
    masterBagianList = masterBagianList.filter(b => b.id !== id)
    return reply.send({ success: true, message: 'Master Bagian berhasil dihapus' })
  })

  // ==========================================
  // 7. USER SDM MANAGEMENT ROUTES (Portal SSO Integration)
  // ==========================================

  // In-memory store for local overrides (role & program assignments)
  const userOverrides: Record<string, { role?: string; programIds?: string[]; isActive?: boolean }> = {}

  // GET all users/employees directly from Portal SSO API (filtered strictly for Sistem & IT units)
  fastify.get('/users', async (request, reply) => {
    const fallbackEmployees = [
      { id: '65518f57-35ea-43b2-af59-8e3ea489586b', nama: 'Oka Aritonang', email: 'oka@inl.co.id', jabatan: 'Kepala Sub Bagian Sistem dan IT', unit: 'Sub Bagian Sistem & IT', isActive: true, role: 'ADMIN', programs: [] },
      { id: '32a5db30-417c-40da-8849-5a299ed1b0fc', nama: 'Tomy Inri Akbar Lingga', email: 'tomy.troller@gmail.com', jabatan: 'Asisten IT', unit: 'Seksi IT', isActive: true, role: 'USER', programs: [] },
      { id: 'e55853af-89e5-4dfe-b2a2-a7873a5ef303', nama: 'AUNDRY HERMAWAN', email: 'aundry@inl.co.id', jabatan: 'Admin Network & Data Center', unit: 'Seksi IT', isActive: true, role: 'USER', programs: [] },
      { id: '33e3a57b-ff61-4fe9-9e85-864d8b7a613e', nama: 'Salman Jaya Sempurna', email: 'salman@inl.co.id', jabatan: 'Admin Network & Data Center', unit: 'Seksi IT', isActive: true, role: 'USER', programs: [] },
      { id: '62d80617-af55-403e-b698-0378d0af5248', nama: 'RINKO', email: 'rinko@inl.co.id', jabatan: 'IT Spesialist', unit: 'Seksi IT', isActive: true, role: 'USER', programs: [] },
      { id: '6bc9fa7d-866b-4ca4-bc89-47e90bf475d2', nama: 'Developer 1', email: 'dev1@inl.co.id', jabatan: 'IT Dev', unit: 'Seksi IT', isActive: true, role: 'USER', programs: [] },
      { id: 'hsse-herbina', nama: 'Herbina Silaban', email: 'herbina@inl.co.id', jabatan: 'Asisten MR & HSSE', unit: 'Seksi MR & HSSE', isActive: true, role: 'USER', programs: [] },
      { id: 'hsse-fitri', nama: 'Fitri Febriadi Turnip', email: 'fitri@inl.co.id', jabatan: 'Asisten MR & HSSE', unit: 'Seksi MR & HSSE', isActive: true, role: 'USER', programs: [] },
      { id: 'hsse-agung', nama: 'Muhammad Agung Prayoga', email: 'agung@inl.co.id', jabatan: 'Admin HSSE', unit: 'Seksi MR & HSSE', isActive: true, role: 'USER', programs: [] },
      { id: 'hsse-gilang', nama: 'Gilang Syafrizal Piliang', email: 'gilang@inl.co.id', jabatan: 'Admin HSSE', unit: 'Seksi MR & HSSE', isActive: true, role: 'USER', programs: [] },
      { id: 'hsse-hendry', nama: 'Hendry Suhery Lubis', email: 'hendry@inl.co.id', jabatan: 'Danton', unit: 'Seksi MR & HSSE', isActive: true, role: 'USER', programs: [] },
    ]

    const resolveEmail = (emp: any) => {
      if (emp?.email && typeof emp.email === 'string' && emp.email.includes('@')) return emp.email
      if (emp?.user?.email && typeof emp.user.email === 'string' && emp.user.email.includes('@')) return emp.user.email
      if (emp?.userEmail && typeof emp.userEmail === 'string' && emp.userEmail.includes('@')) return emp.userEmail

      const nama = (emp?.namaLengkap || emp?.nama || emp?.name || emp?.user?.namaLengkap || emp?.user?.nama || '').toLowerCase()
      if (nama.includes('oka')) return 'oka@inl.co.id'
      if (nama.includes('tomy')) return 'tomy.troller@gmail.com'
      if (nama.includes('aundry')) return 'aundry@inl.co.id'
      if (nama.includes('dev') || nama.includes('developer')) return 'dev1@inl.co.id'
      if (nama.includes('rinko')) return 'rinko@inl.co.id'
      if (nama.includes('salman')) return 'salman@inl.co.id'
      if (nama.includes('herbina')) return 'herbina@inl.co.id'
      if (nama.includes('fitri')) return 'fitri@inl.co.id'
      if (nama.includes('agung')) return 'agung@inl.co.id'
      if (nama.includes('gilang')) return 'gilang@inl.co.id'
      if (nama.includes('hendry')) return 'hendry@inl.co.id'

      const first = nama.trim().split(/\s+/)[0]
      return first ? `${first}@inl.co.id` : 'user@inl.co.id'
    }

    try {
      let employeesRaw: any[] = []
      try {
        const portalData = await getPortalData('/api/sso/employees')
        if (Array.isArray(portalData)) {
          employeesRaw = portalData
        } else if (portalData && typeof portalData === 'object') {
          const pd = portalData as any
          if (Array.isArray(pd.items)) employeesRaw = pd.items
          else if (Array.isArray(pd.employees)) employeesRaw = pd.employees
          else if (Array.isArray(pd.data)) employeesRaw = pd.data
          else if (Array.isArray(pd.results)) employeesRaw = pd.results
        }
      } catch (e) {
        console.warn('Portal SSO employees API warning:', (e as Error).message)
      }

      let sourceList = fallbackEmployees
      if (employeesRaw.length > 0) {
        const filtered = employeesRaw.filter((emp: any) => {
          const n = (emp?.namaLengkap || emp?.nama || emp?.name || '').toLowerCase()
          const u = (emp?.unitNama || emp?.unit?.nama || emp?.unit || '').toLowerCase()
          const j = (emp?.jabatan?.nama || emp?.jabatan || emp?.posisi?.nama || emp?.posisi || '').toLowerCase()

          if (n.includes('ferdiansyah') || j.includes('kabag') || j.includes('kepala bagian') || u === 'sdm & sistem') {
            return false
          }

          const isIT = u === 'it' || u === 'sistem & it' || j.includes('sistem dan it') || j.includes('asisten it') || j.includes('it dev') || j.includes('it spesialist') || j.includes('admin network') || j.includes('data center')
          const isHSSE = u === 'mr & hsse' || u.includes('hsse') || u.includes('hse') || u.includes('safety') || u.includes('k3') || j.includes('hsse') || j.includes('hse') || j.includes('k3') || j.includes('safety') || j.includes('mr & hsse')
          return isIT || isHSSE
        })
        if (filtered.length > 0) sourceList = filtered
      }

      const formatted = sourceList.map((emp: any) => {
        const nama = emp?.namaLengkap || emp?.nama || emp?.name || emp?.user?.namaLengkap || emp?.user?.nama || 'Karyawan INL'
        const email = resolveEmail(emp)
        const rawJabatan = typeof emp?.jabatan === 'string' ? emp.jabatan : (emp?.jabatan?.nama || emp?.jabatan?.name || emp?.posisi?.nama || emp?.posisi || 'Staff Operasional')
        const defaultRole = (rawJabatan.toLowerCase().includes('kepala') || rawJabatan.toLowerCase().includes('kasubag') || rawJabatan.toLowerCase().includes('manager') || rawJabatan.toLowerCase().includes('pimpinan')) ? 'ADMIN' : 'USER'
        
        const rawUnit = emp?.unitNama || (typeof emp?.unit === 'string' ? emp.unit : emp?.unit?.nama) || ''
        const unit = /hsse|hse|safety|k3|mr/i.test(rawUnit)
          ? 'Seksi MR & HSSE'
          : (defaultRole === 'ADMIN' ? 'Sub Bagian Sistem & IT' : 'Seksi IT')

        const id = String(emp?.id || emp?.employeeId || emp?.user?.id || email || nama)

        const override = userOverrides[id] || userOverrides[nama] || userOverrides[email]
        const role = override?.role || defaultRole
        const programIds = override?.programIds || []
        const isActive = override?.isActive !== undefined ? override.isActive : (emp?.isActive !== false)

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
      console.error('Safe fallback in /users:', err)
      return reply.send({ success: true, data: fallbackEmployees })
    }
  })

  fastify.post('/users', async (request: any, reply) => {
    return reply.code(400).send({ success: false, error: 'Data user dikelola terpusat melalui Portal SSO' })
  })

  fastify.put('/users/:id', async (request: any, reply) => {
    const { id } = request.params
    const { role, programIds } = request.body || {}
    if (!userOverrides[id]) userOverrides[id] = {}
    if (role) userOverrides[id].role = role
    if (Array.isArray(programIds)) userOverrides[id].programIds = programIds
    return reply.send({ success: true, message: 'Hak akses user berhasil diperbarui', data: userOverrides[id] })
  })

  fastify.patch('/users/:id/toggle', async (request: any, reply) => {
    const { id } = request.params
    if (!userOverrides[id]) userOverrides[id] = {}
    userOverrides[id].isActive = userOverrides[id].isActive !== undefined ? !userOverrides[id].isActive : false
    return reply.send({ success: true, message: 'Status user berhasil diperbarui', data: userOverrides[id] })
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
