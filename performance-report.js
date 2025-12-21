#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 AUXO Performance Report\n');

try {
  // Read the existing lighthouse report
  const reportPath = path.join(process.cwd(), 'lighthouse-report.json');

  if (!fs.existsSync(reportPath)) {
    console.log('❌ No lighthouse report found. Run a lighthouse audit first.');
    console.log('💡 Use online tools: https://pagespeed.web.dev');
    process.exit(1);
  }

  const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const categories = reportData.categories;

  console.log('📊 LIGHTHOUSE PERFORMANCE SCORES');
  console.log('=====================================');
  console.log(`🏆 Performance:     ${Math.round(categories.performance.score * 100)}/100`);
  console.log(`♿ Accessibility:    ${Math.round(categories.accessibility.score * 100)}/100`);
  console.log(`✅ Best Practices:  ${Math.round(categories['best-practices'].score * 100)}/100`);
  console.log(`🔍 SEO:            ${Math.round(categories.seo.score * 100)}/100`);

  // Key metrics
  console.log('\n📈 KEY PERFORMANCE METRICS');
  console.log('============================');
  const audits = reportData.audits;

  const metrics = [
    { name: 'First Contentful Paint', id: 'first-contentful-paint', unit: 's' },
    { name: 'Largest Contentful Paint', id: 'largest-contentful-paint', unit: 's' },
    { name: 'Speed Index', id: 'speed-index', unit: 's' },
    { name: 'Total Blocking Time', id: 'total-blocking-time', unit: 'ms' },
    { name: 'Cumulative Layout Shift', id: 'cumulative-layout-shift', unit: '' }
  ];

  metrics.forEach(metric => {
    if (audits[metric.id]) {
      const value = audits[metric.id].numericValue;
      const displayValue = audits[metric.id].displayValue;
      console.log(`${metric.name.padEnd(25)}: ${displayValue}`);
    }
  });

  console.log('\n🏆 OVERALL ASSESSMENT');
  console.log('====================');

  const performanceScore = Math.round(categories.performance.score * 100);
  if (performanceScore >= 90) {
    console.log('🎉 EXCELLENT PERFORMANCE! Your site loads blazingly fast.');
  } else if (performanceScore >= 75) {
    console.log('👍 GOOD PERFORMANCE! Minor optimizations possible.');
  } else if (performanceScore >= 50) {
    console.log('⚠️  AVERAGE PERFORMANCE! Consider optimizations.');
  } else {
    console.log('❌ POOR PERFORMANCE! Major optimizations needed.');
  }

  console.log('\n📋 REPORT DETAILS');
  console.log('=================');
  console.log(`Report generated: ${new Date(reportData.fetchTime).toLocaleString()}`);
  console.log(`Test URL: ${reportData.finalDisplayedUrl}`);
  console.log(`Lighthouse version: ${reportData.lighthouseVersion}`);

} catch (error) {
  console.log('❌ Error reading performance report:', error.message);
  console.log('💡 Try running: npm run performance:check');
}