import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/auditLog';

const prisma = new PrismaClient();

export const getAffiliates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, brokerId, managerId, search } = req.query;

    const where: any = {};

    // Staff can only see affiliates they manage
    if (req.user?.role === 'STAFF') {
      where.managerId = req.user.userId;
    }

    if (status) {
      where.status = status;
    }

    if (brokerId) {
      where.brokerId = brokerId as string;
    }

    if (managerId && req.user?.role === 'ADMIN') {
      where.managerId = managerId as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const affiliates = await prisma.affiliate.findMany({
      where,
      include: {
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
            email: true,
          },
        },
        _count: {
          select: {
            commissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(affiliates);
  } catch (error) {
    console.error('Get affiliates error:', error);
    res.status(500).json({ error: 'Failed to fetch affiliates' });
  }
};

export const getAffiliate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      include: {
        broker: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        commissions: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' },
          ],
          take: 12,
        },
      },
    });

    if (!affiliate) {
      throw new AppError('Affiliate not found', 404);
    }

    res.json(affiliate);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get affiliate error:', error);
      res.status(500).json({ error: 'Failed to fetch affiliate' });
    }
  }
};

export const createAffiliate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const fs = require('fs');
    fs.appendFileSync('/tmp/affiliate-debug.log', `\n\n=== ${new Date().toISOString()} ===\n`);
    fs.appendFileSync('/tmp/affiliate-debug.log', `Request body: ${JSON.stringify(req.body, null, 2)}\n`);
    
    console.log('Create affiliate request body:', JSON.stringify(req.body, null, 2));

    const {
      name,
      email,
      phone,
      address,
      region,
      country,
      trafficRegion,
      trafficTypes,
      dealType,
      dealTerms,
      dealDetails,
      status,
      startDate,
      renewalDate,
      source,
      website,
      instagram,
      telegram,
      x,
      notes,
      brokerId,
      managerId,
    } = req.body;

    // Validate required fields
    if (!name || !email || !dealType || !brokerId || !managerId) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if email already exists
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { email },
    });

    if (existingAffiliate) {
      throw new AppError('Affiliate with this email already exists', 400);
    }

    // Verify broker exists
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
    });

    if (!broker) {
      throw new AppError('Broker not found', 404);
    }

    // Verify manager exists
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new AppError('Manager not found', 404);
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        name,
        email,
        phone,
        address,
        region,
        country,
        trafficRegion,
        trafficTypes: trafficTypes || null,
        dealType,
        dealTerms,
        dealDetails,
        status: status || 'ACTIVE',
        startDate: startDate ? new Date(startDate) : new Date(),
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        source,
        website,
        instagram,
        telegram,
        x,
        notes,
        brokerId,
        managerId,
      },
      include: {
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
            email: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'CREATE',
      entityType: 'AFFILIATE',
      entityId: affiliate.id,
      changes: { created: affiliate },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json(affiliate);
  } catch (error) {
    const fs = require('fs');
    fs.appendFileSync('/tmp/affiliate-debug.log', `Error: ${error instanceof Error ? error.message : JSON.stringify(error)}\n`);
    fs.appendFileSync('/tmp/affiliate-debug.log', `Stack: ${error instanceof Error ? error.stack : 'No stack'}\n`);
    
    if (error instanceof AppError) {
      console.error('AppError creating affiliate:', error.message);
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create affiliate error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({ error: 'Failed to create affiliate', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
};

export const updateAffiliate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const updateData = req.body;

    console.log('Update affiliate request:', { id, updateData });

    // Get existing affiliate
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { id },
    });

    if (!existingAffiliate) {
      throw new AppError('Affiliate not found', 404);
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingAffiliate.email) {
      const emailExists = await prisma.affiliate.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new AppError('Affiliate with this email already exists', 400);
      }
    }

    // Verify broker if being updated
    if (updateData.brokerId) {
      const broker = await prisma.broker.findUnique({
        where: { id: updateData.brokerId },
      });

      if (!broker) {
        throw new AppError('Broker not found', 404);
      }
    }

    // Verify manager if being updated
    if (updateData.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: updateData.managerId },
      });

      if (!manager) {
        throw new AppError('Manager not found', 404);
      }
    }

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.renewalDate) {
      updateData.renewalDate = new Date(updateData.renewalDate);
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.broker;
    delete updateData.manager;
    delete updateData._count;

    console.log('Cleaned update data:', updateData);

    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: updateData,
      include: {
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
            email: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'UPDATE',
      entityType: 'AFFILIATE',
      entityId: affiliate.id,
      changes: { before: existingAffiliate, after: affiliate },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(affiliate);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update affiliate error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to update affiliate', details: errorMessage });
    }
  }
};

export const deleteAffiliate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
    });

    if (!affiliate) {
      throw new AppError('Affiliate not found', 404);
    }

    await prisma.affiliate.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'DELETE',
      entityType: 'AFFILIATE',
      entityId: id,
      changes: { deleted: affiliate },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Affiliate deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete affiliate error:', error);
      res.status(500).json({ error: 'Failed to delete affiliate' });
    }
  }
};
