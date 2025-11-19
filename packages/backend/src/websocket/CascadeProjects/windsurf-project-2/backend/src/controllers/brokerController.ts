import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/auditLog';

const prisma = new PrismaClient();

export const getBrokers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isActive, search } = req.query;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { accountManager: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const brokers = await prisma.broker.findMany({
      where,
      include: {
        _count: {
          select: {
            affiliates: true,
            commissions: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(brokers);
  } catch (error) {
    console.error('Get brokers error:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
};

export const getBroker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const broker = await prisma.broker.findUnique({
      where: { id },
      include: {
        affiliates: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            dealType: true,
          },
        },
        _count: {
          select: {
            commissions: true,
          },
        },
      },
    });

    if (!broker) {
      throw new AppError('Broker not found', 404);
    }

    res.json(broker);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get broker error:', error);
      res.status(500).json({ error: 'Failed to fetch broker' });
    }
  }
};

export const createBroker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const {
      name,
      accountManager,
      contactEmail,
      contactPhone,
      agreementDate,
      renewalDate,
      dealTypes,
      masterDealTerms,
      notes,
      isActive,
    } = req.body;

    if (!name) {
      throw new AppError('Broker name is required', 400);
    }

    const broker = await prisma.broker.create({
      data: {
        name,
        accountManager,
        contactEmail,
        contactPhone,
        agreementDate: agreementDate ? new Date(agreementDate) : null,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        dealTypes,
        masterDealTerms,
        notes,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'CREATE',
      entityType: 'BROKER',
      entityId: broker.id,
      changes: { created: broker },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json(broker);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create broker error:', error);
      res.status(500).json({ error: 'Failed to create broker' });
    }
  }
};

export const updateBroker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const updateData = req.body;

    console.log('Update broker request:', { id, updateData });

    const existingBroker = await prisma.broker.findUnique({
      where: { id },
    });

    if (!existingBroker) {
      throw new AppError('Broker not found', 404);
    }

    // Convert date strings to Date objects
    if (updateData.agreementDate) {
      updateData.agreementDate = new Date(updateData.agreementDate);
    }
    if (updateData.renewalDate) {
      updateData.renewalDate = new Date(updateData.renewalDate);
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData._count;

    console.log('Cleaned update data:', updateData);

    const broker = await prisma.broker.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            affiliates: true,
            commissions: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'UPDATE',
      entityType: 'BROKER',
      entityId: broker.id,
      changes: { before: existingBroker, after: broker },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(broker);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update broker error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to update broker', details: errorMessage });
    }
  }
};

export const deleteBroker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    const broker = await prisma.broker.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            affiliates: true,
          },
        },
      },
    });

    if (!broker) {
      throw new AppError('Broker not found', 404);
    }

    // Check if broker has affiliates
    if (broker._count.affiliates > 0) {
      throw new AppError(
        'Cannot delete broker with active affiliates. Please reassign or remove affiliates first.',
        400
      );
    }

    await prisma.broker.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'DELETE',
      entityType: 'BROKER',
      entityId: id,
      changes: { deleted: broker },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Broker deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete broker error:', error);
      res.status(500).json({ error: 'Failed to delete broker' });
    }
  }
};
