import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { getPortalData, PortalDataError } from '../services/portal-data.service'

const employeeQuerySchema = z.object({
  id: z.string().uuid().optional(),
  minGradeLevel: z.coerce.number().int().optional(),
  aboveGradeLevel: z.coerce.number().int().optional(),
})

export default async function portalDataRoutes(app: FastifyInstance) {
  const proxy = async (
    _request: FastifyRequest,
    reply: FastifyReply,
    path: string,
    query: Record<string, string | number | undefined> = {},
  ) => {
    try {
      const data = await getPortalData(path, query)
      return reply.send({ success: true, data })
    } catch (error) {
      const statusCode = error instanceof PortalDataError ? error.statusCode : 500
      return reply.code(statusCode).send({
        success: false,
        error: error instanceof PortalDataError ? error.message : 'Request data Portal gagal',
      })
    }
  }

  app.get('/employees', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = employeeQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.code(422).send({ success: false, error: 'Query employee tidak valid' })
    }
    return proxy(request, reply, '/api/sso/employees', parsed.data)
  })
  app.get('/grades', { preHandler: [app.authenticate] }, (request, reply) =>
    proxy(request, reply, '/api/sso/grades'))
  app.get('/organization-units', { preHandler: [app.authenticate] }, (request, reply) =>
    proxy(request, reply, '/api/sso/organization-units'))
  app.get('/placements', { preHandler: [app.authenticate] }, (request, reply) =>
    proxy(request, reply, '/api/sso/placements'))
}
