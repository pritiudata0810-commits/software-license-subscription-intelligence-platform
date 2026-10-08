import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface YearlyRecoveryMetric {
  year: number;
  totalInvestment: number;
  realizedValue: number;
  unrecoveredCost: number;
  recoveryPercentage: number;
  unrecoveredPercentage: number;
  recordsCount: number;
}

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const costRecords = await prisma.costRecord.findMany({
      include: {
        software: true,
        department: true,
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    if (costRecords.length === 0) {
      return NextResponse.json({
        success: true,
        years: [],
        message: 'No recovery data available yet.',
      });
    }

    // Group cost records by year
    const yearMap = new Map<number, {
      investment: number;
      realizedValue: number;
      recordsCount: number;
    }>();

    for (const record of costRecords) {
      const yr = record.year;
      // Derive investment: explicit investment field or allocatedCost + wastedCost
      const recordInvestment = (record.investment && record.investment > 0)
        ? record.investment
        : (record.allocatedCost + record.wastedCost);

      // Derive realized value: explicit realizedValue field or allocatedCost
      const recordRealized = (record.realizedValue && record.realizedValue > 0)
        ? record.realizedValue
        : record.allocatedCost;

      const current = yearMap.get(yr) || { investment: 0, realizedValue: 0, recordsCount: 0 };
      current.investment += recordInvestment;
      current.realizedValue += recordRealized;
      current.recordsCount += 1;
      yearMap.set(yr, current);
    }

    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);

    const yearlyMetrics: YearlyRecoveryMetric[] = sortedYears.map((year) => {
      const data = yearMap.get(year)!;
      const investment = Math.round(data.investment);
      const realized = Math.round(data.realizedValue);
      const unrecovered = Math.max(0, investment - realized);

      const recoveryPercentage = investment > 0
        ? Number(((realized / investment) * 100).toFixed(1))
        : 0;

      const unrecoveredPercentage = investment > 0
        ? Number(((unrecovered / investment) * 100).toFixed(1))
        : 0;

      return {
        year,
        totalInvestment: investment,
        realizedValue: realized,
        unrecoveredCost: unrecovered,
        recoveryPercentage,
        unrecoveredPercentage,
        recordsCount: data.recordsCount,
      };
    });

    // Calculate Year-over-Year (YoY) improvements
    let yoyImprovement = null;
    if (yearlyMetrics.length >= 2) {
      const baseline = yearlyMetrics[0]; // Earliest tracked year
      const latest = yearlyMetrics[yearlyMetrics.length - 1]; // Latest year

      const prevYear = yearlyMetrics[yearlyMetrics.length - 2]; // Immediate previous year

      yoyImprovement = {
        baselineYear: baseline.year,
        latestYear: latest.year,
        // Overall multi-year improvement in percentage points
        totalRecoveryPointsImprovement: Number((latest.recoveryPercentage - baseline.recoveryPercentage).toFixed(1)),
        // Immediate previous year improvement in percentage points
        oneYearRecoveryPointsImprovement: Number((latest.recoveryPercentage - prevYear.recoveryPercentage).toFixed(1)),
        investmentChange: latest.totalInvestment - baseline.totalInvestment,
        investmentChangePercentage: baseline.totalInvestment > 0
          ? Number((((latest.totalInvestment - baseline.totalInvestment) / baseline.totalInvestment) * 100).toFixed(1))
          : 0,
        realizedValueChange: latest.realizedValue - baseline.realizedValue,
        realizedValueChangePercentage: baseline.realizedValue > 0
          ? Number((((latest.realizedValue - baseline.realizedValue) / baseline.realizedValue) * 100).toFixed(1))
          : 0,
        unrecoveredCostChange: latest.unrecoveredCost - baseline.unrecoveredCost,
        unrecoveredCostReductionPercentage: baseline.unrecoveredCost > 0
          ? Number((((baseline.unrecoveredCost - latest.unrecoveredCost) / baseline.unrecoveredCost) * 100).toFixed(1))
          : 0,
      };
    }

    // Group software records by year
    const softwareByYear: Record<number, Array<{
      softwareId: string;
      softwareName: string;
      category: string;
      investment: number;
      realizedValue: number;
      unrecoveredCost: number;
      recoveryRate: number;
      month: number;
    }>> = {};

    for (const record of costRecords) {
      const yr = record.year;
      if (!softwareByYear[yr]) softwareByYear[yr] = [];

      const recordInvestment = (record.investment && record.investment > 0)
        ? record.investment
        : (record.allocatedCost + record.wastedCost);

      const recordRealized = (record.realizedValue && record.realizedValue > 0)
        ? record.realizedValue
        : record.allocatedCost;

      const recordUnrecovered = Math.max(0, recordInvestment - recordRealized);
      const recordRate = recordInvestment > 0 ? Number(((recordRealized / recordInvestment) * 100).toFixed(1)) : 0;

      softwareByYear[yr].push({
        softwareId: record.softwareId,
        softwareName: record.software?.name || 'Unknown',
        category: record.software?.category || 'General',
        investment: Math.round(recordInvestment),
        realizedValue: Math.round(recordRealized),
        unrecoveredCost: Math.round(recordUnrecovered),
        recoveryRate: recordRate,
        month: record.month,
      });
    }

    return NextResponse.json({
      success: true,
      years: yearlyMetrics,
      latestYear: yearlyMetrics[yearlyMetrics.length - 1] || null,
      baselineYear: yearlyMetrics[0] || null,
      yoyImprovement,
      softwareByYear,
    });
  } catch (error: any) {
    console.error('Error computing yearly recovery analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute yearly recovery analytics' },
      { status: 500 }
    );
  }
}
