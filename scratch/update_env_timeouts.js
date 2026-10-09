const fs = require('fs');

let content = fs.readFileSync('.env', 'utf8');
const lines = content.split(/\r?\n/);
const updated = lines.map(line => {
  if (line.startsWith('DATABASE_URL=') || line.startsWith('DIRECT_URL=')) {
    if (!line.includes('connect_timeout=')) {
      return line.trim() + '&connect_timeout=30&pool_timeout=30';
    }
  }
  return line;
});

fs.writeFileSync('.env', updated.join('\n'), 'utf8');
console.log('Successfully updated .env with connect_timeout=30&pool_timeout=30');
