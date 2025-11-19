-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('CPA', 'REBATES', 'HYBRID', 'PNL');

-- AlterTable
ALTER TABLE "DealRequest" ADD COLUMN     "dealType" "DealType" NOT NULL DEFAULT 'REBATES';
