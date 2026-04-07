-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isReal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prerequisites" TEXT[];

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "school" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "modality" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "homeCountry" TEXT,
ADD COLUMN     "virginiaResident" BOOLEAN NOT NULL DEFAULT false;
