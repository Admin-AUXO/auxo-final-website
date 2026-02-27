import fs from 'fs';
import path from 'path';

function traverseDirectory(dir, callback) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      traverseDirectory(itemPath, callback);
    } else {
      callback(itemPath);
    }
  }
}

const stylesDir = path.join(process.cwd(), 'src/styles');

traverseDirectory(stylesDir, (filePath) => {
  if (filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // regex to match !important, capturing any spaces before it.
    // Replace " !important" or "!important" with nothing.
    const newContent = content.replace(/\s*!important/gi, '');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});
