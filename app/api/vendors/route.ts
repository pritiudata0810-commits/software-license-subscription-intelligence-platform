import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        software: {
          include: {
            licenses: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const enriched = vendors.map((v) => {
      let totalLicenses = 0;
      let totalSpendMonthly = 0;
      for (const sw of v.software) {
        for (const lic of sw.licenses) {
          totalLicenses += lic.totalQuantity;
          totalSpendMonthly += lic.totalQuantity * lic.costPerLicense;
        }
      }

      return {
        ...v,
        softwareCount: v.software.length,
        totalLicenses,
        totalSpendMonthly,
        totalSpendAnnual: totalSpendMonthly * 12,
      };
    });

    return NextResponse.json({ success: true, count: enriched.length, vendors: enriched });
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve vendors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { name, contactPerson, email, phone, website, notes } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Vendor name is required' }, { status: 400 });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name: name.trim(),
        contactPerson,
        email,
        phone,
        website,
        notes,
      },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.CREATE,
      entity: 'Vendor',
      entityId: vendor.id,
      details: { name: vendor.name },
    });

    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to create vendor' }, { status: 500 });
  }
}
