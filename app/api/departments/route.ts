import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const departments = await prisma.department.findMany({
      include: {
        users: { select: { id: true, name: true, email: true, role: true, designation: true } },
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            license: { include: { software: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const enriched = departments.map((d) => {
      let actualSpend = 0;
      for (const a of d.assignments) {
        actualSpend += a.license.costPerLicense;
      }

      const budgetUtilization = d.budgetMonthly > 0 
        ? Number(((actualSpend / d.budgetMonthly) * 100).toFixed(1)) 
        : 0;

      return {
        id: d.id,
        name: d.name,
        code: d.code,
        budgetMonthly: d.budgetMonthly,
        actualSpendMonthly: actualSpend,
        budgetUtilizationRate: budgetUtilization,
        employeeCount: d.users.length,
        activeLicenseCount: d.assignments.length,
        employees: d.users,
      };
    });

    return NextResponse.json({ success: true, count: enriched.length, departments: enriched });
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { name, code, budgetMonthly = 0 } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Name and code are required' }, { status: 400 });
    }

    const dept = await prisma.department.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        budgetMonthly: parseFloat(budgetMonthly) || 0,
      },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.CREATE,
      entity: 'Department',
      entityId: dept.id,
      details: { name: dept.name, code: dept.code },
    });

    return NextResponse.json({ success: true, department: dept }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json({ success: false, error: 'Failed to create department' }, { status: 500 });
  }
}
