-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "offeredCpaTiers" JSONB,
ADD COLUMN     "offeredLotsToQualifyCpa" DOUBLE PRECISION,
ADD COLUMN     "offeredPnlPercentage" DOUBLE PRECISION,
ADD COLUMN     "offeredRebatePerLot" DOUBLE PRECISION,
ALTER COLUMN "offeredCommission" DROP NOT NULL;
