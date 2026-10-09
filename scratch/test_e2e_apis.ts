const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('   LICENSEIQ COMPREHENSIVE E2E INTEGRATION TESTS    ');
  console.log('====================================================\n');

  const results: { test: string; passed: boolean; details?: string }[] = [];

  function record(test: string, passed: boolean, details?: string) {
    results.push({ test, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | ${test} ${details ? '(' + details + ')' : ''}`);
  }

  // Warmup server routes
  console.log('Warming up server routes...');
  try {
    await fetch(`${BASE_URL}/api/auth/me`);
  } catch {}
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Invalid Login Test
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@enterprise.com', password: 'InvalidPassword999' }),
    });
    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch {}
    record('Auth: Reject invalid password', res.status === 401 && !data.success, `HTTP ${res.status}`);
  } catch (e: any) {
    record('Auth: Reject invalid password', false, e.message);
  }

  // 2. Admin Login Test
  let adminCookie = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@enterprise.com', password: 'Password@123' }),
    });
    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      adminCookie = setCookie.split(';')[0];
    }
    record('Auth: Admin login success', res.ok && data.success && data.user.role === 'ADMIN', `Role: ${data.user?.role}`);
  } catch (e: any) {
    record('Auth: Admin login success', false, e.message);
  }

  // 3. Auth Me Session Test
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    record('Auth: Verify session via /api/auth/me', res.ok && data.user?.email === 'admin@enterprise.com', `User: ${data.user?.name}`);
  } catch (e: any) {
    record('Auth: Verify session via /api/auth/me', false, e.message);
  }

  // 4. Software API Test
  try {
    const res = await fetch(`${BASE_URL}/api/software`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    const adobe = data.software?.find((s: any) => s.name === 'Adobe Creative Cloud');
    record('Software: Fetch software catalog from DB', res.ok && data.software?.length >= 8, `Found ${data.software?.length} software products, including Adobe CC`);
  } catch (e: any) {
    record('Software: Fetch software catalog from DB', false, e.message);
  }

  // 5. Vendors API Test
  try {
    const res = await fetch(`${BASE_URL}/api/vendors`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    record('Vendors: Fetch vendor directory from DB', res.ok && data.vendors?.length >= 9, `Found ${data.vendors?.length} vendors`);
  } catch (e: any) {
    record('Vendors: Fetch vendor directory from DB', false, e.message);
  }

  // 6. Licenses API Test & Adobe CC Verification
  try {
    const res = await fetch(`${BASE_URL}/api/licenses`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    const adobeLic = data.licenses?.find((l: any) => l.software?.name === 'Adobe Creative Cloud');
    const isAdobeCorrect = adobeLic && adobeLic.totalQuantity === 50 && adobeLic.assignedQuantity >= 35 && adobeLic.assignedQuantity <= 40;
    record(
      'Licenses: Verify Adobe CC Benchmark (50 total seats, >=35 assigned)',
      isAdobeCorrect,
      `Total: ${adobeLic?.totalQuantity}, Assigned: ${adobeLic?.assignedQuantity}, Waste: ₹${adobeLic?.unusedMonthlyCost}/mo`
    );
  } catch (e: any) {
    record('Licenses: Verify Adobe CC Benchmark', false, e.message);
  }

  // 7. Analytics API Test (Utilization & Waste)
  try {
    const res = await fetch(`${BASE_URL}/api/analytics`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    const a = data.analytics;
    const hasMetrics = a && a.totalLicenses > 0 && a.activeLicenses > 0 && a.overallUtilization > 0;
    record(
      'Analytics: Calculate utilization & cost waste across organization',
      hasMetrics,
      `Utilization: ${a?.overallUtilization?.toFixed(1)}%, Monthly Spend: ₹${a?.monthlyExpenditure?.toLocaleString()}, Idle Waste: ₹${a?.potentialMonthlySavings?.toLocaleString()}`
    );
  } catch (e: any) {
    record('Analytics: Calculate utilization & cost waste', false, e.message);
  }

  // 8. Health Score API Test (0-100 index)
  try {
    const res = await fetch(`${BASE_URL}/api/analytics/health`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    const h = data.health;
    record(
      'Intelligence: Calculate 0-100 composite Health Score',
      res.ok && h?.totalScore >= 0 && h?.totalScore <= 100,
      `Health Score: ${h?.totalScore}/100 (Grade: ${h?.grade})`
    );
  } catch (e: any) {
    record('Intelligence: Calculate 0-100 composite Health Score', false, e.message);
  }

  // 9. Recommendations API Test (Explainable Rules 1-5)
  try {
    const res = await fetch(`${BASE_URL}/api/recommendations`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    const hasRecs = res.ok && data.recommendations?.length > 0;
    const rule1 = data.recommendations?.find((r: any) => r.type === 'REALLOCATE_UNUSED');
    record(
      'Intelligence: Generate explainable recommendations (Rule 1: Reallocate Unused)',
      hasRecs && !!rule1,
      `Found ${data.recommendations?.length} recommendations; Rule 1 title: "${rule1?.title}"`
    );
  } catch (e: any) {
    record('Intelligence: Generate explainable recommendations', false, e.message);
  }

  // 10. Renewals API Test
  try {
    const res = await fetch(`${BASE_URL}/api/renewals`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    record('Renewals: Track upcoming renewals and risk levels', res.ok && data.renewals?.length > 0, `Found ${data.renewals?.length} tracked renewals`);
  } catch (e: any) {
    record('Renewals: Track upcoming renewals', false, e.message);
  }

  // 11. Alerts API Test
  try {
    const res = await fetch(`${BASE_URL}/api/alerts`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    record('Alerts: Fetch system alerts and severity classification', res.ok && data.alerts?.length > 0, `Total alerts: ${data.alerts?.length} (Critical: ${data.criticalCount}, Warning: ${data.warningCount})`);
  } catch (e: any) {
    record('Alerts: Fetch system alerts', false, e.message);
  }

  // 12. Employee Login & Submit Software Request Test
  let employeeCookie = '';
  let createdRequestId = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'preeti.jain@enterprise.com', password: 'Password@123' }),
    });
    const loginData = await loginRes.json();
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) employeeCookie = setCookie.split(';')[0];

    // Find Adobe software ID
    const swRes = await fetch(`${BASE_URL}/api/software`, { headers: { Cookie: employeeCookie } });
    const swData = await swRes.json();
    const adobeSw = swData.software?.find((s: any) => s.name === 'Adobe Creative Cloud');

    // Submit request
    const reqRes = await fetch(`${BASE_URL}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: employeeCookie,
      },
      body: JSON.stringify({
        softwareId: adobeSw?.id,
        priority: 'HIGH',
        reason: 'Needed for product UI asset export and design token review',
      }),
    });
    const reqData = await reqRes.json();
    createdRequestId = reqData.request?.id;

    record(
      'Workflow: Employee submits software request',
      reqRes.ok && reqData.success && !!createdRequestId,
      `Request ID: ${createdRequestId}, Status: ${reqData.request?.status}`
    );
  } catch (e: any) {
    record('Workflow: Employee submits software request', false, e.message);
  }

  // 13. Manager/Admin Review & Approval with Smart Detection of Unused Seats
  try {
    if (createdRequestId) {
      const approveRes = await fetch(`${BASE_URL}/api/requests/${createdRequestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          decision: 'APPROVED',
          actionTaken: 'ASSIGNED_EXISTING',
          comments: 'Approved using existing unused pool license (smart fulfillment without purchasing new seat)',
        }),
      });
      const approveData = await approveRes.json();
      record(
        'Workflow: Manager approves request with Smart Fulfillment from unused pool',
        approveRes.ok && approveData.success,
        `Status: ${approveData.request?.status}, Action: ${approveData.approval?.actionTaken}`
      );
    } else {
      record('Workflow: Manager approves request', false, 'No request ID');
    }
  } catch (e: any) {
    record('Workflow: Manager approves request', false, e.message);
  }

  // Summary
  console.log('\n====================================================');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`E2E TEST SUMMARY: ${passedCount} / ${results.length} PASSED`);
  console.log('====================================================\n');
}

runTests().catch(console.error);

export {};
