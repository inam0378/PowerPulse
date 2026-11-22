-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "machineCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "devices" INTEGER NOT NULL DEFAULT 1,
    "expires" TEXT,
    "phone" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "key" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "License_machineCode_idx" ON "License"("machineCode");

-- CreateIndex
CREATE INDEX "License_createdAt_idx" ON "License"("createdAt");
