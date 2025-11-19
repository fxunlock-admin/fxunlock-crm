import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInactiveAffiliateAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Calculate date 6 weeks ago
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    // Get all affiliates (admins see all, staff see only their managed)
    const affiliates = await prisma.affiliate.findMany({
      where: userRole === 'ADMIN' ? {} : { managerId: userId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        commissions: {
          where: {
            createdAt: {
              gte: sixWeeksAgo,
            },
          },
          select: {
            id: true,
          },
        },
        affiliateNotes: {
          where: {
            createdAt: {
              gte: sixWeeksAgo,
            },
          },
          select: {
            id: true,
          },
        },
        appointments: {
          where: {
            createdAt: {
              gte: sixWeeksAgo,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Filter affiliates with no activity in the last 6 weeks
    const inactiveAlerts = affiliates
      .filter((affiliate) => {
        const hasCommissions = affiliate.commissions.length > 0;
        const hasNotes = affiliate.affiliateNotes.length > 0;
        const hasAppointments = affiliate.appointments.length > 0;

        // Alert if ANY of these are missing
        return !hasCommissions || !hasNotes || !hasAppointments;
      })
      .map((affiliate) => {
        const hasCommissions = affiliate.commissions.length > 0;
        const hasNotes = affiliate.affiliateNotes.length > 0;
        const hasAppointments = affiliate.appointments.length > 0;

        const missingItems = [];
        if (!hasCommissions) missingItems.push('Revenue/Commission');
        if (!hasNotes) missingItems.push('Notes');
        if (!hasAppointments) missingItems.push('Meetings/Appointments');

        return {
          affiliateId: affiliate.id,
          affiliateName: affiliate.name,
          managerId: affiliate.managerId,
          managerName: `${affiliate.manager.firstName} ${affiliate.manager.lastName}`,
          missingItems,
          lastUpdated: affiliate.updatedAt,
        };
      });

    res.json(inactiveAlerts);
  } catch (error) {
    console.error('Error fetching inactive affiliate alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};
