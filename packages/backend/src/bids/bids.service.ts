import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BidStatus, DealStatus, UserRole, SubscriptionStatus } from '@prisma/client';
import { CreateBidDto, UpdateBidDto } from './dto/bids.dto';
import { AuditService } from '../audit/audit.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private websocketGateway: WebsocketGateway,
  ) {}

  async findAllByUser(userId: string, userRole: UserRole) {
    if (userRole === UserRole.BROKER) {
      // Return bids created by this broker
      return this.prisma.bid.findMany({
        where: { brokerId: userId },
        include: {
          dealRequest: {
            include: {
              affiliate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === UserRole.AFFILIATE) {
      // Return bids on deals created by this affiliate
      return this.prisma.bid.findMany({
        where: {
          dealRequest: {
            affiliateId: userId,
          },
        },
        include: {
          broker: true,
          dealRequest: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    
    return [];
  }

  async create(brokerId: string, dto: CreateBidDto) {
    // Check broker exists
    const broker = await this.prisma.user.findUnique({
      where: { id: brokerId },
      include: { brokerProfile: true },
    });

    if (!broker || broker.role !== UserRole.BROKER) {
      throw new ForbiddenException('Only brokers can create bids');
    }

    // Note: Subscription check disabled for testing/development
    // Uncomment below to enforce subscription requirement:
    // if (broker.brokerProfile?.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
    //   throw new ForbiddenException('Active subscription required to place bids');
    // }

    // Check deal exists and is open
    const deal = await this.prisma.dealRequest.findUnique({
      where: { id: dto.dealRequestId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (deal.status !== DealStatus.OPEN && deal.status !== DealStatus.IN_NEGOTIATION) {
      throw new BadRequestException('Deal is not accepting bids');
    }

    // Check if broker already has a bid on this deal
    const existingBid = await this.prisma.bid.findFirst({
      where: {
        dealRequestId: dto.dealRequestId,
        brokerId,
        status: {
          not: BidStatus.WITHDRAWN,
        },
      },
    });

    if (existingBid) {
      throw new BadRequestException('You already have an active bid on this deal');
    }

    const bid = await this.prisma.bid.create({
      data: {
        brokerId,
        ...dto,
      },
      include: {
        broker: {
          select: {
            id: true,
            brokerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
        dealRequest: true,
      },
    });

    // Update deal status to IN_NEGOTIATION
    await this.prisma.dealRequest.update({
      where: { id: dto.dealRequestId },
      data: { status: DealStatus.IN_NEGOTIATION },
    });

    await this.auditService.log({
      userId: brokerId,
      action: 'CREATE_BID',
      entity: 'Bid',
      entityId: bid.id,
      details: { dealRequestId: dto.dealRequestId },
    });

    // Notify affiliate via websocket
    this.websocketGateway.notifyNewBid(deal.affiliateId, bid);

    return bid;
  }

  async findByDeal(dealRequestId: string, userId: string, userRole: UserRole) {
    const deal = await this.prisma.dealRequest.findUnique({
      where: { id: dealRequestId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Only affiliate owner or admin can see all bids
    if (userRole === UserRole.AFFILIATE && deal.affiliateId !== userId) {
      throw new ForbiddenException('You can only view bids on your own deals');
    }

    // Brokers can only see their own bids
    const where: any = { dealRequestId };
    if (userRole === UserRole.BROKER) {
      where.brokerId = userId;
    }

    return this.prisma.bid.findMany({
      where,
      include: {
        broker: {
          select: {
            id: true,
            brokerProfile: {
              select: {
                companyName: true,
                regulatoryLicense: true,
              },
            },
          },
        },
        negotiations: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const bid = await this.prisma.bid.findUnique({
      where: { id },
      include: {
        broker: {
          select: {
            id: true,
            email: true,
            brokerProfile: true,
          },
        },
        dealRequest: {
          include: {
            affiliate: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        negotiations: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Check permissions
    if (userRole === UserRole.BROKER && bid.brokerId !== userId) {
      throw new ForbiddenException('You can only view your own bids');
    }

    if (userRole === UserRole.AFFILIATE && bid.dealRequest.affiliateId !== userId) {
      throw new ForbiddenException('You can only view bids on your own deals');
    }

    return bid;
  }

  async update(id: string, brokerId: string, dto: UpdateBidDto) {
    const bid = await this.findOne(id, brokerId, UserRole.BROKER);

    if (bid.status !== BidStatus.PENDING && bid.status !== BidStatus.COUNTERED) {
      throw new BadRequestException('Cannot update bid in current status');
    }

    const updated = await this.prisma.bid.update({
      where: { id },
      data: dto,
    });

    await this.auditService.log({
      userId: brokerId,
      action: 'UPDATE_BID',
      entity: 'Bid',
      entityId: id,
      details: dto,
    });

    // Notify affiliate
    this.websocketGateway.notifyBidUpdate(bid.dealRequest.affiliateId, updated);

    return updated;
  }

  async withdraw(id: string, brokerId: string) {
    const bid = await this.findOne(id, brokerId, UserRole.BROKER);

    if (bid.status === BidStatus.ACCEPTED) {
      throw new BadRequestException('Cannot withdraw accepted bid');
    }

    const updated = await this.prisma.bid.update({
      where: { id },
      data: { status: BidStatus.WITHDRAWN },
    });

    await this.auditService.log({
      userId: brokerId,
      action: 'WITHDRAW_BID',
      entity: 'Bid',
      entityId: id,
    });

    return updated;
  }

  async accept(id: string, affiliateId: string) {
    const bid = await this.findOne(id, affiliateId, UserRole.AFFILIATE);

    if (bid.status !== BidStatus.PENDING && bid.status !== BidStatus.COUNTERED) {
      throw new BadRequestException('Cannot accept bid in current status');
    }

    // Start transaction to accept bid and create connection
    const result = await this.prisma.$transaction(async (tx) => {
      // Update bid status
      const acceptedBid = await tx.bid.update({
        where: { id },
        data: { status: BidStatus.ACCEPTED },
      });

      // Update deal status
      await tx.dealRequest.update({
        where: { id: bid.dealRequestId },
        data: { status: DealStatus.ACCEPTED },
      });

      // Reject all other bids on this deal
      await tx.bid.updateMany({
        where: {
          dealRequestId: bid.dealRequestId,
          id: { not: id },
          status: { in: [BidStatus.PENDING, BidStatus.COUNTERED] },
        },
        data: { status: BidStatus.REJECTED },
      });

      // Create connection
      const connection = await tx.connection.create({
        data: {
          dealRequestId: bid.dealRequestId,
          affiliateId,
          brokerId: bid.brokerId,
          finalTerms: {
            commission: acceptedBid.offeredCommission,
            spread: acceptedBid.offeredSpread,
            message: acceptedBid.message,
          },
        },
        include: {
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
        },
      });

      return { bid: acceptedBid, connection };
    });

    await this.auditService.log({
      userId: affiliateId,
      action: 'ACCEPT_BID',
      entity: 'Bid',
      entityId: id,
      details: { connectionId: result.connection.id },
    });

    // Notify broker of acceptance
    this.websocketGateway.notifyBidAccepted(bid.brokerId, result);

    return result;
  }

  async reject(id: string, affiliateId: string) {
    const bid = await this.findOne(id, affiliateId, UserRole.AFFILIATE);

    const updated = await this.prisma.bid.update({
      where: { id },
      data: { status: BidStatus.REJECTED },
    });

    await this.auditService.log({
      userId: affiliateId,
      action: 'REJECT_BID',
      entity: 'Bid',
      entityId: id,
    });

    // Notify broker
    this.websocketGateway.notifyBidRejected(bid.brokerId, updated);

    return updated;
  }
}
