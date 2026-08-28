-- Additive repair for deployments made with the original migration or db push.
-- Keep legacy User/UserProgram tables and their data; identity now comes from Portal.
BEGIN;

CREATE TABLE IF NOT EXISTS "ref_UserOverride" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,
    "programIds" JSONB,
    "isActive" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ref_UserOverride_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ref_UserOverride_userId_key" ON "ref_UserOverride"("userId");

CREATE TABLE IF NOT EXISTS "ref_Bagian" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ref_Bagian_pkey" PRIMARY KEY ("id")
);
INSERT INTO "ref_Bagian" ("id", "kode", "nama") VALUES
    ('bag-sistem', 'SISTEM', 'Sub Bagian Sistem'),
    ('bag-it', 'IT', 'Sub Bagian IT'),
    ('bag-hsse', 'HSSE', 'Sub Bagian HSSE')
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "ActivityAuditLog" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityAuditLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ActivityAuditLog_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ActivityAuditLog_activityId_changedAt_idx" ON "ActivityAuditLog"("activityId", "changedAt");

ALTER TABLE "Highlight" ADD COLUMN IF NOT EXISTS "bagian" TEXT;
-- authorId is a Portal subject, not an ID in the legacy User table.
ALTER TABLE "Highlight" DROP CONSTRAINT IF EXISTS "Highlight_authorId_fkey";

COMMIT;
