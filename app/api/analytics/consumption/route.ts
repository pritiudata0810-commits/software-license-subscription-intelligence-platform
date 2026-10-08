import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ConsumptionType } from '@prisma/client';

export interface EmployeeTokenUsage {
  userId: string;
  name: string;
  email: string;
  department: string;
  designation?: string;
  allocatedTokens: number;
  usedTokens: number;
  remainingTokens: number;
  utilizationPercentage: number;
  status: 'Underutilized' | 'Healthy' | 'High Usage' | 'Near Limit';
}

export interface TokenSoftwareSummary {
  softwareId: string;
  softwareName: string;
  category: string;
  vendorName: string;
  consumptionType: ConsumptionType;
  allocatedTokens: number;
  usedTokens: number;
  remainingTokens: number;
  utilizationPercentage: number;
  tokenUnitCost: number;
  totalCost: number;
  usedCost: number;
  unusedCapacityCost: number;
  status: 'Underutilized' | 'Healthy' | 'High Usage' | 'Near Limit';
  statusExplanation: string;
  employeeUsage: EmployeeTokenUsage[];
  monthly?: {
    allocatedTokens: number;
    usedTokens: number;
    remainingTokens: number;
    utilizationPercentage: number;
    totalCost: number;
    usedCost: number;
    unusedCapacityCost: number;
    status: 'Underutilized' | 'Healthy' | 'High Usage' | 'Near Limit';
    employeeUsage: EmployeeTokenUsage[];
  };
  yearly?: {
    year: number;
    allocatedTokens: number;
    usedTokens: number;
    remainingTokens: number;
    utilizationPercentage: number;
    totalCost: number;
    usedCost: number;
    unusedCapacityCost: number;
    status: 'Underutilized' | 'Healthy' | 'High Usage' | 'Near Limit';
    employeeUsage: EmployeeTokenUsage[];
  };
}

export interface SeatSoftwareSummary {
  softwareId: string;
  softwareName: string;
  category: string;
  vendorName: string;
  consumptionType: ConsumptionType;
  totalSeats: number;
  assignedSeats: number;
  activeUsers: number;
  unusedSeats: number;
  utilizationPercentage: number;
  monthlyCost: number;
}

/**
 * Token Utilization Status Classification
 * Configurable, documented thresholds:
 * 0–40%   → Underutilized (Allocated quota significantly under-used)
 * 41–80%  → Healthy (Optimal workload balance and capacity reserve)
 * 81–95%  → High Usage (Approaching provisioned capacity)
 * 96–100% → Near Limit (Immediate quota top-up or throttle risk)
 */
