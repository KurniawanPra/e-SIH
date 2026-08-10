#!/bin/sh
set -e

echo "[e-SIH] Menunggu PostgreSQL tersedia..."
until npx prisma db push --skip-generate --accept-data-loss > /tmp/prisma-push.log 2>&1; do
  echo "[e-SIH] Database belum siap, mencoba lagi dalam 2 detik..."
  sleep 2
done
echo "[e-SIH] Skema database tersinkronisasi."

SEEDED=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.ref_ProgramKerja.count()
  .then((count) => { console.log(count); return prisma.\$disconnect(); })
  .catch((error) => { console.error(error.message); process.exit(1); });
" || true)

if [ "$SEEDED" = "0" ] || [ -z "$SEEDED" ]; then
  echo "[e-SIH] Database kosong, menjalankan seed..."
  node dist/prisma/seed.js
else
  echo "[e-SIH] Data sudah ada ($SEEDED program kerja), seed dilewati."
fi

exec node dist/src/server.js
