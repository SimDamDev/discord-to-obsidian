-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_servers" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitored_channels" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitored_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_messages" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "hasLinks" BOOLEAN NOT NULL DEFAULT false,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_links" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT,
    "domain" TEXT,
    "extractionMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extracted_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obsidian_notes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "messageId" TEXT,
    "linkId" TEXT,
    "tags" TEXT[],
    "githubCommitSha" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "obsidian_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT 'main',
    "accessToken" TEXT NOT NULL,
    "vaultPath" TEXT NOT NULL DEFAULT 'notes/',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "discord_servers_discordId_key" ON "discord_servers"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "discord_messages_discordId_key" ON "discord_messages"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "github_configs_userId_key" ON "github_configs"("userId");

-- AddForeignKey
ALTER TABLE "monitored_channels" ADD CONSTRAINT "monitored_channels_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "discord_servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitored_channels" ADD CONSTRAINT "monitored_channels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discord_messages" ADD CONSTRAINT "discord_messages_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "monitored_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_links" ADD CONSTRAINT "extracted_links_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "discord_messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obsidian_notes" ADD CONSTRAINT "obsidian_notes_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "discord_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obsidian_notes" ADD CONSTRAINT "obsidian_notes_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "extracted_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obsidian_notes" ADD CONSTRAINT "obsidian_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_configs" ADD CONSTRAINT "github_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
