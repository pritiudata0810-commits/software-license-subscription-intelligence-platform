async function testAuthFull() {
  const BASE = 'http://localhost:3000';
  console.log('--- FULL HTTP AUTHENTICATION TEST ---');

  async function safeJson(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  // Warmup
  console.log('Warming up server...');
  try { await fetch(`${BASE}/api/auth/me`); } catch {}
  await new Promise(r => setTimeout(r, 1500));

  // Test 1: Invalid credentials
  console.log('1. Testing invalid credentials (wrong password)...');
  const badRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@enterprise.com', password: 'WrongPassword999!' })
  });
  const badData = await safeJson(badRes);
  console.log(`   Status: ${badRes.status} (expected 401), Success: ${badData.success}, Error: "${badData.error || badData._raw}"`);

  // Test 2: Non-existent user
  console.log('2. Testing non-existent user...');
  const noUserRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@enterprise.com', password: 'Password@123' })
  });
  const noUserData = await safeJson(noUserRes);
  console.log(`   Status: ${noUserRes.status} (expected 401), Success: ${noUserData.success}, Error: "${noUserData.error || noUserData._raw}"`);

  // Test 3: Admin login
  console.log('3. Testing Admin login...');
  const adminRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@enterprise.com', password: 'Password@123' })
  });
  const adminData = await safeJson(adminRes);
  const rawCookie = adminRes.headers.get('set-cookie') || '';
  const adminCookie = rawCookie.split(';')[0];
  console.log(`   Status: ${adminRes.status}, Success: ${adminData.success}, Role: ${adminData.user?.role}`);
  console.log(`   Cookie received: ${adminCookie ? adminCookie.slice(0, 30) + '...' : 'NONE'}`);

  // Test 4: /api/auth/me with Admin session
  console.log('4. Testing /api/auth/me with Admin cookie...');
  const meRes = await fetch(`${BASE}/api/auth/me`, {
    headers: { Cookie: adminCookie }
  });
  const meData = await safeJson(meRes);
  console.log(`   Status: ${meRes.status}, Success: ${meData.success}, User: ${meData.user?.name} (${meData.user?.email})`);

  // Test 5: Manager login
  console.log('5. Testing Manager login...');
  const mgrRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager.eng@enterprise.com', password: 'Password@123' })
  });
  const mgrData = await safeJson(mgrRes);
  const mgrCookie = (mgrRes.headers.get('set-cookie') || '').split(';')[0];
  console.log(`   Status: ${mgrRes.status}, Success: ${mgrData.success}, Role: ${mgrData.user?.role}`);

  // Test 6: Employee login
  console.log('6. Testing Employee login...');
  const empRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex.chen@enterprise.com', password: 'Password@123' })
  });
  const empData = await safeJson(empRes);
  const empCookie = (empRes.headers.get('set-cookie') || '').split(';')[0];
  console.log(`   Status: ${empRes.status}, Success: ${empData.success}, Role: ${empData.user?.role}`);

  // Test 7: Logout
  console.log('7. Testing /api/auth/logout...');
  const logoutRes = await fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: adminCookie }
  });
  const logoutData = await safeJson(logoutRes);
  const logoutCookie = logoutRes.headers.get('set-cookie') || '';
  console.log(`   Status: ${logoutRes.status}, Success: ${logoutData.success}, Set-Cookie cleared: ${logoutCookie.includes('Max-Age=0')}`);

  console.log('--- ALL AUTH TESTS COMPLETED ---');
}

testAuthFull().catch(console.error);
