---
name: playwright-testing
description: Write and run Playwright tests for the AUXO website. Use when creating E2E tests, testing user flows, verifying functionality, or debugging test failures.
---

# Playwright Testing

## Test Setup

### Configuration

Tests use Playwright with TypeScript. Configuration not yet present, but should be created.

### Installation

```bash
# Install Playwright (already in devDependencies)
npm install

# Install browsers
npx playwright install
```

### Test Commands

```bash
# Run all tests
npm run test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests for CI
npm run test:ci
```

## Writing Tests

### Test Structure

Create tests in `tests/` directory:

```typescript
// tests/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('AUXO');
  });
  
  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');
    
    await page.click('a[href="/services"]');
    await expect(page).toHaveURL('/services');
  });
});
```

### Best Practices

**Use data-testid attributes:**

```astro
<button data-testid="cta-button">Get Started</button>
```

```typescript
await page.click('[data-testid="cta-button"]');
```

**Wait for elements:**

```typescript
// Good - explicit wait
await page.waitForSelector('[data-testid="content"]');

// Better - built-in waiting
await expect(page.locator('[data-testid="content"]')).toBeVisible();
```

**Use page object pattern:**

```typescript
// tests/pages/HomePage.ts
export class HomePage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/');
  }
  
  async clickCTA() {
    await this.page.click('[data-testid="hero-cta"]');
  }
  
  async getHeroTitle() {
    return await this.page.locator('h1').textContent();
  }
}

// tests/homepage.spec.ts
test('hero CTA works', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.clickCTA();
  await expect(page).toHaveURL('/contact');
});
```

## Common Test Patterns

### Navigation Tests

```typescript
test('navigation menu works', async ({ page }) => {
  await page.goto('/');
  
  // Open navigation
  await page.click('[data-testid="nav-toggle"]');
  
  // Click on Services
  await page.click('nav a[href="/services"]');
  
  // Verify navigation
  await expect(page).toHaveURL('/services');
  await expect(page.locator('h1')).toContainText('Services');
});
```

### Form Submission Tests

