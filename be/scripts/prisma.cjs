// Prisma 5 reads DATABASE_URL from schema.prisma. Resolve DB_* consistently for CLI use.
require('dotenv').config()
const { spawnSync } = require('node:child_process')
if (!process.env.DATABASE_URL) {
  const env = process.env
  const user = env.DB_USERNAME || env.DB_USER
  const password = env.DB_PASSWORD || env.DB_PASS
  const database = env.DB_DATABASE || env.DB_NAME
  if (user && password && database) {
    process.env.DATABASE_URL = `${env.DB_CLIENT || 'postgresql'}://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${env.DB_HOST || '127.0.0.1'}:${env.DB_PORT || '5432'}/${database}?schema=${encodeURIComponent(env.DB_SCHEMA || 'public')}`
  }
}
const result = spawnSync(process.execPath, [require.resolve('prisma'), ...process.argv.slice(2)], { stdio: 'inherit', env: process.env })
if (result.error) console.error('Prisma CLI gagal dijalankan:', result.error.message)
process.exit(result.status ?? 1)
