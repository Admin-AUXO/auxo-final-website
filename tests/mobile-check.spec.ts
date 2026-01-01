import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Site Check', () => {

  test('Check for console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('=== CONSOLE ERRORS ===');
    if (errors.length > 0) {
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    } else {
      console.log('No console errors found');
    }

    console.log('\n=== CONSOLE WARNINGS ===');
    if (warnings.length > 0) {
      warnings.forEach((warn, i) => console.log(`${i + 1}. ${warn}`));
    } else {
      console.log('No console warnings found');
    }

    console.log('\n=== PAGE INFO ===');
    console.log(`Viewport: ${page.viewportSize()?.width}x${page.viewportSize()?.height}`);
  });

  test('Check scroll functionality', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const initialScroll = await page.evaluate(() => window.scrollY);
    console.log(`Initial scroll position: ${initialScroll}`);

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    const afterScroll = await page.evaluate(() => window.scrollY);
    console.log(`After scroll position: ${afterScroll}`);

    if (afterScroll > initialScroll) {
      console.log('✓ Scroll working');
    } else {
      console.log('✗ Scroll may have issues');
    }

    // Check for scroll lock issues
    const overflow = await page.evaluate(() =>
      getComputedStyle(document.body).overflow
    );
    console.log(`Body overflow: ${overflow}`);
  });

  test('Check carousel functionality', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for any carousels to load
    await page.waitForTimeout(2000);

    // Check if carousels exist
    const carouselCount = await page.locator('[data-carousel]').count();
    console.log(`Found ${carouselCount} carousel(s)`);

    if (carouselCount > 0) {
      // Try to interact with first carousel
      const carousel = page.locator('[data-carousel]').first();

      // Look for next/prev buttons
      const prevBtn = carousel.locator('button:has-text("prev"), [aria-label*="prev"]').first();
      const nextBtn = carousel.locator('button:has-text("next"), [aria-label*="next"]').first();

      console.log(`Previous button found: ${await prevBtn.isVisible().catch(() => false)}`);
      console.log(`Next button found: ${await nextBtn.isVisible().catch(() => false)}`);

      // Check for common carousel selectors
      const emblaButtons = await page.locator('[class*="embla"]').count();
      console.log(`Embla carousel elements found: ${emblaButtons}`);
    }
  });

  test('Check for layout issues', async ({ page }) => {
    const errors: string[] = [];

    await page.goto('/', { waitUntil: 'networkidle' });

    // Check viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').first();
    const viewport = await viewportMeta.getAttribute('content');
    console.log(`Viewport meta: ${viewport}`);

    // Check for overflow issues
    const bodyOverflow = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return {
        bodyOverflow: getComputedStyle(body).overflow,
        htmlOverflow: getComputedStyle(html).overflow,
        bodyWidth: body.scrollWidth,
        windowWidth: window.innerWidth,
      };
    });

    console.log('Layout info:', bodyOverflow);

    if (bodyOverflow.bodyWidth > bodyOverflow.windowWidth) {
      errors.push(`Body is wider than viewport: ${bodyOverflow.bodyWidth}px > ${bodyOverflow.windowWidth}px`);
    }

    if (errors.length > 0) {
      console.log('\n=== LAYOUT ISSUES ===');
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    } else {
      console.log('\n✓ No layout issues detected');
    }
  });
});
