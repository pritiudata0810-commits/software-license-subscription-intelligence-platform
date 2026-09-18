import { NextRequest, NextResponse } from 'next/server';
import { calculateLicenseHealthScore } from '@/lib/recommendations';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const health = await calculateLicenseHealthScore();
    return NextResponse.json({ success: true, health });
  } catch (error: any) {
    console.error('Error calculating health score:', error);
    return NextResponse.json({ success: false, error: 'Failed to compute health score' }, { status: 500 });
  }
}
