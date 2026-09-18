import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import {
  AuditAction,
  Role,
  RequestStatus,
  ApprovalDecision,
  ApprovalAction,
  AssignmentStatus,
} from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = requireAuth(req, [Role.ADMIN, Role.MANAGER]);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await req.json();
    const { decision, comments } = body; // 'APPROVED' or 'REJECTED'

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "Decision must be either 'APPROVED' or 'REJECTED'" },
        { status: 400 }
      );
    }

    const request = await prisma.softwareRequest.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        software: {
          include: {
            licenses: {
              include: { assignments: { where: { status: 'ACTIVE' } } },
            },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Software request not found' }, { status: 404 });
    }

    if (request.status !== RequestStatus.PENDING) {
      return NextResponse.json(
        { success: false, error: `Request is already ${request.status}` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalStatus: RequestStatus = RequestStatus.REJECTED;
      let finalAction: ApprovalAction = ApprovalAction.REJECTED_NO_BUDGET;
      let assignedLicenseId: string | null = null;

      if (decision === 'APPROVED') {
        // Search for an available license in the software pool
        let selectedLicense = null;
        for (const lic of request.software.licenses) {
          const activeCount = lic.assignments.length;
          if (lic.totalQuantity - activeCount > 0) {
            selectedLicense = lic;
            break;
          }
        }

        if (selectedLicense) {
          // Re-use existing unassigned license!
          finalStatus = RequestStatus.FULFILLED_EXISTING;
          finalAction = ApprovalAction.ASSIGNED_EXISTING;
          assignedLicenseId = selectedLicense.id;

          // Create assignment
          await tx.licenseAssignment.create({
            data: {
              licenseId: selectedLicense.id,
              userId: request.userId,
              departmentId: request.user.departmentId,
              status: AssignmentStatus.ACTIVE,
              notes: `Fulfillment of software request #${request.id}`,
            },
          });

          // Create usage record
          await tx.usageRecord.create({
            data: {
              userId: request.userId,
              softwareId: request.softwareId,
              licenseId: selectedLicense.id,
              loginCount: 1,
              hoursUsed: 1.0,
              utilizationStatus: 'MODERATE',
            },
          });
        } else {
          // No unused license in pool -> Approve for procurement
          finalStatus = RequestStatus.APPROVED;
          finalAction = ApprovalAction.PURCHASE_AUTHORIZED;
        }
      }

      // Update request status
      const updatedReq = await tx.softwareRequest.update({
        where: { id: params.id },
        data: { status: finalStatus },
      });

      // Create Approval record
      const approval = await tx.requestApproval.create({
        data: {
          requestId: params.id,
          approvedById: user.userId,
          decision: decision === 'APPROVED' ? ApprovalDecision.APPROVED : ApprovalDecision.REJECTED,
          actionTaken: finalAction,
          comments,
        },
      });

      return { updatedReq, approval, finalAction, assignedLicenseId };
    });

    await recordAuditLog({
      userId: user.userId,
      action: decision === 'APPROVED' ? AuditAction.APPROVE_REQUEST : AuditAction.REJECT_REQUEST,
      entity: 'SoftwareRequest',
      entityId: params.id,
      details: {
        decision,
        actionTaken: result.finalAction,
        softwareName: request.software.name,
        requestedBy: request.user.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: result.finalAction === ApprovalAction.ASSIGNED_EXISTING
        ? `Request approved! Allocated an existing unused license for ${request.software.name} immediately to ${request.user.name}.`
        : `Request ${decision.toLowerCase()} successfully.`,
      request: result.updatedReq,
      approval: result.approval,
    });
  } catch (error: any) {
    console.error('Error processing approval:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request approval' }, { status: 500 });
  }
}
