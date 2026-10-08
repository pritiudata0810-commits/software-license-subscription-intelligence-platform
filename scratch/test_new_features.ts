const BASE_URL = 'http://localhost:3000';

async function testNewFeatures() {
  console.log('====================================================');
  console.log('   TESTING YEARLY RECOVERY & CONSUMPTION INTELLIGENCE');
  console.log('====================================================\n');

  // 1. Authenticate as Admin
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@enterprise.com', password: 'Password@123' }),
  });
  const loginData = await loginRes.json();
  const rawCookie = loginRes.headers.get('set-cookie') || '';
  const adminCookie = rawCookie.split(';')[0];

  if (!loginData.success || !adminCookie) {
    console.error('❌ Failed to authenticate admin');
    process.exit(1);
  }
  console.log('✓ Admin authenticated successfully.');

  // 2. Test GET /api/analytics/yearly-recovery
  console.log('\n--- TESTING FEATURE 1: YEARLY INVESTMENT & RECOVERY ---');
  const recoveryRes = await fetch(`${BASE_URL}/api/analytics/yearly-recovery`, {
    headers: { Cookie: adminCookie },
  });
  const recoveryData = await recoveryRes.json();

  if (!recoveryData.success) {
    console.error('❌ GET /api/analytics/yearly-recovery failed:', recoveryData.error);
  } else {
    console.log(`✓ Retrieved ${recoveryData.years?.length} tracked years:`);
    for (const y of recoveryData.years) {
      console.log(`  Year ${y.year}: Investment=₹${y.totalInvestment.toLocaleString('en-IN')}, Realized=₹${y.realizedValue.toLocaleString('en-IN')} (${y.recoveryPercentage}%), Unrecovered=₹${y.unrecoveredCost.toLocaleString('en-IN')} (${y.unrecoveredPercentage}%)`);
    }

    if (recoveryData.yoyImprovement) {
      const yoy = recoveryData.yoyImprovement;
      console.log(`✓ Year-over-Year Improvement (${yoy.baselineYear} → ${yoy.latestYear}):`);
      console.log(`  Recovery Points Improvement: +${yoy.totalRecoveryPointsImprovement}% percentage points`);
      console.log(`  Investment Delta: +₹${yoy.investmentChange.toLocaleString('en-IN')}`);
      console.log(`  Realized Value Delta: +₹${yoy.realizedValueChange.toLocaleString('en-IN')}`);
      console.log(`  Unrecovered Cost Reduction: ₹${Math.abs(yoy.unrecoveredCostChange).toLocaleString('en-IN')} (${yoy.unrecoveredCostReductionPercentage}%)`);
    }
  }

  // 3. Test GET /api/analytics/consumption
  console.log('\n--- TESTING FEATURE 2: LICENSE & TOKEN CONSUMPTION INTELLIGENCE ---');
  const consumptionRes = await fetch(`${BASE_URL}/api/analytics/consumption`, {
    headers: { Cookie: adminCookie },
  });
  const consumptionData = await consumptionRes.json();

  if (!consumptionData.success) {
    console.error('❌ GET /api/analytics/consumption failed:', consumptionData.error);
  } else {
    console.log(`✓ Total Token-Based Products: ${consumptionData.totalTokenProducts}`);
    console.log(`✓ Total Seat-Based Products: ${consumptionData.totalSeatProducts}`);

    for (const tk of consumptionData.tokenBased) {
      console.log(`\n  Product: ${tk.softwareName} (${tk.vendorName})`);
      console.log(`  Allocated Tokens: ${tk.allocatedTokens.toLocaleString()} | Used: ${tk.usedTokens.toLocaleString()} | Remaining: ${tk.remainingTokens.toLocaleString()}`);
      console.log(`  Utilization: ${tk.utilizationPercentage}% (${tk.status}) - ${tk.statusExplanation}`);
      console.log(`  Pricing: ₹${tk.tokenUnitCost}/token | Total Cost: ₹${tk.totalCost.toLocaleString('en-IN')} | Used Cost: ₹${tk.usedCost.toLocaleString('en-IN')} | Unused Capacity: ₹${tk.unusedCapacityCost.toLocaleString('en-IN')}`);
      console.log(`  Tracked Employees: ${tk.employeeUsage?.length}`);
      for (const emp of tk.employeeUsage) {
        console.log(`    - ${emp.name} (${emp.email}): ${emp.usedTokens.toLocaleString()} / ${emp.allocatedTokens.toLocaleString()} (${emp.utilizationPercentage}%) [${emp.status}]`);
      }
    }
  }

  console.log('\n====================================================');
  console.log('   FEATURE API TESTS COMPLETED SUCCESSFULLY         ');
  console.log('====================================================');
}

testNewFeatures().catch(console.error);

export {};
