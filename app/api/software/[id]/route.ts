import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const sw = await prisma.software.findUnique({
      where: { id: params.id },
      include: {
        vendor: true,
        licenses: {
          include: {
            assignments: {
              where: { status: 'ACTIVE' },
              include: {
                user: { select: { id: true, name: true, email: true, designation: true } },
                department: { select: { id: true, name: true, code: true } },
              },
            },
            renewals: true,
          },
        },
        softwareRequests: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
        recommendations: true,
      },
    });

    if (!sw) {
      return NextResponse.json({ success: false, error: 'Software not found' }, { status: 404 });
    }

    let totalLicenses = 0;
    let activeAssignments = 0;
    let monthlyCost = 0;
    let costPerLicense = 0;

    for (const lic of sw.licenses) {
      totalLicenses += lic.totalQuantity;
      activeAssignments += lic.assignments.length;
      monthlyCost += lic.totalQuantity * lic.costPerLicense;
      costPerLicense = lic.costPerLicense;
    }

    const availableLicenses = Math.max(0, totalLicenses - activeAssignments);
    const utilizationRate = totalLicenses > 0 
      ? Number(((activeAssignments / totalLicenses) * 100).toFixed(1)) 
      : 0;

    return NextResponse.json({
      success: true,
      software: {
        ...sw,
        totalLicenses,
        activeAssignments,
        availableLicenses,
        unusedLicenses: availableLicenses,
        utilizationRate,
        costPerLicense,
        monthlyCost,
        annualCost: monthlyCost * 12,
        unusedMonthlyCost: availableLicenses * costPerLicense,
        potentialAnnualSaving: availableLicenses * costPerLicense * 12,
      },
    });
  } catch (error: any) {
    console.error('Error fetching software by ID:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve software' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { name, category, description, version, website, status } = body;

    const existing = await prisma.software.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Software not found' }, { status: 404 });
    }

    const updated = await prisma.software.update({
      where: { id: params.id },
      data: {
        name: name ? name.trim() : undefined,
        category: category ? category.trim() : undefined,
        description,
        version,
        website,
        status,
      },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.UPDATE,
      entity: 'Software',
      entityId: updated.id,
      details: { previous: existing, updated },
    });

    return NextResponse.json({ success: true, software: updated });
  } catch (error: any) {
    console.error('Error updating software:', error);
    return NextResponse.json({ success: false, error: 'Failed to update software' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN]);
  if (errorResponse || !user) return errorResponse;

  try {
    const existing = await prisma.software.findUnique({
      where: { id: params.id },
      include: {
        licenses: {
          include: { assignments: { where: { status: 'ACTIVE' } } },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Software not found' }, { status: 404 });
    }

    let activeCount = 0;
    for (const lic of existing.licenses) {
      activeCount += lic.assignments.length;
    }

    if (activeCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete software with ${activeCount} active user assignments. Revoke assignments first.`,
        },
        { status: 400 }
      );
    }

    await prisma.software.delete({ where: { id: params.id } });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.DELETE,
      entity: 'Software',
      entityId: params.id,
      details: { deletedName: existing.name },
    });

    return NextResponse.json({ success: true, message: 'Software deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting software:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete software' }, { status: 500 });
  }
}
