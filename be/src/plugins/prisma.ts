import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'

function getDatabaseUrl() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('connection_limit')) {
    return process.env.DATABASE_URL
  }

  const client = process.env.DB_CLIENT || 'postgresql'
  const user = process.env.DB_USERNAME || process.env.DB_USER
  const password = process.env.DB_PASSWORD || process.env.DB_PASS
  const host = process.env.DB_HOST || '127.0.0.1'
  const port = process.env.DB_PORT || '5432'
  const db = process.env.DB_DATABASE || process.env.DB_NAME
  const schema = process.env.DB_SCHEMA || 'public'

  let url = process.env.DATABASE_URL
  if (!url && user && password && host && db) {
    const auth = encodeURIComponent(user) + ':' + encodeURIComponent(password)
    const hostPort = port ? `${host}:${port}` : host
    url = `${client}://${auth}@${hostPort}/${db}?schema=${encodeURIComponent(schema)}`
  }

  if (url && !url.includes('connection_limit')) {
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}connection_limit=3&pool_timeout=20&connect_timeout=10`
  }

  process.env.DATABASE_URL = url
  return url
}

const dbUrl = getDatabaseUrl()

declare global {
  // eslint-disable-next-line no-var
  var __esih_prisma: PrismaClient | undefined
}

// If an old instance exists from previous reload, disconnect it cleanly
if (globalThis.__esih_prisma) {
  globalThis.__esih_prisma.$disconnect().catch(() => {})
}

export const prisma: PrismaClient = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: ['error'],
})

globalThis.__esih_prisma = prisma

export default prisma
