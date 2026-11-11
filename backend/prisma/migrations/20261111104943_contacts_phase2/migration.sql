-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "notes" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ContactGroup" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'static',
ADD COLUMN     "rules" JSONB;
