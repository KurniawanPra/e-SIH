import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export async function createTestDatabase() {
  // An isolated PostgreSQL WASM instance; never read or mutate the project's .env DB.
  const db = await PGlite.create()
  await db.exec(readFileSync(resolve(__dirname, '../prisma/migrations/20260810010000_init_full_schema/migration.sql'), 'utf8'))
  const repair = readFileSync(resolve(__dirname, '../prisma/migrations/20260828000000_complete_reporting_schema/migration.sql'), 'utf8')
  await db.exec(repair)
  await db.exec(repair) // Existing db-push tables and repeated repair must be safe.
  const server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0, maxConnections: 1 })
  await server.start()
  const address = server.getServerConn()
  return {
    db,
    url: `postgresql://postgres:postgres@${address}/postgres?schema=public&connection_limit=1&pool_timeout=10`,
    close: async () => { await server.stop(); await db.close() },
  }
}
