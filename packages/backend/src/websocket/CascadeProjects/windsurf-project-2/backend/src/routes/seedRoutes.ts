import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
let prisma: PrismaClient | null = null;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

// Seed database endpoint (for development/deployment only)
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const db = getPrisma();
    
    // Check if already seeded
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@fxunlock.com' }
    });
    
    if (existingAdmin) {
      return res.json({ message: 'Database already seeded' });
    }

    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await db.user.upsert({
      where: { email: 'admin@fxunlock.com' },
      update: {},
      create: {
        email: 'admin@fxunlock.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create staff user
    const staffPassword = await bcrypt.hash('Staff123!', 10);
    const staff = await db.user.upsert({
      where: { email: 'staff@fxunlock.com' },
      update: {},
      create: {
        email: 'staff@fxunlock.com',
        password: staffPassword,
        firstName: 'Staff',
        lastName: 'Member',
        role: 'STAFF',
        isActive: true,
      },
    });
    console.log('✅ Created staff user:', staff.email);

    // Create sample brokers
    const broker1 = await db.broker.upsert({
      where: { id: 'broker-1' },
      update: {},
      create: {
        id: 'broker-1',
        name: 'Global FX Trading',
        accountManager: 'John Smith',
        contactEmail: 'john@globalfx.com',
        contactPhone: '+1234567890',
        agreementDate: new Date('2024-01-01'),
        renewalDate: new Date('2025-01-01'),
        masterDealTerms: 'CPA: $500 per FTD\nIB: $8 per lot\nPnL: 25% revenue share',
        notes: 'Primary broker partner',
        isActive: true,
      },
    });
    console.log('✅ Created broker:', broker1.name);

    const broker2 = await db.broker.upsert({
      where: { id: 'broker-2' },
      update: {},
      create: {
        id: 'broker-2',
        name: 'Premium Markets Ltd',
        accountManager: 'Sarah Johnson',
        contactEmail: 'sarah@premiummarkets.com',
        contactPhone: '+9876543210',
        agreementDate: new Date('2024-03-15'),
        renewalDate: new Date('2025-03-15'),
        masterDealTerms: 'CPA: $600 per FTD\nIB: $10 per lot',
        notes: 'High-value partner for premium affiliates',
        isActive: true,
      },
    });
    console.log('✅ Created broker:', broker2.name);

    res.json({ 
      message: 'Database seeded successfully!',
      users: [admin.email, staff.email],
      brokers: [broker1.name, broker2.name]
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

export default router;
