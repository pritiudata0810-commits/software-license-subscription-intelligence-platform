const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const envPath = path.resolve(__dirname, '..', '.env');
const envText = fs.readFileSync(envPath, 'utf8');

let dbUrl = '';
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed.startsWith('DATABASE_URL=')) {
    dbUrl = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
  }
}
process.env.DATABASE_URL = dbUrl;

const prisma = new PrismaClient();

async function run() {
  console.log('=== VERIFYING AIVEN DATABASE & AUTHENTICATION DATA ===\n');

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@enterprise.com' },
    include: { department: true }
  });

  if (!admin) {
    console.error('admin@enterprise.com NOT found!');
    return;
  }

  console.log('1. Admin User Record:');
  console.log('   ID:', admin.id);
  console.log('   Email:', admin.email);
  console.log('   Name:', admin.name);
  console.log('   Role:', admin.role);
  console.log('   Status:', admin.status);
  console.log('   Designation:', admin.designation);
  console.log('   Department:', admin.department ? (admin.department.name + ' (' + admin.department.code + ')') : 'NONE');
  console.log('   Password Hash Present:', !!admin.passwordHash);

  const isMatch = await bcrypt.compare('Password@123', admin.passwordHash);
  console.log('   Bcrypt compare with Password@123:', isMatch ? 'MATCH' : 'NO MATCH');

  const manager = await prisma.user.findUnique({
    where: { email: 'manager.eng@enterprise.com' },
    include: { department: true }
  });
  console.log('\n2. Manager User Record:');
  console.log('   Found:', !!manager, 'Role:', manager ? manager.role : 'none');
  if (manager) {
    const mgrMatch = await bcrypt.compare('Password@123', manager.passwordHash);
    console.log('   Bcrypt compare:', mgrMatch ? 'MATCH' : 'NO MATCH');
  }

  const employee = await prisma.user.findUnique({
    where: { email: 'alex.chen@enterprise.com' },
    include: { department: true }
  });
  console.log('\n3. Employee User Record:');
  console.log('   Found:', !!employee, 'Role:', employee ? employee.role : 'none');
  if (employee) {
    const empMatch = await bcrypt.compare('Password@123', employee.passwordHash);
    console.log('   Bcrypt compare:', empMatch ? 'MATCH' : 'NO MATCH');
  }

  const totalUsers = await prisma.user.count();
  const totalSoftware = await prisma.software.count();
  const totalLicenses = await prisma.license.count();
  const totalVendors = await prisma.vendor.count();

  console.log('\n4. Database Summary:');
  console.log('   Users: ' + totalUsers);
  console.log('   Software: ' + totalSoftware);
  console.log('   Licenses: ' + totalLicenses);
  console.log('   Vendors: ' + totalVendors);

  await prisma.$disconnect();
}

run().catch(console.error);
