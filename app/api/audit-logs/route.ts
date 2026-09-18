import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const entity = searchParams.get('entity');

    const where: any = {};
    if (entity) where.entity = entity;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      logs,
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
