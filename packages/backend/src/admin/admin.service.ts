import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus, DealStatus, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllUsers(filters?: { role?: UserRole; status?: UserStatus }) {
    return this.prisma.user.findMany({
      where: filters,
      include: {
        profile: true,
        brokerProfile: true,
        _count: {
          select: {
            dealRequests: true,
            bids: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async verifyUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.VERIFIED },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'VERIFY_USER',
      entity: 'User',
      entityId: userId,
      details: { verifiedUser: user.email },
    });

    return updated;
  }

  async suspendUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'SUSPEND_USER',
      entity: 'User',
      entityId: userId,
      details: { suspendedUser: user.email },
    });

    return updated;
  }

  async rejectUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.REJECTED },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'REJECT_USER',
      entity: 'User',
      entityId: userId,
      details: { rejectedUser: user.email },
    });

    return updated;
  }

  async getAllDeals(filters?: { status?: DealStatus }) {
    return this.prisma.dealRequest.findMany({
      where: filters,
      include: {
        affiliate: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: true,
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async closeDeal(dealId: string, adminId: string) {
    const deal = await this.prisma.dealRequest.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const updated = await this.prisma.dealRequest.update({
      where: { id: dealId },
      data: { status: DealStatus.CLOSED },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'CLOSE_DEAL',
      entity: 'DealRequest',
      entityId: dealId,
      details: { dealTitle: deal.title },
    });

    return updated;
  }

  async getAuditLogs(filters?: { userId?: string; entity?: string; action?: string }) {
    return this.auditService.findAll(filters);
  }

  async getStats() {
    const [
      totalUsers,
      totalAffiliates,
      totalBrokers,
      pendingUsers,
      verifiedUsers,
      totalDeals,
      openDeals,
      acceptedDeals,
      totalBids,
      totalConnections,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'AFFILIATE' } }),
      this.prisma.user.count({ where: { role: 'BROKER' } }),
      this.prisma.user.count({ where: { status: UserStatus.PENDING } }),
      this.prisma.user.count({ where: { status: UserStatus.VERIFIED } }),
      this.prisma.dealRequest.count(),
      this.prisma.dealRequest.count({ where: { status: DealStatus.OPEN } }),
      this.prisma.dealRequest.count({ where: { status: DealStatus.ACCEPTED } }),
      this.prisma.bid.count(),
      this.prisma.connection.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        affiliates: totalAffiliates,
        brokers: totalBrokers,
        pending: pendingUsers,
        verified: verifiedUsers,
      },
      deals: {
        total: totalDeals,
        open: openDeals,
        accepted: acceptedDeals,
      },
      bids: {
        total: totalBids,
      },
      connections: {
        total: totalConnections,
      },
    };
  }
}
