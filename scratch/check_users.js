const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Load .env
const envText = fs.readFileSync(path.resolve(__dirname, '..', '.env'), 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [k, ...rest] = trimmed.split('=');
    const v = rest.join('=').replace(/^["']|["']$/g, '');
    if (k && !process.env[k]) process.env[k] = v;
  }
}

const prisma = new PrismaClient();

async function check() {
  console.log('Checking database users...');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, status: true, passwordHash: true }
  });
  console.log('Total users in database:', users.length);
  
  for (const u of users.slice(0, 5)) {
    const isValid = await bcrypt.compare('Password@123', u.passwordHash);
    console.log(`- ${u.email} [${u.role}] (Status: ${u.status}): Password@123 matches? ${isValid}`);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
