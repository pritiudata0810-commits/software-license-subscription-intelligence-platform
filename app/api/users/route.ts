import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role, UserStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId');
    const role = searchParams.get('role') as Role | null;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (departmentId) where.departmentId = departmentId;
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        designation: true,
        status: true,
        department: { select: { id: true, name: true, code: true } },
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            license: {
              include: {
                software: { select: { id: true, name: true, category: true } },
              },
            },
          },
        },
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    const enriched = users.map((u) => ({
      ...u,
      activeLicensesCount: u.assignments.length,
      assignedSoftware: u.assignments.map((a) => a.license.software.name),
    }));

    return NextResponse.json({ success: true, count: enriched.length, users: enriched });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { name, email, password = 'Password@123', role = Role.EMPLOYEE, designation, departmentId } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        designation,
        departmentId,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        departmentId: true,
      },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.CREATE,
      entity: 'User',
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
