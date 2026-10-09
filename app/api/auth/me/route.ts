import { NextRequest, NextResponse } from 'next/server';
import prisma, { withPrismaRetry } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { user: tokenUser, errorResponse } = requireAuth(req);
  if (errorResponse || !tokenUser) return errorResponse;

  try {
    const userSelect = {
      id: true,
      email: true,
      name: true,
      role: true,
      designation: true,
      avatarUrl: true,
      status: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
          budgetMonthly: true,
        },
      },
      assignments: {
        where: { status: 'ACTIVE' as const },
        include: {
          license: {
            include: {
              software: true,
            },
          },
        },
      },
    };

    const user = await withPrismaRetry(() =>
      prisma.user.findUnique({
        where: { id: tokenUser.userId },
        select: userSelect,
      })
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve profile' }, { status: 500 });
  }
}
