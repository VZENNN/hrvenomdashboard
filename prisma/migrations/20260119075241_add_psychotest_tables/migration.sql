-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'ESSAY', 'MOST_AND_LEAST');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'APPLICANT';

-- CreateTable
CREATE TABLE "PsychotestCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "timeLimit" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsychotestCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychotestQuestion" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "type" "QuestionType" NOT NULL DEFAULT 'ESSAY',
    "options" JSONB,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsychotestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychotestResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsychotestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PsychotestResult_userId_categoryId_key" ON "PsychotestResult"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "PsychotestQuestion" ADD CONSTRAINT "PsychotestQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PsychotestCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychotestResult" ADD CONSTRAINT "PsychotestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychotestResult" ADD CONSTRAINT "PsychotestResult_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PsychotestCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
