#!/usr/bin/env node

// Test Environment Variables Script
// Run with: node test-env.js

const requiredVars = [
  'SANITY_PROJECT_ID',
  'SANITY_API_TOKEN'
];

const optionalVars = [
  'SANITY_DATASET',
  'SANITY_API_VERSION',
  'SITE_URL',
  'BASE_PATH',
  'NODE_ENV'
];

console.log('🔍 Testing AUXO Website Environment Variables\n');

let allGood = true;

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('TOKEN') ? '***' + value.slice(-4) : value}`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    allGood = false;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: Not set (using defaults)`);
  }
});

console.log('\n🎯 Environment Check Result:');
if (allGood) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Ready to run the development server or build.');
} else {
  console.log('❌ Missing required environment variables.');
  console.log('   Please check your .env file and ensure all required variables are set.');
  console.log('   Run: ./setup-macos.sh for setup help.');
  process.exit(1);
}

console.log('\n💡 Tips:');
console.log('   • Run "npm run dev" to start development server');
console.log('   • Run "npm run build" to build for production');
console.log('   • Run "npm run build:check" for full validation');
