import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateAndGenerateRecommendations } from '@/lib/recommendations';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, RecommendationStatus, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as RecommendationStatus | null;

    const where: any = {};
    if (status) where.status = status;

    const recommendations = await prisma.recommendation.findMany({
      where,
      include: {
        software: {
          select: { id: true, name: true, category: true, vendor: { select: { name: true } } },
        },
      },
      orderBy: [
        { severity: 'asc' },
        { estimatedMonthlySavings: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, count: recommendations.length, recommendations });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve recommendations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const evaluated = await evaluateAndGenerateRecommendations();

    let createdCount = 0;
    for (const rec of evaluated) {
      // Check if same type for same software is already active
      const exists = await prisma.recommendation.findFirst({
        where: {
          softwareId: rec.softwareId,
          type: rec.type,
          status: { in: [RecommendationStatus.NEW, RecommendationStatus.REVIEWED] },
        },
      });

      if (!exists) {
        await prisma.recommendation.create({
          data: rec,
        });
        createdCount++;
      }
    }

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.GENERATE_RECOMMENDATION,
      entity: 'Recommendation',
      details: { newlyGenerated: createdCount, totalEvaluated: evaluated.length },
    });

    const allRecommendations = await prisma.recommendation.findMany({
      include: { software: { include: { vendor: true } } },
      orderBy: { estimatedMonthlySavings: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: `Engine evaluated live data. ${createdCount} new recommendation(s) generated.`,
      recommendations: allRecommendations,
    });
  } catch (error: any) {
    console.error('Error executing recommendation engine:', error);
    return NextResponse.json({ success: false, error: 'Failed to evaluate recommendations' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const updated = await prisma.recommendation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, recommendation: updated });
  } catch (error: any) {
    console.error('Error updating recommendation status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update recommendation' }, { status: 500 });
  }
}
