import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie, getUserFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (user) {
    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.LOGOUT,
      entity: 'User',
      entityId: user.userId,
      details: { email: user.email },
    });
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', clearAuthCookie());
  return response;
}
