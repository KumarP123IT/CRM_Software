-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "widgetAllowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[];
