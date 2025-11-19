import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../utils/auditLog';
import { sendNewUserEmail } from '../utils/emailService';

const prisma = new PrismaClient();

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, isActive } = req.query;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        startDate: true,
        contractFile: true,
        salary: true,
        salaryCurrency: true,
        annualKpis: true,
        quarterlyKpis: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            managedAffiliates: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        quarterlyKpis: true,
        createdAt: true,
        updatedAt: true,
        managedAffiliates: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { email, password, firstName, lastName, role, isActive } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Missing required fields', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'STAFF',
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'CREATE',
      entityType: 'USER',
      entityId: user.id,
      changes: { created: { ...user, password: '[REDACTED]' } },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send welcome email with temporary password
    await sendNewUserEmail(email, firstName, lastName, password);

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const updateData: any = { ...req.body };

    // Remove password from update data if present (use separate endpoint)
    delete updateData.password;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new AppError('User with this email already exists', 400);
      }
    }

    // Only admins can change roles
    if (updateData.role && req.user.role !== 'ADMIN') {
      throw new AppError('Only admins can change user roles', 403);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        startDate: true,
        contractFile: true,
        salary: true,
        salaryCurrency: true,
        annualKpis: true,
        quarterlyKpis: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: user.id,
      changes: { before: existingUser, after: user },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.userId) {
      throw new AppError('Cannot delete your own account', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            managedAffiliates: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user has managed affiliates
    if (user._count.managedAffiliates > 0) {
      throw new AppError(
        'Cannot delete user with managed affiliates. Please reassign affiliates first.',
        400
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.userId,
      action: 'DELETE',
      entityType: 'USER',
      entityId: id,
      changes: { deleted: { ...user, password: '[REDACTED]' } },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};
