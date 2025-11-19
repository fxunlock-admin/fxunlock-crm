import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogData {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'AFFILIATE' | 'BROKER' | 'COMMISSION' | 'USER';
  entityId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (data: AuditLogData): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
