import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.git', 'dist', '.astro'].includes(file)) {
        walk(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  }
}

let modifiedCount = 0;

walk(path.join(__dirname, '../src'), (filePath) => {
  if (/\.(astro|tsx|jsx|vue|svelte|html)$/.test(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const newContent = content.replace(/inferSize=\{true\}/g, 'width={1920} height={1080}');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      modifiedCount++;
      console.log(`Updated: ${filePath}`);
    }
  }
});

console.log(`Updated ${modifiedCount} files.`);
