-- AlterTable
ALTER TABLE "BrokerProfile" ADD COLUMN     "dealsAccepted" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "regulatedBy" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "yearsInBusiness" INTEGER,
ALTER COLUMN "companyName" DROP NOT NULL;
