-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'APPLICATOR');

-- CreateEnum
CREATE TYPE "DiagnosticStatus" AS ENUM ('DRAFT', 'COMPLETE');

-- CreateEnum
CREATE TYPE "StudyPhase" AS ENUM ('PILOT', 'DEFINITIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'APPLICATOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstrumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnostic" (
    "id" TEXT NOT NULL,
    "businessCode" TEXT NOT NULL,
    "phase" "StudyPhase" NOT NULL DEFAULT 'PILOT',
    "status" "DiagnosticStatus" NOT NULL DEFAULT 'DRAFT',
    "consent" BOOLEAN NOT NULL,
    "consentText" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "instrumentId" TEXT NOT NULL,
    "applicatorId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Diagnostic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "diagnosticId" TEXT,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL,
    "topicCode" TEXT NOT NULL,
    "phase" "StudyPhase" NOT NULL,
    "instrumentVersion" TEXT NOT NULL,
    "finding" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "expectedProduct" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "resources" TEXT NOT NULL,
    "scheduledDate" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "baseline" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "verification" TEXT NOT NULL,
    "agreed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentVersion_version_key" ON "InstrumentVersion"("version");

-- CreateIndex
CREATE INDEX "Diagnostic_phase_status_idx" ON "Diagnostic"("phase", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnostic_businessCode_phase_instrumentId_key" ON "Diagnostic"("businessCode", "phase", "instrumentId");

-- CreateIndex
CREATE INDEX "AuditLog_diagnosticId_createdAt_idx" ON "AuditLog"("diagnosticId", "createdAt");

-- AddForeignKey
ALTER TABLE "Diagnostic" ADD CONSTRAINT "Diagnostic_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "InstrumentVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnostic" ADD CONSTRAINT "Diagnostic_applicatorId_fkey" FOREIGN KEY ("applicatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "Diagnostic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

