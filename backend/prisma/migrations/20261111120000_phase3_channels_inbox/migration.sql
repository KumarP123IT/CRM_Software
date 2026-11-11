-- DropIndex
DROP INDEX "ContactIdentity_workspaceId_channel_externalId_key";

-- AlterTable
ALTER TABLE "ChannelAccount" ADD COLUMN     "autoAssign" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ContactIdentity" ADD COLUMN     "channelAccountId" TEXT;

-- CreateIndex
CREATE INDEX "ContactIdentity_workspaceId_channel_externalId_idx" ON "ContactIdentity"("workspaceId", "channel", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactIdentity_workspaceId_channelAccountId_externalId_key" ON "ContactIdentity"("workspaceId", "channelAccountId", "externalId");

-- AddForeignKey
ALTER TABLE "ContactIdentity" ADD CONSTRAINT "ContactIdentity_channelAccountId_fkey" FOREIGN KEY ("channelAccountId") REFERENCES "ChannelAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
