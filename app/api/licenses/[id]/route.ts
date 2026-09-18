import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const lic = await prisma.license.findUnique({
      where: { id: params.id },
      include: {
        software: { include: { vendor: true } },
        assignments: {
          include: {
            user: true,
            department: true,
          },
        },
        renewals: true,
      },
    });

    if (!lic) {
      return NextResponse.json({ success: false, error: 'License not found' }, { status: 404 });
    }

    const activeAssignments = lic.assignments.filter(a => a.status === 'ACTIVE').length;
    const available = Math.max(0, lic.totalQuantity - activeAssignments);

    return NextResponse.json({
      success: true,
      license: {
        ...lic,
        assignedQuantity: activeAssignments,
        availableQuantity: available,
        unusedQuantity: available,
        utilizationRate: lic.totalQuantity > 0 ? Number(((activeAssignments / lic.totalQuantity) * 100).toFixed(1)) : 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching license:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve license' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { totalQuantity, costPerLicense, renewalDate, expiryDate, status, notes } = body;

    const existing = await prisma.license.findUnique({
      where: { id: params.id },
      include: { assignments: { where: { status: 'ACTIVE' } } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'License not found' }, { status: 404 });
    }

    if (totalQuantity !== undefined) {
      const newTotal = parseInt(totalQuantity, 10);
      if (newTotal < existing.assignments.length) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot reduce total licenses to ${newTotal} because ${existing.assignments.length} are currently assigned.`,
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.license.update({
      where: { id: params.id },
      data: {
        totalQuantity: totalQuantity !== undefined ? parseInt(totalQuantity, 10) : undefined,
        costPerLicense: costPerLicense !== undefined ? parseFloat(costPerLicense) : undefined,
        renewalDate: renewalDate ? new Date(renewalDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.UPDATE,
      entity: 'License',
      entityId: updated.id,
      details: { previous: existing, updated },
    });

    return NextResponse.json({ success: true, license: updated });
  } catch (error: any) {
    console.error('Error updating license:', error);
    return NextResponse.json({ success: false, error: 'Failed to update license' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN]);
  if (errorResponse || !user) return errorResponse;

  try {
    const activeCount = await prisma.licenseAssignment.count({
      where: { licenseId: params.id, status: 'ACTIVE' },
    });

    if (activeCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete license with ${activeCount} active employee assignments.` },
        { status: 400 }
      );
    }

    await prisma.license.delete({ where: { id: params.id } });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.DELETE,
      entity: 'License',
      entityId: params.id,
    });

    return NextResponse.json({ success: true, message: 'License deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting license:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete license' }, { status: 500 });
  }
}
