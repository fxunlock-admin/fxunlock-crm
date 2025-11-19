import { Module } from '@nestjs/common';
import { NegotiationsService } from './negotiations.service';
import { NegotiationsController } from './negotiations.controller';
import { AuditModule } from '../audit/audit.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [AuditModule, WebsocketModule],
  providers: [NegotiationsService],
  controllers: [NegotiationsController],
  exports: [NegotiationsService],
})
export class NegotiationsModule {}
