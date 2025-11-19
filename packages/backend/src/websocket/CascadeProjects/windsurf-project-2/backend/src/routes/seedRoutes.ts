import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();

// Seed database endpoint (for development/deployment only)
router.post('/seed', async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Starting database seed...');

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
