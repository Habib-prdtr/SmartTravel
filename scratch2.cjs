const fs = require('fs');
let content = fs.readFileSync('src/pages/Planner.jsx', 'utf8');
let lines = content.split('\n');
let changed = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<input') || lines[i].includes('<select') || lines[i].includes('<textarea')) {
    if (lines[i].includes('border: "1px solid var(--border-color)"')) {
      lines[i] = lines[i].replace(/border: "1px solid var\(--border-color\)"/g, 'border: "1px solid var(--primary)"');
      changed++;
    }
  }
}
fs.writeFileSync('src/pages/Planner.jsx', lines.join('\n'));
console.log('Changed ' + changed + ' lines in Planner.jsx');
