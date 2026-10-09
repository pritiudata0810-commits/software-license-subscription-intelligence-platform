const fs = require('fs');
const lines = fs.readFileSync('.env', 'utf8').split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.startsWith('DATABASE_URL=') || l.startsWith('DIRECT_URL=')) {
    const parts = l.split('=');
    const key = parts[0];
    const val = parts.slice(1).join('=');
    const u = new URL(val.replace(/^["']|["']$/g, ''));
    console.log(`${key}: protocol=${u.protocol}, host=${u.hostname}, port=${u.port}, pathname=${u.pathname}, search=${u.search}`);
  } else if (l.trim()) {
    console.log(`Line ${i}: ${l.split('=')[0]}=...`);
  }
});
