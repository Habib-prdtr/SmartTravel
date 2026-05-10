const fs = require('fs');
let content = fs.readFileSync('src/pages/Planner.jsx', 'utf8');
content = content.replace(/<(input|select|textarea)([^>]+)border:\s*"1px solid var\(--border-color\)"([^>]*)>/g, '<$1$2border: "1px solid var(--primary)"$3>');
fs.writeFileSync('src/pages/Planner.jsx', content);
