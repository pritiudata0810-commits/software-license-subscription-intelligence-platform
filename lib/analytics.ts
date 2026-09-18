import prisma from './prisma';

export interface SoftwareUtilization {
  softwareId: string;
  softwareName: string;
  category: string;
  vendorName: string;
  totalLicenses: number;
  activeLicenses: number;
  availableLicenses: number;
  unusedLicenses: number;
  utilizationRate: number; // 0 to 100
  classification: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'LOW' | 'CRITICAL';
  costPerLicense: number;
  monthlyCost: number;
  annualCost: number;
  unusedMonthlyCost: number;
  potentialAnnualSaving: number;
}

export interface DepartmentSpend {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  monthlyBudget: number;
  actualMonthlySpend: number;
  activeLicenseCount: number;
  budgetUtilizationRate: number;
}

export interface PlatformAnalyticsSummary {
  totalSoftware: number;
  totalVendors: number;
  totalLicenses: number;
  activeLicenses: number;
  availableLicenses: number;
  overallUtilization: number;
  monthlyExpenditure: number;
  annualExpenditure: number;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  underutilizedCount: number;
  softwareBreakdown: SoftwareUtilization[];
  departmentBreakdown: DepartmentSpend[];
}

export function classifyUtilization(rate: number): 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'LOW' | 'CRITICAL' {
  if (rate >= 90) return 'EXCELLENT';
  if (rate >= 75) return 'GOOD';
  if (rate >= 50) return 'MODERATE';
  if (rate >= 25) return 'LOW';
  return 'CRITICAL';
}

export async function calculatePlatformAnalytics(): Promise<PlatformAnalyticsSummary> {
  const [softwareList, vendorsCount, departments] = await Promise.all([
    prisma.software.findMany({
      include: {
        vendor: true,
        licenses: {
          include: {
            assignments: {
              where: { status: 'ACTIVE' },
              include: { user: true, department: true },
            },
          },
        },
      },
    }),
    prisma.vendor.count(),
    prisma.department.findMany({
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: { license: true },
        },
      },
    }),
  ]);

  let totalLicenses = 0;
  let totalActiveLicenses = 0;
  let totalMonthlyExpenditure = 0;
  let totalPotentialMonthlySavings = 0;
  let underutilizedCount = 0;

  const softwareBreakdown: SoftwareUtilization[] = [];

  for (const sw of softwareList) {
    let swTotal = 0;
    let swActive = 0;
    let swMonthlyCost = 0;
    let swUnusedCost = 0;
    let avgCostPerLicense = 0;

    for (const lic of sw.licenses) {
      const licTotal = lic.totalQuantity;
      const licActive = lic.assignments.length;
      const licCost = lic.costPerLicense;

      swTotal += licTotal;
      swActive += licActive;
      swMonthlyCost += licTotal * licCost;
      const unusedCount = Math.max(0, licTotal - licActive);
      swUnusedCost += unusedCount * licCost;
      avgCostPerLicense = licCost;
    }

    const swAvailable = Math.max(0, swTotal - swActive);
    const swUnused = swAvailable;
    const utilizationRate = swTotal > 0 ? Number(((swActive / swTotal) * 100).toFixed(1)) : 0;
    const classification = classifyUtilization(utilizationRate);

    if (utilizationRate < 70 && swTotal > 0) {
      underutilizedCount++;
    }

    totalLicenses += swTotal;
    totalActiveLicenses += swActive;
    totalMonthlyExpenditure += swMonthlyCost;
    totalPotentialMonthlySavings += swUnusedCost;

    softwareBreakdown.push({
      softwareId: sw.id,
      softwareName: sw.name,
      category: sw.category,
      vendorName: sw.vendor?.name || 'N/A',
      totalLicenses: swTotal,
      activeLicenses: swActive,
      availableLicenses: swAvailable,
      unusedLicenses: swUnused,
      utilizationRate,
      classification,
      costPerLicense: avgCostPerLicense,
      monthlyCost: swMonthlyCost,
      annualCost: swMonthlyCost * 12,
      unusedMonthlyCost: swUnusedCost,
      potentialAnnualSaving: swUnusedCost * 12,
    });
  }

  const overallUtilization = totalLicenses > 0 
    ? Number(((totalActiveLicenses / totalLicenses) * 100).toFixed(1)) 
    : 0;

  const departmentBreakdown: DepartmentSpend[] = departments.map((dept) => {
    let deptSpend = 0;
    for (const assign of dept.assignments) {
      deptSpend += assign.license.costPerLicense;
    }
    const budgetUtilization = dept.budgetMonthly > 0 
      ? Number(((deptSpend / dept.budgetMonthly) * 100).toFixed(1)) 
      : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      departmentCode: dept.code,
      monthlyBudget: dept.budgetMonthly,
      actualMonthlySpend: deptSpend,
      activeLicenseCount: dept.assignments.length,
      budgetUtilizationRate: budgetUtilization,
    };
  });

  return {
    totalSoftware: softwareList.length,
    totalVendors: vendorsCount,
    totalLicenses,
    activeLicenses: totalActiveLicenses,
    availableLicenses: Math.max(0, totalLicenses - totalActiveLicenses),
    overallUtilization,
    monthlyExpenditure: totalMonthlyExpenditure,
    annualExpenditure: totalMonthlyExpenditure * 12,
    potentialMonthlySavings: totalPotentialMonthlySavings,
    potentialAnnualSavings: totalPotentialMonthlySavings * 12,
    underutilizedCount,
    softwareBreakdown,
    departmentBreakdown,
  };
}
