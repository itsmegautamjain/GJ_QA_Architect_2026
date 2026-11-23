import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/LeafTapUser.json';

setup('Authenticate Leaftap application', async ({ page }) => {
    await page.goto('https://leaftaps.com');
    await page.getByLabel('Username').fill('DemoSalesManager');
    await page.getByLabel('Password').fill('crmsfa');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('.crmsfa')).toBeVisible();
    await page.context().storageState({ path: authFile });
});