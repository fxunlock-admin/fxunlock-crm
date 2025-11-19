-- AlterTable
ALTER TABLE "DealRequest" ADD COLUMN     "cpaTiers" JSONB,
ADD COLUMN     "expectedRoi" DOUBLE PRECISION,
ADD COLUMN     "expectedVolumeInLots" DOUBLE PRECISION,
ADD COLUMN     "ftdsPerMonth" INTEGER,
ADD COLUMN     "netDepositsPerMonth" DOUBLE PRECISION,
ADD COLUMN     "pnlPercentage" DOUBLE PRECISION,
ADD COLUMN     "proofOfStatsUrl" TEXT,
ADD COLUMN     "rebatePerLot" DOUBLE PRECISION,
ALTER COLUMN "targetCommission" DROP NOT NULL,
ALTER COLUMN "expectedVolume" DROP NOT NULL;
