import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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
  console.log('✅ Created admin user:', admin.email);

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
  console.log('✅ Created staff user:', staff.email);

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

  const broker2 = await prisma.broker.upsert({
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

  // Create sample affiliates
  const affiliate1 = await prisma.affiliate.upsert({
    where: { email: 'affiliate1@example.com' },
    update: {},
    create: {
      name: 'FX Education Hub',
      email: 'affiliate1@example.com',
      phone: '+1111111111',
      address: 'Dubai, UAE',
      region: 'MENA',
      trafficTypes: 'Social Media, YouTube, Blog',
      dealType: 'CPA',
      dealTerms: '$500 per FTD',
      status: 'ACTIVE',
      startDate: new Date('2024-01-15'),
      renewalDate: new Date('2025-01-15'),
      notes: 'Top performing affiliate with consistent quality traffic',
      brokerId: broker1.id,
      managerId: staff.id,
    },
  });
  console.log('✅ Created affiliate:', affiliate1.name);

  const affiliate2 = await prisma.affiliate.upsert({
    where: { email: 'affiliate2@example.com' },
    update: {},
    create: {
      name: 'Trading Signals Pro',
      email: 'affiliate2@example.com',
      phone: '+2222222222',
      address: 'London, UK',
      region: 'Europe',
      trafficTypes: 'Telegram, Discord, Website',
      dealType: 'IB',
      dealTerms: '$8 per lot',
      status: 'ACTIVE',
      startDate: new Date('2024-02-01'),
      renewalDate: new Date('2025-02-01'),
      notes: 'High volume IB partner',
      brokerId: broker1.id,
      managerId: admin.id,
    },
  });
  console.log('✅ Created affiliate:', affiliate2.name);

  const affiliate3 = await prisma.affiliate.upsert({
    where: { email: 'affiliate3@example.com' },
    update: {},
    create: {
      name: 'Forex Academy',
      email: 'affiliate3@example.com',
      phone: '+3333333333',
      address: 'Singapore',
      region: 'Asia',
      country: 'Singapore',
      trafficTypes: 'Online Courses, Webinars, Email Marketing',
      dealType: 'PNL',
      dealTerms: '25% revenue share',
      dealDetails: JSON.stringify({
        netDepositsPerMonth: 50000,
        pnlDealNeeded: '25% revenue share on net deposits',
      }),
      status: 'ACTIVE',
      startDate: new Date('2024-03-10'),
      renewalDate: new Date('2025-03-10'),
      notes: 'Educational platform with premium audience',
      brokerId: broker2.id,
      managerId: staff.id,
    },
  });
  console.log('✅ Created affiliate:', affiliate3.name);

  const affiliate4 = await prisma.affiliate.upsert({
    where: { email: 'affiliate4@example.com' },
    update: {},
    create: {
      name: 'Crypto Trading Network',
      email: 'affiliate4@example.com',
      phone: '+4444444444',
      address: 'New York, USA',
      region: 'North America',
      country: 'United States',
      dealType: 'CPA',
      dealTerms: '$600 per FTD with tiered structure',
      dealDetails: JSON.stringify({
        ftdsPerMonth: 25,
        cpaTiers: [
          { tierName: 'Tier 1', depositAmount: 250, cpaAmount: 400 },
          { tierName: 'Tier 2', depositAmount: 500, cpaAmount: 600 },
          { tierName: 'Tier 3', depositAmount: 1000, cpaAmount: 800 },
        ],
        expectedROI: 150,
      }),
      status: 'ACTIVE',
      startDate: new Date('2024-04-01'),
      renewalDate: new Date('2025-04-01'),
      notes: 'Crypto-focused affiliate with strong conversion rates',
      brokerId: broker2.id,
      managerId: admin.id,
    },
  });
  console.log('✅ Created affiliate:', affiliate4.name);

  const affiliate5 = await prisma.affiliate.upsert({
    where: { email: 'affiliate5@example.com' },
    update: {},
    create: {
      name: 'European Trading Partners',
      email: 'affiliate5@example.com',
      phone: '+5555555555',
      address: 'Paris, France',
      region: 'Europe',
      country: 'France',
      dealType: 'REBATES',
      dealTerms: '$12 per lot rebate',
      dealDetails: JSON.stringify({
        netDepositsPerMonth: 75000,
        expectedVolumePerMonth: 5000,
        rebatesPerLot: 12,
      }),
      status: 'ACTIVE',
      startDate: new Date('2024-05-15'),
      renewalDate: new Date('2025-05-15'),
      notes: 'High volume European partner',
      brokerId: broker1.id,
      managerId: staff.id,
    },
  });
  console.log('✅ Created affiliate:', affiliate5.name);

  const affiliate6 = await prisma.affiliate.upsert({
    where: { email: 'affiliate6@example.com' },
    update: {},
    create: {
      name: 'Global Traders Alliance',
      email: 'affiliate6@example.com',
      phone: '+6666666666',
      address: 'Sydney, Australia',
      region: 'Oceania',
      country: 'Australia',
      dealType: 'HYBRID',
      dealTerms: 'Hybrid: CPA + Rebates',
      dealDetails: JSON.stringify({
        netDepositsPerMonth: 100000,
        expectedVolumePerMonth: 8000,
        cpaTiers: [
          { tierName: 'Tier 1', depositAmount: 500, cpaAmount: 500 },
          { tierName: 'Tier 2', depositAmount: 1000, cpaAmount: 700 },
        ],
        rebatesPerLot: 10,
      }),
      status: 'ACTIVE',
      startDate: new Date('2024-06-01'),
      renewalDate: new Date('2025-06-01'),
      notes: 'Premium hybrid deal for high-performing partner',
      brokerId: broker2.id,
      managerId: admin.id,
    },
  });
  console.log('✅ Created affiliate:', affiliate6.name);

  const affiliate7 = await prisma.affiliate.upsert({
    where: { email: 'affiliate7@example.com' },
    update: {},
    create: {
      name: 'Middle East Trading Hub',
      email: 'affiliate7@example.com',
      phone: '+7777777777',
      address: 'Riyadh, Saudi Arabia',
      region: 'Middle East',
      country: 'Saudi Arabia',
      dealType: 'CPA',
      dealTerms: '$550 per FTD',
      dealDetails: JSON.stringify({
        ftdsPerMonth: 30,
        cpaTiers: [
          { tierName: 'Tier 1', depositAmount: 300, cpaAmount: 450 },
          { tierName: 'Tier 2', depositAmount: 600, cpaAmount: 550 },
          { tierName: 'Tier 3', depositAmount: 1200, cpaAmount: 750 },
        ],
        expectedROI: 180,
      }),
      status: 'ACTIVE',
      startDate: new Date('2024-07-10'),
      notes: 'Strong presence in MENA region',
      brokerId: broker1.id,
      managerId: staff.id,
    },
  });
  console.log('✅ Created affiliate:', affiliate7.name);

  const affiliate8 = await prisma.affiliate.upsert({
    where: { email: 'affiliate8@example.com' },
    update: {},
    create: {
      name: 'Asian Markets Pro',
      email: 'affiliate8@example.com',
      phone: '+8888888888',
      address: 'Tokyo, Japan',
      region: 'Asia',
      country: 'Japan',
      dealType: 'REBATES',
      dealTerms: '$15 per lot',
      dealDetails: JSON.stringify({
        netDepositsPerMonth: 120000,
        expectedVolumePerMonth: 10000,
        rebatesPerLot: 15,
      }),
      status: 'PAUSED',
      startDate: new Date('2024-02-20'),
      notes: 'Temporarily paused - restructuring deal',
      brokerId: broker2.id,
      managerId: admin.id,
    },
  });
  console.log('✅ Created affiliate:', affiliate8.name);

  // Create sample commissions
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Last 6 months of commissions for affiliate1
  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    
    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    await prisma.commission.create({
      data: {
        month,
        year,
        dealType: 'CPA',
        revenueAmount: 2500 + Math.random() * 2000,
        status: i === 0 ? 'PENDING' : 'PAID',
        paidDate: i === 0 ? null : new Date(year, month - 1, 15),
        notes: i === 0 ? 'Awaiting payment' : 'Payment processed',
        affiliateId: affiliate1.id,
        brokerId: broker1.id,
      },
    });
  }
  console.log('✅ Created commissions for:', affiliate1.name);

  // Last 6 months of commissions for affiliate2
  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    
    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    await prisma.commission.create({
      data: {
        month,
        year,
        dealType: 'IB',
        revenueAmount: 3000 + Math.random() * 3000,
        status: i === 0 ? 'PENDING' : 'PAID',
        paidDate: i === 0 ? null : new Date(year, month - 1, 15),
        notes: i === 0 ? 'Awaiting payment' : 'Payment processed',
        affiliateId: affiliate2.id,
        brokerId: broker1.id,
      },
    });
  }
  console.log('✅ Created commissions for:', affiliate2.name);

  // Last 6 months of commissions for affiliate3
  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    
    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    await prisma.commission.create({
      data: {
        month,
        year,
        dealType: 'PNL',
        revenueAmount: 1500 + Math.random() * 1500,
        status: i === 0 ? 'PENDING' : 'PAID',
        paidDate: i === 0 ? null : new Date(year, month - 1, 15),
        notes: i === 0 ? 'Awaiting payment' : 'Payment processed',
        affiliateId: affiliate3.id,
        brokerId: broker2.id,
      },
    });
  }
  console.log('✅ Created commissions for:', affiliate3.name);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
