import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const env = {
  ...process.env,
  SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || '4ddas0r0',
  SANITY_DATASET: process.env.SANITY_DATASET || 'production'
};

try {
  console.log('Deploying Sanity schema...');
  console.log(`Project: ${env.SANITY_PROJECT_ID}`);
  console.log(`Dataset: ${env.SANITY_DATASET}`);
  
  execSync('npx sanity schema deploy', {
    cwd: rootDir,
    encoding: 'utf-8',
    stdio: 'inherit',
    env
  });
  
  console.log('✅ Schema deployed successfully');
} catch (error) {
  console.error('❌ Failed to deploy schema:', error.message);
  process.exit(1);
}
