import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load forgot password page directly', async ({ page }) => {
    // Navigate directly to forgot password page
    await page.goto('/forgot-password');

    // Verify page elements are visible
    const heading = page.locator('h2:has-text("Forgot Password?")');
    await expect(heading).toBeVisible();

    const description = page.locator('text=Enter your email address');
    await expect(description).toBeVisible();
  });

  test('should load reset password page directly', async ({ page }) => {
    // Navigate directly to reset password page
    await page.goto('/reset-password');

    // Verify page either shows validation or error state
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Verify page loads
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('forgot password page should have email input', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/forgot-password');

    // Verify email input is present
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'example@gmail.com');
  });

  test('forgot password page should have submit button', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/forgot-password');

    // Verify submit button is present
    const submitButton = page.locator('button:has-text("Send Reset Link")');
    await expect(submitButton).toBeVisible();
  });

  test('should be able to enter email', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/forgot-password');

    // Enter email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');

    // Verify email was entered
    await expect(emailInput).toHaveValue('test@example.com');
  });
});
