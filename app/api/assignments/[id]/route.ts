import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role, AssignmentStatus } from '@prisma/client';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const existing = await prisma.licenseAssignment.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        license: { include: { software: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    await prisma.licenseAssignment.update({
      where: { id: params.id },
      data: { status: AssignmentStatus.REVOKED },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.REVOKE_LICENSE,
      entity: 'LicenseAssignment',
      entityId: params.id,
      details: {
        revokedFrom: existing.user.name,
        softwareName: existing.license.software.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `License for ${existing.license.software.name} revoked from ${existing.user.name}. Seat returned to available pool.`,
    });
  } catch (error: any) {
    console.error('Error revoking license assignment:', error);
    return NextResponse.json({ success: false, error: 'Failed to revoke assignment' }, { status: 500 });
  }
}
