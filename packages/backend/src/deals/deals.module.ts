import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [DealsService],
  controllers: [DealsController],
  exports: [DealsService],
})
export class DealsModule {}
