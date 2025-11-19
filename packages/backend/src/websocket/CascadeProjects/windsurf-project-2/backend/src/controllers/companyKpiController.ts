import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Helper function to calculate quarter from month
const getQuarter = (month: number): number => {
  return Math.ceil(month / 3);
};

export const getCompanyKpis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Only admins can view company KPIs', 403);
    }

    const { year } = req.query;
    const where: any = {};

    if (year) {
      where.year = parseInt(year as string);
    }

    const kpis = await prisma.companyKpi.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });

    res.json(kpis);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get company KPIs error:', error);
      res.status(500).json({ error: 'Failed to fetch company KPIs' });
    }
  }
};

export const createCompanyKpi = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Only admins can create company KPIs', 403);
    }

    const {
      year,
      month,
      targetRevenue,
      targetAffiliates,
      targetCommissions,
      notes,
    } = req.body;

    if (!year || !month || targetRevenue === undefined || targetAffiliates === undefined) {
      throw new AppError('Missing required fields', 400);
    }

    if (month < 1 || month > 12) {
      throw new AppError('Month must be between 1 and 12', 400);
    }

    const quarter = getQuarter(month);

    const kpi = await prisma.companyKpi.create({
      data: {
        year,
        month,
        quarter,
        targetRevenue,
        targetAffiliates,
        targetCommissions: targetCommissions || 0,
        notes: notes || null,
      },
    });

    res.status(201).json(kpi);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create company KPI error:', error);
      res.status(500).json({ error: 'Failed to create company KPI' });
    }
  }
};

export const updateCompanyKpi = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Only admins can update company KPIs', 403);
    }

    const { id } = req.params;
    const {
      targetRevenue,
      targetAffiliates,
      targetCommissions,
      notes,
    } = req.body;

    const existingKpi = await prisma.companyKpi.findUnique({
      where: { id },
    });

    if (!existingKpi) {
      throw new AppError('Company KPI not found', 404);
    }

    const kpi = await prisma.companyKpi.update({
      where: { id },
      data: {
        targetRevenue: targetRevenue !== undefined ? targetRevenue : existingKpi.targetRevenue,
        targetAffiliates: targetAffiliates !== undefined ? targetAffiliates : existingKpi.targetAffiliates,
        targetCommissions: targetCommissions !== undefined ? targetCommissions : existingKpi.targetCommissions,
        notes: notes !== undefined ? notes : existingKpi.notes,
      },
    });

    res.json(kpi);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update company KPI error:', error);
      res.status(500).json({ error: 'Failed to update company KPI' });
    }
  }
};

export const deleteCompanyKpi = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Only admins can delete company KPIs', 403);
    }

    const { id } = req.params;

    const kpi = await prisma.companyKpi.findUnique({
      where: { id },
    });

    if (!kpi) {
      throw new AppError('Company KPI not found', 404);
    }

    await prisma.companyKpi.delete({
      where: { id },
    });

    res.json({ message: 'Company KPI deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete company KPI error:', error);
      res.status(500).json({ error: 'Failed to delete company KPI' });
    }
  }
};

export const updateCompanyKpiActuals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Only admins can update company KPI actuals', 403);
    }

    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    // Get all KPIs for the year
    const yearKpis = await prisma.companyKpi.findMany({
      where: { year: targetYear },
      orderBy: { month: 'asc' },
    });

    // Update each month's actual revenue from commissions
    for (const kpi of yearKpis) {
      // Get commissions for this month and year
      const commissions = await prisma.commission.findMany({
        where: {
          year: targetYear,
          month: kpi.month,
        },
      });

      // Calculate actual revenue
      const actualRevenue = commissions.reduce((sum, c) => sum + c.revenueAmount, 0);

      // Count actual affiliates (unique staff members with commissions this month)
      const affiliateIds = new Set(
        commissions
          .filter(c => c.staffMemberId)
          .map(c => c.staffMemberId)
      );

      // Update the KPI with actual values
      await prisma.companyKpi.update({
        where: { id: kpi.id },
        data: {
          actualRevenue,
          actualAffiliates: affiliateIds.size,
          actualCommissions: commissions.length,
        },
      });
    }

    // Return updated KPIs
    const updatedKpis = await prisma.companyKpi.findMany({
      where: { year: targetYear },
      orderBy: { month: 'asc' },
    });

    res.json(updatedKpis);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update company KPI actuals error:', error);
      res.status(500).json({ error: 'Failed to update company KPI actuals' });
    }
  }
};

export const getCompanyKpiSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Only admins can view company KPI summary', 403);
    }

    const { year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    // First, update actuals from commissions
    const yearKpis = await prisma.companyKpi.findMany({
      where: { year: currentYear },
      orderBy: { month: 'asc' },
    });

    // Update each month's actual revenue from commissions
    for (const kpi of yearKpis) {
      const commissions = await prisma.commission.findMany({
        where: {
          year: currentYear,
          month: kpi.month,
        },
      });

      const actualRevenue = commissions.reduce((sum, c) => sum + c.revenueAmount, 0);
      const affiliateIds = new Set(
        commissions
          .filter(c => c.staffMemberId)
          .map(c => c.staffMemberId)
      );

      await prisma.companyKpi.update({
        where: { id: kpi.id },
        data: {
          actualRevenue,
          actualAffiliates: affiliateIds.size,
          actualCommissions: commissions.length,
        },
      });
    }

    // Get all KPIs for the year (now with updated actuals)
    const updatedYearKpis = await prisma.companyKpi.findMany({
      where: { year: currentYear },
      orderBy: { month: 'asc' },
    });

    // Calculate quarterly summaries
    const quarterlySummary = [1, 2, 3, 4].map(quarter => {
      const monthsInQuarter = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ][quarter - 1];

      const quarterKpis = updatedYearKpis.filter(kpi => monthsInQuarter.includes(kpi.month));

      return {
        quarter,
        targetRevenue: quarterKpis.reduce((sum, kpi) => sum + kpi.targetRevenue, 0),
        actualRevenue: quarterKpis.reduce((sum, kpi) => sum + kpi.actualRevenue, 0),
        targetAffiliates: quarterKpis.reduce((sum, kpi) => sum + kpi.targetAffiliates, 0),
        actualAffiliates: quarterKpis.reduce((sum, kpi) => sum + kpi.actualAffiliates, 0),
        targetCommissions: quarterKpis.reduce((sum, kpi) => sum + kpi.targetCommissions, 0),
        actualCommissions: quarterKpis.reduce((sum, kpi) => sum + kpi.actualCommissions, 0),
      };
    });

    // Calculate annual summary
    const annualSummary = {
      year: currentYear,
      targetRevenue: updatedYearKpis.reduce((sum, kpi) => sum + kpi.targetRevenue, 0),
      actualRevenue: updatedYearKpis.reduce((sum, kpi) => sum + kpi.actualRevenue, 0),
      targetAffiliates: updatedYearKpis.reduce((sum, kpi) => sum + kpi.targetAffiliates, 0),
      actualAffiliates: updatedYearKpis.reduce((sum, kpi) => sum + kpi.actualAffiliates, 0),
      targetCommissions: updatedYearKpis.reduce((sum, kpi) => sum + kpi.targetCommissions, 0),
      actualCommissions: updatedYearKpis.reduce((sum, kpi) => sum + kpi.actualCommissions, 0),
    };

    res.json({
      monthly: updatedYearKpis,
      quarterly: quarterlySummary,
      annual: annualSummary,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get company KPI summary error:', error);
      res.status(500).json({ error: 'Failed to fetch company KPI summary' });
    }
  }
};
