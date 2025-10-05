-- CreateTable
CREATE TABLE "onboarding_configurations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "authAndConsent" JSONB,
    "selectedVersion" TEXT,
    "configuration" JSONB,
    "channelSelection" JSONB,
    "obsidianConfig" JSONB,
    "finalConfiguration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_configurations_userId_key" ON "onboarding_configurations"("userId");

-- AddForeignKey
ALTER TABLE "onboarding_configurations" ADD CONSTRAINT "onboarding_configurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
