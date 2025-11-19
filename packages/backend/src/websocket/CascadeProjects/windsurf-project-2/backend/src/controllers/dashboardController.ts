import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Filter for staff - only show their managed affiliates
    const affiliateWhere = req.user?.role === 'STAFF' ? { managerId: req.user.userId } : {};
    const commissionWhere = req.user?.role === 'STAFF' ? { affiliate: { managerId: req.user.userId } } : {};

    const [
      totalAffiliates,
      activeAffiliates,
      totalBrokers,
      totalCommissions,
      pendingCommissions,
      totalRevenue,
      pendingRevenue,
    ] = await Promise.all([
      prisma.affiliate.count({ where: affiliateWhere }),
      prisma.affiliate.count({ where: { ...affiliateWhere, status: 'ACTIVE' } }),
      prisma.broker.count({ where: { isActive: true } }),
      prisma.commission.count({ where: commissionWhere }),
      prisma.commission.count({ where: { ...commissionWhere, status: 'PENDING' } }),
      prisma.commission.aggregate({
        where: commissionWhere,
        _sum: { revenueAmount: true },
      }),
      prisma.commission.aggregate({
        where: { ...commissionWhere, status: 'PENDING' },
        _sum: { revenueAmount: true },
      }),
    ]);

    res.json({
      totalAffiliates,
      activeAffiliates,
      totalBrokers,
      totalCommissions,
      pendingCommissions,
      totalRevenue: totalRevenue._sum.revenueAmount || 0,
      pendingRevenue: pendingRevenue._sum.revenueAmount || 0,
      paidRevenue: (totalRevenue._sum.revenueAmount || 0) - (pendingRevenue._sum.revenueAmount || 0),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getRevenueAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startYear, startMonth, endYear, endMonth, affiliateId, brokerId, managerId } = req.query;

    const where: any = {};

    // Staff can only see revenue for affiliates they manage
    if (req.user?.role === 'STAFF') {
      where.affiliate = {
        managerId: req.user.userId,
      };
    }

    if (affiliateId) {
      where.affiliateId = affiliateId as string;
    }

    if (brokerId) {
      where.brokerId = brokerId as string;
    }

    if (managerId && req.user?.role === 'ADMIN') {
      where.affiliate = {
        managerId: managerId as string,
      };
    }

    // Get monthly revenue data
    const commissions = await prisma.commission.findMany({
      where,
      select: {
        month: true,
        year: true,
        revenueAmount: true,
        dealType: true,
        status: true,
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
    });

    // Group by month/year
    const monthlyRevenue: { [key: string]: { total: number; paid: number; pending: number; byDealType: any } } = {};

    commissions.forEach((commission) => {
      const key = `${commission.year}-${String(commission.month).padStart(2, '0')}`;
      
      if (!monthlyRevenue[key]) {
        monthlyRevenue[key] = {
          total: 0,
          paid: 0,
          pending: 0,
          byDealType: { CPA: 0, IB: 0, PNL: 0 },
        };
      }

      monthlyRevenue[key].total += commission.revenueAmount;
      
      if (commission.status === 'PAID') {
        monthlyRevenue[key].paid += commission.revenueAmount;
      } else {
        monthlyRevenue[key].pending += commission.revenueAmount;
      }

      monthlyRevenue[key].byDealType[commission.dealType] += commission.revenueAmount;
    });

    // Convert to array format
    const revenueData = Object.entries(monthlyRevenue).map(([period, data]) => ({
      period,
      ...data,
    }));

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

export const getTopAffiliates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '10', year, month } = req.query;

    const where: any = {};

    if (year) {
      where.year = parseInt(year as string);
    }

    if (month) {
      where.month = parseInt(month as string);
    }

    // Get commissions grouped by affiliate
    const affiliateRevenue = await prisma.commission.groupBy({
      by: ['affiliateId'],
      where,
      _sum: {
        revenueAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          revenueAmount: 'desc',
        },
      },
      take: parseInt(limit as string),
    });

    // Get affiliate details
    const affiliateIds = affiliateRevenue.map((item) => item.affiliateId);
    const affiliates = await prisma.affiliate.findMany({
      where: {
        id: { in: affiliateIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        dealType: true,
        status: true,
        broker: {
          select: {
            id: true,
            name: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Combine data
    const topAffiliates = affiliateRevenue.map((item) => {
      const affiliate = affiliates.find((a) => a.id === item.affiliateId);
      return {
        affiliate,
        totalRevenue: item._sum.revenueAmount || 0,
        commissionCount: item._count.id,
      };
    });

    res.json(topAffiliates);
  } catch (error) {
    console.error('Get top affiliates error:', error);
    res.status(500).json({ error: 'Failed to fetch top affiliates' });
  }
};

export const getBrokerPerformance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;

    const where: any = {};

    if (year) {
      where.year = parseInt(year as string);
    }

    if (month) {
      where.month = parseInt(month as string);
    }

    // Get commissions grouped by broker
    const brokerRevenue = await prisma.commission.groupBy({
      by: ['brokerId'],
      where,
      _sum: {
        revenueAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          revenueAmount: 'desc',
        },
      },
    });

    // Get broker details
    const brokerIds = brokerRevenue.map((item) => item.brokerId);
    const brokers = await prisma.broker.findMany({
      where: {
        id: { in: brokerIds },
      },
      select: {
        id: true,
        name: true,
        accountManager: true,
        _count: {
          select: {
            affiliates: true,
          },
        },
      },
    });

    // Combine data
    const brokerPerformance = brokerRevenue.map((item) => {
      const broker = brokers.find((b) => b.id === item.brokerId);
      return {
        broker,
        totalRevenue: item._sum.revenueAmount || 0,
        commissionCount: item._count.id,
        affiliateCount: broker?._count.affiliates || 0,
      };
    });

    res.json(brokerPerformance);
  } catch (error) {
    console.error('Get broker performance error:', error);
    res.status(500).json({ error: 'Failed to fetch broker performance' });
  }
};

export const getStaffPerformance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;

    const where: any = {};

    if (year) {
      where.year = parseInt(year as string);
    }

    if (month) {
      where.month = parseInt(month as string);
    }

    // Get all staff users
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'ADMIN'] },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    // Get performance for each staff member
    const staffPerformance = await Promise.all(
      staffUsers.map(async (staff) => {
        const affiliateCount = await prisma.affiliate.count({
          where: { managerId: staff.id },
        });

        const activeAffiliateCount = await prisma.affiliate.count({
          where: {
            managerId: staff.id,
            status: 'ACTIVE',
          },
        });

        const revenue = await prisma.commission.aggregate({
          where: {
            ...where,
            staffMemberId: staff.id,
          },
          _sum: {
            revenueAmount: true,
          },
          _count: {
            id: true,
          },
        });

        return {
          staff,
          affiliateCount,
          activeAffiliateCount,
          totalRevenue: revenue._sum.revenueAmount || 0,
          commissionCount: revenue._count.id,
        };
      })
    );

    // Sort by total revenue
    staffPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json(staffPerformance);
  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({ error: 'Failed to fetch staff performance' });
  }
};

