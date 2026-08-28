#!/bin/sh
set -eu

# Fail startup when a migration fails; never silently run against an incomplete schema.
echo "[e-SIH] Applying versioned database migrations..."
node scripts/prisma.cjs migrate deploy

# Seeding is an explicit operator action, never a production startup side effect.
exec node dist/src/server.js
