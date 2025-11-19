import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getAffiliateNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { affiliateId } = req.params;

    // Check if user has access to this affiliate
    if (req.user?.role === 'STAFF') {
      const affiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
      });

      if (!affiliate || affiliate.managerId !== req.user.userId) {
        throw new AppError('Access denied', 403);
      }
    }

    const notes = await prisma.affiliateNote.findMany({
      where: { affiliateId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (error) {
    console.error('Get affiliate notes error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch affiliate notes' });
    }
  }
};

export const createAffiliateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { affiliateId } = req.params;
    const { content, noteType } = req.body;

    if (!content) {
      throw new AppError('Note content is required', 400);
    }

    // Check if user has access to this affiliate
    if (req.user?.role === 'STAFF') {
      const affiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
      });

      if (!affiliate || affiliate.managerId !== req.user.userId) {
        throw new AppError('Access denied', 403);
      }
    }

    const note = await prisma.affiliateNote.create({
      data: {
        content,
        noteType: noteType || 'GENERAL',
        affiliateId,
        userId: req.user!.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create affiliate note error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create affiliate note' });
    }
  }
};

export const updateAffiliateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, noteType } = req.body;

    // Check if note exists and user has permission
    const existingNote = await prisma.affiliateNote.findUnique({
      where: { id },
      include: { affiliate: true },
    });

    if (!existingNote) {
      throw new AppError('Note not found', 404);
    }

    // Users can only edit their own notes, or admins can edit any
    if (req.user?.role !== 'ADMIN' && existingNote.userId !== req.user?.userId) {
      throw new AppError('Access denied', 403);
    }

    const note = await prisma.affiliateNote.update({
      where: { id },
      data: {
        content,
        noteType,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(note);
  } catch (error) {
    console.error('Update affiliate note error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update affiliate note' });
    }
  }
};

export const deleteAffiliateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if note exists and user has permission
    const existingNote = await prisma.affiliateNote.findUnique({
      where: { id },
    });

    if (!existingNote) {
      throw new AppError('Note not found', 404);
    }

    // Users can only delete their own notes, or admins can delete any
    if (req.user?.role !== 'ADMIN' && existingNote.userId !== req.user?.userId) {
      throw new AppError('Access denied', 403);
    }

    await prisma.affiliateNote.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete affiliate note error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete affiliate note' });
    }
  }
};