```typescript
test('contact form submission', async ({ page }) => {
  await page.goto('/contact');
  
  // Fill form
  await page.fill('[name="name"]', 'John Doe');
  await page.fill('[name="email"]', 'john@example.com');
  await page.fill('[name="message"]', 'Test message');
  
  // Submit
  await page.click('[type="submit"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Mobile Tests

```typescript
test('mobile navigation', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/');
  
  // Mobile menu should be closed initially
  await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
  
  // Open mobile menu
  await page.click('[data-testid="mobile-menu-toggle"]');
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
});
```

### Visual Regression Tests

```typescript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  
  // Take screenshot
  await expect(page).toHaveScreenshot('homepage.png');
});
```

### Accessibility Tests

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage accessibility', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Testing Scenarios

### User Flows

**Complete user journey:**

```typescript
test('user explores services and contacts', async ({ page }) => {
  // 1. Land on homepage
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  
  // 2. Navigate to services
  await page.click('nav a[href="/services"]');
  await expect(page).toHaveURL('/services');
  
  // 3. Select a service
  await page.click('[data-testid="service-data-analytics"]');
  await expect(page).toHaveURL(/\/services\/.+/);
  
  // 4. Click CTA to contact
  await page.click('[data-testid="service-cta"]');
  await expect(page).toHaveURL('/contact');
  
  // 5. Fill and submit form
  await page.fill('[name="name"]', 'Jane Doe');
  await page.fill('[name="email"]', 'jane@example.com');
  await page.fill('[name="message"]', 'Interested in analytics');
  await page.click('[type="submit"]');
  
  // 6. Verify success
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

### Performance Tests

```typescript
test('page load performance', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  
  const loadTime = Date.now() - startTime;
  
  // Assert load time < 3 seconds
  expect(loadTime).toBeLessThan(3000);
  
  // Check Core Web Vitals
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  });
  
  // LCP should be < 2.5s
  expect(metrics).toBeDefined();
});
```

### Responsive Design Tests

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

viewports.forEach(({ name, width, height }) => {
  test(`layout on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    
    // Verify responsive layout
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    if (name === 'mobile') {
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    } else {
      await expect(page.locator('nav a[href="/services"]')).toBeVisible();
    }
  });
});
```

## Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npx playwright test --debug
```

**Features:**
- Step through tests
- Inspect selectors
- View console logs
- Take screenshots

### Visual Debugging

```bash
# UI mode (recommended)
npm run test:ui
```

**Features:**
- Interactive test explorer
- Time travel debugging
- Watch mode
- View traces

### Screenshots on Failure

```typescript
test('example test', async ({ page }, testInfo) => {
  try {
    await page.goto('/');
    // Test code
  } catch (error) {
    await page.screenshot({ 
      path: `test-results/failure-${testInfo.title}.png` 
    });
    throw error;
  }
});
```

Or configure globally:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
```

## Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:4341',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4341',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Organization

### Directory Structure

```
tests/
├── pages/              # Page objects
│   ├── HomePage.ts
│   ├── ServicesPage.ts
│   └── ContactPage.ts
├── fixtures/           # Test data
│   └── testData.ts
├── helpers/            # Test utilities
│   └── waitFor.ts
├── homepage.spec.ts    # Homepage tests
├── services.spec.ts    # Services tests
├── contact.spec.ts     # Contact tests
└── navigation.spec.ts  # Navigation tests
```

### Fixtures

```typescript
// tests/fixtures/testData.ts
export const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  message: 'Test message',
};

export const testServices = [
  'Data Analytics',
  'Machine Learning',
  'Data Engineering',
];
```

```typescript
// tests/contact.spec.ts
import { testUser } from './fixtures/testData';

test('submit contact form', async ({ page }) => {
  await page.goto('/contact');
  
  await page.fill('[name="name"]', testUser.name);
  await page.fill('[name="email"]', testUser.email);
  await page.fill('[name="message"]', testUser.message);
  
  await page.click('[type="submit"]');
});
```

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build site
        run: npm run build
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Testing Checklist

### Critical Paths
- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] Mobile menu functions properly
- [ ] Contact form submits successfully
- [ ] Services page displays all services
- [ ] Service detail pages load
- [ ] CTA buttons navigate correctly

### Cross-Browser
- [ ] Tests pass in Chrome
- [ ] Tests pass in Firefox
- [ ] Tests pass in Safari
- [ ] Mobile Chrome works
- [ ] Mobile Safari works

### Responsive Design
- [ ] Mobile viewport (375px)
- [ ] Tablet viewport (768px)
- [ ] Desktop viewport (1920px)

### Performance
- [ ] Page load < 3s
- [ ] LCP < 2.5s
- [ ] No JavaScript errors

### Accessibility
- [ ] No accessibility violations
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

## Advanced Patterns

### API Mocking

```typescript
test('mocked API response', async ({ page }) => {
  await page.route('**/api/services', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        { id: 1, name: 'Service 1' },
        { id: 2, name: 'Service 2' },
      ]),
    });
  });
  
  await page.goto('/services');
  await expect(page.locator('[data-testid="service-1"]')).toBeVisible();
});
```

### Authentication

```typescript
test.use({ storageState: 'tests/.auth/user.json' });

test('authenticated user', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

### Parallel Testing

```typescript
// Run tests in parallel
test.describe.configure({ mode: 'parallel' });

test.describe('Homepage sections', () => {
  test('hero section', async ({ page }) => { /* ... */ });
  test('services section', async ({ page }) => { /* ... */ });
  test('about section', async ({ page }) => { /* ... */ });
});
```

## Troubleshooting

**Test timeout:**
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  await page.goto('/');
});
```

**Element not found:**
```typescript
// Wait for element
await page.waitForSelector('[data-testid="element"]', { 
  timeout: 10000 
});

// Or use expect with timeout
await expect(page.locator('[data-testid="element"]'))
  .toBeVisible({ timeout: 10000 });
```

**Flaky tests:**
```typescript
// Add retries for specific test
test('flaky test', async ({ page }) => {
  test.info().annotations.push({ 
    type: 'issue', 
    description: 'Flaky test - investigating' 
  });
  // Test code
});

// Or configure retries globally
test.describe.configure({ retries: 2 });
```
