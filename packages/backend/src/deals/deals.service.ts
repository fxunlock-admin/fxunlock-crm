import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DealStatus, UserRole } from '@prisma/client';
import { CreateDealDto, UpdateDealDto, FilterDealsDto } from './dto/deals.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(affiliateId: string, dto: CreateDealDto) {
    const deal = await this.prisma.dealRequest.create({
      data: {
        affiliateId,
        ...dto,
      },
      include: {
        affiliate: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    await this.auditService.log({
      userId: affiliateId,
      action: 'CREATE_DEAL',
      entity: 'DealRequest',
      entityId: deal.id,
      details: { title: deal.title },
    });

    return deal;
  }

  async findAll(filters: FilterDealsDto, userRole?: UserRole, userId?: string) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.region) {
      where.region = filters.region;
    }

    if (filters.instruments && filters.instruments.length > 0) {
      where.instruments = {
        hasSome: filters.instruments,
      };
    }

    // Affiliates can only see their own deals
    if (userRole === UserRole.AFFILIATE) {
      where.affiliateId = userId;
    }

    // Brokers can only see OPEN and IN_NEGOTIATION deals (not their own if they're also affiliates)
    if (userRole === UserRole.BROKER) {
      where.status = {
        in: [DealStatus.OPEN, DealStatus.IN_NEGOTIATION],
      };
    }

    const deals = await this.prisma.dealRequest.findMany({
      where,
      include: {
        affiliate: {
          select: {
            id: true,
            // Don't expose email or other PII for anonymity
            profile: {
              select: {
                companyName: true,
                country: true,
              },
            },
          },
        },
        bids: {
          select: {
            id: true,
            status: true,
            createdAt: true,
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

    // Redact affiliate info for brokers
    if (userRole === UserRole.BROKER) {
      return deals.map((deal) => ({
        ...deal,
        affiliate: {
          id: 'REDACTED',
          profile: deal.affiliate.profile,
        },
      }));
    }

    return deals;
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const deal = await this.prisma.dealRequest.findUnique({
      where: { id },
      include: {
        affiliate: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        bids: {
          include: {
            broker: {
              select: {
                id: true,
                email: true,
                brokerProfile: true,
              },
            },
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check permissions
    if (userRole === UserRole.AFFILIATE && deal.affiliateId !== userId) {
      throw new ForbiddenException('You can only view your own deals');
    }

    // Redact info based on role
    if (userRole === UserRole.BROKER && deal.status !== DealStatus.ACCEPTED) {
      return {
        ...deal,
        affiliate: {
          id: 'REDACTED',
          profile: deal.affiliate.profile,
        },
      };
    }

    return deal;
  }

  async update(id: string, affiliateId: string, dto: UpdateDealDto) {
    const deal = await this.findOne(id, affiliateId, UserRole.AFFILIATE);

    const updated = await this.prisma.dealRequest.update({
      where: { id },
      data: dto,
    });

    await this.auditService.log({
      userId: affiliateId,
      action: 'UPDATE_DEAL',
      entity: 'DealRequest',
      entityId: id,
      details: dto,
    });

    return updated;
  }

  async cancel(id: string, affiliateId: string) {
    const deal = await this.findOne(id, affiliateId, UserRole.AFFILIATE);

    const updated = await this.prisma.dealRequest.update({
      where: { id },
      data: {
        status: DealStatus.CANCELLED,
      },
    });

    await this.auditService.log({
      userId: affiliateId,
      action: 'CANCEL_DEAL',
      entity: 'DealRequest',
      entityId: id,
    });

    return updated;
  }

  async getMyDeals(affiliateId: string) {
    return this.prisma.dealRequest.findMany({
      where: {
        affiliateId,
      },
      include: {
        bids: {
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
}
