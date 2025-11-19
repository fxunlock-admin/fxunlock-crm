import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateBidDto {
  @IsString()
  dealRequestId: string;

  // CPA fields
  @IsOptional()
  @IsArray()
  offeredCpaTiers?: any[];

  @IsOptional()
  @IsNumber()
  offeredLotsToQualifyCpa?: number;

  // Rebate fields
  @IsOptional()
  @IsNumber()
  offeredRebatePerLot?: number;

  // PnL fields
  @IsOptional()
  @IsNumber()
  offeredPnlPercentage?: number;

  // Legacy fields (for backward compatibility)
  @IsOptional()
  @IsNumber()
  offeredCommission?: number;

  @IsOptional()
  @IsNumber()
  offeredSpread?: number;

  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateBidDto {
  // CPA fields
  @IsOptional()
  @IsArray()
  offeredCpaTiers?: any[];

  @IsOptional()
  @IsNumber()
  offeredLotsToQualifyCpa?: number;

  // Rebate fields
  @IsOptional()
  @IsNumber()
  offeredRebatePerLot?: number;

  // PnL fields
  @IsOptional()
  @IsNumber()
  offeredPnlPercentage?: number;

  // Legacy fields
  @IsOptional()
  @IsNumber()
  offeredCommission?: number;

  @IsOptional()
  @IsNumber()
  offeredSpread?: number;

  @IsOptional()
  @IsString()
  message?: string;
}
