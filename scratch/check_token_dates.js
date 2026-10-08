const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tokenRecords = await prisma.usageRecord.findMany({
    where: { tokensUsed: { gt: 0 } },
    select: { id: true, userId: true, tokensAllocated: true, tokensUsed: true, recordedAt: true }
  });
  console.log('Token usage records:', JSON.stringify(tokenRecords, null, 2));

  // Check all usage records years
  const allUsage = await prisma.usageRecord.findMany({
    select: { recordedAt: true, tokensUsed: true }
  });
  const years = new Set(allUsage.map(u => new Date(u.recordedAt).getFullYear()));
  console.log('Unique years in usageRecords:', Array.from(years));
}

main().catch(console.error).finally(() => prisma.$disconnect());
