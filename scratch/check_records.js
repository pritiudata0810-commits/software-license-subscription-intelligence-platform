const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.costRecord.findMany({
    include: { software: true },
    orderBy: [{ year: 'asc' }, { softwareId: 'asc' }]
  });
  console.log('Cost records breakdown:');
  for (const r of records) {
    console.log(`Year ${r.year} (month ${r.month}) - ${r.software?.name || 'No Software'}: alloc=${r.allocatedCost}, waste=${r.wastedCost}, inv=${r.investment}, rec=${r.realizedValue}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
