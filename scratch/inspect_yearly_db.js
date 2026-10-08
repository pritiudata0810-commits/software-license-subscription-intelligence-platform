const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const years = await prisma.costRecord.groupBy({
    by: ['year'],
    _sum: {
      allocatedCost: true,
      wastedCost: true,
      investment: true,
      realizedValue: true,
      unrecoveredCost: true,
    },
    _count: { id: true }
  });
  console.log('Cost records grouped by year:\n', JSON.stringify(years, null, 2));

  // Check software cost records for 2026
  const swCost2026 = await prisma.costRecord.groupBy({
    by: ['softwareId', 'year'],
    _sum: {
      allocatedCost: true,
      wastedCost: true,
      investment: true,
      realizedValue: true,
      unrecoveredCost: true,
    },
  });
  console.log('Software costs by year count:', swCost2026.length);

  // Check usage records
  const usageCount = await prisma.usageRecord.count();
  const tokenUsage = await prisma.usageRecord.findMany({
    where: { tokensUsed: { gt: 0 } },
    select: { id: true, userId: true, tokensAllocated: true, tokensUsed: true, recordedAt: true }
  });
  console.log(`Total usage records: ${usageCount}, Token usage records: ${tokenUsage.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
