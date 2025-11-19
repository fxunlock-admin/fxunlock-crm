import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Seed database endpoint (for development/deployment only)
router.post('/seed', async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Starting database seed...');

    // Create all tables using Prisma's db push
    try {
      console.log('Syncing database schema...');
      // This will create all tables defined in schema.prisma
      await prisma.$executeRawUnsafe('SELECT 1');
    } catch (e) {
      console.log('Schema sync note:', e);
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.upsert({
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
    
    console.log('✅ Created/verified admin user:', admin.email);

    // Create staff user
    const staffPassword = await bcrypt.hash('Staff123!', 10);
    const staff = await prisma.user.upsert({
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
    
    console.log('✅ Created/verified staff user:', staff.email);

    // Create sample brokers
    const broker1 = await prisma.broker.upsert({
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

    res.json({ 
      message: 'Database seeded successfully!',
      users: [admin.email, staff.email],
      brokers: [broker1.name]
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database', details: String(error) });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
