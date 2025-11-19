-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('AFFILIATE', 'BROKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('OPEN', 'IN_NEGOTIATION', 'ACCEPTED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "website" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "regulatoryLicense" TEXT,
    "minTradeVolume" DOUBLE PRECISION,
    "maxTradeVolume" DOUBLE PRECISION,
    "preferredRegions" TEXT[],
    "preferredInstruments" TEXT[],
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStartDate" TIMESTAMP(3),
    "subscriptionEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealRequest" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetCommission" DOUBLE PRECISION NOT NULL,
    "targetSpread" DOUBLE PRECISION,
    "expectedVolume" DOUBLE PRECISION NOT NULL,
    "region" TEXT NOT NULL,
    "instruments" TEXT[],
    "additionalTerms" TEXT,
    "status" "DealStatus" NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "dealRequestId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "offeredCommission" DOUBLE PRECISION NOT NULL,
    "offeredSpread" DOUBLE PRECISION,
    "message" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" TEXT NOT NULL,
    "dealRequestId" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "counterOffer" JSONB NOT NULL,
    "message" TEXT,
    "fromAffiliate" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Negotiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "dealRequestId" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "finalTerms" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerProfile_userId_key" ON "BrokerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerProfile_stripeCustomerId_key" ON "BrokerProfile"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerProfile_stripeSubscriptionId_key" ON "BrokerProfile"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "BrokerProfile_subscriptionStatus_idx" ON "BrokerProfile"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "BrokerProfile_stripeCustomerId_idx" ON "BrokerProfile"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "DealRequest_affiliateId_idx" ON "DealRequest"("affiliateId");

-- CreateIndex
CREATE INDEX "DealRequest_status_idx" ON "DealRequest"("status");

-- CreateIndex
CREATE INDEX "DealRequest_createdAt_idx" ON "DealRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Bid_dealRequestId_idx" ON "Bid"("dealRequestId");

-- CreateIndex
CREATE INDEX "Bid_brokerId_idx" ON "Bid"("brokerId");

-- CreateIndex
CREATE INDEX "Bid_status_idx" ON "Bid"("status");

-- CreateIndex
CREATE INDEX "Bid_createdAt_idx" ON "Bid"("createdAt");

-- CreateIndex
CREATE INDEX "Negotiation_dealRequestId_idx" ON "Negotiation"("dealRequestId");

-- CreateIndex
CREATE INDEX "Negotiation_bidId_idx" ON "Negotiation"("bidId");

-- CreateIndex
CREATE INDEX "Negotiation_createdAt_idx" ON "Negotiation"("createdAt");

-- CreateIndex
CREATE INDEX "Connection_dealRequestId_idx" ON "Connection"("dealRequestId");

-- CreateIndex
CREATE INDEX "Connection_affiliateId_idx" ON "Connection"("affiliateId");

-- CreateIndex
CREATE INDEX "Connection_brokerId_idx" ON "Connection"("brokerId");

-- CreateIndex
CREATE INDEX "Connection_createdAt_idx" ON "Connection"("createdAt");

-- CreateIndex
CREATE INDEX "Message_connectionId_idx" ON "Message"("connectionId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerProfile" ADD CONSTRAINT "BrokerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealRequest" ADD CONSTRAINT "DealRequest_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_dealRequestId_fkey" FOREIGN KEY ("dealRequestId") REFERENCES "DealRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_dealRequestId_fkey" FOREIGN KEY ("dealRequestId") REFERENCES "DealRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_dealRequestId_fkey" FOREIGN KEY ("dealRequestId") REFERENCES "DealRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
