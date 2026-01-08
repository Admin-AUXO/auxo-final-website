import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = {
  ...process.env,
  SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || '4ddas0r0',
  SANITY_DATASET: process.env.SANITY_DATASET || 'production'
};

try {
  execSync('npx sanity schema deploy', { cwd: rootDir, stdio: 'inherit', env });
  console.log('✅ Schema deployed');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}
