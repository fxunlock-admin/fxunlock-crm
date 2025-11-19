import { PrismaClient, UserRole, UserStatus, DealStatus, DealType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@flowxchange.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@flowxchange.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.VERIFIED,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          companyName: 'FlowXchange',
        },
      },
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample affiliates
  const affiliate1Password = await bcrypt.hash('Affiliate123!', 10);
  const affiliate1 = await prisma.user.upsert({
    where: { email: 'affiliate1@example.com' },
    update: {},
    create: {
      email: 'affiliate1@example.com',
      password: affiliate1Password,
      role: UserRole.AFFILIATE,
      status: UserStatus.VERIFIED,
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          companyName: 'FX Partners Ltd',
          country: 'United Kingdom',
          phone: '+44 20 1234 5678',
          website: 'https://fxpartners.example.com',
          description: 'Leading FX affiliate with 5+ years experience',
        },
      },
    },
  });
  console.log('✅ Affiliate 1 created:', affiliate1.email);

  const affiliate2Password = await bcrypt.hash('Affiliate123!', 10);
  const affiliate2 = await prisma.user.upsert({
    where: { email: 'affiliate2@example.com' },
    update: {},
    create: {
      email: 'affiliate2@example.com',
      password: affiliate2Password,
      role: UserRole.AFFILIATE,
      status: UserStatus.VERIFIED,
      profile: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          companyName: 'Global Trading Network',
          country: 'United States',
          phone: '+1 212 555 0123',
          website: 'https://globaltrading.example.com',
          description: 'High-volume FX IB specializing in retail traders',
        },
      },
    },
  });
  console.log('✅ Affiliate 2 created:', affiliate2.email);

  // Create sample brokers
  const broker1Password = await bcrypt.hash('Broker123!', 10);
  const broker1 = await prisma.user.upsert({
    where: { email: 'broker1@example.com' },
    update: {},
    create: {
      email: 'broker1@example.com',
      password: broker1Password,
      role: UserRole.BROKER,
      status: UserStatus.VERIFIED,
      profile: {
        create: {
          firstName: 'Michael',
          lastName: 'Johnson',
          country: 'Cyprus',
          phone: '+357 25 123456',
        },
      },
      brokerProfile: {
        create: {
          companyName: 'Prime FX Broker',
          regulatoryLicense: 'CySEC 123456',
          minTradeVolume: 100000,
          maxTradeVolume: 10000000,
          preferredRegions: ['Europe', 'Asia', 'Middle East'],
          preferredInstruments: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'Gold', 'Oil'],
        },
      },
    },
  });
  console.log('✅ Broker 1 created:', broker1.email);

  const broker2Password = await bcrypt.hash('Broker123!', 10);
  const broker2 = await prisma.user.upsert({
    where: { email: 'broker2@example.com' },
    update: {},
    create: {
      email: 'broker2@example.com',
      password: broker2Password,
      role: UserRole.BROKER,
      status: UserStatus.VERIFIED,
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Williams',
          country: 'Australia',
          phone: '+61 2 9876 5432',
        },
      },
      brokerProfile: {
        create: {
          companyName: 'Pacific Trading Group',
          regulatoryLicense: 'ASIC 987654',
          minTradeVolume: 50000,
          maxTradeVolume: 5000000,
          preferredRegions: ['Asia-Pacific', 'Australia'],
          preferredInstruments: ['AUD/USD', 'NZD/USD', 'EUR/AUD', 'Indices'],
        },
      },
    },
  });
  console.log('✅ Broker 2 created:', broker2.email);

  // Create sample deal requests
  const deal1 = await prisma.dealRequest.create({
    data: {
      affiliateId: affiliate1.id,
      title: 'High-Volume EUR/USD Rebate Partnership',
      description: 'Network of 500+ active traders with monthly volume of $50M+',
      dealType: DealType.REBATES,
      netDepositsPerMonth: 500000,
      expectedVolumeInLots: 10000,
      rebatePerLot: 8.5,
      region: 'Europe',
      instruments: ['EUR/USD', 'GBP/USD', 'EUR/GBP'],
      additionalTerms: 'Prefer brokers with CySEC or FCA regulation. Fast execution and competitive spreads required.',
      status: DealStatus.OPEN,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Deal 1 created:', deal1.title);

  const deal2 = await prisma.dealRequest.create({
    data: {
      affiliateId: affiliate2.id,
      title: 'Gold Trading CPA Deal',
      description: 'Established IB with 100+ FTDs per month seeking competitive CPA rates',
      dealType: DealType.CPA,
      ftdsPerMonth: 100,
      cpaTiers: [
        { tierName: 'Tier 1', depositAmount: 250, cpaAmount: 400 },
        { tierName: 'Tier 2', depositAmount: 500, cpaAmount: 600 },
        { tierName: 'Tier 3', depositAmount: 1000, cpaAmount: 800 },
      ],
      expectedRoi: 1.5,
      lotsToQualifyCpa: 5.0,
      region: 'United States',
      instruments: ['Gold', 'Silver', 'Oil', 'Natural Gas'],
      additionalTerms: 'Must have US-friendly payment options and 24/7 support.',
      status: DealStatus.OPEN,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Deal 2 created:', deal2.title);

  const deal3 = await prisma.dealRequest.create({
    data: {
      affiliateId: affiliate1.id,
      title: 'Asian Market Hybrid Deal',
      description: 'Expanding into Asian markets with both CPA and rebate structure',
      dealType: DealType.HYBRID,
      ftdsPerMonth: 50,
      cpaTiers: [
        { tierName: 'Tier 1', depositAmount: 300, cpaAmount: 500 },
        { tierName: 'Tier 2', depositAmount: 1000, cpaAmount: 900 },
      ],
      lotsToQualifyCpa: 3.0,
      netDepositsPerMonth: 300000,
      expectedVolumeInLots: 5000,
      rebatePerLot: 7.0,
      region: 'Asia',
      instruments: ['USD/JPY', 'EUR/JPY', 'AUD/JPY', 'Nikkei'],
      additionalTerms: 'Multi-language support required (English, Japanese, Chinese).',
      status: DealStatus.OPEN,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Deal 3 created:', deal3.title);

  const deal4 = await prisma.dealRequest.create({
    data: {
      affiliateId: affiliate2.id,
      title: 'Crypto CFD PnL Share Deal',
      description: 'Growing network of crypto traders seeking profit-sharing partnership',
      dealType: DealType.PNL,
      netDepositsPerMonth: 400000,
      pnlPercentage: 30,
      region: 'Global',
      instruments: ['BTC/USD', 'ETH/USD', 'XRP/USD', 'Crypto Indices'],
      additionalTerms: 'Must offer 24/7 trading and instant deposits/withdrawals.',
      status: DealStatus.OPEN,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Deal 4 created:', deal4.title);

  const deal5 = await prisma.dealRequest.create({
    data: {
      affiliateId: affiliate1.id,
      title: 'Middle East Forex Rebate Network',
      description: 'Strong presence in UAE, Saudi Arabia, and Qatar with Sharia-compliant traders',
      dealType: DealType.REBATES,
      netDepositsPerMonth: 600000,
      expectedVolumeInLots: 8000,
      rebatePerLot: 7.5,
      region: 'Middle East',
      instruments: ['EUR/USD', 'GBP/USD', 'Gold', 'Oil'],
      additionalTerms: 'Islamic accounts required. Arabic support essential.',
      status: DealStatus.OPEN,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Deal 5 created:', deal5.title);

  const deal6 = await prisma.dealRequest.create({
    data: {
      affiliateId: affiliate2.id,
      title: 'Stock Indices Hybrid Partnership',
      description: 'Professional trading community focused on US and European indices',
      dealType: DealType.HYBRID,
      ftdsPerMonth: 75,
      cpaTiers: [
        { tierName: 'Tier 1', depositAmount: 500, cpaAmount: 550 },
        { tierName: 'Tier 2', depositAmount: 2000, cpaAmount: 1000 },
      ],
      lotsToQualifyCpa: 10.0,
      netDepositsPerMonth: 400000,
      expectedVolumeInLots: 6000,
      rebatePerLot: 8.0,
      region: 'Europe',
      instruments: ['S&P 500', 'NASDAQ', 'DAX', 'FTSE 100', 'CAC 40'],
      additionalTerms: 'Low latency execution required. MT5 platform preferred.',
      status: DealStatus.OPEN,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Deal 6 created:', deal6.title);

  const deal7 = await prisma.dealRequest.create({
    data: {
      affiliateId: affiliate1.id,
      title: 'Latin America CPA Expansion',
      description: 'Expanding into Brazil, Mexico, and Argentina with local payment methods',
      dealType: DealType.CPA,
      ftdsPerMonth: 80,
      cpaTiers: [
        { tierName: 'Tier 1', depositAmount: 200, cpaAmount: 350 },
        { tierName: 'Tier 2', depositAmount: 500, cpaAmount: 550 },
        { tierName: 'Tier 3', depositAmount: 1500, cpaAmount: 900 },
      ],
      expectedRoi: 1.8,
      lotsToQualifyCpa: 2.0,
      region: 'South America',
      instruments: ['USD/BRL', 'USD/MXN', 'EUR/USD', 'Gold'],
      additionalTerms: 'Local payment methods (PIX, SPEI) required.',
      status: DealStatus.OPEN,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Deal 7 created:', deal7.title);

  const deal8 = await prisma.dealRequest.create({
    data: {
      affiliateId: affiliate2.id,
      title: 'High-Frequency Trading Rebate Network',
      description: 'Algorithmic traders requiring ultra-low latency, 1000+ trades per day',
      dealType: DealType.REBATES,
      netDepositsPerMonth: 800000,
      expectedVolumeInLots: 15000,
      rebatePerLot: 6.5,
      region: 'Global',
      instruments: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'Gold', 'Oil'],
      additionalTerms: 'VPS hosting and API access required. Sub-10ms latency essential.',
      status: DealStatus.OPEN,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Deal 8 created:', deal8.title);

  console.log('✅ Seeding completed!');
  console.log('\n📝 Test Accounts:');
  console.log('Admin: admin@flowxchange.com / Admin123!');
  console.log('Affiliate 1: affiliate1@example.com / Affiliate123!');
  console.log('Affiliate 2: affiliate2@example.com / Affiliate123!');
  console.log('Broker 1: broker1@example.com / Broker123!');
  console.log('Broker 2: broker2@example.com / Broker123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
