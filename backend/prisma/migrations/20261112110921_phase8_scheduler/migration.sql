-- AlterTable
ALTER TABLE "AutoReply" ADD COLUMN     "delaySeconds" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CallReminder" ADD COLUMN     "notifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "slaBreachedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "autoCloseMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slaMinutes" INTEGER NOT NULL DEFAULT 15;
