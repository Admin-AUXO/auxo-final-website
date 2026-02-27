import fs from 'fs';
const file = 'src/styles/components/fab.css';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('@media (prefers-contrast: high)', '@media (prefers-contrast: more)');
fs.writeFileSync(file, content);
