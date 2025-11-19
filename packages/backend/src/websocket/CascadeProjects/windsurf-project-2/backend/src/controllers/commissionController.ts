import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/auditLog';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

export const getCommissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, affiliateId, brokerId, year, month } = req.query;

    const where: any = {};

    // Staff can only see commissions for affiliates they manage
    if (req.user?.role === 'STAFF') {
      where.affiliate = {
        managerId: req.user.userId,
      };
    }

    if (status) {
      where.status = status;
    }

    if (affiliateId) {
      where.affiliateId = affiliateId as string;
    }

    if (brokerId) {
      where.brokerId = brokerId as string;
    }

    if (year) {
      where.year = parseInt(year as string);
    }

    if (month) {
      where.month = parseInt(month as string);
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        broker: {
          select: {
            id: true,
            name: true,
          },
        },
        staffMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });

    res.json(commissions);
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
};

export const getCommission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const commission = await prisma.commission.findUnique({
      where: { id },
      include: {
        affiliate: true,
        broker: true,
      },
    });

    if (!commission) {
      throw new AppError('Commission not found', 404);
    }

    res.json(commission);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get commission error:', error);
      res.status(500).json({ error: 'Failed to fetch commission' });
    }
  }
};

export const createCommission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const {
      month,
      year,
      dealType,
      revenueAmount,
      status,
      paidDate,
      notes,
      affiliateId,
      brokerId,
      staffMemberId,
    } = req.body;

    // Validate required fields
    if (!month || !year || !dealType || revenueAmount === undefined || !affiliateId || !brokerId) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate month and year
    if (month < 1 || month > 12) {
      throw new AppError('Month must be between 1 and 12', 400);
    }

    if (year < 2000 || year > 2100) {
      throw new AppError('Invalid year', 400);
    }

    // Validate revenue amount
    if (revenueAmount < 0) {
      throw new AppError('Revenue amount cannot be negative', 400);
    }

    // Verify affiliate exists
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new AppError('Affiliate not found', 404);
    }

    // Verify broker exists
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
    });

    if (!broker) {
      throw new AppError('Broker not found', 404);
    }

    const commission = await prisma.commission.create({
      data: {
        month,
        year,
        dealType,
        revenueAmount,
        status: status || 'PENDING',
        paidDate: paidDate ? new Date(paidDate) : null,
        notes,
        affiliateId,
        brokerId,
        staffMemberId: staffMemberId || null,
      },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        broker: {
          select: {
            id: true,
            name: true,
          },
        },
        staffMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'CREATE',
      entityType: 'COMMISSION',
      entityId: commission.id,
      changes: { created: commission },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json(commission);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create commission error:', error);
      res.status(500).json({ error: 'Failed to create commission' });
    }
  }
};

export const bulkCreateCommissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { csvData } = req.body;

    if (!csvData) {
      throw new AppError('CSV data is required', 400);
    }

    // Parse CSV
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records || records.length === 0) {
      throw new AppError('No valid records found in CSV', 400);
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Validate required fields
        if (!record.affiliateEmail || !record.brokerName || !record.month || !record.year || !record.revenueAmount) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        // Find affiliate by email
        const affiliate = await prisma.affiliate.findUnique({
          where: { email: record.affiliateEmail },
        });

        if (!affiliate) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Affiliate not found with email ${record.affiliateEmail}`);
          continue;
        }

        // Find broker by name
        const broker = await prisma.broker.findFirst({
          where: { name: record.brokerName },
        });

        if (!broker) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Broker not found with name ${record.brokerName}`);
          continue;
        }

        // Create commission
        await prisma.commission.create({
          data: {
            month: parseInt(record.month),
            year: parseInt(record.year),
            dealType: record.dealType || affiliate.dealType,
            revenueAmount: parseFloat(record.revenueAmount),
            status: record.status || 'PENDING',
            paidDate: record.paidDate ? new Date(record.paidDate) : null,
            notes: record.notes || null,
            affiliateId: affiliate.id,
            brokerId: broker.id,
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'CREATE',
      entityType: 'COMMISSION',
      entityId: 'bulk-import',
      changes: { results },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(results);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Bulk create commissions error:', error);
      res.status(500).json({ error: 'Failed to bulk create commissions' });
    }
  }
};

export const updateCommission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const updateData = req.body;

    const existingCommission = await prisma.commission.findUnique({
      where: { id },
    });

    if (!existingCommission) {
      throw new AppError('Commission not found', 404);
    }

    // Validate revenue amount if being updated
    if (updateData.revenueAmount !== undefined && updateData.revenueAmount < 0) {
      throw new AppError('Revenue amount cannot be negative', 400);
    }

    // Convert date strings to Date objects
    if (updateData.paidDate) {
      updateData.paidDate = new Date(updateData.paidDate);
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: updateData,
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        broker: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'UPDATE',
      entityType: 'COMMISSION',
      entityId: commission.id,
      changes: { before: existingCommission, after: commission },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(commission);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update commission error:', error);
      res.status(500).json({ error: 'Failed to update commission' });
    }
  }
};

export const deleteCommission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    const commission = await prisma.commission.findUnique({
      where: { id },
    });

    if (!commission) {
      throw new AppError('Commission not found', 404);
    }

    await prisma.commission.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'DELETE',
      entityType: 'COMMISSION',
      entityId: id,
      changes: { deleted: commission },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Commission deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete commission error:', error);
      res.status(500).json({ error: 'Failed to delete commission' });
    }
  }
};
