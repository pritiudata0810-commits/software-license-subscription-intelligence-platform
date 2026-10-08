import prisma from '../lib/prisma';
import { comparePassword, signToken, createAuthCookie } from '../lib/auth';
import { recordAuditLog } from '../lib/audit';
import { AuditAction } from '@prisma/client';

async function diagnose() {
  console.log('--- DIAGNOSING LOGIN FLOW ---');
  
  const email = 'admin@enterprise.com';
  const password = 'Password@123';

  // Step 1: Check database connection & User lookup
  console.log('1. Checking prisma.user.findUnique...');
  let user: any = null;
  try {
    user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { department: true },
    });
    console.log('✓ Found user:', user ? { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status } : 'NULL');
  } catch (err: any) {
    console.error('❌ Error in prisma.user.findUnique:', err);
    return;
  }

  if (!user) {
    console.error('❌ User not found in database!');
    return;
  }

  // Step 2: Check password comparison
  console.log('2. Checking comparePassword...');
  try {
    const isValid = await comparePassword(password, user.passwordHash);
    console.log('✓ Password comparison result:', isValid);
    if (!isValid) {
      console.error('❌ Password does not match hash!');
      return;
    }
  } catch (err: any) {
    console.error('❌ Error in comparePassword:', err);
    return;
  }

  // Step 3: Check signToken
  console.log('3. Checking signToken...');
  let token = '';
  try {
    token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
    });
    console.log('✓ Token generated:', token.slice(0, 25) + '...');
  } catch (err: any) {
    console.error('❌ Error in signToken:', err);
    return;
  }

  // Step 4: Check recordAuditLog
  console.log('4. Checking recordAuditLog...');
  try {
    const auditRes = await recordAuditLog({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: '127.0.0.1',
    });
    console.log('✓ Audit log recorded:', auditRes ? auditRes.id : 'OK');
  } catch (err: any) {
    console.error('❌ Error in recordAuditLog:', err);
    return;
  }

  // Step 5: Check createAuthCookie
  console.log('5. Checking createAuthCookie...');
  try {
    const cookie = createAuthCookie(token);
    console.log('✓ Cookie generated:', cookie.slice(0, 30) + '...');
  } catch (err: any) {
    console.error('❌ Error in createAuthCookie:', err);
    return;
  }

  console.log('--- ALL LOGIN STEPS PASSED SUCCESSFULLY IN ISOLATION ---');
}

diagnose()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
