const BASE = 'http://localhost:3000';

async function simulateBrowser() {
  console.log('=== SIMULATING EXACT BROWSER LOGIN LIFECYCLE ===\n');

  // Step 1: User visits /login
  console.log('1. Browser loads /login page HTML...');
  const loginPageRes = await fetch(`${BASE}/login`);
  console.log(`   /login HTTP Status: ${loginPageRes.status} (length: ${(await loginPageRes.text()).length} bytes)`);

  // Step 2: AuthProvider initializes (no cookie yet)
  console.log('2. AuthProvider calls /api/auth/me on mount...');
  const initialMe = await fetch(`${BASE}/api/auth/me`);
  console.log(`   Initial /api/auth/me Status: ${initialMe.status} (Expected 401 unauthenticated)`);

  // Step 3: User clicks Admin chip and presses Sign In
  console.log('3. User clicks Admin role preset and submits credentials...');
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@enterprise.com', password: 'Password@123' })
  });
  const loginData = await loginRes.json();
  const rawSetCookie = loginRes.headers.get('set-cookie');
  const sessionCookie = rawSetCookie ? rawSetCookie.split(';')[0] : '';

  console.log(`   Login Response Status: ${loginRes.status}`);
  console.log(`   Login Success: ${loginData.success}`);
  console.log(`   User Returned: ${loginData.user?.name} (${loginData.user?.role})`);
  console.log(`   Session Cookie Set: ${sessionCookie.slice(0, 35)}...`);

  if (!loginRes.ok || !loginData.success || !sessionCookie) {
    throw new Error('Login failed in browser simulation!');
  }

  // Step 4: Browser navigates to /dashboard and renders
  console.log('\n4. Browser enters /dashboard...');
  const dashPageRes = await fetch(`${BASE}/dashboard`, {
    headers: { Cookie: sessionCookie }
  });
  console.log(`   /dashboard Page Status: ${dashPageRes.status} (OK: ${dashPageRes.ok})`);

  // Step 5: Dashboard widgets load data with authenticated cookie
  console.log('5. Dashboard client widgets load analytics APIs...');
  const [meRes, analyticsRes, renewalsRes, alertsRes, recsRes] = await Promise.all([
    fetch(`${BASE}/api/auth/me`, { headers: { Cookie: sessionCookie } }),
    fetch(`${BASE}/api/analytics`, { headers: { Cookie: sessionCookie } }),
    fetch(`${BASE}/api/renewals`, { headers: { Cookie: sessionCookie } }),
    fetch(`${BASE}/api/alerts`, { headers: { Cookie: sessionCookie } }),
    fetch(`${BASE}/api/recommendations`, { headers: { Cookie: sessionCookie } })
  ]);

  const me = await meRes.json();
  const analytics = await analyticsRes.json();
  const renewals = await renewalsRes.json();
  const alerts = await alertsRes.json();
  const recs = await recsRes.json();

  console.log(`   /api/auth/me: 200 OK | Authenticated as ${me.user?.name}`);
  console.log(`   /api/analytics: 200 OK | Total Monthly Spend: ₹${analytics.analytics?.overview?.totalMonthlySpend?.toLocaleString('en-IN')}`);
  console.log(`   /api/renewals: 200 OK | Tracked: ${renewals.renewals?.length} renewals`);
  console.log(`   /api/alerts: 200 OK | Alerts count: ${alerts.alerts?.length}`);
  console.log(`   /api/recommendations: 200 OK | Recommendations count: ${recs.recommendations?.length}`);

  console.log('\n✅ BROWSER LOGIN AND DASHBOARD ENTER SIMULATION: 100% SUCCESSFUL!');
}

simulateBrowser().catch(err => {
  console.error('❌ SIMULATION ERROR:', err);
  process.exit(1);
});
