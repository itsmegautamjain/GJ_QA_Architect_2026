import { test, expect } from '@playwright/test';

test.describe('Sysco Login Test Suite', async () => {

    test.use({ storageState: 'playwright/.auth/SyscoUser.json' });

    test.beforeEach('Login to Sysco application', async ({ page }) => {
        await page.goto('https://shop.sysco.com');
        await expect(page.getByRole('heading', { name: 'Everything you need to keep your kitchen moving.'})).toBeVisible();
    });

    test('Verify Home Page title', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Everything you need to keep your kitchen moving.'})).toBeVisible();
    });

});