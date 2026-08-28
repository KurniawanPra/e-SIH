-- CreateTable
CREATE TABLE "ref_ProgramKerja" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "namaProgram" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tahun" INTEGER NOT NULL DEFAULT 2026,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ref_ProgramKerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ref_Item_ProgramKerja" (
    "id" TEXT NOT NULL,
    "programKerjaId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "namaItem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'On Progress',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "tahun" INTEGER NOT NULL DEFAULT 2026,
    "keterangan" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ref_Item_ProgramKerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "no" INTEGER NOT NULL,
    "idProgram" TEXT,
    "kategoriProgram" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "descriptionAction" TEXT,
    "startDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "closedDate" TEXT,
    "tindakLanjut" TEXT,
    "kendala" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "remarks" TEXT,
    "picEmail" TEXT NOT NULL,
    "picNama" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL DEFAULT 'Staff Operasional',
    "unit" TEXT NOT NULL DEFAULT 'IT & Sistem Operational',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "item" TEXT NOT NULL,
    "description" TEXT,
    "actionToBeTaken" TEXT,
    "namePic" TEXT,
    "targetDate" TEXT,
    "closedDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "remarks" TEXT,
    "authorId" TEXT,
    "programId" TEXT,
    "pics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdBy" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_no_key" ON "Activity"("no");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserProgram_programId_idx" ON "UserProgram"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgram_userId_programId_key" ON "UserProgram"("userId", "programId");

-- CreateIndex
CREATE INDEX "Highlight_bulan_tahun_idx" ON "Highlight"("bulan", "tahun");

-- CreateIndex
CREATE INDEX "Highlight_programId_idx" ON "Highlight"("programId");

-- CreateIndex
CREATE INDEX "Notification_isRead_createdAt_idx" ON "Notification"("isRead", "createdAt");

-- AddForeignKey
ALTER TABLE "ref_Item_ProgramKerja" ADD CONSTRAINT "ref_Item_ProgramKerja_programKerjaId_fkey" FOREIGN KEY ("programKerjaId") REFERENCES "ref_ProgramKerja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_idProgram_fkey" FOREIGN KEY ("idProgram") REFERENCES "ref_Item_ProgramKerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "ref_Item_ProgramKerja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_programId_fkey" FOREIGN KEY ("programId") REFERENCES "ref_Item_ProgramKerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

