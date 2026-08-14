import { PrismaClient } from '@prisma/client'

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return
  const client = process.env.DB_CLIENT || "postgresql"
  const user = process.env.DB_USERNAME || process.env.DB_USER
  const password = process.env.DB_PASSWORD || process.env.DB_PASS
  const host = process.env.DB_HOST || "127.0.0.1"
  const port = process.env.DB_PORT || "5432"
  const db = process.env.DB_DATABASE || process.env.DB_NAME
  const schema = process.env.DB_SCHEMA || "public"
  if (user && password && host && db) {
    const auth = encodeURIComponent(user) + ":" + encodeURIComponent(password)
    const hostPort = port ? `${host}:${port}` : host
    process.env.DATABASE_URL = `${client}://${auth}@${hostPort}/${db}?schema=${encodeURIComponent(schema)}`
  }
}
ensureDatabaseUrl()

const prisma = new PrismaClient() as any

export default prisma

