import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = join(rootDir, 'schema.json');

const env = {
  ...process.env,
  SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || '4ddas0r0',
  SANITY_DATASET: process.env.SANITY_DATASET || 'production'
};

try {
  execSync('npx sanity schema extract', { cwd: rootDir, stdio: 'inherit', env });
  if (existsSync(outputPath)) {
    const schema = JSON.parse(readFileSync(outputPath, 'utf-8'));
    console.log(`✅ Schema generated: ${schema.length} types`);
  } else {
    throw new Error('Schema file not created');
  }
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}
