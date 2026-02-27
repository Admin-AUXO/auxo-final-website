import fs from 'fs';
import path from 'path';
import postcss from 'postcss';

const nestMediaPlugin = () => {
  return {
    postcssPlugin: 'nest-media',
    Once(root) {
      const nodesToRemove = [];
      root.nodes.forEach(node => {
        if (node.type === 'atrule' && node.name === 'media') {
          // Check if the media query contains exactly one rule
          if (node.nodes && node.nodes.length === 1 && node.nodes[0].type === 'rule') {
            const mediaRule = node.nodes[0];
            const selector = mediaRule.selector;
            
            // Search backwards to find the closest rule with the exact same selector
            let targetRule = null;
            const currentIndex = root.nodes.indexOf(node);
            for (let i = currentIndex - 1; i >= 0; i--) {
              const prevNode = root.nodes[i];
              if (prevNode.type === 'rule' && prevNode.selector === selector) {
                targetRule = prevNode;
                break;
              }
            }
            
            if (targetRule) {
              const newAtRule = node.clone();
              newAtRule.removeAll();
              newAtRule.append(...mediaRule.nodes.map(n => n.clone()));
              
              // Formatting space
              newAtRule.raws.before = '\n\n  ';
              targetRule.append(newAtRule);
              nodesToRemove.push(node);
            }
          }
        }
      });
      nodesToRemove.forEach(n => n.remove());
    }
  }
};
nestMediaPlugin.postcss = true;

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

async function processFiles() {
  const files = [];
  traverseDirectory(stylesDir, (filePath) => {
    if (filePath.endsWith('.css')) files.push(filePath);
  });

  for (const file of files) {
    const css = fs.readFileSync(file, 'utf8');
    try {
        const result = await postcss([nestMediaPlugin()]).process(css, { from: file });
        if (css !== result.css) {
           fs.writeFileSync(file, result.css);
           console.log(`Nested media queries in: ${path.relative(process.cwd(), file)}`);
        }
    } catch (e) {
        console.error(`Error in ${file}:`, e.message);
    }
  }
}

processFiles();
