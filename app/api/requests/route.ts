import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role, RequestPriority, RequestStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse || !user) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as RequestStatus | null;

    const where: any = {};
    if (status) where.status = status;

    // If Employee, view only own requests
    if (user.role === Role.EMPLOYEE) {
      where.userId = user.userId;
    }

    const requests = await prisma.softwareRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, department: { select: { name: true } } } },
        software: {
          include: {
            vendor: true,
            licenses: {
              include: { assignments: { where: { status: 'ACTIVE' } } },
            },
          },
        },
        approvals: {
          include: { approvedBy: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = requests.map((r) => {
      let totalLicenses = 0;
      let activeAssignments = 0;
      let costPerLicense = 0;

      for (const lic of r.software.licenses) {
        totalLicenses += lic.totalQuantity;
        activeAssignments += lic.assignments.length;
        costPerLicense = lic.costPerLicense;
      }

      const availableQuantity = Math.max(0, totalLicenses - activeAssignments);
      const hasAvailableUnused = availableQuantity > 0;

      return {
        id: r.id,
        softwareId: r.softwareId,
        softwareName: r.software.name,
        category: r.software.category,
        vendorName: r.software.vendor?.name,
        user: r.user,
        priority: r.priority,
        reason: r.reason,
        requiredDate: r.requiredDate,
        status: r.status,
        comments: r.comments,
        createdAt: r.createdAt,
        approvals: r.approvals,
        // Intelligence check:
        availableUnusedSeats: availableQuantity,
        hasAvailableUnused,
        intelligenceRecommendation: hasAvailableUnused
          ? `System detected ${availableQuantity} unused license(s) in pool. Allocate existing seat to save ₹${costPerLicense}/mo!`
          : `No existing unassigned licenses. Requires procurement or tier upgrade.`,
      };
    });

    return NextResponse.json({ success: true, count: enriched.length, requests: enriched });
  } catch (error: any) {
    console.error('Error fetching software requests:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { softwareId, priority = RequestPriority.MEDIUM, reason, requiredDate, comments } = body;

    if (!softwareId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Software and business justification reason are required' },
        { status: 400 }
      );
    }

    const sw = await prisma.software.findUnique({
      where: { id: softwareId },
      include: {
        licenses: {
          include: { assignments: { where: { status: 'ACTIVE' } } },
        },
      },
    });

    if (!sw) {
      return NextResponse.json({ success: false, error: 'Software not found' }, { status: 404 });
    }

    // Intelligence check: verify if unused licenses exist
    let totalQty = 0;
    let activeQty = 0;
    for (const lic of sw.licenses) {
      totalQty += lic.totalQuantity;
      activeQty += lic.assignments.length;
    }
    const available = Math.max(0, totalQty - activeQty);

    const request = await prisma.softwareRequest.create({
      data: {
        userId: user.userId,
        softwareId,
        priority,
        reason: reason.trim(),
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        comments,
        status: RequestStatus.PENDING,
      },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.REQUEST_SUBMITTED,
      entity: 'SoftwareRequest',
      entityId: request.id,
      details: {
        softwareName: sw.name,
        availableSeatsDetected: available,
        priority,
      },
    });

    return NextResponse.json({
      success: true,
      request,
      availableUnusedSeats: available,
      intelligenceRecommendation: available > 0
        ? `Note: ${available} unassigned license seat(s) exist in the database. When approved, an existing seat will be allocated immediately.`
        : `Request submitted for managerial review. No unused seats currently in pool.`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting software request:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit request' }, { status: 500 });
  }
}
