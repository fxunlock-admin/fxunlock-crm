import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { affiliateId, upcoming } = req.query;

    const where: any = {};
    
    if (affiliateId) {
      where.affiliateId = affiliateId as string;
    }

    // Filter by user role - always filter by userId for non-admin users
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.userId;
    } else if (!affiliateId) {
      // Admin can see all if no specific affiliate is requested
      // but if affiliateId is specified, show only that affiliate's appointments
    }

    // Filter upcoming appointments
    if (upcoming === 'true') {
      where.scheduledAt = {
        gte: new Date(),
      };
      where.status = 'SCHEDULED';
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    res.json(appointments);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get appointments error:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  }
};

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { title, appointmentType, scheduledAt, notes, affiliateId } = req.body;

    if (!title || !appointmentType || !scheduledAt || !affiliateId) {
      throw new AppError('Missing required fields', 400);
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        appointmentType,
        scheduledAt: new Date(scheduledAt),
        notes,
        affiliateId,
        userId: req.user.userId,
      },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create appointment error:', error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const { title, appointmentType, scheduledAt, notes, status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(appointmentType && { appointmentType }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(appointment);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    await prisma.appointment.delete({
      where: { id },
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete appointment error:', error);
      res.status(500).json({ error: 'Failed to delete appointment' });
    }
  }
};
