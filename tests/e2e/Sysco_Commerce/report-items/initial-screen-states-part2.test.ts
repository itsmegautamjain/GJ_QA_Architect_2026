import { test, expect } from '@playwright/test';

test.describe('Report Items Test Suite - Ineligibility cases', async () => {

    test.use({ storageState: 'playwright/.auth/SyscoUser.json' });

    test.beforeEach('Login to Sysco application', async ({ page }) => {
        await page.goto('https://shop.sysco.com');
        await page.getByRole('button', { name: 'Select Customer' }).click();
        await page.getByText('Select a Site').click();
        await page.getByPlaceholder('Search sites...').fill('019');
        await page.getByRole('option', { name: '019 - Sysco Cincinnati' }).click();
        await page.getByPlaceholder('Search accounts...').fill('696262');
        await page.getByRole('button', { name: '019-696262' }).click();
        const popUp = page.getByRole('button', { name: 'Don’t show me this again' });
        const exceptionManagementLink = page.getByRole('link', { name: 'Exception Management' });
        await expect(popUp.or(exceptionManagementLink)).toBeVisible();
        if (await popUp.isVisible()) {
            await popUp.click();
        }
        await expect(exceptionManagementLink).toBeVisible();
    });

    test('Should hide Report New Items button when no eligible Invoices exist', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

});