export const getStaffPerformanceDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { year } = req.query;
    const staffMemberId = req.user.userId;

    const where: any = { staffMemberId };

    if (year) {
      where.year = parseInt(year as string);
    }

    // Get affiliate count for this staff member
    const affiliateCount = await prisma.affiliate.count({
      where: { managerId: staffMemberId },
    });

    const activeAffiliateCount = await prisma.affiliate.count({
      where: {
        managerId: staffMemberId,
        status: 'ACTIVE',
      },
    });

    // Get revenue for this staff member
    const revenue = await prisma.commission.aggregate({
      where,
      _sum: {
        revenueAmount: true,
      },
      _count: {
        id: true,
      },
    });

    res.json({
      totalRevenue: revenue._sum.revenueAmount || 0,
      commissionCount: revenue._count.id,
      affiliateCount,
      activeAffiliateCount,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get staff performance detail error:', error);
      res.status(500).json({ error: 'Failed to fetch staff performance' });
    }
  }
};

export const getStaffMonthlyRevenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { year } = req.query;
    const staffMemberId = req.user.userId;

    const where: any = { staffMemberId };

    if (year) {
      where.year = parseInt(year as string);
    }

    // Get monthly revenue
    const monthlyData = await prisma.commission.groupBy({
      by: ['month', 'year'],
      where,
      _sum: {
        revenueAmount: true,
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
    });

    const result = monthlyData.map(item => ({
      month: item.month,
      year: item.year,
      revenue: item._sum.revenueAmount || 0,
    }));

    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get staff monthly revenue error:', error);
      res.status(500).json({ error: 'Failed to fetch staff monthly revenue' });
    }
  }
};
