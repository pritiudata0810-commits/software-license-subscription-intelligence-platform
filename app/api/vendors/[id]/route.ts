import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction, Role } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        software: {
          include: {
            licenses: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, vendor });
  } catch (error: any) {
    console.error('Error fetching vendor by ID:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve vendor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { name, contactPerson, email, phone, website, notes } = body;

    const updated = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        name: name ? name.trim() : undefined,
        contactPerson,
        email,
        phone,
        website,
        notes,
      },
    });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.UPDATE,
      entity: 'Vendor',
      entityId: updated.id,
      details: { updatedName: updated.name },
    });

    return NextResponse.json({ success: true, vendor: updated });
  } catch (error: any) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN]);
  if (errorResponse || !user) return errorResponse;

  try {
    const swCount = await prisma.software.count({ where: { vendorId: params.id } });
    if (swCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete vendor with ${swCount} associated software products.` },
        { status: 400 }
      );
    }

    await prisma.vendor.delete({ where: { id: params.id } });

    await recordAuditLog({
      userId: user.userId,
      action: AuditAction.DELETE,
      entity: 'Vendor',
      entityId: params.id,
    });

    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete vendor' }, { status: 500 });
  }
}
