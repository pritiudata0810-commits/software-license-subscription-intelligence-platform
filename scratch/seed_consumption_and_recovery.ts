import { PrismaClient, ConsumptionType, UtilizationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- ENRICHING DATABASE WITH YEARLY RECOVERY & TOKEN CONSUMPTION ---');

  // 1. Ensure existing software have SEAT_BASED consumptionType
  await prisma.software.updateMany({
    where: { consumptionType: { not: ConsumptionType.TOKEN_BASED } },
    data: { consumptionType: ConsumptionType.SEAT_BASED },
  });

  await prisma.license.updateMany({
    where: { consumptionType: { not: ConsumptionType.TOKEN_BASED } },
    data: { consumptionType: ConsumptionType.SEAT_BASED },
  });

  console.log('✓ Existing software and licenses confirmed as SEAT_BASED.');

  // 2. Fetch or create Microsoft/OpenAI vendor
  let msVendor = await prisma.vendor.findFirst({
    where: { name: { contains: 'Microsoft' } },
  });

  if (!msVendor) {
    msVendor = await prisma.vendor.create({
      data: {
        name: 'OpenAI Technologies',
        contactPerson: 'Enterprise Sales',
        email: 'sales@openai.com',
        website: 'https://openai.com',
      },
    });
  }

  // 3. Create or update Token-Based Software: OpenAI Enterprise
  let openAiSw = await prisma.software.findFirst({
    where: { name: 'OpenAI Enterprise (API & GPT-4o)' },
  });

  if (!openAiSw) {
    openAiSw = await prisma.software.create({
      data: {
        name: 'OpenAI Enterprise (API & GPT-4o)',
        category: 'AI & Machine Learning',
        description: 'Enterprise generative AI tokens and GPT-4o API compute capacity.',
        version: 'Enterprise API',
        website: 'https://platform.openai.com',
        status: 'ACTIVE',
        consumptionType: ConsumptionType.TOKEN_BASED,
        vendorId: msVendor.id,
      },
    });
    console.log('✓ Created OpenAI Enterprise software product (TOKEN_BASED).');
  } else {
    await prisma.software.update({
      where: { id: openAiSw.id },
      data: { consumptionType: ConsumptionType.TOKEN_BASED },
    });
  }

  // 4. Create or update Token-Based License
  let openAiLicense = await prisma.license.findFirst({
    where: { softwareId: openAiSw.id },
  });

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  if (!openAiLicense) {
    openAiLicense = await prisma.license.create({
      data: {
        softwareId: openAiSw.id,
        vendorId: msVendor.id,
        licenseKey: 'OPENAI-CORP-TK-99482',
        consumptionType: ConsumptionType.TOKEN_BASED,
        totalQuantity: 1, // 1 Corporate Enterprise Commitment
        costPerLicense: 100000, // ₹1,00,000 monthly commitment
        allocatedTokens: 50000000, // 50,000,000 tokens
        usedTokens: 38500000, // 38,500,000 tokens (77% utilization)
        tokenUnitCost: 0.002, // ₹0.002 per token (₹2 per 1k tokens)
        renewalDate: nextYear,
        status: 'ACTIVE',
        notes: 'Enterprise dedicated token pool with high-throughput tier.',
      },
    });
    console.log('✓ Created OpenAI Enterprise token license pool.');
  } else {
    await prisma.license.update({
      where: { id: openAiLicense.id },
      data: {
        consumptionType: ConsumptionType.TOKEN_BASED,
        allocatedTokens: 50000000,
        usedTokens: 38500000,
        tokenUnitCost: 0.002,
        costPerLicense: 100000,
      },
    });
  }

  // 5. Connect Employee-Level Token Usage Records
  const employeesToTrack = [
    { email: 'alex.chen@enterprise.com', allocated: 10000000, used: 9200000, status: UtilizationStatus.HIGH },
    { email: 'sarah.lin@enterprise.com', allocated: 10000000, used: 8400000, status: UtilizationStatus.HIGH },
    { email: 'rohan.sharma@enterprise.com', allocated: 8000000, used: 5600000, status: UtilizationStatus.MODERATE },
    { email: 'jessica.parker@enterprise.com', allocated: 6000000, used: 1800000, status: UtilizationStatus.LOW },
    { email: 'marcus.johnson@enterprise.com', allocated: 6000000, used: 4500000, status: UtilizationStatus.MODERATE },
    { email: 'aisha.khan@enterprise.com', allocated: 5000000, used: 4900000, status: UtilizationStatus.HIGH },
  ];

  for (const emp of employeesToTrack) {
    const user = await prisma.user.findUnique({ where: { email: emp.email } });
    if (user) {
      // Check if usage record already exists
      const existing = await prisma.usageRecord.findFirst({
        where: { userId: user.id, softwareId: openAiSw.id },
      });

      if (!existing) {
        await prisma.usageRecord.create({
          data: {
            userId: user.id,
            softwareId: openAiSw.id,
            licenseId: openAiLicense.id,
            loginCount: 42,
            hoursUsed: 120,
            tokensAllocated: emp.allocated,
            tokensUsed: emp.used,
            utilizationStatus: emp.status,
          },
        });
      } else {
        await prisma.usageRecord.update({
          where: { id: existing.id },
          data: {
            tokensAllocated: emp.allocated,
            tokensUsed: emp.used,
            licenseId: openAiLicense.id,
            utilizationStatus: emp.status,
          },
        });
      }
    }
  }
  console.log('✓ Seeded employee-level token usage records connected to real database users.');

  // 6. Multi-Year Historical CostRecords for Yearly Investment & Recovery (2024, 2025, 2026)
  const adobe = await prisma.software.findFirst({ where: { name: 'Adobe Creative Cloud' } });
  const msft = await prisma.software.findFirst({ where: { name: { contains: 'Microsoft' } } });
  const slack = await prisma.software.findFirst({ where: { name: { contains: 'Slack' } } });
  const engDept = await prisma.department.findFirst({ where: { code: 'ENG' } });

  const historicalData = [
    // 2024: Investment ₹4,80,000, Realized ₹3,12,000, Unrecovered ₹1,68,000, Recovery 65%
    {
      year: 2024,
      month: 12,
      softwareId: adobe?.id || openAiSw.id,
      departmentId: engDept?.id,
      investment: 480000,
      realizedValue: 312000,
      unrecoveredCost: 168000,
      recoveryRate: 65.0,
      allocatedCost: 312000,
      wastedCost: 168000,
    },
    // 2025: Investment ₹6,50,000, Realized ₹4,94,000, Unrecovered ₹1,56,000, Recovery 76%
    {
      year: 2025,
      month: 12,
      softwareId: msft?.id || openAiSw.id,
      departmentId: engDept?.id,
      investment: 650000,
      realizedValue: 494000,
      unrecoveredCost: 156000,
      recoveryRate: 76.0,
      allocatedCost: 494000,
      wastedCost: 156000,
    },
    // 2026: Investment ₹7,32,600, Realized ₹6,15,384, Unrecovered ₹1,17,216, Recovery 84%
    {
      year: 2026,
      month: 10,
      softwareId: slack?.id || openAiSw.id,
      departmentId: engDept?.id,
      investment: 732600,
      realizedValue: 615384,
      unrecoveredCost: 117216,
      recoveryRate: 84.0,
      allocatedCost: 615384,
      wastedCost: 117216,
    },
  ];

  for (const h of historicalData) {
    const existingRec = await prisma.costRecord.findFirst({
      where: { year: h.year, softwareId: h.softwareId },
    });

    if (!existingRec) {
      await prisma.costRecord.create({
        data: h,
      });
    } else {
      await prisma.costRecord.update({
        where: { id: existingRec.id },
        data: h,
      });
    }
  }

  console.log('✓ Multi-year CostRecords populated for 2024, 2025, and 2026.');
  console.log('--- ENRICHMENT COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error('Error during enrichment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
