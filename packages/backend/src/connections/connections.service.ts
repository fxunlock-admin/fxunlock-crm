import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ConnectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, userRole: UserRole) {
    const where: any = {};

    if (userRole === UserRole.AFFILIATE) {
      where.affiliateId = userId;
    } else if (userRole === UserRole.BROKER) {
      where.brokerId = userId;
    }

    return this.prisma.connection.findMany({
      where,
      include: {
        dealRequest: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        affiliate: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        broker: {
          select: {
            id: true,
            email: true,
            brokerProfile: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const connection = await this.prisma.connection.findUnique({
      where: { id },
      include: {
        dealRequest: true,
        affiliate: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        broker: {
          select: {
            id: true,
            email: true,
            brokerProfile: true,
          },
        },
        messages: {
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
        },
      },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    // Check permissions
    if (userRole === UserRole.AFFILIATE && connection.affiliateId !== userId) {
      throw new ForbiddenException('You can only view your own connections');
    }

    if (userRole === UserRole.BROKER && connection.brokerId !== userId) {
      throw new ForbiddenException('You can only view your own connections');
    }

    return connection;
  }
}
