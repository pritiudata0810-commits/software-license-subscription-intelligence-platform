import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role, RenewalStatus, RiskLevel } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const today = new Date();

    const renewals = await prisma.renewal.findMany({
      include: {
        software: { include: { vendor: true } },
        license: {
          include: {
            assignments: { where: { status: 'ACTIVE' } },
          },
        },
      },
      orderBy: { renewalDate: 'asc' },
    });

    const categorized = renewals.map((r) => {
      const daysUntil = Math.ceil((new Date(r.renewalDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let computedStatus: RenewalStatus = RenewalStatus.UPCOMING;
      let computedRisk: RiskLevel = RiskLevel.LOW;

      if (daysUntil < 0) {
        computedStatus = RenewalStatus.EXPIRED;
        computedRisk = RiskLevel.CRITICAL;
      } else if (daysUntil <= 7) {
        computedStatus = RenewalStatus.DUE_7_DAYS;
        computedRisk = RiskLevel.HIGH;
      } else if (daysUntil <= 30) {
        computedStatus = RenewalStatus.DUE_30_DAYS;
        computedRisk = RiskLevel.MEDIUM;
      }

      const totalQty = r.license.totalQuantity;
      const activeQty = r.license.assignments.length;
      const unusedQty = Math.max(0, totalQty - activeQty);
      const utilRate = totalQty > 0 ? Number(((activeQty / totalQty) * 100).toFixed(1)) : 0;
      const potentialWastedSpend = unusedQty * r.license.costPerLicense;

      return {
        ...r,
        daysUntilRenewal: daysUntil,
        computedStatus,
        computedRisk,
        totalQuantity: totalQty,
        activeQuantity: activeQty,
        unusedQuantity: unusedQty,
        utilizationRate: utilRate,
        costPerLicense: r.license.costPerLicense,
        potentialWastedSpend,
      };
    });

    return NextResponse.json({
      success: true,
      count: categorized.length,
      renewals: categorized,
      expiredCount: categorized.filter((c) => c.daysUntilRenewal < 0).length,
      due7DaysCount: categorized.filter((c) => c.daysUntilRenewal >= 0 && c.daysUntilRenewal <= 7).length,
      due30DaysCount: categorized.filter((c) => c.daysUntilRenewal > 7 && c.daysUntilRenewal <= 30).length,
      upcomingCount: categorized.filter((c) => c.daysUntilRenewal > 30).length,
    });
  } catch (error: any) {
    console.error('Error fetching renewals:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve renewals' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { id, renewalDate, autoRenew, status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Renewal ID is required' }, { status: 400 });
    }

    const updated = await prisma.renewal.update({
      where: { id },
      data: {
        renewalDate: renewalDate ? new Date(renewalDate) : undefined,
        autoRenew: autoRenew !== undefined ? autoRenew : undefined,
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.UPDATE_RENEWAL,
      entity: 'Renewal',
      entityId: id,
      details: { autoRenew, status },
    });

    return NextResponse.json({ success: true, renewal: updated });
  } catch (error: any) {
    console.error('Error updating renewal:', error);
    return NextResponse.json({ success: false, error: 'Failed to update renewal' }, { status: 500 });
  }
}
