import { test, expect } from '@playwright/test';

test.describe('AUXO Data Labs Website', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is present
    await expect(page).toHaveTitle(/AUXO|Data Labs/i);

    // Check for main navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for hero section
    const hero = page.locator('[data-testid="hero-section"], .hero, main section:first-child');
    await expect(hero).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Click on About link if it exists
    const aboutLink = page.locator('a[href="/about"], nav a:has-text("About")').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');

    // Check that we're on the contact page
    await expect(page).toHaveURL(/\/contact/);

    // Check for contact form or contact information
    const contactForm = page.locator('form, [data-testid="contact-form"]');
    const contactInfo = page.locator('[data-testid="contact-info"], .contact-info');

    await expect(contactForm.or(contactInfo).first()).toBeVisible();
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/services');

    // Check that we're on the services page
    await expect(page).toHaveURL(/\/services/);

    // Check for service listings
    const services = page.locator('[data-testid="service-card"], .service-card, .service-item');
    await expect(services.first()).toBeVisible();
  });
});