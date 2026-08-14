#!/bin/sh
set -e

# Export DATABASE_URL jika DB_* variabel didefinisikan
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL="${DB_CLIENT:-postgresql}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_DATABASE}?schema=${DB_SCHEMA:-public}"
fi

echo "[e-SIH] Menunggu PostgreSQL tersedia & sinkronisasi skema..."
npx prisma db push --skip-generate --accept-data-loss || true

SEEDED=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.ref_ProgramKerja.count()
  .then((count) => { console.log(count); return prisma.\$disconnect(); })
  .catch(() => { console.log('0'); process.exit(0); });
" 2>/dev/null || echo "0")

if [ "$SEEDED" = "0" ] || [ -z "$SEEDED" ]; then
  echo "[e-SIH] Database kosong (0 program kerja), menjalankan auto-seed..."
  node dist/prisma/seed.js || true
else
  echo "[e-SIH] Data sudah ada ($SEEDED program kerja), auto-seed dilewati."
fi

exec node dist/src/server.js
