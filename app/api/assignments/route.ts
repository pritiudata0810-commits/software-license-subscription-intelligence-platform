import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role, AssignmentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const licenseId = searchParams.get('licenseId');
    const departmentId = searchParams.get('departmentId');
    const status = (searchParams.get('status') as AssignmentStatus) || AssignmentStatus.ACTIVE;

    const where: any = { status };
    if (userId) where.userId = userId;
    if (licenseId) where.licenseId = licenseId;
    if (departmentId) where.departmentId = departmentId;

    // If caller is an EMPLOYEE, restrict to their own assignments
    if (user?.role === Role.EMPLOYEE) {
      where.userId = user.userId;
    }

    const assignments = await prisma.licenseAssignment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, designation: true } },
        department: { select: { id: true, name: true, code: true } },
        license: {
          include: {
            software: { select: { id: true, name: true, category: true, version: true } },
            vendor: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { assignedDate: 'desc' },
    });

    return NextResponse.json({ success: true, count: assignments.length, assignments });
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve assignments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { licenseId, userId, departmentId, notes } = body;

    if (!licenseId || !userId) {
      return NextResponse.json(
        { success: false, error: 'License and user are required' },
        { status: 400 }
      );
    }

    const [targetUser, targetLicense] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.license.findUnique({
        where: { id: licenseId },
        include: {
          software: true,
          assignments: { where: { status: 'ACTIVE' } },
        },
      }),
    ]);

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    if (!targetLicense) {
      return NextResponse.json({ success: false, error: 'License not found' }, { status: 404 });
    }

    // Check availability
    const activeCount = targetLicense.assignments.length;
    const available = targetLicense.totalQuantity - activeCount;

    if (available <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No licenses available! All ${targetLicense.totalQuantity} seats for ${targetLicense.software.name} are already assigned.`,
        },
        { status: 400 }
      );
    }

    // Check if user already holds active assignment
    const alreadyAssigned = targetLicense.assignments.some((a) => a.userId === userId);
    if (alreadyAssigned) {
      return NextResponse.json(
        { success: false, error: `${targetUser.name} already has an active license for ${targetLicense.software.name}.` },
        { status: 409 }
      );
    }

    const deptId = departmentId || targetUser.departmentId;

    const assignment = await prisma.$transaction(async (tx) => {
      const created = await tx.licenseAssignment.create({
        data: {
          licenseId,
          userId,
          departmentId: deptId,
          assignedDate: new Date(),
          status: AssignmentStatus.ACTIVE,
          notes,
        },
      });

      // Update or create usage record
      await tx.usageRecord.create({
        data: {
          userId,
          softwareId: targetLicense.softwareId,
          licenseId: targetLicense.id,
          lastActiveDate: new Date(),
          loginCount: 1,
          hoursUsed: 1.0,
          utilizationStatus: 'MODERATE',
        },
      });

      return created;
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.ASSIGN_LICENSE,
      entity: 'LicenseAssignment',
      entityId: assignment.id,
      details: {
        softwareName: targetLicense.software.name,
        assignedTo: targetUser.name,
        assignedToEmail: targetUser.email,
      },
    });

    return NextResponse.json({ success: true, assignment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating license assignment:', error);
    return NextResponse.json({ success: false, error: 'Failed to assign license' }, { status: 500 });
  }
}
