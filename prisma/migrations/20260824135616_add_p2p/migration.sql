-- CreateEnum
CREATE TYPE "P2POfferStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "P2POffer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" "OrderSide" NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "fiatCurrency" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "notes" TEXT,
    "status" "P2POfferStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "P2POffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "P2PThread" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "P2PThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "P2PMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "P2PMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "P2POffer_userId_idx" ON "P2POffer"("userId");

-- CreateIndex
CREATE INDEX "P2POffer_status_idx" ON "P2POffer"("status");

-- CreateIndex
CREATE INDEX "P2PThread_ownerId_idx" ON "P2PThread"("ownerId");

-- CreateIndex
CREATE INDEX "P2PThread_counterpartyId_idx" ON "P2PThread"("counterpartyId");

-- CreateIndex
CREATE UNIQUE INDEX "P2PThread_offerId_counterpartyId_key" ON "P2PThread"("offerId", "counterpartyId");

-- CreateIndex
CREATE INDEX "P2PMessage_threadId_idx" ON "P2PMessage"("threadId");

-- AddForeignKey
ALTER TABLE "P2POffer" ADD CONSTRAINT "P2POffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "P2PThread" ADD CONSTRAINT "P2PThread_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "P2POffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "P2PThread" ADD CONSTRAINT "P2PThread_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "P2PThread" ADD CONSTRAINT "P2PThread_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "P2PMessage" ADD CONSTRAINT "P2PMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "P2PThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "P2PMessage" ADD CONSTRAINT "P2PMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
