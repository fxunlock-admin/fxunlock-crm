import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { AuditModule } from '../audit/audit.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [AuditModule, WebsocketModule],
  providers: [BidsService],
  controllers: [BidsController],
  exports: [BidsService],
})
export class BidsModule {}
