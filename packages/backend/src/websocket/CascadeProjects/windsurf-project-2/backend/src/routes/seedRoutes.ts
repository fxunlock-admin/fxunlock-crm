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

    // First, create the users table if it doesn't exist
    try {
      console.log('Creating users table...');
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'STAFF',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "startDate" TIMESTAMP,
          "contractFile" TEXT,
          "salary" DOUBLE PRECISION,
          "salaryCurrency" TEXT,
          "annualKpis" TEXT,
          "quarterlyKpis" TEXT,
          "monthlyKpis" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Users table created/verified');
    } catch (e) {
      console.log('Table creation attempt:', e);
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@fxunlock.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      },
    }).catch(async (err: any) => {
      if (err.code === 'P2002') {
        console.log('Admin user already exists');
        return await prisma.user.findUnique({
          where: { email: 'admin@fxunlock.com' }
        });
      }
      throw err;
    });
    
    console.log('✅ Created admin user:', admin?.email);

    res.json({ 
      message: 'Database seeded successfully!',
      admin: admin?.email
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database', details: String(error) });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
