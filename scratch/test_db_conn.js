const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Read .env manually
const envPath = path.resolve(__dirname, '..', '.env');
const envText = fs.readFileSync(envPath, 'utf8');

let dbUrl = '';
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed.startsWith('DATABASE_URL=')) {
    dbUrl = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
  }
}

console.log('Database URL loaded:', dbUrl ? 'YES (length: ' + dbUrl.length + ')' : 'NO');

process.env.DATABASE_URL = dbUrl;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function test() {
  console.log('Connecting to database via Prisma...');
  try {
    const user = await prisma.user.findFirst();
    console.log('✓ Success! Found user:', user ? user.email : 'None');
  } catch (err) {
    console.error('❌ Connection error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
