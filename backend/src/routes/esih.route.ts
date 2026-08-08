import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import prisma from '../plugins/prisma'

const esihRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get all Parent Program Kerja along with their Child items
  fastify.get('/program-kerja', async (request, reply) => {
    const parentPrograms = await prisma.programKerja.findMany({
      orderBy: { kode: 'asc' },
      include: {
        items: {
          orderBy: { kode: 'asc' }
        }
      }
    })
    return { data: parentPrograms }
  })

  // Get all Sub-Program / Child items
  fastify.get('/programs', async (request, reply) => {
    const programs = await prisma.masterProgram.findMany({
      orderBy: { kode: 'asc' },
      include: {
        programKerja: true
      }
    })
    return { data: programs }
  })

  // Get all activities (with optional filters)
  fastify.get('/activities', async (request: any, reply) => {
    const { status, category } = request.query
    
    const where: any = {}
    if (status && status !== 'ALL') where.status = status
    if (category && category !== 'ALL') where.kategoriProgram = category

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

  // Get Dashboard KPI data
  fastify.get('/dashboard', async (request, reply) => {
    const [totalParents, totalChildPrograms, onProgressPrograms, closedPrograms, totalActivities, openActivities, onProgressActivities, closedActivities] = await Promise.all([
      prisma.programKerja.count(),
      prisma.masterProgram.count(),
      prisma.masterProgram.count({ where: { status: 'On Progress' } }),
      prisma.masterProgram.count({ where: { status: 'Closed' } }),
      prisma.activity.count(),
      prisma.activity.count({ where: { status: 'Open' } }),
      prisma.activity.count({ where: { status: 'On Progress' } }),
      prisma.activity.count({ where: { status: 'Closed' } })
    ])

    return {
      kpi: {
        totalParents,
        totalPrograms: totalChildPrograms,
        onProgressPrograms,
        closedPrograms,
        totalActivities,
        openActivities,
        onProgressActivities,
        closedActivities
      }
    }
  })
}

export default esihRoutes
