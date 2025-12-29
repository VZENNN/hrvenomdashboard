-- AlterTable
ALTER TABLE "KpiCriteria" ADD COLUMN     "position" TEXT;

-- CreateTable
CREATE TABLE "VenomDivision" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenomDivision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenomCalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenomCalendarEvent_pkey" PRIMARY KEY ("id")
);
