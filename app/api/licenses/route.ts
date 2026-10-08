import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role, LicenseType, BillingFrequency, LicenseStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const softwareId = searchParams.get('softwareId');
    const status = searchParams.get('status') as LicenseStatus | null;

    const where: any = {};
    if (softwareId) where.softwareId = softwareId;
    if (status) where.status = status;

    const licenses = await prisma.license.findMany({
      where,
      include: {
        software: { include: { vendor: true } },
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            user: { select: { id: true, name: true, email: true, designation: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
        renewals: true,
      },
      orderBy: { renewalDate: 'asc' },
    });

    const enriched = licenses.map((lic) => {
      const isToken = lic.consumptionType === 'TOKEN_BASED';
      const allocatedTokens = lic.allocatedTokens || 0;
      const usedTokens = lic.usedTokens || 0;
      const remainingTokens = Math.max(0, allocatedTokens - usedTokens);
      const tokenUnitCost = lic.tokenUnitCost || 0;

      const assignedQuantity = lic.assignments.length;
      const availableQuantity = Math.max(0, lic.totalQuantity - assignedQuantity);
      const unusedQuantity = availableQuantity;
      
      const utilizationRate = isToken && allocatedTokens > 0
        ? Number(((usedTokens / allocatedTokens) * 100).toFixed(1))
        : (lic.totalQuantity > 0 
          ? Number(((assignedQuantity / lic.totalQuantity) * 100).toFixed(1)) 
          : 0);

      const monthlyExpenditure = isToken
        ? (allocatedTokens * tokenUnitCost || lic.totalQuantity * lic.costPerLicense)
        : (lic.totalQuantity * lic.costPerLicense);

      const unusedMonthlyCost = isToken
        ? remainingTokens * tokenUnitCost
        : unusedQuantity * lic.costPerLicense;

      const potentialAnnualSaving = unusedMonthlyCost * 12;

      return {
        id: lic.id,
        licenseKey: lic.licenseKey,
        licenseType: lic.licenseType,
        consumptionType: lic.consumptionType,
        allocatedTokens,
        usedTokens,
        remainingTokens,
        tokenUnitCost,
        totalQuantity: lic.totalQuantity,
        assignedQuantity,
        availableQuantity,
        unusedQuantity,
        utilizationRate,
        costPerLicense: lic.costPerLicense,
        billingFrequency: lic.billingFrequency,
        monthlyExpenditure,
        annualExpenditure: monthlyExpenditure * 12,
        unusedMonthlyCost,
        potentialAnnualSaving,
        purchaseDate: lic.purchaseDate,
        startDate: lic.startDate,
        renewalDate: lic.renewalDate,
        expiryDate: lic.expiryDate,
        status: lic.status,
        notes: lic.notes,
        software: lic.software,
        assignments: lic.assignments,
        renewals: lic.renewals,
      };
    });

    return NextResponse.json({ success: true, count: enriched.length, licenses: enriched });
  } catch (error: any) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve licenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const {
      softwareId,
      licenseKey,
      licenseType = LicenseType.PER_USER,
      totalQuantity,
      costPerLicense,
      billingFrequency = BillingFrequency.MONTHLY,
      purchaseDate,
      renewalDate,
      expiryDate,
      notes,
    } = body;

    if (!softwareId || !totalQuantity || costPerLicense === undefined || !renewalDate) {
      return NextResponse.json(
        { success: false, error: 'Software, total quantity, cost per license, and renewal date are required' },
        { status: 400 }
      );
    }

    const sw = await prisma.software.findUnique({ where: { id: softwareId } });
    if (!sw) {
      return NextResponse.json({ success: false, error: 'Software not found' }, { status: 404 });
    }

    const totalQty = parseInt(totalQuantity, 10);
    const cost = parseFloat(costPerLicense);

    const license = await prisma.$transaction(async (tx) => {
      const lic = await tx.license.create({
        data: {
          softwareId,
          vendorId: sw.vendorId,
          licenseKey,
          licenseType,
          totalQuantity: totalQty,
          costPerLicense: cost,
          billingFrequency,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          startDate: new Date(),
          renewalDate: new Date(renewalDate),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          notes,
        },
      });

      await tx.renewal.create({
        data: {
          softwareId,
          licenseId: lic.id,
          renewalDate: new Date(renewalDate),
          estimatedCost: totalQty * cost,
        },
      });

      return lic;
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.CREATE,
      entity: 'License',
      entityId: license.id,
      details: { softwareName: sw.name, totalQuantity: totalQty, costPerLicense: cost },
    });

    return NextResponse.json({ success: true, license }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating license:', error);
    return NextResponse.json({ success: false, error: 'Failed to create license' }, { status: 500 });
  }
}
