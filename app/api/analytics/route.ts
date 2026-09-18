import { NextRequest, NextResponse } from 'next/server';
import { calculatePlatformAnalytics } from '@/lib/analytics';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const analytics = await calculatePlatformAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    console.error('Error calculating platform analytics:', error);
    return NextResponse.json({ success: false, error: 'Failed to compute analytics' }, { status: 500 });
  }
}
