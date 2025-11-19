import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DealsModule } from './deals/deals.module';
import { BidsModule } from './bids/bids.module';
import { NegotiationsModule } from './negotiations/negotiations.module';
import { ConnectionsModule } from './connections/connections.module';
import { MessagesModule } from './messages/messages.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminModule } from './admin/admin.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DealsModule,
    BidsModule,
    NegotiationsModule,
    ConnectionsModule,
    MessagesModule,
    SubscriptionsModule,
    AdminModule,
    WebsocketModule,
    AuditModule,
  ],
})
export class AppModule {}
