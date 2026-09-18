import prisma from './prisma';
import { AuditAction } from '@prisma/client';

export async function recordAuditLog(params: {
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details || {},
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
}
