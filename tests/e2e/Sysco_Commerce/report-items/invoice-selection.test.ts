import { test, expect } from '@playwright/test';

test.describe('Report Items - Invoice Selection Test Suite', async () => {

    test.use({ storageState: 'playwright/.auth/SyscoUser.json' });

    test.beforeEach('Login to Sysco application', async ({ page }) => {
        await page.goto('https://shop.sysco.com');
        await page.getByRole('button', { name: 'Select Customer' }).click();
        await page.getByText('Select a Site').click();
        await page.getByPlaceholder('Search sites...').fill('056');
        await page.getByRole('option', { name: '056 - Sysco Boston' }).click();
        await page.getByPlaceholder('Search accounts...').fill('149561');
        await page.getByRole('button', { name: '056-149561' }).click();
        const popUp = page.getByRole('button', { name: 'Don’t show me this again' });
        const exceptionManagementLink = page.getByRole('link', { name: 'Exception Management' });
        await expect(popUp.or(exceptionManagementLink)).toBeVisible();
        if (await popUp.isVisible()) {
            await popUp.click();
        }
        await expect(exceptionManagementLink).toBeVisible();
    });

    test('Should update product list when navigating between invoices', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        await page.getByRole('button', { name: 'Report New Items' }).click();
        await expect(page.getByRole('button', { name: 'SPICE CINNAMON STICK' })).toBeVisible();
        await page.getByRole('button', { name: 'Next' }).click();
        await expect(page.getByRole('button', { name: 'SOUP BASE CHICKEN REAL' })).toBeVisible();
        await page.getByRole('button', { name: 'Previous' }).click();
        await expect(page.getByRole('button', { name: 'SPICE CINNAMON STICK' })).toBeVisible();
        await page.getByRole('button', { name: 'Close modal' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

    test('Should update product list when selecting different invoice from dropdown', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        await page.getByRole('button', { name: 'Report New Items' }).click();
        await expect(page.getByRole('button', { name: 'SPICE CINNAMON STICK' })).toBeVisible();
        await page.getByRole('combobox').click();
        await page.getByRole('option', { name: 'Fri, November 20 - Invoice #256759829' }).click();
        await expect(page.getByRole('button', { name: 'SOUP BASE CHICKEN REAL' })).toBeVisible();
        await page.getByRole('combobox').click();
        await page.getByRole('option', { name: 'Yesterday - Invoice #256771948' }).click();
        await expect(page.getByRole('button', { name: 'SPICE CINNAMON STICK' })).toBeVisible();
        await page.getByRole('button', { name: 'Close modal' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

    test('Should display yesterday invoices in the invoice dropdown', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        await page.getByRole('button', { name: 'Report New Items' }).click();
        await expect(page.getByRole('button', { name: 'SPICE CINNAMON STICK' })).toBeVisible();
        const currentInvoice = await page.getByRole('combobox').textContent();
        expect(currentInvoice).toContain('Yesterday');
        await page.getByRole('button', { name: 'Close modal' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

});