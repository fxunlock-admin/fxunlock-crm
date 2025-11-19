import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, BidStatus } from '@prisma/client';
import { CreateNegotiationDto } from './dto/negotiations.dto';
import { AuditService } from '../audit/audit.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class NegotiationsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(userId: string, userRole: UserRole, dto: CreateNegotiationDto) {
    // Verify bid exists
    const bid = await this.prisma.bid.findUnique({
      where: { id: dto.bidId },
      include: {
        dealRequest: true,
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Check permissions
    const fromAffiliate = userRole === UserRole.AFFILIATE;
    
    if (fromAffiliate && bid.dealRequest.affiliateId !== userId) {
      throw new ForbiddenException('You can only negotiate on your own deals');
    }

    if (!fromAffiliate && bid.brokerId !== userId) {
      throw new ForbiddenException('You can only negotiate on your own bids');
    }

    if (bid.status === BidStatus.ACCEPTED || bid.status === BidStatus.REJECTED || bid.status === BidStatus.WITHDRAWN) {
      throw new BadRequestException('Cannot negotiate on this bid');
    }

    const negotiation = await this.prisma.negotiation.create({
      data: {
        dealRequestId: bid.dealRequestId,
        bidId: dto.bidId,
        counterOffer: dto.counterOffer,
        message: dto.message,
        fromAffiliate,
      },
    });

    // Update bid status to COUNTERED
    await this.prisma.bid.update({
      where: { id: dto.bidId },
      data: { status: BidStatus.COUNTERED },
    });

    await this.auditService.log({
      userId,
      action: 'CREATE_NEGOTIATION',
      entity: 'Negotiation',
      entityId: negotiation.id,
      details: { bidId: dto.bidId },
    });

    // Notify the other party
    const notifyUserId = fromAffiliate ? bid.brokerId : bid.dealRequest.affiliateId;
    this.websocketGateway.notifyNewNegotiation(notifyUserId, negotiation);

    return negotiation;
  }

  async findByBid(bidId: string, userId: string, userRole: UserRole) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        dealRequest: true,
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Check permissions
    if (userRole === UserRole.AFFILIATE && bid.dealRequest.affiliateId !== userId) {
      throw new ForbiddenException('You can only view negotiations on your own deals');
    }

    if (userRole === UserRole.BROKER && bid.brokerId !== userId) {
      throw new ForbiddenException('You can only view negotiations on your own bids');
    }

    return this.prisma.negotiation.findMany({
      where: { bidId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