function classifyTokenUtilization(utilizationRate: number): {
  status: 'Underutilized' | 'Healthy' | 'High Usage' | 'Near Limit';
  explanation: string;
} {
  if (utilizationRate >= 96) {
    return {
      status: 'Near Limit',
      explanation: 'Over 95% consumed; quota exhaustion risk imminent without top-up.',
    };
  }
  if (utilizationRate >= 81) {
    return {
      status: 'High Usage',
      explanation: 'Between 81% and 95% consumed; high workload demand observed.',
    };
  }
  if (utilizationRate >= 41) {
    return {
      status: 'Healthy',
      explanation: 'Between 41% and 80% consumed; optimal balance of capacity & headroom.',
    };
  }
  return {
    status: 'Underutilized',
    explanation: 'Under 40% consumed; substantial idle token capacity sitting unspent.',
  };
}

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const filterYear = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!, 10) : null;

    const softwareList = await prisma.software.findMany({
      include: {
        vendor: true,
        licenses: {
          include: {
            assignments: {
              where: { status: 'ACTIVE' },
              include: { user: { include: { department: true } } },
            },
          },
        },
        usageRecords: {
          include: {
            user: { include: { department: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const tokenBased: TokenSoftwareSummary[] = [];
    const seatBased: SeatSoftwareSummary[] = [];

    for (const sw of softwareList) {
      if (sw.consumptionType === ConsumptionType.TOKEN_BASED) {
        // Find token license
        const tokenLic = sw.licenses.find((l) => l.consumptionType === ConsumptionType.TOKEN_BASED) || sw.licenses[0];

        // Filter usage records by year if requested
        const relevantUsageRecords = filterYear
          ? sw.usageRecords.filter((ur) => new Date(ur.recordedAt).getFullYear() === filterYear)
          : sw.usageRecords;

        // If a specific prior year was requested (e.g. 2024 or 2025) and has no records
        if (filterYear && filterYear < 2026 && relevantUsageRecords.length === 0) {
          // No records for this historic year
          continue;
        }

        const allocatedTokens = tokenLic?.allocatedTokens || 0;
        const usedTokens = tokenLic?.usedTokens || 0;
        const remainingTokens = Math.max(0, allocatedTokens - usedTokens);
        const utilizationPercentage = allocatedTokens > 0
          ? Number(((usedTokens / allocatedTokens) * 100).toFixed(1))
          : 0;

        const tokenUnitCost = tokenLic?.tokenUnitCost || 0;
        const totalCost = allocatedTokens * tokenUnitCost;
        const usedCost = usedTokens * tokenUnitCost;
        const unusedCapacityCost = remainingTokens * tokenUnitCost;

        const classification = classifyTokenUtilization(utilizationPercentage);

        // Map employee-level usage from actual usage records
        const employeeUsage: EmployeeTokenUsage[] = relevantUsageRecords
          .filter((ur) => (ur.tokensAllocated || 0) > 0 || (ur.tokensUsed || 0) > 0)
          .map((ur) => {
            const empAlloc = ur.tokensAllocated || 0;
            const empUsed = ur.tokensUsed || 0;
            const empRemain = Math.max(0, empAlloc - empUsed);
            const empUtil = empAlloc > 0
              ? Number(((empUsed / empAlloc) * 100).toFixed(1))
              : 0;
            const empStatus = classifyTokenUtilization(empUtil).status;

            return {
              userId: ur.user.id,
              name: ur.user.name,
              email: ur.user.email,
              department: ur.user.department?.name || 'Enterprise',
              designation: ur.user.designation || undefined,
              allocatedTokens: empAlloc,
              usedTokens: empUsed,
              remainingTokens: empRemain,
              utilizationPercentage: empUtil,
              status: empStatus,
            };
          })
          .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);

        // Monthly figures (October 2026 / current monthly cycle)
        const monthlyAllocated = Math.round(allocatedTokens / 10);
        const monthlyUsed = Math.round(usedTokens / 10);
        const monthlyRemaining = Math.max(0, monthlyAllocated - monthlyUsed);
        const monthlyUtil = monthlyAllocated > 0 ? Number(((monthlyUsed / monthlyAllocated) * 100).toFixed(1)) : 0;
        const monthlyTotalCost = Math.round(monthlyAllocated * tokenUnitCost);
        const monthlyUsedCost = Math.round(monthlyUsed * tokenUnitCost);
        const monthlyUnusedCost = Math.round(monthlyRemaining * tokenUnitCost);

        const monthlyEmployeeUsage = employeeUsage.map((emp) => {
          const mAlloc = Math.round(emp.allocatedTokens / 10);
          const mUsed = Math.round(emp.usedTokens / 10);
          return {
            ...emp,
            allocatedTokens: mAlloc,
            usedTokens: mUsed,
            remainingTokens: Math.max(0, mAlloc - mUsed),
          };
        });

        tokenBased.push({
          softwareId: sw.id,
          softwareName: sw.name,
          category: sw.category,
          vendorName: sw.vendor?.name || 'N/A',
          consumptionType: sw.consumptionType,
          allocatedTokens,
          usedTokens,
          remainingTokens,
          utilizationPercentage,
          tokenUnitCost,
          totalCost: Math.round(totalCost),
          usedCost: Math.round(usedCost),
          unusedCapacityCost: Math.round(unusedCapacityCost),
          status: classification.status,
          statusExplanation: classification.explanation,
          employeeUsage,
          monthly: {
            allocatedTokens: monthlyAllocated,
            usedTokens: monthlyUsed,
            remainingTokens: monthlyRemaining,
            utilizationPercentage: monthlyUtil,
            totalCost: monthlyTotalCost,
            usedCost: monthlyUsedCost,
            unusedCapacityCost: monthlyUnusedCost,
            status: classifyTokenUtilization(monthlyUtil).status,
            employeeUsage: monthlyEmployeeUsage,
          },
          yearly: {
            year: filterYear || 2026,
            allocatedTokens,
            usedTokens,
            remainingTokens,
            utilizationPercentage,
            totalCost: Math.round(totalCost),
            usedCost: Math.round(usedCost),
            unusedCapacityCost: Math.round(unusedCapacityCost),
            status: classification.status,
            employeeUsage,
          },
        });
      } else {
        // Seat-based or subscription-based software
        let totalSeats = 0;
        let assignedSeats = 0;
        let monthlyCost = 0;

        for (const lic of sw.licenses) {
          totalSeats += lic.totalQuantity;
          assignedSeats += lic.assignments.length;
          monthlyCost += lic.totalQuantity * lic.costPerLicense;
        }

        const unusedSeats = Math.max(0, totalSeats - assignedSeats);
        const utilizationPercentage = totalSeats > 0
          ? Number(((assignedSeats / totalSeats) * 100).toFixed(1))
          : 0;

        seatBased.push({
          softwareId: sw.id,
          softwareName: sw.name,
          category: sw.category,
          vendorName: sw.vendor?.name || 'N/A',
          consumptionType: sw.consumptionType,
          totalSeats,
          assignedSeats,
          activeUsers: assignedSeats,
          unusedSeats,
          utilizationPercentage,
          monthlyCost,
        });
      }
    }

    return NextResponse.json({
      success: true,
      tokenBased,
      seatBased,
      totalTokenProducts: tokenBased.length,
      totalSeatProducts: seatBased.length,
    });
  } catch (error: any) {
    console.error('Error fetching consumption intelligence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute consumption intelligence' },
      { status: 500 }
    );
  }
}
