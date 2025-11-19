import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateMessageDto } from './dto/messages.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(senderId: string, dto: CreateMessageDto) {
    // Verify connection exists and user is part of it
    const connection = await this.prisma.connection.findUnique({
      where: { id: dto.connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.affiliateId !== senderId && connection.brokerId !== senderId) {
      throw new ForbiddenException('You are not part of this connection');
    }

    const message = await this.prisma.message.create({
      data: {
        connectionId: dto.connectionId,
        senderId,
        content: dto.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    // Notify the other party
    const recipientId = senderId === connection.affiliateId ? connection.brokerId : connection.affiliateId;
    this.websocketGateway.notifyNewMessage(recipientId, message);

    return message;
  }

  async findByConnection(connectionId: string, userId: string, userRole: UserRole) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    // Check permissions
    if (userRole === UserRole.AFFILIATE && connection.affiliateId !== userId) {
      throw new ForbiddenException('You can only view messages in your own connections');
    }

    if (userRole === UserRole.BROKER && connection.brokerId !== userId) {
      throw new ForbiddenException('You can only view messages in your own connections');
    }

    return this.prisma.message.findMany({
      where: { connectionId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async markAsRead(connectionId: string, userId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.affiliateId !== userId && connection.brokerId !== userId) {
      throw new ForbiddenException('You are not part of this connection');
    }

    // Mark all messages in this connection as read (except sender's own messages)
    await this.prisma.message.updateMany({
      where: {
        connectionId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  }
}
