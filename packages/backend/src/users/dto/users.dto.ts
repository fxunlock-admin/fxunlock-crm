import { IsEmail, IsString, IsEnum, IsOptional, IsArray, IsNumber } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateBrokerProfileDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  regulatoryLicense?: string;

  @IsOptional()
  @IsNumber()
  minTradeVolume?: number;

  @IsOptional()
  @IsNumber()
  maxTradeVolume?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredRegions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredInstruments?: string[];
}
