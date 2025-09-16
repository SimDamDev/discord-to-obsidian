-- AlterTable
ALTER TABLE "public"."discord_servers" ADD COLUMN     "features" TEXT,
ADD COLUMN     "lastCached" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "permissions" TEXT;

-- CreateTable
CREATE TABLE "public"."discord_channels" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "position" INTEGER,
    "parentId" TEXT,
    "topic" TEXT,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "serverId" TEXT NOT NULL,
    "lastCached" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_channels_discordId_key" ON "public"."discord_channels"("discordId");

-- AddForeignKey
ALTER TABLE "public"."discord_channels" ADD CONSTRAINT "discord_channels_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."discord_servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
