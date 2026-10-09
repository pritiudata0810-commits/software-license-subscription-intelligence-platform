const fs = require('fs');

let content = fs.readFileSync('.env', 'utf8');
const lines = content.split(/\r?\n/);
const updated = lines.map(line => {
  if (line.startsWith('DATABASE_URL=') || line.startsWith('DIRECT_URL=')) {
    const key = line.startsWith('DATABASE_URL=') ? 'DATABASE_URL' : 'DIRECT_URL';
    let val = line.substring(key.length + 1).trim();
    // remove surrounding quotes
    val = val.replace(/^["']|["']$/g, '');
    // clean any existing connect_timeout or accidental %22 or "
    val = val.replace(/["']/g, '');
    val = val.replace(/&connect_timeout=\d+&pool_timeout=\d+/g, '');
    // now append clean query params
    if (!val.includes('connect_timeout=')) {
      val = val + '&connect_timeout=30&pool_timeout=30';
    }
    return `${key}="${val}"`;
  }
  return line;
});

fs.writeFileSync('.env', updated.join('\n'), 'utf8');
console.log('Cleaned and formatted .env with clean quotes:');
