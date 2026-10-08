import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role, SoftwareStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status') as SoftwareStatus | null;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { vendor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (category) {
      whereClause.category = category;
    }
    if (status) {
      whereClause.status = status;
    }

    const softwareList = await prisma.software.findMany({
      where: whereClause,
      include: {
        vendor: true,
        licenses: {
          include: {
            assignments: {
              where: { status: 'ACTIVE' },
              include: {
                user: { select: { id: true, name: true, email: true, designation: true } },
                department: { select: { id: true, name: true, code: true } },
              },
            },
            renewals: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const enriched = softwareList.map((sw) => {
      let totalLicenses = 0;
      let activeAssignments = 0;
      let monthlyCost = 0;
      let costPerLicense = 0;
      let allocatedTokens = 0;
      let usedTokens = 0;
      let tokenUnitCost = 0;

      for (const lic of sw.licenses) {
        if (sw.consumptionType === 'TOKEN_BASED' || lic.consumptionType === 'TOKEN_BASED') {
          allocatedTokens += lic.allocatedTokens || 0;
          usedTokens += lic.usedTokens || 0;
          tokenUnitCost = lic.tokenUnitCost || 0;
          monthlyCost += lic.allocatedTokens ? (lic.allocatedTokens * (lic.tokenUnitCost || 0)) : (lic.totalQuantity * lic.costPerLicense);
          costPerLicense = lic.costPerLicense || (lic.tokenUnitCost ? lic.tokenUnitCost * 1000 : 0);
          activeAssignments += lic.assignments.length;
          totalLicenses += lic.totalQuantity;
        } else {
          totalLicenses += lic.totalQuantity;
          activeAssignments += lic.assignments.length;
          monthlyCost += lic.totalQuantity * lic.costPerLicense;
          costPerLicense = lic.costPerLicense;
        }
      }

      const availableLicenses = Math.max(0, totalLicenses - activeAssignments);
      const unusedLicenses = availableLicenses;
      const utilizationRate = sw.consumptionType === 'TOKEN_BASED' && allocatedTokens > 0
        ? Number(((usedTokens / allocatedTokens) * 100).toFixed(1))
        : (totalLicenses > 0 
          ? Number(((activeAssignments / totalLicenses) * 100).toFixed(1)) 
          : 0);

      const unusedMonthlyCost = sw.consumptionType === 'TOKEN_BASED' && allocatedTokens > 0
        ? Math.max(0, allocatedTokens - usedTokens) * tokenUnitCost
        : unusedLicenses * costPerLicense;

      return {
        id: sw.id,
        name: sw.name,
        category: sw.category,
        description: sw.description,
        version: sw.version,
        website: sw.website,
        status: sw.status,
        consumptionType: sw.consumptionType,
        vendor: sw.vendor,
        totalLicenses,
        activeAssignments,
        availableLicenses,
        unusedLicenses,
        allocatedTokens,
        usedTokens,
        tokenUnitCost,
        utilizationRate,
        costPerLicense,
        monthlyCost,
        annualCost: monthlyCost * 12,
        unusedMonthlyCost,
        potentialAnnualSaving: unusedMonthlyCost * 12,
        licenses: sw.licenses,
        createdAt: sw.createdAt,
      };
    });

    return NextResponse.json({ success: true, count: enriched.length, software: enriched });
  } catch (error: any) {
    console.error('Error fetching software catalog:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve software catalog' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { name, category, description, version, website, vendorId, initialLicenses, costPerLicense } = body;

    if (!name || !category || !vendorId) {
      return NextResponse.json(
        { success: false, error: 'Name, category, and vendor are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.software.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A software product with this name already exists' },
        { status: 409 }
      );
    }

    const software = await prisma.$transaction(async (tx) => {
      const sw = await tx.software.create({
        data: {
          name: name.trim(),
          category: category.trim(),
          description,
          version,
          website,
          vendorId,
        },
      });

      if (initialLicenses && initialLicenses > 0) {
        const renewalDate = new Date();
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);

        const lic = await tx.license.create({
          data: {
            softwareId: sw.id,
            vendorId,
            totalQuantity: parseInt(initialLicenses, 10),
            costPerLicense: parseFloat(costPerLicense) || 0,
            renewalDate,
            notes: 'Initial license provisioning',
          },
        });

        await tx.renewal.create({
          data: {
            softwareId: sw.id,
            licenseId: lic.id,
            renewalDate,
            estimatedCost: lic.totalQuantity * lic.costPerLicense,
          },
        });
      }

      return sw;
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.CREATE,
      entity: 'Software',
      entityId: software.id,
      details: { name: software.name, category: software.category },
    });

    return NextResponse.json({ success: true, software }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating software:', error);
    return NextResponse.json({ success: false, error: 'Failed to create software record' }, { status: 500 });
  }
}
