import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const outputPath = join(rootDir, 'schema.json');

try {
  console.log('Extracting Sanity schema...');
  
  const env = {
    ...process.env,
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || '4ddas0r0',
    SANITY_DATASET: process.env.SANITY_DATASET || 'production'
  };

  execSync('npx sanity schema extract', {
    cwd: rootDir,
    encoding: 'utf-8',
    stdio: 'inherit',
    env
  });

  if (existsSync(outputPath)) {
    const schemaJson = JSON.parse(readFileSync(outputPath, 'utf-8'));
    console.log(`✅ Schema generated successfully: ${outputPath}`);
    console.log(`   Found ${schemaJson.length} schema types`);
  } else {
    console.error('❌ Schema file was not created');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to generate schema:', error.message);
  process.exit(1);
}
