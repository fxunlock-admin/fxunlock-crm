import { IsString, IsNumber, IsArray, IsOptional, IsEnum, IsDateString, IsInt } from 'class-validator';
import { DealStatus, DealType } from '@prisma/client';

export class CreateDealDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(DealType)
  dealType: DealType;

  // CPA specific fields
  @IsOptional()
  @IsInt()
  ftdsPerMonth?: number;

  @IsOptional()
  cpaTiers?: any; // JSON array

  @IsOptional()
  @IsNumber()
  expectedRoi?: number;

  // Rebate specific fields
  @IsOptional()
  @IsNumber()
  netDepositsPerMonth?: number;

  @IsOptional()
  @IsNumber()
  expectedVolumeInLots?: number;

  @IsOptional()
  @IsNumber()
  rebatePerLot?: number;

  // PnL specific fields
  @IsOptional()
  @IsNumber()
  pnlPercentage?: number;

  // Common fields
  @IsString()
  region: string;

  @IsArray()
  @IsString({ each: true })
  instruments: string[];

  @IsOptional()
  @IsString()
  proofOfStatsUrl?: string;

  @IsOptional()
  @IsString()
  additionalTerms?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DealType)
  dealType?: DealType;

  @IsOptional()
  @IsNumber()
  targetCommission?: number;

  @IsOptional()
  @IsNumber()
  targetSpread?: number;

  @IsOptional()
  @IsNumber()
  expectedVolume?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instruments?: string[];

  @IsOptional()
  @IsString()
  additionalTerms?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class FilterDealsDto {
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instruments?: string[];
}
