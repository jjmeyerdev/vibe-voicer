import { expect, test } from '@playwright/test';

test('homepage renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Vibe Voicer/);
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
});
