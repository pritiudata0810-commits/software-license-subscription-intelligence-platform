import prisma from './prisma';
import { AlertSeverity } from '@prisma/client';

export async function syncAndEvaluateAlerts() {
  const today = new Date();
  const [renewals, softwareList, pendingRequests] = await Promise.all([
    prisma.renewal.findMany({
      include: {
        software: true,
        license: {
          include: { assignments: { where: { status: 'ACTIVE' } } },
        },
      },
    }),
    prisma.software.findMany({
      include: {
        licenses: {
          include: { assignments: { where: { status: 'ACTIVE' } } },
        },
      },
    }),
    prisma.softwareRequest.findMany({
      where: { status: 'PENDING' },
      include: { software: true, user: true },
    }),
  ]);

  const activeAlerts: Array<{
    severity: AlertSeverity;
    title: string;
    message: string;
    entityType: string;
    entityId?: string;
  }> = [];

  // 1. Renewal Alerts (Expired, Due 7 days, Due 30 days)
  for (const r of renewals) {
    const days = Math.ceil((new Date(r.renewalDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      activeAlerts.push({
        severity: AlertSeverity.CRITICAL,
        title: `${r.software.name} License Expired`,
        message: `Contract expired ${Math.abs(days)} day(s) ago. Immediate renewal or deprecation required.`,
        entityType: 'RENEWAL',
        entityId: r.id,
      });
    } else if (days <= 7) {
      activeAlerts.push({
        severity: AlertSeverity.CRITICAL,
        title: `Urgent Renewal: ${r.software.name}`,
        message: `Subscription renews in ${days} day(s). Auto-renewal risk or seat adjustment needed.`,
        entityType: 'RENEWAL',
        entityId: r.id,
      });
    } else if (days <= 30) {
      activeAlerts.push({
        severity: AlertSeverity.WARNING,
        title: `Upcoming Renewal: ${r.software.name}`,
        message: `Subscription renewal due in ${days} days. Review current utilization.`,
        entityType: 'RENEWAL',
        entityId: r.id,
      });
    }
  }

  // 2. Utilization & Waste Alerts
  for (const sw of softwareList) {
    let totalQty = 0;
    let activeQty = 0;
    let unusedWaste = 0;

    for (const lic of sw.licenses) {
      totalQty += lic.totalQuantity;
      const act = lic.assignments.length;
      activeQty += act;
      unusedWaste += Math.max(0, lic.totalQuantity - act) * lic.costPerLicense;
    }

    const utilRate = totalQty > 0 ? (activeQty / totalQty) * 100 : 100;
    if (totalQty > 0 && utilRate < 30) {
      activeAlerts.push({
        severity: AlertSeverity.CRITICAL,
        title: `Critical Underutilization: ${sw.name}`,
        message: `Active utilization is only ${utilRate.toFixed(1)}% across ${totalQty} total provisioned licenses.`,
        entityType: 'LICENSE',
        entityId: sw.id,
      });
    }

    if (unusedWaste >= 50000) {
      activeAlerts.push({
        severity: AlertSeverity.WARNING,
        title: `High Idle Cost Waste: ${sw.name}`,
        message: `Currently incurring ₹${unusedWaste.toLocaleString('en-IN')}/month on unassigned seats.`,
        entityType: 'COST',
        entityId: sw.id,
      });
    }

    if (totalQty > 0 && totalQty === activeQty) {
      activeAlerts.push({
        severity: AlertSeverity.INFO,
        title: `Capacity Reached: ${sw.name}`,
        message: `All ${totalQty} licenses are fully allocated. Additional user requests will require new procurement.`,
        entityType: 'LICENSE',
        entityId: sw.id,
      });
    }
  }

  // 3. Pending Requests
  if (pendingRequests.length > 0) {
    activeAlerts.push({
      severity: AlertSeverity.INFO,
      title: `${pendingRequests.length} Pending Software Request(s)`,
      message: `Team members have submitted license requests awaiting approval.`,
      entityType: 'REQUEST',
    });
  }

  return activeAlerts;
}
