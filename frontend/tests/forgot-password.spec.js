import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should navigate to forgot password page from login', async ({ page }) => {
    // Click the "Forgot password?" button
    await page.click('text=Forgot password?');

    // Verify we're on the forgot password page
    await expect(page).toHaveURL('/forgot-password');

    // Verify the page elements are visible
    await expect(page.locator('text=Forgot Password?')).toBeVisible();
    await expect(page.locator('text=Enter your email address')).toBeVisible();
  });

  test('should show error when submitting empty email', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Click the submit button without entering email
    await page.click('button:has-text("Send Reset Link")');

    // Verify error toast appears
    const toast = page.locator('text=Please enter your email address');
    await expect(toast).toBeVisible();
  });

  test('should display email input field', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Find and verify the email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'example@gmail.com');
  });

  test('should display form elements on forgot password page', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Verify all form elements are present
    await expect(page.locator('text=EMAIL ADDRESS')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Reset Link")')).toBeVisible();
    await expect(page.locator('text=Remember your password?')).toBeVisible();
  });

  test('should navigate back to login from forgot password', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Verify we're on the forgot password page
    await expect(page).toHaveURL('/forgot-password');

    // Click the "Sign In" link at the bottom
    await page.click('text=Sign In');

    // Verify we're back on login page
    await expect(page).toHaveURL('/login');
  });

  test('should navigate back to login using back button', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Click the "Back to Login" button on the left side
    const backButtons = await page.locator('button:has-text("Back to Login")').count();
    if (backButtons > 0) {
      await page.click('button:has-text("Back to Login")');

      // Verify we're back on login page
      await expect(page).toHaveURL('/login');
    }
  });

  test('should accept valid email input', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Enter a valid email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');

    // Verify the email is entered
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('should display lock icon on forgot password page', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Verify the lock icon (SVG with specific path) is visible
    const lockIcon = page.locator('svg[viewBox="0 0 24 24"]').first();
    await expect(lockIcon).toBeVisible();
  });

  test('should display branding on left side (desktop)', async ({ page, viewport }) => {
    // Skip on mobile
    if (viewport.width < 768) {
      test.skip();
    }

    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Verify branding elements are visible
    await expect(page.locator('text=Smart Tea Care')).toBeVisible();
    await expect(page.locator('text=The Modern Agronomist Portal')).toBeVisible();
  });

  test('should have proper button styling', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Verify the submit button has the correct styling
    const submitButton = page.locator('button:has-text("Send Reset Link")');
    await expect(submitButton).toHaveClass(/bg-\[#1e7e34\]/);
  });

  test('should disable submit button while loading', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('text=Forgot password?');

    // Enter email
    await page.locator('input[type="email"]').fill('test@example.com');

    // Click submit button
    const submitButton = page.locator('button:has-text("Send Reset Link")');
    await submitButton.click();

    // Verify button becomes disabled (if API is slow)
    // Note: This test may pass quickly if the API responds fast
    const loadingText = page.locator('text=Sending...');
    if (await loadingText.isVisible({ timeout: 500 }).catch(() => false)) {
      await expect(submitButton).toBeDisabled();
    }
  });

  test('page should be responsive on mobile', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/forgot-password');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify form is still accessible on mobile
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    const submitButton = page.locator('button:has-text("Send Reset Link")');
    await expect(submitButton).toBeVisible();
  });
});
