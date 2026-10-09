const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf8');
const line = envText.split(/\r?\n/).find(l => l.startsWith('DATABASE_URL='));
const base = line.replace('DATABASE_URL=', '').replace(/^["']|["']$/g, '');
const url = base + '&connect_timeout=15&pool_timeout=15';

const p = new PrismaClient({ datasources: { db: { url } } });
p.user.findFirst()
  .then(u => {
    console.log('CONNECT_TIMEOUT TEST SUCCESS! Found:', u.email);
    return p.$disconnect();
  })
  .catch(e => {
    console.error('CONNECT_TIMEOUT TEST FAILED:', e);
    return p.$disconnect();
  });
