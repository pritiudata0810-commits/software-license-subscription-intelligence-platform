import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { syncAndEvaluateAlerts } from '@/lib/alerts';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const dynamicAlerts = await syncAndEvaluateAlerts();

    // Fetch existing stored alerts from db
    const dbAlerts = await prisma.alert.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const combined = [
      ...dynamicAlerts.map((da, index) => ({
        id: `dyn-${index}-${da.entityType}-${da.entityId || 'general'}`,
        ...da,
        isRead: false,
        createdAt: new Date().toISOString(),
      })),
      ...dbAlerts.map(a => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    ];

    // Deduplicate by title
    const seen = new Set<string>();
    const deduplicated = combined.filter((a) => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });

    const criticalCount = deduplicated.filter(a => a.severity === 'CRITICAL').length;
    const warningCount = deduplicated.filter(a => a.severity === 'WARNING').length;
    const infoCount = deduplicated.filter(a => a.severity === 'INFO').length;

    return NextResponse.json({
      success: true,
      totalCount: deduplicated.length,
      criticalCount,
      warningCount,
      infoCount,
      alerts: deduplicated,
    });
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id } = body;

    if (id && !id.startsWith('dyn-')) {
      await prisma.alert.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Alert dismissed' });
  } catch (error: any) {
    console.error('Error dismissing alert:', error);
    return NextResponse.json({ success: false, error: 'Failed to dismiss alert' }, { status: 500 });
  }
}
