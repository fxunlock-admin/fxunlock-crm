import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateNegotiationDto {
  @IsString()
  bidId: string;

  @IsObject()
  counterOffer: any;

  @IsOptional()
  @IsString()
  message?: string;
}
